"use client";

import type { AlarmSettings } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlarmClock,
  Home,
  MapPin,
  Briefcase,
  Loader2,
  BellRing,
} from 'lucide-react';

interface AlarmSetupProps {
  onSetAlarm: (settings: AlarmSettings) => void;
  onCancelAlarm: () => void;
  onSimulateAlarm: () => void;
  isAlarmSet: boolean;
  alarmTime: string | null;
  isSimulating: boolean;
}

const alarmSchema = z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  home: z.string().min(3, 'Home location is required'),
  destination: z.string().min(3, 'Destination is required'),
});

export function AlarmSetup({
  onSetAlarm,
  onCancelAlarm,
  onSimulateAlarm,
  isAlarmSet,
  alarmTime,
  isSimulating,
}: AlarmSetupProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AlarmSettings>({
    resolver: zodResolver(alarmSchema),
    defaultValues: {
      time: '07:00',
      home: '123 Main St, Anytown',
      destination: '456 Office Ave, Workville',
    },
  });

  if (isAlarmSet) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <AlarmClock className="h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">Alarm is Set</CardTitle>
          <CardDescription className="text-lg">
            Wake-up time: <span className="font-semibold text-primary">{alarmTime}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            In a real app, the alarm would trigger automatically. For this demo, you can simulate it now.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            onClick={onSimulateAlarm}
            className="w-full"
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing Briefing...
              </>
            ) : (
              <>
                <BellRing className="mr-2 h-4 w-4" />
                Simulate Alarm Now
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onCancelAlarm}
            className="w-full"
            disabled={isSimulating}
          >
            Cancel Alarm
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <AlarmClock className="h-6 w-6" />
          Set Your Smart Alarm
        </CardTitle>
        <CardDescription>
          Enter your details for a personalized morning.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSetAlarm)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <AlarmClock className="h-4 w-4" />
              Wake-up Time
            </Label>
            <Input id="time" type="time" {...register('time')} />
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="home" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home Address
            </Label>
            <Input
              id="home"
              placeholder="e.g., 123 Main St, Anytown"
              {...register('home')}
            />
            {errors.home && (
              <p className="text-sm text-destructive">{errors.home.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Work/School Address
            </Label>
            <Input
              id="destination"
              placeholder="e.g., 456 Office Ave, Workville"
              {...register('destination')}
            />
            {errors.destination && (
              <p className="text-sm text-destructive">{errors.destination.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Set Alarm
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
