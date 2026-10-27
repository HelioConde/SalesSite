<div align="center">
  <img src="./icon/logo.png" alt="" width="70">
  <h1>SalesSite</h1>
  <p><strong>Vitrine de livros de tecnologia com busca, filtros, favoritos e carrinho — 100% estática.</strong></p>
  <p>HTML · CSS · JavaScript Modules · JSON · Playwright · GitHub Pages</p>
</div>

## Sobre o projeto

Projeto originalmente criado em 2022 e modernizado para estudo de front-end e experiência de e-commerce. Não oferece compras reais, estoque, cadastro, checkout comercial ou processamento de pagamentos.

### Funcionalidades
- Catálogo carregado com fetch a partir de data/products.json, sem depender do Postman.
- 18 registros preservados (8 livros identificados + 10 exemplos sinalizados).
- Busca imediata, filtro por categoria e preço, ordenação por preço, nome e destaque.
- Página compartilhável por URL, por exemplo: ?produto=mVendidos-01.
- Favoritos e carrinho persistidos no localStorage.
- Quantidades, subtotais e total ilustrativo.
- Finalização de simulação sem coleta de dados nem cobrança real.
- Layout responsivo, menu mobile e estados de erro e vazio.
- Playwright e workflow de publicação controlada no GitHub Pages.
- Diagnóstico visual com screenshots automáticos e captura manual autorizada por navegador.

## Executar

Não abra index.html diretamente pelo protocolo file://: a leitura do JSON exige HTTP.

Com Python: python -m http.server 8000

Abra http://localhost:8000/

Para os testes, instale Node.js 22+ e Python 3 e execute:

1. npm install
2. npx playwright install chromium
3. npm test

A suíte utiliza servidor HTTP na porta 4173.

## Arquitetura

| Pasta / arquivo | Responsabilidade |
|---|---|
| index.html | Shell e metadados |
| css/style.css | Tokens, componentes e responsividade |
| js/app.js | Rotas, eventos e renderização |
| js/catalog.js | Busca, filtros e carregamento |
| js/ui.js | Cards e páginas da loja |
| js/storage.js | Carrinho e favoritos locais |
| data/products.json | Catálogo normalizado |
| view/api.json | Dados legados preservados |
| tests/site.spec.js | Fluxos automatizados |
| .github/workflows/quality-pages.yml | QA e GitHub Pages |
| docs/ | Baseline, design system e QA |

## Hospedagem no GitHub Pages

Sem banco de dados e sem servidor PHP. Em Settings > Pages, selecione GitHub Actions como origem da publicação. O workflow testa pull requests e somente publica main após os testes passarem. Branches de recurso não substituem o site automaticamente.

## Limitações desta demonstração
- Nenhuma compra ou pagamento real.
- Preços ilustrativos, sem estoque real.
- Dez itens antigos são exemplos, indisponíveis para adicionar ao carrinho.
- localStorage é local a cada navegador e não sincroniza entre dispositivos.
- Não possui autenticação, backend, pedidos reais ou painel administrativo.
- Descrições preservadas do acervo demonstrativo; verificar direitos de uso antes de reutilização comercial.

## Documentação
- [Design System](docs/DESIGN_SYSTEM.md)
- [Auditoria inicial](docs/BASELINE.md)
- [Testes e publicação](docs/QA.md)

Criado por [Hélio Conde](https://github.com/HelioConde).

## 📷 Diagnóstico visual

Para tirar fotos reais da loja (desktop, mobile e página inteira), rode um servidor local na porta 4173 e execute npm run screenshots. Abra qa-snapshots/index.html para visualizar todas as imagens e seus alertas; report.json inclui erros de JavaScript e possíveis áreas com overflow. O GitHub Actions também anexa um ZIP chamado salessite-visual-qa em cada execução de QA.

No site, use o link Registrar problema visual para acessar diagnostico.html. A ferramenta pede permissão antes de capturar a aba escolhida e baixa uma imagem PNG localmente, que pode ser enviada ao ChatGPT. Não existe transmissão automática da tela.

Detalhes: [Guia QA e captura](docs/QA.md).
