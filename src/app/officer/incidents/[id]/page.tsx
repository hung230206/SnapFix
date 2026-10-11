import { notFound } from "next/navigation";

import { OfficerIncidentDetailView } from "@/components/officer/incidents/OfficerIncidentDetailView";
import { officerIncidentService } from "@/services/officer-incident-service";

export const dynamic = "force-dynamic";

export default async function OfficerIncidentDetailPage({
  params,
}: PageProps<"/officer/incidents/[id]">) {
  const { id } = await params;
  const incident = await officerIncidentService.getIncident(id);

  if (!incident) notFound();

  const [events, observations, issueName] = await Promise.all([
    officerIncidentService.getEvents(id),
    officerIncidentService.getObservationsAndEvidence(id),
    officerIncidentService.getIssueTypeName(incident.issueTypeCode),
  ]);

  return (
    <OfficerIncidentDetailView
      incident={incident}
      events={events}
      observations={observations}
      issueName={issueName}
    />
  );
}
