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

test('diagnóstico visual exige autorização antes de capturar', async ({ page }) => {
  await page.goto('/diagnostico.html');
  await expect(page.getByRole('heading', { name: 'Fotografe a página para investigar um problema' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Capturar aba/ })).toBeEnabled();
  await expect(page.getByText('Nenhuma captura realizada.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Baixar informações/ })).toBeDisabled();
});


test('carrossel recupera três banners antigos e navega por setas e indicadores', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const carousel = page.locator('#banner-carousel');
  await expect(carousel).toHaveAttribute('data-active-slide', '1');
  await expect(page.locator('[data-banner-slide]')).toHaveCount(3);
  await expect(page.locator('[data-banner-dot]')).toHaveCount(3);
  await expect(page.locator('[data-banner-slide].is-active h1')).toContainText('Ideias');
  await page.getByRole('button', { name: 'Próximo banner' }).click();
  await expect(carousel).toHaveAttribute('data-active-slide', '2');
  await expect(page.locator('[data-banner-slide].is-active h1')).toContainText('Conhecimento');
  await page.getByRole('button', { name: 'Banner anterior' }).click();
  await expect(carousel).toHaveAttribute('data-active-slide', '1');
  await page.locator('[data-banner-dot]').last().click();
  await expect(carousel).toHaveAttribute('data-active-slide', '3');
  await expect(page.locator('[data-banner-dot]').last()).toHaveAttribute('aria-current', 'true');
  await carousel.focus();
  await page.keyboard.press('ArrowRight');
  await expect(carousel).toHaveAttribute('data-active-slide', '1');
  await page.getByRole('button', { name: 'Pausar rotação do carrossel' }).click();
  await expect(page.getByRole('button', { name: 'Retomar rotação do carrossel' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Retomar rotação do carrossel' }).click();
  await expect(page.getByRole('button', { name: 'Pausar rotação do carrossel' })).toHaveAttribute('aria-pressed', 'false');
});

test('as imagens originais c1, c2 e c3 são encontradas e carregadas', async ({ page }) => {
  await page.goto('/');
  const images = page.locator('[data-banner-slide] img');
  await expect(images).toHaveCount(3);
  const result = await images.evaluateAll(async imgs => {
    return await Promise.all(imgs.map(async img => {
      img.loading = 'eager';
      await img.decode().catch(() => {});
      return { src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0 };
    }));
  });
  expect(result.map(x => x.src)).toEqual(['./img/c1.jpg', './img/c2.jpg', './img/c3.jpg']);
  expect(result.every(x => x.loaded)).toBe(true);
});

test('contraste das ações primárias e faixa superior é confortável (WCAG AA)', async ({ page }) => {
  await page.goto('/');
  const results = await page.evaluate(() => {
    const lum = text => {
      const parts = text.match(/[\d.]+/g);
      if (!parts || parts.length < 3) throw Error('Cor ilegível: ' + text);
      const v = parts.slice(0,3).map(Number).map(value => {
        const x = value / 255;
        return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4;
      });
      return .2126 * v[0] + .7152 * v[1] + .0722 * v[2];
    };
    return ['.announcement', '.header-search button', '.product-card .btn-primary', '.banner-pause'].map(selector => {
      const style = getComputedStyle(document.querySelector(selector));
      const a = lum(style.color);
      const b = lum(style.backgroundColor);
      return { selector, ratio: (Math.max(a,b)+.05)/(Math.min(a,b)+.05) };
    });
  });
  expect(results.every(x => x.ratio >= 4.5), JSON.stringify(results)).toBe(true);
});

test('carrossel pode ser controlado por swipe no celular', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Apenas dispositivos mobile');
  await page.goto('/');
  const carousel = page.locator('#banner-carousel');
  await expect(carousel).toHaveAttribute('data-active-slide','1');
  await carousel.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 300, clientY: 150 });
  await carousel.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 100, clientY: 152 });
  await expect(carousel).toHaveAttribute('data-active-slide','2');
  await carousel.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 80, clientY: 152 });
  await carousel.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 290, clientY: 152 });
  await expect(carousel).toHaveAttribute('data-active-slide','1');
});

test('movimento reduzido inicia rotação pausada e mantém botões manuais', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#banner-carousel')).toHaveAttribute('data-active-slide', '1');
  await expect(page.getByRole('button', { name: 'Retomar rotação do carrossel' })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-banner-next]').click();
  await expect(page.locator('#banner-carousel')).toHaveAttribute('data-active-slide','2');
});
