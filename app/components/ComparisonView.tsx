"use client";

import React from "react";
import { FileIcon } from "lucide-react";

interface ViewProps {
  mode: "side-by-side" | "slider";
  before: { src: string; label: string; size: number };
  after: { src: string; label: string; size: number };
}

export default function ComparisonView({ mode, before, after }: ViewProps) {
  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const renderMedia = (src: string) => {
    if (!src) return (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-[#0B0E11]/50 rounded-lg">
        <FileIcon size={48} className="text-[#F7F4EB]/20" />
      </div>
    );
    
    // Assume image for now based on data URL or src
    return <img src={src} alt="Preview" className="w-full h-auto max-h-[300px] object-contain rounded-lg bg-[#0B0E11]/30" />;
  };

  if (mode === "side-by-side") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-2 rounded-xl flex flex-col">
          <div className="flex justify-between items-center px-2 py-2 mb-2 border-b border-[#F7F4EB]/10">
            <span className="text-xs font-bold tracking-wider text-[#F7F4EB]/50">{before.label}</span>
            <span className="text-xs font-mono bg-[#0B0E11] px-2 py-1 rounded text-[#F7F4EB]/80">{formatSize(before.size)}</span>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            {renderMedia(before.src)}
          </div>
        </div>
        
        <div className="glass border-[#D9261C]/30 p-2 rounded-xl flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#D9261C]/5 to-transparent pointer-events-none"></div>
          <div className="flex justify-between items-center px-2 py-2 mb-2 border-b border-[#D9261C]/20 relative z-10">
            <span className="text-xs font-bold tracking-wider text-[#D9261C]">{after.label}</span>
            <span className="text-xs font-mono bg-[#D9261C]/10 text-[#D9261C] px-2 py-1 rounded border border-[#D9261C]/20">
              {formatSize(after.size)}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden relative z-10">
            {renderMedia(after.src)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-center text-sm text-[#F7F4EB]/50 italic p-8 glass rounded-xl">
      Slider mode coming soon.
    </div>
  );
}
