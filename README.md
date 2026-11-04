# Total Celulares - Catálogo Modernizado 📱✨

Este é o catálogo digital oficial da **Total Celulares**, totalmente modernizado para oferecer uma experiência de compra premium, rápida e intuitiva. O projeto foi desenvolvido com foco em alta performance e design responsivo.

## 🚀 Funcionalidades

- **Catálogo Inteligente**: Busca e categorias de iPhone, iPad, Mac, Apple Watch, AirPods e acessórios Apple.
- **Design Premium**: Interface baseada em Glassmorphism e Dark Mode para um visual tecnológico.
- **Seção "Por que escolher a Total?"**: Destaque para os diferenciais da loja (Troca Inteligente, Suporte Especializado, etc).
- **Depoimentos Reais**: Feedback de clientes satisfeitos com o processo de compra e upgrade.
- **Rodapé Profissional**: Navegação completa, categorias de produtos e informações de contato claras.
- **Botão Direto para WhatsApp**: Facilidade na consulta de preços e estoque.

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e SEO-friendly.
- **CSS3 (Vanilla)**: Design customizado, animações modernas e grid system.
- **JavaScript**: Lógica de filtragem do catálogo e animações de scroll ([data-reveal]).
- **Font Awesome**: Ícones profissionais.
- **Google Fonts**: Tipografia moderna (Outfit).

## 📂 Estrutura do Projeto

- `/img`: Ativos visuais organizados por categorias e marcas.
- `/img/products`: Renders 3D dos aparelhos em alta qualidade.
- `index.html`: Estrutura principal do site.
- `style.css`: Toda a estilização e responsividade.
- `script.js`: Dinamismo e interações.

## Verificação local

Execute `node scratch/check-catalog.cjs` com Node.js 22 ou superior e Chrome ou Edge instalado. Para outro caminho do navegador, defina `BROWSER_PATH`.

O teste abre um navegador invisível e um servidor temporário restrito a `127.0.0.1`. Verifica paginação, favoritos, busca sem resultados, seleção de cor e capacidade, mensagem do WhatsApp, ampliação de foto, foco do modal legal, links de produtos e histórico. Não envia mensagens nem acessa o WhatsApp. Recursos externos são bloqueados durante o teste; isso não valida fontes, ícones ou serviços externos. O perfil temporário isolado fica na pasta temporária do sistema.

## Melhorias identificadas na revisão

- Converter as imagens maiores para WebP/AVIF, com comparação visual antes de substituir: `img/hero-iphone-xiaomi.png` tem aproximadamente 1,65 MB. Priorizar os arquivos efetivamente usados pela página.
- Definir a URL pública oficial nos metadados de compartilhamento: `og:image` usa um caminho relativo. Adicionar URL absoluta, `og:url` e endereço canônico após confirmar o domínio de publicação.
- Centralizar os dados dos produtos: o catálogo atual repete conteúdo e ações em um HTML de aproximadamente 218 KB. Uma fonte única facilitaria atualizar modelos, cores e capacidades sem divergências.
- Complementar os testes automatizados com revisão visual em celular e validação de fontes, ícones e mapa na hospedagem real.

---
Desenvolvido para oferecer a melhor experiência em tecnologia. 🚀
