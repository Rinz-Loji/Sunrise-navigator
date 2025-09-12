"use client";

import { forwardRef } from 'react';

interface AlarmSoundProps {
  soundUrl: string;
}

export const AlarmSound = forwardRef<HTMLAudioElement, AlarmSoundProps>(({ soundUrl }, ref) => {
  return (
    <audio ref={ref} loop src={soundUrl}>
      Your browser does not support the audio element.
    </audio>
  );
});

AlarmSound.displayName = 'AlarmSound';
