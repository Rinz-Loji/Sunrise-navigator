"use client";

import { useEffect, useRef, useState } from 'react';
import ttServices from '@tomtom-international/web-sdk-services';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle } from 'lucide-react';

interface MapInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

export function MapInput({ value = '', onChange, placeholder, id }: MapInputProps) {
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(value);

  const updateValue = (address: string) => {
    setInputValue(address);
    onChange(address);
  }

  useEffect(() => {
    if (!apiKey) return;
    if (searchBoxRef.current) {
        const searchBox = new ttServices.SearchBox(ttServices, {
            searchOptions: {
                key: apiKey,
                language: 'en-GB',
                limit: 5
            },
            autocompleteOptions: {
                key: apiKey,
                language: 'en-GB'
            },
            labels: {
                placeholder: placeholder || 'Search for a location'
            },
        });
    
        const inputElement = searchBox.getSearchBoxHTML();
        searchBoxRef.current.appendChild(inputElement);

        searchBox.on('tomtom.searchbox.resultselected', (event) => {
            const result = event.data.result;
            const address = result.address.freeformAddress;
            updateValue(address);
            searchBox.getSearchBoxInput().value = address;
        });

        const searchInput = searchBox.getSearchBoxInput();

        searchInput.addEventListener('input', (e) => {
             const target = e.target as HTMLInputElement;
             setInputValue(target.value);
             onChange(target.value);
        });

        if (value) {
            searchInput.value = value;
        }

        return () => {
             if (searchBoxRef.current && searchBoxRef.current.contains(inputElement)) {
                searchBoxRef.current.removeChild(inputElement);
             }
        }
    }
  }, [placeholder, onChange, value]);

  if (!apiKey) {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
                The TomTom API key is missing. Please add it to your environment variables to use the map feature.
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="relative" id={id}>
      <div ref={searchBoxRef} />
    </div>
  );
}
