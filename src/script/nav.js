document.addEventListener("DOMContentLoaded", () => {
    // 1. Gestion du menu mobile (Hamburger & Tiroir Éditorial)
    const burgerBtn = document.getElementById('nav-burger-btn');
    const drawer = document.getElementById('mobile-nav-drawer');
    const closeBtn = document.getElementById('mobile-drawer-close');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    const drawerLinks = document.querySelectorAll('.mobile-drawer-link, .mobile-drawer-cta, .mobile-drawer-brand');

    function openMobileMenu() {
        if (!drawer || !burgerBtn) return;
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        burgerBtn.setAttribute('aria-expanded', 'true');
        burgerBtn.classList.add('is-active');
        document.body.classList.add('mobile-menu-open');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 50);
        }
    }

    function closeMobileMenu() {
        if (!drawer || !burgerBtn) return;
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        burgerBtn.setAttribute('aria-expanded', 'false');
        burgerBtn.classList.remove('is-active');
        document.body.classList.remove('mobile-menu-open');
        burgerBtn.focus();
    }

    if (burgerBtn) {
        burgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = drawer && drawer.classList.contains('is-open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileMenu);
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeMobileMenu);
    }

    // Fermeture automatique au clic sur un lien du tiroir
    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Fermeture avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
            closeMobileMenu();
        }
    });

    // 2. Gestion de la navbar principale (.main-navbar-header) : masquée dans le hero, visible dès qu'on en sort
    const mainNavHeader = document.querySelector('.main-navbar-header');
    const heroWrapper = document.querySelector('.hero-wrapper');
    const mainNavLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const mobileNavLinks = document.querySelectorAll('.mobile-drawer-link[href^="#"]');
    const chapterSections = document.querySelectorAll('section[id^="chapitre-"]');

    if (mainNavHeader) {
        if (!heroWrapper) {
            // S'il n'y a pas de hero sur la page (ex: pages secondaires), la navbar est immédiatement visible
            mainNavHeader.classList.add('is-visible');
            mainNavHeader.removeAttribute('aria-hidden');
        } else {
            // Contrôle précis de la visibilité : masquée dans le hero, affichée dès qu'on en sort
            const updateNavbarVisibility = () => {
                const heroRect = heroWrapper.getBoundingClientRect();
                const navHeight = mainNavHeader.offsetHeight || 64;
                
                // On considère qu'on est sorti du hero quand le bas de la couverture atteint le haut de l'écran
                const isOutOfHero = heroRect.bottom <= navHeight;

                if (isOutOfHero) {
                    mainNavHeader.classList.add('is-visible');
                    mainNavHeader.removeAttribute('aria-hidden');
                } else {
                    mainNavHeader.classList.remove('is-visible');
                    mainNavHeader.setAttribute('aria-hidden', 'true');
                }
            };

            let navTicking = false;
            const onScroll = () => {
                if (!navTicking) {
                    window.requestAnimationFrame(() => {
                        updateNavbarVisibility();
                        navTicking = false;
                    });
                    navTicking = true;
                }
            };

            window.addEventListener('scroll', onScroll, { passive: true });

            // Surveillance par IntersectionObserver pour synchronisation optimale
            if ('IntersectionObserver' in window) {
                const heroObserver = new IntersectionObserver((entries) => {
                    entries.forEach(() => {
                        updateNavbarVisibility();
                    });
                }, {
                    root: null,
                    rootMargin: '-64px 0px 0px 0px',
                    threshold: [0, 0.05, 0.1, 0.2]
                });
                heroObserver.observe(heroWrapper);
            }

            // Exécution immédiate au chargement (prise en compte des ancres #chapitre-X)
            updateNavbarVisibility();
        }
    }

    // Surveillance des chapitres pour surlignage des liens actifs
    if (chapterSections.length > 0 && (mainNavLinks.length > 0 || mobileNavLinks.length > 0)) {
        const chapterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    mainNavLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                    mobileNavLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, {
            root: null,
            rootMargin: '-20% 0px -50% 0px',
            threshold: 0
        });

        chapterSections.forEach(s => chapterObserver.observe(s));
    }

    // 3. Fallback pour les pages secondaires utilisant .top-nav
    const topNav = document.querySelector('.top-nav');
    const hero = document.querySelector('.hero-wrapper');

    if (topNav) {
        if (!hero) {
            topNav.style.opacity = '1';
            topNav.style.pointerEvents = 'auto';
            topNav.style.transform = 'translateX(-50%) translateY(0)';
        } else {
            const updateNav = () => {
                if (window.scrollY > 120) {
                    topNav.style.opacity = '1';
                    topNav.style.pointerEvents = 'auto';
                    topNav.style.transform = 'translateX(-50%) translateY(0)';
                } else {
                    topNav.style.opacity = '0';
                    topNav.style.pointerEvents = 'none';
                    topNav.style.transform = 'translateX(-50%) translateY(-12px)';
                }
            };

            window.addEventListener('scroll', updateNav, { passive: true });
            updateNav();
        }

        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.top-nav a[href^="#"]');

        if (sections.length > 0 && navLinks.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        navLinks.forEach(link => {
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('active');
                            } else {
                                link.classList.remove('active');
                            }
                        });
                    }
                });
            }, {
                root: null,
                rootMargin: '-30% 0px -40% 0px',
                threshold: 0
            });

            sections.forEach(s => observer.observe(s));
        }
    }

    // 4. Initialisation & Accordéon du footer (Ouvert & aéré sur ordi, compact sur mobile)
    const footerDropdowns = document.querySelectorAll('.footer-dropdown');
    if (footerDropdowns.length > 0) {
        const isDesktopQuery = window.matchMedia('(min-width: 769px)');

        function syncFooterState(e) {
            const isDesktop = e ? e.matches : isDesktopQuery.matches;
            footerDropdowns.forEach(details => {
                details.open = isDesktop;
            });
        }

        // Exécution immédiate
        syncFooterState();
        if (isDesktopQuery.addEventListener) {
            isDesktopQuery.addEventListener('change', syncFooterState);
        } else {
            window.addEventListener('resize', () => syncFooterState());
        }

        // Fermeture automatique lors d'un clic sur un lien d'ancrage local (sur mobile)
        footerDropdowns.forEach(details => {
            const links = details.querySelectorAll('a[href^="#"]');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    if (!isDesktopQuery.matches) {
                        details.open = false;
                    }
                });
            });
        });
    }
});
