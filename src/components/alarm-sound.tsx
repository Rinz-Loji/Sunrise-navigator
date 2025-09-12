"use client";

import { useEffect, useRef } from 'react';

// A simple, royalty-free alarm sound.
const ALARM_SOUND_URL = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

export function AlarmSound() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Autoplay when the component mounts
    audioRef.current?.play().catch(error => {
      // Autoplay might be blocked by the browser. 
      // In a real app, you'd handle this with a user gesture.
      console.warn("Audio autoplay was blocked by the browser.", error);
    });
  }, []);

  return (
    <audio ref={audioRef} loop>
      <source src={ALARM_SOUND_URL} type="audio/ogg" />
      Your browser does not support the audio element.
    </audio>
  );
}
