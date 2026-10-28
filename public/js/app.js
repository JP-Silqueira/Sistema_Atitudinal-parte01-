// EduAtitude - Modulo Minimalista de Frontend (JavaScript Vanilla)
// Utilizado estritamente para comunicacao com API REST e renderizacao matematica do SVG Radar Kindbegrip.
// Regra: Zero Emotes / Emojis.

const EduApp = (() => {

  const DIMENSIONS_CONFIG = [
    { id: 'responsabilidade', label: 'Responsabilidade', angle: -90 },
    { id: 'colaboracao', label: 'Colaboracao', angle: -18 },
    { id: 'autonomia', label: 'Autonomia', angle: 54 },
    { id: 'participacao', label: 'Participacao', angle: 126 },
    { id: 'respeito', label: 'Respeito', angle: 198 }
  ];

  let refreshCoordCallbacks = null;
  let refreshProfCallbacks = null;

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function api(path, options = {}) {
    try {
      const fetchOpts = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      };
      if (options.body) {
        fetchOpts.body = JSON.stringify(options.body);
      }
      const res = await fetch(path, fetchOpts);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro na requisicao HTTP.');
      }
      return data;
    } catch (err) {
      console.error('Falha na chamada de API:', path, err);
      throw err;
    }
  }

  function showToast(containerId, message, type = 'success') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.textContent = message;
    el.className = `toast-notice show ${type === 'success' ? 'toast-success' : 'toast-error'}`;
    setTimeout(() => {
      el.className = 'toast-notice';
    }, 4000);
  }

  function formatDate(isoString) {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  }

  // Renderizador Matematico do Grafico de Radar Kindbegrip (SVG Nativo)
  function renderRadarSvg(svgElement, datasets) {
    if (!svgElement) return;

    const cx = 200;
    const cy = 200;
    const maxRadius = 135;
    const totalLevels = 5;

    let svgHtml = '';

    // Circulos/Poligonos concentricos de grade (Niveis 1 a 5)
    for (let level = 1; level <= totalLevels; level++) {
      const r = (maxRadius / totalLevels) * level;
      const points = DIMENSIONS_CONFIG.map(dim => {
        const rad = (dim.angle * Math.PI) / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');

      svgHtml += `<polygon points="${points}" fill="${level % 2 === 0 ? '#f8fafc' : '#ffffff'}" stroke="#cbd5e1" stroke-width="1" />`;
      
      // Rotulo numerico de escala no eixo superior
      const labelY = cy - r + 12;
      svgHtml += `<text x="${cx + 4}" y="${labelY.toFixed(1)}" font-size="10" fill="#94a3b8" font-family="sans-serif">${level}</text>`;
    }

    // Eixos radiais e rotulos de dimensoes
    DIMENSIONS_CONFIG.forEach(dim => {
      const rad = (dim.angle * Math.PI) / 180;
      const xEnd = cx + maxRadius * Math.cos(rad);
      const yEnd = cy + maxRadius * Math.sin(rad);

      // Linha do eixo
      svgHtml += `<line x1="${cx}" y1="${cy}" x2="${xEnd.toFixed(1)}" y2="${yEnd.toFixed(1)}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2,2" />`;

      // Posicao do rotulo textual
      const labelR = maxRadius + 28;
      const xLabel = cx + labelR * Math.cos(rad);
      const yLabel = cy + labelR * Math.sin(rad);
      
      let textAnchor = 'middle';
      if (Math.cos(rad) > 0.3) textAnchor = 'start';
      else if (Math.cos(rad) < -0.3) textAnchor = 'end';

      svgHtml += `<text x="${xLabel.toFixed(1)}" y="${yLabel.toFixed(1)}" text-anchor="${textAnchor}" dominant-baseline="middle" font-size="11" font-weight="600" fill="#1e293b" font-family="sans-serif">${dim.label}</text>`;
    });

    // Renderiza cada dataset de valores
    datasets.forEach(ds => {
      const points = DIMENSIONS_CONFIG.map(dim => {
        const raw = Number(ds.values ? ds.values[dim.id] : 3.5);
        const val = isNaN(raw) ? 3.5 : Math.max(1, Math.min(5, raw));
        const r = (maxRadius / totalLevels) * val;
        const rad = (dim.angle * Math.PI) / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        return { x, y, str: `${x.toFixed(1)},${y.toFixed(1)}` };
      });

      const polyPoints = points.map(p => p.str).join(' ');
      svgHtml += `<polygon points="${polyPoints}" fill="${ds.fillColor}" stroke="${ds.strokeColor}" stroke-width="${ds.strokeWidth || 2}" stroke-dasharray="${ds.dashArray || 'none'}" />`;

      // Pontos marcadores nos vertices
      points.forEach(p => {
        svgHtml += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${ds.strokeColor}" stroke="#ffffff" stroke-width="1.5" />`;
      });
    });

    svgElement.innerHTML = svgHtml;
  }

  // ==========================================
  // 1. PAGINA DO PROFESSOR (MOBILE-FIRST)
  // ==========================================
  function initProfessorPage() {
    let state = {
      turmas: [],
      turmaAtiva: '',
      estudantes: [],
      estudanteId: '',
      estudanteNome: '',
      dimensaoId: '',
      polaridade: ''
    };

    const selectTurma = document.getElementById('select-turma');
    const gradeEstudantes = document.getElementById('grade-estudantes');
    const timelineContainer = document.getElementById('timeline-container');
    const filtroDimensao = document.getElementById('filtro-dimensao');
    const btnConfirmar = document.getElementById('btn-confirmar-registro');
    const btnLimpar = document.getElementById('btn-limpar-selecao');
    const notaObs = document.getElementById('nota-observacao');
    const labelEstudante = document.getElementById('estudante-selecionado-label');
    const labelDimensao = document.getElementById('dimensao-selecionada-label');

    async function carregarTurmas() {
      try {
        state.turmas = await api('/api/classes');
        selectTurma.innerHTML = '';
        state.turmas.forEach((t, i) => {
          const opt = document.createElement('option');
          opt.value = t.id;
          opt.textContent = `${t.name} (${t.segment})`;
          if (i === 0) opt.selected = true;
          selectTurma.appendChild(opt);
        });
        if (state.turmas.length > 0) {
          state.turmaAtiva = state.turmas[0].id;
          await carregarDadosTurma();
        }
      } catch (e) {
        showToast('toast-box', 'Erro ao carregar turmas.', 'error');
      }
    }

    async function carregarDadosTurma() {
      try {
        state.estudantes = await api(`/api/students?classId=${state.turmaAtiva}`);
        renderGradeEstudantes();
        await carregarTimeline();
        await verificarDialogosTurma();
      } catch (e) {
        showToast('toast-box', 'Erro ao carregar dados da turma.', 'error');
      }
    }

    function renderGradeEstudantes() {
      gradeEstudantes.innerHTML = '';
      state.estudantes.forEach(est => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `select-card ${state.estudanteId === est.id ? 'selected' : ''}`;
        btn.dataset.id = est.id;
        btn.dataset.name = est.name;
        btn.innerHTML = `
          <span>${escapeHtml(est.name)}</span>
          <span style="font-size:0.7rem; color:var(--text-light); margin-top:0.2rem;">Mat: ${escapeHtml(est.enrollmentNumber)}</span>
        `;
        btn.addEventListener('click', () => {
          state.estudanteId = est.id;
          state.estudanteNome = est.name;
          labelEstudante.textContent = `Selecionado: ${est.name}`;
          renderGradeEstudantes();
        });
        gradeEstudantes.appendChild(btn);
      });
    }

    async function carregarTimeline() {
      const dim = filtroDimensao.value;
      const url = `/api/observations?classId=${state.turmaAtiva}${dim ? `&dimensionId=${dim}` : ''}`;
      const obsList = await api(url);

      if (obsList.length === 0) {
        timelineContainer.innerHTML = '<p style="padding:1rem; color:var(--text-light); font-size:0.85rem;">Nenhuma evidencia registrada com os filtros aplicados.</p>';
        return;
      }

      timelineContainer.innerHTML = obsList.map(o => {
        const polClass = `polarity-${o.polarity}`;
        const polNome = o.polarity === 'positiva' ? '[Positiva] Forca' : o.polarity === 'oportunidade' ? '[Oportunidade] Crescimento' : '[Neutra] Factual';
        return `
          <article class="timeline-item ${o.polarity}">
            <div class="timeline-header">
              <span class="timeline-student">${escapeHtml(o.studentName)}</span>
              <span class="timeline-date">${formatDate(o.timestamp)}</span>
            </div>
            <div>
              <span class="polarity-badge ${polClass}">${polNome}</span>
              <span style="font-size:0.8rem; font-weight:600; margin-left:0.5rem; text-transform:capitalize;">${escapeHtml(o.dimensionId)}</span>
            </div>
            ${o.note ? `<p class="timeline-note">${escapeHtml(o.note)}</p>` : ''}
            <div class="timeline-author">Registrado por: ${escapeHtml(o.teacherName)}</div>
          </article>
        `;
      }).join('');
    }

    async function verificarDialogosTurma() {
      const alertasBox = document.getElementById('dialogos-alerta-box');
      const dialogosLista = document.getElementById('dialogos-lista');
      const dialogos = await api('/api/dialogues');
      
      const turmaStudentIds = new Set(state.estudantes.map(s => s.id));
      const turmaDialogos = dialogos.filter(d => turmaStudentIds.has(d.studentId));
      const pendentes = turmaDialogos.filter(d => d.status === 'Aberto');

      if (pendentes.length > 0) {
        alertasBox.style.display = 'block';
        document.getElementById('dialogos-alerta-texto').textContent = 
          `Ha ${pendentes.length} solicitacao(oes) de dialogo pedagogico aberta(s) para esta turma.`;
      } else {
        alertasBox.style.display = 'none';
      }

      if (turmaDialogos.length === 0) {
        dialogosLista.innerHTML = '<p style="font-size:0.85rem; color:var(--text-light); padding:0.5rem 0;">Nao ha solicitacoes de dialogo abertas nesta turma.</p>';
        return;
      }

      dialogosLista.innerHTML = turmaDialogos.map(d => `
        <div style="border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:0.85rem; background:#ffffff;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
            <strong>${escapeHtml(d.studentName)} (${escapeHtml(d.authorType)}: ${escapeHtml(d.authorName)})</strong>
            <span class="tier-badge ${d.status === 'Aberto' ? 'tier-2' : 'tier-1'}">${escapeHtml(d.status)}</span>
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.5rem;">${escapeHtml(d.message)}</p>
          ${d.response ? `
            <div style="background:#f0fdf4; border-left:3px solid var(--color-success); padding:0.5rem 0.75rem; font-size:0.8rem;">
              <strong>Resposta (${escapeHtml(d.respondedBy)}):</strong> ${escapeHtml(d.response)}
            </div>
          ` : `
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
              <input type="text" id="resp-input-${d.id}" class="form-input" placeholder="Escrever devolutiva pedagogica acolhedora..." style="min-height:36px; font-size:0.8rem;">
              <button type="button" class="btn btn-primary btn-sm" onclick="EduApp.responderDialogo('${d.id}')">Responder</button>
            </div>
          `}
        </div>
      `).join('');
    }

    refreshProfCallbacks = async () => {
      await verificarDialogosTurma();
    };

    // Submissao do registro atitudinal (suporta fluxo agil de 3 cliques e botao de confirmacao com nota)
    async function submeterRegistro(origem = 'botao') {
      if (!state.estudanteId) {
        if (origem === 'botao') showToast('toast-box', 'Selecione o estudante no Passo 1.', 'error');
        return;
      }
      if (!state.dimensaoId) {
        if (origem === 'botao') showToast('toast-box', 'Selecione a dimensao no Passo 2.', 'error');
        return;
      }
      if (!state.polaridade) {
        if (origem === 'botao') showToast('toast-box', 'Selecione a polaridade no Passo 3.', 'error');
        return;
      }

      try {
        await api('/api/observations', {
          method: 'POST',
          body: {
            studentId: state.estudanteId,
            dimensionId: state.dimensaoId,
            polarity: state.polaridade,
            note: notaObs.value,
            teacherId: 'prof-01',
            teacherName: 'Prof. Carlos Eduardo'
          }
        });

        const rotuloPol = state.polaridade === 'positiva' ? 'Positiva' : state.polaridade === 'oportunidade' ? 'Oportunidade' : 'Neutra';
        showToast('toast-box', `Evidencia [${rotuloPol}] de ${state.dimensaoId} registrada com sucesso para ${state.estudanteNome}!`);
        
        // Limpa polaridade e anotacao para proximo registro agil
        notaObs.value = '';
        state.polaridade = '';
        document.querySelectorAll('.pol-btn').forEach(b => b.classList.remove('selected'));
        
        await carregarTimeline();
      } catch (e) {
        showToast('toast-box', 'Falha ao registrar evidencia atitudinal: ' + (e.message || ''), 'error');
      }
    }

    // Eventos de Selecao dos 3 Cliques
    selectTurma.addEventListener('change', async (e) => {
      state.turmaAtiva = e.target.value;
      state.estudanteId = '';
      state.estudanteNome = '';
      labelEstudante.textContent = 'Nenhum estudante selecionado';
      await carregarDadosTurma();
    });

    document.querySelectorAll('.dim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dim-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.dimensaoId = btn.dataset.dim;
        labelDimensao.textContent = `Selecionada: ${btn.querySelector('strong').textContent}`;
      });
    });

    // Clique 3: Tocar na polaridade
    // Se o estudante e a dimensao ja estiverem selecionados e a gaveta de notas nao tiver texto digitado,
    // o 3o toque completa e salva a observacao instantaneamente (usabilidade em ate 3 cliques)!
    document.querySelectorAll('.pol-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('.pol-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.polaridade = btn.dataset.pol;

        if (state.estudanteId && state.dimensaoId && !notaObs.value.trim()) {
          await submeterRegistro('triad');
        }
      });
    });

    filtroDimensao.addEventListener('change', carregarTimeline);

    btnConfirmar.addEventListener('click', () => submeterRegistro('botao'));

    btnLimpar.addEventListener('click', () => {
      state.estudanteId = '';
      state.estudanteNome = '';
      state.dimensaoId = '';
      state.polaridade = '';
      labelEstudante.textContent = 'Nenhum estudante selecionado';
      labelDimensao.textContent = 'Nenhuma dimensao selecionada';
      notaObs.value = '';
      document.querySelectorAll('.select-card').forEach(b => b.classList.remove('selected'));
      document.querySelectorAll('.dim-btn').forEach(b => b.classList.remove('selected'));
      document.querySelectorAll('.pol-btn').forEach(b => b.classList.remove('selected'));
    });

    carregarTurmas();
  }

  // ==========================================
  // 2. PAGINA DA COORDENACAO (DESKTOP)
  // ==========================================
  function initCoordenacaoPage() {
    const selectTurma = document.getElementById('select-turma-coord');
    const filtroTier = document.getElementById('filtro-tier');
    const tbodyAlertas = document.getElementById('tbody-alertas');
    const tbodyIntervencoes = document.getElementById('tbody-intervencoes');
    const tbodyAuditoria = document.getElementById('tbody-auditoria');
    const svgRadar = document.getElementById('svg-radar-coletivo');

    let allAlerts = [];
    let allClasses = [];

    async function carregarTurmas() {
      allClasses = await api('/api/classes');
      selectTurma.innerHTML = '<option value="">Todas as Turmas da Escola</option>';
      allClasses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name} (${c.segment})`;
        selectTurma.appendChild(opt);
      });
    }

    async function carregarAlertas() {
      const classId = selectTurma.value;
      const url = `/api/alerts${classId ? `?classId=${classId}` : ''}`;
      allAlerts = await api(url);
      renderAlertas();
    }

    function renderAlertas() {
      const tierFilter = filtroTier.value;
      let filtered = allAlerts;
      if (tierFilter) {
        filtered = filtered.filter(a => a.tier === tierFilter);
      }

      if (filtered.length === 0) {
        tbodyAlertas.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:1.5rem; color:var(--text-light);">Nenhum alerta encontrado para os filtros selecionados.</td></tr>';
        return;
      }

      tbodyAlertas.innerHTML = filtered.map(a => {
        const tierClass = a.tier === 'Tier 3' ? 'tier-3' : a.tier === 'Tier 2' ? 'tier-2' : 'tier-1';
        return `
          <tr>
            <td><strong>${escapeHtml(a.studentName)}</strong></td>
            <td>${escapeHtml(a.className)}</td>
            <td>
              <span style="font-weight:700; color:${a.attendanceRate < 75 ? 'var(--color-danger)' : a.attendanceRate < 85 ? 'var(--color-warning)' : 'var(--color-success)'}">
                ${a.attendanceRate}%
              </span>
            </td>
            <td>
              <span style="font-weight:600; color:${a.missingAssignments >= 4 ? 'var(--color-danger)' : a.missingAssignments >= 2 ? 'var(--color-warning)' : 'inherit'}">
                ${a.missingAssignments} pendente(s)
              </span>
            </td>
            <td>${a.attitudeScore.toFixed(1)} / 5.0</td>
            <td><span class="tier-badge ${tierClass}">${escapeHtml(a.tier)}</span></td>
            <td style="font-size:0.8rem; color:var(--text-muted); max-width:240px;">
              ${a.reasons.map(r => escapeHtml(r)).join('<br>')}
            </td>
            <td style="font-size:0.8rem; max-width:220px;">${escapeHtml(a.recommendedAction)}</td>
            <td>
              <button type="button" class="btn btn-secondary btn-sm" onclick="EduApp.abrirModalIntervencao('${a.studentId}', '${a.tier}')">
                Intervir
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    async function carregarClima() {
      const classId = selectTurma.value;
      const url = `/api/climate${classId ? `?classId=${classId}` : ''}`;
      const climate = await api(url);

      document.getElementById('stat-clima-indice').textContent = `${climate.climateIndex}%`;
      document.getElementById('stat-pos-count').textContent = climate.counts.positive;
      document.getElementById('stat-pos-pct').textContent = `${climate.percentages.positive}%`;
      document.getElementById('stat-opt-count').textContent = climate.counts.opportunity;
      document.getElementById('stat-opt-pct').textContent = `${climate.percentages.opportunity}%`;
      document.getElementById('stat-neu-count').textContent = climate.counts.neutral;
      document.getElementById('stat-neu-pct').textContent = `${climate.percentages.neutral}%`;

      // Renderiza Radar Kindbegrip Agregado
      renderRadarSvg(svgRadar, [
        {
          values: climate.radarDimensions,
          fillColor: 'rgba(37, 99, 235, 0.25)',
          strokeColor: '#2563eb',
          strokeWidth: 2.5
        }
      ]);
    }

    async function carregarIntervencoes() {
      const classId = selectTurma.value;
      const url = `/api/interventions${classId ? `?classId=${classId}` : ''}`;
      const list = await api(url);

      if (list.length === 0) {
        tbodyIntervencoes.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:1.5rem; color:var(--text-light);">Nenhum plano de intervencao ativo.</td></tr>';
        return;
      }

      tbodyIntervencoes.innerHTML = list.map(i => {
        const tierClass = i.tier === 'Tier 3' ? 'tier-3' : 'tier-2';
        return `
          <tr>
            <td><strong>${escapeHtml(i.studentName)}</strong></td>
            <td>${escapeHtml(i.className)}</td>
            <td><span class="tier-badge ${tierClass}">${escapeHtml(i.tier)}</span></td>
            <td><strong>${escapeHtml(i.title)}</strong><div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(i.strategy)}</div></td>
            <td style="text-transform:capitalize;">${escapeHtml(i.targetDimension)}</td>
            <td>${escapeHtml(i.responsibleName)}</td>
            <td>${escapeHtml(i.reviewDate)}</td>
            <td>
              <span class="tier-badge ${i.status === 'Concluido' ? 'tier-1' : i.status === 'Em Andamento' ? 'tier-2' : 'tier-3'}">
                ${escapeHtml(i.status)}
              </span>
            </td>
            <td>
              ${i.status !== 'Concluido' ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="EduApp.atualizarStatusIntervencao('${i.id}', 'Concluido')">
                  Concluir
                </button>
              ` : '<span style="color:var(--color-success); font-size:0.8rem; font-weight:600;">Finalizado</span>'}
            </td>
          </tr>
        `;
      }).join('');
    }

    async function carregarAuditoria() {
      const logs = await api('/api/audit');
      tbodyAuditoria.innerHTML = logs.slice(0, 15).map(l => `
        <tr>
          <td style="font-family:var(--font-mono); font-size:0.75rem;">${formatDate(l.timestamp)}</td>
          <td><strong>${escapeHtml(l.actorName)}</strong></td>
          <td>${escapeHtml(l.actorRole)}</td>
          <td><code>${escapeHtml(l.action)}</code></td>
          <td style="font-size:0.8rem;">${escapeHtml(l.resource)}</td>
          <td style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(l.justification)}</td>
        </tr>
      `).join('');
    }

    refreshCoordCallbacks = async () => {
      await carregarIntervencoes();
      await carregarAuditoria();
    };

    selectTurma.addEventListener('change', () => {
      carregarAlertas();
      carregarClima();
      carregarIntervencoes();
    });

    filtroTier.addEventListener('change', renderAlertas);

    // Formulario de cadastro de intervencao
    const boxNovoPlano = document.getElementById('box-novo-plano');
    const btnAbrirModal = document.getElementById('btn-abrir-modal-intervencao');
    const btnCancelarModal = document.getElementById('btn-cancelar-intervencao');
    const btnSalvarModal = document.getElementById('btn-salvar-intervencao');
    const selectEstudanteInt = document.getElementById('int-estudante-id');

    btnAbrirModal.addEventListener('click', async () => {
      boxNovoPlano.style.display = 'block';
      const students = await api('/api/students');
      selectEstudanteInt.innerHTML = students.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.enrollmentNumber)})</option>`).join('');
      document.getElementById('int-revisao').value = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    });

    btnCancelarModal.addEventListener('click', () => {
      boxNovoPlano.style.display = 'none';
    });

    btnSalvarModal.addEventListener('click', async () => {
      const studentId = selectEstudanteInt.value;
      const tier = document.getElementById('int-tier').value;
      const targetDimension = document.getElementById('int-dimensao').value;
      const title = document.getElementById('int-titulo').value.trim();
      const strategy = document.getElementById('int-estrategia').value.trim();
      const responsibleName = document.getElementById('int-responsavel').value.trim();
      const reviewDate = document.getElementById('int-revisao').value;

      if (!title || !strategy) {
        showToast('toast-box-coord', 'Preencha o titulo e a estrategia do plano.', 'error');
        return;
      }

      try {
        await api('/api/interventions', {
          method: 'POST',
          body: {
            studentId,
            tier,
            targetDimension,
            title,
            strategy,
            responsibleName,
            reviewDate,
            status: 'Em Andamento'
          }
        });

        showToast('toast-box-coord', 'Plano de intervencao MTSS registrado com sucesso!');
        boxNovoPlano.style.display = 'none';
        await carregarIntervencoes();
        await carregarAuditoria();
      } catch (e) {
        showToast('toast-box-coord', 'Falha ao salvar plano de intervencao: ' + (e.message || ''), 'error');
      }
    });

    (async () => {
      await carregarTurmas();
      await carregarAlertas();
      await carregarClima();
      await carregarIntervencoes();
      await carregarAuditoria();
    })();
  }

  // ==========================================
  // 3. PAGINA DO ESTUDANTE E RESPONSAVEIS
  // ==========================================
  function initEstudantePage() {
    const selectEstudante = document.getElementById('select-estudante-view');
    const svgRadar = document.getElementById('svg-radar-estudante');
    const textoForcas = document.getElementById('texto-forcas');
    const textoCrescimento = document.getElementById('texto-crescimento');
    const dadosFrequencia = document.getElementById('dados-frequencia-estudante');
    const timelineEstudante = document.getElementById('estudante-timeline');
    const btnAutoavaliacao = document.getElementById('btn-enviar-autoavaliacao');

    let estudanteAtivoId = '';

    async function carregarListaEstudantes() {
      const students = await api('/api/students');
      selectEstudante.innerHTML = '';
      students.forEach((s, idx) => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name} (${s.enrollmentNumber})`;
        if (idx === 0) opt.selected = true;
        selectEstudante.appendChild(opt);
      });

      if (students.length > 0) {
        estudanteAtivoId = students[0].id;
        await carregarPainelEstudante();
      }
    }

    async function carregarPainelEstudante() {
      try {
        const radarData = await api(`/api/students/${estudanteAtivoId}/radar`);
        const student = radarData.student;

        dadosFrequencia.textContent = `Assiduidade: ${student.attendanceRate}% | Tarefas pendentes: ${student.missingAssignments} | Responsavel cadastrado: ${student.guardianName}`;

        if (radarData.strengths && radarData.strengths.length > 0) {
          textoForcas.textContent = radarData.strengths.map(d => d.toUpperCase()).join(' e ');
        } else {
          textoForcas.textContent = 'Desenvolvimento formativo geral em construcao.';
        }

        if (radarData.growthAreas && radarData.growthAreas.length > 0) {
          textoCrescimento.textContent = radarData.growthAreas.map(d => d.toUpperCase()).join(' e ');
        } else {
          textoCrescimento.textContent = 'Perfil equilibrado: mantendo bom desenvolvimento em todas as dimensoes.';
        }

        // Renderiza o Radar Kindbegrip Sobreposto (Observacao da Escola vs Autoavaliacao)
        renderRadarSvg(svgRadar, [
          {
            values: radarData.teacherRatings,
            fillColor: 'rgba(37, 99, 235, 0.25)',
            strokeColor: '#2563eb',
            strokeWidth: 2.5
          },
          {
            values: radarData.selfRatings,
            fillColor: 'rgba(22, 163, 74, 0.2)',
            strokeColor: '#16a34a',
            strokeWidth: 2,
            dashArray: '4,4'
          }
        ]);

        // Carrega observacoes e dialogos
        await carregarObservacoesEDialogos();

      } catch (e) {
        showToast('toast-box-estudante', 'Erro ao carregar dados do estudante.', 'error');
      }
    }

    async function carregarObservacoesEDialogos() {
      const obs = await api(`/api/observations?studentId=${estudanteAtivoId}`);
      const dialogos = await api(`/api/dialogues?studentId=${estudanteAtivoId}`);

      if (obs.length === 0) {
        timelineEstudante.innerHTML = '<p style="padding:1rem; color:var(--text-light); font-size:0.85rem;">Nenhuma observacao pedagogica registrada no momento.</p>';
        return;
      }

      timelineEstudante.innerHTML = obs.map(o => {
        const polClass = `polarity-${o.polarity}`;
        const polNome = o.polarity === 'positiva' ? '[Positiva] Forca' : o.polarity === 'oportunidade' ? '[Oportunidade] Crescimento' : '[Neutra] Factual';
        const dialVinculado = dialogos.find(d => d.observationId === o.id);

        return `
          <article class="timeline-item ${o.polarity}">
            <div class="timeline-header">
              <span class="timeline-student">${escapeHtml(o.dimensionId.toUpperCase())}</span>
              <span class="timeline-date">${formatDate(o.timestamp)}</span>
            </div>
            <div>
              <span class="polarity-badge ${polClass}">${polNome}</span>
            </div>
            ${o.note ? `<p class="timeline-note">${escapeHtml(o.note)}</p>` : ''}
            <div class="timeline-author">Educador: ${escapeHtml(o.teacherName)}</div>

            ${dialVinculado ? `
              <div style="margin-top:0.6rem; padding:0.5rem 0.75rem; background:#f0f9ff; border:1px solid #bae6fd; border-radius:var(--radius-sm); font-size:0.8rem;">
                <div style="display:flex; justify-content:space-between;">
                  <strong>Dialogo Aberto por ${escapeHtml(dialVinculado.authorName)}:</strong>
                  <span class="tier-badge ${dialVinculado.status === 'Resolvido' || dialVinculado.status === 'Respondido' ? 'tier-1' : 'tier-2'}">${escapeHtml(dialVinculado.status)}</span>
                </div>
                <p style="margin-top:0.25rem; color:var(--text-muted);">${escapeHtml(dialVinculado.message)}</p>
                ${dialVinculado.response ? `
                  <div style="margin-top:0.35rem; padding:0.35rem; background:#ffffff; border-left:2px solid var(--color-success); color:var(--text-main);">
                    <strong>Resposta da Escola (${escapeHtml(dialVinculado.respondedBy)}):</strong> ${escapeHtml(dialVinculado.response)}
                  </div>
                ` : '<div style="margin-top:0.25rem; color:var(--text-light); font-style:italic;">Aguardando devolutiva da equipe pedagogica.</div>'}
              </div>
            ` : `
              <div style="margin-top:0.5rem;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="EduApp.abrirDialogoModal('${o.id}')">
                  Solicitar Dialogo Pedagogico
                </button>
              </div>
            `}
          </article>
        `;
      }).join('');
    }

    selectEstudante.addEventListener('change', (e) => {
      estudanteAtivoId = e.target.value;
      carregarPainelEstudante();
    });

    btnAutoavaliacao.addEventListener('click', async () => {
      const resp = Number(document.getElementById('auto-resp').value);
      const colab = Number(document.getElementById('auto-colab').value);
      const auto = Number(document.getElementById('auto-auto').value);
      const part = Number(document.getElementById('auto-part').value);
      const respConv = Number(document.getElementById('auto-resp-conv').value);
      const reflectionText = document.getElementById('auto-reflexao').value;

      try {
        await api('/api/self-evaluations', {
          method: 'POST',
          body: {
            studentId: estudanteAtivoId,
            period: '1o Bimestre / 2026',
            ratings: {
              responsabilidade: resp,
              colaboracao: colab,
              autonomia: auto,
              participacao: part,
              respeito: respConv
            },
            reflectionText
          }
        });

        showToast('toast-box-estudante', 'Autoavaliacao enviada com sucesso! O radar Kindbegrip foi atualizado.');
        await carregarPainelEstudante();
      } catch (e) {
        showToast('toast-box-estudante', 'Falha ao salvar autoavaliacao: ' + (e.message || ''), 'error');
      }
    });

    // Formulario de Dialogo
    const boxDialogo = document.getElementById('box-novo-dialogo');
    const btnCancelarDialogo = document.getElementById('btn-cancelar-dialogo');
    const btnEnviarDialogo = document.getElementById('btn-enviar-dialogo');

    btnCancelarDialogo.addEventListener('click', () => {
      boxDialogo.style.display = 'none';
    });

    btnEnviarDialogo.addEventListener('click', async () => {
      const observationId = document.getElementById('dialogo-obs-id').value;
      const authorType = document.getElementById('dialogo-autor-tipo').value;
      const authorName = document.getElementById('dialogo-autor-nome').value.trim();
      const message = document.getElementById('dialogo-mensagem').value.trim();

      if (!authorName || !message) {
        showToast('toast-box-estudante', 'Preencha seu nome e a mensagem.', 'error');
        return;
      }

      try {
        await api('/api/dialogues', {
          method: 'POST',
          body: {
            observationId: observationId || undefined,
            studentId: estudanteAtivoId,
            authorType,
            authorName,
            message
          }
        });

        showToast('toast-box-estudante', 'Solicitacao de dialogo enviada para a equipe escolar!');
        boxDialogo.style.display = 'none';
        document.getElementById('dialogo-mensagem').value = '';
        await carregarObservacoesEDialogos();
      } catch (e) {
        showToast('toast-box-estudante', 'Erro ao enviar mensagem de dialogo: ' + (e.message || ''), 'error');
      }
    });

    carregarListaEstudantes();
  }

  // Metodos globais para acoes de clique inline
  function abrirModalIntervencao(studentId, tier) {
    const box = document.getElementById('box-novo-plano');
    if (box) {
      box.style.display = 'block';
      const sel = document.getElementById('int-estudante-id');
      if (sel) sel.value = studentId;
      const tierSel = document.getElementById('int-tier');
      if (tierSel) tierSel.value = tier === 'Tier 3' ? 'Tier 3' : 'Tier 2';
      box.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async function atualizarStatusIntervencao(id, status) {
    try {
      await api(`/api/interventions/${id}`, {
        method: 'PATCH',
        body: { status }
      });
      showToast('toast-box-coord', 'Status do plano MTSS atualizado com sucesso!');
      if (refreshCoordCallbacks) {
        await refreshCoordCallbacks();
      }
    } catch (e) {
      showToast('toast-box-coord', 'Erro ao atualizar intervencao: ' + (e.message || ''), 'error');
    }
  }

  function abrirDialogoModal(observationId) {
    const box = document.getElementById('box-novo-dialogo');
    if (box) {
      box.style.display = 'block';
      document.getElementById('dialogo-obs-id').value = observationId;
      box.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async function responderDialogo(id) {
    const input = document.getElementById(`resp-input-${id}`);
    if (!input || !input.value.trim()) {
      showToast('toast-box', 'Digite uma resposta pedagogica acolhedora.', 'error');
      return;
    }
    try {
      await api(`/api/dialogues/${id}`, {
        method: 'PATCH',
        body: {
          response: input.value.trim(),
          respondedBy: 'Prof. Carlos Eduardo Mendonca'
        }
      });
      showToast('toast-box', 'Resposta pedagogica registrada com sucesso!');
      if (refreshProfCallbacks) {
        await refreshProfCallbacks();
      }
    } catch (e) {
      showToast('toast-box', 'Erro ao responder dialogo: ' + (e.message || ''), 'error');
    }
  }

  return {
    initProfessorPage,
    initCoordenacaoPage,
    initEstudantePage,
    abrirModalIntervencao,
    atualizarStatusIntervencao,
    abrirDialogoModal,
    responderDialogo
  };

})();

window.EduApp = EduApp;
