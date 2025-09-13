"use client";

import { useEffect, useRef, useState, RefObject } from 'react';
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
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InfoCard } from './info-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { addMinutes, format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface MorningBriefingProps {
  briefingData: BriefingData;
  quote: MotivationalQuote;
  alarmTime: string | null;
  onReset: () => void;
}

const animationDelays = [
    "animate-fade-in-up",
    "animate-fade-in-up-delay-1",
    "animate-fade-in-up-delay-2",
    "animate-fade-in-up-delay-3",
]

const WeatherCard = ({ data }: { data: BriefingData['weather'] }) => (
  <InfoCard title={data.location} icon={MapPin}>
    <div className="flex items-center gap-4">
        <div className="text-4xl font-bold">{data.temperature}°C</div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Cloudy className="h-5 w-5" />
            <span>{data.condition}</span>
        </div>
    </div>
    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
      <div className="flex items-center gap-1">
        <Wind className="h-5 w-5" />
        <span>12 km/h</span>
      </div>
    </div>
  </InfoCard>
);

const TrafficCard = ({ data, alarmTime }: { data: BriefingData['traffic'], alarmTime: string | null }) => {
  const { toast } = useToast();
  const hasSuggestion = data.suggestion && data.delay > 0;

  const arrivalTime = alarmTime 
    ? format(addMinutes(parse(alarmTime, 'HH:mm', new Date()), data.commuteTime), 'HH:mm')
    : null;

  const handleAdjust = () => {
    toast({
        title: "Suggestion Applied",
        description: "In a real app, your calendar and contacts would be notified."
    })
  }

  return (
    <InfoCard title="Your Commute" icon={Car}>
        <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{data.commuteTime}</div>
            <span className="text-xs">mins</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Est. Time</span>
            </div>
            {arrivalTime && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <LogIn className="h-4 w-4" />
                    <span>Arrival: {arrivalTime}</span>
                </div>
            )}
        </div>
        {data.delay > 0 && <div className="text-sm font-semibold text-orange-400 mt-1">+{data.delay} min delay</div>}
      <p className="text-xs text-muted-foreground mt-1">
        To {data.destination}
      </p>
      {hasSuggestion && (
         <div className="mt-4 p-3 bg-white/5 rounded-lg border border-orange-400/20">
            <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5"/>
                <div>
                    <p className="text-xs text-orange-300/80">{data.suggestion}</p>
                    <Button size="sm" variant="link" className="text-xs h-auto p-0 mt-1 text-orange-400" onClick={handleAdjust}>Adjust & Notify</Button>
                </div>
            </div>
         </div>
      )}
    </InfoCard>
  );
};

const NewsCard = ({ data }: { data: BriefingData['news'] }) => (
  <Card className="md:col-span-2 card-glass group">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Top Headlines</CardTitle>
      <Newspaper className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <ul className="space-y-3 pt-2">
        {data.map((item) => (
          <li key={item.id} className="text-sm leading-snug">
            <span className="font-semibold">{item.title}</span>
            <span className="text-xs text-muted-foreground"> - {item.source}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const QuoteCard = ({ data }: { data: MotivationalQuote }) => (
    <Card className="lg:col-span-3 card-glass group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Food for Thought</CardTitle>
        <Quote className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <blockquote className="border-l-2 border-primary pl-4 italic text-foreground/80">
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
  onReset,
}: MorningBriefingProps) {
  const greeting = `Good morning! It's ${alarmTime}.`;

  const handleReset = () => {
    onReset();
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2 animate-fade-in-up">
        <h1 className="text-4xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-muted-foreground">Here's your daily briefing to get you started.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className={cn(animationDelays[0])}>
            <WeatherCard data={briefingData.weather} />
        </div>
        <div className={cn(animationDelays[1])}>
            <TrafficCard data={briefingData.traffic} alarmTime={alarmTime}/>
        </div>
        <div className={cn("md:col-span-2", animationDelays[2])}>
            <NewsCard data={briefingData.news} />
        </div>
        <div className={cn("lg:col-span-3", animationDelays[3])}>
            <QuoteCard data={quote} />
        </div>
      </div>
      
      <div className="text-center flex items-center justify-center gap-4 animate-fade-in-up-delay-4">
        <Button variant="outline" onClick={handleReset}>
          Reset App
        </Button>
      </div>
    </div>
  );
}

export function MorningBriefingSkeleton() {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Weather Card Skeleton */}
                <Card className="card-glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-1/3" />
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-12 w-2/3" />
                        <Skeleton className="h-5 w-full mt-2" />
                    </CardContent>
                </Card>

                {/* Traffic Card Skeleton */}
                <Card className="card-glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-1/2" />
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-5 w-full mt-2" />
                        <Skeleton className="h-4 w-1/3 mt-1" />
                    </CardContent>
                </Card>

                {/* News Card Skeleton */}
                <Card className="md:col-span-2 card-glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-1/4" />
                        <Newspaper className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-5 w-full" />
                    </CardContent>
                </Card>

                {/* Quote Card Skeleton */}
                <Card className="lg:col-span-3 card-glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-1/5" />
                        <Quote className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-1/4 ml-auto mt-2" />
                    </CardContent>
                </Card>
            </div>
             <div className="text-center flex items-center justify-center gap-4">
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    );
}
