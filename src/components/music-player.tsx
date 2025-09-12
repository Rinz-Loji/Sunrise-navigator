"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getMusicVideo } from '@/lib/actions';
import { Loader2, Music } from 'lucide-react';

export function MusicPlayer() {
  const [videoId, setVideoId] = useState('jfKfPfyJRdk'); // Default peaceful music
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const result = await getMusicVideo(query);
      if (result.videoId) {
        setVideoId(result.videoId);
      }
    } catch (error) {
      console.error("Failed to fetch music video", error);
      // In a real app, you might show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What song should I play?"
            className="bg-background/50"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !query}>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Music />
            )}
            <span className="sr-only">Search</span>
          </Button>
        </form>
        <div className="aspect-video">
          {videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=1&iv_load_policy=3&modestbranding=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-muted">
                <p>Search for a song to begin.</p>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
