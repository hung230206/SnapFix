import { Incident, IncidentEvent, IncidentStatus, Severity, Observation, ObservationEvidence } from "../domain/models";
import { 
  DemoIncidentRepository, 
  DemoIncidentEventRepository,
  DemoIssueTypeRepository,
  DemoObservationRepository,
  DemoObservationEvidenceRepository
} from "../lib/repositories/DemoRepositories";

const incidentRepo = new DemoIncidentRepository();
const eventRepo = new DemoIncidentEventRepository();
const issueTypeRepo = new DemoIssueTypeRepository();
const obsRepo = new DemoObservationRepository();
const evidenceRepo = new DemoObservationEvidenceRepository();

export class IncidentService {
  async getAllIncidents(): Promise<Incident[]> {
    return incidentRepo.findAll();
  }

  async getIncident(id: string): Promise<Incident | null> {
    return incidentRepo.findById(id);
  }

  async updateStatus(incidentId: string, newStatus: IncidentStatus, actorId?: string, note?: string) {
    const incident = await incidentRepo.findById(incidentId);
    if (!incident) throw new Error("Incident not found");

    const oldStatus = incident.status;
    incident.status = newStatus;
    incident.updatedAt = new Date().toISOString();
    
    if (newStatus === "RESOLVED") incident.resolvedAt = new Date().toISOString();
    if (newStatus === "CLOSED") incident.closedAt = new Date().toISOString();

    await incidentRepo.save(incident);

    const event: IncidentEvent = {
      id: Math.random().toString(36).substring(7),
      incidentId,
      actorId,
      type: "STATUS_CHANGED",
      oldStatus,
      newStatus,
      note,
      createdAt: new Date().toISOString()
    };
    await eventRepo.save(event);
  }

  async assignOfficer(incidentId: string, departmentId: string, officerId: string, actorId?: string) {
    const incident = await incidentRepo.findById(incidentId);
    if (!incident) throw new Error("Incident not found");

    const oldStatus = incident.status;
    incident.assignedDepartmentId = departmentId;
    incident.assignedOfficerId = officerId;
    incident.status = "ASSIGNED";
    incident.updatedAt = new Date().toISOString();

    await incidentRepo.save(incident);

    const event: IncidentEvent = {
      id: Math.random().toString(36).substring(7),
      incidentId,
      actorId,
      type: "ASSIGNED",
      oldStatus,
      newStatus: "ASSIGNED",
      createdAt: new Date().toISOString()
    };
    await eventRepo.save(event);
  }

  async getEvents(incidentId: string): Promise<IncidentEvent[]> {
    return eventRepo.findByIncidentId(incidentId);
  }

  async getObservationsAndEvidence(incidentId: string): Promise<{ obs: Observation, evidence: ObservationEvidence | null }[]> {
    const observations = await obsRepo.findByIncidentId(incidentId);
    const result = [];
    for (const obs of observations) {
      let evidence = null;
      if (obs.evidenceId) {
        evidence = await evidenceRepo.findById(obs.evidenceId);
      }
      result.push({ obs, evidence });
    }
    return result;
  }
}

export const incidentService = new IncidentService();
