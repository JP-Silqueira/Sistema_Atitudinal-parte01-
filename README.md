# EduAtitude - Sistema Web para Avaliacao Atitudinal

Sistema Web para Avaliacao Atitudinal e Socioemocional voltado a Educacao Basica (Ensino Fundamental I, Fundamental II e Ensino Medio).

O projeto transforma a observacao atitudinal em um ativo pedagogico continuo, estruturado, visual e nao punitivo, integrando as diretrizes curriculares nacionais (BNCC) e referencias internacionais:
- Modelo holandes do Kindbegrip (CASEL): devolutiva visual em grafico de radar multidimensional, superando o parecer textual generico e eliminando ranqueamentos punitivos.
- Abordagem finlandesa de promocao da saude escolar: foco no clima coletivo e no bem-estar institucional.
- Sistema norte-americano EdInsights / MTSS: Sistema de Alerta Precoce que cruza frequencia (< 75% e < 85%), tarefas nao entregues e oscilacoes atitudinais em 3 niveis (Tier 1: Universal, Tier 2: Suporte Focado, Tier 3: Suporte Intensivo).
- Conformidade estrita com a LGPD (Lei 13.709/2018, Art. 7 e Art. 14): trilha de auditoria completa, garantia de explicabilidade e canal etico de contraditorio discente.

---

## 1. Arquitetura e Stack Tecnologica

Em conformidade estrita com os requisitos do projeto:
- Backend: TypeScript puro, executado sobre Node.js nativo utilizando exclusivamente o modulo HTTP padrao (node:http). Nenhum framework externo (sem Express, Fastify ou Nest).
- Persistencia: Armazenamento em arquivo local JSON estruturado (data/database.json) com inicializacao e geracao automatica de dados simulados (seed) para Fundamental I, Fundamental II e Ensino Medio.
- Frontend: Paginas reais construidas em HTML5 semantico e CSS3 moderno na pasta public/. O uso de JavaScript/TypeScript no front e estritamente restrito a interacoes assincronas com a API REST nativa e ao calculo trigonometrico vetorial do SVG do Radar Kindbegrip. Nenhum framework de frontend (sem React, Vue ou Angular).
- Padrao de Codigo: Ausencia total de emotes ou emojis em todo o codigo, textos, estilos e documentacao.
- Documentacao Separada: Os artefatos de Mapa de Navegacao e Wireframes estao organizados na pasta documentacao/ como documentacao formal do projeto, nao integrando abas do sistema operacional.

---

## 2. Como Executar o Projeto

### Pre-requisitos
- Node.js (versao 18 ou superior instalada)
- npm (versao 9 ou superior instalada)

### Instalacao e Inicializacao
1. No terminal do sistema operacional, dentro do diretorio raiz do projeto:
   ```bash
   npm install
   ```

2. Iniciar o servidor HTTP nativo:
   ```bash
   npm start
   # ou em modo de desenvolvimento:
   npm run dev
   ```

3. Acessar no navegador:
   - Portal Principal: http://localhost:3000/
   - Visao Docente: http://localhost:3000/professor.html
   - Visao Coordenacao: http://localhost:3000/coordenacao.html
   - Visao Estudante e Familia: http://localhost:3000/estudante.html
   - Portal da Documentacao: http://localhost:3000/documentacao/index.html
   - Mapa de Navegacao: http://localhost:3000/documentacao/mapa-navegacao.html
   - Galeria de Wireframes: http://localhost:3000/documentacao/wireframes.html

4. Executar os testes automatizados de unidade e integracao:
   ```bash
   npm test
   ```

---

## 3. Perfis do Sistema e Funcionalidades

### 3.1 Perfil Professor (Mobile-First) - /professor.html
- Selecao rapida de turma (5o Ano A, 8o Ano B, 2o Ano EM).
- Registro continuo em ate 3 cliques/toques:
  - 1o Clique: Selecao do estudante em grade de cards.
  - 2o Clique: Selecao da dimensao atitudinal (Responsabilidade, Colaboracao, Autonomia, Participacao, Respeito).
  - 3o Clique: Selecao da polaridade formativa ([Positiva], [Oportunidade de Crescimento], [Neutra]).
  - Gaveta sanfonada opcional para detalhamento descritivo qualitativo.
- Linha do tempo cronologica de evidencias com filtros por dimensao.
- Notificacao visual de solicitacoes de dialogo pedagogico abertas por alunos ou familiares.

### 3.2 Perfil Coordenacao e Nucleo Pedagogico (Desktop) - /coordenacao.html
- Sistema de Alerta Precoce (Early Warning / MTSS):
  - Algoritmo que cruza assiduidade (< 75% ou < 85%), acumulo de tarefas pendentes e declinio atitudinal.
  - Classificacao nos niveis MTSS (Tier 1: Universal, Tier 2: Suporte Focado, Tier 3: Suporte Intensivo).
  - Filtros por turma e por nivel de risco.
- Gestao de Clima Escolar e Radar Kindbegrip Coletivo:
  - Grafico de radar pentagonal em SVG nativo exibindo a media agregada das 5 dimensoes atitudinais.
  - Distribuicao percentual entre evidencias positivas, oportunidades de crescimento e neutras.
- Planos de Intervencao Pedagogica (MTSS):
  - Cadastro e monitoramento de acoes de apoio (tutoria entre pares, circulos de convivência, alinhamento com a familia).
  - Controle de prazos de revisao e status (Em Planejamento, Em Andamento, Concluido).
- Trilha de Auditoria e Conformidade LGPD:
  - Registro imutavel com timestamp, identificacao do autor, acao executada, estudante vinculado e justificativa pedagogica expressa.

### 3.3 Perfil Estudante e Responsaveis - /estudante.html
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

## 4. Artefatos de Entrega (Documentacao Separada)

Localizados na pasta documentacao/:
- documentacao/mapa-navegacao.html e documentacao/MAPA_NAVEGACAO.md:
  - Diagrama de Arquitetura de Informacao e hierarquia de telas.
  - Fluxogramas detalhados das jornadas por perfil.
  - Matriz RBAC de Permissoes e controle de acesso granular em consonancia com a LGPD.
- documentacao/wireframes.html e documentacao/WIREFRAMES.md:
  - Wireframes de baixa e media fidelidade para Mobile (Professor e Aluno) e Desktop (Coordenacao).
  - Analise ergonomica com base na Lei de Fitts (alvos >= 44px na zona de alcance do polegar).
  - Justificativa teorica com base nas 10 Heuristicas de Usabilidade de Nielsen.

---

## 5. Estrutura de Pastas do Repositorio

```
.
├── data/
│   └── database.json          # Base de dados local em formato JSON
├── documentacao/              # Documentacao formal de entrega (fora das abas do sistema)
│   ├── index.html             # Portal da documentacao
│   ├── mapa-navegacao.html    # Diagrama e Matriz RBAC de permissoes
│   ├── MAPA_NAVEGACAO.md      # Versao markdown do mapa de navegacao
│   ├── wireframes.html        # Galeria visual de wireframes e ergonomia
│   └── WIREFRAMES.md          # Versao markdown dos wireframes
├── public/                    # Paginas reais do sistema web
│   ├── css/
│   │   └── style.css          # Estilos modulares sem emojis (WCAG AA)
│   ├── js/
│   │   └── app.js             # JavaScript vanilla minimalista (API e SVG)
│   ├── index.html             # Portal institucional de acesso aos perfis
│   ├── professor.html         # Perfil Docente (Mobile-First)
│   ├── coordenacao.html       # Perfil Coordenacao MTSS (Desktop)
│   └── estudante.html         # Perfil Estudante e Familia
├── src/
│   ├── dataStore.ts           # Logica de negocio, MTSS e auditoria LGPD
│   ├── seedData.ts            # Gerador de dados iniciais simulados
│   ├── server.ts              # Servidor HTTP nativo Node.js (sem framework)
│   ├── types.ts               # Tipagens TypeScript estritas
│   └── tests/                 # Testes automatizados (node:test e node:assert)
│       ├── dataStore.test.ts  # Testes de regras de negocio e MTSS
│       └── server.test.ts     # Testes de integracao do servidor HTTP
├── index.html                 # Redirecionador para public/index.html
├── package.json               # Configuracoes e scripts npm
├── tsconfig.json              # Configuracao estrita do compilador TypeScript
└── README.md                  # Este documento
```
#   p r o j e t o _ d e v _ w e b  
 