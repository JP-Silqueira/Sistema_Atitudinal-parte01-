import { DatabaseSchema, Dimension } from './types.js';

export const initialDimensions: Dimension[] = [
  {
    id: 'responsabilidade',
    name: 'Responsabilidade',
    description: 'Cumprimento de acordos, pontualidade, zelo pelos materiais e compromisso com os prazos escolares.',
    caselCategory: 'Tomada de Decisao Responsavel e Autogestao',
    bnccCompetencies: ['Competencia Geral 7 - Autonomia e Cidadania', 'Competencia Geral 10 - Responsabilidade e Cidadania']
  },
  {
    id: 'colaboracao',
    name: 'Colaboracao',
    description: 'Atuacao solidaria em equipes, escuta ativa, compartilhamento de saberes e respeito a pontos de vista divergentes.',
    caselCategory: 'Habilidades de Relacionamento',
    bnccCompetencies: ['Competencia Geral 8 - Autoconhecimento e Autocuidado', 'Competencia Geral 9 - Empatia e Cooperacao']
  },
  {
    id: 'autonomia',
    name: 'Autonomia',
    description: 'Iniciativa para resolver problemas, autorregulacao da aprendizagem e persistencia frente a desafios.',
    caselCategory: 'Autogestao e Consciencia de Si',
    bnccCompetencies: ['Competencia Geral 6 - Trabalho e Projeto de Vida', 'Competencia Geral 7 - Argumentacao']
  },
  {
    id: 'participacao',
    name: 'Participacao',
    description: 'Engajamento construtivo nas discussoes coletivas, formulacao de perguntas e interesse ativo nas aulas.',
    caselCategory: 'Consciencia Social e Engajamento',
    bnccCompetencies: ['Competencia Geral 1 - Conhecimento', 'Competencia Geral 2 - Pensamento Cientifico, Critico e Criativo']
  },
  {
    id: 'respeito',
    name: 'Respeito e Convivencia',
    description: 'Pratica de comunicacao nao violenta, cordialidade com colegas e educadores e cumprimento das normas comunitarias.',
    caselCategory: 'Consciencia Social e Habilidades de Relacionamento',
    bnccCompetencies: ['Competencia Geral 3 - Repertorio Cultural', 'Competencia Geral 9 - Empatia e Cooperacao']
  }
];

export function generateSeedData(): DatabaseSchema {
  const classes = [
    {
      id: 'turma-5a',
      name: '5o Ano A',
      segment: 'Fundamental I' as const,
      grade: '5o Ano',
      schoolYear: 2026
    },
    {
      id: 'turma-8b',
      name: '8o Ano B',
      segment: 'Fundamental II' as const,
      grade: '8o Ano',
      schoolYear: 2026
    },
    {
      id: 'turma-2em',
      name: '2o Ano A - Ensino Medio',
      segment: 'Ensino Medio' as const,
      grade: '2o Ano',
      schoolYear: 2026
    }
  ];

  const students = [
    // Turma 5o Ano A (Fundamental I)
    {
      id: 'alu-001',
      classId: 'turma-5a',
      name: 'Lucas Ferreira Lima',
      enrollmentNumber: '2026-F1-01',
      attendanceRate: 98,
      missingAssignments: 0,
      guardianName: 'Marcos Lima',
      guardianEmail: 'marcos.lima@email.com'
    },
    {
      id: 'alu-002',
      classId: 'turma-5a',
      name: 'Beatriz Almeida Costa',
      enrollmentNumber: '2026-F1-02',
      attendanceRate: 92,
      missingAssignments: 1,
      guardianName: 'Claudia Costa',
      guardianEmail: 'claudia.costa@email.com'
    },
    {
      id: 'alu-003',
      classId: 'turma-5a',
      name: 'Gabriel Ribeiro Rocha',
      enrollmentNumber: '2026-F1-03',
      attendanceRate: 81,
      missingAssignments: 3,
      guardianName: 'Renata Rocha',
      guardianEmail: 'renata.rocha@email.com'
    },
    {
      id: 'alu-004',
      classId: 'turma-5a',
      name: 'Sophia Mendes Barbosa',
      enrollmentNumber: '2026-F1-04',
      attendanceRate: 95,
      missingAssignments: 0,
      guardianName: 'Eduardo Barbosa',
      guardianEmail: 'eduardo.barbosa@email.com'
    },
    {
      id: 'alu-005',
      classId: 'turma-5a',
      name: 'Thiago Nogueira Duarte',
      enrollmentNumber: '2026-F1-05',
      attendanceRate: 72,
      missingAssignments: 5,
      guardianName: 'Fernanda Duarte',
      guardianEmail: 'fernanda.duarte@email.com'
    },

    // Turma 8o Ano B (Fundamental II)
    {
      id: 'alu-101',
      classId: 'turma-8b',
      name: 'Juliana Pires Vieira',
      enrollmentNumber: '2026-F2-11',
      attendanceRate: 96,
      missingAssignments: 0,
      guardianName: 'Patricia Vieira',
      guardianEmail: 'patricia.vieira@email.com'
    },
    {
      id: 'alu-102',
      classId: 'turma-8b',
      name: 'Enzo Martins Prado',
      enrollmentNumber: '2026-F2-12',
      attendanceRate: 79,
      missingAssignments: 3,
      guardianName: 'Sergio Prado',
      guardianEmail: 'sergio.prado@email.com'
    },
    {
      id: 'alu-103',
      classId: 'turma-8b',
      name: 'Mariana Cardoso Silva',
      enrollmentNumber: '2026-F2-13',
      attendanceRate: 91,
      missingAssignments: 1,
      guardianName: 'Daniela Silva',
      guardianEmail: 'daniela.silva@email.com'
    },
    {
      id: 'alu-104',
      classId: 'turma-8b',
      name: 'Matheus Henrique Sousa',
      enrollmentNumber: '2026-F2-14',
      attendanceRate: 68,
      missingAssignments: 6,
      guardianName: 'Valeria Sousa',
      guardianEmail: 'valeria.sousa@email.com'
    },
    {
      id: 'alu-105',
      classId: 'turma-8b',
      name: 'Leticia Ramos Cruz',
      enrollmentNumber: '2026-F2-15',
      attendanceRate: 88,
      missingAssignments: 1,
      guardianName: 'Marcelo Cruz',
      guardianEmail: 'marcelo.cruz@email.com'
    },

    // Turma 2o Ano A - Ensino Medio
    {
      id: 'alu-201',
      classId: 'turma-2em',
      name: 'Arthur Fonseca Ramos',
      enrollmentNumber: '2026-EM-21',
      attendanceRate: 94,
      missingAssignments: 0,
      guardianName: 'Luciana Ramos',
      guardianEmail: 'luciana.ramos@email.com'
    },
    {
      id: 'alu-202',
      classId: 'turma-2em',
      name: 'Camila Teixeira Guimaraes',
      enrollmentNumber: '2026-EM-22',
      attendanceRate: 83,
      missingAssignments: 2,
      guardianName: 'Andre Guimaraes',
      guardianEmail: 'andre.guimaraes@email.com'
    },
    {
      id: 'alu-203',
      classId: 'turma-2em',
      name: 'Felipe Santana Antunes',
      enrollmentNumber: '2026-EM-23',
      attendanceRate: 71,
      missingAssignments: 5,
      guardianName: 'Monica Antunes',
      guardianEmail: 'monica.antunes@email.com'
    },
    {
      id: 'alu-204',
      classId: 'turma-2em',
      name: 'Larissa Moura Cavalcanti',
      enrollmentNumber: '2026-EM-24',
      attendanceRate: 97,
      missingAssignments: 0,
      guardianName: 'Jorge Cavalcanti',
      guardianEmail: 'jorge.cavalcanti@email.com'
    }
  ];

  const observations = [
    // Observacoes para Lucas Ferreira (5o Ano A)
    {
      id: 'obs-001',
      studentId: 'alu-001',
      studentName: 'Lucas Ferreira Lima',
      classId: 'turma-5a',
      teacherId: 'prof-01',
      teacherName: 'Prof. Carlos Eduardo Mendonca',
      dimensionId: 'colaboracao' as const,
      polarity: 'positiva' as const,
      note: 'Auxiliou colegas com dificuldades na organizacao do trabalho interdisciplinar de ciencias.',
      timestamp: '2026-03-10T09:30:00.000Z'
    },
    {
      id: 'obs-002',
      studentId: 'alu-001',
      studentName: 'Lucas Ferreira Lima',
      classId: 'turma-5a',
      teacherId: 'prof-02',
      teacherName: 'Profa. Mariana Vasconcelos',
      dimensionId: 'responsabilidade' as const,
      polarity: 'positiva' as const,
      note: 'Entregou todas as tarefas antes do prazo estipulado e manteve seu espaco individual impecavel.',
      timestamp: '2026-03-15T14:10:00.000Z'
    },
    {
      id: 'obs-003',
      studentId: 'alu-001',
      studentName: 'Lucas Ferreira Lima',
      classId: 'turma-5a',
      teacherId: 'prof-01',
      teacherName: 'Prof. Carlos Eduardo Mendonca',
      dimensionId: 'autonomia' as const,
      polarity: 'positiva' as const,
      note: 'Propôs solucao criativa durante resolucao de exercicios matematicos sem depender de intervencao direta.',
      timestamp: '2026-03-22T10:15:00.000Z'
    },

    // Observacoes para Gabriel Ribeiro (5o Ano A - Tier 2)
    {
      id: 'obs-004',
      studentId: 'alu-003',
      studentName: 'Gabriel Ribeiro Rocha',
      classId: 'turma-5a',
      teacherId: 'prof-01',
      teacherName: 'Prof. Carlos Eduardo Mendonca',
      dimensionId: 'responsabilidade' as const,
      polarity: 'oportunidade' as const,
      note: 'Esqueceu o caderno de registros pelo terceiro dia consecutivo nesta quinzena.',
      timestamp: '2026-03-12T11:00:00.000Z'
    },
    {
      id: 'obs-005',
      studentId: 'alu-003',
      studentName: 'Gabriel Ribeiro Rocha',
      classId: 'turma-5a',
      teacherId: 'prof-02',
      teacherName: 'Profa. Mariana Vasconcelos',
      dimensionId: 'participacao' as const,
      polarity: 'positiva' as const,
      note: 'Demonstrou alto engajamento no debate oral sobre historia regional.',
      timestamp: '2026-03-18T15:20:00.000Z'
    },
    {
      id: 'obs-006',
      studentId: 'alu-003',
      studentName: 'Gabriel Ribeiro Rocha',
      classId: 'turma-5a',
      teacherId: 'prof-01',
      teacherName: 'Prof. Carlos Eduardo Mendonca',
      dimensionId: 'autonomia' as const,
      polarity: 'oportunidade' as const,
      note: 'Dificuldade em gerenciar o tempo durante atividades individuais em sala.',
      timestamp: '2026-03-25T10:40:00.000Z'
    },

    // Observacoes para Thiago Nogueira (5o Ano A - Tier 3)
    {
      id: 'obs-007',
      studentId: 'alu-005',
      studentName: 'Thiago Nogueira Duarte',
      classId: 'turma-5a',
      teacherId: 'prof-01',
      teacherName: 'Prof. Carlos Eduardo Mendonca',
      dimensionId: 'responsabilidade' as const,
      polarity: 'oportunidade' as const,
      note: 'Cinco atividades seguidas pendentes de entrega e material didatico ausente.',
      timestamp: '2026-03-08T08:45:00.000Z'
    },
    {
      id: 'obs-008',
      studentId: 'alu-005',
      studentName: 'Thiago Nogueira Duarte',
      classId: 'turma-5a',
      teacherId: 'prof-02',
      teacherName: 'Profa. Mariana Vasconcelos',
      dimensionId: 'respeito' as const,
      polarity: 'oportunidade' as const,
      note: 'Interrompeu repetidamente a fala de colegas em dinâmica de grupo.',
      timestamp: '2026-03-14T13:50:00.000Z'
    },
    {
      id: 'obs-009',
      studentId: 'alu-005',
      studentName: 'Thiago Nogueira Duarte',
      classId: 'turma-5a',
      teacherId: 'prof-01',
      teacherName: 'Prof. Carlos Eduardo Mendonca',
      dimensionId: 'autonomia' as const,
      polarity: 'oportunidade' as const,
      note: 'Demonstra desanimo rapido frente a exercicios que exigem leitura extensa.',
      timestamp: '2026-03-24T09:10:00.000Z'
    },

    // Observacoes para Turma 8o Ano B
    {
      id: 'obs-101',
      studentId: 'alu-101',
      studentName: 'Juliana Pires Vieira',
      classId: 'turma-8b',
      teacherId: 'prof-03',
      teacherName: 'Prof. Roberto Farias',
      dimensionId: 'colaboracao' as const,
      polarity: 'positiva' as const,
      note: 'Liderou o grupo de geografia de forma inclusiva, dividindo tarefas harmonicamente.',
      timestamp: '2026-03-11T10:00:00.000Z'
    },
    {
      id: 'obs-102',
      studentId: 'alu-104',
      studentName: 'Matheus Henrique Sousa',
      classId: 'turma-8b',
      teacherId: 'prof-03',
      teacherName: 'Prof. Roberto Farias',
      dimensionId: 'responsabilidade' as const,
      polarity: 'oportunidade' as const,
      note: 'Nao entregou o relatorio laboratorial do ciclo e frequencia irregular as segundas-feiras.',
      timestamp: '2026-03-16T11:30:00.000Z'
    },
    {
      id: 'obs-103',
      studentId: 'alu-104',
      studentName: 'Matheus Henrique Sousa',
      classId: 'turma-8b',
      teacherId: 'prof-04',
      teacherName: 'Profa. Sandra Regina',
      dimensionId: 'autonomia' as const,
      polarity: 'oportunidade' as const,
      note: 'Relata ansiedade ao trabalhar sozinho; necessita de tutoria orientada.',
      timestamp: '2026-03-21T14:40:00.000Z'
    },

    // Observacoes para 2o Ano EM
    {
      id: 'obs-201',
      studentId: 'alu-201',
      studentName: 'Arthur Fonseca Ramos',
      classId: 'turma-2em',
      teacherId: 'prof-05',
      teacherName: 'Prof. Gilberto Silveira',
      dimensionId: 'participacao' as const,
      polarity: 'positiva' as const,
      note: 'Contribuicao relevante no seminario de sociologia contemporanea.',
      timestamp: '2026-03-09T08:10:00.000Z'
    },
    {
      id: 'obs-202',
      studentId: 'alu-203',
      studentName: 'Felipe Santana Antunes',
      classId: 'turma-2em',
      teacherId: 'prof-05',
      teacherName: 'Prof. Gilberto Silveira',
      dimensionId: 'responsabilidade' as const,
      polarity: 'oportunidade' as const,
      note: 'Atrasos reiterados na primeira aula e acúmulo de atividades bimestrais.',
      timestamp: '2026-03-17T07:45:00.000Z'
    },
    {
      id: 'obs-203',
      studentId: 'alu-203',
      studentName: 'Felipe Santana Antunes',
      classId: 'turma-2em',
      teacherId: 'prof-05',
      teacherName: 'Prof. Gilberto Silveira',
      dimensionId: 'autonomia' as const,
      polarity: 'neutra' as const,
      note: 'Iniciou projeto de pesquisa individual mas pausou para redefinir tema.',
      timestamp: '2026-03-23T08:30:00.000Z'
    }
  ];

  const interventions = [
    {
      id: 'int-001',
      studentId: 'alu-005',
      studentName: 'Thiago Nogueira Duarte',
      classId: 'turma-5a',
      className: '5o Ano A',
      tier: 'Tier 3' as const,
      title: 'Plano Intensivo de Apoio a Frequencia e Organizacao Escolar',
      strategy: 'Tutoria individualizada semanal com orientadora pedagogica e agenda adaptada de tarefas em blocos menores.',
      targetDimension: 'responsabilidade' as const,
      responsibleName: 'Helena Matos (Orientacao Pedagogica)',
      startDate: '2026-03-15',
      reviewDate: '2026-04-15',
      status: 'Em Andamento' as const
    },
    {
      id: 'int-002',
      studentId: 'alu-104',
      studentName: 'Matheus Henrique Sousa',
      classId: 'turma-8b',
      className: '8o Ano B',
      tier: 'Tier 3' as const,
      title: 'Acompanhamento Multidisciplinar e Circulo de Escuta',
      strategy: 'Articulacao com a familia para mapear dificuldades de transporte matutino e insercao em grupo de tutoria entre pares.',
      targetDimension: 'autonomia' as const,
      responsibleName: 'Juliana Barbosa (Coordenacao Fundamental II)',
      startDate: '2026-03-18',
      reviewDate: '2026-04-20',
      status: 'Em Andamento' as const
    },
    {
      id: 'int-003',
      studentId: 'alu-003',
      studentName: 'Gabriel Ribeiro Rocha',
      classId: 'turma-5a',
      className: '5o Ano A',
      tier: 'Tier 2' as const,
      title: 'Contrato Pedagogico Formativo de Gestao do Tempo',
      strategy: 'Uso de checklist visual na mesa do estudante para checagem previa de materiais e prazos.',
      targetDimension: 'responsabilidade' as const,
      responsibleName: 'Prof. Carlos Eduardo Mendonca',
      startDate: '2026-03-20',
      reviewDate: '2026-04-10',
      status: 'Em Planejamento' as const
    }
  ];

  const selfEvaluations = [
    {
      id: 'self-001',
      studentId: 'alu-001',
      studentName: 'Lucas Ferreira Lima',
      period: '1o Bimestre / 2026',
      ratings: {
        responsabilidade: 5,
        colaboracao: 5,
        autonomia: 4,
        participacao: 4,
        respeito: 5
      },
      reflectionText: 'Senti que consegui ajudar bastante minha equipe neste bimestre. Quero tentar falar mais nas aulas de historia sem receio de errar.',
      submittedAt: '2026-03-20T16:00:00.000Z'
    },
    {
      id: 'self-002',
      studentId: 'alu-003',
      studentName: 'Gabriel Ribeiro Rocha',
      period: '1o Bimestre / 2026',
      ratings: {
        responsabilidade: 3,
        colaboracao: 4,
        autonomia: 3,
        participacao: 5,
        respeito: 4
      },
      reflectionText: 'Eu adoro participar das conversas e fazer perguntas, mas as vezes me perco com as datas e esqueço onde guardei os trabalhos.',
      submittedAt: '2026-03-22T14:30:00.000Z'
    },
    {
      id: 'self-003',
      studentId: 'alu-101',
      studentName: 'Juliana Pires Vieira',
      period: '1o Bimestre / 2026',
      ratings: {
        responsabilidade: 5,
        colaboracao: 5,
        autonomia: 4,
        participacao: 4,
        respeito: 5
      },
      reflectionText: 'Gosto de mediar conflitos na turma. Pretendo focar em organizar meus resumos de quimica com mais antecedencia.',
      submittedAt: '2026-03-21T18:15:00.000Z'
    }
  ];

  const dialogueRequests = [
    {
      id: 'dia-001',
      observationId: 'obs-004',
      studentId: 'alu-003',
      studentName: 'Gabriel Ribeiro Rocha',
      authorType: 'Responsavel' as const,
      authorName: 'Renata Rocha (Mae)',
      message: 'Ola professor Carlos, notamos que o Gabriel estava com o caderno em casa porque estavamos revisando a matéria juntos. Criamos uma rotina noturna para ele conferir a mochila.',
      response: 'Prezada Renata, excelente iniciativa! Vamos acompanhar em sala tambem com o checklist na carteira. O diálogo com a família fortalece o aprendizado.',
      respondedBy: 'Prof. Carlos Eduardo Mendonca',
      status: 'Resolvido' as const,
      createdAt: '2026-03-13T10:15:00.000Z',
      updatedAt: '2026-03-14T08:00:00.000Z'
    },
    {
      id: 'dia-002',
      observationId: 'obs-008',
      studentId: 'alu-005',
      studentName: 'Thiago Nogueira Duarte',
      authorType: 'Estudante' as const,
      authorName: 'Thiago Nogueira Duarte',
      message: 'Profa Mariana, eu interrompi porque fiquei muito empolgado com a ideia do vulcao e queria explicar antes de esquecer. Nao foi por maldade, peco desculpas e quero melhorar a escuta.',
      response: 'Oi Thiago, compreendo seu entusiasmo! Vamos combinar um sinal com a mao para voce nao perder o raciocinio e aguardar a vez do colega.',
      respondedBy: 'Profa. Mariana Vasconcelos',
      status: 'Respondido' as const,
      createdAt: '2026-03-15T15:00:00.000Z',
      updatedAt: '2026-03-16T09:20:00.000Z'
    }
  ];

  const auditLogs = [
    {
      id: 'aud-001',
      timestamp: '2026-03-08T08:45:00.000Z',
      actorId: 'prof-01',
      actorName: 'Prof. Carlos Eduardo Mendonca',
      actorRole: 'Professor' as const,
      action: 'REGISTRO_OBSERVACAO',
      resource: 'Observacao obs-007 (Dimensao: responsabilidade, Polaridade: oportunidade)',
      studentId: 'alu-005',
      justification: 'Finalidade pedagogica: identificar necessidade de suporte formativo em rotina e organizacao escolar (LGPD Art. 7).'
    },
    {
      id: 'aud-002',
      timestamp: '2026-03-13T10:15:00.000Z',
      actorId: 'resp-003',
      actorName: 'Renata Rocha (Mae)',
      actorRole: 'Responsavel' as const,
      action: 'ABERTURA_DIALOGO',
      resource: 'Dialogo pedagogico vinculado a observacao obs-004',
      studentId: 'alu-003',
      justification: 'Exercicio do direito a explicabilidade e contextualizacao pedagogica familiar.'
    },
    {
      id: 'aud-003',
      timestamp: '2026-03-15T10:00:00.000Z',
      actorId: 'coord-01',
      actorName: 'Helena Matos (Orientacao Pedagogica)',
      actorRole: 'Coordenador' as const,
      action: 'CRIACAO_INTERVENCAO_MTSS',
      resource: 'Plano de Intervencao int-001 (Tier 3)',
      studentId: 'alu-005',
      justification: 'Protocolo de prevencao a evasao e apoio socioemocional intensivo baseado em indicadores integrados.'
    }
  ];

  return {
    dimensions: initialDimensions,
    classes,
    students,
    observations,
    interventions,
    selfEvaluations,
    dialogueRequests,
    auditLogs
  };
}
