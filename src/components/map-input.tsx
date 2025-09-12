"use client";

import { Input } from './ui/input';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle } from 'lucide-react';

interface MapInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

export function MapInput({ value, onChange, placeholder, id }: MapInputProps) {
  if (!apiKey) {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
                The TomTom API key is missing. Please add it to your environment variables to use the address validation feature.
            </AlertDescription>
        </Alert>
    )
  }
  
  // In a future step, we could add onBlur validation here
  // to call a server action that validates the address.
  return (
    <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
    />
  );
}
