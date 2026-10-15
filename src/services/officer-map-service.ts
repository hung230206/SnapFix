import type { IncidentStatusTone } from "@/domain/incident/status";
import {
  getIncidentStatusPresentation,
  getPriorityPresentation,
} from "@/domain/incident/status";
import {
  officerIncidentRepository,
  officerIssueTypeRepository,
} from "@/lib/repositories/officer-repositories";

export type OfficerMapIncident = {
  id: string;
  publicCode: string;
  issueType: string;
  lat: number;
  lng: number;
  status: { label: string; tone: IncidentStatusTone };
  priority: { label: string; tone: IncidentStatusTone };
};

export class OfficerMapService {
  async getMapIncidents(): Promise<OfficerMapIncident[]> {
    const [incidents, issueTypes] = await Promise.all([
      officerIncidentRepository.findAll(),
      officerIssueTypeRepository.findAll(),
    ]);
    const issueTypeNames = new Map(
      issueTypes.map((issueType) => [issueType.code, issueType.nameVi]),
    );

    return incidents.flatMap((incident): OfficerMapIncident[] => {
      if (
        incident.centroidLat === undefined ||
        incident.centroidLng === undefined
      ) {
        return [];
      }
      return [
        {
          id: incident.id,
          publicCode: incident.publicCode,
          issueType:
            issueTypeNames.get(incident.issueTypeCode) ?? incident.issueTypeCode,
          lat: incident.centroidLat,
          lng: incident.centroidLng,
          status: getIncidentStatusPresentation(incident.status),
          priority: getPriorityPresentation(incident.priorityLevel),
        },
      ];
    });
  }
}

export const officerMapService = new OfficerMapService();
