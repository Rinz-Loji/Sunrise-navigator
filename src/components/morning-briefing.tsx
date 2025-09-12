"use client";

import type { BriefingData, MotivationalQuote } from '@/lib/types';
import {
  Cloudy,
  Thermometer,
  Wind,
  Car,
  Clock,
  CalendarDays,
  Newspaper,
  Quote,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InfoCard } from './info-card';
import { AlarmSound } from './alarm-sound';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface MorningBriefingProps {
  briefingData: BriefingData;
  quote: MotivationalQuote;
  alarmTime: string | null;
  onReset: () => void;
}

const WeatherCard = ({ data }: { data: BriefingData['weather'] }) => (
  <InfoCard title={data.location} icon={MapPin}>
    <div className="text-4xl font-bold">{data.temperature}°</div>
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <Cloudy className="h-4 w-4" />
        <span>{data.condition}</span>
      </div>
      <div className="flex items-center gap-1">
        <Wind className="h-4 w-4" />
        <span>12 km/h</span>
      </div>
    </div>
  </InfoCard>
);

const TrafficCard = ({ data }: { data: BriefingData['traffic'] }) => (
  <InfoCard title="Your Commute" icon={Car}>
    <div className="text-2xl font-bold">{data.commuteTime} mins</div>
    <p className="text-xs text-muted-foreground">
      {data.delay > 0 ? `+${data.delay} min delay` : 'No significant delay'} to {data.destination}
    </p>
  </InfoCard>
);

const CalendarCard = ({ data }: { data: BriefingData['calendar'] }) => (
  <InfoCard title="First Event" icon={CalendarDays}>
    <div className="text-2xl font-bold">{data.time}</div>
    <p className="text-xs text-muted-foreground truncate">{data.title}</p>
  </InfoCard>
);

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
    <Card className="md:col-span-2 bg-card/80 backdrop-blur-sm">
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
  onReset,
}: MorningBriefingProps) {
  const greeting = `Good morning! It's ${alarmTime}.`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <AlarmSound />
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-muted-foreground">Here's your daily briefing to get you started.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <WeatherCard data={briefingData.weather} />
        <TrafficCard data={briefingData.traffic} />
        <CalendarCard data={briefingData.calendar} />
        <div className="lg:col-span-2 grid gap-4">
            <NewsCard data={briefingData.news} />
            <QuoteCard data={quote} />
        </div>
      </div>
      
      <div className="text-center">
        <Button variant="outline" onClick={onReset}>
          End Briefing & Start Day
        </Button>
      </div>
    </div>
  );
}
