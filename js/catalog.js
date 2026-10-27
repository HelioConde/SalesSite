const url = new URL('../data/products.json', import.meta.url);
let pending;

export async function loadCatalog() {
  if (!pending) {
    pending = fetch(url)
      .then(async response => {
        if (!response.ok) throw new Error('Catálogo indisponível (HTTP ' + response.status + ').');
        return response.json();
      })
      .then(rows => {
        if (!Array.isArray(rows)) throw new Error('Formato do catálogo inválido.');
        const ids = new Set();
        return rows.map(row => {
          if (typeof row.id !== 'string' || !row.id || ids.has(row.id) ||
              typeof row.name !== 'string' || !Number.isFinite(row.price) || row.price < 0) {
            throw new Error('Produto inválido ou ID duplicado.');
          }
          ids.add(row.id);
          return { ...row, available: row.available === true && row.demo !== true };
        });
      })
      .catch(error => { pending = null; throw error; });
  }
  return pending;
}

export function findProduct(products, id) {
  return products.find(product => product.id === id);
}

export function searchCatalog(products, options = {}) {
  const term = String(options.query || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const category = options.category || 'todos';
  const range = options.range || 'todos';
  const sort = options.sort || 'destaque';
  const results = products.filter(product => {
    const haystack = (product.name + ' ' + product.category + ' ' + product.description)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const byText = !term || haystack.includes(term);
    const byCategory = category === 'todos' || product.category === category;
    const byPrice = range === 'todos' || (range === 'ate-100' && product.price <= 100) ||
      (range === '100-200' && product.price > 100 && product.price <= 200) ||
      (range === 'acima-200' && product.price > 200);
    return byText && byCategory && byPrice;
  });
  if (sort === 'preco-asc') results.sort((a, b) => a.price - b.price);
  else if (sort === 'preco-desc') results.sort((a, b) => b.price - a.price);
  else if (sort === 'nome') results.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  else results.sort((a, b) => a.rank - b.rank);
  return results;
}
