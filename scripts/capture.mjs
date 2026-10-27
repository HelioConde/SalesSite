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
  { id: 'home-tablet', size: [768, 1024], route: './' },
  { id: 'home-mobile', size: [390, 844], route: './' },
  { id: 'home-small', size: [320, 720], route: './' },
  { id: 'product-desktop', size: [1440, 900], route: './?produto=mVendidos-01' },
  { id: 'product-mobile', size: [390, 844], route: './?produto=mVendidos-01' },
  { id: 'cart-mobile', size: [390, 844], route: './?pagina=carrinho', state: 'cart' },
  { id: 'checkout-desktop', size: [1440, 900], route: './?pagina=checkout', state: 'cart' },
  { id: 'favorites-mobile', size: [390, 844], route: './?pagina=favoritos', state: 'favorites' },
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
      if (scenario.action === 'no-results') {
        await page.locator('#header-query').fill('nao-existe-este-item-qa-2026');
      }
      if (scenario.action === 'menu') {
        await page.locator('#menu-toggle').click();
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
          offenders
        };
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
      console.log((record.error || record.metrics?.horizontalOverflow || errors.length ? 'ATENÇÃO ' : 'OK ') + scenario.id);
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
    failed: rows.filter(item => item.error || item.errors.length || item.failedRequests.length || item.metrics?.horizontalOverflow).length
  }
};
await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
const tiles = rows.map(item => {
  const status = item.error || item.errors.length || item.failedRequests.length || item.metrics?.horizontalOverflow
    ? '<span class="status bad">Revisar</span>' : '<span class="status good">OK</span>';
  const description = [
    item.metrics?.horizontalOverflow ? 'Overflow horizontal identificado' : '',
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
