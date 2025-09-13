"use client";

import { forwardRef } from 'react';

// This component is now just a wrapper for an audio element
export const AlarmSound = forwardRef<HTMLAudioElement, {}>((props, ref) => {
  return (
    <audio ref={ref} loop>
      Your browser does not support the audio element.
    </audio>
  );
});

AlarmSound.displayName = 'AlarmSound';
