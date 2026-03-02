
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Activity, Hospital, Ambulance as AmbIcon, LocateFixed } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface MarkerProps {
  type: 'emergency' | 'ambulance' | 'hospital';
  lat: number;
  lng: number;
  label?: string;
  status?: string;
}

export function MockMap({ markers }: { markers: MarkerProps[] }) {
  // Center coordinates for Hyderabad, India
  const center = { lat: 17.3850, lng: 78.4867 };
  
  // Find the localized map image from centralized placeholder data
  const mapData = PlaceHolderImages.find(img => img.id === 'hyderabad-map');

  const getPosition = (lat: number, lng: number) => {
    // Zoom factor for city-level view
    const zoom = 1200;
    const x = ((lng - center.lng) * zoom + 50);
    const y = (50 - (lat - center.lat) * zoom);
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <Card className="relative w-full h-[500px] overflow-hidden bg-muted border-2 border-primary/20 shadow-xl rounded-3xl">
      {/* Map Background */}
      <div className="absolute inset-0">
        <Image 
          src={mapData?.imageUrl || "https://picsum.photos/seed/hyderabad-map/1200/800"} 
          alt="Hyderabad Operations Map" 
          fill 
          className="object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
          data-ai-hint={mapData?.imageHint || "hyderabad map"}
        />
      </div>
      
      {/* Markers */}
      <div className="relative w-full h-full p-4">
        {markers.map((marker, i) => {
          const pos = getPosition(marker.lat, marker.lng);
          return (
            <div 
              key={i} 
              className="absolute transition-all duration-1000 ease-in-out -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className={cn(
                "p-2 rounded-full shadow-lg border-2 animate-in fade-in zoom-in",
                marker.type === 'emergency' && "bg-destructive border-white scale-125",
                marker.type === 'ambulance' && "bg-primary border-white scale-110",
                marker.type === 'hospital' && "bg-secondary border-white"
              )}>
                {marker.type === 'emergency' && <Activity className="w-5 h-5 text-white animate-pulse" />}
                {marker.type === 'ambulance' && <AmbIcon className="w-4 h-4 text-white" />}
                {marker.type === 'hospital' && <Hospital className="w-4 h-4 text-white" />}
              </div>
              
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/90 border px-2 py-0.5 rounded text-[10px] font-black shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {marker.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Overlay */}
      <div className="absolute top-4 left-4 bg-background/80 p-3 rounded-xl text-[10px] shadow-lg border backdrop-blur-sm z-20">
        <div className="flex items-center gap-2 font-black border-b mb-2 pb-1 uppercase tracking-widest text-primary">
          <LocateFixed className="w-3 h-3" />
          Fleet Monitor
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> <span>Emergency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" /> <span>Ambulance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary" /> <span>Hospital</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
