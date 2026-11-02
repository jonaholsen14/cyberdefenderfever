"use client";

import React, { useState } from 'react';
import { EngineProps } from '@/types/game';

interface ConfigEditPayload {
  filename: string;
  initialContent: string;
  successRegex: string;
}

export default function ConfigEditEngine({
  payload,
  onWin,
  isActive
}: EngineProps<ConfigEditPayload>) {
  const [content, setContent] = useState(payload.initialContent);

  const hasWonRef = React.useRef(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (isActive && !hasWonRef.current) {
      try {
        const regex = new RegExp(payload.successRegex, 'i');
        if (regex.test(newContent)) {
          hasWonRef.current = true;
          onWin();
        }
      } catch (err) {
        console.error("Invalid successRegex:", err);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-900 text-gray-200 font-mono text-sm border border-gray-700 rounded overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-center px-4 py-1 bg-gray-800 border-b border-gray-700 select-none">
        <span className="font-semibold text-gray-300">File: {payload.filename}</span>
      </div>
      
      {/* Editor Area */}
      <div className="flex-grow p-2">
        <textarea
          className="w-full h-full bg-transparent outline-none resize-none disabled:opacity-50"
          value={content}
          onChange={handleChange}
          disabled={!isActive}
          spellCheck={false}
          autoFocus={isActive}
        />
      </div>
      
      {/* Footer Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-gray-800 border-t border-gray-700 select-none text-xs text-gray-400">
        <span>[ Edited ]</span>
        <span>Ctrl+O Write Out  Ctrl+X Exit</span>
      </div>
    </div>
  );
}
