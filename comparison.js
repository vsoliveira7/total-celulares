function comparisonData(card) {
    const text = selector => card.querySelector(selector)?.textContent.trim() || '';
    const specs = text('.card-specs').split('|').map(value => value.trim());
    const hasColor = Boolean(card.querySelector('.color-dot')) && specs.length > 1;
    const color = hasColor ? specs.pop() : 'Não informado';
    const capacity = card.querySelector('.card-capacity');
    return {
        name: text('.card-title'),
        image: card.querySelector('.card-image-wrap img')?.src,
        description: text('.card-tagline'),
        specs: specs.join(' | '),
        color,
        capacity: capacity ? capacity.value || 'A definir' : 'Não se aplica',
        benefits: text('.card-purchase-benefits'),
        whatsapp: card.querySelector('.btn-consult')?.href
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const opener = document.getElementById('compare-favorites');
    const dialog = document.getElementById('comparison-dialog');
    const choices = document.getElementById('comparison-choices');
    const content = document.getElementById('comparison-content');
    const message = document.getElementById('comparison-message');
    let cards = [];
    let selectors = [];
    let previousOverflow = '';
    const node = (tag, text) => {
        const element = document.createElement(tag);
        if (text !== undefined) element.textContent = text;
        return element;
    };

    function render() {
        const ids = selectors.map(select => select.value).filter(Boolean);
        selectors.forEach(select => {
            Array.from(select.options).forEach(option => {
                option.disabled = Boolean(option.value && option.value !== select.value && ids.includes(option.value));
            });
        });
        content.replaceChildren();
        if (ids.length < 2) {
            message.textContent = cards.length < 2
                ? 'Favorite pelo menos dois produtos no catálogo para comparar.'
                : 'Escolha dois ou três favoritos para comparar.';
            return;
        }
        message.textContent = `${ids.length} produtos em comparação. No celular, deslize a tabela para ver todas as colunas.`;
        const products = ids.map(id => comparisonData(cards.find(card => card.dataset.favoriteId === id)));
        const table = node('table');
        const caption = node('caption', 'Comparação dos produtos favoritos');
        table.append(caption);
        const head = node('thead');
        const names = node('tr');
        names.append(node('th', 'Produto'));
        products.forEach(product => {
            const cell = node('th', product.name);
            cell.scope = 'col';
            names.append(cell);
        });
        head.append(names);
        table.append(head);
        const body = node('tbody');
        const row = (label, fill) => {
            const tr = node('tr');
            const heading = node('th', label);
            heading.scope = 'row';
            tr.append(heading);
            products.forEach(product => {
                const cell = node('td');
                fill(cell, product);
                tr.append(cell);
            });
            body.append(tr);
        };
        row('Foto', (cell, product) => {
            const img = node('img');
            img.src = product.image;
            img.alt = product.name;
            cell.append(img);
        });
        [['Descrição', 'description'], ['Opções e características', 'specs'], ['Cor selecionada', 'color'],
            ['Capacidade selecionada', 'capacity'], ['Condições de compra', 'benefits']].forEach(([label, field]) => {
            row(label, (cell, product) => { cell.textContent = product[field] || 'Não informado'; });
        });
        row('Preço e disponibilidade', (cell, product) => {
            if (!product.whatsapp) { cell.textContent = 'Consulte a loja'; return; }
            const link = node('a', 'Consultar no WhatsApp');
            link.href = product.whatsapp;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            cell.append(link);
        });
        table.append(body);
        content.append(table);
    }

    opener.addEventListener('click', () => {
        cards = Array.from(document.querySelectorAll('.product-card-v5'))
            .filter(card => favoriteProducts.has(card.dataset.favoriteId));
        choices.replaceChildren();
        selectors = Array.from({ length: 3 }, (_, index) => {
            const label = node('label', `Produto ${index + 1}`);
            const select = node('select');
            const empty = node('option', 'Escolher favorito');
            empty.value = '';
            select.append(empty);
            cards.forEach(card => {
                const option = node('option', card.querySelector('.card-title').textContent.trim());
                option.value = card.dataset.favoriteId;
                select.append(option);
            });
            select.value = cards[index]?.dataset.favoriteId || '';
            select.disabled = !cards.length;
            select.addEventListener('change', render);
            label.append(select);
            choices.append(label);
            return select;
        });
        render();
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
    });
    document.getElementById('comparison-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', event => { if (event.key === 'Escape') event.stopPropagation(); });
    dialog.addEventListener('close', () => {
        document.body.style.overflow = previousOverflow;
        opener.focus({ preventScroll: true });
    });
});
