"use client";

import { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import * as ttServices from '@tomtom-international/web-sdk-services';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface MapInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY!;

export function MapInput({ value = '', onChange, placeholder, id }: MapInputProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<tt.Map | null>(null);
  const marker = useRef<tt.Marker | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!map.current && mapElement.current) {
      map.current = tt.map({
        key: apiKey,
        container: mapElement.current,
        center: [0, 0],
        zoom: 1,
        style: 'tomtom://vector/1/night',
      });
      map.current.addControl(new tt.NavigationControl());
    }
  }, []);

  const updateMap = (lngLat: tt.LngLatLike, address: string) => {
    if (map.current) {
        map.current.flyTo({ center: lngLat, zoom: 15 });
        if (marker.current) {
            marker.current.setLngLat(lngLat);
        } else {
            marker.current = new tt.Marker({ draggable: true })
                .setLngLat(lngLat)
                .addTo(map.current);
            
            marker.current.on('dragend', () => {
                if(marker.current) {
                    const lngLat = marker.current.getLngLat();
                     ttServices.services.reverseGeocode({
                        key: apiKey,
                        position: lngLat,
                    }).then(response => {
                        const newAddress = response.addresses[0].address.freeformAddress;
                        setInputValue(newAddress);
                        onChange(newAddress);
                    })
                }
            })
        }
    }
    setInputValue(address);
    onChange(address);
  }

  useEffect(() => {
    if (searchBoxRef.current) {
        const searchBox = new ttServices.SearchBox(ttServices.services, {
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
    
        searchBoxRef.current.appendChild(searchBox.getSearchBoxHTML());
        searchBox.on('tomtom.searchbox.resultselected', (event) => {
            const result = event.data.result;
            const lngLat = result.position;
            const address = result.address.freeformAddress;
            updateMap(lngLat, address);
            searchBox.getSearchBoxInput().value = address;
        });

        searchBox.getSearchBoxInput().addEventListener('focus', () => setIsFocused(true));
        searchBox.getSearchBoxInput().addEventListener('blur', () => setIsFocused(false));
        searchBox.getSearchBoxInput().addEventListener('input', (e) => {
             const target = e.target as HTMLInputElement;
             setInputValue(target.value);
             onChange(target.value);
        });

        if (value) {
            searchBox.getSearchBoxInput().value = value;
        }

        return () => {
             if (searchBoxRef.current) {
                searchBox.getSearchBoxHTML().remove();
             }
        }
    }
  }, [placeholder, onChange, value]);


  return (
    <div className="space-y-2 relative" id={id}>
      <div ref={searchBoxRef} />
      <div ref={mapElement} className="map-container" />
    </div>
  );
}
