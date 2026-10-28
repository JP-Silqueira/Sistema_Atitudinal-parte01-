import fs from 'node:fs';
import path from 'node:path';
import {
  AuditLogEntry,
  DatabaseSchema,
  DialogueRequest,
  DimensionId,
  InterventionPlan,
  InterventionStatus,
  MTSSAlert,
  Observation,
  Polarity,
  SelfEvaluation,
  Student
} from './types.js';
import { generateSeedData } from './seedData.js';

export const VALID_DIMENSIONS: DimensionId[] = [
  'responsabilidade',
  'colaboracao',
  'autonomia',
  'participacao',
  'respeito'
];

export const VALID_POLARITIES: Polarity[] = ['positiva', 'oportunidade', 'neutra'];

export const VALID_MTSS_TIERS = ['Tier 2', 'Tier 3'] as const;

export const VALID_INTERVENTION_STATUSES: InterventionStatus[] = [
  'Em Planejamento',
  'Em Andamento',
  'Concluido',
  'Em Revisao'
];

export const VALID_AUTHOR_TYPES = ['Estudante', 'Responsavel'] as const;

export class DataStore {
  private dbPath: string;
  private db: DatabaseSchema | null = null;

  constructor(customPath?: string) {
    if (customPath) {
      this.dbPath = customPath;
    } else {
      const baseDir = process.cwd();
      this.dbPath = path.join(baseDir, 'data', 'database.json');
    }
    this.ensureInitialized();
  }

  public ensureInitialized(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.dbPath)) {
      const initial = generateSeedData();
      fs.writeFileSync(this.dbPath, JSON.stringify(initial, null, 2), 'utf-8');
      this.db = initial;
      return;
    }

    try {
      const content = fs.readFileSync(this.dbPath, 'utf-8');
      this.db = JSON.parse(content) as DatabaseSchema;
    } catch {
      const initial = generateSeedData();
      fs.writeFileSync(this.dbPath, JSON.stringify(initial, null, 2), 'utf-8');
      this.db = initial;
    }
  }

  public getDb(): DatabaseSchema {
    if (!this.db) {
      this.ensureInitialized();
    }
    return this.db!;
  }

  public save(): void {
    if (this.db) {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2), 'utf-8');
    }
  }

  // Registra trilha de auditoria em conformidade com a LGPD
  public logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const db = this.getDb();
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    db.auditLogs.unshift(newEntry);
    this.save();
    return newEntry;
  }

  public getClasses() {
    return this.getDb().classes;
  }

  public getStudents(classId?: string): Student[] {
    const students = this.getDb().students;
    if (classId) {
      return students.filter(s => s.classId === classId);
    }
    return students;
  }

  public getStudentById(studentId: string): Student | undefined {
    return this.getDb().students.find(s => s.id === studentId);
  }

  public getDimensions() {
    return this.getDb().dimensions;
  }

  public getObservations(filter?: { studentId?: string; classId?: string; dimensionId?: DimensionId }) {
    let obs = this.getDb().observations;
    if (filter?.studentId) {
      obs = obs.filter(o => o.studentId === filter.studentId);
    }
    if (filter?.classId) {
      obs = obs.filter(o => o.classId === filter.classId);
    }
    if (filter?.dimensionId) {
      obs = obs.filter(o => o.dimensionId === filter.dimensionId);
    }
    // Ordena pelo timestamp decrescente
    return [...obs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addObservation(data: {
    studentId: string;
    dimensionId: DimensionId;
    polarity: 'positiva' | 'oportunidade' | 'neutra';
    note?: string;
    teacherId?: string;
    teacherName?: string;
  }): Observation {
    const db = this.getDb();
    if (!VALID_DIMENSIONS.includes(data.dimensionId)) {
      throw new Error(`Dimensao invalida: ${data.dimensionId}. Dimensoes validas: ${VALID_DIMENSIONS.join(', ')}`);
    }
    if (!VALID_POLARITIES.includes(data.polarity)) {
      throw new Error(`Polaridade invalida: ${data.polarity}. Polaridades validas: positiva, oportunidade, neutra`);
    }

    const student = db.students.find(s => s.id === data.studentId);
    if (!student) {
      throw new Error(`Estudante com ID ${data.studentId} nao encontrado.`);
    }

    const newObs: Observation = {
      id: `obs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: student.id,
      studentName: student.name,
      classId: student.classId,
      teacherId: data.teacherId || 'prof-01',
      teacherName: data.teacherName || 'Docente Responsavel',
      dimensionId: data.dimensionId,
      polarity: data.polarity,
      note: data.note?.trim() || '',
      timestamp: new Date().toISOString()
    };

    db.observations.unshift(newObs);

    this.logAudit({
      actorId: newObs.teacherId,
      actorName: newObs.teacherName,
      actorRole: 'Professor',
      action: 'REGISTRO_OBSERVACAO',
      resource: `Observacao ${newObs.id} - Dimensao: ${newObs.dimensionId}, Polaridade: ${newObs.polarity}`,
      studentId: student.id,
      justification: 'Registro formativo continuo de desenvolvimento socioemocional em sala de aula (LGPD Art. 7 e 14).'
    });

    this.save();
    return newObs;
  }

  // Calculo do Sistema de Alerta Precoce (EdInsights / MTSS)
  public calculateMTSSAlerts(classId?: string): MTSSAlert[] {
    const db = this.getDb();
    const students = classId ? db.students.filter(s => s.classId === classId) : db.students;
    const classesMap = new Map(db.classes.map(c => [c.id, c.name]));

    const alerts: MTSSAlert[] = [];

    for (const student of students) {
      const studentObs = db.observations.filter(o => o.studentId === student.id);
      
      // Calculo do score atitudinal ponderado (1.0 a 5.0)
      let scoreSum = 0;
      let positiveCount = 0;
      let opportunityCount = 0;
      let neutralCount = 0;

      for (const o of studentObs) {
        if (o.polarity === 'positiva') {
          scoreSum += 5.0;
          positiveCount++;
        } else if (o.polarity === 'neutra') {
          scoreSum += 3.5;
          neutralCount++;
        } else if (o.polarity === 'oportunidade') {
          scoreSum += 2.0;
          opportunityCount++;
        }
      }

      const totalObs = studentObs.length;
      const attitudeScore = totalObs > 0 ? Number((scoreSum / totalObs).toFixed(2)) : 4.0;

      const reasons: string[] = [];
      let tier: 'Tier 1' | 'Tier 2' | 'Tier 3' = 'Tier 1';
      let recommendedAction = 'Manter acompanhamento universal preventivo e reforco positivo.';

      // Criterios de Alerta EdInsights / MTSS
      const hasCriticalAttendance = student.attendanceRate < 75;
      const hasAttentionAttendance = student.attendanceRate >= 75 && student.attendanceRate < 85;
      const hasHighMissingTasks = student.missingAssignments >= 4;
      const hasModerateMissingTasks = student.missingAssignments >= 2 && student.missingAssignments < 4;
      const hasAttitudeDrop = opportunityCount > positiveCount;
      const hasSevereAttitudeDrop = totalObs >= 3 && attitudeScore <= 2.5;

      if (hasCriticalAttendance) {
        reasons.push(`Frequencia critica (${student.attendanceRate}%), abaixo do patamar legal de 75%.`);
      }
      if (hasAttentionAttendance) {
        reasons.push(`Frequencia em alerta (${student.attendanceRate}%), recomendada acao preventiva.`);
      }
      if (hasHighMissingTasks) {
        reasons.push(`Acumulo elevado de tarefas nao entregues (${student.missingAssignments} pendencias).`);
      } else if (hasModerateMissingTasks) {
        reasons.push(`Pendencia moderada de entregas (${student.missingAssignments} tarefas).`);
      }
      if (hasAttitudeDrop) {
        reasons.push(`Predominio de observacoes de oportunidade (${opportunityCount}) sobre positivas (${positiveCount}).`);
      }

      // Classificacao MTSS:
      // Tier 3: Risco alto (frequencia critica <75%, ou tarefas altas com queda atitudinal/frequencia <80%, ou queda atitudinal severa)
      // Tier 2: Suporte focado (frequencia em atencao, tarefas moderadas ou altas isoladas, ou queda atitudinal)
      // Tier 1: Universal
      if (hasCriticalAttendance || (hasHighMissingTasks && hasAttitudeDrop) || (student.attendanceRate < 80 && hasHighMissingTasks) || hasSevereAttitudeDrop) {
        tier = 'Tier 3';
        recommendedAction = 'Intervencao Intensiva: acionar orientacao pedagogica, convocar familia e estruturar plano individualizado.';
      } else if (hasAttentionAttendance || hasHighMissingTasks || hasModerateMissingTasks || (hasAttitudeDrop && totalObs >= 2)) {
        tier = 'Tier 2';
        recommendedAction = 'Suporte Focado: monitoramento quinzenal, apoio em tutoria de estudos e checklist formativo.';
      } else {
        tier = 'Tier 1';
        if (reasons.length === 0) {
          reasons.push('Desenvolvimento atitudinal e assiduidade dentro dos padroes esperados.');
        }
      }

      alerts.push({
        studentId: student.id,
        studentName: student.name,
        classId: student.classId,
        className: classesMap.get(student.classId) || student.classId,
        tier,
        attendanceRate: student.attendanceRate,
        missingAssignments: student.missingAssignments,
        attitudeScore,
        reasons,
        recommendedAction,
        lastUpdated: new Date().toISOString()
      });
    }

    // Ordena: Tier 3 primeiro, depois Tier 2, depois Tier 1
    const tierPriority = { 'Tier 3': 3, 'Tier 2': 2, 'Tier 1': 1 };
    return alerts.sort((a, b) => tierPriority[b.tier] - tierPriority[a.tier]);
  }

  // Calculo de Clima Escolar e Radar Agregado (Kindbegrip)
  public calculateSchoolClimate(classId?: string) {
    const db = this.getDb();
    const students = classId ? db.students.filter(s => s.classId === classId) : db.students;
    const studentIds = new Set(students.map(s => s.id));
    const observations = db.observations.filter(o => studentIds.has(o.studentId));

    const totalObs = observations.length;
    let positiveCount = 0;
    let opportunityCount = 0;
    let neutralCount = 0;

    const dimensionScores: Record<DimensionId, { sum: number; count: number; name: string }> = {
      responsabilidade: { sum: 0, count: 0, name: 'Responsabilidade' },
      colaboracao: { sum: 0, count: 0, name: 'Colaboracao' },
      autonomia: { sum: 0, count: 0, name: 'Autonomia' },
      participacao: { sum: 0, count: 0, name: 'Participacao' },
      respeito: { sum: 0, count: 0, name: 'Respeito e Convivencia' }
    };

    for (const o of observations) {
      let val = 3.5;
      if (o.polarity === 'positiva') {
        positiveCount++;
        val = 5.0;
      } else if (o.polarity === 'oportunidade') {
        opportunityCount++;
        val = 2.0;
      } else {
        neutralCount++;
        val = 3.5;
      }

      if (dimensionScores[o.dimensionId]) {
        dimensionScores[o.dimensionId].sum += val;
        dimensionScores[o.dimensionId].count++;
      }
    }

    // Media por dimensao (escala 1 a 5)
    const radarValues: Record<DimensionId, number> = {
      responsabilidade: 3.5,
      colaboracao: 3.5,
      autonomia: 3.5,
      participacao: 3.5,
      respeito: 3.5
    };

    (Object.keys(dimensionScores) as DimensionId[]).forEach(dim => {
      const data = dimensionScores[dim];
      if (data.count > 0) {
        radarValues[dim] = Number((data.sum / data.count).toFixed(2));
      }
    });

    const climateIndex = totalObs > 0 
      ? Number(((positiveCount / totalObs) * 100).toFixed(1)) 
      : 0.0;

    return {
      totalStudents: students.length,
      totalObservations: totalObs,
      counts: {
        positive: positiveCount,
        opportunity: opportunityCount,
        neutral: neutralCount
      },
      percentages: {
        positive: totalObs > 0 ? Number(((positiveCount / totalObs) * 100).toFixed(1)) : 0,
        opportunity: totalObs > 0 ? Number(((opportunityCount / totalObs) * 100).toFixed(1)) : 0,
        neutral: totalObs > 0 ? Number(((neutralCount / totalObs) * 100).toFixed(1)) : 0
      },
      climateIndex,
      radarDimensions: radarValues
    };
  }

  // Radar Individual do Estudante (Visao Kindbegrip: Escola vs Autoavaliacao)
  public getStudentRadar(studentId: string) {
    const db = this.getDb();
    const student = db.students.find(s => s.id === studentId);
    if (!student) {
      throw new Error(`Estudante ${studentId} nao encontrado.`);
    }

    const obs = db.observations.filter(o => o.studentId === studentId);

    const dims: DimensionId[] = ['responsabilidade', 'colaboracao', 'autonomia', 'participacao', 'respeito'];
    const teacherRatings: Record<DimensionId, number> = {
      responsabilidade: 3.5,
      colaboracao: 3.5,
      autonomia: 3.5,
      participacao: 3.5,
      respeito: 3.5
    };

    dims.forEach(dim => {
      const dimObs = obs.filter(o => o.dimensionId === dim);
      if (dimObs.length > 0) {
        let sum = 0;
        dimObs.forEach(o => {
          if (o.polarity === 'positiva') sum += 5.0;
          else if (o.polarity === 'neutra') sum += 3.5;
          else sum += 2.0;
        });
        teacherRatings[dim] = Number((sum / dimObs.length).toFixed(2));
      }
    });

    // Pega a autoavaliacao mais recente
    const selfEval = db.selfEvaluations
      .filter(se => se.studentId === studentId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

    const selfRatings: Record<DimensionId, number> = selfEval 
      ? selfEval.ratings 
      : { responsabilidade: 4, colaboracao: 4, autonomia: 4, participacao: 4, respeito: 4 };

    // Identifica Forcas e Areas de Desenvolvimento de forma pedagogica
    const dimsWithScores = dims.map(dim => ({ dim, score: teacherRatings[dim] }));
    dimsWithScores.sort((a, b) => b.score - a.score);

    let strengths: DimensionId[] = [];
    let growthAreas: DimensionId[] = [];

    const minScore = dimsWithScores[dimsWithScores.length - 1].score;
    const maxScore = dimsWithScores[0].score;

    if (obs.length === 0 || minScore === maxScore) {
      strengths = dimsWithScores.slice(0, 2).map(d => d.dim);
      growthAreas = [];
    } else {
      strengths = dimsWithScores.filter(d => d.score >= 3.5).slice(0, 2).map(d => d.dim);
      growthAreas = dimsWithScores.filter(d => d.score < 3.5).map(d => d.dim);
      if (growthAreas.length === 0) {
        growthAreas = [dimsWithScores[dimsWithScores.length - 1].dim];
      }
      if (strengths.length === 0) {
        strengths = [dimsWithScores[0].dim];
      }
    }

    return {
      student,
      totalObservations: obs.length,
      teacherRatings,
      selfRatings,
      selfEvaluation: selfEval || null,
      strengths,
      growthAreas
    };
  }

  // Intervencoes MTSS
  public getInterventions(classId?: string): InterventionPlan[] {
    const list = this.getDb().interventions;
    if (classId) {
      return list.filter(i => i.classId === classId);
    }
    return list;
  }

  public addIntervention(data: Omit<InterventionPlan, 'id'>): InterventionPlan {
    const db = this.getDb();
    const student = db.students.find(s => s.id === data.studentId);
    if (!student) {
      throw new Error(`Estudante com ID ${data.studentId} nao encontrado.`);
    }
    if (!VALID_MTSS_TIERS.includes(data.tier as any)) {
      throw new Error(`Nivel MTSS invalido: ${data.tier}. Niveis permitidos para intervencao: Tier 2, Tier 3.`);
    }
    if (!VALID_DIMENSIONS.includes(data.targetDimension)) {
      throw new Error(`Dimensao alvo invalida: ${data.targetDimension}.`);
    }
    if (data.status && !VALID_INTERVENTION_STATUSES.includes(data.status)) {
      throw new Error(`Status de intervencao invalido: ${data.status}.`);
    }
    if (!data.title || !data.title.trim()) {
      throw new Error('O titulo da intervencao e obrigatorio.');
    }
    if (!data.strategy || !data.strategy.trim()) {
      throw new Error('A estrategia da intervencao e obrigatoria.');
    }

    const newInt: InterventionPlan = {
      id: `int-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...data
    };
    db.interventions.unshift(newInt);

    this.logAudit({
      actorId: 'coord-01',
      actorName: data.responsibleName,
      actorRole: 'Coordenador',
      action: 'CRIACAO_INTERVENCAO_MTSS',
      resource: `Plano ${newInt.id} (${newInt.tier}) para ${newInt.studentName}`,
      studentId: newInt.studentId,
      justification: 'Implementacao de suporte pedagogico estruturado (MTSS) baseado em indicadores escolares integrados.'
    });

    this.save();
    return newInt;
  }

  public updateInterventionStatus(id: string, status: InterventionPlan['status']): InterventionPlan {
    const db = this.getDb();
    if (!VALID_INTERVENTION_STATUSES.includes(status)) {
      throw new Error(`Status de intervencao invalido: ${status}.`);
    }
    const item = db.interventions.find(i => i.id === id);
    if (!item) {
      throw new Error(`Plano de intervencao ${id} nao encontrado.`);
    }
    item.status = status;

    this.logAudit({
      actorId: 'coord-01',
      actorName: 'Coordenacao Pedagogica',
      actorRole: 'Coordenador',
      action: 'ATUALIZACAO_INTERVENCAO_MTSS',
      resource: `Plano ${item.id} atualizado para status: ${status}`,
      studentId: item.studentId,
      justification: 'Acompanhamento do plano de suporte pedagogico individual.'
    });

    this.save();
    return item;
  }

  // Autoavaliacao do Estudante
  public getSelfEvaluations(studentId?: string): SelfEvaluation[] {
    const list = this.getDb().selfEvaluations;
    if (studentId) {
      return list.filter(se => se.studentId === studentId);
    }
    return list;
  }

  public addSelfEvaluation(data: {
    studentId: string;
    period: string;
    ratings: Record<DimensionId, number>;
    reflectionText: string;
  }): SelfEvaluation {
    const db = this.getDb();
    const student = db.students.find(s => s.id === data.studentId);
    if (!student) {
      throw new Error(`Estudante ${data.studentId} nao encontrado.`);
    }

    if (!data.ratings || typeof data.ratings !== 'object') {
      throw new Error('O campo ratings e obrigatorio e deve conter as avaliacoes das 5 dimensoes.');
    }

    const validatedRatings: Record<DimensionId, number> = {} as any;
    for (const dim of VALID_DIMENSIONS) {
      const val = Number(data.ratings[dim]);
      if (isNaN(val) || val < 1 || val > 5) {
        throw new Error(`Nota invalida para a dimensao ${dim}: deve ser um numero entre 1 e 5.`);
      }
      validatedRatings[dim] = Math.round(val * 10) / 10;
    }

    const newEval: SelfEvaluation = {
      id: `self-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: student.id,
      studentName: student.name,
      period: data.period || '1o Bimestre / 2026',
      ratings: validatedRatings,
      reflectionText: (data.reflectionText || '').trim(),
      submittedAt: new Date().toISOString()
    };

    db.selfEvaluations.unshift(newEval);

    this.logAudit({
      actorId: student.id,
      actorName: student.name,
      actorRole: 'Estudante',
      action: 'REGISTRO_AUTOAVALIACAO',
      resource: `Autoavaliacao ${newEval.id} para o periodo ${newEval.period}`,
      studentId: student.id,
      justification: 'Exercicio da reflexao formativa e participacao discente na avaliacao socioemocional.'
    });

    this.save();
    return newEval;
  }

  // Canal de Dialogo e Contestacao Etica
  public getDialogueRequests(studentId?: string): DialogueRequest[] {
    const list = this.getDb().dialogueRequests;
    if (studentId) {
      return list.filter(d => d.studentId === studentId);
    }
    return list;
  }

  public addDialogueRequest(data: {
    observationId?: string;
    studentId: string;
    authorType: 'Estudante' | 'Responsavel';
    authorName: string;
    message: string;
  }): DialogueRequest {
    const db = this.getDb();
    const student = db.students.find(s => s.id === data.studentId);
    if (!student) {
      throw new Error(`Estudante ${data.studentId} nao encontrado.`);
    }

    if (!VALID_AUTHOR_TYPES.includes(data.authorType as any)) {
      throw new Error(`Tipo de autor invalido: ${data.authorType}. Tipos permitidos: Estudante, Responsavel.`);
    }

    if (!data.authorName || !data.authorName.trim()) {
      throw new Error('O nome do autor da solicitacao e obrigatorio.');
    }
    if (!data.message || !data.message.trim()) {
      throw new Error('A mensagem do dialogo e obrigatoria.');
    }

    if (data.observationId) {
      const obsExists = db.observations.some(o => o.id === data.observationId);
      if (!obsExists) {
        throw new Error(`Observacao vinculada com ID ${data.observationId} nao encontrada.`);
      }
    }

    const newReq: DialogueRequest = {
      id: `dia-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      observationId: data.observationId,
      studentId: student.id,
      studentName: student.name,
      authorType: data.authorType,
      authorName: data.authorName.trim(),
      message: data.message.trim(),
      status: 'Aberto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.dialogueRequests.unshift(newReq);

    this.logAudit({
      actorId: student.id,
      actorName: data.authorName,
      actorRole: data.authorType,
      action: 'ABERTURA_DIALOGO_CONTESTACAO',
      resource: `Canal de dialogo ${newReq.id} (Vinculo: ${data.observationId || 'Geral'})`,
      studentId: student.id,
      justification: 'Exercicio de transparencia, contraditorio pedagogico e explicabilidade (LGPD).'
    });

    this.save();
    return newReq;
  }

  public respondDialogueRequest(id: string, response: string, respondedBy: string): DialogueRequest {
    const db = this.getDb();
    const item = db.dialogueRequests.find(d => d.id === id);
    if (!item) {
      throw new Error(`Solicitacao de dialogo ${id} nao encontrada.`);
    }
    if (!response || !response.trim()) {
      throw new Error('A resposta pedagogica e obrigatoria.');
    }
    if (!respondedBy || !respondedBy.trim()) {
      throw new Error('O nome do educador responsavel pela devolutiva e obrigatorio.');
    }

    item.response = response.trim();
    item.respondedBy = respondedBy.trim();
    item.status = 'Respondido';
    item.updatedAt = new Date().toISOString();

    this.logAudit({
      actorId: 'prof-coord',
      actorName: respondedBy,
      actorRole: 'Coordenador',
      action: 'RESPOSTA_DIALOGO_PEDAGOGICO',
      resource: `Resposta ao dialogo ${item.id}`,
      studentId: item.studentId,
      justification: 'Devolutiva acolhedora e orientacao pedagogica dialogada com estudante e familia.'
    });

    this.save();
    return item;
  }

  // Trilha de Auditoria LGPD
  public getAuditLogs(studentId?: string): AuditLogEntry[] {
    const list = this.getDb().auditLogs;
    if (studentId) {
      return list.filter(l => l.studentId === studentId);
    }
    return list;
  }
}
