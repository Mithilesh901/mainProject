"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDispatchStore } from '@/hooks/use-dispatch-store';
import { MockMap } from '@/components/map/mock-map';
import { Activity, AlertTriangle, Truck, Bed, User, Map as MapIcon, Clock, Hospital as HospitalIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DispatcherView({ store }: { store: ReturnType<typeof useDispatchStore> }) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const activeRequests = store.requests.filter(r => r.status !== 'Completed');
  const selectedRequest = store.requests.find(r => r.id === selectedRequestId);

  const markers = [
    ...store.requests.filter(r => r.status !== 'Completed').map(r => ({
      type: 'emergency' as const,
      lat: r.citizenLocation.lat,
      lng: r.citizenLocation.lng,
      label: r.emergencyType
    })),
    ...store.ambulances.map(a => ({
      type: 'ambulance' as const,
      lat: a.currentLocation.lat,
      lng: a.currentLocation.lng,
      label: a.vehicleNumber
    })),
    ...store.hospitals.map(h => ({
      type: 'hospital' as const,
      lat: h.location.lat,
      lng: h.location.lng,
      label: h.name
    }))
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* Sidebar: Requests List */}
      <div className="xl:col-span-4 space-y-6">
        <Card className="h-[calc(100vh-200px)] flex flex-col border-2 rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                Live Hyderabad Feeds
              </CardTitle>
              <Badge variant="secondary" className="font-black px-3">{activeRequests.length} ALERTS</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {activeRequests.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-3">
                <MapIcon className="w-12 h-12 opacity-10" />
                <p className="font-bold">No active emergencies reported.</p>
              </div>
            ) : (
              <div className="divide-y-2">
                {activeRequests.map(req => (
                  <div 
                    key={req.id} 
                    className={cn(
                      "p-6 cursor-pointer hover:bg-primary/5 transition-all border-l-8",
                      selectedRequestId === req.id ? "bg-primary/10 border-l-primary" : "border-l-transparent",
                      req.severity === 'Critical' && "border-l-red-600",
                      req.severity === 'High' && "border-l-orange-500",
                      req.severity === 'Medium' && "border-l-yellow-500"
                    )}
                    onClick={() => setSelectedRequestId(req.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-lg tracking-tight leading-none">{req.emergencyType}</span>
                      <Badge className={cn(
                        "font-black text-[10px]",
                        req.severity === 'Critical' && "bg-red-600",
                        req.severity === 'High' && "bg-orange-500",
                        req.severity === 'Medium' && "bg-yellow-500",
                        req.severity === 'Low' && "bg-green-500"
                      )}>
                        {req.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest">
                      <Clock className="w-3 h-3 text-primary" />
                      {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs font-black text-primary">
                        <Truck className="w-3.5 h-3.5" />
                        {req.assignedAmbulanceId ? 'UNIT DEPLOYED' : 'PENDING UNIT'}
                      </div>
                      <Badge variant="outline" className="text-[9px] font-black border-primary/20">{req.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Panel: Map & Details */}
      <div className="xl:col-span-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-3xl shadow-xl overflow-hidden border-2">
            <CardHeader className="pb-2 bg-muted/10 border-b">
              <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-widest">
                <MapIcon className="w-5 h-5 text-primary" />
                Hyderabad Sector Map
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <MockMap markers={markers} />
            </CardContent>
          </Card>

          <Card className="flex flex-col rounded-3xl shadow-xl overflow-hidden border-2">
            <CardHeader className="pb-2 bg-muted/10 border-b">
              <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-widest">
                <HospitalIcon className="w-5 h-5 text-secondary" />
                Hospital Load (Live)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              <div className="space-y-4">
                {store.hospitals.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl border-2 bg-muted/5 hover:bg-muted/10 transition-colors">
                    <div className="space-y-0.5">
                      <p className="text-sm font-black leading-tight">{h.name}</p>
                      <div className="flex gap-1.5">
                        {h.traumaAvailable && <Badge className="bg-red-500 text-[8px] font-black px-1">TRAUMA</Badge>}
                        {h.cardiologyAvailable && <Badge className="bg-primary text-[8px] font-black px-1">CARDIAC</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary leading-none">{h.availableICU}</p>
                      <p className="text-[9px] uppercase font-black text-muted-foreground mt-1">Free Beds</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Request Management */}
        {selectedRequest && (
          <Card className="border-4 border-primary rounded-3xl shadow-2xl animate-in slide-in-from-top-6 duration-500 overflow-hidden">
            <CardHeader className="bg-primary pb-4">
              <CardTitle className="flex justify-between items-center text-white">
                <span className="font-black text-xl">MANAGE INCIDENT: {selectedRequest.id}</span>
                <Badge className="bg-white text-primary font-black px-4">{selectedRequest.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground tracking-widest uppercase flex items-center gap-2 border-b pb-1">
                    <AlertTriangle className="w-4 h-4 text-destructive" /> INCIDENT REPORT
                  </h4>
                  <div className="space-y-1">
                    <p className="font-black text-2xl leading-none">{selectedRequest.emergencyType}</p>
                    <p className="text-sm font-bold">Severity: <span className="text-red-600">{selectedRequest.severity}</span></p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-2">GRID: {selectedRequest.citizenLocation.lat.toFixed(4)}, {selectedRequest.citizenLocation.lng.toFixed(4)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground tracking-widest uppercase flex items-center gap-2 border-b pb-1">
                    <Truck className="w-4 h-4 text-primary" /> FLEET ASSIGNMENT
                  </h4>
                  {selectedRequest.assignedAmbulanceId ? (
                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-2xl border-2">
                        <p className="font-black text-lg">{store.ambulances.find(a => a.id === selectedRequest.assignedAmbulanceId)?.vehicleNumber}</p>
                        <p className="text-xs text-muted-foreground font-bold">{store.ambulances.find(a => a.id === selectedRequest.assignedAmbulanceId)?.driverName}</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full rounded-xl font-black border-2" onClick={() => store.assignAmbulance(selectedRequest.id)}>Re-assign Unit</Button>
                    </div>
                  ) : (
                    <Button className="w-full h-16 bg-red-600 rounded-2xl font-black text-lg shadow-xl" onClick={() => store.assignAmbulance(selectedRequest.id)}>DEPLOY NEAREST UNIT</Button>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground tracking-widest uppercase flex items-center gap-2 border-b pb-1">
                    <HospitalIcon className="w-4 h-4 text-secondary" /> FACILITY STATUS
                  </h4>
                  <div className="space-y-2">
                    <p className="font-black text-lg leading-tight">{store.hospitals.find(h => h.id === selectedRequest.assignedHospitalId)?.name || 'UNROUTED'}</p>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Clock className="w-4 h-4 text-secondary" />
                      ETA: {selectedRequest.eta} mins
                    </div>
                    <div className="mt-4">
                      {selectedRequest.hospitalDecision === 'Accepted' && <Badge className="bg-green-600 w-full py-2 justify-center font-black rounded-lg">FACILITY: READY</Badge>}
                      {selectedRequest.hospitalDecision === 'Rejected' && <Badge className="bg-destructive w-full py-2 justify-center font-black rounded-lg">FACILITY: DIVERTED</Badge>}
                      {selectedRequest.hospitalDecision === 'Pending' && <Badge variant="outline" className="w-full py-2 justify-center font-black rounded-lg border-2">FACILITY: AWAITING</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
