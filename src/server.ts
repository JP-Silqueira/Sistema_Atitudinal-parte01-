import http, { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataStore } from './dataStore.js';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon'
};

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        const err = new Error('Corpo da requisicao excede o limite permitido (1MB).');
        (err as any).statusCode = 413;
        reject(err);
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        const error = new Error('JSON invalido no corpo da requisicao.');
        (error as any).statusCode = 400;
        reject(error);
      }
    });
    req.on('error', err => reject(err));
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(json);
}

function sendError(res: ServerResponse, statusCode: number, message: string) {
  sendJson(res, statusCode, { error: message });
}

export function createHttpServer(dataStore?: DataStore): http.Server {
  const store = dataStore || new DataStore();
  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, 'public');
  const docDir = path.join(rootDir, 'documentacao');

  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method || 'GET';

    // CORS pre-flight
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    try {
      // Rotas de API
      if (pathname.startsWith('/api/')) {
        // GET /api/health
        if (pathname === '/api/health' && method === 'GET') {
          return sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
        }

        // GET /api/classes
        if (pathname === '/api/classes' && method === 'GET') {
          return sendJson(res, 200, store.getClasses());
        }

        // GET /api/dimensions
        if (pathname === '/api/dimensions' && method === 'GET') {
          return sendJson(res, 200, store.getDimensions());
        }

        // GET /api/students
        if (pathname === '/api/students' && method === 'GET') {
          const classId = parsedUrl.searchParams.get('classId') || undefined;
          return sendJson(res, 200, store.getStudents(classId));
        }

        // GET /api/students/:id/radar
        const studentRadarMatch = pathname.match(/^\/api\/students\/([^/]+)\/radar$/);
        if (studentRadarMatch && method === 'GET') {
          const studentId = studentRadarMatch[1];
          try {
            const radar = store.getStudentRadar(studentId);
            return sendJson(res, 200, radar);
          } catch (e: any) {
            return sendError(res, 404, e.message);
          }
        }

        // GET /api/students/:id
        const studentDetailMatch = pathname.match(/^\/api\/students\/([^/]+)$/);
        if (studentDetailMatch && method === 'GET') {
          const studentId = studentDetailMatch[1];
          const student = store.getStudentById(studentId);
          if (!student) {
            return sendError(res, 404, `Estudante ${studentId} nao encontrado.`);
          }
          return sendJson(res, 200, student);
        }

        // GET /api/observations
        if (pathname === '/api/observations' && method === 'GET') {
          const studentId = parsedUrl.searchParams.get('studentId') || undefined;
          const classId = parsedUrl.searchParams.get('classId') || undefined;
          const dimensionId = (parsedUrl.searchParams.get('dimensionId') as any) || undefined;
          const obs = store.getObservations({ studentId, classId, dimensionId });
          return sendJson(res, 200, obs);
        }

        // POST /api/observations (Registro Rapido Docente)
        if (pathname === '/api/observations' && method === 'POST') {
          const body = await readBody(req);
          if (!body.studentId || !body.dimensionId || !body.polarity) {
            return sendError(res, 400, 'Campos obrigatorios: studentId, dimensionId, polarity');
          }
          try {
            const newObs = store.addObservation({
              studentId: body.studentId,
              dimensionId: body.dimensionId,
              polarity: body.polarity,
              note: body.note,
              teacherId: body.teacherId,
              teacherName: body.teacherName
            });
            return sendJson(res, 201, newObs);
          } catch (e: any) {
            return sendError(res, 400, e.message);
          }
        }

        // GET /api/alerts (Sistema de Alerta Precoce MTSS)
        if (pathname === '/api/alerts' && method === 'GET') {
          const classId = parsedUrl.searchParams.get('classId') || undefined;
          const alerts = store.calculateMTSSAlerts(classId);
          return sendJson(res, 200, alerts);
        }

        // GET /api/climate (Gestao de Clima Escolar e Radar Kindbegrip Agregado)
        if (pathname === '/api/climate' && method === 'GET') {
          const classId = parsedUrl.searchParams.get('classId') || undefined;
          const climate = store.calculateSchoolClimate(classId);
          return sendJson(res, 200, climate);
        }

        // GET /api/interventions
        if (pathname === '/api/interventions' && method === 'GET') {
          const classId = parsedUrl.searchParams.get('classId') || undefined;
          return sendJson(res, 200, store.getInterventions(classId));
        }

        // POST /api/interventions
        if (pathname === '/api/interventions' && method === 'POST') {
          const body = await readBody(req);
          if (!body.studentId || !body.title || !body.strategy || !body.targetDimension) {
            return sendError(res, 400, 'Campos obrigatorios: studentId, title, strategy, targetDimension');
          }
          const student = store.getStudentById(body.studentId);
          if (!student) {
            return sendError(res, 404, 'Estudante nao encontrado');
          }
          const classObj = store.getClasses().find(c => c.id === student.classId);

          const newInt = store.addIntervention({
            studentId: student.id,
            studentName: student.name,
            classId: student.classId,
            className: classObj ? classObj.name : student.classId,
            tier: body.tier || 'Tier 2',
            title: body.title,
            strategy: body.strategy,
            targetDimension: body.targetDimension,
            responsibleName: body.responsibleName || 'Coordenacao Pedagogica',
            startDate: body.startDate || new Date().toISOString().split('T')[0],
            reviewDate: body.reviewDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
            status: body.status || 'Em Planejamento'
          });
          return sendJson(res, 201, newInt);
        }

        // PATCH /api/interventions/:id
        const patchInterventionMatch = pathname.match(/^\/api\/interventions\/([^/]+)$/);
        if (patchInterventionMatch && method === 'PATCH') {
          const id = patchInterventionMatch[1];
          const body = await readBody(req);
          if (!body.status) {
            return sendError(res, 400, 'Campo status e obrigatorio.');
          }
          try {
            const updated = store.updateInterventionStatus(id, body.status);
            return sendJson(res, 200, updated);
          } catch (e: any) {
            return sendError(res, 404, e.message);
          }
        }

        // GET /api/self-evaluations
        if (pathname === '/api/self-evaluations' && method === 'GET') {
          const studentId = parsedUrl.searchParams.get('studentId') || undefined;
          return sendJson(res, 200, store.getSelfEvaluations(studentId));
        }

        // POST /api/self-evaluations
        if (pathname === '/api/self-evaluations' && method === 'POST') {
          const body = await readBody(req);
          if (!body.studentId || !body.ratings) {
            return sendError(res, 400, 'Campos obrigatorios: studentId, ratings');
          }
          try {
            const newEval = store.addSelfEvaluation({
              studentId: body.studentId,
              period: body.period || '1o Bimestre / 2026',
              ratings: body.ratings,
              reflectionText: body.reflectionText || ''
            });
            return sendJson(res, 201, newEval);
          } catch (e: any) {
            return sendError(res, 400, e.message);
          }
        }

        // GET /api/dialogues
        if (pathname === '/api/dialogues' && method === 'GET') {
          const studentId = parsedUrl.searchParams.get('studentId') || undefined;
          return sendJson(res, 200, store.getDialogueRequests(studentId));
        }

        // POST /api/dialogues
        if (pathname === '/api/dialogues' && method === 'POST') {
          const body = await readBody(req);
          if (!body.studentId || !body.authorName || !body.message) {
            return sendError(res, 400, 'Campos obrigatorios: studentId, authorName, message');
          }
          try {
            const newDia = store.addDialogueRequest({
              observationId: body.observationId,
              studentId: body.studentId,
              authorType: body.authorType || 'Estudante',
              authorName: body.authorName,
              message: body.message
            });
            return sendJson(res, 201, newDia);
          } catch (e: any) {
            return sendError(res, 400, e.message);
          }
        }

        // PATCH /api/dialogues/:id
        const patchDialogueMatch = pathname.match(/^\/api\/dialogues\/([^/]+)$/);
        if (patchDialogueMatch && method === 'PATCH') {
          const id = patchDialogueMatch[1];
          const body = await readBody(req);
          if (!body.response || !body.respondedBy) {
            return sendError(res, 400, 'Campos obrigatorios: response, respondedBy');
          }
          try {
            const updated = store.respondDialogueRequest(id, body.response, body.respondedBy);
            return sendJson(res, 200, updated);
          } catch (e: any) {
            return sendError(res, 404, e.message);
          }
        }

        // GET /api/audit (Trilha de Auditoria LGPD)
        if (pathname === '/api/audit' && method === 'GET') {
          const studentId = parsedUrl.searchParams.get('studentId') || undefined;
          return sendJson(res, 200, store.getAuditLogs(studentId));
        }

        // Rota de API nao encontrada
        return sendError(res, 404, `Endpoint da API nao encontrado: ${pathname}`);
      }

      // Servico de Arquivos Estaticos (HTML, CSS, JS, etc.)
      let filePath: string;
      if (pathname === '/' || pathname === '/index.html') {
        filePath = path.join(publicDir, 'index.html');
      } else if (pathname === '/documentacao' || pathname === '/documentacao/') {
        filePath = path.join(docDir, 'index.html');
      } else if (pathname.startsWith('/documentacao/')) {
        const subPath = pathname.substring('/documentacao/'.length) || 'index.html';
        filePath = path.join(docDir, subPath);
        if (!path.extname(filePath)) {
          if (fs.existsSync(filePath + '.html')) {
            filePath = filePath + '.html';
          } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
            filePath = path.join(filePath, 'index.html');
          }
        }
      } else {
        let cleanPath = pathname.startsWith('/') ? pathname.substring(1) : pathname;
        if (cleanPath.startsWith('public/')) {
          cleanPath = cleanPath.substring('public/'.length);
        }
        if (!cleanPath || cleanPath === 'index.html') {
          filePath = path.join(publicDir, 'index.html');
        } else {
          filePath = path.join(publicDir, cleanPath);
          if (!path.extname(filePath)) {
            if (fs.existsSync(filePath + '.html')) {
              filePath = filePath + '.html';
            } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
              filePath = path.join(filePath, 'index.html');
            }
          }
        }
      }

      // Seguranca contra Directory Traversal
      const resolvedPath = path.resolve(filePath);
      if (!resolvedPath.startsWith(publicDir) && !resolvedPath.startsWith(docDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Acesso negado.');
        return;
      }

      // Verifica se arquivo existe
      if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Pagina Nao Encontrada</title></head>
<body style="font-family:sans-serif;padding:40px;text-align:center;">
  <h2>404 - Pagina Nao Encontrada</h2>
  <p>O arquivo solicitado nao foi localizado no servidor.</p>
  <p><a href="/">Retornar ao Inicio</a></p>
</body>
</html>`);
        return;
      }

      const ext = path.extname(resolvedPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      const fileContent = fs.readFileSync(resolvedPath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': fileContent.length
      });
      res.end(fileContent);

    } catch (err: any) {
      const statusCode = (typeof err?.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600)
        ? err.statusCode
        : 500;
      if (statusCode >= 500) {
        console.error('Erro interno no servidor:', err);
      }
      sendError(res, statusCode, err.message || 'Erro interno no servidor.');
    }
  });

  return server;
}

// Inicializacao quando executado diretamente
const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (invokedFile && (invokedFile === currentFile || invokedFile.endsWith('server.ts') || invokedFile.endsWith('server.js'))) {
  const PORT = Number(process.env.PORT) || 3000;
  const server = createHttpServer();
  server.listen(PORT, () => {
    console.log(`[Servidor EduAtitude] Rodando com sucesso em http://localhost:${PORT}`);
  });
}
