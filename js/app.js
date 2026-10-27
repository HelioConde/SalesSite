import { setupBannerCarousel } from './carousel.js';
import { loadCatalog, findProduct, searchCatalog } from './catalog.js';
import { getCart, getFavorites, addToCart, setQuantity, toggleFavorite, clearCart, cartCount } from './storage.js';
import { escapeHTML, money, productCard, cards, renderDetail, renderCart, renderFavorites, renderCheckout, emptyState } from './ui.js';

const main = document.getElementById('conteudo');
const headerSearch = document.getElementById('header-search');
const queryField = document.getElementById('header-query');
const navToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const cartBadge = document.getElementById('cart-badge');
const toast = document.getElementById('toast');
const cartFeedback = document.getElementById('cart-feedback');
const cartFeedbackContent = document.getElementById('cart-feedback-content');
const cartAnnouncement = document.getElementById('cart-announcement');
const cartLink = document.querySelector('[data-nav="carrinho"]');
let products = [];
let confirmed = false;
let noticeTimeout;
let stopBanner = () => {};
let cartFeedbackTimer;
const addButtonTimers = new WeakMap();

function routeParams() { return new URLSearchParams(window.location.search); }
function stateFromUrl() {
  const p = routeParams();
  return {
    query: p.get('q') || '',
    category: p.get('categoria') || 'todos',
    range: p.get('preco') || 'todos',
    sort: p.get('ordem') || 'destaque'
  };
}
let filters = stateFromUrl();

function updateTitle(title, description) {
  document.title = title + ' — SalesSite';
  const meta = document.querySelector('meta[name="description"]');
  if (meta && description) meta.setAttribute('content', description.slice(0, 160));
}
function notice(text) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => { toast.hidden = true; }, 3300);
}
function closeCartFeedback() {
  clearTimeout(cartFeedbackTimer);
  cartFeedback.hidden = true;
}
function showCartFeedback(product, button) {
  // Produto é do catálogo local validado; escapar o texto antes de construir HTML.
  const quantity = getCart()[product.id] || 0;
  cartFeedbackContent.innerHTML =
    '<img class="cart-feedback-cover" src="./' + escapeHTML(product.image) + '" alt="Capa de ' + escapeHTML(product.name) + '" width="68" height="86">' +
    '<div class="cart-feedback-info"><strong>' + escapeHTML(product.name) + '</strong>' +
    '<span>' + quantity + (quantity === 1 ? ' unidade no carrinho' : ' unidades no carrinho') + '</span>' +
    '<b>' + money(product.price * quantity) + '</b></div>';
  cartFeedback.hidden = false;
  cartAnnouncement.textContent = product.name + ' adicionado ao carrinho. ' +
    quantity + (quantity === 1 ? ' unidade.' : ' unidades.') + ' Use Ver carrinho para revisar os itens.';
  clearTimeout(cartFeedbackTimer);
  // Não desaparece enquanto o visitante passa o mouse ou interage com o cartão.
  cartFeedbackTimer = window.setTimeout(() => {
    if (!cartFeedback.matches(':hover') && !cartFeedback.contains(document.activeElement)) closeCartFeedback();
  }, 6500);
  if (button) {
    clearTimeout(addButtonTimers.get(button));
    button.classList.add('is-added');
    button.textContent = '✓ Adicionado!';
    const t = window.setTimeout(() => {
      if (!button.isConnected) return;
      button.classList.remove('is-added');
      button.textContent = 'Adicionar ao carrinho';
    }, 1900);
    addButtonTimers.set(button, t);
  }
}
function updateBadge(animate = false) {
  cartBadge.textContent = String(cartCount());
  if (animate && cartLink) {
    cartLink.classList.remove('cart-just-updated');
    void cartLink.offsetWidth;
    cartLink.classList.add('cart-just-updated');
  }
}
function closeMenu() {
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Abrir menu');
  mobileNav.hidden = true;
}
function syncFilterUrl() {
  const p = new URLSearchParams();
  if (filters.query) p.set('q', filters.query);
  if (filters.category !== 'todos') p.set('categoria', filters.category);
  if (filters.range !== 'todos') p.set('preco', filters.range);
  if (filters.sort !== 'destaque') p.set('ordem', filters.sort);
  history.replaceState(null, '', window.location.pathname + (p.toString() ? '?' + p : ''));
}
function filterOptions() {
  const categories = ['todos', ...new Set(products.map(p => p.category))];
  return categories.map(v => '<option value="' + escapeHTML(v) + '"' +
    (filters.category === v ? ' selected' : '') + '>' +
    (v === 'todos' ? 'Todas as categorias' : escapeHTML(v)) + '</option>').join('');
}
function renderResults() {
  const results = searchCatalog(products, filters);
  const box = document.getElementById('catalog-results');
  const count = document.getElementById('results-count');
  if (!box || !count) return;
  count.textContent = results.length + (results.length === 1 ? ' produto encontrado' : ' produtos encontrados');
  box.innerHTML = results.length ? cards(results, getFavorites()) :
    emptyState('Nenhum resultado encontrado', 'Experimente buscar outra palavra ou ajustar os filtros.',
      '<button type="button" class="btn btn-primary" data-clear>Limpar filtros</button>');
}
/**
 * Recupera as três imagens do carrossel original de 2022 e mantém os
 * conteúdos atuais do catálogo logo abaixo.
 */
function renderBannerCarousel() {
  const banners = [
    { image: './img/c1.jpg', tag: 'Uma nova página', title: 'Ideias para seu próximo projeto', description: 'Explore livros de tecnologia e descubra novas possibilidades.' },
    { image: './img/c2.jpg', tag: 'Aprenda algo novo', title: 'Conhecimento no seu ritmo', description: 'Do HTML ao React: encontre inspiração para continuar evoluindo.' },
    { image: './img/c3.jpg', tag: 'Sempre em destaque', title: 'Transforme curiosidade em criação', description: 'Organize seus favoritos e experimente nosso catálogo.' }
  ];
  return '<section class="banner-carousel" id="banner-carousel" aria-label="Destaques da loja" aria-roledescription="carrossel" tabindex="0" data-active-slide="1">' +
    '<div class="banner-stage">' +
    banners.map((banner, i) =>
      '<article class="banner-slide" data-banner-slide data-position="other" aria-roledescription="slide" aria-label="' + (i + 1) + ' de 3">' +
      '<img src="' + banner.image + '" width="1200" height="520" alt="" decoding="async"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '>' +
      '<div class="banner-copy"><span class="banner-kicker">' + banner.tag + '</span>' +
      '<h1>' + banner.title + '</h1><p>' + banner.description + '</p>' +
      '<a class="banner-cta" href="#catalogo">Explorar livros <span aria-hidden="true">→</span></a></div></article>'
    ).join('') +
    '</div><div class="banner-controls">' +
    '<button type="button" data-banner-prev class="banner-arrow" aria-label="Banner anterior">←</button>' +
    '<div class="banner-dots" aria-label="Selecionar banner">' +
    banners.map((_, i) => '<button type="button" data-banner-dot aria-label="Mostrar banner ' + (i + 1) + ' de 3" aria-current="false"></button>').join('') +
    '</div><button type="button" data-banner-next class="banner-arrow" aria-label="Próximo banner">→</button>' +
    '<button type="button" data-banner-play class="banner-pause" aria-label="Pausar rotação do carrossel">Ⅱ Pausar rotação</button>' +
    '<span class="sr-only" data-banner-status aria-live="polite" aria-atomic="true"></span>' +
    '</div></section>';
}

function renderHome() {
  updateTitle('Livros e tecnologia', 'Encontre livros de tecnologia e explore um e-commerce demonstrativo sem pagamentos reais.');
  queryField.value = filters.query;
  const featured = products.filter(p => p.available).slice(0, 6);
  const actual = products.filter(p => p.available).length;
  main.innerHTML =
    renderBannerCarousel() +
    '<div class="trust-strip"><span>📚 <strong>' + actual + '</strong> livros identificados</span>' +
      '<span>♡ Favoritos salvos localmente</span><span>🛒 Carrinho para simulação</span></div>' +
    '<section class="featured-section" aria-labelledby="featured-title"><div class="section-heading"><div>' +
      '<span class="eyebrow">Seleção de livros</span><h2 id="featured-title">Em destaque</h2></div>' +
      '<div class="rail-actions"><button type="button" aria-label="Ver produtos anteriores" data-scroll="left">←</button>' +
      '<button type="button" aria-label="Ver próximos produtos" data-scroll="right">→</button></div></div>' +
      '<div class="featured-rail" id="featured-rail" tabindex="0" aria-label="Produtos em destaque">' +
      cards(featured, getFavorites()) + '</div></section>' +
    '<section class="catalog-section" id="catalogo" aria-labelledby="catalog-title">' +
      '<div class="section-heading"><div><span class="eyebrow">Explore a coleção</span><h2 id="catalog-title">Catálogo completo</h2></div></div>' +
      '<div class="catalog-toolbar"><div class="filter-group">' +
      '<label for="filter-category">Categoria</label><select id="filter-category">' + filterOptions() + '</select></div>' +
      '<div class="filter-group"><label for="filter-price">Faixa de preço</label><select id="filter-price">' +
      '<option value="todos">Todos os preços</option><option value="ate-100">Até R$ 100</option>' +
      '<option value="100-200">R$ 100 a R$ 200</option><option value="acima-200">Acima de R$ 200</option></select></div>' +
      '<div class="filter-group"><label for="filter-sort">Ordenar por</label><select id="filter-sort">' +
      '<option value="destaque">Destaques</option><option value="preco-asc">Menor preço</option>' +
      '<option value="preco-desc">Maior preço</option><option value="nome">Nome (A–Z)</option></select></div></div>' +
      '<div class="results-header"><p id="results-count" aria-live="polite"></p>' +
      '<span>Itens de exemplo são identificados no catálogo.</span></div>' +
      '<div id="catalog-results" class="product-grid"></div></section>' +
    '<section class="info-banner"><div><span class="eyebrow">Sobre este projeto</span><h2>Uma loja para experimentar, não para comprar.</h2>' +
      '<p>Os produtos e valores são ilustrativos. Você pode testar busca, filtros, favoritos e carrinho sem compartilhar dados.</p></div>' +
      '<a class="btn btn-outline" href="https://github.com/HelioConde/SalesSite" target="_blank" rel="noopener noreferrer">Conhecer o código ↗</a></section>';
  document.getElementById('filter-price').value = filters.range;
  document.getElementById('filter-sort').value = filters.sort;
  renderResults();
  stopBanner = setupBannerCarousel(document.getElementById('banner-carousel'));
}
function renderRoute() {
  closeCartFeedback();
  stopBanner();
  stopBanner = () => {};
  const params = routeParams();
  const id = params.get('produto');
  const page = params.get('pagina');
  updateBadge();
  if (id !== null) {
    const product = findProduct(products, id);
    updateTitle(product ? product.name : 'Produto não encontrado', product?.description || 'Produto não encontrado.');
    main.innerHTML = renderDetail(product, products, getFavorites());
  } else if (page === 'favoritos') {
    updateTitle('Meus favoritos', 'Seus livros salvos na vitrine.');
    main.innerHTML = renderFavorites(products, getFavorites());
  } else if (page === 'carrinho') {
    updateTitle('Meu carrinho', 'Seu carrinho de compras demonstrativo.');
    main.innerHTML = renderCart(products, getCart());
  } else if (page === 'checkout') {
    updateTitle('Checkout demonstrativo', 'Simulação de finalização sem pagamento real.');
    main.innerHTML = renderCheckout(products, getCart(), confirmed);
  } else {
    filters = stateFromUrl();
    renderHome();
  }
}
function refreshVisible() {
  const params = routeParams();
  const page = params.get('pagina');
  if (!params.has('produto') && !page && document.getElementById('catalog-results')) {
    const position = document.activeElement?.getAttribute('data-favorite');
    const isFav = position !== null && position !== undefined;
    renderResults();
    document.getElementById('featured-rail').innerHTML =
      cards(products.filter(p => p.available).slice(0, 6), getFavorites());
    if (isFav) document.querySelector('[data-favorite="' + CSS.escape(position) + '"]')?.focus();
  } else renderRoute();
}
function activeProduct(id) { return findProduct(products, id); }

navToggle.addEventListener('click', () => {
  const open = mobileNav.hidden;
  mobileNav.hidden = !open;
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); navToggle.focus(); }
  if (event.key === 'Escape' && !cartFeedback.hidden) closeCartFeedback();
});
cartFeedback.addEventListener('click', event => {
  if (event.target.closest('[data-close-feedback]')) closeCartFeedback();
});
cartFeedback.addEventListener('mouseleave', () => {
  if (!cartFeedback.hidden) {
    clearTimeout(cartFeedbackTimer);
    cartFeedbackTimer = setTimeout(() => {
      if (!cartFeedback.contains(document.activeElement)) closeCartFeedback();
    }, 2600);
  }
});
document.addEventListener('click', event => {
  if (!mobileNav.hidden && !event.target.closest('#mobile-nav, #menu-toggle')) closeMenu();
});
mobileNav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

headerSearch.addEventListener('submit', event => {
  event.preventDefault();
  const query = queryField.value.trim();
  location.href = './' + (query ? '?q=' + encodeURIComponent(query) + '#catalogo' : '#catalogo');
});
queryField.addEventListener('input', () => {
  const params = routeParams();
  if (params.has('produto') || params.has('pagina')) return;
  filters.query = queryField.value.trim();
  syncFilterUrl();
  renderResults();
});

main.addEventListener('change', event => {
  if (event.target.matches('[data-qty]')) {
    const id = event.target.dataset.qty;
    if (activeProduct(id)?.available) {
      setQuantity(id, Number(event.target.value));
      renderRoute();
    }
    return;
  }
  const mapping = { 'filter-category': 'category', 'filter-price': 'range', 'filter-sort': 'sort' };
  const key = mapping[event.target.id];
  if (key) {
    filters[key] = event.target.value;
    syncFilterUrl();
    renderResults();
  }
});

main.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  const fav = event.target.closest('[data-favorite]');
  const remove = event.target.closest('[data-remove]');
  const clear = event.target.closest('[data-clear]');
  const scroll = event.target.closest('[data-scroll]');
  const confirm = event.target.closest('[data-confirm]');
  if (add) {
    const product = activeProduct(add.dataset.add);
    if (product?.available) {
      addToCart(product.id);
      updateBadge(true);
      showCartFeedback(product, add);
    }
  } else if (fav) {
    const product = activeProduct(fav.dataset.favorite);
    if (product) {
      const selected = toggleFavorite(product.id);
      refreshVisible();
      notice(selected ? 'Produto salvo nos favoritos.' : 'Produto removido dos favoritos.');
    }
  } else if (remove) {
    setQuantity(remove.dataset.remove, 0);
    renderRoute();
    notice('Produto removido do carrinho.');
  } else if (clear) {
    filters = { query: '', category: 'todos', range: 'todos', sort: 'destaque' };
    queryField.value = '';
    document.getElementById('filter-category').value = 'todos';
    document.getElementById('filter-price').value = 'todos';
    document.getElementById('filter-sort').value = 'destaque';
    syncFilterUrl();
    renderResults();
  } else if (scroll) {
    const rail = document.getElementById('featured-rail');
    if (rail) rail.scrollBy({
      left: (scroll.dataset.scroll === 'right' ? 1 : -1) * Math.max(240, rail.clientWidth * 0.8),
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  } else if (confirm) {
    if (Object.keys(getCart()).length) {
      confirmed = true; clearCart(); updateBadge();
      renderRoute();
    }
  }
});

window.addEventListener('popstate', () => { confirmed = false; renderRoute(); });

async function boot() {
  try {
    main.innerHTML = '<div class="loading" role="status"><span class="spinner" aria-hidden="true"></span> Carregando catálogo…</div>';
    products = await loadCatalog();
    renderRoute();
  } catch (error) {
    console.error(error);
    main.innerHTML = '<div class="empty-state" role="alert"><h1>Não foi possível carregar o catálogo</h1>' +
      '<p>Confira sua conexão e tente novamente. Os arquivos precisam ser acessados via servidor HTTP.</p>' +
      '<button class="btn btn-primary" type="button" id="retry-catalog">Tentar novamente</button></div>';
    document.getElementById('retry-catalog').addEventListener('click', boot, { once: true });
  }
}
boot();
