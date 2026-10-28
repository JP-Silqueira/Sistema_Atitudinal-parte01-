# Mapa de Navegacao e Arquitetura de Informacao

Projeto: EduAtitude - Sistema Web para Avaliacao Atitudinal na Educacao Basica
Dominio: Ensino Fundamental I e II e Ensino Medio
Regra Geral: Zero emotes ou emojis no projeto

---

## 1. Arvore Estrutural de Paginas e Endpoints

```
[EduAtitude - Portal Institucional] (/index.html)
│
├── Visao Docente (Mobile-First) (/professor.html)
│   ├── Selecao de Turma Ativa (5o Ano A, 8o Ano B, 2o Ano EM)
│   ├── Registro Rapido em 3 Passos (Estudante -> Dimensao -> Polaridade)
│   │   └── Gaveta Sanfonada para Anotacao Qualitativa Opcional
│   ├── Linha do Tempo Continua de Evidencias (Filtro por Dimensao)
│   └── Painel de Notificacoes e Resposta a Dialogos Pedagogicos
│
├── Visao Coordenacao e Nucleo Pedagogico (Desktop) (/coordenacao.html)
│   ├── Seletor de Turma ou Panorama Geral da Escola
│   ├── Sistema de Alerta Precoce (Early Warning / MTSS)
│   │   ├── Triagem em 3 Tiers (Tier 1: Universal | Tier 2: Focado | Tier 3: Intensivo)
│   │   └── Filtro Dinamico por Nivel de Risco
│   ├── Gestao de Clima Escolar e Radar Kindbegrip Coletivo (5 Dimensoes)
│   ├── Planos de Intervencao Pedagogica (Cadastro e Monitoramento)
│   └── Trilha de Auditoria LGPD (Log Imutavel de Acoes e Justificativas)
│
├── Visao Estudante e Familiares (Formativo e Dialogico) (/estudante.html)
│   ├── Seletor de Estudante (Contexto Individual)
│   ├── Meu Radar Socioemocional (Kindbegrip: Observacao Escola vs Autoavaliacao)
│   ├── Painel Formativo de Potenciais (Forcas em Destaque e Metas de Crescimento)
│   ├── Modulo de Autoavaliacao Reflexiva Mensal (Sliders 1 a 5 + Reflexao)
│   └── Canal Etico de Dialogo e Contestacao Pedagogica sobre Evidencias
│
└── Documentacao de Engenharia e UX (/documentacao/index.html)
    ├── Mapa de Navegacao e Matriz RBAC (/documentacao/mapa-navegacao.html)
    └── Galeria de Wireframes e Ergonomia Cognitiva (/documentacao/wireframes.html)
```

---

## 2. Jornadas de Usuario por Perfil

### 2.1 Jornada do Professor (Mobile-First)
1. Acesso a tela `/professor.html` diretamente de dispositivo movel ou tablet.
2. Selecao da turma ativa (5o Ano A, 8o Ano B ou 2o Ano EM).
3. Passo 1 (Clique 1): Selecao do estudante em grade responsiva com alvos de toque amplos.
4. Passo 2 (Clique 2): Selecao da dimensao atitudinal (Responsabilidade, Colaboracao, Autonomia, Participacao, Respeito).
5. Passo 3 (Clique 3): Selecao da polaridade ([Positiva], [Oportunidade], [Neutra]).
6. Confirmacao e gravacao com feedback visual imediato (toast) e registro automatico na trilha LGPD.
7. Consulta do historico na linha do tempo e resposta a eventuais dialogos abertos por alunos ou familiares.

### 2.2 Jornada da Coordenacao e Nucleo Pedagogico (Desktop)
1. Acesso a tela `/coordenacao.html` em ambiente desktop.
2. Analise visual da matriz de triagem MTSS ordenada por criticidade (Tier 3 primeiro).
3. Avaliacao do Radar Kindbegrip de clima coletivo da instituicao.
4. Abertura e acompanhamento de Planos de Intervencao Pedagogica (estrategia, prazos e responsavel).
5. Auditoria de registros atitudinais e conformidade com os principios da LGPD.

### 2.3 Jornada do Estudante e Familiares (Formativo e Dialogico)
1. Acesso a tela `/estudante.html`.
2. Visualizacao do Radar Kindbegrip sobrepondo a visao da equipe escolar e a autoavaliacao discente.
3. Leitura das forcas e metas de desenvolvimento sem presenca de rankings ou comparativos com terceiros.
4. Preenchimento da autoavaliacao reflexiva mensal com notas de 1 a 5 e texto subjetivo.
5. Abertura de solicitacao de dialogo etico em observacoes que demandem contextualizacao pedagogica.

---

## 3. Matriz RBAC de Permissoes (Role-Based Access Control)

| Recurso / Acao | Professor | Coordenacao | Estudante | Responsaveis | Base Legal LGPD |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Registro de Observacao Atitudinal | Criar / Editar | Leitura | Sem Acesso | Sem Acesso | Art. 7, V: Exercicio regular de direitos |
| Linha do Tempo da Turma | Suas Turmas | Todas Turmas | Sem Acesso | Sem Acesso | Anonimizacao entre pares |
| Sistema de Alerta MTSS | Leitura Turma | Gestao Total | Sem Acesso | Sem Acesso | Dados sensiveis de vulnerabilidade |
| Radar Kindbegrip Individual | Leitura | Leitura | Proprio Perfil | Proprio Dependente | Art. 14: Melhor interesse do menor |
| Autoavaliacao Reflexiva | Leitura | Leitura | Preenchimento | Leitura | Protagonismo discente |
| Canal de Dialogo e Contestacao | Responder | Mediar | Abrir Dialogo | Abrir Dialogo | Contraditorio e explicabilidade |
| Planos de Intervencao MTSS | Colaborar | Criar / Concluir | Consultar Metas | Consultar Metas | Suporte socioemocional focado |
| Trilha de Auditoria LGPD | Sem Acesso | Consulta Total | Sem Acesso | Sem Acesso | Art. 6, X: Responsabilizacao e contas |
