import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const origin = process.env.SALES_SITE_URL || 'http://127.0.0.1:4173/';
const base = new URL(origin.endsWith('/') ? origin : origin + '/');
const output = path.resolve(process.env.SALES_SITE_SNAPSHOTS || 'qa-snapshots');
const timestamp = new Date().toISOString();
const rows = [];
const cases = [
  { id: 'home-desktop', size: [1440, 900], route: './' },
  { id: 'home-wide', size: [1600, 900], route: './' },
  { id: 'carousel-slide-2-desktop', size: [1440, 900], route: './', action: 'carousel-next' },
  { id: 'carousel-slide-3-mobile', size: [390, 844], route: './', action: 'carousel-last' },
  { id: 'carousel-paused-mobile', size: [390, 844], route: './', action: 'carousel-pause' },
  { id: 'home-tablet', size: [768, 1024], route: './' },
  { id: 'home-mobile', size: [390, 844], route: './' },
  { id: 'home-small', size: [320, 720], route: './' },
  { id: 'product-desktop', size: [1440, 900], route: './?produto=mVendidos-01' },
  { id: 'product-mobile', size: [390, 844], route: './?produto=mVendidos-01' },
  { id: 'added-cart-desktop', size: [1440, 900], route: './', action: 'add-product' },
  { id: 'added-cart-mobile', size: [390, 844], route: './', action: 'add-product' },
  { id: 'added-cart-small', size: [320, 700], route: './', action: 'add-product' },
  { id: 'added-cart-detail-mobile', size: [390, 844], route: './?produto=mVendidos-03', action: 'add-product-detail' },
  { id: 'cart-mobile', size: [390, 844], route: './?pagina=carrinho', state: 'cart' },
  { id: 'checkout-desktop', size: [1440, 900], route: './?pagina=checkout', state: 'cart' },
  { id: 'favorites-mobile', size: [390, 844], route: './?pagina=favoritos', state: 'favorites' },
  { id: 'favorites-desktop', size: [1440, 900], route: './?pagina=favoritos', state: 'favorites' },
  { id: 'legacy-examples-desktop', size: [1440, 900], route: './?categoria=Demonstra%C3%A7%C3%A3o' },
  { id: 'checkout-mobile-review', size: [390, 844], route: './?pagina=checkout', state: 'cart' },
  { id: 'footer-links-desktop', size: [1440, 900], route: './', action: 'footer' },
  { id: 'search-empty-mobile', size: [390, 844], route: './', action: 'no-results' },
  { id: 'menu-open-mobile', size: [390, 844], route: './', action: 'menu' }
];
const escapeHTML = value => String(value).replace(/[&<>"']/g, character =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);

await mkdir(output, { recursive: true });
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const scenario of cases) {
    const context = await browser.newContext({
      viewport: { width: scenario.size[0], height: scenario.size[1] },
      deviceScaleFactor: 1, locale: 'pt-BR', reducedMotion: 'reduce',
      colorScheme: 'light', isMobile: scenario.size[0] < 500,
      hasTouch: scenario.size[0] < 500
    });
    if (scenario.state) {
      const state = scenario.state;
      await context.addInitScript(value => {
        if (value === 'cart') localStorage.setItem('salessite:v2:cart', JSON.stringify({ 'mVendidos-01': 2 }));
        if (value === 'favorites') localStorage.setItem('salessite:v2:favorites', JSON.stringify(['mVendidos-01']));
      }, state);
    }
    const page = await context.newPage();
    const errors = [];
    const failedRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('requestfailed', request => failedRequests.push(request.url() + ': ' + (request.failure()?.errorText || 'falhou')));
    const record = {
      id: scenario.id, viewport: scenario.size.join('x'), path: scenario.route,
      fullScreenshot: scenario.id + '.png',
      viewportScreenshot: scenario.id + '-viewport.png',
      errors, failedRequests
    };
    try {
      await page.goto(new URL(scenario.route, base).href, { waitUntil: 'networkidle', timeout: 30000 });
      await page.locator('.loading').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      if (scenario.action === 'add-product') {
        await page.locator('#catalog-results [data-add="mVendidos-01"]').click();
        await page.locator('#cart-feedback').waitFor({ state: 'visible' });
      }
      if (scenario.action === 'add-product-detail') {
        await page.locator('.detail-actions [data-add="mVendidos-03"]').click();
        await page.locator('#cart-feedback').waitFor({ state: 'visible' });
      }
      if (scenario.action === 'no-results') {
        await page.locator('#header-query').fill('nao-existe-este-item-qa-2026');
      }
      if (scenario.action === 'footer') {
        await page.locator('.footer').scrollIntoViewIfNeeded();
      }
      if (scenario.action === 'menu') {
        await page.locator('#menu-toggle').click();
      }
      if (scenario.action === 'carousel-next') {
        await page.locator('[data-banner-next]').click();
      }
      if (scenario.action === 'carousel-last') {
        await page.locator('[data-banner-dot]').last().click();
      }
      if (scenario.action === 'carousel-pause') {
        // Redução de movimento inicia o carrossel pausado; ativar e pausar testa o controle.
        await page.locator('[data-banner-play]').click();
        await page.locator('[data-banner-play]').click();
      }
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (const image of document.images) {
          image.loading = 'eager';
          if (image.complete) continue;
          await image.decode().catch(() => {});
        }
      });
      record.title = await page.title();
      record.metrics = await page.evaluate(() => {
        const fullWidth = document.documentElement.scrollWidth;
        const width = window.innerWidth;
        const offenders = [...document.querySelectorAll('body *')].filter(element => {
          const rect = element.getBoundingClientRect();
          const css = getComputedStyle(element);
          return css.position !== 'fixed' && css.display !== 'none' &&
            (rect.right > width + 2 || rect.left < -2) && rect.width > 0;
        }).slice(0, 8).map(el => ({
          tag: el.tagName.toLowerCase(),
          className: typeof el.className === 'string' ? el.className.slice(0, 70) : '',
          left: Math.round(el.getBoundingClientRect().left),
          right: Math.round(el.getBoundingClientRect().right)
        }));
        return {
          innerWidth: width,
          scrollWidth: fullWidth,
          scrollHeight: document.documentElement.scrollHeight,
          horizontalOverflow: fullWidth > width + 1,
          productCards: document.querySelectorAll('#catalog-results .product-card').length,
          activeBanner: document.querySelector('#banner-carousel')?.dataset.activeSlide || null,
          cartFeedbackVisible: !document.getElementById('cart-feedback')?.hidden,
          cartCount: document.getElementById('cart-badge')?.textContent || '0',
          coverOverflow: [...document.querySelectorAll('.product-image-wrap')].flatMap(wrap => {
            const bounds = wrap.getBoundingClientRect();
            const image = wrap.querySelector('img');
            if (!image) return [];
            const rect = image.getBoundingClientRect();
            const outside = rect.bottom > bounds.bottom + 1 || rect.top < bounds.top - 1 ||
              rect.left < bounds.left - 1 || rect.right > bounds.right + 1;
            return outside ? [{ image: image.getAttribute('src'), outside: true }] : [];
          }).slice(0, 10),
          checkoutEditableControls: document.querySelectorAll('.checkout-panel [data-qty], .checkout-panel [data-remove]').length,
          footerLinksOverlap: (() => {
            const links = [...document.querySelectorAll('.footer-tools a')];
            const rectangles = links.map(el => el.getBoundingClientRect());
            return rectangles.some((r,i) => rectangles.slice(i + 1).some(q =>
              Math.max(r.left,q.left) < Math.min(r.right,q.right) - 2 &&
              Math.max(r.top,q.top) < Math.min(r.bottom,q.bottom) - 2));
          })(),
          brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0)
            .map(image => image.getAttribute('src')).slice(0, 20),
          carouselImages: [...document.querySelectorAll('[data-banner-slide] img')]
            .map(img => ({ source: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0 })),
          offenders
        };
      });

      record.contrast = await page.evaluate(() => {
        const luminance = str => {
          const parts = str.match(/[\d.]+/g);
          if (!parts || parts.length < 3) return null;
          const rgb = parts.slice(0, 3).map(Number).map(v => {
            const n = v / 255;
            return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        };
        const targets = [
          ['announcement', '.announcement'],
          ['search-button', '.header-search button'],
          ['primary-button', '.product-card .btn-primary'],
          ['banner-controls', '.banner-pause']
        ];
        return targets.flatMap(([label, selector]) => {
          const el = document.querySelector(selector);
          if (!el) return [];
          const style = getComputedStyle(el);
          const fg = luminance(style.color);
          const bg = luminance(style.backgroundColor);
          if (fg === null || bg === null) return [];
          const ratio = +((Math.max(fg,bg) + 0.05) / (Math.min(fg,bg) + 0.05)).toFixed(2);
          return [{ label, ratio, foreground: style.color, background: style.backgroundColor, pass: ratio >= 4.5 }];
        });
      });

      await page.screenshot({ path: path.join(output, record.viewportScreenshot), animations: 'disabled' });
      await page.screenshot({ path: path.join(output, record.fullScreenshot), fullPage: true, animations: 'disabled' });
    } catch (error) {
      record.error = String(error);
      try {
        await page.screenshot({ path: path.join(output, record.fullScreenshot), fullPage: true, timeout: 8000 });
      } catch { /* Preservar relatório mesmo quando a página falhar completamente. */ }
    } finally {
      rows.push(record);
      await context.close();
      console.log((record.error || record.metrics?.horizontalOverflow || record.metrics?.brokenImages?.length || record.metrics?.coverOverflow?.length || record.metrics?.footerLinksOverlap || record.metrics?.checkoutEditableControls || record.contrast?.some(c => !c.pass) || errors.length ? 'ATENÇÃO ' : 'OK ') + scenario.id);
    }
  }
} finally {
  await browser?.close();
}

const report = {
  generatedAt: timestamp,
  site: base.href,
  commit: process.env.GITHUB_SHA || 'local',
  cases: rows,
  totals: {
    count: rows.length,
    failed: rows.filter(item => item.error || item.errors.length || item.failedRequests.length || item.metrics?.horizontalOverflow || item.metrics?.brokenImages?.length || item.metrics?.coverOverflow?.length || item.metrics?.footerLinksOverlap || item.metrics?.checkoutEditableControls || item.contrast?.some(x => !x.pass)).length
  }
};
await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
const tiles = rows.map(item => {
  const status = item.error || item.errors.length || item.failedRequests.length || item.metrics?.horizontalOverflow || item.metrics?.brokenImages?.length || item.metrics?.coverOverflow?.length || item.metrics?.footerLinksOverlap || item.metrics?.checkoutEditableControls || item.contrast?.some(x => !x.pass)
    ? '<span class="status bad">Revisar</span>' : '<span class="status good">OK</span>';
  const description = [
    item.metrics?.horizontalOverflow ? 'Overflow horizontal identificado' : '',
    item.metrics?.brokenImages?.length ? 'Imagens quebradas: ' + item.metrics.brokenImages.join(', ') : '',
    item.metrics?.coverOverflow?.length ? 'Capas invadindo conteúdo: ' + item.metrics.coverOverflow.length : '',
    item.metrics?.footerLinksOverlap ? 'Links do rodapé sobrepostos' : '',
    item.metrics?.checkoutEditableControls ? 'Checkout indevidamente editável' : '',
    item.contrast?.some(x => !x.pass) ? 'Contraste baixo: ' + item.contrast.filter(x => !x.pass).map(x => x.label + '=' + x.ratio).join(', ') : '',
    item.error || '',
    ...item.errors, ...item.failedRequests
  ].filter(Boolean).join(' | ');
  return '<article><div class="tile-head"><strong>' + escapeHTML(item.id) + '</strong>' + status + '</div>' +
    '<p>' + escapeHTML(item.viewport) + (description ? ' · ' + escapeHTML(description) : '') + '</p>' +
    '<a href="' + escapeHTML(item.fullScreenshot) + '" target="_blank"><img loading="lazy" src="' +
    escapeHTML(item.viewportScreenshot) + '" alt="Captura de ' + escapeHTML(item.id) + '"></a>' +
    '<div class="tile-links"><a href="' + escapeHTML(item.fullScreenshot) + '" download>Baixar página inteira</a>' +
    '<a href="' + escapeHTML(item.viewportScreenshot) + '" download>Baixar viewport</a></div></article>';
}).join('\n');
const html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
'<title>SalesSite · Galeria de diagnóstico</title><style>' +
'body{font:15px system-ui,sans-serif;margin:0;padding:30px;background:#f2f6fa;color:#18334c}main{max-width:1300px;margin:auto}' +
'h1{font-size:clamp(1.5rem,3vw,2.4rem)}p{color:#557082}a{color:#17649a} .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:18px}' +
'article{background:white;border:1px solid #d7e1e8;border-radius:12px;padding:14px;min-width:0;overflow:hidden}' +
'article img{width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;border:1px solid #dfe6eb;border-radius:8px}' +
'.tile-head,.tile-links{display:flex;align-items:center;justify-content:space-between;gap:12px}.tile-links{margin-top:9px;flex-wrap:wrap;font-size:.85rem}' +
'.status{padding:4px 8px;border-radius:99px;font-size:.75rem;font-weight:bold}.good{background:#def2e7;color:#115b3b}.bad{background:#fee8e3;color:#962e26}' +
'</style></head><body><main><h1>SalesSite · Galeria de diagnóstico visual</h1><p>' +
escapeHTML(timestamp) + ' · ' + rows.length + ' cenários · ' + report.totals.failed +
' com alertas. Confira também <a href="report.json">report.json</a>. Os PNGs incluem capturas da viewport e da página inteira.</p>' +
'<div class="grid">' + tiles + '</div></main></body></html>';
await writeFile(path.join(output, 'index.html'), html);
if (report.totals.failed) process.exitCode = 1;
