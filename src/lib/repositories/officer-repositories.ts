import "server-only";

import {
  DemoAssetRepository,
  DemoDepartmentRepository,
  DemoIncidentEventRepository,
  DemoIncidentRepository,
  DemoIssueTypeRepository,
  DemoObservationEvidenceRepository,
  DemoObservationRepository,
  DemoUserRepository,
} from "@/lib/repositories/DemoRepositories";

type OfficerRepositories = {
  incidents: DemoIncidentRepository;
  events: DemoIncidentEventRepository;
  issueTypes: DemoIssueTypeRepository;
  observations: DemoObservationRepository;
  observationEvidence: DemoObservationEvidenceRepository;
  assets: DemoAssetRepository;
  users: DemoUserRepository;
  departments: DemoDepartmentRepository;
};

type GlobalWithOfficerRepositories = typeof globalThis & {
  __snapfixOfficerRepositories__?: OfficerRepositories;
};

/**
 * Process-local repositories shared by every officer read model and mutation.
 * The UI only depends on repository-backed services, so these demo stores can
 * later be replaced by API/database implementations without changing pages.
 */
const officerGlobal = globalThis as GlobalWithOfficerRepositories;

const repositories = officerGlobal.__snapfixOfficerRepositories__ ?? {
  incidents: new DemoIncidentRepository(),
  events: new DemoIncidentEventRepository(),
  issueTypes: new DemoIssueTypeRepository(),
  observations: new DemoObservationRepository(),
  observationEvidence: new DemoObservationEvidenceRepository(),
  assets: new DemoAssetRepository(),
  users: new DemoUserRepository(),
  departments: new DemoDepartmentRepository(),
};

officerGlobal.__snapfixOfficerRepositories__ = repositories;

export const officerIncidentRepository = repositories.incidents;
export const officerIncidentEventRepository = repositories.events;
export const officerIssueTypeRepository = repositories.issueTypes;
export const officerObservationRepository = repositories.observations;
export const officerObservationEvidenceRepository =
  repositories.observationEvidence;
export const officerAssetRepository = repositories.assets;
export const officerUserRepository = repositories.users;
export const officerDepartmentRepository = repositories.departments;
