"use client";

import { useEffect, useRef, useState } from 'react';
import type { BriefingData, MotivationalQuote } from '@/lib/types';
import {
  Cloudy,
  Thermometer,
  Wind,
  Car,
  Clock,
  Newspaper,
  Quote,
  MapPin,
  VolumeX,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InfoCard } from './info-card';
import { AlarmSound } from './alarm-sound';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';

interface MorningBriefingProps {
  briefingData: BriefingData;
  quote: MotivationalQuote;
  alarmTime: string | null;
  alarmSoundUrl: string;
  onReset: () => void;
}

const WeatherCard = ({ data }: { data: BriefingData['weather'] }) => (
  <InfoCard title={data.location} icon={MapPin}>
    <div className="flex items-center gap-4">
        <div className="text-4xl font-bold">{data.temperature}°</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Cloudy className="h-4 w-4" />
            <span>{data.condition}</span>
        </div>
    </div>
    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
      <div className="flex items-center gap-1">
        <Wind className="h-4 w-4" />
        <span>12 km/h</span>
      </div>
    </div>
  </InfoCard>
);

const TrafficCard = ({ data }: { data: BriefingData['traffic'] }) => {
  const { toast } = useToast();
  const hasSuggestion = data.suggestion && data.delay > 0;

  const handleAdjust = () => {
    toast({
        title: "Suggestion Applied",
        description: "Your schedule has been updated to accommodate the traffic delay."
    })
  }

  return (
    <InfoCard title="Your Commute" icon={Car}>
        <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{data.commuteTime}</div>
            <span className="text-xs">mins</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Est. Time</span>
            </div>
            {data.delay > 0 && <div className="text-sm font-semibold text-amber-500">+{data.delay} min delay</div>}
        </div>
      <p className="text-xs text-muted-foreground">
        To {data.destination}
      </p>
      {hasSuggestion && (
         <div className="mt-4 p-2 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg border border-amber-200/50 dark:border-amber-900/50">
            <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5"/>
                <div>
                    <p className="text-xs text-amber-800 dark:text-amber-200">{data.suggestion}</p>
                    <Button size="sm" variant="link" className="text-xs h-auto p-0 mt-1" onClick={handleAdjust}>Adjust & Notify</Button>
                </div>
            </div>
         </div>
      )}
    </InfoCard>
  );
};

const NewsCard = ({ data }: { data: BriefingData['news'] }) => (
  <Card className="md:col-span-2 bg-card/80 backdrop-blur-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Top Headlines</CardTitle>
      <Newspaper className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.id} className="text-sm">
            <span className="font-semibold">{item.title}</span>
            <span className="text-xs text-muted-foreground"> - {item.source}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const QuoteCard = ({ data }: { data: MotivationalQuote }) => (
    <Card className="lg:col-span-3 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Food for Thought</CardTitle>
        <Quote className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <blockquote className="border-l-2 border-primary pl-4 italic">
            "{data.quote}"
        </blockquote>
        <p className="text-right text-xs text-muted-foreground mt-2">- {data.author}</p>
      </CardContent>
    </Card>
);

export function MorningBriefing({
  briefingData,
  quote,
  alarmTime,
  alarmSoundUrl,
  onReset,
}: MorningBriefingProps) {
  const greeting = `Good morning! It's ${alarmTime}.`;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(true);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.warn("Audio autoplay was blocked by the browser.", error);
      });
    }
  }, []);

  const handleStopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsAlarmPlaying(false);
  };
  
  const handleReset = () => {
    handleStopAlarm();
    onReset();
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <AlarmSound ref={audioRef} soundUrl={alarmSoundUrl} />
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-muted-foreground">Here's your daily briefing to get you started.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <WeatherCard data={briefingData.weather} />
        <TrafficCard data={briefingData.traffic} />
        <NewsCard data={briefingData.news} />
        <QuoteCard data={quote} />
      </div>
      
      <div className="text-center flex items-center justify-center gap-4">
        {isAlarmPlaying && (
          <Button variant="destructive" onClick={handleStopAlarm}>
            <VolumeX />
            Stop Alarm
          </Button>
        )}
        <Button variant="outline" onClick={handleReset}>
          Reset App
        </Button>
      </div>
    </div>
  );
}
