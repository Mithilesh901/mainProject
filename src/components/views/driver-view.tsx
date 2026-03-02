"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDispatchStore, RequestStatus } from '@/hooks/use-dispatch-store';
import { MockMap } from '@/components/map/mock-map';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  HeartPulse, 
  ClipboardList, 
  Send, 
  Settings, 
  User, 
  Plus, 
  Hospital as HospitalIcon,
  Activity as ActivityIcon
} from 'lucide-react';
import { getPatientConditionSummary } from '@/ai/flows/patient-condition-summary-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function DriverView({ store }: { store: ReturnType<typeof useDispatchStore> }) {
  const [activeAmbulanceId, setActiveAmbulanceId] = useState<string>(store.ambulances[0]?.id);
  const [driverNotes, setDriverNotes] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const myAmbulance = store.ambulances.find(a => a.id === activeAmbulanceId);
  const myRequest = store.requests.find(r => r.assignedAmbulanceId === activeAmbulanceId && r.status !== 'Completed');
  const myHospital = myRequest ? store.hospitals.find(h => h.id === myRequest.assignedHospitalId) : null;

  const handleStatusUpdate = (status: RequestStatus) => {
    if (myRequest) {
      store.updateRequestStatus(myRequest.id, status);
    }
  };

  const handleUpdateCondition = async () => {
    if (!myRequest || !driverNotes) return;
    setIsSummarizing(true);
    try {
      const result = await getPatientConditionSummary({ driverNotes });
      store.updatePatientCondition(myRequest.id, result.summary);
      setDriverNotes('');
    } catch (error) {
      console.error("Failed to update patient condition:", error);
      store.updatePatientCondition(myRequest.id, driverNotes.substring(0, 150) + '...');
      setDriverNotes('');
    } finally {
      setIsSummarizing(false);
    }
  };

  const markers = [
    ...(myRequest ? [{ type: 'emergency' as const, lat: myRequest.citizenLocation.lat, lng: myRequest.citizenLocation.lng, label: 'CASUALTY' }] : []),
    ...(myAmbulance ? [{ type: 'ambulance' as const, lat: myAmbulance.currentLocation.lat, lng: myAmbulance.currentLocation.lng, label: 'YOUR UNIT' }] : []),
    ...(myHospital ? [{ type: 'hospital' as const, lat: myHospital.location.lat, lng: myHospital.location.lng, label: 'TARGET MEDICAL CENTER' }] : [])
  ];

  return (
    <Tabs defaultValue="operations" className="w-full max-w-7xl mx-auto py-6">
      <TabsList className="grid w-full grid-cols-2 mb-10 bg-muted/30 p-2 rounded-2xl h-16">
        <TabsTrigger value="operations" className="rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Active Operations</TabsTrigger>
        <TabsTrigger value="admin" className="rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Fleet Terminal</TabsTrigger>
      </TabsList>

      <TabsContent value="operations" className="space-y-8 animate-in slide-in-from-left-6 duration-700">
        {!myRequest ? (
          <Card className="border-4 border-dashed border-primary/20 bg-primary/5 py-32 text-center rounded-[3rem] shadow-inner">
            <CardContent className="space-y-8">
              <div className="bg-green-500/10 w-28 h-28 rounded-full flex items-center justify-center mx-auto shadow-inner ring-[12px] ring-green-500/5">
                <Truck className="w-14 h-14 text-green-600 animate-pulse" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black tracking-tight uppercase">Fleet Status: Ready</h2>
                <p className="text-muted-foreground text-xl font-medium">Unit <strong>{myAmbulance?.vehicleNumber}</strong> is cleared for deployment in the Indian sector.</p>
              </div>
              <div className="flex flex-col items-center gap-8">
                <Badge variant="outline" className="px-10 py-3 border-primary/30 bg-white text-primary font-black text-lg rounded-full shadow-sm">Pilot: {myAmbulance?.driverName}</Badge>
                <div className="space-y-4 w-full max-w-lg">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-2">Operator Identity Management</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {store.ambulances.map(a => (
                      <Button 
                        key={a.id} 
                        size="lg" 
                        variant={activeAmbulanceId === a.id ? "default" : "outline"}
                        onClick={() => setActiveAmbulanceId(a.id)}
                        className="rounded-2xl px-6 font-black border-2"
                      >
                        {a.vehicleNumber}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Tactical Tracking */}
            <div className="lg:col-span-8 space-y-10">
              <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-t-[12px] border-destructive rounded-[2.5rem] overflow-hidden border-x-2 border-b-2">
                <CardHeader className="bg-destructive/5 border-b-2 py-8 px-10">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <CardTitle className="text-4xl font-black flex items-center gap-5 uppercase tracking-tighter">
                      <div className="bg-destructive p-3 rounded-2xl shadow-lg shadow-destructive/30">
                        <HeartPulse className="w-10 h-10 text-white" />
                      </div>
                      {myRequest.emergencyType} Mission
                    </CardTitle>
                    <Badge className="bg-destructive text-white px-8 py-2 text-md font-black shadow-xl rounded-full uppercase tracking-widest border-2 border-white/20">Critical Alert</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-10 px-10 pb-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground border-b pb-2">Active Tactical Grid</h4>
                    <MockMap markers={markers} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                    <div className="p-8 bg-muted/20 rounded-[2rem] flex items-center gap-6 border-2 shadow-inner group hover:bg-muted/30 transition-all">
                      <div className="bg-primary/10 p-4 rounded-2xl border-2 border-primary/10">
                        <MapPin className="text-primary w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Target Coordinates</p>
                        <p className="text-xl font-black leading-tight">Emergency Origin</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1 opacity-60">LOC: {myRequest.citizenLocation.lat.toFixed(5)}, {myRequest.citizenLocation.lng.toFixed(5)}</p>
                      </div>
                    </div>
                    <div className="p-8 bg-muted/20 rounded-[2rem] flex items-center gap-6 border-2 shadow-inner group hover:bg-muted/30 transition-all">
                      <div className="bg-secondary/10 p-4 rounded-2xl border-2 border-secondary/10">
                        <HospitalIcon className="text-secondary w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Medical Node</p>
                        <p className="text-xl font-black leading-tight">{myHospital?.name}</p>
                        <p className="text-xs text-muted-foreground font-semibold mt-1 opacity-60 truncate max-w-[180px]">{myHospital?.address}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] shadow-2xl overflow-hidden border-2">
                <CardHeader className="bg-muted/10 border-b-2 py-6 px-10">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight">
                    <ClipboardList className="w-8 h-8 text-primary" />
                    Field Medical Report (AI Enhanced)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-10 px-10 pb-10">
                  <div className="bg-primary/5 p-8 rounded-[2rem] border-2 border-primary/20 text-sm shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <ActivityIcon className="w-20 h-20" />
                    </div>
                    <strong className="text-primary uppercase tracking-[0.3em] text-[10px] block mb-4 font-black">Live Patient Context</strong> 
                    <p className="text-2xl leading-tight font-black italic text-primary/80">"{myRequest.patientCondition || 'Waiting for field vitals sync...'}"</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] px-2">Update Casualty Status / Vitals</p>
                    <Textarea 
                      placeholder="Input patient vitals, observed symptoms, or immediate intervention details..." 
                      className="min-h-[160px] rounded-[2rem] border-2 focus-visible:ring-primary shadow-inner text-xl p-8 leading-relaxed font-medium"
                      value={driverNotes}
                      onChange={(e) => setDriverNotes(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full h-20 rounded-[2rem] gap-4 text-2xl font-black shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all active:translate-y-2 uppercase tracking-widest" 
                    disabled={isSummarizing || !driverNotes}
                    onClick={handleUpdateCondition}
                  >
                    <Send className="w-8 h-8" />
                    {isSummarizing ? 'AI Processing Data...' : 'Broadcast to Facility'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right: Mission Control HUD */}
            <div className="lg:col-span-4">
              <Card className="sticky top-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.25)] overflow-hidden border-2">
                <CardHeader className="bg-primary/10 border-b-2 py-8">
                  <CardTitle className="font-black text-2xl uppercase tracking-tighter text-primary">Tactical Status</CardTitle>
                  <CardDescription className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest mt-1">Broadcast mission updates to Dispatch</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-8 px-8 pb-10">
                  {[
                    { status: 'Assigned' as RequestStatus, label: 'ALARM ACKNOWLEDGED', color: 'bg-primary' },
                    { status: 'En Route' as RequestStatus, label: 'SIRENS ACTIVE: EN ROUTE', color: 'bg-primary' },
                    { status: 'Picked Up' as RequestStatus, label: 'CASUALTY ON BOARD', color: 'bg-primary' },
                    { status: 'Arrived' as RequestStatus, label: 'ARRIVING AT NODE', color: 'bg-primary' },
                    { status: 'Completed' as RequestStatus, label: 'MISSION CONCLUDED', color: 'bg-green-600' },
                  ].map((btn) => (
                    <Button
                      key={btn.status}
                      variant={myRequest.status === btn.status ? "default" : "outline"}
                      className={cn(
                        "w-full h-24 text-sm font-black flex flex-col items-center justify-center transition-all border-2 rounded-[1.5rem] uppercase tracking-[0.1em] leading-tight px-6",
                        myRequest.status === btn.status && cn(btn.color, "text-white border-transparent ring-[10px] ring-offset-4 ring-primary/10 scale-[1.03] shadow-2xl"),
                        myRequest.status !== btn.status && "hover:border-primary/60 hover:bg-primary/5 hover:scale-[1.01]"
                      )}
                      onClick={() => handleStatusUpdate(btn.status)}
                    >
                      <span className="text-md">{btn.label}</span>
                      <span className="text-[9px] opacity-60 mt-2 font-black uppercase tracking-widest">Update HQ</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="admin" className="animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card className="rounded-[2.5rem] shadow-2xl overflow-hidden border-2">
            <CardHeader className="bg-primary/5 border-b-2 py-8">
              <CardTitle className="flex items-center gap-4 font-black text-2xl uppercase tracking-tight">
                <Settings className="w-8 h-8 text-primary" />
                Indian Active Fleet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-10 px-10 pb-10">
              {store.ambulances.map(amb => (
                <div key={amb.id} className="flex items-center justify-between p-6 border-2 rounded-[1.5rem] bg-muted/20 hover:bg-muted/30 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="bg-primary/10 p-4 rounded-2xl border-2 border-primary/10 group-hover:scale-110 transition-transform">
                      <Truck className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-2xl leading-none uppercase">{amb.vehicleNumber}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-2">{amb.driverName}</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "px-5 py-2 font-black text-[10px] uppercase border-2",
                    amb.status === 'AVAILABLE' ? 'bg-green-600 border-white/10' : 'bg-primary border-white/10'
                  )}>
                    {amb.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] shadow-2xl overflow-hidden border-2">
            <CardHeader className="bg-primary/5 border-b-2 py-8">
              <CardTitle className="flex items-center gap-4 font-black text-2xl uppercase tracking-tight">
                <Plus className="w-8 h-8 text-primary" />
                Register New Unit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-10 px-10 pb-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground px-2">Vehicle ID (TS Plate)</label>
                <Input placeholder="TS-XX-XX-XXXX" id="new-amb-id" className="h-16 rounded-2xl border-2 text-xl font-bold px-6 shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground px-2">Lead Pilot Assignment</label>
                <Input placeholder="Enter Pilot's Legal Name" id="new-driver-name" className="h-16 rounded-2xl border-2 text-xl font-bold px-6 shadow-inner" />
              </div>
              <Button className="w-full h-20 rounded-[1.5rem] bg-primary text-2xl font-black shadow-xl hover:shadow-2xl transition-all active:translate-y-2 uppercase tracking-widest" onClick={() => {
                const vid = (document.getElementById('new-amb-id') as HTMLInputElement)?.value;
                const dname = (document.getElementById('new-driver-name') as HTMLInputElement)?.value;
                if (vid && dname) {
                  store.addAmbulance({ vehicleNumber: vid, driverName: dname, equipment: ['oxygen'] });
                  (document.getElementById('new-amb-id') as HTMLInputElement).value = '';
                  (document.getElementById('new-driver-name') as HTMLInputElement).value = '';
                }
              }}>
                Finalize Unit Registration
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
