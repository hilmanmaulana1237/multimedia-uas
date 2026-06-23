"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, File, X, RefreshCw } from "lucide-react";
import clsx from "clsx";

interface FileUploaderProps {
  accept: string;
  maxSizeMB: number;
  onFileSelect: (file: File) => void;
  onError: (message: string) => void;
  label?: string;
  supportedFormats?: string[];
  currentFile?: File | null;
  onReset?: () => void;
}

export default function FileUploader({
  accept,
  maxSizeMB,
  onFileSelect,
  onError,
  label = "Pilih atau letakkan file di sini",
  supportedFormats = [],
  currentFile,
  onReset
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateAndSelectFile = (file: File) => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      onError(`Ukuran file melebihi batas maksimum (${maxSizeMB}MB)`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputRef.current) inputRef.current.value = "";
    if (onReset) onReset();
  };

  if (currentFile) {
    return (
      <div className="w-full glass-card p-6 flex flex-col items-center justify-center min-h-[200px] animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-[#D9261C]/20 text-[#D9261C] flex items-center justify-center mb-4">
          <File size={32} />
        </div>
        <h3 className="font-medium text-white text-lg text-center truncate max-w-[90%] mb-1">
          {currentFile.name}
        </h3>
        <p className="text-sm text-[#F7F4EB]/60 font-mono mb-6">
          {(currentFile.size / (1024 * 1024)).toFixed(2)} MB
        </p>
        
        <button
          onClick={handleRemove}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-[#D9261C]/20 hover:text-white transition-colors text-sm"
        >
          <RefreshCw size={16} />
          Ganti File
        </button>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "w-full min-h-[200px] upload-zone rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer relative overflow-hidden group",
        isDragOver ? "drag-over" : "hover:border-[#D9261C]/50 hover:bg-[#F7F4EB]/5"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileInput}
        accept={accept}
        className="hidden"
      />
      
      <div className={clsx(
        "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
        isDragOver ? "bg-[#D9261C] text-white scale-110 shadow-[0_0_20px_rgba(217,38,28,0.4)]" : "bg-[#F7F4EB]/10 text-[#F7F4EB]/60 group-hover:bg-[#D9261C]/20 group-hover:text-[#D9261C]"
      )}>
        <UploadCloud size={32} />
      </div>
      
      <p className="font-display font-medium text-lg text-white mb-2 text-center">
        {label}
      </p>
      
      <p className="text-sm text-[#F7F4EB]/50 text-center max-w-[80%]">
        Maksimum ukuran file: <span className="font-mono text-[#F7F4EB]/80">{maxSizeMB}MB</span>
      </p>
      
      {supportedFormats.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {supportedFormats.map(fmt => (
            <span key={fmt} className="text-xs font-mono px-2 py-1 rounded bg-[#0B0E11] text-[#F7F4EB]/70 border border-[#F7F4EB]/10">
              {fmt}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
