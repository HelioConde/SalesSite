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

## Sistema de captura visual

### Capturas automáticas (página inteira)

Execute npm install e npx playwright install chromium e então npm run screenshots. O servidor HTTP deve estar ativo em http://127.0.0.1:4173 (por exemplo, python3 -m http.server 4173). O comando scripts/capture.mjs cria qa-snapshots/index.html, report.json e duas imagens PNG por cenário (página inteira e viewport). São 12 cenários: home desktop/wide/tablet/mobile/320px, detalhes desktop/mobile, carrinho, checkout, favoritos, busca vazia e menu mobile.

É possível apontar o capturador para outro ambiente com SALES_SITE_URL=https://exemplo/ (cuidado: somente páginas de teste sem dados privados) e configurar a saída via SALES_SITE_SNAPSHOTS. A captura automática não modifica conteúdo nem envia arquivos para serviços externos.

### No GitHub Actions

O workflow executa os testes, fotografa as páginas e publica o artefato salessite-visual-qa mesmo quando um teste falha. Em Actions > execução de QA > Artifacts, baixe o ZIP, extraia e abra qa-snapshots/index.html no navegador. O resumo de possíveis erros e overflow aparece também no painel Summary da execução. Para me mostrar o problema, anexe o PNG ou o ZIP da galeria na conversa; somente o link para o artifact pode não permitir a leitura das imagens nesta interface.

### Captura manual no navegador

Abra diagnostico.html (também disponível no GitHub Pages). Deixe a página da loja aberta em outra aba, clique Capturar aba e selecione essa aba no diálogo de compartilhamento. O PNG é baixado no próprio navegador, sem upload automático. Anexe a imagem ao chat. Essa captura manual registra somente a área visível; para a página inteira use o Playwright. O compartilhamento da tela é encerrado ao finalizar a captura.

### Privacidade e segurança

Não fotografe dados pessoais, senhas ou sessões autenticadas. Não envie screenshots automaticamente a terceiros. O workflow registra somente o site estático de demonstração; os PNGs de CI ficam disponíveis como artefatos no GitHub.
