"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { addMinutes, format, parse } from 'date-fns';
import { AlarmSetup } from '@/components/alarm-setup';
import { MorningBriefing, MorningBriefingSkeleton } from '@/components/morning-briefing';
import { getBriefingData, getMotivationalQuote, getTrafficInfo } from '@/lib/actions';
import type { AlarmSettings, BriefingData, MotivationalQuote, TrafficData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import placeholderImages from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, ArrowRight, TrafficCone, Sunrise } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

function TrafficCheckScreen({ originalTime, trafficData }: { originalTime: string, trafficData: TrafficData | null }) {
  const newTime = trafficData && trafficData.delay > 0
    ? format(addMinutes(parse(originalTime, 'HH:mm', new Date()), -trafficData.delay), 'HH:mm')
    : originalTime;

  return (
    <Card className="w-full max-w-md text-center card-glass">
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
  const [appView, setAppView] = useState<'setup' | 'checkingTraffic' | 'briefing' | 'loadingBriefing'>('setup');
  const [alarmSettings, setAlarmSettings] = useState<AlarmSettings | null>(null);
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null);
  const [adjustedAlarmTime, setAdjustedAlarmTime] = useState<string | null>(null);
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { toast } = useToast();
  const backgroundImage = placeholderImages.placeholderImages.find(img => img.id === 'sunrise-bg');

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
    setAppView('checkingTraffic');
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
      setAppView('loadingBriefing');
      
      // 3. Fetch the rest of the data
      const [briefing, motd] = await Promise.all([
        getBriefingData(alarmSettings.home, alarmSettings.destination, alarmSettings.weatherLocation, traffic),
        getMotivationalQuote('morning productivity'),
      ]);
      
      setBriefingData(briefing);
      setQuote(motd);
      
      setAppView('briefing');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch morning briefing data. Please try again.',
      });
      setAppView('setup');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setAppView('setup');
    setIsAlarmSet(false);
    setBriefingData(null);
    setQuote(null);
    setAlarmSettings(null);
    setAdjustedAlarmTime(null);
    setTrafficData(null);
    setView('welcome');
  };
  
  const alarmDisplayTime = adjustedAlarmTime || alarmSettings?.time || '';

  const renderContent = () => {
     if (!isMounted) {
      return null;
    }
    
    if (view === 'welcome') {
      return (
        <div key="welcome" className="animate-fade-in">
            <Card className="w-full max-w-xl text-center card-glass">
                <CardHeader className="items-center p-8">
                    <Sunrise className="h-32 w-32 text-primary" />
                    <p className="text-sm font-medium text-primary tracking-widest uppercase mt-4">
                        World's best smart alarm clock
                    </p>
                    <CardTitle className="text-4xl font-bold mt-2">Sunrise Navigator</CardTitle>
                    <CardDescription className="text-lg">No ordinary alarms anymore!</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Everything you need in a smart alarm, from live weather and traffic updates to your daily dose of motivation.</p>
                </CardContent>
                <CardFooter className="flex justify-center p-8">
                    <Button onClick={() => setView('app')} className="btn-gradient px-8 py-6 text-lg">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
      );
    }

    if (view === 'app') {
        switch(appView) {
            case 'briefing':
                return briefingData && quote && alarmSettings ? (
                    <div key="briefing" className="animate-fade-in w-full">
                        <MorningBriefing
                        briefingData={briefingData}
                        quote={quote}
                        alarmTime={alarmDisplayTime}
                        alarmSoundUrl={alarmSettings.sound}
                        onReset={handleReset}
                        />
                    </div>
                ) : null;
            case 'loadingBriefing':
                return <div key="loading" className="w-full"><MorningBriefingSkeleton /></div>;
            case 'checkingTraffic':
                return alarmSettings ? <div key="traffic" className="animate-fade-in"><TrafficCheckScreen originalTime={alarmSettings.time} trafficData={trafficData}/></div> : null;
            case 'setup':
            default:
                return (
                    <div key="setup" className="animate-fade-in w-full max-w-2xl">
                        <AlarmSetup
                            onSetAlarm={handleSetAlarm}
                            onCancelAlarm={handleCancelAlarm}
                            onSimulateAlarm={handleSimulateAlarm}
                            isAlarmSet={isAlarmSet}
                            alarmTime={alarmSettings?.time ?? null}
                            isSimulating={isSimulating}
                        />
                    </div>
                )
        }
    }
  }

  if (!backgroundImage) {
    return <div>Error: Background image not found.</div>;
  }

  return (
    <div className="relative w-full max-w-4xl p-4 min-h-[480px] flex items-center justify-center">
       <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
       </div>
       <Image
          src={backgroundImage.imageUrl}
          alt={backgroundImage.description}
          fill
          className="object-cover -z-10 rounded-2xl"
          data-ai-hint={backgroundImage.imageHint}
        />
      <div className="flex justify-center items-center w-full">
        {renderContent()}
      </div>
    </div>
  );
}
