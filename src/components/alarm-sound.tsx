"use client";

import { useEffect, useRef } from 'react';

export function AlarmSound({ soundUrl }: { soundUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.src = soundUrl;
        audioRef.current.play().catch(error => {
            console.warn("Audio autoplay was blocked by the browser.", error);
        });
    }
  }, [soundUrl]);

  return (
    <audio ref={audioRef} loop>
      Your browser does not support the audio element.
    </audio>
  );
}
