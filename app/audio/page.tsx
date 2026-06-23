"use client";

import React, { useState, useRef, useEffect } from "react";
import { Minimize, Maximize, Lock, Unlock, MusicIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ModeSelector, { Mode } from "../components/ModeSelector";
import FileUploader from "../components/FileUploader";
import ProcessingIndicator from "../components/ProcessingIndicator";
import ResultPanel from "../components/ResultPanel";
import { useToast, useObjectURL } from "../lib/hooks";
import { getFileExtension, getMimeType } from "../lib/file-utils";
import { ffmpegManager } from "../lib/ffmpeg-manager";
import { fetchFile } from "@ffmpeg/util";
import { encodeAudioLSB, decodeAudioLSB, getAudioCapacity, validateAudioForStego } from "../lib/audio-steganography";

export default function AudioCodecPage() {
  const { toast } = useToast();
  
  // States
  const [activeMode, setActiveMode] = useState<string>("compress");
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  
  // Results
  const [resultFile, setResultFile] = useState<{name: string, size: number, blob: Blob} | null>(null);
  const [extractedMessage, setExtractedMessage] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<{compressionRatio?: number, sizeDifference?: number, processingTime?: number}>({});
  
  const resultUrl = useObjectURL(resultFile?.blob || null);
  const fileUrl = useObjectURL(file || null);

  // Compression settings
  const [outputFormat, setOutputFormat] = useState<"mp3" | "aac" | "ogg">("mp3");
  const [bitrate, setBitrate] = useState("128k");
  const [sampleRate, setSampleRate] = useState("44100");
  const [channels, setChannels] = useState("2");

  // Stegano settings
  const [secretMessage, setSecretMessage] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(0);

  const modes: Mode[] = [
    {
      id: "compress",
      label: "KOMPRESI",
      description: "WAV → MP3/AAC",
      icon: <Minimize size={24} />
    },
    {
      id: "decompress",
      label: "DEKOMPRESI",
      description: "Kembalikan ke lossless (WAV)",
      icon: <Maximize size={24} />
    },
    {
      id: "encode",
      label: "ENCODE MSG",
      description: "Sisipkan pesan (hanya WAV)",
      icon: <Lock size={24} />
    },
    {
      id: "decode",
      label: "DECODE",
      description: "Ekstrak pesan rahasia",
      icon: <Unlock size={24} />
    }
  ];

  const handleModeChange = (modeId: string) => {
    setActiveMode(modeId);
    handleReset();
  };

  const handleReset = () => {
    setFile(null);
    setFileBuffer(null);
    setResultFile(null);
    setExtractedMessage(undefined);
    setStats({});
    setSecretMessage("");
    setMaxCapacity(0);
    setProgress(0);
  };

  const loadFileAndCapacity = (selectedFile: File) => {
    setFile(selectedFile);
    
    if (activeMode === "encode" || activeMode === "decode") {
      const validation = validateAudioForStego(selectedFile);
      if (!validation.valid) {
        toast.warning(validation.reason || "Format tidak valid", 8000);
      }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      setFileBuffer(buffer);

      if (activeMode === "encode") {
        setMaxCapacity(getAudioCapacity(buffer));
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleCompress = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setStatusMessage("Menyiapkan engine kompresi...");
    setProgress(5);
    const startTime = performance.now();

    try {
      const ffmpeg = await ffmpegManager.getFFmpeg((p) => {
        setProgress(5 + p * 0.9); // Scale progress 5% to 95%
      });

      setStatusMessage("Memproses audio...");
      
      const ext = getFileExtension(file.name);
      const inputName = `input${ext}`;
      const outputName = `output.${outputFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      await ffmpeg.exec([
        '-i', inputName,
        '-b:a', bitrate,
        '-ar', sampleRate,
        '-ac', channels,
        outputName
      ]);

      setStatusMessage("Menyelesaikan file...");
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as any], { type: getMimeType(outputFormat) });
      
      const timeTaken = (performance.now() - startTime) / 1000;
      const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      setProgress(100);
      setResultFile({
        name: `${originalNameWithoutExt}_compressed.${outputFormat}`,
        size: blob.size,
        blob
      });
      
      setStats({
        compressionRatio: (1 - (blob.size / file.size)) * 100,
        sizeDifference: file.size - blob.size,
        processingTime: timeTaken
      });
      
      toast.success("Kompresi berhasil");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat kompresi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecompress = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setStatusMessage("Menyiapkan engine dekompresi...");
    setProgress(5);
    const startTime = performance.now();

    try {
      const ffmpeg = await ffmpegManager.getFFmpeg((p) => setProgress(5 + p * 0.9));
      setStatusMessage("Konversi ke WAV lossless...");
      
      const ext = getFileExtension(file.name);
      const inputName = `input${ext}`;
      const outputName = `output.wav`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      await ffmpeg.exec([
        '-i', inputName,
        '-acodec', 'pcm_s16le', // Standard 16-bit PCM WAV
        '-ar', '44100',
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as any], { type: 'audio/wav' });
      
      const timeTaken = (performance.now() - startTime) / 1000;
      const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      setProgress(100);
      setResultFile({
        name: `${originalNameWithoutExt}_lossless.wav`,
        size: blob.size,
        blob
      });
      
      setStats({ processingTime: timeTaken });
      toast.success("Konversi ke WAV berhasil");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat dekompresi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEncode = async () => {
    if (!file || !fileBuffer || !secretMessage) return;
    
    if (secretMessage.length > maxCapacity) {
      toast.error(`Pesan terlalu panjang. Maksimum ${maxCapacity} karakter.`);
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Menyisipkan pesan ke audio...");
    setProgress(40);
    const startTime = performance.now();

    try {
      // Small timeout to allow UI update
      await new Promise(r => setTimeout(r, 100));
      
      const stegoBlob = encodeAudioLSB(fileBuffer, secretMessage);
      
      setProgress(100);
      
      const timeTaken = (performance.now() - startTime) / 1000;
      const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      setResultFile({
        name: `${originalNameWithoutExt}_stego.wav`,
        size: stegoBlob.size,
        blob: stegoBlob
      });
      
      setStats({
        processingTime: timeTaken,
        sizeDifference: stegoBlob.size - file.size
      });
      
      toast.success("Pesan berhasil disisipkan");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menyisipkan pesan");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecode = async () => {
    if (!file || !fileBuffer) return;
    
    setIsProcessing(true);
    setStatusMessage("Mengekstrak pesan dari audio...");
    setProgress(40);
    const startTime = performance.now();

    try {
      await new Promise(r => setTimeout(r, 100));
      const extracted = decodeAudioLSB(fileBuffer);
      
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
          <MusicIcon className="text-[#D9261C]" size={36} />
          Audio Codec & Steganography
        </h1>
      </div>

      <ModeSelector 
        modes={modes} 
        activeMode={activeMode} 
        onModeChange={handleModeChange} 
      />

      {!resultFile && extractedMessage === undefined ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-up">
          {/* Left Column: File Uploader */}
          <div className="lg:col-span-7">
            <h2 className="text-xl font-display font-medium text-white mb-4">1. Upload Audio</h2>
            <FileUploader 
              accept="audio/*"
              maxSizeMB={100}
              onFileSelect={loadFileAndCapacity}
              onError={(msg) => toast.error(msg)}
              currentFile={file}
              onReset={handleReset}
              supportedFormats={["WAV", "MP3", "AAC", "OGG", "FLAC"]}
            />
            
            {/* Audio Preview */}
            {fileUrl && (
              <div className="mt-6 glass-card p-6 flex flex-col items-center">
                <audio controls src={fileUrl} className="w-full accent-[#D9261C]" />
              </div>
            )}
          </div>

          {/* Right Column: Parameters & Action */}
          <div className="lg:col-span-5">
            <h2 className="text-xl font-display font-medium text-white mb-4">2. Pengaturan & Proses</h2>
            
            <div className="glass-card p-6 h-full flex flex-col">
              {!file ? (
                <div className="flex-1 flex items-center justify-center text-[#F7F4EB]/40 text-sm italic text-center">
                  Silakan upload file audio terlebih dahulu.
                </div>
              ) : (
                <>
                  {activeMode === "compress" && (
                    <div className="space-y-6 flex-1">
                      <div>
                        <label className="block text-sm font-medium text-[#F7F4EB]/90 mb-2">Format Output</label>
                        <select 
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value as any)}
                          className="w-full bg-[#0B0E11] border border-[#F7F4EB]/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D9261C]"
                        >
                          <option value="mp3">MP3 (MPEG Audio Layer 3)</option>
                          <option value="aac">AAC (Advanced Audio Coding)</option>
                          <option value="ogg">OGG (Vorbis)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#F7F4EB]/90 mb-2">Audio Bitrate</label>
                        <select 
                          value={bitrate}
                          onChange={(e) => setBitrate(e.target.value)}
                          className="w-full bg-[#0B0E11] border border-[#F7F4EB]/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D9261C]"
                        >
                          <option value="64k">64 kbps (Low Quality, Smallest)</option>
                          <option value="96k">96 kbps</option>
                          <option value="128k">128 kbps (Standard Quality)</option>
                          <option value="192k">192 kbps (High Quality)</option>
                          <option value="256k">256 kbps</option>
                          <option value="320k">320 kbps (Best Quality, Largest)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#F7F4EB]/90 mb-2">Sample Rate</label>
                          <select 
                            value={sampleRate}
                            onChange={(e) => setSampleRate(e.target.value)}
                            className="w-full bg-[#0B0E11] border border-[#F7F4EB]/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D9261C]"
                          >
                            <option value="44100">44.1 kHz (CD)</option>
                            <option value="48000">48 kHz (DVD)</option>
                            <option value="22050">22.05 kHz</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#F7F4EB]/90 mb-2">Channels</label>
                          <select 
                            value={channels}
                            onChange={(e) => setChannels(e.target.value)}
                            className="w-full bg-[#0B0E11] border border-[#F7F4EB]/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D9261C]"
                          >
                            <option value="2">Stereo</option>
                            <option value="1">Mono</option>
                          </select>
                        </div>
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
                          Audio akan dikonversi ke format <strong>WAV (16-bit PCM)</strong>. Ini akan memperbesar ukuran file secara signifikan untuk memastikan tidak ada kompresi lossy lebih lanjut.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeMode === "encode" && (
                    <div className="space-y-6 flex-1 flex flex-col">
                      <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-medium text-[#F7F4EB]/90 mb-2 flex justify-between">
                          <span>Pesan Rahasia</span>
                          <span className="text-xs font-mono text-[#F7F4EB]/50">
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
                    </div>
                  )}

                  {activeMode === "decode" && (
                    <div className="space-y-6 flex-1">
                      <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">
                        <p className="text-sm text-[#F7F4EB]/90 mb-2">
                          <strong>Siap Mengekstrak Pesan</strong>
                        </p>
                        <p className="text-xs text-[#F7F4EB]/70">
                          Sistem akan memindai LSB pada data PCM WAV ini untuk mencari teks tersembunyi.
                        </p>
                      </div>
                    </div>
                  )}

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
                      
                      {activeMode === "compress" && "Kompres Audio"}
                      {activeMode === "decompress" && "Dekompres ke WAV"}
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
        <ResultPanel 
          type={activeMode === "compress" || activeMode === "decompress" ? activeMode : `steganography-${activeMode}` as any}
          originalFile={file ? {
            name: file.name,
            size: file.size,
          } : undefined}
          resultFile={resultFile ? {
            name: resultFile.name,
            size: resultFile.size,
            downloadUrl: resultUrl || ""
          } : undefined}
          extractedMessage={extractedMessage}
          stats={stats}
          onReset={handleReset}
        />
      )}

      {/* Jika ada hasil dan mode kompresi/dekompresi, tampilkan audio player untuk result */}
      {resultFile && (activeMode === "compress" || activeMode === "decompress") && resultUrl && (
        <div className="mt-8 max-w-[1152px] mx-auto animate-fade-up">
           <div className="glass-card p-6 flex flex-col items-center max-w-2xl mx-auto border-[#22C55E]/30 relative overflow-hidden">
             <div className="absolute inset-0 bg-[#22C55E]/5 pointer-events-none"></div>
             <p className="text-sm font-medium text-[#22C55E] mb-4 z-10">Preview Hasil</p>
             <audio controls src={resultUrl} className="w-full relative z-10" />
           </div>
        </div>
      )}

      <ProcessingIndicator 
        isProcessing={isProcessing}
        progress={progress}
        statusMessage={statusMessage}
      />
    </div>
  );
}
