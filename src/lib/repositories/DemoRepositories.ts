import {
  IUserRepository, IDepartmentRepository, IIssueTypeRepository, IIssueQuestionRepository, IIssueQuestionOptionRepository,
  IObservationRepository, IObservationEvidenceRepository, IIncidentRepository, IIncidentEventRepository,
  IAssetRepository, IRoutingRuleRepository
} from "./interfaces";
import {
  demoUsers, demoDepartments, demoIssueTypes, demoQuestions, demoQuestionOptions, demoIncidents,
  demoObservations, demoAssets, demoEvents, demoRoutingRules
} from "./mockData";
import { User, Department, IssueType, IssueQuestion, IssueQuestionOption, Observation, ObservationEvidence, Incident, IncidentEvent, Asset, RoutingRule } from "../../domain/models";

export class DemoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return demoUsers.find(u => u.id === id) || null;
  }
  async findAll(): Promise<User[]> {
    return [...demoUsers];
  }
}

export class DemoDepartmentRepository implements IDepartmentRepository {
  async findById(id: string): Promise<Department | null> {
    return demoDepartments.find(d => d.id === id) || null;
  }
  async findAll(): Promise<Department[]> {
    return [...demoDepartments];
  }
}

export class DemoIssueTypeRepository implements IIssueTypeRepository {
  async findByCode(code: string): Promise<IssueType | null> {
    return demoIssueTypes.find(i => i.code === code) || null;
  }
  async findAll(): Promise<IssueType[]> {
    return [...demoIssueTypes];
  }
}

export class DemoIssueQuestionRepository implements IIssueQuestionRepository {
  async findByIssueTypeCode(code: string): Promise<IssueQuestion[]> {
    return demoQuestions.filter(q => q.issueTypeCode === code).sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

export class DemoIssueQuestionOptionRepository implements IIssueQuestionOptionRepository {
  async findByQuestionId(questionId: string): Promise<IssueQuestionOption[]> {
    return demoQuestionOptions.filter(o => o.questionId === questionId).sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

export class DemoObservationRepository implements IObservationRepository {
  private data = [...demoObservations];

  async findById(id: string): Promise<Observation | null> {
    return this.data.find(o => o.id === id) || null;
  }
  async findByIncidentId(incidentId: string): Promise<Observation[]> {
    return this.data.filter(o => o.incidentId === incidentId);
  }
  async save(observation: Observation): Promise<void> {
    const idx = this.data.findIndex(o => o.id === observation.id);
    if (idx >= 0) {
      this.data[idx] = observation;
    } else {
      this.data.push(observation);
    }
  }
}

export class DemoObservationEvidenceRepository implements IObservationEvidenceRepository {
  private data: ObservationEvidence[] = []; // In a real app we'd seed this from mockData as well

  async findById(id: string): Promise<ObservationEvidence | null> {
    return this.data.find(e => e.id === id) || null;
  }
  async findByObservationId(observationId: string): Promise<ObservationEvidence | null> {
    return this.data.find(e => e.observationId === observationId) || null;
  }
  async save(evidence: ObservationEvidence): Promise<void> {
    const idx = this.data.findIndex(e => e.id === evidence.id);
    if (idx >= 0) {
      this.data[idx] = evidence;
    } else {
      this.data.push(evidence);
    }
  }
}

export class DemoIncidentRepository implements IIncidentRepository {
  private data = [...demoIncidents];

  async findById(id: string): Promise<Incident | null> {
    return this.data.find(i => i.id === id) || null;
  }
  async findAll(): Promise<Incident[]> {
    return [...this.data];
  }
  async save(incident: Incident): Promise<void> {
    const idx = this.data.findIndex(i => i.id === incident.id);
    if (idx >= 0) {
      this.data[idx] = incident;
    } else {
      this.data.push(incident);
    }
  }
}

export class DemoIncidentEventRepository implements IIncidentEventRepository {
  private data = [...demoEvents];

  async findByIncidentId(incidentId: string): Promise<IncidentEvent[]> {
    return this.data.filter(e => e.incidentId === incidentId);
  }
  async save(event: IncidentEvent): Promise<void> {
    this.data.push(event);
  }
}

export class DemoAssetRepository implements IAssetRepository {
  private data = [...demoAssets];

  async findById(id: string): Promise<Asset | null> {
    return this.data.find(a => a.id === id) || null;
  }
  async save(asset: Asset): Promise<void> {
    this.data.push(asset);
  }
}

export class DemoRoutingRuleRepository implements IRoutingRuleRepository {
  async findAll(): Promise<RoutingRule[]> {
    return [...demoRoutingRules];
  }
}
