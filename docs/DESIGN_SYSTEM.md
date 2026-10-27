# SalesSite — Design System v2

## Direção visual
Vitrine de livros de tecnologia leve e objetiva, com identidade azul, tipografia legível e ações de compra demonstrativa sem confusão com comércio real.

## Tokens principais
O arquivo fonte dos tokens é css/style.css (:root).

| Token | Valor | Uso |
|---|---|---|
| --bg | #f5f8fc | Fundo da página |
| --surface | #fff | Superfícies e cards |
| --text | #152c44 | Texto principal |
| --muted | #587082 | Texto auxiliar |
| --brand | #1477c9 | Ação primária |
| --brand-dark | #09538f | Hover e links |
| --deep | #10314e | Faixa superior e rodapé |
| --border | #dbe6ef | Divisórias |
| --soft | #eaf4fd | Superfície destacada |
| --radius | 16px | Cards |
| --shadow | 0 12px 32px rgba(20,51,79,.08) | Elevação |

Espaçamentos: 4/8/12/16/24/32/48 px. Conteúdo até 1160 px.

## Tipografia
- Títulos e marca: Poppins SemiBold local; fonte do sistema como fallback.
- Corpo: fontes nativas do sistema para legibilidade e desempenho.
- H1 responsivo com clamp; botões e cards não dependem de hover para mostrar texto.

## Componentes
- Botão primário: .btn.btn-primary, nunca concluir compra real.
- Botão secundário: .btn.btn-outline.
- Card: .product-card; demonstração distinta de produto utilizável.
- Favoritos: .favorite-btn, com aria-pressed.
- Filtros: .filter-group com label.
- Feedback: .toast e role=status.
- Estado vazio: .empty-state, com recuperação.
- Capa: object-fit contain, sem distorção.

## Acessibilidade e responsividade
- Teclado: link para conteúdo, foco visível, botões reais, Escape fecha menu.
- Mobile: colunas refluem sem duplicar conteúdo. Breakpoints: 950, 760 e 420 px.
- Respeitar prefers-reduced-motion: reduce.
- Contraste e foco devem ser confirmados por auditoria automatizada e manual.
- Menu mobile: aria-expanded, aria-controls e hidden.
- Não depender de gestos de mouse para ações críticas.

## Regras de experiência
1. Pesquisa e catálogo acessíveis em qualquer tamanho de tela.
2. Nunca indicar checkout como uma compra real.
3. Não adicionar preço não presente nos dados legados.
4. Favoritos e carrinho usam somente dados no navegador.
5. Produto acessível por URL compartilhável usando o parâmetro produto.
