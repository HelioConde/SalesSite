const { test, expect } = require('@playwright/test');

test('início carrega catálogo estático com produtos e sem erros', async ({ page }) => {
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Catálogo completo/ })).toBeVisible();
  await expect(page.locator('#catalog-results .product-card')).toHaveCount(18);
  await expect(page.getByText('18 produtos encontrados')).toBeVisible();
  await expect(page.getByText('Projeto demonstrativo', { exact: false }).first()).toBeVisible();
  expect(failures).toEqual([]);
});

test('busca instantânea, filtros e estado vazio', async ({ page }) => {
  await page.goto('/');
  await page.locator('#header-query').fill('React Aprenda praticando');
  await expect(page.locator('#catalog-results .product-card')).toHaveCount(1);
  await page.locator('#header-query').fill('não existe este produto');
  await expect(page.getByRole('heading', { name: 'Nenhum resultado encontrado' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await page.locator('#filter-price').selectOption('ate-100');
  await expect(page.locator('#catalog-results .product-card')).toHaveCount(3);
  await page.locator('#filter-sort').selectOption('preco-desc');
  await expect(page.locator('#catalog-results .product-card')).toHaveCount(3);
});

test('produto possui URL direta e detalhes', async ({ page }) => {
  await page.goto('/?produto=mVendidos-01');
  await expect(page.getByRole('heading', { level: 1, name: 'React Aprenda praticando' })).toBeVisible();
  await expect(page.getByText('Sobre este produto')).toBeVisible();
  await expect(page.getByText('Características')).toBeVisible();
  await expect(page).toHaveTitle(/React Aprenda praticando/);
});

test('favoritos persistem ao navegar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#catalog-results .product-card')).toHaveCount(18);
  await page.locator('#catalog-results [data-favorite="mVendidos-01"]').click();
  await page.goto('/?pagina=favoritos');
  await expect(page.locator('.product-grid .product-card')).toHaveCount(1);
  await expect(page.getByText('React Aprenda praticando')).toBeVisible();
  await page.reload();
  await expect(page.locator('.product-grid .product-card')).toHaveCount(1);
});

test('carrinho soma quantidades e checkout não faz cobrança', async ({ page }) => {
  await page.goto('/');
  await page.locator('#catalog-results [data-add="mVendidos-01"]').click();
  await expect(page.locator('#cart-badge')).toHaveText('1');
  await page.goto('/?pagina=carrinho');
  await expect(page.getByRole('heading', { name: 'Meu carrinho' })).toBeVisible();
  await page.locator('[data-qty="mVendidos-01"]').fill('2');
  await page.locator('[data-qty="mVendidos-01"]').press('Tab');
  await expect(page.locator('#cart-badge')).toHaveText('2');
  await expect(page.getByText('R$ 138,00').first()).toBeVisible();
  await page.getByRole('link', { name: /Continuar \(demonstração\)/ }).click();
  await page.getByRole('button', { name: 'Confirmar simulação' }).click();
  await expect(page.getByRole('heading', { name: 'Simulação concluída!' })).toBeVisible();
  await expect(page.locator('#cart-badge')).toHaveText('0');
});

test('itens demonstrativos nunca têm botão adicionar ao carrinho', async ({ page }) => {
  await page.goto('/?produto=outros-01');
  await expect(page.getByText('não está disponível para compra')).toBeVisible();
  await expect(page.locator('[data-add]')).toHaveCount(0);
});

test('URL inválida apresenta orientação', async ({ page }) => {
  await page.goto('/?produto=inexistente');
  await expect(page.getByRole('heading', { name: 'Produto não encontrado' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Voltar à loja' })).toBeVisible();
});

test('menu mobile abre, fecha e respeita Escape', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Verificação exclusiva do projeto mobile');
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Abrir menu' });
  await expect(toggle).toBeVisible();
  await expect(page.locator('#mobile-nav')).toBeHidden();
  await toggle.click();
  await expect(page.locator('#mobile-nav')).toBeVisible();
  await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-nav')).toBeHidden();
});

test('erro no arquivo JSON mostra opção de recuperação', async ({ page }) => {
  await page.route('**/data/products.json', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Não foi possível carregar o catálogo' })).toBeVisible();
  await page.unroute('**/data/products.json');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Catálogo completo' })).toBeVisible();
});

test('layout não apresenta scroll horizontal na viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#catalog-results .product-card').first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});
