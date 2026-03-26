"use client";

import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from "@heroicons/react/16/solid";
import React, { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

interface ContentToggleProps {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
}

function renderToString(component: React.ReactNode): string {
  const div = document.createElement("div");
  const root = createRoot(div);
  queueMicrotask(() => {
    flushSync(() => {
      root.render(component);
    });
  });
  return div.innerHTML;
}

export default function ContentToggle({ id, title, children }: ContentToggleProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  function calculateCRC(data: string): string {
    const polynomial = 0xedb88320;
    let crc = 0xffffffff;

    // Iterate through each character in the data
    for (let i = 0; i < data.length; i++) {
      // XOR the current character
      // with the current CRC value
      crc ^= data.charCodeAt(i);

      // Perform bitwise operations
      // to calculate the new CRC value
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? polynomial : 0);
      }
    }

    // Perform a final XOR operation and return the CRC value
    return (crc ^ 0xffffffff).toString();
  }

  useEffect(() => {
    const checkVisibility = async () => {
      const checksum = calculateCRC(renderToString(children));
      const hiddenHash = localStorage.getItem(`hide_state_${id}`);

      // If the hash in storage matches the current body, hide it.
      setIsVisible(hiddenHash !== checksum);
      setIsLoaded(true);
    };

    checkVisibility();
  }, [id, children, title]);

  const toggleVisibility = async () => {
    const checksum = calculateCRC(renderToString(children));

    if (isVisible) {
      // Hiding: Save the current content's checksum
      localStorage.setItem(`hide_state_${id}`, checksum);
      setIsVisible(false);
    } else {
      // Showing: Clear the preference
      localStorage.removeItem(`hide_state_${id}`);
      setIsVisible(true);
    }
  };

  // Prevent layout shift/flash by not rendering until we know the storage state
  if (!isLoaded) return <div className="h-10 animate-pulse bg-slate-500 rounded" />;

  return (
    <div className="border rounded-lg border-slate-500 overflow-hidden my-2">
      <button
        onClick={toggleVisibility}
        className="w-full text-left text-xs flex items-center justify-between p-3 bg-slate-500 hover:bg-slate-400 transition-colors"
      >
        <span className="font-semibold text-slate-900 uppercase">{title}</span>
        <span className="text-sm text-slate-900 font-medium">
          {isVisible ? (
            <ChevronDoubleUpIcon className="size-4 text-slate-800" />
          ) : (
            <ChevronDoubleDownIcon className="size-4 text-slate-800" />
          )}
        </span>
      </button>

      {isVisible && (
        <div className="px-4 py-1 animate-in fade-in slide-in-from-top-1">{children}</div>
      )}
    </div>
  );
}
