"use client";

import React, { useRef, useImperativeHandle, forwardRef } from "react";

export interface OneOffSoundHandler {
  play: () => void;
}

interface OneOffSoundProps {
  src: string;
}

const OneOffSound = forwardRef<OneOffSoundHandler, OneOffSoundProps>(
  ({ src }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          audioRef.current.play().catch((error) => {
            console.error("Playback failed:", error);
          });
        }
      },
    }));

    return <audio ref={audioRef} src={src} preload="auto" />;
  },
);

OneOffSound.displayName = "OneOffSound";

export default OneOffSound;
