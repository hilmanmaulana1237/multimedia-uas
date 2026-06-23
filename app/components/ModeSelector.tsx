"use client";

import React from "react";
import clsx from "clsx";
import { InfoIcon } from "lucide-react";

export interface Mode {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledReason?: string;
}

interface ModeSelectorProps {
  modes: Mode[];
  activeMode: string;
  onModeChange: (modeId: string) => void;
}

export default function ModeSelector({ modes, activeMode, onModeChange }: ModeSelectorProps) {
  // Hitung jumlah mode aktif untuk mengatur grid kolom (maks 4)
  const cols = modes.length === 2 ? "grid-cols-1 sm:grid-cols-2" : 
               modes.length === 3 ? "grid-cols-1 sm:grid-cols-3" : 
               "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className="w-full mb-12 animate-fade-up">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-display font-semibold text-white mb-2">Pilih Mode Operasi</h2>
        <p className="text-[#F7F4EB]/60 text-sm max-w-2xl mx-auto">
          Pilih jenis operasi yang ingin Anda lakukan pada file. Steganografi hanya didukung pada format tertentu.
        </p>
      </div>

      <div className={`grid ${cols} gap-4`}>
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;
          
          return (
            <div key={mode.id} className="relative group">
              <button
                type="button"
                onClick={() => !mode.disabled && onModeChange(mode.id)}
                disabled={mode.disabled}
                className={clsx(
                  "w-full h-full text-left p-6 rounded-2xl border transition-all duration-300 flex flex-col gap-4",
                  mode.disabled ? "opacity-50 cursor-not-allowed bg-transparent border-[#F7F4EB]/5" :
                  isActive ? "bg-[#D9261C]/10 border-[#D9261C] shadow-[0_0_30px_rgba(217,38,28,0.15)] transform scale-[1.02]" :
                  "glass-card hover:border-[#D9261C]/50 hover:bg-[#F7F4EB]/5"
                )}
              >
                <div className={clsx(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  isActive ? "bg-[#D9261C] text-white shadow-[0_4px_14px_rgba(217,38,28,0.4)]" :
                  mode.disabled ? "bg-[#F7F4EB]/5 text-[#F7F4EB]/40" :
                  "bg-[#F7F4EB]/5 text-[#F7F4EB] group-hover:bg-[#D9261C]/20 group-hover:text-[#D9261C]"
                )}>
                  {mode.icon}
                </div>
                
                <div>
                  <h3 className={clsx(
                    "font-display font-medium text-lg mb-1",
                    isActive ? "text-white" : mode.disabled ? "text-[#F7F4EB]/40" : "text-[#F7F4EB]/90"
                  )}>
                    {mode.label}
                  </h3>
                  <p className={clsx(
                    "text-sm line-clamp-2",
                    isActive ? "text-[#F7F4EB]/80" : mode.disabled ? "text-[#F7F4EB]/30" : "text-[#F7F4EB]/60"
                  )}>
                    {mode.description}
                  </p>
                </div>
              </button>
              
              {/* Tooltip for disabled state */}
              {mode.disabled && mode.disabledReason && (
                <div className="absolute top-4 right-4 group-hover:flex hidden flex-col items-end z-10">
                  <InfoIcon size={20} className="text-[#F59E0B] mb-2" />
                  <div className="glass-heavy p-3 rounded-lg text-xs w-48 text-right shadow-xl">
                    {mode.disabledReason}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
