# SalesSite — Design System v2

## Direção visual
Vitrine de livros de tecnologia com identidade azul dessaturada, contraste confortável e imagens do carrossel original preservadas. O destaque visual é a leitura, sem grandes áreas de azul saturado ou brilhos artificiais.

## Tokens principais
O arquivo fonte dos tokens é css/style.css (:root).

| Token | Valor | Uso |
|---|---|---|
| --bg | #f4f6f7 | Fundo da página |
| --surface | #fff | Superfícies e cards |
| --text | #273542 | Texto principal |
| --muted | #526374 | Texto auxiliar |
| --brand | #426a8c | Ação primária |
| --brand-dark | #294b6a | Hover e links |
| --deep | #273b4e | Faixa superior e rodapé |
| --border | #dce3e9 | Divisórias |
| --soft | #edf2f5 | Superfície destacada |
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


## Carrossel de destaque (versão 2026)
- Preserva img/c1.jpg, img/c2.jpg e img/c3.jpg do projeto original.
- Módulo js/carousel.js com botões anteriores, próximos, indicadores e pausa.
- Rotação a cada 6,5 segundos, suspensa em interação, foco, janela em segundo plano e movimento reduzido.
- Controles por teclado, toque e mouse; somente o slide ativo aceita foco.
- Fotos dessaturadas e gradiente escuro para leitura do conteúdo.
- Capturas automáticas incluem slides 2, 3 e pausado.

## Contraste e conforto
- Azul de ação #426a8c tem contraste de aproximadamente 5,72:1 com branco (texto normal WCAG AA).
- Fundos amplos: cinza muito claro. Barras informativas: cinza-azulado claro.
- Preservar contraste e foco visível para acessibilidade.
