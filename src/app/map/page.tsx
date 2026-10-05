"use client";

import { useEffect, useState } from "react";
import { incidentService } from "@/services/incident-service";
import { Incident } from "@/domain/models";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const MapViewer = dynamic(() => import("@/components/map/IncidentMapViewer"), { 
  ssr: false, 
  loading: () => <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-muted"><Loader2 className="animate-spin text-primary" /></div> 
});

export default function MapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    incidentService.getAllIncidents().then(setIncidents);
  }, []);

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="h-16 flex items-center px-4 border-b bg-background z-10 relative shrink-0">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold ml-2">Bản đồ sự cố</h1>
      </div>
      <div className="flex-1 relative z-0">
        <MapViewer incidents={incidents} />
      </div>
    </div>
  );
}
