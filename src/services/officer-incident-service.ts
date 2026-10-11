import type {
  Incident,
  IncidentEvent,
  IncidentStatus,
  Observation,
  ObservationEvidence,
} from "@/domain/models";
import {
  officerIncidentEventRepository,
  officerIncidentRepository,
  officerIssueTypeRepository,
  officerObservationEvidenceRepository,
  officerObservationRepository,
} from "@/lib/repositories/officer-repositories";

export class OfficerIncidentService {
  async getAllIncidents(): Promise<Incident[]> {
    return officerIncidentRepository.findAll();
  }

  async getIncident(id: string): Promise<Incident | null> {
    return officerIncidentRepository.findById(id);
  }

  async getIssueTypeName(code: string): Promise<string> {
    return (await officerIssueTypeRepository.findByCode(code))?.nameVi ?? code;
  }

  async updateStatus(
    incidentId: string,
    newStatus: IncidentStatus,
    actorId?: string,
    note?: string,
  ): Promise<void> {
    const incident = await officerIncidentRepository.findById(incidentId);
    if (!incident) throw new Error("Incident not found");

    const oldStatus = incident.status;
    const now = new Date().toISOString();
    const updatedIncident: Incident = {
      ...incident,
      status: newStatus,
      updatedAt: now,
      resolvedAt: newStatus === "RESOLVED" ? now : incident.resolvedAt,
      closedAt: newStatus === "CLOSED" ? now : incident.closedAt,
    };

    await officerIncidentRepository.save(updatedIncident);
    await officerIncidentEventRepository.save({
      id: `evt-${incidentId}-${Date.now()}`,
      incidentId,
      actorId,
      type: "STATUS_CHANGED",
      oldStatus,
      newStatus,
      note,
      createdAt: now,
    });
  }

  async getEvents(incidentId: string): Promise<IncidentEvent[]> {
    return officerIncidentEventRepository.findByIncidentId(incidentId);
  }

  async getObservationsAndEvidence(
    incidentId: string,
  ): Promise<
    { obs: Observation; evidence: ObservationEvidence | null }[]
  > {
    const observations =
      await officerObservationRepository.findByIncidentId(incidentId);

    return Promise.all(
      observations.map(async (obs) => ({
        obs,
        evidence: obs.evidenceId
          ? await officerObservationEvidenceRepository.findById(obs.evidenceId)
          : null,
      })),
    );
  }
}

export const officerIncidentService = new OfficerIncidentService();
