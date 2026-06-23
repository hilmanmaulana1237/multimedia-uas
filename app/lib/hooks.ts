"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ToastMessage, ToastVariant } from "../components/Toast";

// Custom hook to manage object URLs and avoid memory leaks
export function useObjectURL(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob) {
      const newUrl = URL.createObjectURL(blob);
      setUrl(newUrl);
      return () => {
        URL.revokeObjectURL(newUrl);
      };
    } else {
      setUrl(null);
    }
  }, [blob]);

  return url;
}

// Global state for toasts (simple pub/sub)
type ToastListener = (toasts: ToastMessage[]) => void;
let toasts: ToastMessage[] = [];
const listeners: Set<ToastListener> = new Set();

const notifyListeners = () => listeners.forEach(l => l(toasts));

export const toastAPI = {
  add: (message: string, variant: ToastVariant = "info", duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    toasts = [...toasts, { id, message, variant, duration }];
    notifyListeners();
  },
  remove: (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  },
  success: (message: string, duration?: number) => toastAPI.add(message, "success", duration),
  error: (message: string, duration?: number) => toastAPI.add(message, "error", duration),
  warning: (message: string, duration?: number) => toastAPI.add(message, "warning", duration),
  info: (message: string, duration?: number) => toastAPI.add(message, "info", duration),
};

export function useToast() {
  const [activeToasts, setActiveToasts] = useState<ToastMessage[]>(toasts);

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => setActiveToasts(newToasts);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    toasts: activeToasts,
    toast: toastAPI,
    removeToast: toastAPI.remove
  };
}

// Scroll reveal hook
export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isRevealed };
}
