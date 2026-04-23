document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const revealElements = document.querySelectorAll('[data-reveal]');

    // 1. Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(0, 46, 43, 0.95)';
        navLinks.style.padding = '2rem';
        navLinks.style.textAlign = 'center';
        navLinks.style.backdropFilter = 'blur(10px)';
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
                    navLinks.style.display = 'none';
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
            link.href = `https://wa.me/5511962139011?text=${message}`;
        });
    });

    // 7. Catalog Search Logic
    const searchInput = document.getElementById('catalog-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterActiveCarousel(query);
        });
    }
});

function filterActiveCarousel(query) {
    const activeCarousel = document.querySelector('.carousel-wrapper.active');
    if (!activeCarousel) return;

    const cards = activeCarousel.querySelectorAll('.product-card-v5');
    cards.forEach(card => {
        const title = card.querySelector('.card-title').innerText.toLowerCase();
        const tagline = card.querySelector('.card-tagline').innerText.toLowerCase();
        const specs = card.querySelector('.card-specs').innerText.toLowerCase();
        
        if (title.includes(query) || tagline.includes(query) || specs.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
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
        if (tab.innerText.toLowerCase().includes(brand.toLowerCase())) {
            tab.classList.add('active');
        }
    });

    // Re-apply search filter if query exists
    const searchInput = document.getElementById('catalog-search');
    if (searchInput) {
        filterActiveCarousel(searchInput.value.toLowerCase());
    }
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
