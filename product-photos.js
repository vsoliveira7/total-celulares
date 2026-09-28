document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('product-photo-dialog');
    const preview = document.getElementById('product-photo-preview');
    const title = document.getElementById('product-photo-title');
    const colors = document.getElementById('product-photo-colors');
    const caption = document.getElementById('product-photo-caption');
    let observer;
    let opener;
    let previousOverflow = '';

    function openPhoto(card, button) {
        const source = card.querySelector('.card-image-wrap img');
        const name = card.querySelector('.card-title').textContent.trim();
        const dots = Array.from(card.querySelectorAll('.color-dot'));
        opener = button;
        title.textContent = name;
        colors.replaceChildren();
        const refresh = () => {
            preview.src = source.src;
            const specs = card.querySelector('.card-specs')?.textContent.trim() || '';
            const color = dots.length ? specs.split('|').pop().trim() : '';
            caption.textContent = color ? `Cor: ${color}` : '';
            preview.alt = color ? `${name} — ${color}` : name;
            Array.from(colors.children).forEach((choice, index) => {
                const selected = dots[index].getAttribute('aria-pressed');
                choice.setAttribute('aria-pressed', selected || String(
                    dots[index].getAttribute('aria-label') === `Selecionar cor: ${color}`
                ));
            });
        };
        dots.forEach(dot => {
            const choice = document.createElement('button');
            choice.type = 'button';
            choice.className = 'photo-color-choice';
            choice.textContent = dot.getAttribute('aria-label').replace('Selecionar cor: ', '');
            choice.addEventListener('click', () => {
                dot.click();
                refresh();
            });
            colors.append(choice);
        });
        refresh();
        observer?.disconnect();
        observer = new MutationObserver(refresh);
        observer.observe(source, { attributes: true, attributeFilter: ['src'] });
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        recordViewedProduct(card);
    }

    document.querySelectorAll('.product-card-v5').forEach(card => {
        const source = card.querySelector('.card-image-wrap img');
        if (!source) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'product-photo-open';
        button.setAttribute('aria-label', `Ampliar foto de ${card.querySelector('.card-title').textContent.trim()}`);
        button.setAttribute('aria-haspopup', 'dialog');
        source.replaceWith(button);
        button.append(source);
        button.addEventListener('click', () => openPhoto(card, button));
    });
    document.getElementById('product-photo-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('keydown', event => {
        if (event.key === 'Escape') event.stopPropagation();
    });
    dialog.addEventListener('close', () => {
        observer?.disconnect();
        document.body.style.overflow = previousOverflow;
        opener?.focus({ preventScroll: true });
    });
});
