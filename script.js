document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const revealElements = document.querySelectorAll('[data-reveal]');

    // 1. Header Scroll Effect & Active Link Spy
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Destaque do link ativo no menu conforme rola a página
        const scrollPosition = window.scrollY + 140;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPosition >= top && scrollPosition < top + height) {
                navAnchors.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // 2. Mobile Menu Toggle
    const menuIcon = mobileMenuBtn.querySelector('i');

    function closeMobileMenu() {
        navLinks.classList.remove('mobile-open');
        if (menuIcon) {
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        }
    }

    function openMobileMenu() {
        navLinks.classList.add('mobile-open');
        if (menuIcon) {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-times');
        }
    }

    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.contains('mobile-open');
        isOpen ? closeMobileMenu() : openMobileMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // 3. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (window.innerWidth <= 968) {
                    closeMobileMenu();
                }
            }
        });
    });

    // 4. Scroll Reveal Animation
    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight - 100) {
                el.classList.add('revealed');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // 5. Feedback Carousel Logic
    const carouselContainer = document.querySelector('.feedback-container');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (carouselContainer && prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            const card = document.querySelector('.feedback-card');
            const cardWidth = card.offsetWidth + parseInt(getComputedStyle(carouselContainer).gap);
            carouselContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            const card = document.querySelector('.feedback-card');
            const cardWidth = card.offsetWidth + parseInt(getComputedStyle(carouselContainer).gap);
            carouselContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
    }

    // 6. WhatsApp Link Logic (Updated for Individual Cards)
    const whatsappLinks = document.querySelectorAll('a[href^="https://wa.me/"]');
    whatsappLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card-v5');
            const productName = productCard?.querySelector('.card-title')?.innerText || 'um produto do catálogo';
            const message = encodeURIComponent(`Olá Total Celulares! Gostaria de consultar o valor do ${productName} que vi no site.`);
            link.href = `https://wa.me/5511945401687?text=${message}`;
        });
    });

    // 7. Catalog Search Logic
    const searchInput = document.getElementById('catalog-search');
    const searchClearBtn = document.getElementById('search-clear-btn');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (searchClearBtn) {
                searchClearBtn.style.display = query ? 'block' : 'none';
            }
            filterActiveCarousel(query);
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            resetCatalogSearch();
        });
    }

    // 8. Keyboard Accessibility for role="button" elements (Color Dots, Carousel Arrows)
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('role') === 'button') {
            e.preventDefault();
            e.target.click();
        }
        if (e.key === 'Escape') {
            closeLegalModal();
        }
    });
});

function resetCatalogSearch() {
    const searchInput = document.getElementById('catalog-search');
    const searchClearBtn = document.getElementById('search-clear-btn');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    if (searchClearBtn) {
        searchClearBtn.style.display = 'none';
    }
    filterActiveCarousel('');
}

function filterActiveCarousel(query) {
    const activeCarousel = document.querySelector('.carousel-wrapper.active');
    if (!activeCarousel) return;

    const cards = activeCarousel.querySelectorAll('.product-card-v5');
    let visibleCount = 0;

    cards.forEach(card => {
        const title = card.querySelector('.card-title')?.innerText.toLowerCase() || '';
        const tagline = card.querySelector('.card-tagline')?.innerText.toLowerCase() || '';
        const specs = card.querySelector('.card-specs')?.innerText.toLowerCase() || '';
        
        if (!query || title.includes(query) || tagline.includes(query) || specs.includes(query)) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    const emptyState = document.getElementById('catalog-no-results');
    const emptyQuerySpan = document.getElementById('empty-search-query');
    if (emptyState) {
        if (visibleCount === 0 && query) {
            emptyState.style.display = 'block';
            if (emptyQuerySpan) emptyQuerySpan.innerText = query;
            activeCarousel.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            activeCarousel.style.display = 'block';
        }
    }
}

// Catalog Navigation Logic
function scrollCarousel(carouselId, distance) {
    const container = document.querySelector(`#${carouselId} .carousel-container`);
    if (container) {
        container.scrollBy({
            left: distance,
            behavior: 'smooth'
        });
    }
}

// Catalog Brand Switch Logic
function switchCarousel(brand) {
    const wrappers = document.querySelectorAll('.carousel-wrapper');
    const tabs = document.querySelectorAll('.catalog-tab');
    
    // Reset all
    wrappers.forEach(w => w.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));
    
    // Set active
    const target = document.getElementById(`carousel-${brand}`);
    if (target) {
        target.classList.add('active');
    }
    
    // Find correctly clicked tab
    tabs.forEach(tab => {
        const tabText = tab.innerText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cleanBrand = brand.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (tabText.includes(cleanBrand)) {
            tab.classList.add('active');
        }
    });

    // Reset search field when switching tabs
    const searchInput = document.getElementById('catalog-search');
    if (searchInput && searchInput.value) {
        searchInput.value = '';
    }

    // Re-apply search filter (now cleared, so all cards show)
    filterActiveCarousel('');
}

/**
 * Dynamic Color Switching Logic
 * Changes image, background spotlight, and specs label
 */
function changeProductColor(el, imgSrc, bgClass, colorName) {
    const card = el.closest('.product-card-v5');
    if (!card) return;

    // 1. Update Image with a subtle fade effect
    const img = card.querySelector('.card-image-wrap img');
    if (img) {
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = imgSrc;
            img.style.opacity = '1';
        }, 150);
    }

    // 2. Update Background Wrap class
    const bgWrap = card.querySelector('.card-image-wrap');
    if (bgWrap) {
        // We keep 'card-image-wrap' and the dynamic color variant
        bgWrap.className = `card-image-wrap ${bgClass}`;
    }

    // 3. Update Specs text (the color part)
    const specs = card.querySelector('.card-specs');
    if (specs) {
        const text = specs.innerText;
        const parts = text.split('|');
        if (parts.length > 0) {
            // Replace the last part (the color)
            parts[parts.length - 1] = ' ' + colorName;
            specs.innerText = parts.join('|');
        }
    }
}

/**
 * Legal Modal Controllers
 */
const legalContents = {
    privacy: {
        title: "Política de Privacidade",
        body: `
            <h4>1. Coleta de Informações</h4>
            <p>A Total Celulares preza pela total privacidade dos seus dados. As informações compartilhadas conosco no atendimento via WhatsApp ou canais diretos são utilizadas exclusivamente para esclarecimento de dúvidas, cotações e finalização de compras com procedência e segurança.</p>
            <h4>2. Proteção de Dados</h4>
            <p>Não vendemos, alugamos ou repassamos quaisquer dados de clientes a terceiros. Todo contato é mantido em ambiente seguro com respeito à LGPD (Lei Geral de Proteção de Dados).</p>
            <h4>3. Atendimento Direto</h4>
            <p>Para dúvidas sobre seus dados ou exclusão de histórico de atendimento, fale conosco através do WhatsApp oficial (11) 94540-1687.</p>
        `
    },
    terms: {
        title: "Termos de Uso e Garantia",
        body: `
            <h4>1. Procedência e Garantia</h4>
            <p>Todos os aparelhos novos e seminovos comercializados pela Total Celulares passam por rigorosa inspeção técnica e possuem garantia assegurada contra defeitos de fabricação.</p>
            <h4>2. Troca Inteligente</h4>
            <p>A avaliação do seu usado na Troca Inteligente está sujeita à verificação presencial do estado físico, funcionamento dos componentes originais (tela, bateria, Face ID, etc.) e ausência de bloqueios de conta iCloud.</p>
            <h4>3. Disponibilidade de Estoque</h4>
            <p>Os modelos, cores e capacidades exibidos no catálogo online representam as linhas trabalhadas e estão sujeitos à disponibilidade diária em loja física.</p>
        `
    },
    faq: {
        title: "Perguntas Frequentes (FAQ)",
        body: `
            <h4>Os aparelhos seminovos têm garantia?</h4>
            <p>Sim! Todos os aparelhos seminovos são testados em dezenas de itens e entregues com garantia total de funcionamento e procedência.</p>
            <h4>Como funciona a Troca Inteligente?</h4>
            <p>Você traz o seu iPhone ou celular atual, realizamos uma avaliação justa na hora e o valor entra como desconto direto na compra do seu novo aparelho.</p>
            <h4>Quais as formas de pagamento?</h4>
            <p>Aceitamos cartão de crédito em até 18x, Pix com condições especiais à vista, ou seu usado como parte do pagamento.</p>
            <h4>Onde fica a loja física?</h4>
            <p>Estamos na Rua Vinte e Cinco de Março, 687 - Box 16 (Loja San Nicolas), Centro Histórico de São Paulo - SP.</p>
        `
    }
};

function openLegalModal(type) {
    const data = legalContents[type];
    if (!data) return;

    const modal = document.getElementById('legal-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (modal && titleEl && bodyEl) {
        titleEl.innerText = data.title;
        bodyEl.innerHTML = data.body;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLegalModal() {
    const modal = document.getElementById('legal-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}


// Trade-in form: native GET submission encodes the full assessment for WhatsApp.
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('trade-form');
    if (!form) return;
    const fields = form.querySelectorAll('[data-trade-label]');
    const message = document.getElementById('trade-message');
    const updateMessage = () => {
        const answers = Array.from(fields, field => {
            let answer = field.value.trim() || 'Não informado';
            if (field.id === 'trade-battery' && field.value) answer += '%';
            return field.dataset.tradeLabel + ': ' + answer;
        });
        message.value = [
            'Olá Total Celulares! Gostaria de avaliar meu iPhone para uma Troca Inteligente.',
            '',
            ...answers,
            '',
            'Vou enviar fotos e vídeos do aparelho na conversa, se possível, para ajudar na avaliação.'
        ].join('\n');
    };
    form.addEventListener('input', updateMessage);
    form.addEventListener('change', updateMessage);
    form.addEventListener('submit', event => {
        if (!form.reportValidity()) {
            event.preventDefault();
            return;
        }
        updateMessage();
    });
});
