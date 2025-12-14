 // Carousel functionality
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

        document.getElementById('nextBtn').addEventListener('click', () => {
            showSlide(currentSlide + 1);
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            showSlide(currentSlide - 1);
        });

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
            });
        });

        // Initialize project info to match the starting slide
        showSlide(currentSlide);

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