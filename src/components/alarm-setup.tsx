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
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { validateAddress as validateAddressAction } from '@/lib/actions';
import { useState, useRef } from 'react';

interface AlarmSetupProps {
  onSetAlarm: (settings: AlarmSettings) => void;
  onCancelAlarm: () => void;
  onSimulateAlarm: () => void;
  isAlarmSet: boolean;
  alarmTime: string | null;
  isSimulating: boolean;
  alarmSoundName?: string;
}

const defaultSounds = [
  { name: 'Classic Alarm', url: 'https://cdn.pixabay.com/audio/2022/02/21/audio_1b2d23c104.mp3' },
  { name: 'Digital Clock', url: 'https://cdn.pixabay.com/audio/2023/04/18/audio_2731df14c5.mp3' },
  { name: 'Sci-Fi Alarm', url: 'https://cdn.pixabay.com/audio/2022/10/18/audio_a758d62559.mp3' },
  { name: 'Pleasant Bell', url: 'https://cdn.pixabay.com/audio/2022/05-27/audio_8342f02636.mp3' },
  { name: 'Gentle Wake-up', url: 'https://cdn.pixabay.com/audio/2022/06-08/audio_14545d96a8.mp3' },
  { name: 'Bird Ambience', url: 'https://cdn.pixabay.com/audio/2023/10/04/audio_359302e7c5.mp3' },
  { name: 'Forest Sounds', url: 'https://cdn.pixabay.com/audio/2024/02/23/audio_34444342a3.mp3' },
  { name: 'Ocean Waves', url: 'https://cdn.pixabay.com/audio/2024/01/16/audio_98317374a9.mp3' },
  { name: 'Calm Piano', url: 'https://cdn.pixabay.com/audio/2022/06-03/audio_73b2a26514.mp3' },
  { name: 'Lofi Beat', url: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde648d91.mp3' }
];

const alarmSchema = z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  home: z.string().min(3, 'Home location is required'),
  destination: z.string().min(3, 'Destination is required'),
  alarmSound: z.string().min(1, 'Please select an alarm sound'),
  alarmSoundName: z.string().optional(),
  weatherLocation: z.string().min(3, 'Weather location is required'),
});

export function AlarmSetup({
  onSetAlarm,
  onCancelAlarm,
  onSimulateAlarm,
  isAlarmSet,
  alarmTime,
  isSimulating,
  alarmSoundName,
}: AlarmSetupProps) {
  const form = useForm<AlarmSettings>({
    resolver: zodResolver(alarmSchema),
    defaultValues: {
      time: '07:00',
      home: '1600 Amphitheatre Parkway, Mountain View, CA',
      destination: '1 Market St, San Francisco, CA',
      alarmSound: defaultSounds[0].url,
      alarmSoundName: defaultSounds[0].name,
      weatherLocation: 'San Francisco, CA',
    },
  });

  const [isvalidatingHome, setIsValidatingHome] = useState(false);
  const [isValidatingDestination, setIsValidatingDestination] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);

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

  const handlePreview = () => {
    if (audioPreviewRef.current) {
        if (isPreviewing) {
            audioPreviewRef.current.pause();
            audioPreviewRef.current.currentTime = 0;
            setIsPreviewing(false);
        } else {
            const selectedSoundUrl = form.getValues('alarmSound');
            audioPreviewRef.current.src = selectedSoundUrl;
            audioPreviewRef.current.play();
            setIsPreviewing(true);
        }
    }
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
           {alarmSoundName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <Music className="h-4 w-4" />
              <span>{alarmSoundName}</span>
            </div>
          )}
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
                    <FormItem className="space-y-4">
                        <FormLabel className="flex items-center gap-3">
                            <Music className="h-6 w-6" />
                            Alarm Sound
                        </FormLabel>
                        <div className="flex items-center gap-2">
                            <Select 
                            onValueChange={(value) => {
                                field.onChange(value)
                                const soundName = defaultSounds.find(s => s.url === value)?.name
                                form.setValue('alarmSoundName', soundName)
                                if (isPreviewing) handlePreview();
                            }} 
                            defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an alarm sound" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {defaultSounds.map(sound => (
                                    <SelectItem key={sound.url} value={sound.url}>
                                    {sound.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" size="icon" onClick={handlePreview}>
                                {isPreviewing ? <PauseCircle /> : <PlayCircle />}
                            </Button>
                            <audio ref={audioPreviewRef} onEnded={() => setIsPreviewing(false)} />
                        </div>
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
