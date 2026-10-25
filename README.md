<div align="center">
  <h1>🛍️ SalesSite — Vitrine de produtos</h1>
  <p><strong>Estudo de loja virtual em HTML, CSS, JavaScript e jQuery, com catálogo carregado de um arquivo JSON.</strong></p>
  <p><img alt="JavaScript" src="https://img.shields.io/badge/JavaScript%20%2B%20jQuery-Frontend-F7DF1E?logo=javascript&logoColor=black"> <img alt="Status" src="https://img.shields.io/badge/status-estudo%20web-64748b"></p>
</div>

## Sobre

O projeto experimenta a apresentação de produtos em uma página comercial, com **cards**, listagens de itens e navegação própria. O código JavaScript usa AJAX para carregar os dados locais e `localStorage` para armazenar informação de navegação.

Não existe integração de pagamentos ou processamento de compras confirmado nesta documentação: **é uma vitrine demonstrativa**, não um e-commerce homologado.

## Estrutura

| Arquivo | Finalidade |
| --- | --- |
| `index.html` | Entrada e vitrine |
| `view/showItens.html` | Página de itens |
| `view/api.json` | Dados demonstrativos em JSON |
| `js/script.js` | Interação com catálogo e navegação |
| `js/navMobile.js` | Comportamento da navegação mobile |
| `css/`, `img/`, `icon/`, `font/` | Estilos e recursos gráficos |

## Como abrir

```bash
git clone https://github.com/HelioConde/SalesSite.git
cd SalesSite
python -m http.server 8000
```

Abra `http://localhost:8000`. Um servidor local é recomendado porque requisições AJAX a arquivos JSON podem não funcionar ao abrir o HTML diretamente por `file://`.

## Estado e próximos passos

**Projeto legado de estudo.** Para transformá-lo em produto real, seria necessário construir backend seguro para pedidos, estoque, autenticação e pagamentos, com testes automatizados e requisitos legais aplicáveis.

Uma retomada visual poderia revisar responsividade, semântica do HTML, navegação por teclado, carregamento de imagens e tratamento de erro nas consultas.

Criado por [Hélio Conde](https://github.com/HelioConde).
