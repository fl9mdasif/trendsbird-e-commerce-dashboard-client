"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface MediaUploadBarProps {
  progress: number;
}

export function MediaUploadBar({ progress }: MediaUploadBarProps) {
  return (
    <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-2 text-indigo-400">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Uploading media to Supabase cloud storage...</span>
        </span>
        <span className="text-indigo-400 font-mono font-bold">{progress}%</span>
      </div>
      <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-indigo-500/20">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default MediaUploadBar;
