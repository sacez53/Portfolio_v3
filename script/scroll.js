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

    // 2. Bouton retour en haut — visibilité + smooth scroll
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

        btn.addEventListener('click', (e) => {
            if (btn.getAttribute('href') === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            }
        });
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
