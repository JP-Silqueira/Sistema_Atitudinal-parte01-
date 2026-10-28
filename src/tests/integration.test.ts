import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createHttpServer } from '../server.js';
import { DataStore } from '../dataStore.js';

describe('Testes de Integracao de Todas as Paginas Estaticas e Rotas', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    const store = new DataStore();
    server = createHttpServer(store);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  const staticEndpoints = [
    { path: '/', expectedType: 'text/html' },
    { path: '/professor.html', expectedType: 'text/html' },
    { path: '/coordenacao.html', expectedType: 'text/html' },
    { path: '/estudante.html', expectedType: 'text/html' },
    { path: '/css/style.css', expectedType: 'text/css' },
    { path: '/js/app.js', expectedType: 'application/javascript' },
    { path: '/documentacao/index.html', expectedType: 'text/html' },
    { path: '/documentacao/mapa-navegacao.html', expectedType: 'text/html' },
    { path: '/documentacao/wireframes.html', expectedType: 'text/html' }
  ];

  for (const ep of staticEndpoints) {
    test(`Servico estatico: ${ep.path}`, async () => {
      const res = await fetch(`${baseUrl}${ep.path}`);
      assert.strictEqual(res.status, 200, `Status deve ser 200 para ${ep.path}`);
      const ct = res.headers.get('content-type') || '';
      assert.ok(ct.includes(ep.expectedType), `Content-Type deve conter ${ep.expectedType}, obteve ${ct}`);
      const text = await res.text();
      assert.ok(text.length > 50, `Conteudo de ${ep.path} nao deve ser vazio`);
    });
  }

  const apiEndpoints = [
    '/api/health',
    '/api/classes',
    '/api/dimensions',
    '/api/alerts',
    '/api/climate',
    '/api/interventions',
    '/api/audit',
    '/api/self-evaluations',
    '/api/dialogues',
    '/api/students/alu-001/radar'
  ];

  for (const ep of apiEndpoints) {
    test(`API Endpoint: ${ep}`, async () => {
      const res = await fetch(`${baseUrl}${ep}`);
      assert.strictEqual(res.status, 200, `Status deve ser 200 para ${ep}`);
      const ct = res.headers.get('content-type') || '';
      assert.ok(ct.includes('application/json'), `Content-Type deve ser json para ${ep}`);
      const data = await res.json();
      assert.ok(data !== null && data !== undefined);
    });
  }

  test('Submissao completa de Autoavaliacao Discente e reflexo no Radar', async () => {
    const payload = {
      studentId: 'alu-002',
      period: '1o Bimestre / 2026',
      ratings: {
        responsabilidade: 5,
        colaboracao: 5,
        autonomia: 4,
        participacao: 4,
        respeito: 5
      },
      reflectionText: 'Teste de autoavaliacao integrado.'
    };
    const postRes = await fetch(`${baseUrl}/api/self-evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(postRes.status, 201);

    const radarRes = await fetch(`${baseUrl}/api/students/alu-002/radar`);
    assert.strictEqual(radarRes.status, 200);
    const radarData: any = await radarRes.json();
    assert.strictEqual(radarData.selfRatings.responsabilidade, 5);
  });

  test('Abertura e Resposta de Solicitacao de Dialogo Etico', async () => {
    const diaPayload = {
      studentId: 'alu-002',
      authorType: 'Estudante',
      authorName: 'Beatriz Almeida Costa',
      message: 'Solicito reuniao para alinhar minhas metas de autonomia.'
    };
    const postRes = await fetch(`${baseUrl}/api/dialogues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(diaPayload)
    });
    assert.strictEqual(postRes.status, 201);
    const diaData: any = await postRes.json();

    const patchRes = await fetch(`${baseUrl}/api/dialogues/${diaData.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response: 'Reuniao agendada para sexta-feira as 14h.',
        respondedBy: 'Orientacao Pedagogica'
      })
    });
    assert.strictEqual(patchRes.status, 200);
    const updatedDia: any = await patchRes.json();
    assert.strictEqual(updatedDia.status, 'Respondido');
  });

  test('Criacao e Conclusao de Plano de Intervencao MTSS', async () => {
    const intPayload = {
      studentId: 'alu-003',
      tier: 'Tier 2',
      targetDimension: 'responsabilidade',
      title: 'Apoio com materiais',
      strategy: 'Checklist diario',
      responsibleName: 'Prof. Carlos'
    };
    const postRes = await fetch(`${baseUrl}/api/interventions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intPayload)
    });
    assert.strictEqual(postRes.status, 201);
    const intData: any = await postRes.json();

    const patchRes = await fetch(`${baseUrl}/api/interventions/${intData.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Concluido' })
    });
    assert.strictEqual(patchRes.status, 200);
    const updatedInt: any = await patchRes.json();
    assert.strictEqual(updatedInt.status, 'Concluido');
  });
});
