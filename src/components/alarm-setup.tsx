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
import {
  AlarmClock,
  Loader2,
  BellRing,
  Music,
  MapPin,
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { validateAddress as validateAddressAction } from '@/lib/actions';
import { useState } from 'react';

interface AlarmSetupProps {
  onSetAlarm: (settings: AlarmSettings) => void;
  onCancelAlarm: () => void;
  onSimulateAlarm: () => void;
  isAlarmSet: boolean;
  alarmTime: string | null;
  isSimulating: boolean;
}

const alarmSounds = [
  { name: 'Classic Alarm', url: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
  { name: 'Digital Clock', url: 'https://actions.google.com/sounds/v1/alarms/digital_clock.ogg' },
  { name: 'Bugle Call', url: 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg' },
  { name: 'Pleasant Bell', url: 'https://actions.google.com/sounds/v1/alarms/medium_bell_ringing_near.ogg' },
  { name: 'Gentle Wake-up', url: 'https://actions.google.com/sounds/v1/alarms/gentle_soft_ring.ogg' },
];

const alarmSchema = z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  home: z.string().min(3, 'Home location is required'),
  destination: z.string().min(3, 'Destination is required'),
  alarmSound: z.string().url('Please select an alarm sound'),
  weatherLocation: z.string().min(3, 'Weather location is required'),
});

export function AlarmSetup({
  onSetAlarm,
  onCancelAlarm,
  onSimulateAlarm,
  isAlarmSet,
  alarmTime,
  isSimulating,
}: AlarmSetupProps) {
  const form = useForm<AlarmSettings>({
    resolver: zodResolver(alarmSchema),
    defaultValues: {
      time: '07:00',
      home: '1600 Amphitheatre Parkway, Mountain View, CA',
      destination: '1 Market St, San Francisco, CA',
      alarmSound: alarmSounds[0].url,
      weatherLocation: 'San Francisco, CA',
    },
  });

  const [isvalidatingHome, setIsValidatingHome] = useState(false);
  const [isValidatingDestination, setIsValidatingDestination] = useState(false);

  const handleAddressValidation = async (
    field: 'home' | 'destination',
    value: string
  ) => {
    if (field === 'home') setIsValidatingHome(true);
    if (field === 'destination') setIsValidatingDestination(true);

    const result = await validateAddressAction({ address: value });
    if (!result.isValid) {
      form.setError(field, {
        type: 'manual',
        message: 'Please enter a valid address.',
      });
    } else {
        if(result.formattedAddress){
            form.setValue(field, result.formattedAddress, { shouldValidate: true });
        }
    }

    if (field === 'home') setIsValidatingHome(false);
    if (field === 'destination') setIsValidatingDestination(false);
  };


  if (isAlarmSet) {
    return (
      <Card className="w-full max-w-md card-glass">
        <CardHeader className="items-center text-center">
          <AlarmClock className="h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">Your Current Alarm</CardTitle>
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
            className="w-full btn-gradient"
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
    <Card className="w-full max-w-2xl card-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <AlarmClock className="h-8 w-8" />
          Set Your Smart Alarm
        </CardTitle>
        <CardDescription>
          Enter your details for a personalized morning.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSetAlarm)}>
          <CardContent className="space-y-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-3">
                        <AlarmClock className="h-6 w-6" />
                        Wake-up Time
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="weatherLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-3">
                        <MapPin className="h-6 w-6" />
                        Weather Location
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., London, UK" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
            </div>
            <FormField
              control={form.control}
              name="home"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-3">
                    <MapPin className="h-6 w-6" />
                    Home Address
                    {isvalidatingHome && <Loader2 className="h-4 w-4 animate-spin" />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your home address"
                      {...field}
                      onBlur={() => handleAddressValidation('home', field.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-3">
                    <MapPin className="h-6 w-6" />
                    Work/School Address
                     {isValidatingDestination && <Loader2 className="h-4 w-4 animate-spin" />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your work/school address"
                      {...field}
                      onBlur={() => handleAddressValidation('destination', field.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                  control={form.control}
                  name="alarmSound"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-3">
                        <Music className="h-6 w-6" />
                        Alarm Sound
                      </FormLabel>
                       <Select onValuechange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an alarm sound" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {alarmSounds.map(sound => (
                            <SelectItem key={sound.url} value={sound.url}>
                              {sound.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full btn-gradient">
              Set Alarm
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
