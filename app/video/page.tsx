"use client";

import React, { useState } from "react";
import { Minimize, Maximize, VideoIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ModeSelector, { Mode } from "../components/ModeSelector";
import FileUploader from "../components/FileUploader";
import ProcessingIndicator from "../components/ProcessingIndicator";
import ResultPanel from "../components/ResultPanel";
import { useToast, useObjectURL } from "../lib/hooks";
import { getFileExtension, getMimeType } from "../lib/file-utils";
import { ffmpegManager } from "../lib/ffmpeg-manager";
import { fetchFile } from "@ffmpeg/util";

export default function VideoCodecPage() {
  const { toast } = useToast();
  
  // States
  const [activeMode, setActiveMode] = useState<string>("compress");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  
  // Results
  const [resultFile, setResultFile] = useState<{name: string, size: number, blob: Blob} | null>(null);
  const [stats, setStats] = useState<{compressionRatio?: number, sizeDifference?: number, processingTime?: number}>({});
  
  const resultUrl = useObjectURL(resultFile?.blob || null);
  const fileUrl = useObjectURL(file || null);

  // Compression settings
  const [outputFormat, setOutputFormat] = useState<"mp4" | "webm">("mp4");
  const [resolution, setResolution] = useState("-2:720"); // 720p default
  const [bitrate, setBitrate] = useState("2M");
  const [preset, setPreset] = useState("medium");

  const modes: Mode[] = [
    {
      id: "compress",
      label: "KOMPRESI",
      description: "Kurangi resolusi dan bitrate video",
      icon: <Minimize size={24} />
    },
    {
      id: "decompress",
      label: "DEKOMPRESI",
      description: "Konversi ke format lossless",
      icon: <Maximize size={24} />
    },
    {
      id: "encode",
      label: "ENCODE MSG",
      description: "Tidak tersedia untuk video",
      icon: <VideoIcon size={24} />,
      disabled: true,
      disabledReason: "Steganografi video terlalu berat untuk diproses di browser klien secara langsung."
    },
    {
      id: "decode",
      label: "DECODE",
      description: "Tidak tersedia untuk video",
      icon: <VideoIcon size={24} />,
      disabled: true,
      disabledReason: "Steganografi video terlalu berat untuk diproses di browser klien secara langsung."
    }
  ];

  const handleModeChange = (modeId: string) => {
    setActiveMode(modeId);
    handleReset();
  };

  const handleReset = () => {
    setFile(null);
    setResultFile(null);
    setStats({});
    setProgress(0);
  };

  const loadFile = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleCompress = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setStatusMessage("Menyiapkan engine kompresi...");
    setProgress(5);
    const startTime = performance.now();

    try {
      const ffmpeg = await ffmpegManager.getFFmpeg((p) => {
        setProgress(5 + p * 0.9);
      });

      setStatusMessage("Memproses video (mungkin memakan waktu)...");
      
      const ext = getFileExtension(file.name);
      const inputName = `input${ext}`;
      const outputName = `output.${outputFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const args = [
        '-i', inputName,
      ];

      if (resolution !== "original") {
        args.push('-vf', `scale=${resolution}`);
      }

      if (outputFormat === "mp4") {
        args.push('-c:v', 'libx264');
        args.push('-preset', preset);
        args.push('-b:v', bitrate);
        args.push('-c:a', 'aac');
        args.push('-b:a', '128k');
      } else {
        // webm
        args.push('-c:v', 'libvpx-vp9');
        args.push('-b:v', bitrate);
        args.push('-c:a', 'libvorbis');
      }
      
      args.push(outputName);

      await ffmpeg.exec(args);

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
      
      toast.success("Kompresi video berhasil");
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
      setStatusMessage("Konversi ke format lossless (AVI)...");
      
      const ext = getFileExtension(file.name);
      const inputName = `input${ext}`;
      const outputName = `output.avi`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Huffyuv is a lossless video codec
      await ffmpeg.exec([
        '-i', inputName,
        '-c:v', 'huffyuv',
        '-c:a', 'pcm_s16le',
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as any], { type: 'video/x-msvideo' });
      
      const timeTaken = (performance.now() - startTime) / 1000;
      const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      setProgress(100);
      setResultFile({
        name: `${originalNameWithoutExt}_lossless.avi`,
        size: blob.size,
        blob
      });
      
      setStats({ processingTime: timeTaken });
      toast.success("Konversi video berhasil");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat dekompresi");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1152px] mx-auto px-6">
      <div className="mb-8 animate-fade-up">
        <Link href="/" className="inline-flex items-center gap-2 text-[#F7F4EB]/60 hover:text-white transition-colors text-sm font-medium mb-4">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-white flex items-center gap-3">
          <VideoIcon className="text-[#D9261C]" size={36} />
          Video Codec
        </h1>
      </div>

      <ModeSelector 
        modes={modes} 
        activeMode={activeMode} 
        onModeChange={handleModeChange} 
      />

      {!resultFile ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-up">
          <div className="lg:col-span-7">
            <h2 className="text-xl font-display font-medium text-white mb-4">1. Upload Video</h2>
            <FileUploader 
              accept="video/*"
              maxSizeMB={200}
              onFileSelect={loadFile}
              onError={(msg) => toast.error(msg)}
              currentFile={file}
              onReset={handleReset}
              supportedFormats={["MP4", "WEBM", "AVI", "MKV", "MOV"]}
            />
            
            {fileUrl && (
              <div className="mt-6 glass-card p-4 flex flex-col items-center">
                <video controls src={fileUrl} className="w-full max-h-[400px] rounded-lg bg-black/50" />
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <h2 className="text-xl font-display font-medium text-white mb-4">2. Pengaturan & Proses</h2>
            
            <div className="glass-card p-6 h-full flex flex-col">
              {!file ? (
                <div className="flex-1 flex items-center justify-center text-[#F7F4EB]/40 text-sm italic text-center">
                  Silakan upload file video terlebih dahulu.
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
                          <option value="mp4">MP4 (H.264)</option>
                          <option value="webm">WebM (VP9)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#F7F4EB]/90 mb-2">Target Resolusi</label>
                        <select 
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          className="w-full bg-[#0B0E11] border border-[#F7F4EB]/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D9261C]"
                        >
                          <option value="original">Original (Tidak diubah)</option>
                          <option value="-2:1080">1080p</option>
                          <option value="-2:720">720p (HD)</option>
                          <option value="-2:480">480p</option>
                          <option value="-2:360">360p</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#F7F4EB]/90 mb-2">Video Bitrate</label>
                          <select 
                            value={bitrate}
                            onChange={(e) => setBitrate(e.target.value)}
                            className="w-full bg-[#0B0E11] border border-[#F7F4EB]/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D9261C]"
                          >
                            <option value="500k">500 kbps (Low)</option>
                            <option value="1M">1 Mbps</option>
                            <option value="2M">2 Mbps (Standard)</option>
                            <option value="4M">4 Mbps (High)</option>
                            <option value="8M">8 Mbps</option>
                          </select>
                        </div>
                        {outputFormat === "mp4" && (
                          <div>
                            <label className="block text-sm font-medium text-[#F7F4EB]/90 mb-2">Preset Kompresi</label>
                            <select 
                              value={preset}
                              onChange={(e) => setPreset(e.target.value)}
                              className="w-full bg-[#0B0E11] border border-[#F7F4EB]/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D9261C]"
                            >
                              <option value="ultrafast">Ultrafast (Cepat, File Besar)</option>
                              <option value="fast">Fast</option>
                              <option value="medium">Medium (Seimbang)</option>
                              <option value="slow">Slow (Lambat, File Kecil)</option>
                            </select>
                          </div>
                        )}
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
                          Video akan dikonversi ke format <strong>AVI (Huffyuv)</strong>. Peringatan: Ukuran file hasil dekompresi akan <strong>sangat besar</strong> karena tidak ada kompresi yang diterapkan.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-[#F7F4EB]/10">
                    <button
                      onClick={() => {
                        if (activeMode === "compress") handleCompress();
                        else if (activeMode === "decompress") handleDecompress();
                      }}
                      className="w-full py-3 px-4 bg-[#D9261C] hover:bg-[#9D1A10] text-white rounded-xl transition-all duration-300 shadow-[0_4px_14px_rgba(217,38,28,0.3)] hover:shadow-[0_8px_20px_rgba(217,38,28,0.5)] font-medium text-lg flex items-center justify-center gap-2"
                    >
                      {activeMode === "compress" ? <Minimize size={20} /> : <Maximize size={20} />}
                      {activeMode === "compress" ? "Kompres Video" : "Dekompres ke AVI"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <ResultPanel 
          type={activeMode as any}
          originalFile={file ? {
            name: file.name,
            size: file.size,
          } : undefined}
          resultFile={resultFile ? {
            name: resultFile.name,
            size: resultFile.size,
            downloadUrl: resultUrl || ""
          } : undefined}
          stats={stats}
          onReset={handleReset}
        />
      )}

      {resultFile && resultUrl && (
        <div className="mt-8 max-w-[1152px] mx-auto animate-fade-up">
           <div className="glass-card p-6 flex flex-col items-center max-w-4xl mx-auto border-[#22C55E]/30 relative overflow-hidden">
             <div className="absolute inset-0 bg-[#22C55E]/5 pointer-events-none"></div>
             <p className="text-sm font-medium text-[#22C55E] mb-4 z-10">Preview Hasil</p>
             <video controls src={resultUrl} className="w-full max-h-[500px] relative z-10 rounded-lg bg-black/80" />
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
