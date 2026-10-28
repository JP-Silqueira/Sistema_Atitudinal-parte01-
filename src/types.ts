export type Segment = 'Fundamental I' | 'Fundamental II' | 'Ensino Medio';

export type DimensionId = 
  | 'responsabilidade' 
  | 'colaboracao' 
  | 'autonomia' 
  | 'participacao' 
  | 'respeito';

export interface Dimension {
  id: DimensionId;
  name: string;
  description: string;
  caselCategory: string;
  bnccCompetencies: string[];
}

export type Polarity = 'positiva' | 'oportunidade' | 'neutra';

export interface SchoolClass {
  id: string;
  name: string;
  segment: Segment;
  grade: string;
  schoolYear: number;
}

export interface Student {
  id: string;
  classId: string;
  name: string;
  enrollmentNumber: string;
  attendanceRate: number; // Percentual 0 a 100
  missingAssignments: number; // Tarefas nao entregues
  guardianName: string;
  guardianEmail: string;
}

export interface Observation {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  teacherId: string;
  teacherName: string;
  dimensionId: DimensionId;
  polarity: Polarity;
  note?: string;
  timestamp: string; // ISO 8601
}

export type MTSSRiskTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export interface MTSSAlert {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  tier: MTSSRiskTier;
  attendanceRate: number;
  missingAssignments: number;
  attitudeScore: number; // Calculado de 1.0 a 5.0
  reasons: string[];
  recommendedAction: string;
  lastUpdated: string;
}

export type InterventionStatus = 'Em Planejamento' | 'Em Andamento' | 'Concluido' | 'Em Revisao';

export interface InterventionPlan {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  tier: MTSSRiskTier;
  title: string;
  strategy: string;
  targetDimension: DimensionId;
  responsibleName: string;
  startDate: string;
  reviewDate: string;
  status: InterventionStatus;
}

export interface SelfEvaluation {
  id: string;
  studentId: string;
  studentName: string;
  period: string; // Ex: '1o Bimestre / 2026'
  ratings: Record<DimensionId, number>; // 1 a 5
  reflectionText: string;
  submittedAt: string; // ISO 8601
}

export type DialogueStatus = 'Aberto' | 'Em Analise' | 'Respondido' | 'Resolvido';

export interface DialogueRequest {
  id: string;
  observationId?: string;
  studentId: string;
  studentName: string;
  authorType: 'Estudante' | 'Responsavel';
  authorName: string;
  message: string;
  response?: string;
  respondedBy?: string;
  status: DialogueStatus;
  createdAt: string;
  updatedAt: string;
}

export type ActorRole = 'Professor' | 'Coordenador' | 'Estudante' | 'Responsavel' | 'Sistema';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: ActorRole;
  action: string;
  resource: string;
  studentId?: string;
  justification: string;
}

export interface DatabaseSchema {
  dimensions: Dimension[];
  classes: SchoolClass[];
  students: Student[];
  observations: Observation[];
  interventions: InterventionPlan[];
  selfEvaluations: SelfEvaluation[];
  dialogueRequests: DialogueRequest[];
  auditLogs: AuditLogEntry[];
}
