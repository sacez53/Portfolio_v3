document.addEventListener("DOMContentLoaded", () => {
    // 1. Scroll animations (Intersection Observer)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    } else {
        const observerOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 0.08
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // 2. Moteur de défilement fluide et maîtrisé (Smooth Scroll sur mesure)
    let activeScrollAnimation = null;

    // Easing cubique (démarrage progressif, vitesse fluide, décélération soyeuse)
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function cancelCurrentScroll() {
        if (activeScrollAnimation) {
            cancelAnimationFrame(activeScrollAnimation);
            activeScrollAnimation = null;
        }
    }

    // Interruption propre si l'utilisateur interagit pendant l'animation
    ['wheel', 'touchstart', 'touchmove', 'keydown'].forEach(evt => {
        window.addEventListener(evt, () => cancelCurrentScroll(), { passive: true });
    });

    function smoothScrollTo(targetY, duration, callback) {
        if (prefersReducedMotion) {
            window.scrollTo(0, targetY);
            if (callback) callback();
            return;
        }

        cancelCurrentScroll();

        const startY = window.pageYOffset || document.documentElement.scrollTop;
        const distance = targetY - startY;

        if (Math.abs(distance) < 2) {
            window.scrollTo(0, targetY);
            if (callback) callback();
            return;
        }

        // Vitesse calibrée pour un défilement noble et majestueux ("smooth") :
        // Ni trop rapide (au minimum ~800ms) ni trop long (au maximum ~1400ms)
        const scrollDuration = typeof duration === 'number'
            ? duration
            : Math.min(1400, Math.max(800, 560 + Math.sqrt(Math.abs(distance)) * 12));

        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / scrollDuration, 1);
            const eased = easeInOutCubic(progress);

            window.scrollTo(0, startY + (distance * eased));

            if (progress < 1) {
                activeScrollAnimation = requestAnimationFrame(step);
            } else {
                activeScrollAnimation = null;
                window.scrollTo(0, targetY);
                if (callback) callback();
            }
        }

        activeScrollAnimation = requestAnimationFrame(step);
    }

    function smoothScrollToTarget(targetElement, hash) {
        let targetY = 0;

        if (targetElement && targetElement !== document.body && targetElement.id !== 'top') {
            const rect = targetElement.getBoundingClientRect();
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            // Respecter le scroll-margin-top du gabarit éditorial
            const computedStyle = window.getComputedStyle(targetElement);
            const scrollMarginTop = parseFloat(computedStyle.scrollMarginTop);
            
            const navHeader = document.querySelector('.main-navbar-header');
            const navHeight = navHeader ? navHeader.getBoundingClientRect().height : 60;
            const offset = (!isNaN(scrollMarginTop) && scrollMarginTop > 0)
                ? scrollMarginTop
                : (navHeight + 20);

            targetY = currentScroll + rect.top - offset;
        }

        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        targetY = Math.max(0, Math.min(targetY, maxScroll));

        smoothScrollTo(targetY, null, () => {
            if (hash && window.history && window.history.pushState) {
                window.history.pushState(null, '', hash);
            }
            if (targetElement && targetElement.id && targetElement.id !== 'top') {
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus({ preventScroll: true });
            }
        });
    }

    // Boutons retour en haut & nom (SACHA GUITTER) — visibilité
    const backToTopBtns = document.querySelectorAll('.btn-retour-haut');
    backToTopBtns.forEach(btn => {
        const toggleVisibility = () => {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        };
        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();
    });

    // Gestion universelle des clics sur les liens d'ancrage internes
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"], .btn-retour-haut, .footer-back-top, .nav-brand, .mobile-drawer-brand');
        if (!link) return;

        if (link.hasAttribute('download') || link.getAttribute('target') === '_blank') return;

        const href = link.getAttribute('href');

        // Cas 1 : Retour en haut de page
        if (
            href === '#top' ||
            href === '#' ||
            link.classList.contains('btn-retour-haut') ||
            link.classList.contains('footer-back-top') ||
            link.classList.contains('nav-brand') ||
            link.classList.contains('mobile-drawer-brand')
        ) {
            e.preventDefault();
            smoothScrollTo(0, null, () => {
                if (window.history && window.history.pushState) {
                    window.history.pushState(null, '', '#top');
                }
            });
            return;
        }

        // Cas 2 : Liens menant vers un chapitre ou une section (#chapitre-1, #contact, etc.)
        if (href && href.startsWith('#') && href.length > 1) {
            const targetId = href.substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                smoothScrollToTarget(targetEl, href);
            }
        }
    });

    // 3. Live Clock dans la meta bar
    (function () {
        const clock = document.getElementById('hero-live-clock');
        if (!clock) return;

        function update() {
            const now = new Date();
            const date = now.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day:     '2-digit',
                month:   'short',
                year:    'numeric'
            });

            const time = now.toLocaleTimeString('fr-FR', {
                hour:   '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            clock.textContent = `${date.toUpperCase()} · ${time}`;
        }

        update();
        setInterval(update, 1000);
    })();
});
