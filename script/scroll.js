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

    // 2. Boutons retour en haut & nom (SACHA GUITTER) — visibilité + défilement fluide
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

    // Fonction universelle pour remonter en haut de page
    function scrollToTop(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });

        if (window.history && window.history.pushState) {
            window.history.pushState(null, '', '#top');
        }
    }

    // Gestion du clic pour remonter en haut :
    // - Clic sur le logo / nom ("SACHA GUITTER") dans la navbar fixe (.nav-brand)
    // - Clic sur le nom dans le menu mobile (.mobile-drawer-brand)
    // - Clic sur "RETOUR AU DÉBUT" dans le footer (.footer-back-top)
    // - Clic sur le bouton flottant de retour en haut (.btn-retour-haut)
    // - Tout lien ciblant #top ou #
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href="#top"], a[href="#"], .btn-retour-haut, .footer-back-top, .nav-brand, .mobile-drawer-brand');
        if (!link) return;

        const href = link.getAttribute('href');
        // Ne pas intercepter les liens menant vers une autre page (ex: ../index.html)
        if (href && !href.startsWith('#') && href !== '') {
            return;
        }

        scrollToTop(e);
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
