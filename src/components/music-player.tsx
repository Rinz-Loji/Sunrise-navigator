"use client";

import { Card, CardContent } from '@/components/ui/card';

export function MusicPlayer() {
  const videoId = 'jfKfPfyJRdk'; // A peaceful piano music video

  return (
    <Card className="overflow-hidden shadow-lg bg-card/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </CardContent>
    </Card>
  );
}
