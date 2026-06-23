"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";
import clsx from "clsx";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="text-[#22C55E]" size={20} />,
  error: <XCircle className="text-[#EF4444]" size={20} />,
  warning: <AlertTriangle className="text-[#F59E0B]" size={20} />,
  info: <Info className="text-[#3B82F6]" size={20} />,
};

const bgColors = {
  success: "bg-[#22C55E]/10 border-[#22C55E]/20",
  error: "bg-[#EF4444]/10 border-[#EF4444]/20",
  warning: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
  info: "bg-[#3B82F6]/10 border-[#3B82F6]/20",
};

export default function Toast({ toast, onRemove }: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(toast.id), 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={clsx(
        "glass-heavy border p-4 pr-12 rounded-xl flex items-start gap-3 shadow-2xl relative w-[350px] max-w-[calc(100vw-2rem)]",
        bgColors[toast.variant],
        isLeaving ? "opacity-0 translate-x-8 transition-all duration-300" : "animate-slide-in-right"
      )}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.variant]}</div>
      <p className="text-sm font-medium text-white leading-relaxed">{toast.message}</p>
      
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-[#F7F4EB]/50 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Toast Container for rendering toasts globally (to be used in layout or context if needed)
// For simplicity in this project without context, we will use a hook that manages its own state
// but typically this would be a Context.
