const viewedStorageKey = 'total-celulares:recently-viewed:v1';
let viewedProducts = [];

function renderViewedProducts() {
    const section = document.getElementById('recently-viewed');
    const list = document.getElementById('recently-viewed-list');
    const cards = new Map(Array.from(document.querySelectorAll('.product-card-v5'))
        .map(card => [card.dataset.favoriteId, card]));
    list.replaceChildren();
    viewedProducts.forEach(id => {
        const card = cards.get(id);
        if (!card) return;
        const name = card.querySelector('.card-title').textContent.trim();
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${productShareId(card)}`;
        link.setAttribute('aria-label', `Ver novamente ${name}`);
        const image = document.createElement('img');
        image.src = card.querySelector('.card-image-wrap img').src;
        image.alt = '';
        image.loading = 'lazy';
        image.width = 120;
        image.height = 120;
        const title = document.createElement('span');
        title.textContent = name;
        link.append(image, title);
        link.addEventListener('click', event => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            if (window.location.hash === link.hash) {
                event.preventDefault();
                openSharedProduct();
            }
        });
        item.append(link);
        list.append(item);
    });
    section.hidden = list.children.length === 0;
}

function recordViewedProduct(card) {
    const id = card.dataset.favoriteId;
    if (!id) return;
    viewedProducts = [id, ...viewedProducts.filter(value => value !== id)].slice(0, 8);
    try { localStorage.setItem(viewedStorageKey, JSON.stringify(viewedProducts)); }
    catch { /* Keep history for this visit if storage is unavailable. */ }
    renderViewedProducts();
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const stored = JSON.parse(localStorage.getItem(viewedStorageKey) || '[]');
        if (Array.isArray(stored)) viewedProducts = [...new Set(stored.filter(id => typeof id === 'string'))].slice(0, 8);
    } catch { /* Invalid or unavailable storage starts with an empty history. */ }
    renderViewedProducts();
    document.getElementById('clear-viewed-products').addEventListener('click', () => {
        viewedProducts = [];
        try { localStorage.removeItem(viewedStorageKey); } catch { /* Clear in memory too. */ }
        renderViewedProducts();
        document.getElementById('catalog-search').focus({ preventScroll: true });
        document.getElementById('favorites-status').textContent = 'Histórico de produtos vistos limpo.';
    });
});
