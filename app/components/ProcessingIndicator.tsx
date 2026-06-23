"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  progress: number;
  statusMessage?: string;
  estimatedTime?: string;
  stage?: string;
}

export default function ProcessingIndicator({
  isProcessing,
  progress,
  statusMessage = "Memproses file...",
  estimatedTime,
  stage
}: ProcessingIndicatorProps) {
  if (!isProcessing) return null;

  // Ensure progress is bounded
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0E11]/80 backdrop-blur-sm animate-fade-up">
      <div className="glass-heavy p-8 w-full max-w-md mx-4 animate-scale-in flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#D9261C]/20 flex items-center justify-center mb-6 relative">
          <Loader2 className="animate-spin text-[#D9261C]" size={32} />
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#D9261C] border-t-transparent animate-spin" style={{ animationDuration: '3s' }}></div>
        </div>
        
        <h3 className="font-display font-medium text-xl text-white mb-2">
          {statusMessage}
        </h3>
        
        {stage && (
          <p className="text-sm text-[#F7F4EB]/60 mb-6 max-w-[90%] truncate">
            {stage}
          </p>
        )}
        
        <div className="w-full mb-2">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#F7F4EB]/50 font-mono">Progress</span>
            <span className="text-[#D9261C] font-mono font-medium">{Math.round(safeProgress)}%</span>
          </div>
          <div className="progress-bar w-full">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${safeProgress}%` }}
            ></div>
          </div>
        </div>
        
        {estimatedTime && (
          <p className="text-xs text-[#F7F4EB]/40 mt-4 font-mono">
            Estimasi waktu: {estimatedTime}
          </p>
        )}
      </div>
    </div>
  );
}
