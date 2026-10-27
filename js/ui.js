export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const urlFor = product => './?produto=' + encodeURIComponent(product.id);
const discount = product => product.originalPrice > product.price
  ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
const emptyState = (title, message, button = '<a class="btn btn-primary" href="./">Voltar à loja</a>') =>
  '<div class="empty-state"><div class="empty-icon" aria-hidden="true">⌕</div><h2>' +
  escapeHTML(title) + '</h2><p>' + escapeHTML(message) + '</p>' + button + '</div>';

export function productCard(product, favorites) {
  const id = escapeHTML(product.id);
  const demo = product.demo === true;
  const isFav = favorites.has(product.id);
  const percent = discount(product);
  return '<article class="product-card">' +
    '<div class="product-image-wrap">' +
      '<a href="' + urlFor(product) + '" aria-label="Detalhes: ' + escapeHTML(product.name) + '">' +
      '<img loading="lazy" decoding="async" src="./' + escapeHTML(product.image) + '" alt="Capa de ' + escapeHTML(product.name) + '" width="240" height="300"></a>' +
      (demo ? '<span class="pill pill-muted">Exemplo</span>' : percent ? '<span class="pill pill-discount">-' + percent + '%</span>' : '') +
      '<button type="button" class="favorite-btn' + (isFav ? ' is-favorite' : '') + '" data-favorite="' + id + '" aria-label="' +
      (isFav ? 'Remover ' : 'Adicionar ') + escapeHTML(product.name) + (isFav ? ' dos favoritos' : ' aos favoritos') +
      '" aria-pressed="' + isFav + '">' + (isFav ? '♥' : '♡') + '</button>' +
    '</div>' +
    '<div class="product-body">' +
      '<span class="eyebrow">' + escapeHTML(product.category) + '</span>' +
      '<h3><a href="' + urlFor(product) + '">' + escapeHTML(product.name) + '</a></h3>' +
      '<div class="price-block">' +
        (percent && !demo ? '<span class="old-price">' + money(product.originalPrice) + '</span>' : '<span class="old-price old-price-empty">&nbsp;</span>') +
        '<strong>' + money(product.price) + '</strong>' +
      '</div>' +
      (demo ? '<a class="btn btn-outline btn-small" href="' + urlFor(product) + '">Ver exemplo</a>' :
        '<button class="btn btn-primary btn-small" type="button" data-add="' + id + '">Adicionar ao carrinho</button>') +
    '</div>' +
  '</article>';
}

export function cards(products, favorites) {
  return products.map(p => productCard(p, favorites)).join('');
}

export function renderDetail(product, products, favorites) {
  if (!product) return emptyState('Produto não encontrado', 'O link pode estar incorreto ou o produto não está mais no catálogo.');
  const percent = discount(product);
  const spec = { ...(product.specs || {}), ...(product.details || {}) };
  const specs = Object.entries(spec).map(([k,v]) =>
    '<div><dt>' + escapeHTML(k) + '</dt><dd>' + escapeHTML(v) + '</dd></div>').join('');
  const related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
  return '<div class="breadcrumb"><a href="./">Início</a><span aria-hidden="true">›</span><span>' + escapeHTML(product.name) + '</span></div>' +
    '<section class="product-detail">' +
      '<div class="detail-image"><img src="./' + escapeHTML(product.image) + '" alt="Capa de ' + escapeHTML(product.name) + '" width="450" height="550"></div>' +
      '<div class="detail-content"><span class="eyebrow">' + escapeHTML(product.category) + '</span>' +
        '<h1>' + escapeHTML(product.name) + '</h1>' +
        (product.demo ? '<p class="demo-note">Este registro é apenas um exemplo do projeto antigo e não está disponível para compra.</p>' : '<p class="stock-label">● Disponível para adicionar ao carrinho de simulação</p>') +
        (percent && !product.demo ? '<p class="old-price">' + money(product.originalPrice) + ' · ' + percent + '% de desconto</p>' : '') +
        '<div class="detail-price">' + money(product.price) + '</div>' +
        '<p class="detail-warning">Valor ilustrativo; nenhuma cobrança será realizada.</p>' +
        '<div class="detail-actions">' +
          (product.available ? '<button class="btn btn-primary" type="button" data-add="' + escapeHTML(product.id) + '">Adicionar ao carrinho</button>' : '') +
          '<button class="btn btn-outline" type="button" data-favorite="' + escapeHTML(product.id) + '" aria-pressed="' + favorites.has(product.id) + '">' +
          (favorites.has(product.id) ? '♥ Remover favorito' : '♡ Salvar favorito') + '</button>' +
        '</div><h2>Sobre este produto</h2><p class="description">' + escapeHTML(product.description) + '</p>' +
      '</div></section>' +
    (specs ? '<section class="spec-section"><h2>Características</h2><dl class="spec-grid">' + specs + '</dl></section>' : '') +
    (related.length ? '<section class="related-section"><div class="section-heading"><h2>Você também pode gostar</h2></div><div class="product-grid">' + cards(related, favorites) + '</div></section>' : '');
}

export function renderFavorites(products, favorites) {
  const list = products.filter(p => favorites.has(p.id));
  return '<div class="page-heading"><a class="back-link" href="./">← Voltar ao catálogo</a><h1>Meus favoritos</h1><p>Seus produtos salvos ficam neste navegador.</p></div>' +
    (list.length ? '<div class="product-grid">' + cards(list, favorites) + '</div>' :
      emptyState('Nenhum favorito ainda', 'Toque no coração de um produto para salvá-lo aqui.'));
}

export function cartRows(products, cart, { readOnly = false } = {}) {
  return Object.entries(cart).map(([id, qty]) => {
    const p = products.find(item => item.id === id && item.available);
    if (!p) return '';
    return '<li class="cart-line">' +
      '<a href="' + urlFor(p) + '"><img src="./' + escapeHTML(p.image) + '" width="90" height="110" loading="lazy" alt="Capa de ' + escapeHTML(p.name) + '"></a>' +
      '<div class="cart-line-info"><h3><a href="' + urlFor(p) + '">' + escapeHTML(p.name) + '</a></h3>' +
      '<div class="cart-line-meta"><span>' + money(p.price) + ' / unidade</span>' +
      (readOnly ? '' : '<button class="text-button" type="button" data-remove="' + escapeHTML(id) + '">Remover</button>') + '</div></div>' +
      '<div class="cart-line-right">' +
      (readOnly ? '<span class="review-quantity">Quantidade: ' + qty + '</span>' :
        '<label for="qty-' + escapeHTML(id) + '">Quantidade</label>' +
        '<input id="qty-' + escapeHTML(id) + '" aria-label="Quantidade de ' + escapeHTML(p.name) + '" type="number" min="1" max="99" step="1" value="' + qty + '" data-qty="' + escapeHTML(id) + '">') +
      '<strong>' + money(p.price * qty) + '</strong></div></li>';
  }).filter(Boolean).join('');
}

export function cartTotal(products, cart) {
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const p = products.find(item => item.id === id && item.available);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

export function renderCart(products, cart) {
  const rows = cartRows(products, cart);
  const total = cartTotal(products, cart);
  return '<div class="page-heading"><a class="back-link" href="./">← Continuar explorando</a><h1>Meu carrinho</h1><p>Uma simulação para testar a experiência de compra.</p></div>' +
    (rows ? '<div class="cart-layout"><ul class="cart-list">' + rows + '</ul>' +
      '<aside class="order-summary"><h2>Resumo</h2><div class="summary-line"><span>Subtotal</span><strong>' + money(total) + '</strong></div>' +
      '<div class="summary-line total"><span>Total ilustrativo</span><strong>' + money(total) + '</strong></div>' +
      '<p>Sem frete, pagamento ou pedido real.</p><a class="btn btn-primary" href="./?pagina=checkout">Continuar (demonstração)</a></aside></div>' :
      emptyState('Seu carrinho está vazio', 'Escolha um livro e use o botão Adicionar ao carrinho.'));
}

export function renderCheckout(products, cart, confirmed = false) {
  if (confirmed) return '<div class="checkout-result" role="status"><span aria-hidden="true">✓</span><h1>Simulação concluída!</h1>' +
    '<p>Este foi um teste de interface. Nenhum pedido foi enviado e nenhum valor foi cobrado.</p>' +
    '<a class="btn btn-primary" href="./">Voltar ao catálogo</a></div>';
  const rows = cartRows(products, cart, { readOnly: true });
  if (!rows) return emptyState('Nenhum item para finalizar', 'Adicione um produto ao carrinho para testar o checkout.');
  return '<div class="page-heading"><a class="back-link" href="./?pagina=carrinho">← Voltar ao carrinho</a><h1>Finalização demonstrativa</h1>' +
    '<p>Confira os itens abaixo. Para alterar quantidades, volte ao carrinho.</p></div><div class="checkout-panel"><h2>Revisar itens</h2>' +
    '<ul class="cart-list">' + rows + '</ul><div class="summary-line total"><span>Total ilustrativo</span><strong>' + money(cartTotal(products, cart)) +
    '</strong></div><button class="btn btn-primary" data-confirm type="button">Confirmar simulação</button>' +
    '<p class="detail-warning">Ao confirmar, apenas o carrinho local será limpo. Não há compra real.</p></div>';
}

export { emptyState };
