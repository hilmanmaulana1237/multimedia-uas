"use client";

import React, { useState, useEffect } from "react";
import { Minimize, Maximize, Lock, Unlock, ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import ModeSelector, { Mode } from "../components/ModeSelector";
import FileUploader from "../components/FileUploader";
import ProcessingIndicator from "../components/ProcessingIndicator";
import ResultPanel from "../components/ResultPanel";
import { useToast, useObjectURL } from "../lib/hooks";
import { encodeImageLSB, decodeImageLSB, getImageCapacity, validateImageForStego } from "../lib/image-steganography";

export default function ImageCodecPage() {
  const { toast } = useToast();
  
  // States
  const [activeMode, setActiveMode] = useState<string>("compress");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  
  // Results
  const [resultFile, setResultFile] = useState<{name: string, size: number, blob: Blob} | null>(null);
  const [extractedMessage, setExtractedMessage] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<{compressionRatio?: number, sizeDifference?: number, processingTime?: number}>({});
  
  const resultUrl = useObjectURL(resultFile?.blob || null);

  // Compression specific state
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<"jpeg" | "webp" | "png">("jpeg");
  
  // Stegano specific state
  const [secretMessage, setSecretMessage] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(0);

  const modes: Mode[] = [
    {
      id: "compress",
      label: "KOMPRESI",
      description: "Kurangi ukuran file gambar",
      icon: <Minimize size={24} />
    },
    {
      id: "decompress",
      label: "DEKOMPRESI",
      description: "Ubah format ke lossless (PNG)",
      icon: <Maximize size={24} />
    },
    {
      id: "encode",
      label: "ENCODE MSG",
      description: "Sisipkan pesan rahasia",
      icon: <Lock size={24} />
    },
    {
      id: "decode",
      label: "DECODE",
      description: "Ekstrak pesan rahasia",
      icon: <Unlock size={24} />
    }
  ];

  // Cleanup when mode changes
  const handleModeChange = (modeId: string) => {
    setActiveMode(modeId);
    handleReset();
  };

  const handleReset = () => {
    setFile(null);
    setFilePreview(null);
    setResultFile(null);
    setExtractedMessage(undefined);
    setStats({});
    setSecretMessage("");
    setMaxCapacity(0);
    setProgress(0);
  };

  const loadFilePreviewAndCapacity = (selectedFile: File) => {
    setFile(selectedFile);
    
    // Check steganography constraints
    if (activeMode === "encode" || activeMode === "decode") {
      const validation = validateImageForStego(selectedFile);
      if (!validation.valid) {
        toast.warning(validation.reason || "Format tidak valid", 8000);
      }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFilePreview(dataUrl);

      // Calculate capacity for encode mode
      if (activeMode === "encode") {
        const img = new Image();
        img.onload = () => {
          setMaxCapacity(getImageCapacity(img.width, img.height));
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  // Helper to load image to canvas
  const loadImageToCanvas = (dataUrl: string): Promise<{canvas: HTMLCanvasElement, img: HTMLImageElement}> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not get canvas context"));
        ctx.drawImage(img, 0, 0);
        resolve({ canvas, img });
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar"));
      img.src = dataUrl;
    });
  };

  // Process Handlers
  const handleCompress = async () => {
    if (!file || !filePreview) return;
    
    setIsProcessing(true);
    setStatusMessage("Mengkompresi gambar...");
    setProgress(20);
    const startTime = performance.now();

    try {
      const { canvas } = await loadImageToCanvas(filePreview);
      setProgress(60);
      
      const mimeType = `image/${outputFormat}`;
      const qualityFactor = outputFormat === "png" ? undefined : quality / 100;
      
      const compressedDataUrl = canvas.toDataURL(mimeType, qualityFactor);
      
      // Convert DataURL to Blob
      const res = await fetch(compressedDataUrl);
      const blob = await res.blob();
      
      setProgress(100);
      
      const timeTaken = (performance.now() - startTime) / 1000;
      const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      setResultFile({
        name: `${originalNameWithoutExt}_compressed.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`,
        size: blob.size,
        blob
      });
      
      setStats({
        compressionRatio: (1 - (blob.size / file.size)) * 100,
        sizeDifference: file.size - blob.size,
        processingTime: timeTaken
      });
      
      toast.success("Kompresi berhasil diselesaikan");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat kompresi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecompress = async () => {
    if (!file || !filePreview) return;
    
    setIsProcessing(true);
    setStatusMessage("Mendekompresi ke PNG...");
    setProgress(30);
    const startTime = performance.now();

    try {
      const { canvas } = await loadImageToCanvas(filePreview);
      setProgress(70);
      
      // Export as PNG
      const pngDataUrl = canvas.toDataURL("image/png");
      const res = await fetch(pngDataUrl);
      const blob = await res.blob();
      
      setProgress(100);
      
      const timeTaken = (performance.now() - startTime) / 1000;
      const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      setResultFile({
        name: `${originalNameWithoutExt}_lossless.png`,
        size: blob.size,
        blob
      });
      
      setStats({
        processingTime: timeTaken
      });
      
      toast.success("Dekompresi berhasil diselesaikan");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat dekompresi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEncode = async () => {
    if (!file || !filePreview || !secretMessage) return;
    
    if (secretMessage.length > maxCapacity) {
      toast.error(`Pesan terlalu panjang. Maksimum ${maxCapacity} karakter.`);
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Menyisipkan pesan rahasia...");
    setProgress(30);
    const startTime = performance.now();

    try {
      const { canvas } = await loadImageToCanvas(filePreview);
      setProgress(60);
      
      const stegoDataUrl = encodeImageLSB(canvas, secretMessage);
      setProgress(80);
      
      const res = await fetch(stegoDataUrl);
      const blob = await res.blob();
      
      setProgress(100);
      
      const timeTaken = (performance.now() - startTime) / 1000;
      const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      setResultFile({
        name: `${originalNameWithoutExt}_stego.png`,
        size: blob.size,
        blob
      });
      
      setStats({
        sizeDifference: blob.size - file.size, // Usually slightly larger due to PNG vs JPEG
        processingTime: timeTaken
      });
      
      toast.success("Pesan berhasil disisipkan");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menyisipkan pesan");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecode = async () => {
    if (!file || !filePreview) return;
    
    setIsProcessing(true);
    setStatusMessage("Mengekstrak pesan rahasia...");
    setProgress(40);
    const startTime = performance.now();

    try {
      const { canvas } = await loadImageToCanvas(filePreview);
      setProgress(80);
      
      const extracted = decodeImageLSB(canvas);
      
      setProgress(100);
      setExtractedMessage(extracted);
      
      const timeTaken = (performance.now() - startTime) / 1000;
      setStats({ processingTime: timeTaken });
      
      toast.success("Pesan berhasil diekstrak");
    } catch (err: any) {
      toast.error(err.message || "Tidak ditemukan pesan atau terjadi kesalahan");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1152px] mx-auto px-6">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <Link href="/" className="inline-flex items-center gap-2 text-[#F7F4EB]/60 hover:text-white transition-colors text-sm font-medium mb-4">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-white flex items-center gap-3">
          <ImageIcon className="text-[#D9261C]" size={36} />
          Image Codec & Steganography
        </h1>
      </div>

      {/* Mode Selector */}
      <ModeSelector 
        modes={modes} 
        activeMode={activeMode} 
        onModeChange={handleModeChange} 
      />

      {/* Main Content Area */}
      {!resultFile && extractedMessage === undefined ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-up">
          {/* Left Column: File Uploader */}
          <div className="lg:col-span-7">
            <h2 className="text-xl font-display font-medium text-white mb-4">1. Upload Gambar</h2>
            <FileUploader 
              accept="image/*"
              maxSizeMB={50}
              onFileSelect={loadFilePreviewAndCapacity}
              onError={(msg) => toast.error(msg)}
              currentFile={file}
              onReset={handleReset}
              supportedFormats={["PNG", "JPEG", "JPG", "WEBP", "BMP"]}
            />
            
            {/* Image Preview */}
            {filePreview && (
              <div className="mt-6 glass-card p-4 flex flex-col items-center">
                <img src={filePreview} alt="Preview" className="max-h-[300px] object-contain rounded-lg" />
              </div>
            )}
          </div>

          {/* Right Column: Parameters & Action */}
          <div className="lg:col-span-5">
            <h2 className="text-xl font-display font-medium text-white mb-4">2. Pengaturan & Proses</h2>
            
            <div className="glass-card p-6 h-full flex flex-col">
              {!file ? (
                <div className="flex-1 flex items-center justify-center text-[#F7F4EB]/40 text-sm italic text-center">
                  Silakan upload gambar terlebih dahulu untuk melihat pengaturan.
                </div>
              ) : (
                <>
                  {/* Mode Specific Settings */}
                  {activeMode === "compress" && (
                    <div className="space-y-6 flex-1">
                      <div>
                        <label className="block text-sm font-medium text-[#F7F4EB]/90 mb-2 flex justify-between">
                          <span>Kualitas Kompresi</span>
                          <span className="text-[#D9261C] font-mono">{quality}%</span>
                        </label>
                        <input 
                          type="range" 
                          min="10" max="100" step="5"
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          className="w-full accent-[#D9261C]"
                        />
                        <p className="text-xs text-[#F7F4EB]/50 mt-1">Kualitas lebih rendah menghasilkan ukuran file yang lebih kecil namun gambar menjadi lebih buram.</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#F7F4EB]/90 mb-2">Format Output</label>
                        <select 
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value as any)}
                          className="w-full bg-[#0B0E11] border border-[#F7F4EB]/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D9261C]"
                        >
                          <option value="jpeg">JPEG (Lossy - Default)</option>
                          <option value="webp">WebP (Modern Lossy)</option>
                          <option value="png">PNG (Lossless - Ukuran Besar)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeMode === "decompress" && (
                    <div className="space-y-6 flex-1">
                      <div className="p-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20">
                        <p className="text-sm text-[#F7F4EB]/90 mb-2">
                          <strong>Mode Dekompresi Lossless</strong>
                        </p>
                        <p className="text-xs text-[#F7F4EB]/70">
                          Gambar Anda akan dikonversi ke format <strong>PNG</strong>. Harap diperhatikan bahwa mengubah JPEG/WebP kembali ke PNG <strong>tidak akan mengembalikan kualitas yang sudah hilang</strong>, namun akan mencegah kompresi lossy lebih lanjut jika gambar ini diedit dan disimpan kembali.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeMode === "encode" && (
                    <div className="space-y-6 flex-1 flex flex-col">
                      <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-medium text-[#F7F4EB]/90 mb-2 flex justify-between">
                          <span>Pesan Rahasia</span>
                          <span className={clsx("text-xs font-mono", secretMessage.length > maxCapacity ? "text-[#EF4444]" : "text-[#F7F4EB]/50")}>
                            {secretMessage.length} / {maxCapacity} karakter
                          </span>
                        </label>
                        <textarea 
                          value={secretMessage}
                          onChange={(e) => setSecretMessage(e.target.value)}
                          placeholder="Ketik pesan rahasia yang ingin Anda sembunyikan di sini..."
                          className="w-full flex-1 min-h-[150px] bg-[#0B0E11] border border-[#F7F4EB]/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D9261C] resize-none"
                        ></textarea>
                      </div>
                      <div className="p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-xs text-[#F7F4EB]/80">
                        Hasil akhir akan disimpan sebagai <strong>PNG</strong> agar pesan LSB tidak rusak oleh algoritma kompresi gambar.
                      </div>
                    </div>
                  )}

                  {activeMode === "decode" && (
                    <div className="space-y-6 flex-1">
                      <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">
                        <p className="text-sm text-[#F7F4EB]/90 mb-2">
                          <strong>Siap Mengekstrak Pesan</strong>
                        </p>
                        <p className="text-xs text-[#F7F4EB]/70">
                          Algoritma akan memindai bit-bit least significant (LSB) pada channel merah gambar ini untuk mencari pesan rahasia yang mungkin tersembunyi.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-8 pt-6 border-t border-[#F7F4EB]/10">
                    <button
                      onClick={() => {
                        if (activeMode === "compress") handleCompress();
                        else if (activeMode === "decompress") handleDecompress();
                        else if (activeMode === "encode") handleEncode();
                        else if (activeMode === "decode") handleDecode();
                      }}
                      className="w-full py-3 px-4 bg-[#D9261C] hover:bg-[#9D1A10] text-white rounded-xl transition-all duration-300 shadow-[0_4px_14px_rgba(217,38,28,0.3)] hover:shadow-[0_8px_20px_rgba(217,38,28,0.5)] font-medium text-lg flex items-center justify-center gap-2"
                    >
                      {activeMode === "compress" && <Minimize size={20} />}
                      {activeMode === "decompress" && <Maximize size={20} />}
                      {activeMode === "encode" && <Lock size={20} />}
                      {activeMode === "decode" && <Unlock size={20} />}
                      
                      {activeMode === "compress" && "Kompres Gambar"}
                      {activeMode === "decompress" && "Dekompres ke PNG"}
                      {activeMode === "encode" && "Sisipkan Pesan"}
                      {activeMode === "decode" && "Ekstrak Pesan"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Result View */
        <ResultPanel 
          type={activeMode === "compress" || activeMode === "decompress" ? activeMode : `steganography-${activeMode}` as any}
          originalFile={file ? {
            name: file.name,
            size: file.size,
            preview: filePreview || undefined
          } : undefined}
          resultFile={resultFile ? {
            name: resultFile.name,
            size: resultFile.size,
            preview: resultUrl || undefined,
            downloadUrl: resultUrl || ""
          } : undefined}
          extractedMessage={extractedMessage}
          stats={stats}
          onReset={handleReset}
        />
      )}

      {/* Processing Overlay */}
      <ProcessingIndicator 
        isProcessing={isProcessing}
        progress={progress}
        statusMessage={statusMessage}
      />
    </div>
  );
}
