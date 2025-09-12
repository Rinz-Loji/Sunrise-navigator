"use client";

import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle } from 'lucide-react';

interface MapInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

// Declare the TomTom services object as it will be available on the window object
declare global {
  interface Window {
    tt: any;
    ttServices: any;
  }
}

export function MapInput({ value = '', onChange, placeholder, id }: MapInputProps) {
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  
  useEffect(() => {
    // Function to load the script
    const loadScript = (src: string, onLoad: () => void) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = onLoad;
      document.body.appendChild(script);
      return script;
    };
    
    // Check if the SDK is already loaded
    if (window.ttServices) {
       setIsSdkLoaded(true);
    } else {
        // Load the services SDK
        loadScript('https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/services/services-web.min.js', () => {
            setIsSdkLoaded(true);
        });
    }

  }, []);

  useEffect(() => {
    if (!apiKey || !isSdkLoaded || !searchBoxRef.current) return;
    
    const ttServices = window.ttServices;
    
    // Clear the container in case of re-renders
    if (searchBoxRef.current) {
        searchBoxRef.current.innerHTML = '';
    }

    try {
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

        searchBox.on('tomtom.searchbox.resultselected', (event: any) => {
            const result = event.data.result;
            const address = result.address.freeformAddress;
            onChange(address);
            searchBox.getSearchBoxInput().value = address;
        });

        const searchInput = searchBox.getSearchBoxInput();

        searchInput.addEventListener('input', (e: Event) => {
             const target = e.target as HTMLInputElement;
             onChange(target.value);
        });

        if (value) {
            searchInput.value = value;
        }

        return () => {
             if (searchBoxRef.current && searchBoxRef.current.contains(inputElement)) {
                // searchBox.remove() is the correct cleanup method
                searchBox.remove();
             }
        }
    } catch(error) {
        console.error("Failed to initialize TomTom SearchBox:", error);
    }

  }, [isSdkLoaded, placeholder, onChange, value]);

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
