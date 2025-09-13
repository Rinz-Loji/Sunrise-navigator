"use client";

import { useState } from 'react';
import Image from 'next/image';
import { addMinutes, format, parse } from 'date-fns';
import { AlarmSetup } from '@/components/alarm-setup';
import { MorningBriefing } from '@/components/morning-briefing';
import { getBriefingData, getMotivationalQuote, getTrafficInfo } from '@/lib/actions';
import type { AlarmSettings, BriefingData, MotivationalQuote, TrafficData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import placeholderImages from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, ArrowRight, TrafficCone, Sunrise } from 'lucide-react';

function TrafficCheckScreen({ originalTime, trafficData }: { originalTime: string, trafficData: TrafficData | null }) {
  const newTime = trafficData && trafficData.delay > 0
    ? format(addMinutes(parse(originalTime, 'HH:mm', new Date()), -trafficData.delay), 'HH:mm')
    : originalTime;

  return (
    <Card className="w-full max-w-md shadow-lg text-center">
      <CardHeader>
        <div className="flex justify-center">
            {trafficData ? <TrafficCone className="h-12 w-12 text-primary" /> : <Loader2 className="h-12 w-12 text-primary animate-spin" />}
        </div>
        <CardTitle>{trafficData ? 'Traffic Analyzed' : 'Checking Traffic...'}</CardTitle>
        <CardDescription>
          {trafficData ? 'We\'ve adjusted your alarm based on the current commute.' : 'Checking the route one hour before your alarm...'}
        </CardDescription>
      </CardHeader>
      {trafficData && (
        <CardContent>
            <div className="flex items-center justify-center gap-4 text-2xl font-bold">
                <span className={cn("text-muted-foreground", trafficData.delay > 0 && "line-through")}>{originalTime}</span>
                {trafficData.delay > 0 && <ArrowRight />}
                <span className="text-primary">{newTime}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
                {trafficData.delay > 0 ? `Heavy traffic is adding ${trafficData.delay} minutes to your commute.` : 'Traffic looks clear!'}
            </p>
        </CardContent>
      )}
    </Card>
  )
}


export default function SunriseNavigator() {
  const [view, setView] = useState<'welcome' | 'app'>('welcome');
  const [alarmSettings, setAlarmSettings] = useState<AlarmSettings | null>(null);
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [isCheckingTraffic, setIsCheckingTraffic] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null);
  const [adjustedAlarmTime, setAdjustedAlarmTime] = useState<string | null>(null);
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  
  const { toast } = useToast();
  const backgroundImage = placeholderImages.placeholderImages[0];

  const handleSetAlarm = (settings: AlarmSettings) => {
    setAlarmSettings(settings);
    setIsAlarmSet(true);
    toast({
      title: 'Alarm Set!',
      description: `Your alarm is scheduled for ${settings.time}.`,
    });
  };

  const handleCancelAlarm = () => {
    setAlarmSettings(null);
    setIsAlarmSet(false);
    toast({
      title: 'Alarm Cancelled',
      description: 'Your morning alarm has been turned off.',
    });
  };

  const handleSimulateAlarm = async () => {
    if (!alarmSettings) return;
    setIsSimulating(true);
    setIsCheckingTraffic(true);
    setTrafficData(null);

    try {
      // 1. Check traffic first
      const traffic = await getTrafficInfo({
        origin: alarmSettings.home,
        destination: alarmSettings.destination,
      });
      setTrafficData(traffic);

      // 2. Calculate new alarm time
      const newAlarmTime = traffic.delay > 0
        ? format(addMinutes(parse(alarmSettings.time, 'HH:mm', new Date()), -traffic.delay), 'HH:mm')
        : alarmSettings.time;
      setAdjustedAlarmTime(newAlarmTime);

      // Wait a moment on the traffic screen
      await new Promise(resolve => setTimeout(resolve, 4000));
      setIsCheckingTraffic(false);
      
      // 3. Fetch the rest of the data
      const [briefing, motd] = await Promise.all([
        getBriefingData(alarmSettings.home, alarmSettings.destination, alarmSettings.weatherLocation, traffic),
        getMotivationalQuote('morning productivity'),
      ]);
      
      setBriefingData(briefing);
      setQuote(motd);
      
      setIsAlarmRinging(true);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch morning briefing data. Please try again.',
      });
      setIsCheckingTraffic(false);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setIsAlarmRinging(false);
    setIsAlarmSet(false);
    setBriefingData(null);
    setQuote(null);
    setAlarmSettings(null);
    setAdjustedAlarmTime(null);
    setIsCheckingTraffic(false);
    setTrafficData(null);
    setView('welcome');
  };
  
  const alarmDisplayTime = adjustedAlarmTime || alarmSettings?.time || '';

  const renderContent = () => {
    if (view === 'welcome') {
      return (
        <Card className="w-full max-w-md shadow-lg text-center">
            <CardHeader className="items-center">
                <Sunrise className="h-12 w-12 text-primary" />
                <CardTitle className="text-2xl font-bold">Welcome to Sunrise Navigator</CardTitle>
                <CardDescription>Your smart morning assistant.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Get personalized briefings with live traffic, weather, news, and a dose of motivation to start your day right.</p>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button onClick={() => setView('app')}>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
      );
    }

    if (isAlarmRinging) {
      return briefingData && quote && alarmSettings ? (
        <MorningBriefing
          briefingData={briefingData}
          quote={quote}
          alarmTime={alarmDisplayTime}
          alarmSoundUrl={alarmSettings.alarmSound}
          onReset={handleReset}
        />
      ) : null;
    }
    if (isCheckingTraffic && alarmSettings) {
        return <TrafficCheckScreen originalTime={alarmSettings.time} trafficData={trafficData}/>
    }
    return (
      <AlarmSetup
        onSetAlarm={handleSetAlarm}
        onCancelAlarm={handleCancelAlarm}
        onSimulateAlarm={handleSimulateAlarm}
        isAlarmSet={isAlarmSet}
        alarmTime={alarmSettings?.time ?? null}
        isSimulating={isSimulating}
      />
    );
  }

  return (
    <div className="relative w-full max-w-4xl p-4">
      {isAlarmRinging && backgroundImage && (
        <Image
          src={backgroundImage.imageUrl}
          alt={backgroundImage.description}
          fill
          className="object-cover -z-10 rounded-2xl opacity-30"
          data-ai-hint={backgroundImage.imageHint}
        />
      )}
      <div
        className={cn(
          'flex justify-center items-center w-full transition-opacity duration-500',
           (isAlarmRinging || isCheckingTraffic) ? 'opacity-100' : 'opacity-100',
        )}
      >
        {renderContent()}
      </div>
    </div>
  );
}
