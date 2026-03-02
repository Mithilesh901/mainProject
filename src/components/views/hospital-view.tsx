"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useDispatchStore } from '@/hooks/use-dispatch-store';
import { Hospital as HospitalIcon, Bed, Activity, Clock, Navigation, CheckCircle2, XCircle, TrendingUp, Truck } from 'lucide-react';

export function HospitalView({ store }: { store: ReturnType<typeof useDispatchStore> }) {
  const [activeHospitalId, setActiveHospitalId] = useState<string>(store.hospitals[0]?.id);
  
  const myHospital = store.hospitals.find(h => h.id === activeHospitalId);
  const incomingRequests = store.requests.filter(r => r.assignedHospitalId === activeHospitalId && r.status !== 'Completed');

  const updateBeds = (count: number) => {
    if (myHospital) {
      store.updateHospitalBeds(myHospital.id, count);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-700">
      {/* Header Stat Cards */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase">ICU Availability</p>
              <h3 className="text-3xl font-black text-primary">{myHospital?.availableICU} / {myHospital?.totalICU}</h3>
            </div>
            <Bed className="w-10 h-10 text-primary opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-destructive/5">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase">Incoming Patients</p>
              <h3 className="text-3xl font-black text-destructive">{incomingRequests.length}</h3>
            </div>
            <Activity className="w-10 h-10 text-destructive opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-secondary/5">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase">Avg. Intake Time</p>
              <h3 className="text-3xl font-black text-secondary">4.2 min</h3>
            </div>
            <TrendingUp className="w-10 h-10 text-secondary opacity-20" />
          </CardContent>
        </Card>
      </div>

      {/* Resource Management */}
      <div className="lg:col-span-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Center</CardTitle>
            <CardDescription>Update live facility status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Available ICU Beds</span>
                <Badge variant="outline">{myHospital?.availableICU} Active</Badge>
              </div>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={myHospital?.availableICU} 
                  onChange={(e) => updateBeds(parseInt(e.target.value) || 0)}
                  className="w-full text-lg font-bold"
                />
                <div className="flex flex-col gap-1">
                  <Button variant="secondary" size="icon" className="h-6 w-10" onClick={() => updateBeds((myHospital?.availableICU || 0) + 1)}>+</Button>
                  <Button variant="outline" size="icon" className="h-6 w-10" onClick={() => updateBeds(Math.max(0, (myHospital?.availableICU || 0) - 1))}>-</Button>
                </div>
              </div>
              <Progress value={((myHospital?.availableICU || 0) / (myHospital?.totalICU || 1)) * 100} className="h-2" />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className={myHospital?.traumaAvailable ? "bg-green-600" : "bg-muted"}>Trauma Care</Badge>
                <Badge className={myHospital?.cardiologyAvailable ? "bg-green-600" : "bg-muted"}>Cardiology</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Navigation className="w-4 h-4 text-primary" />
              <span>{myHospital?.address}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <HospitalIcon className="w-4 h-4 text-primary" />
              <span>Contact: {myHospital?.contactNumber}</span>
            </div>
            <div className="pt-4 space-y-2">
              <p className="text-xs font-bold text-muted-foreground">SWITCH VIEWING HOSPITAL</p>
              <div className="flex flex-col gap-2">
                {store.hospitals.map(h => (
                  <Button 
                    key={h.id} 
                    variant={activeHospitalId === h.id ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setActiveHospitalId(h.id)}
                    className="justify-start"
                  >
                    {h.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incoming Alerts */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="h-full">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-destructive" />
              Incoming Ambulance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {incomingRequests.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground space-y-2">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 opacity-20" />
                <p>No ambulances currently incoming.</p>
              </div>
            ) : (
              <div className="divide-y">
                {incomingRequests.map(req => {
                  const amb = store.ambulances.find(a => a.id === req.assignedAmbulanceId);
                  return (
                    <div key={req.id} className="p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={req.severity === 'Critical' ? 'bg-red-600' : 'bg-orange-500'}>{req.severity}</Badge>
                            <span className="text-lg font-black">{req.emergencyType} Patient</span>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Truck className="w-3 h-3" />
                            Unit: {amb?.vehicleNumber} ({amb?.driverName})
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-primary flex items-center justify-end gap-2">
                            <Clock className="w-5 h-5" />
                            ETA {req.eta} MIN
                          </div>
                          <Badge variant="outline">{req.status}</Badge>
                        </div>
                      </div>

                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-6">
                        <h4 className="text-xs font-black uppercase text-primary mb-1">Patient Condition Summary</h4>
                        <p className="text-sm italic">"{req.patientCondition || 'Preliminary assessment pending...'}"</p>
                      </div>

                      <div className="flex gap-4">
                        {req.hospitalDecision === 'Pending' ? (
                          <>
                            <Button 
                              className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                              onClick={() => store.setHospitalDecision(req.id, 'Accepted')}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Ready for Reception
                            </Button>
                            <Button 
                              variant="outline" 
                              className="gap-2 text-destructive border-destructive/20"
                              onClick={() => store.setHospitalDecision(req.id, 'Rejected')}
                            >
                              <XCircle className="w-4 h-4" />
                              Reject / Divert
                            </Button>
                          </>
                        ) : (
                          <div className="w-full text-center py-2 bg-muted rounded-lg font-bold">
                            Decision Sent: {req.hospitalDecision}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
