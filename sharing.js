function productShareId(card) {
    const name = card.querySelector('.card-title').textContent.trim();
    const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `produto-${card.closest('.carousel-wrapper').id.replace('carousel-', '')}-${slug}`;
}

function openSharedProduct() {
    const id = window.location.hash.slice(1);
    if (!id.startsWith('produto-')) return;
    const card = document.getElementById(id);
    if (!card?.classList.contains('product-card-v5')) return;
    const wrapper = card.closest('.carousel-wrapper');
    switchCarousel(wrapper.id.replace('carousel-', ''));
    const index = Array.from(wrapper.querySelectorAll('.product-card-v5')).indexOf(card);
    wrapper.dataset.visibleLimit = String(Math.ceil((index + 1) / 6) * 6);
    filterCatalog('', false);
    card.tabIndex = -1;
    card.focus({ preventScroll: true });
    card.scrollIntoView({ behavior: 'auto', block: 'start' });
    recordViewedProduct(card);
}

async function shareProduct(card, status) {
    const name = card.querySelector('.card-title').textContent.trim();
    const url = new URL(window.location.href);
    url.hash = card.id;
    const data = { title: `${name} | Total Celulares`, text: `Confira este ${name} na Total Celulares.`, url: url.href };
    if (navigator.share) {
        try {
            await navigator.share(data);
            status.textContent = 'Compartilhamento concluído.';
            return;
        } catch (error) {
            if (error.name === 'AbortError') return;
        }
    }
    try {
        await navigator.clipboard.writeText(url.href);
        status.textContent = `Link de ${name} copiado!`;
    } catch {
        window.prompt('Copie o link deste produto:', url.href);
        status.textContent = 'Link disponível para copiar.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.product-card-v5').forEach(card => {
        card.id = productShareId(card);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'product-share';
        button.innerHTML = '<i class="fas fa-share-alt" aria-hidden="true"></i> Compartilhar';
        button.setAttribute('aria-label', `Compartilhar ${card.querySelector('.card-title').textContent.trim()}`);
        const status = document.createElement('span');
        status.className = 'product-share-status';
        status.setAttribute('role', 'status');
        button.addEventListener('click', () => shareProduct(card, status));
        card.querySelector('.card-info-wrap').append(button, status);
    });
    openSharedProduct();
    window.addEventListener('hashchange', openSharedProduct);
});
