# EduAtitude - Sistema Web para Avaliacao Atitudinal

Sistema Web para Avaliacao Atitudinal e Socioemocional voltado a Educacao Basica (Ensino Fundamental I, Fundamental II e Ensino Medio).

O projeto transforma a observacao atitudinal em um ativo pedagogico continuo, estruturado, visual e nao punitivo, integrando as diretrizes curriculares nacionais (BNCC) e referencias internacionais:
- **Modelo holandes do Kindbegrip (CASEL)**: devolutiva visual em grafico de radar multidimensional, superando o parecer textual generico e eliminando ranqueamentos punitivos.
- **Abordagem finlandesa de promocao da saude escolar**: foco no clima coletivo e no bem-estar institucional.
- **Sistema norte-americano EdInsights / MTSS**: Sistema de Alerta Precoce que cruza frequencia (< 75% e < 85%), tarefas nao entregues e oscilacoes atitudinais em 3 niveis (Tier 1: Universal, Tier 2: Suporte Focado, Tier 3: Suporte Intensivo).
- **Conformidade estrita com a LGPD (Lei 13.709/2018, Art. 7 e Art. 14)**: trilha de auditoria completa, garantia de explicabilidade e canal etico de contraditorio discente.

---

## 1. Artefatos de Entrega Academica

1. **Artefato 1: Mapa de Navegacao (Arquitetura de Informacao e RBAC)**
   - Arquivo: `MAPA_NAVEGACAO.md` (na raiz do projeto).
   - Diagrama da arvore estrutural de telas, fluxogramas de jornada por perfil e Matriz RBAC com amparo legal na LGPD.

2. **Artefato 2: Galeria de Wireframes e Fundamentacao Ergonomica**
   - Arquivo: `WIREFRAMES.md` (na raiz do projeto).
   - Diagramacao textual/ASCII completa dos layouts Mobile e Desktop com fundamentacao na Lei de Fitts e nas Heuristicas de Usabilidade de Nielsen.

3. **Artefato 3: Prototipo Interativo Navegavel**
   - Paginas: `index.html`, `professor.html`, `coordenacao.html`, `estudante.html`, estilizadas com `css/style.css` e interatividade via `js/app.js` (todos na raiz do projeto).
   - Sem abas de documentacao misturadas nas telas do sistema.

---

## 2. Como Abrir e Executar o Prototipo

### Opcao A: Via Extensao Go Live do VS Code (Recomendada)
1. Abra a pasta do projeto no VS Code.
2. Clique no botao **Go Live** no canto inferior direito.
3. O navegador abrira diretamente o portal do sistema (`index.html`), com dados e interacoes funcionando normalmente.

### Opcao B: Via Servidor HTTP Nativo em Node.js
```bash
# Iniciar o servidor HTTP nativo (porta 3000)
npm start

# Executar suite de testes automatizados
npm test
```

### Links do Sistema no Navegador (Servidor Local)
- **Portal Principal**: http://localhost:3000/ ou http://localhost:3000/index.html
- **Visao Professor**: http://localhost:3000/professor.html
- **Visao Coordenacao**: http://localhost:3000/coordenacao.html
- **Visao Estudante e Familia**: http://localhost:3000/estudante.html
- **Status da API**: http://localhost:3000/api/health

---

## 3. Perfis do Sistema e Funcionalidades

### 3.1 Perfil Professor (Mobile-First) - `professor.html`
- Selecao rapida de turma (5o Ano A, 8o Ano B, 2o Ano EM).
- Registro continuo em ate 3 cliques/toques:
  - 1o Clique: Selecao do estudante em grade de cards.
  - 2o Clique: Selecao da dimensao atitudinal (Responsabilidade, Colaboracao, Autonomia, Participacao, Respeito).
  - 3o Clique: Selecao da polaridade formativa ([Positiva], [Oportunidade de Crescimento], [Neutra]).
  - Gaveta sanfonada opcional para detalhamento descritivo qualitativo.
- Linha do tempo cronologica de evidencias com filtros por dimensao.
- Notificacao visual de solicitacoes de dialogo pedagogico abertas por alunos ou familiares.

### 3.2 Perfil Coordenacao e Nucleo Pedagogico (Desktop) - `coordenacao.html`
- Sistema de Alerta Precoce (Early Warning / MTSS):
  - Algoritmo que cruza assiduidade (< 75% ou < 85%), acumulo de tarefas pendentes e declinio atitudinal.
  - Classificacao nos niveis MTSS (Tier 1: Universal, Tier 2: Suporte Focado, Tier 3: Suporte Intensivo).
  - Filtros por turma e por nivel de risco.
- Gestao de Clima Escolar e Radar Kindbegrip Coletivo:
  - Grafico de radar pentagonal em SVG nativo exibindo a media agregada das 5 dimensoes atitudinais.
  - Distribuicao percentual entre evidencias positivas, oportunidades de crescimento e neutras.
- Planos de Intervencao Pedagogica (MTSS):
  - Cadastro e monitoramento de acoes de apoio (tutoria entre pares, circulos de convivencia, alinhamento com a familia).
  - Controle de prazos de revisao e status (Em Planejamento, Em Andamento, Concluido).
- Trilha de Auditoria e Conformidade LGPD:
  - Registro imutavel com timestamp, identificacao do autor, acao executada, estudante vinculado e justificativa pedagogica expressa.

### 3.3 Perfil Estudante e Responsaveis - `estudante.html`
- Meu Radar Socioemocional (Kindbegrip):
  - Sobreposicao grafica entre a avaliacao observada pela escola e a autoavaliacao discente.
  - Destaque formativo para Forcas e Metas de Crescimento.
  - Eliminacao total de rankings, listas classificatorias ou notas depreciativas.
- Modulo de Autoavaliacao Reflexiva:
  - Escala de 1 a 5 para cada uma das 5 dimensoes atitudinais.
  - Campo descritivo de reflexao qualitativa sobre o proprio processo de aprendizagem.
- Canal de Dialogo e Contestacao Pedagogica:
  - Mecanismo que assegura o direito ao contraditorio e a escuta ativa sobre observacoes registradas.
  - Historico de devolutivas e respostas da equipe pedagogica.

---

## 4. Estrutura de Pastas do Repositorio

```
.
├── css/
│   └── style.css            # Folha de estilos sem emojis (WCAG AA)
├── data/
│   └── database.json        # Base de dados local em formato JSON
├── js/
│   └── app.js               # JavaScript vanilla minimalista (API REST e SVG)
├── src/
│   ├── dataStore.ts         # Regras de negocio, MTSS e auditoria LGPD
│   ├── seedData.ts          # Gerador de dados iniciais simulados
│   ├── server.ts            # Servidor HTTP nativo Node.js (sem framework)
│   ├── types.ts             # Tipagens TypeScript estritas
│   └── tests/               # Testes automatizados (node:test e node:assert)
│       ├── dataStore.test.ts
│       ├── integration.test.ts
│       └── server.test.ts
├── coordenacao.html         # Perfil Coordenacao MTSS (Desktop)
├── estudante.html           # Perfil Estudante e Familiares
├── index.html               # Portal institucional do sistema (apenas 1 no projeto)
├── professor.html           # Perfil Docente (Mobile-First)
├── MAPA_NAVEGACAO.md        # Entregavel: Mapa de Navegacao e RBAC
├── WIREFRAMES.md            # Entregavel: Wireframes e Ergonomia
├── package.json             # Configuracoes e scripts npm
├── tsconfig.json            # Configuracao do TypeScript
└── README.md                # Este documento
```
