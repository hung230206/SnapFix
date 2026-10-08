import type { IncidentResolution } from "@/domain/incident/resolution";

export interface IOfficerResolutionRepository {
  findByIncidentId(incidentId: string): Promise<IncidentResolution | null>;
  save(resolution: IncidentResolution): Promise<void>;
}

export class InMemoryOfficerResolutionRepository
  implements IOfficerResolutionRepository
{
  private readonly resolutionsByIncidentId = new Map<string, IncidentResolution>();

  async findByIncidentId(incidentId: string): Promise<IncidentResolution | null> {
    return this.resolutionsByIncidentId.get(incidentId) ?? null;
  }

  async save(resolution: IncidentResolution): Promise<void> {
    this.resolutionsByIncidentId.set(resolution.incidentId, resolution);
  }
}
