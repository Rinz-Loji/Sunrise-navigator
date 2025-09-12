"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const albumArt = placeholderImages.placeholderImages[0];

  return (
    <Card className="overflow-hidden shadow-lg bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 flex items-center gap-4">
        <Image
          src={albumArt.imageUrl}
          alt="Album Art"
          width={80}
          height={80}
          className="rounded-md"
          data-ai-hint={albumArt.imageHint}
        />
        <div className="flex-grow">
          <p className="font-semibold text-lg">Morning Vibe</p>
          <p className="text-sm text-muted-foreground">Peaceful Piano</p>
          <p className="text-xs text-muted-foreground">Spotify Wake-up</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 bg-primary/20 hover:bg-primary/30 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
