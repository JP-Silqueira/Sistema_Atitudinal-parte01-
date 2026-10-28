import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createHttpServer } from '../server.js';
import { DataStore } from '../dataStore.js';

describe('Servidor HTTP Nativo e Endpoints REST (Sem Framework)', () => {
  let server: http.Server;
  let baseUrl: string;
  const testDbPath = path.join(process.cwd(), 'data', 'test-server-db.json');

  before(async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    const store = new DataStore(testDbPath);
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
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  async function request(path: string, options: { method?: string; body?: any } = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {}
    return { status: res.status, headers: res.headers, text, json };
  }

  test('GET /api/health retorna status ok', async () => {
    const res = await request('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.status, 'ok');
  });

  test('GET /api/classes retorna turmas dos tres segmentos', async () => {
    const res = await request('/api/classes');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json));
    assert.ok(res.json.length >= 3);
  });

  test('GET /api/alerts retorna alertas MTSS calculados', async () => {
    const res = await request('/api/alerts');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json));
    assert.ok(res.json.some((a: any) => a.tier === 'Tier 3'));
  });

  test('GET /api/climate retorna metricas de clima escolar', async () => {
    const res = await request('/api/climate');
    assert.strictEqual(res.status, 200);
    assert.ok(res.json.totalStudents > 0);
    assert.ok(res.json.radarDimensions);
  });

  test('POST /api/observations cria observacao atitudinal em 3 cliques', async () => {
    const payload = {
      studentId: 'alu-002',
      dimensionId: 'colaboracao',
      polarity: 'positiva',
      note: 'Apoiou colega na organizacao de bancada.',
      teacherId: 'prof-01',
      teacherName: 'Prof. Carlos'
    };
    const res = await request('/api/observations', {
      method: 'POST',
      body: payload
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.json.studentId, 'alu-002');
    assert.strictEqual(res.json.dimensionId, 'colaboracao');
  });

  test('GET /api/audit retorna trilha de auditoria LGPD', async () => {
    const res = await request('/api/audit');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.json));
    assert.ok(res.json.length > 0);
  });

  test('Validacao de ausencia total de emotes/emojis nas respostas de API', async () => {
    const endpoints = ['/api/classes', '/api/dimensions', '/api/alerts', '/api/climate'];
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    for (const ep of endpoints) {
      const res = await request(ep);
      assert.strictEqual(emojiRegex.test(res.text), false, `Endpoint ${ep} nao deve conter emotes/emojis`);
    }
  });

  test('GET /api/students/:id retorna estudante especifico e 404 para inexistente', async () => {
    const resFound = await request('/api/students/alu-001');
    assert.strictEqual(resFound.status, 200);
    assert.strictEqual(resFound.json.id, 'alu-001');
    assert.strictEqual(resFound.json.name, 'Lucas Ferreira Lima');

    const resNotFound = await request('/api/students/alu-inexistente');
    assert.strictEqual(resNotFound.status, 404);
    assert.ok(resNotFound.json.error);
  });

  test('POST /api/self-evaluations rejeita notas invalidas com status 400', async () => {
    const res = await request('/api/self-evaluations', {
      method: 'POST',
      body: {
        studentId: 'alu-001',
        ratings: {
          responsabilidade: 10, // Invalido (> 5)
          colaboracao: 4,
          autonomia: 4,
          participacao: 4,
          respeito: 4
        }
      }
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.json.error.includes('entre 1 e 5'));
  });

  test('POST com JSON malformado retorna status 400', async () => {
    const rawRes = await fetch(`${baseUrl}/api/observations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ json_invalido: sem_aspas '
    });
    assert.strictEqual(rawRes.status, 400);
    const data: any = await rawRes.json();
    assert.ok(data.error.includes('JSON invalido'));
  });

  test('Servico estatico: /documentacao sem barra final responde status 200', async () => {
    const res = await fetch(`${baseUrl}/documentacao`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('Documentacao de Engenharia e UX'));
  });

  test('Servico estatico: /public/index.html responde status 200', async () => {
    const res = await fetch(`${baseUrl}/public/index.html`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('EduAtitude'));
  });
});
