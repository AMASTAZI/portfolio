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

        // Update project info panel from data attributes of the current slide
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
                // if link is '#', leave button unlinked; otherwise set onclick to open link
                if (link && link !== '#') {
                    actionBtn.onclick = () => window.open(link, '_blank');
                } else {
                    actionBtn.onclick = null;
                }
            }
        }

        // Update slide caption (if present)
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

    // Initialize project info to match the starting slide
    showSlide(currentSlide);
}

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    // set clicked nav link as active immediately (adds border) and set aria-current
                    document.querySelectorAll('.nav-link').forEach(l => {
                        l.classList.remove('active');
                        l.removeAttribute('aria-current');
                    });
                    this.classList.add('active');
                    this.setAttribute('aria-current', 'page');

                    // smooth scroll to target
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // if the navbar collapse is open (mobile), close it after click
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        // use Bootstrap Collapse to hide
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {toggle:false});
                        bsCollapse.hide();
                    }
                }
            });
        });

        // Active navigation link
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

        /* Project gallery modal initialization */
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
                // show per-image caption (if provided) or fallback to title/desc or index
                const imageCaption = captions[current] || '';
                if (imageCaption) {
                    // show only the image caption
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

            modalEl.addEventListener('shown.bs.modal', () => { document.addEventListener('keydown', onKey); });
            modalEl.addEventListener('hidden.bs.modal', () => { document.removeEventListener('keydown', onKey); });

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
                // if captions are present we will show per-image captions; otherwise show title + desc
                if (!captions.length) galleryCaption.textContent = title + (desc ? (' — ' + desc) : '');
                showIndex(0);
                bsModal.show();
            }

            document.querySelectorAll('.project-card').forEach(card => {
                card.addEventListener('click', () => openForCard(card));
                card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openForCard(card); } });

                // Helper: if the card has data-images, and its thumbnail is a placeholder,
                // set the thumbnail to the first image in data-images so preview matches gallery
                try {
                    const raw = card.dataset.images || '';
                    const imgs = raw.split(',').map(s => s.trim()).filter(Boolean);
                    const thumb = card.querySelector('.project-thumb img');
                    if (imgs.length && thumb) {
                        // only replace if thumbnail is still the placeholder (kevin.jpg) or empty
                        const src = thumb.getAttribute('src') || '';
                        if (!src || src.includes('kevin.jpg') || src.includes('placeholder')) {
                            thumb.src = imgs[0];
                        }
                    }
                } catch (e) { /* ignore any issues reading dataset */ }
            });
        })();