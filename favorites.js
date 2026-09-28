const favoritesStorageKey = 'total-celulares:favorites:v1';
let favoriteProducts = new Set();
let favoritesOnly = false;

function updateFavoritesWhatsApp() {
    const link = document.getElementById('favorites-whatsapp');
    if (!link) return;
    const cards = Array.from(document.querySelectorAll('.product-card-v5'))
        .filter(card => favoriteProducts.has(card.dataset.favoriteId));
    link.hidden = cards.length === 0;
    if (!cards.length) {
        link.removeAttribute('href');
        return;
    }
    const products = cards.map((card, index) => {
        const name = card.querySelector('.card-title').textContent.trim();
        return [`${index + 1}. ${name}`, ...getProductWhatsAppDetails(card)].join('\n');
    });
    const message = [
        'Olá, Total Celulares! Salvei estes produtos como favoritos no site:',
        '',
        products.join('\n\n'),
        '',
        'Quais os valores e a disponibilidade? Gostaria de ajuda para escolher.'
    ].join('\n');
    link.href = `https://wa.me/5511945401687?text=${encodeURIComponent(message)}`;
}

function syncFavoriteButtons() {
    let count = 0;
    document.querySelectorAll('.product-card-v5').forEach(card => {
        const saved = favoriteProducts.has(card.dataset.favoriteId);
        if (saved) count++;
        const button = card.querySelector('.product-favorite');
        if (!button) return;
        const name = card.querySelector('.card-title').textContent.trim();
        button.setAttribute('aria-pressed', String(saved));
        button.setAttribute('aria-label', `${saved ? 'Remover' : 'Adicionar'} ${name} ${saved ? 'dos' : 'aos'} favoritos`);
        button.querySelector('i').className = `${saved ? 'fas' : 'far'} fa-heart`;
    });
    const filter = document.getElementById('favorites-filter');
    filter.textContent = `Meus favoritos (${count})`;
    filter.setAttribute('aria-pressed', String(favoritesOnly));
    updateFavoritesWhatsApp();
}

function initializeFavorites() {
    try {
        const stored = JSON.parse(localStorage.getItem(favoritesStorageKey) || '[]');
        if (Array.isArray(stored)) favoriteProducts = new Set(stored.filter(id => typeof id === 'string'));
    } catch { /* Continue in memory when browser storage is unavailable. */ }
    document.querySelectorAll('.product-card-v5').forEach(card => {
        const name = card.querySelector('.card-title').textContent.trim();
        card.dataset.favoriteId = `${card.closest('.carousel-wrapper').id}:${name}`;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'product-favorite';
        button.innerHTML = '<i class="far fa-heart" aria-hidden="true"></i>';
        button.addEventListener('click', () => {
            const id = card.dataset.favoriteId;
            const removing = favoriteProducts.has(id);
            if (removing) favoriteProducts.delete(id);
            else favoriteProducts.add(id);
            let persisted = true;
            try { localStorage.setItem(favoritesStorageKey, JSON.stringify([...favoriteProducts])); }
            catch { persisted = false; }
            syncFavoriteButtons();
            document.getElementById('favorites-status').textContent =
                `${name} ${removing ? 'removido dos' : 'adicionado aos'} favoritos.` +
                (persisted ? '' : ' A seleção ficará salva apenas nesta visita.');
            if (favoritesOnly) {
                document.getElementById('favorites-filter').focus({ preventScroll: true });
                filterCatalog(document.getElementById('catalog-search').value, false);
            }
        });
        card.querySelector('.card-image-wrap').append(button);
    });
    document.getElementById('favorites-filter').addEventListener('click', () => {
        favoritesOnly = !favoritesOnly;
        syncFavoriteButtons();
        filterCatalog(document.getElementById('catalog-search').value);
    });
    syncFavoriteButtons();
}
