
"use client";

import { useState, useEffect, useCallback } from 'react';
import { INITIAL_AMBULANCES, INITIAL_HOSPITALS } from '@/lib/mock-data';
import { toast } from '@/hooks/use-toast';

export type EmergencyType = 'Accident' | 'Cardiac' | 'Trauma' | 'Gas Leak';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type RequestStatus = 'Requested' | 'Assigned' | 'En Route' | 'Picked Up' | 'Arrived' | 'Completed';
export type HospitalDecision = 'Pending' | 'Accepted' | 'Rejected';

export interface Location {
  lat: number;
  lng: number;
}

export interface EmergencyRequest {
  id: string;
  emergencyType: EmergencyType;
  severity: Severity;
  citizenLocation: Location;
  assignedAmbulanceId?: string;
  assignedHospitalId?: string;
  eta: number; 
  status: RequestStatus;
  timestamp: string;
  patientCondition?: string;
  hospitalDecision: HospitalDecision;
}

export function useDispatchStore() {
  const [hospitals, setHospitals] = useState(INITIAL_HOSPITALS);
  const [ambulances, setAmbulances] = useState(INITIAL_AMBULANCES);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);

  // Simulation Loop: Moves all assigned ambulances to their respective targets
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances(prevAmbs => {
        return prevAmbs.map(amb => {
          if (amb.status === 'ASSIGNED') {
            // Find the request currently handled by this ambulance
            // Need to look at current requests from outer scope or pass it in.
            // Using a functional update for ambulances so we can't easily access requests state
            // unless we store requests in a ref or just accept that it might be slightly behind.
            // In React, this is usually solved by having a single state object if they depend deeply.
            // For now, we'll use the 'requests' captured in closure which is fine for 1s interval.
            const activeReq = requests.find(r => r.assignedAmbulanceId === amb.id && r.status !== 'Completed');
            if (!activeReq) return amb;

            let target: Location | null = null;
            
            // Movement logic: Go to patient first, then to hospital
            if (['Assigned', 'En Route'].includes(activeReq.status)) {
              target = activeReq.citizenLocation;
            } 
            else if (['Picked Up', 'Arrived'].includes(activeReq.status)) {
              const targetHospital = hospitals.find(h => h.id === activeReq.assignedHospitalId);
              if (targetHospital) target = targetHospital.location;
            }

            if (target) {
              const speed = 0.0015; // Simulated travel speed
              const dLat = target.lat - amb.currentLocation.lat;
              const dLng = target.lng - amb.currentLocation.lng;
              const distance = Math.sqrt(dLat * dLat + dLng * dLng);

              if (distance > speed) {
                return {
                  ...amb,
                  currentLocation: {
                    lat: amb.currentLocation.lat + (dLat / distance) * speed,
                    lng: amb.currentLocation.lng + (dLng / distance) * speed,
                  },
                  lastUpdated: new Date().toISOString()
                };
              }
            }
          }
          return amb;
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [requests, hospitals]);

  const assignAmbulance = useCallback((requestId: string) => {
    setAmbulances(prevAmbs => {
      const availableAmb = prevAmbs.find(a => a.status === 'AVAILABLE');
      
      if (!availableAmb) {
        toast({
          variant: "destructive",
          title: "FLEET ALERT",
          description: "Zero units available in Hyderabad central sector. All drivers are busy.",
        });
        return prevAmbs;
      }

      const ambId = availableAmb.id;

      setRequests(prevReqs => {
        return prevReqs.map(r => {
          if (r.id === requestId) {
            const specialty = r.emergencyType === 'Cardiac' ? 'cardiologyAvailable' : 
                              (r.emergencyType === 'Trauma' || r.emergencyType === 'Accident' ? 'traumaAvailable' : null);
            
            const bestHospital = hospitals.find(h => {
              if (specialty) return (h as any)[specialty] && h.availableICU > 0;
              return h.availableICU > 0;
            }) || hospitals[0];

            return {
              ...r,
              assignedAmbulanceId: ambId,
              assignedHospitalId: bestHospital.id,
              status: 'Assigned' as RequestStatus,
              eta: Math.floor(Math.random() * 8) + 4
            };
          }
          return r;
        });
      });

      toast({
        title: "MISSION ACTIVATED",
        description: `Unit ${availableAmb.vehicleNumber} is responding to the alert.`,
      });

      return prevAmbs.map(a => 
        a.id === ambId ? { ...a, status: 'ASSIGNED' as any } : a
      );
    });
  }, [hospitals]);

  const createRequest = useCallback((type: EmergencyType, severity: Severity, location: Location) => {
    const newId = `req-${Date.now()}`;
    const newRequest: EmergencyRequest = {
      id: newId,
      emergencyType: type,
      severity,
      citizenLocation: location,
      eta: 0,
      status: 'Requested',
      timestamp: new Date().toISOString(),
      hospitalDecision: 'Pending'
    };
    
    // Add request and immediately attempt to find an ambulance for it
    setRequests(prev => [newRequest, ...prev]);
    
    // Defer assignment to next tick to ensure setRequests has been processed or 
    // use a more atomic state update pattern if this were a production app.
    // For this prototype, assignAmbulance uses functional updates so it works.
    setTimeout(() => assignAmbulance(newId), 0);

    return newId;
  }, [assignAmbulance]);

  const updateRequestStatus = useCallback((requestId: string, status: RequestStatus) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        if (status === 'Completed') {
          // Free the ambulance when the mission ends
          setAmbulances(prevAmbs => prevAmbs.map(a => 
            a.id === r.assignedAmbulanceId ? { ...a, status: 'AVAILABLE' as any } : a
          ));
        }
        return { ...r, status };
      }
      return r;
    }));
  }, []);

  const cancelRequest = useCallback((requestId: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        if (r.assignedAmbulanceId) {
          setAmbulances(prevAmbs => prevAmbs.map(a => 
            a.id === r.assignedAmbulanceId ? { ...a, status: 'AVAILABLE' as any } : a
          ));
        }
        return { ...r, status: 'Completed' };
      }
      return r;
    }));
  }, []);

  const setHospitalDecision = useCallback((requestId: string, decision: HospitalDecision) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        if (decision === 'Rejected') {
          const alternativeHospital = hospitals.find(h => h.id !== r.assignedHospitalId && h.availableICU > 0) || hospitals[0];
          toast({
            variant: "destructive",
            title: "DIVERSION ORDERED",
            description: `Rerouting to ${alternativeHospital.name} due to facility capacity.`,
          });
          return { 
            ...r, 
            hospitalDecision: decision, 
            assignedHospitalId: alternativeHospital.id, 
            eta: r.eta + 4 
          };
        }
        return { ...r, hospitalDecision: decision };
      }
      return r;
    }));
  }, [hospitals]);

  const updatePatientCondition = useCallback((requestId: string, condition: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, patientCondition: condition } : r
    ));
  }, []);

  const updateHospitalBeds = useCallback((hospitalId: string, availableICU: number) => {
    setHospitals(prev => prev.map(h => 
      h.id === hospitalId ? { ...h, availableICU } : h
    ));
  }, []);

  const addAmbulance = useCallback((data: any) => {
    const hydCenter = { lat: 17.3850, lng: 78.4867 };
    setAmbulances(prev => [...prev, {
      ...data,
      id: `a-${Date.now()}`,
      status: 'AVAILABLE',
      currentLocation: { 
        lat: hydCenter.lat + (Math.random() - 0.5) * 0.1, 
        lng: hydCenter.lng + (Math.random() - 0.5) * 0.1 
      },
      lastUpdated: new Date().toISOString()
    }]);
  }, []);

  return {
    hospitals,
    ambulances,
    requests,
    createRequest,
    assignAmbulance,
    updateRequestStatus,
    updatePatientCondition,
    updateHospitalBeds,
    addAmbulance,
    cancelRequest,
    setHospitalDecision
  };
}
