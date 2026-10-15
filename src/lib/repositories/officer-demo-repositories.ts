import {
  DemoIncidentEventRepository,
  DemoIncidentRepository,
} from "@/lib/repositories/DemoRepositories";
import { InMemoryOfficerResolutionRepository } from "@/lib/repositories/OfficerResolutionRepository";

type OfficerDemoRepositories = {
  incidents: DemoIncidentRepository;
  events: DemoIncidentEventRepository;
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
  incidents: new DemoIncidentRepository(),
  events: new DemoIncidentEventRepository(),
  resolutions: new InMemoryOfficerResolutionRepository(),
};

officerGlobal.__snapfixOfficerDemoRepositories__ = repositories;

export const officerIncidentRepository = repositories.incidents;
export const officerIncidentEventRepository = repositories.events;
export const officerResolutionRepository = repositories.resolutions;
