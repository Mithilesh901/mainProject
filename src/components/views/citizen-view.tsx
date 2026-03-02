"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PhoneCall, Navigation, Clock, Activity as ActivityIcon, Hospital as HospitalIcon, AlertCircle } from 'lucide-react';
import { MockMap } from '@/components/map/mock-map';
import { EmergencyType, RequestStatus, useDispatchStore } from '@/hooks/use-dispatch-store';
import { emergencyDescriptionAnalysis } from '@/ai/flows/emergency-description-analysis';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function CitizenView({ store }: { store: ReturnType<typeof useDispatchStore> }) {
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const activeRequest = store.requests.find(r => r.id === activeRequestId);
  const assignedAmbulance = activeRequest?.assignedAmbulanceId 
    ? store.ambulances.find(a => a.id === activeRequest.assignedAmbulanceId)
    : null;
  const assignedHospital = activeRequest?.assignedHospitalId
    ? store.hospitals.find(h => h.id === activeRequest.assignedHospitalId)
    : null;

  const handleRequest = async (type: EmergencyType) => {
    setIsAnalyzing(true);
    const hydCenter = { lat: 17.3850, lng: 78.4867 };
    
    try {
      const analysis = await emergencyDescriptionAnalysis({ 
        description: `Emergency request for ${type} in Hyderabad sector.` 
      });
      
      const id = store.createRequest(type, analysis.severity, { 
        lat: hydCenter.lat + (Math.random() - 0.5) * 0.05, 
        lng: hydCenter.lng + (Math.random() - 0.5) * 0.05 
      });
      setActiveRequestId(id);
    } catch (error) {
      console.warn("AI Analysis failed, falling back to manual severity", error);
      const id = store.createRequest(type, 'High', { 
        lat: hydCenter.lat + (Math.random() - 0.5) * 0.05, 
        lng: hydCenter.lng + (Math.random() - 0.5) * 0.05 
      });
      setActiveRequestId(id);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const statusMap: Record<RequestStatus, number> = {
    'Requested': 15,
    'Assigned': 35,
    'En Route': 55,
    'Picked Up': 75,
    'Arrived': 95,
    'Completed': 100
  };

  const markers = [
    ...(activeRequest ? [{ type: 'emergency' as const, lat: activeRequest.citizenLocation.lat, lng: activeRequest.citizenLocation.lng, label: 'YOUR LOCATION' }] : []),
    ...(assignedAmbulance ? [{ type: 'ambulance' as const, lat: assignedAmbulance.currentLocation.lat, lng: assignedAmbulance.currentLocation.lng, label: assignedAmbulance.vehicleNumber }] : []),
    ...(assignedHospital ? [{ type: 'hospital' as const, lat: assignedHospital.location.lat, lng: assignedHospital.location.lng, label: assignedHospital.name }] : [])
  ];

  if (activeRequest && activeRequest.status !== 'Completed') {
    return (
      <div className="space-y-6 animate-in fade-in duration-700 max-w-4xl mx-auto">
        {!activeRequest.assignedAmbulanceId && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Searching for available unit...</AlertTitle>
            <AlertDescription>
              Dispatching the nearest first responder. Please stay on the line.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-t-8 border-primary overflow-hidden shadow-2xl">
          <CardHeader className="bg-muted/30">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black">{activeRequest.emergencyType} Response</CardTitle>
                <CardDescription>Request ID: {activeRequest.id}</CardDescription>
              </div>
              <Badge variant={activeRequest.severity === 'Critical' ? 'destructive' : 'default'} className="px-4 py-1">
                {activeRequest.severity} SEVERITY
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                <span>Operation Progress</span>
                <span className="text-primary">{activeRequest.status}</span>
              </div>
              <Progress value={statusMap[activeRequest.status]} className="h-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-2xl flex items-center gap-4 border shadow-sm">
                <Navigation className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Ambulance</p>
                  <p className="font-bold">{assignedAmbulance ? assignedAmbulance.vehicleNumber : 'Assigning Unit...'}</p>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-2xl flex items-center gap-4 border shadow-sm">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Est. Arrival</p>
                  <p className="font-bold">{activeRequest.eta ? `${activeRequest.eta} min` : 'Calculating...'}</p>
                </div>
              </div>
            </div>

            <MockMap markers={markers} />

            {assignedHospital && (
              <div className="bg-primary/5 p-6 rounded-2xl flex items-center gap-4 border border-primary/20">
                <HospitalIcon className="w-10 h-10 text-primary" />
                <div className="flex-1">
                  <p className="font-black">Routing to: {assignedHospital.name}</p>
                  <p className="text-sm text-muted-foreground">{assignedHospital.address}</p>
                  {activeRequest.hospitalDecision !== 'Pending' && (
                    <Badge className="mt-2 bg-green-600">Facility Alert: {activeRequest.hospitalDecision}</Badge>
                  )}
                </div>
              </div>
            )}

            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/5 font-bold" onClick={() => store.cancelRequest(activeRequest.id)}>
              CANCEL EMERGENCY REQUEST
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black text-primary tracking-tighter uppercase">Indian Emergency</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">Instantly notify the central dispatch fleet and hospitals in your sector.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { type: 'Accident' as const, icon: <ActivityIcon className="w-10 h-10" />, color: 'bg-red-500', label: 'ACCIDENT' },
          { type: 'Cardiac' as const, icon: <ActivityIcon className="w-10 h-10" />, color: 'bg-orange-500', label: 'CARDIAC' },
          { type: 'Trauma' as const, icon: <ActivityIcon className="w-10 h-10" />, color: 'bg-rose-600', label: 'TRAUMA' },
          { type: 'Gas Leak' as const, icon: <ActivityIcon className="w-10 h-10" />, color: 'bg-amber-500', label: 'GAS LEAK' },
        ].map((item) => (
          <Button
            key={item.type}
            disabled={isAnalyzing}
            onClick={() => handleRequest(item.type)}
            className={cn(
              "h-auto flex-col gap-4 p-10 emergency-btn text-white transition-all hover:scale-105 border-b-8 active:border-b-0",
              item.color,
              "border-black/20 rounded-3xl"
            )}
          >
            <div className="p-4 bg-white/20 rounded-full">
              {item.icon}
            </div>
            <span className="text-2xl font-black tracking-tight">{item.label}</span>
          </Button>
        ))}
      </div>

      <Card className="border-4 border-dashed border-primary/20 rounded-3xl overflow-hidden bg-primary/5">
        <CardContent className="p-12 text-center space-y-6">
          <PhoneCall className="w-12 h-12 text-primary mx-auto animate-bounce" />
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-primary">Voice Assistance</h2>
            <p className="text-muted-foreground font-bold">If data is unavailable, call 108 immediately.</p>
          </div>
          <Button size="lg" className="rounded-full px-12 py-8 text-2xl font-black shadow-xl hover:shadow-primary/20 transition-all uppercase tracking-widest">
            CALL 108 NOW
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
