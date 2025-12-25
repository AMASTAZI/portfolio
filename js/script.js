// Carousel functionality (only if carousel exists)
if (document.querySelector('.carousel-slide')) {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const totalSlides = slides.length;

    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));

        currentSlide = (n + totalSlides) % totalSlides;

        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');

        const slide = slides[currentSlide];
        const title = slide.dataset.title || 'Projet';
        const date = slide.dataset.date || '';
        const desc = slide.dataset.desc || '';
        const link = slide.dataset.link || '#';

        const info = document.querySelector('.project-info');
        if (info) {
            const h = info.querySelector('h3');
            const ps = info.querySelectorAll('p');
            if (h) h.textContent = title;
            if (ps[0]) ps[0].innerHTML = `<i class="fas fa-calendar"></i> Date: ${date}`;
            if (ps[1]) ps[1].innerHTML = `<strong>Description:</strong> ${desc}`;
            const actionBtn = info.querySelector('button.carousel-btn');
            if (actionBtn) {
                if (link && link !== '#') {
                    actionBtn.onclick = () => window.open(link, '_blank');
                } else {
                    actionBtn.onclick = null;
                }
            }
        }

        const caption = slide.querySelector('.slide-caption');
        if (caption) caption.textContent = title;
    }

    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    if (nextBtn) nextBtn.addEventListener('click', () => { showSlide(currentSlide + 1); });
    if (prevBtn) prevBtn.addEventListener('click', () => { showSlide(currentSlide - 1); });

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => { showSlide(index); });
    });

    showSlide(currentSlide);
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            document.querySelectorAll('.nav-link').forEach(l => {
                l.classList.remove('active');
                l.removeAttribute('aria-current');
            });
            this.classList.add('active');
            this.setAttribute('aria-current', 'page');

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {toggle: false});
                bsCollapse.hide();
            }
        }
    });
});

// Active navigation link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
});

// Project gallery modal
(function initProjectGallery() {
    const modalEl = document.getElementById('projectModal');
    if (!modalEl) return;
    
    const bsModal = new bootstrap.Modal(modalEl, {keyboard: false});
    const galleryImg = modalEl.querySelector('.gallery-img');
    const galleryCaption = modalEl.querySelector('.gallery-caption');
    const prevBtn = modalEl.querySelector('.gallery-prev');
    const nextBtn = modalEl.querySelector('.gallery-next');

    let images = [];
    let captions = [];
    let current = 0;

    function showIndex(i) {
        if (!images.length) return;
        current = (i + images.length) % images.length;
        const src = images[current];
        galleryImg.src = '';
        galleryImg.alt = `Image ${current + 1} / ${images.length}`;
        
        const imageCaption = captions[current] || '';
        if (imageCaption) {
            galleryCaption.textContent = imageCaption;
        } else {
            galleryCaption.textContent = `${current + 1} / ${images.length}`;
        }
        
        const img = new Image();
        img.onload = () => { galleryImg.src = src; };
        img.onerror = () => { galleryImg.src = 'images/index.jpeg'; };
        img.src = src;

        prevBtn.disabled = images.length <= 1;
        nextBtn.disabled = images.length <= 1;
    }

    prevBtn.addEventListener('click', () => showIndex(current - 1));
    nextBtn.addEventListener('click', () => showIndex(current + 1));

    function onKey(e) {
        if (e.key === 'ArrowLeft') showIndex(current - 1);
        else if (e.key === 'ArrowRight') showIndex(current + 1);
        else if (e.key === 'Escape') bsModal.hide();
    }

    modalEl.addEventListener('shown.bs.modal', () => { 
        document.addEventListener('keydown', onKey); 
    });
    
    modalEl.addEventListener('hidden.bs.modal', () => { 
        document.removeEventListener('keydown', onKey); 
    });

    function openForCard(card) {
        const raw = card.dataset.images || '';
        images = raw.split(',').map(s => s.trim()).filter(Boolean);
        const rawCapt = card.dataset.captions || '';
        captions = rawCapt.split(',').map(s => s.trim()).filter(Boolean);
        
        if (!images.length) {
            const thumb = card.querySelector('.project-thumb img');
            if (thumb && thumb.src) images = [thumb.src];
        }
        
        const title = card.dataset.title || card.querySelector('.project-title')?.textContent || '';
        const desc = card.dataset.desc || card.querySelector('.project-short')?.textContent || '';
        
        if (!captions.length) {
            galleryCaption.textContent = title + (desc ? (' – ' + desc) : '');
        }
        
        showIndex(0);
        bsModal.show();
    }

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => openForCard(card));
        card.addEventListener('keydown', (e) => { 
            if (e.key === 'Enter' || e.key === ' ') { 
                e.preventDefault(); 
                openForCard(card); 
            } 
        });

        try {
            const raw = card.dataset.images || '';
            const imgs = raw.split(',').map(s => s.trim()).filter(Boolean);
            const thumb = card.querySelector('.project-thumb img');
            if (imgs.length && thumb) {
                const src = thumb.getAttribute('src') || '';
                if (!src || src.includes('kevin.jpg') || src.includes('placeholder')) {
                    thumb.src = imgs[0];
                }
            }
        } catch (e) {
            console.error('Error loading project thumbnail:', e);
        }
    });
})();

// Offline skeleton handling
function initOfflineSkeleton() {
    const skeleton = document.getElementById('skeleton');
    const retryBtn = document.getElementById('skeleton-retry');
    if (!skeleton) return;

    function update() {
        if (navigator.onLine) {
            skeleton.setAttribute('aria-hidden', 'true');
            skeleton.style.display = 'none';
            document.body.classList.remove('is-offline');
        } else {
            skeleton.setAttribute('aria-hidden', 'false');
            skeleton.style.display = 'flex';
            document.body.classList.add('is-offline');
        }
    }

    update();

    window.addEventListener('online', () => {
        update();
    });
    
    window.addEventListener('offline', update);

    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            const statusEl = skeleton.querySelector('.skeleton-status');
            if (navigator.onLine) {
                if (statusEl) statusEl.textContent = 'Reconnecté – actualisation...';
                setTimeout(() => location.reload(), 600);
            } else {
                if (statusEl) statusEl.textContent = 'Toujours hors-ligne. Vérifie ta connexion.';
                setTimeout(() => {
                    if (statusEl) statusEl.textContent = 'Pas de connexion – affichage en mode dégradé';
                }, 2000);
            }
        });
    }
}

// Initialize offline skeleton
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOfflineSkeleton);
} else {
    initOfflineSkeleton();
}

// Theme toggle: dark / light
function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (!btn || !icon) return;

    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
            document.body.classList.add('light-theme');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            btn.setAttribute('aria-pressed', 'true');
            if (text) text.textContent = 'Clair';
            btn.setAttribute('title', 'Passer en mode sombre');
            btn.setAttribute('aria-label', 'Passer en mode sombre');
        } else {
            document.documentElement.classList.remove('light-theme');
            document.body.classList.remove('light-theme');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            btn.setAttribute('aria-pressed', 'false');
            if (text) text.textContent = 'Sombre';
            btn.setAttribute('title', 'Passer en mode clair');
            btn.setAttribute('aria-label', 'Passer en mode clair');
        }
        
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }
    }

    // Initialize from storage or system preference
    let initialTheme = 'dark';
    try {
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') {
            initialTheme = stored;
        } else {
            const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
            initialTheme = prefersLight ? 'light' : 'dark';
        }
    } catch (e) {
        console.warn('Could not read theme preference:', e);
    }
    
    applyTheme(initialTheme);

    btn.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-theme');
        applyTheme(isLight ? 'dark' : 'light');
    });
}

// Initialize theme toggle
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    initThemeToggle();
}

// Typing animation for profile title
const phrases = [
    "Je suis développeur fullstack django",
    "I am a fullstack developer django"
];

let phraseIndex = 0;
let charIndex = 0;
let typing = true;
let typingTimeout;

const el = document.getElementById("profile-title");

function typeWriter() {
    if (!el) return;
    
    if (typing) {
        if (charIndex < phrases[phraseIndex].length) {
            el.textContent += phrases[phraseIndex].charAt(charIndex);
            charIndex++;
            typingTimeout = setTimeout(typeWriter, 100);
        } else {
            typing = false;
            typingTimeout = setTimeout(typeWriter, 2000);
        }
    } else {
        if (charIndex > 0) {
            el.textContent = phrases[phraseIndex].substring(0, charIndex - 1);
            charIndex--;
            typingTimeout = setTimeout(typeWriter, 50);
        } else {
            typing = true;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingTimeout = setTimeout(typeWriter, 500);
        }
    }
}

// Start typing animation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById("profile-title")) {
            typeWriter();
        }
    });
} else {
    if (document.getElementById("profile-title")) {
        typeWriter();
    }
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
});