"use client";

import { useState } from 'react';
import Image from 'next/image';
import { AlarmSetup } from '@/components/alarm-setup';
import { MorningBriefing } from '@/components/morning-briefing';
import { getBriefingData, getMotivationalQuote } from '@/lib/actions';
import type { AlarmSettings, BriefingData, MotivationalQuote } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import placeholderImages from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';

export default function SunriseNavigator() {
  const [alarmSettings, setAlarmSettings] = useState<Omit<AlarmSettings, 'musicQuery'> | null>(null);
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null);
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  
  const { toast } = useToast();
  const backgroundImage = placeholderImages.placeholderImages[0];

  const handleSetAlarm = (settings: Omit<AlarmSettings, 'musicQuery'>) => {
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

    try {
      const [briefing, motd] = await Promise.all([
        getBriefingData(alarmSettings.home, alarmSettings.destination),
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
        description: 'Could not fetch all morning briefing data. Please try again.',
      });
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
  };
  
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
          "transition-opacity duration-500",
          isAlarmRinging ? 'opacity-100' : 'opacity-0 invisible absolute',
          'w-full'
        )}
      >
        {isAlarmRinging && briefingData && quote && (
          <MorningBriefing
            briefingData={briefingData}
            quote={quote}
            alarmTime={alarmSettings?.time ?? ''}
            onReset={handleReset}
          />
        )}
      </div>

      <div
        className={cn(
          "transition-opacity duration-500",
          !isAlarmRinging ? 'opacity-100' : 'opacity-0 invisible',
          'flex justify-center items-center w-full'
        )}
      >
        {!isAlarmRinging && (
          <AlarmSetup
            onSetAlarm={handleSetAlarm}
            onCancelAlarm={handleCancelAlarm}
            onSimulateAlarm={handleSimulateAlarm}
            isAlarmSet={isAlarmSet}
            alarmTime={alarmSettings?.time ?? null}
            isSimulating={isSimulating}
          />
        )}
      </div>
    </div>
  );
}
