"use client";

import React from "react";
import { Download, RefreshCw, CheckCircle, File as FileIcon } from "lucide-react";
import ComparisonView from "./ComparisonView";

interface FileStats {
  name: string;
  size: number;
  preview?: string;
  format?: string;
  resolution?: string;
}

interface ResultPanelProps {
  type: "compression" | "decompression" | "steganography-encode" | "steganography-decode";
  originalFile?: FileStats;
  resultFile?: FileStats & { downloadUrl: string };
  extractedMessage?: string;
  stats?: {
    compressionRatio?: number;
    sizeDifference?: number;
    processingTime?: number;
  };
  onReset: () => void;
}

export default function ResultPanel({
  type,
  originalFile,
  resultFile,
  extractedMessage,
  stats,
  onReset
}: ResultPanelProps) {
  
  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const renderStats = () => {
    if (!stats) return null;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.compressionRatio !== undefined && (
          <div className="glass p-4 rounded-xl">
            <p className="text-xs text-[#F7F4EB]/50 mb-1">Rasio Kompresi</p>
            <p className="text-xl font-display text-white">{stats.compressionRatio.toFixed(1)}%</p>
          </div>
        )}
        {stats.sizeDifference !== undefined && (
          <div className="glass p-4 rounded-xl">
            <p className="text-xs text-[#F7F4EB]/50 mb-1">Ukuran Berkurang</p>
            <p className="text-xl font-display text-[#22C55E]">{formatSize(stats.sizeDifference)}</p>
          </div>
        )}
        {stats.processingTime !== undefined && (
          <div className="glass p-4 rounded-xl">
            <p className="text-xs text-[#F7F4EB]/50 mb-1">Waktu Proses</p>
            <p className="text-xl font-display text-white">{stats.processingTime.toFixed(1)}s</p>
          </div>
        )}
      </div>
    );
  };

  const handleDownload = () => {
    if (resultFile?.downloadUrl) {
      const a = document.createElement("a");
      a.href = resultFile.downloadUrl;
      a.download = resultFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleCopy = () => {
    if (extractedMessage) {
      navigator.clipboard.writeText(extractedMessage);
    }
  };

  return (
    <div className="w-full glass-card p-6 md:p-8 animate-fade-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center">
          <CheckCircle size={24} />
        </div>
        <div>
          <h2 className="text-xl font-display font-medium text-white">Berhasil!</h2>
          <p className="text-sm text-[#F7F4EB]/60">
            {type === "compression" && "File berhasil dikompresi."}
            {type === "decompression" && "File berhasil didekompresi."}
            {type === "steganography-encode" && "Pesan rahasia berhasil disisipkan."}
            {type === "steganography-decode" && "Pesan rahasia berhasil diekstrak."}
          </p>
        </div>
      </div>

      {/* Media Previews */}
      {(type === "compression" || type === "decompression") && originalFile && resultFile && (
        <div className="mb-8">
          <ComparisonView 
            before={{
              src: originalFile.preview || "",
              label: "SEBELUM",
              size: originalFile.size
            }}
            after={{
              src: resultFile.preview || "",
              label: "SESUDAH",
              size: resultFile.size
            }}
            mode="side-by-side"
          />
        </div>
      )}

      {/* Steganography Encode Preview */}
      {type === "steganography-encode" && resultFile && (
        <div className="mb-8 flex flex-col items-center">
          {resultFile.preview ? (
            <img src={resultFile.preview} alt="Stego Result" className="max-h-64 rounded-xl object-contain bg-[#0B0E11]/50 p-2 border border-[#F7F4EB]/10" />
          ) : (
            <div className="w-32 h-32 glass rounded-xl flex items-center justify-center">
              <FileIcon size={48} className="text-[#F7F4EB]/40" />
            </div>
          )}
          <p className="text-sm font-mono mt-4 text-[#F7F4EB]/70">{resultFile.name} ({formatSize(resultFile.size)})</p>
        </div>
      )}

      {/* Steganography Decode Result */}
      {type === "steganography-decode" && extractedMessage !== undefined && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#F7F4EB]/80 mb-2">Pesan Rahasia Ditemukan:</label>
          <div className="w-full glass p-4 rounded-xl border border-[#D9261C]/30 text-white min-h-[100px] whitespace-pre-wrap font-mono text-sm relative group">
            {extractedMessage || <span className="text-[#F7F4EB]/40 italic">Tidak ada pesan.</span>}
          </div>
          {extractedMessage && (
            <div className="mt-4 flex justify-end">
              <button onClick={handleCopy} className="text-sm text-[#D9261C] hover:text-[#9D1A10] transition-colors">
                Salin Pesan
              </button>
            </div>
          )}
        </div>
      )}

      {renderStats()}

      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-[#F7F4EB]/10">
        {resultFile?.downloadUrl && (
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-[#D9261C] hover:bg-[#9D1A10] text-white rounded-xl transition-all duration-300 shadow-[0_4px_14px_rgba(217,38,28,0.3)] hover:shadow-[0_8px_20px_rgba(217,38,28,0.5)] font-medium"
          >
            <Download size={20} />
            Unduh Hasil ({formatSize(resultFile.size)})
          </button>
        )}
        
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-3 px-6 glass hover:bg-[#F7F4EB]/10 rounded-xl transition-colors font-medium text-[#F7F4EB]/90"
        >
          <RefreshCw size={20} />
          Proses Lagi
        </button>
      </div>
    </div>
  );
}
