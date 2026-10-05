import { Observation, ObservationEvidence, Incident, IncidentEvent } from "../domain/models";
import { 
  DemoObservationRepository,
  DemoObservationEvidenceRepository,
  DemoIncidentRepository,
  DemoIncidentEventRepository,
  DemoIssueTypeRepository,
  DemoRoutingRuleRepository
} from "../lib/repositories/DemoRepositories";
import { calculateEvidenceConfidence } from "../domain/confidence";
import { calculatePriority } from "../domain/priority";
import { determineDepartment } from "../domain/routing";
import { findDuplicateCandidate } from "../domain/incident/matching";
import { calculateLocationConsistency } from "../domain/location/consistency";

const obsRepo = new DemoObservationRepository();
const evidenceRepo = new DemoObservationEvidenceRepository();
const incidentRepo = new DemoIncidentRepository();
const eventRepo = new DemoIncidentEventRepository();
const issueTypeRepo = new DemoIssueTypeRepository();
const routingRuleRepo = new DemoRoutingRuleRepository();

type SubmitObservationPayload = Omit<Observation, "id" | "createdAt" | "evidenceId"> & {
  evidencePayload: Omit<ObservationEvidence, "id" | "observationId" | "createdAt" | "locationConsistencyStatus" | "locationDistanceMeters" | "evidenceConfidence" | "evidenceReasonsJson" | "evidenceWarningsJson">;
};

export class ObservationService {
  
  async submitObservation(payload: SubmitObservationPayload): Promise<{ observationId: string, incidentId: string }> {
    const id = "obs_" + Math.random().toString(36).substring(7);
    const createdAt = new Date().toISOString();
    
    // Process Evidence
    const { evidencePayload, ...obsData } = payload;
    const evidenceId = "evd_" + Math.random().toString(36).substring(7);
    
    // 1. Calculate location consistency
    let consistencyResult = calculateLocationConsistency(
      evidencePayload.exifGpsAvailable ? evidencePayload.exifLat : evidencePayload.captureDeviceLat,
      evidencePayload.exifGpsAvailable ? evidencePayload.exifLng : evidencePayload.captureDeviceLng,
      evidencePayload.captureDeviceAccuracyMeters,
      evidencePayload.reportedLat,
      evidencePayload.reportedLng
    );

    if (evidencePayload.locationSource === "MANUAL_PIN" && !evidencePayload.exifGpsAvailable && !evidencePayload.captureDeviceLat) {
      consistencyResult = { status: "INSUFFICIENT_EVIDENCE" };
    }
    
    // 2. Calculate evidence confidence
    const { level: evidenceConfidence, reasons, warnings } = calculateEvidenceConfidence({
      imageSource: evidencePayload.imageSource,
      imageCapturedAt: evidencePayload.imageCapturedAt,
      captureDeviceAccuracyMeters: evidencePayload.captureDeviceAccuracyMeters,
      exifGpsAvailable: evidencePayload.exifGpsAvailable,
      locationConsistencyStatus: consistencyResult.status
    });

    const evidence: ObservationEvidence = {
      ...evidencePayload,
      id: evidenceId,
      observationId: id,
      locationConsistencyStatus: consistencyResult.status,
      locationDistanceMeters: consistencyResult.distanceMeters,
      evidenceConfidence,
      evidenceReasonsJson: JSON.stringify(reasons),
      evidenceWarningsJson: JSON.stringify(warnings),
      createdAt
    };

    const observation: Observation = {
      ...obsData,
      id,
      createdAt,
      evidenceId
    };

    // Check for duplicates
    let targetIncidentId = obsData.incidentId;
    let incident: Incident;

    if (targetIncidentId) {
      // Attach to existing
      const foundIncident = await incidentRepo.findById(targetIncidentId);
      if (!foundIncident) throw new Error("Incident not found");
      incident = foundIncident;
      incident.independentReportCount += 1;
      
      // Recalculate priority
      const { score, level, reasons: priorityReasons } = calculatePriority(incident.baseSeverity, incident.createdAt, incident.independentReportCount);
      incident.priorityScore = score;
      incident.priorityLevel = level;
      incident.priorityReasons = priorityReasons;
      incident.updatedAt = new Date().toISOString();
      
      await incidentRepo.save(incident);
      observation.incidentId = incident.id;
      
      await eventRepo.save({
        id: Math.random().toString(36).substring(7),
        incidentId: incident.id,
        actorId: observation.reporterId,
        type: "OBSERVATION_ADDED",
        createdAt: new Date().toISOString()
      });
      
    } else {
      // Create new incident
      const issueType = await issueTypeRepo.findByCode(obsData.issueTypeCode);
      const baseSeverity = issueType?.defaultSeverity || "LOW";
      
      const { score, level, reasons: priorityReasons } = calculatePriority(baseSeverity, createdAt, 1);
      
      const rules = await routingRuleRepo.findAll();
      const assignedDepartmentId = determineDepartment(rules, obsData.issueTypeCode);
      
      incident = {
        id: "inc_" + Math.random().toString(36).substring(7),
        publicCode: "SF-" + Math.floor(10000 + Math.random() * 90000),
        issueTypeCode: obsData.issueTypeCode,
        centroidLat: obsData.lat,
        centroidLng: obsData.lng,
        status: "NEW",
        baseSeverity,
        priorityScore: score,
        priorityLevel: level,
        priorityReasons: priorityReasons,
        confidenceLevel: evidenceConfidence,
        independentReportCount: 1,
        assignedDepartmentId,
        createdAt,
        updatedAt: createdAt
      };
      
      await incidentRepo.save(incident);
      observation.incidentId = incident.id;
      
      await eventRepo.save({
        id: Math.random().toString(36).substring(7),
        incidentId: incident.id,
        actorId: observation.reporterId,
        type: "CREATED",
        newStatus: "NEW",
        createdAt: new Date().toISOString()
      });
    }

    await evidenceRepo.save(evidence);
    await obsRepo.save(observation);

    return { observationId: observation.id, incidentId: incident.id };
  }
}

export const observationService = new ObservationService();
