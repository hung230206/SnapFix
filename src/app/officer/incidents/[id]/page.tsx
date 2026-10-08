import { notFound } from "next/navigation";

import { IncidentDetailView } from "@/components/officer/incidents/IncidentDetailView";
import { officerIncidentAssignmentService } from "@/services/officer-incident-assignment-service";
import { officerIncidentDetailService } from "@/services/officer-incident-detail-service";

export default async function OfficerIncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [incident, assignmentOptions] = await Promise.all([
    officerIncidentDetailService.getIncidentDetail(id),
    officerIncidentAssignmentService.getAssignmentOptions(),
  ]);

  if (!incident) {
    notFound();
  }

  return <IncidentDetailView incident={incident} assignmentOptions={assignmentOptions} />;
}
