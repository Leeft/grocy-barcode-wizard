"use client";

import { forwardRef, useCallback, useRef } from "react";

export interface OneOffSoundProps {
  src: string;
}

export type OneOffSoundHandler = {
  play: () => void;
};

export const OneOffSound = forwardRef<OneOffSoundHandler, OneOffSoundProps>(
  ({ src }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    const play = useCallback(() => {
      console.log("supposed to be playing sound now ...");
      audioRef.current?.play();
    }, []);

    return <audio src={src} autoPlay={false} loop={false} />;
  },
);
