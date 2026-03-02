"use client";

import React, { useState } from 'react';
import { useDispatchStore } from '@/hooks/use-dispatch-store';
import { CitizenView } from '@/components/views/citizen-view';
import { DispatcherView } from '@/components/views/dispatcher-view';
import { DriverView } from '@/components/views/driver-view';
import { HospitalView } from '@/components/views/hospital-view';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, LayoutDashboard, Truck, Hospital, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AidFlowApp() {
  const store = useDispatchStore();
  const [activeTab, setActiveTab] = useState('citizen');

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-primary">AIDFLOW <span className="text-foreground">DISPATCH</span></span>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:flex">
            <TabsList className="bg-muted p-1">
              <TabsTrigger value="citizen" className="data-[state=active]:bg-background">
                <User className="w-4 h-4 mr-2" /> Citizen
              </TabsTrigger>
              <TabsTrigger value="dispatcher" className="data-[state=active]:bg-background">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dispatcher
              </TabsTrigger>
              <TabsTrigger value="driver" className="data-[state=active]:bg-background">
                <Truck className="w-4 h-4 mr-2" /> Driver
              </TabsTrigger>
              <TabsTrigger value="hospital" className="data-[state=active]:bg-background">
                <Hospital className="w-4 h-4 mr-2" /> Hospital
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden lg:flex gap-2 py-1 px-3 border-primary/20 bg-primary/5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Server Sync
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {activeTab === 'citizen' && <CitizenView store={store} />}
        {activeTab === 'dispatcher' && <DispatcherView store={store} />}
        {activeTab === 'driver' && <DriverView store={store} />}
        {activeTab === 'hospital' && <HospitalView store={store} />}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur p-2 grid grid-cols-4 gap-2 z-50">
        {[
          { id: 'citizen', icon: <User className="w-5 h-5" />, label: 'Citizen' },
          { id: 'dispatcher', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dispatch' },
          { id: 'driver', icon: <Truck className="w-5 h-5" />, label: 'Driver' },
          { id: 'hospital', icon: <Hospital className="w-5 h-5" />, label: 'Hosp.' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
              activeTab === item.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {item.icon}
            <span className="text-[10px] font-bold mt-1 uppercase">{item.label}</span>
          </button>
        ))}
      </div>

      <footer className="hidden md:block py-6 border-t bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AidFlow Dispatch System. No Login Mode Active.
        </div>
      </footer>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
