# Galeria de Wireframes e Fundamentacao Ergonomica

Projeto: EduAtitude - Sistema Web para Avaliacao Atitudinal na Educacao Basica
Dominio: Ensino Fundamental I e II e Ensino Medio
Regra Geral: Zero emotes ou emojis no projeto

---

## 1. Wireframe Mobile: Perfil Professor (Registro em 3 Toques)

### 1.1 Diagramacao Textual
```
+-------------------------------------------------------------+
| [EduAtitude Docente] Turma: [5o Ano A - Fundamental I]     |
+-------------------------------------------------------------+
| Passo 1: Selecione o Estudante                              |
| +-----------------+ +-----------------+ +-----------------+ |
| | [x] Lucas Lima  | | Beatriz Costa   | | Gabriel Rocha   | |
| | Mat: 2026-01    | | Mat: 2026-02    | | Mat: 2026-03    | |
| +-----------------+ +-----------------+ +-----------------+ |
+-------------------------------------------------------------+
| Passo 2: Selecione a Dimensao Atitudinal                    |
| +-----------------+ +-----------------+ +-----------------+ |
| | Responsabilidad | | [x] Colaboracao | | Autonomia       | |
| +-----------------+ +-----------------+ +-----------------+ |
| | Participacao    | | Respeito        |                     |
| +-----------------+ +-----------------+                     |
+-------------------------------------------------------------+
| Passo 3: Polaridade Formativa                               |
| +-----------------------+ +-----------------------+ +-----+ |
| | [x] [Positiva]        | | [Oportunidade]        | | [N] | |
| +-----------------------+ +-----------------------+ +-----+ |
+-------------------------------------------------------------+
| [v] Anotacao Qualitativa Descritiva (Opcional - Expandir)   |
+-------------------------------------------------------------+
| [ BOTAO PRINCIPAL: CONFIRMAR REGISTRO - ALTURA MINIMA 48PX ]|
+-------------------------------------------------------------+
```

### 1.2 Justificativa Ergonomica
- **Lei de Fitts:** Alvos com altura minima de 44px e posicionados na regiao inferior da tela, facilitando a acao do polegar em dispositivos moveis (Thumb Zone).
- **Heuristica de Nielsen 6 (Reconhecimento em vez de Memorizacao):** Os estados ativos dos tres passos permanecem visiveis com borda destacada e fundo colorido.

---

## 2. Wireframe Desktop: Coordenacao e MTSS

### 2.1 Diagramacao Textual
```
+---------------------------------------------------------------------------------+
| [EduAtitude Gestao] Painel de Coordenacao MTSS              Filtro: [Todas]     |
+---------------------------------------------------------------------------------+
| TABELA DE ALERTA PRECOCE (EDINSIGHTS / MTSS)                                    |
| +-----------------------------------------------------------------------------+ |
| | Aluno          | Freq | Tarefas | Score | Nivel  | Indicadores   | Acao     | |
| +----------------+------+---------+-------+--------+---------------+----------+ |
| | Thiago Duarte  | 72%  | 5 pend. | 2.1   | Tier 3 | Freq. critica | Intervir | |
| | Gabriel Rocha  | 81%  | 3 pend. | 3.2   | Tier 2 | Queda autono. | Intervir | |
| | Lucas Lima     | 98%  | 0 pend. | 4.8   | Tier 1 | Estavel       | Monitorar| |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| [ RADAR KINDBEGRIP COLETIVO ]             [ METRICAS DE BEM-ESTAR ESCOLAR ]     |
|         (Responsabilidade)                 - Indice Clima Positivo: 85%         |
|                /   \                       - Observacoes Positivas: 18 (75%)    |
|   (Respeito)  *     *  (Colaboracao)       - Oportunidades: 4 (17%)             |
|        \           /                       - Neutras: 2 (8%)                    |
|         *---------*                                                             |
|   (Partic.)     (Autonomia)                Referencial: Saude Escolar Finlandesa|
+---------------------------------------------------------------------------------+
```

### 2.2 Justificativa Ergonomica
- **Heuristica de Nielsen 1 (Visibilidade do Estado do Sistema):** O uso do padrao MTSS em 3 Tiers (Verde, Amarelo, Vermelho) permite triagem visual instantanea da turma sem exigir leitura de relatorios textuais densos.
- **Modelo Kindbegrip e Clima Finlandes:** O radar coletivo orienta a tomada de decisao institucional sobre praticas pedagogicas, evitando o julgamento individual punitivo.

---

## 3. Wireframe Mobile: Estudante e Familiares

### 3.1 Diagramacao Textual
```
+-------------------------------------------------------------+
| [EduAtitude Aluno] Lucas Ferreira Lima                      |
+-------------------------------------------------------------+
| MEU RADAR SOCIOEMOCIONAL (KINDBEGRIP)                       |
|         (Responsabilidade)                                  |
|               /\                                            |
|              /  \      Linha Azul: Observacao da Escola     |
|             *====*     Linha Verde: Minha Autoavaliacao     |
|            /      \                                         |
|           *--------*                                        |
|   (Respeito)      (Colaboracao)                             |
|                                                             |
| Forcas: Responsabilidade e Colaboracao                      |
| Metas: Autonomia e Participacao                             |
| *Zero rankings ou comparacoes publicas*                     |
+-------------------------------------------------------------+
| MINHA AUTOAVALIACAO REFLEXIVA                               |
| - Responsabilidade: [ 1 2 3 4 (5) ]                         |
| - Colaboracao:      [ 1 2 3 4 (5) ]                         |
| - Autonomia:        [ 1 2 3 (4) 5 ]                         |
| - Participacao:     [ 1 2 3 (4) 5 ]                         |
| - Respeito:         [ 1 2 3 4 (5) ]                         |
| [ Campo de Texto Reflexivo Mensal ]                         |
| [ BOTAO: ENVIAR AUTOAVALIACAO ]                             |
+-------------------------------------------------------------+
| CANAL DE DIALOGO E CONTESTACAO                              |
| - Observacao em 10/03 sobre Colaboracao                     |
|   [ BOTAO: SOLICITAR DIALOGO PEDAGOGICO ]                   |
+-------------------------------------------------------------+
```

### 3.2 Justificativa Etica e LGPD
- **Prevencao de Uso Punitivo:** A interface elimina inteiramente qualquer ranking, tabela de lideres ou escores depreciativos entre colegas, focando no desenvolvimento continuo.
- **Transparencia e Contraditorio:** O estudante ou seus responsaveis podem registrar sua versao dos fatos e solicitar devolutiva acolhedora da instituicao.
