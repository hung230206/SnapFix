import {
  User,
  Department,
  IssueType,
  IssueQuestion,
  IssueQuestionOption,
  Observation,
  ObservationEvidence,
  Incident,
  IncidentEvent,
  Asset,
  RoutingRule
} from "../../domain/models";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}

export interface IDepartmentRepository {
  findById(id: string): Promise<Department | null>;
  findAll(): Promise<Department[]>;
}

export interface IIssueTypeRepository {
  findByCode(code: string): Promise<IssueType | null>;
  findAll(): Promise<IssueType[]>;
}

export interface IIssueQuestionRepository {
  findByIssueTypeCode(code: string): Promise<IssueQuestion[]>;
}

export interface IIssueQuestionOptionRepository {
  findByQuestionId(questionId: string): Promise<IssueQuestionOption[]>;
}

export interface IObservationRepository {
  findById(id: string): Promise<Observation | null>;
  findByIncidentId(incidentId: string): Promise<Observation[]>;
  save(observation: Observation): Promise<void>;
}

export interface IObservationEvidenceRepository {
  findById(id: string): Promise<ObservationEvidence | null>;
  findByObservationId(observationId: string): Promise<ObservationEvidence | null>;
  save(evidence: ObservationEvidence): Promise<void>;
}

export interface IIncidentRepository {
  findById(id: string): Promise<Incident | null>;
  findAll(): Promise<Incident[]>;
  save(incident: Incident): Promise<void>;
}

export interface IIncidentEventRepository {
  findByIncidentId(incidentId: string): Promise<IncidentEvent[]>;
  save(event: IncidentEvent): Promise<void>;
}

export interface IAssetRepository {
  findById(id: string): Promise<Asset | null>;
  save(asset: Asset): Promise<void>;
}

export interface IRoutingRuleRepository {
  findAll(): Promise<RoutingRule[]>;
}
