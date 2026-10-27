# Auditoria e baseline — 27/10/2026

Base original antes da modernização: commit 22edb1a94e1deb5ea07f57924498b93dfaa83e68, branch main.

## Encontrado
- js/script.js e js/view.js buscavam catálogo via coleção remota do Postman.
- Três áreas usavam dados repetidos de mVendidos.
- id=view repetido em três seções.
- js/navMobile.js registrava handlers de scroll a cada mousemove / touchmove.
- Página de detalhes dependia de localStorage.getItem('view').
- Conteúdo Lorem ipsum e formulários legados com referência a PHP.
- Catálogo original: 18 registros em view/api.json, sendo 8 livros identificados e 10 placeholders.

## Estratégia
- Preservar main e view/api.json originais.
- Branch: feat/modernizacao-loja-2026.
- Catálogo derivado data/products.json com 18 IDs estáveis, preço numérico e categorias.
- Placeholders identificados: demo=true, available=false e sem acesso ao carrinho.
- Vitrine modular, estática, sem backend, checkout ou cobrança reais.
- view.html redireciona links legados para home ou detalhe reconhecível.

## Não validado na inspeção inicial
- Auditoria visual em todos os dispositivos.
- Core Web Vitals ou Lighthouse medidos.
- Integração com gateways de pagamento e operações administrativas (fora de escopo).
