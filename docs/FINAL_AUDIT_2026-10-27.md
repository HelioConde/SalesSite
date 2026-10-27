# Auditoria final SalesSite — 27/10/2026

Referência: análise do repositório e capturas reais do navegador disponibilizadas pelo usuário. Branch: audit/final-polish-2026-10.

## Problemas observados e decisões

| Prioridade | Observação | Correção |
|---|---|---|
| Alta | Capas ultrapassavam o limite das áreas de imagem, especialmente nos favoritos | Forçar contenção de capa, centralização e limites por breakpoint |
| Alta | Dez placeholders Lorem ipsum tomavam grande parte da homepage | Mostrar os oito livros de tecnologia como padrão e manter os dez exemplos acessíveis por categoria e filtro |
| Média | Revisão de checkout ainda permitia editar quantidades e remover produtos | Exibir revisão somente leitura, mantendo edições no carrinho |
| Média | Textos e CTAs dos banners laterais apareciam cortados | Ocultar textos das prévias laterais, mantendo o slide ativo acessível |
| Média | Links do rodapé pareciam colados | Separação visual e espaçamento responsivo |
| Média | Regressões visuais difíceis de identificar apenas por ausência de overflow horizontal | Métricas de capas, rodapé e checkout no capturador Playwright |

## Limites
- Os 18 produtos de data/products.json não foram removidos.
- A vitrine e o carrinho são demonstrativos: não há pagamentos reais.
- Screenshot e teste automatizado identificam defeitos técnicos, mas não substituem revisão visual humana e testes com leitor de tela.
- Antes de divulgar o site para uso comercial, revisar direitos de autor de descrições e imagens dos livros, além de estoque e pagamentos reais.

## Evidências de QA
Consulte docs/QA.md e a execução mais recente do workflow QA e GitHub Pages para número de testes e capturas geradas; nenhum resultado é presumido aprovado antes de terminar o CI.
