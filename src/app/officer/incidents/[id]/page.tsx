import { notFound } from "next/navigation";

import { IncidentDetailView } from "@/components/officer/incidents/IncidentDetailView";
import { officerIncidentDetailService } from "@/services/officer-incident-detail-service";

export default async function OfficerIncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = await officerIncidentDetailService.getIncidentDetail(id);

  if (!incident) {
    notFound();
  }

  return <IncidentDetailView incident={incident} />;
}
