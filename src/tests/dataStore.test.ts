import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { DataStore } from '../dataStore.js';

describe('DataStore e Motor de Avaliacao Atitudinal', () => {
  const testDbPath = path.join(process.cwd(), 'data', 'test-database.json');

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test('Inicializacao com Seed Data completo', () => {
    const store = new DataStore(testDbPath);
    const db = store.getDb();

    assert.ok(db.dimensions.length === 5, 'Deve carregar as 5 dimensoes atitudinais (BNCC/CASEL)');
    assert.ok(db.classes.length >= 3, 'Deve conter turmas dos tres segmentos da educacao basica');
    assert.ok(db.students.length >= 10, 'Deve conter estudantes cadastrados');
    assert.ok(db.observations.length > 0, 'Deve conter observacoes iniciais');
    assert.ok(db.interventions.length > 0, 'Deve conter planos de intervencao MTSS');
    assert.ok(db.auditLogs.length > 0, 'Deve conter registros iniciais de auditoria LGPD');
  });

  test('Calculo do Sistema de Alerta Precoce (EdInsights / MTSS)', () => {
    const store = new DataStore(testDbPath);
    const alerts = store.calculateMTSSAlerts();

    assert.ok(alerts.length > 0, 'Deve retornar lista de alertas calculados');

    const tier3 = alerts.filter(a => a.tier === 'Tier 3');
    const tier2 = alerts.filter(a => a.tier === 'Tier 2');
    const tier1 = alerts.filter(a => a.tier === 'Tier 1');

    assert.ok(tier3.length > 0, 'Deve identificar estudantes em Tier 3 (Suporte Intensivo)');
    assert.ok(tier2.length > 0, 'Deve identificar estudantes em Tier 2 (Suporte Focado)');
    assert.ok(tier1.length > 0, 'Deve identificar estudantes em Tier 1 (Universal)');

    // Thiago Nogueira (alu-005) tem frequencia 72% -> deve ser Tier 3
    const thiagoAlert = alerts.find(a => a.studentId === 'alu-005');
    assert.ok(thiagoAlert, 'Thiago deve ter registro de alerta');
    assert.strictEqual(thiagoAlert.tier, 'Tier 3');
    assert.ok(thiagoAlert.reasons.some(r => r.includes('72%')), 'Deve apontar frequencia critica de 72%');

    // Lucas Ferreira (alu-001) tem 98% de frequencia e observacoes positivas -> deve ser Tier 1
    const lucasAlert = alerts.find(a => a.studentId === 'alu-001');
    assert.ok(lucasAlert, 'Lucas deve ter registro de alerta');
    assert.strictEqual(lucasAlert.tier, 'Tier 1');
  });

  test('Registro de Observacao (Fluxo de 3 cliques) gera log de auditoria LGPD', () => {
    const store = new DataStore(testDbPath);
    const initialObsCount = store.getObservations().length;
    const initialAuditCount = store.getAuditLogs().length;

    const newObs = store.addObservation({
      studentId: 'alu-001',
      dimensionId: 'responsabilidade',
      polarity: 'positiva',
      note: 'Excelente pontualidade e organizacao de materiais no inicio da aula.',
      teacherId: 'prof-01',
      teacherName: 'Prof. Carlos Eduardo'
    });

    assert.ok(newObs.id, 'Observacao deve ter um ID gerado');
    assert.strictEqual(store.getObservations().length, initialObsCount + 1);

    const auditLogs = store.getAuditLogs();
    assert.strictEqual(auditLogs.length, initialAuditCount + 1);
    const latestAudit = auditLogs[0];
    assert.strictEqual(latestAudit.action, 'REGISTRO_OBSERVACAO');
    assert.strictEqual(latestAudit.studentId, 'alu-001');
    assert.ok(latestAudit.justification.includes('LGPD'), 'Deve registrar justificativa com base na LGPD');
  });

  test('Calculo do Clima Escolar e Radar Agregado (Kindbegrip)', () => {
    const store = new DataStore(testDbPath);
    const climate = store.calculateSchoolClimate();

    assert.ok(climate.totalStudents > 0);
    assert.ok(climate.totalObservations > 0);
    assert.ok(climate.climateIndex >= 0 && climate.climateIndex <= 100);
    assert.ok(climate.percentages.positive >= 0);
    assert.ok(climate.radarDimensions.responsabilidade >= 1 && climate.radarDimensions.responsabilidade <= 5);
    assert.ok(climate.radarDimensions.colaboracao >= 1 && climate.radarDimensions.colaboracao <= 5);
  });

  test('Calculo do Radar Individual do Estudante (Comparacao Escola vs Autoavaliacao)', () => {
    const store = new DataStore(testDbPath);
    const radar = store.getStudentRadar('alu-001');

    assert.strictEqual(radar.student.name, 'Lucas Ferreira Lima');
    assert.ok(radar.teacherRatings.responsabilidade >= 1);
    assert.ok(radar.selfRatings.responsabilidade >= 1);
    assert.ok(radar.strengths.length > 0);
    assert.ok(radar.growthAreas.length > 0);
  });

  test('Canal de Dialogo e Contestacao Etica', () => {
    const store = new DataStore(testDbPath);
    const initialDiaCount = store.getDialogueRequests().length;

    const req = store.addDialogueRequest({
      studentId: 'alu-001',
      authorType: 'Estudante',
      authorName: 'Lucas Ferreira Lima',
      message: 'Gostaria de esclarecer uma duvida sobre a nota atitudinal de ontem.'
    });

    assert.strictEqual(req.status, 'Aberto');
    assert.strictEqual(store.getDialogueRequests().length, initialDiaCount + 1);

    const answered = store.respondDialogueRequest(req.id, 'Marcamos uma conversa para amanha no intervalo.', 'Coordenacao');
    assert.strictEqual(answered.status, 'Respondido');
    assert.strictEqual(answered.response, 'Marcamos uma conversa para amanha no intervalo.');
  });

  test('Calculo do Alerta Precoce com alto volume de tarefas atrasadas isoladas (Tier 2)', () => {
    const store = new DataStore(testDbPath);
    const db = store.getDb();

    // Cria estudante com 95% frequencia mas 5 tarefas em atraso e sem queda atitudinal
    const testStudent = {
      id: 'alu-test-missing',
      classId: 'turma-5a',
      name: 'Estudante Teste Tarefas',
      enrollmentNumber: '2026-TEST',
      attendanceRate: 95,
      missingAssignments: 5,
      guardianName: 'Responsavel Teste',
      guardianEmail: 'teste@escola.br'
    };
    db.students.push(testStudent);
    // Adiciona 2 observacoes positivas
    store.addObservation({
      studentId: testStudent.id,
      dimensionId: 'colaboracao',
      polarity: 'positiva',
      teacherId: 'prof-01'
    });
    store.addObservation({
      studentId: testStudent.id,
      dimensionId: 'participacao',
      polarity: 'positiva',
      teacherId: 'prof-01'
    });

    const alerts = store.calculateMTSSAlerts();
    const alert = alerts.find(a => a.studentId === testStudent.id);
    assert.ok(alert, 'Deve existir alerta para o estudante de teste');
    // Deve ser Tier 2 devido as 5 tarefas pendentes, NUNCA Tier 1
    assert.strictEqual(alert.tier, 'Tier 2', 'Estudante com 5 tarefas pendentes deve ser classificado em Tier 2 (Suporte Focado)');
    assert.ok(alert.reasons.some(r => r.includes('5 pendencias')), 'Deve apontar as 5 tarefas pendentes');
  });

  test('Validacoes rigorosas de entrada no DataStore', () => {
    const store = new DataStore(testDbPath);

    // Dimensao invalida
    assert.throws(() => {
      store.addObservation({
        studentId: 'alu-001',
        dimensionId: 'invalida' as any,
        polarity: 'positiva'
      });
    }, /Dimensao invalida/);

    // Polaridade invalida
    assert.throws(() => {
      store.addObservation({
        studentId: 'alu-001',
        dimensionId: 'responsabilidade',
        polarity: 'invalida' as any
      });
    }, /Polaridade invalida/);

    // Notas de autoavaliacao fora da faixa 1 a 5
    assert.throws(() => {
      store.addSelfEvaluation({
        studentId: 'alu-001',
        period: '1o Bimestre / 2026',
        ratings: {
          responsabilidade: 99,
          colaboracao: 4,
          autonomia: 4,
          participacao: 4,
          respeito: 5
        },
        reflectionText: ''
      });
    }, /deve ser um numero entre 1 e 5/);

    // Intervencao com nivel invalido
    assert.throws(() => {
      store.addIntervention({
        studentId: 'alu-001',
        studentName: 'Lucas',
        classId: 'turma-5a',
        className: '5o Ano A',
        tier: 'Tier 1' as any, // Tier 1 e universal, nao individual
        title: 'Teste',
        strategy: 'Estrategia',
        targetDimension: 'responsabilidade',
        responsibleName: 'Prof',
        startDate: '2026-03-01',
        reviewDate: '2026-04-01',
        status: 'Em Andamento'
      });
    }, /Nivel MTSS invalido/);

    // Atualizacao de intervencao com status invalido
    assert.throws(() => {
      store.updateInterventionStatus('int-001', 'Invalido' as any);
    }, /Status de intervencao invalido/);

    // Dialogo com autor invalido
    assert.throws(() => {
      store.addDialogueRequest({
        studentId: 'alu-001',
        authorType: 'Invasor' as any,
        authorName: 'Anonimo',
        message: 'Mensagem'
      });
    }, /Tipo de autor invalido/);
  });

  test('Calculo de Clima Escolar quando nao ha observacoes (fallback consistente 0.0%)', () => {
    const store = new DataStore(testDbPath);
    const db = store.getDb();
    // Limpa todas as observacoes
    db.observations = [];

    const climate = store.calculateSchoolClimate();
    assert.strictEqual(climate.totalObservations, 0);
    assert.strictEqual(climate.climateIndex, 0.0);
    assert.strictEqual(climate.percentages.positive, 0);
  });
});
