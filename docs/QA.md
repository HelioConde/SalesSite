# QA — SalesSite

## Executar localmente
Requer Node.js 22+, Python 3 e Chromium do Playwright.

1. npm install
2. npx playwright install chromium
3. npm test

O Playwright inicia servidor estático na porta 4173.

## Cobertura prevista
- Carregamento do catálogo local com 18 registros.
- Busca instantânea, ordenação, filtros e estado vazio.
- Link direto da página de detalhes.
- Persistência dos favoritos.
- Carrinho, ajuste de quantidade e total.
- Checkout de demonstração sem cobrança.
- Placeholders não comercializáveis.
- Menu mobile com estado correto e Escape.
- Falha de carregamento JSON e recuperação.
- Ausência de overflow horizontal em desktop e mobile.

## Testes manuais complementares
- 320, 360, 390, 768, 1024, 1280 e 1600 px.
- Teclado Tab/Shift+Tab, Enter, Escape.
- Leitor de tela: nomes, rótulos, status e foco.
- Zoom 200%, texto ampliado e movimento reduzido.
- Imagens lentas, offline, storage bloqueado, histórico de navegação.
- Lighthouse (Performance, Accessibility, Best Practices, SEO) em produção.

## Política de publicação
- Pull request para main: testes sem deploy.
- Push na main: testes antes de publicar no Pages.
- Workflow manual na main: executa QA e deploy.
- Settings > Pages: configurar Source = GitHub Actions.
- Projeto estático com dados e compras demonstrativos.

Não considerar testes aprovados até uma execução real e bem-sucedida do workflow.
