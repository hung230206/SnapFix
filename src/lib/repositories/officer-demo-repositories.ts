import {
  officerIncidentEventRepository as sharedEvents,
  officerIncidentRepository as sharedIncidents,
} from "@/lib/repositories/officer-repositories";
import { InMemoryOfficerResolutionRepository } from "@/lib/repositories/OfficerResolutionRepository";

type OfficerDemoRepositories = {
  incidents: typeof sharedIncidents;
  events: typeof sharedEvents;
  resolutions: InMemoryOfficerResolutionRepository;
};

type GlobalWithOfficerDemoRepositories = typeof globalThis & {
  __snapfixOfficerDemoRepositories__?: OfficerDemoRepositories;
};

/**
 * Shared, process-local repositories for the officer prototype.
 *
 * Keeping these behind repository interfaces lets the officer services move to
 * an API-backed implementation without coupling UI components to demo data.
 */
const officerGlobal = globalThis as GlobalWithOfficerDemoRepositories;
const repositories = officerGlobal.__snapfixOfficerDemoRepositories__ ?? {
  incidents: sharedIncidents,
  events: sharedEvents,
  resolutions: new InMemoryOfficerResolutionRepository(),
};

officerGlobal.__snapfixOfficerDemoRepositories__ = repositories;

export const officerIncidentRepository = sharedIncidents;
export const officerIncidentEventRepository = sharedEvents;
export const officerResolutionRepository = repositories.resolutions;
