import {
  DemoIncidentEventRepository,
  DemoIncidentRepository,
} from "@/lib/repositories/DemoRepositories";

type OfficerDemoRepositories = {
  incidents: DemoIncidentRepository;
  events: DemoIncidentEventRepository;
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
};

officerGlobal.__snapfixOfficerDemoRepositories__ = repositories;

export const officerIncidentRepository = repositories.incidents;
export const officerIncidentEventRepository = repositories.events;
