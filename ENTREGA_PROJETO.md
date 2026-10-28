# Entrega do Projeto: Sistema Web para Avaliacao Atitudinal

Projeto desenvolvido atendendo integralmente as orientacoes:
1. **Paginas em HTML e CSS**: Paginas reais situadas no diretorio `public/` (`index.html`, `professor.html`, `coordenacao.html`, `estudante.html`).
2. **Backend em TypeScript Puro (Sem Frameworks)**: Servidor HTTP nativo do Node.js (`node:http`) com persistencia em `data/database.json`.
3. **Frontend com JS apenas em ultimo caso**: Utilizado estritamente para requisicoes assincronas a API REST nativa e renderizacao trigonometrica do SVG do Radar Kindbegrip, sem nenhum framework frontend e com protecao contra XSS (`escapeHtml`).
4. **Ausencia total de emotes ou emojis**: 0 ocorrencias em codigo, layouts, textos e documentacao.
5. **Documentacao de Entrega Separada**: Mapa de Navegacao e Wireframes organizados na pasta `documentacao/` como artefatos formais de engenharia de software e nao abas da aplicacao.

---

## Como Executar

```bash
# Instalar dependencias
npm install

# Iniciar o servidor HTTP nativo (porta 3000)
npm start

# Executar suite completa de 43 testes automatizados
npm test
```

## Links do Sistema no Navegador

- **Portal Principal**: http://localhost:3000/
- **Visao Professor**: http://localhost:3000/professor.html
- **Visao Coordenacao**: http://localhost:3000/coordenacao.html
- **Visao Estudante e Familia**: http://localhost:3000/estudante.html
- **Portal de Documentacao**: http://localhost:3000/documentacao/index.html
- **Mapa de Navegacao**: http://localhost:3000/documentacao/mapa-navegacao.html
- **Galeria de Wireframes**: http://localhost:3000/documentacao/wireframes.html
