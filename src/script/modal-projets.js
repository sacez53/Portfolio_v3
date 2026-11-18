/**
 * ══════════════════════════════════════════════════════════════
 * COMPOSANT MODALE DE NAVIGATION RAPIDE ENTRE PROJETS
 * Portfolio éditorial — Sacha GUITTER
 * 
 * Accessible (WCAG 2.2 / RGAA), Responsive (Desktop & Mobile),
 * Filtrage par catégorie, mise en valeur du projet actif.
 * ══════════════════════════════════════════════════════════════
 */

(function () {
    let modalElement = null;
    let backdropElement = null;
    let closeBtn = null;
    let listContainer = null;
    let filterButtons = [];
    let triggerButtons = [];
    let lastFocusedElement = null;
    let allProjectsData = [];
    let activeSlug = '';

    /**
     * Initialise la modale avec la liste des projets et le slug actif.
     * @param {Array} projects - Liste complète des projets chargés.
     * @param {string} currentSlug - Slug du projet actuellement affiché.
     */
    function initProjectNavigationModal(projects, currentSlug) {
        if (!Array.isArray(projects) || projects.length === 0) return;

        allProjectsData = projects;
        activeSlug = currentSlug || '';

        modalElement = document.getElementById('project-nav-modal');
        if (!modalElement) return;

        backdropElement = document.getElementById('project-modal-backdrop');
        closeBtn = document.getElementById('project-modal-close');
        listContainer = document.getElementById('project-modal-list');
        filterButtons = Array.from(modalElement.querySelectorAll('.modal-filter-chip'));
        triggerButtons = Array.from(document.querySelectorAll('.project-nav-burger-btn, .project-nav-burger-trigger, #project-nav-burger-btn, #top-nav-projects-btn'));

        // 1. Remplir les compteurs de catégories
        const countAll = projects.length;
        const countEtudiant = projects.filter(p => p.categorie === 'etudiant').length;
        const countPerso = projects.filter(p => p.categorie === 'perso').length;

        const countAllEl = document.getElementById('modal-count-all');
        const countEtudiantEl = document.getElementById('modal-count-etudiant');
        const countPersoEl = document.getElementById('modal-count-perso');

        if (countAllEl) countAllEl.textContent = `(${countAll})`;
        if (countEtudiantEl) countEtudiantEl.textContent = `(${countEtudiant})`;
        if (countPersoEl) countPersoEl.textContent = `(${countPerso})`;

        // 2. Générer la liste des projets
        renderProjectList('all');

        // 3. Attacher les écouteurs sur les déclencheurs (bouton burger dans la pagination & dans la top-nav)
        triggerButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleModal(btn);
            });
        });

        // 4. Écouteurs de fermeture
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal();
            });
        }

        if (backdropElement) {
            backdropElement.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal();
            });
        }

        // 5. Écouteurs pour les filtres de catégorie
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter') || 'all';
                filterButtons.forEach(b => {
                    const isActive = b === btn;
                    b.classList.toggle('is-active', isActive);
                    b.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });
                renderProjectList(filter);
            });
        });

        // 6. Gestion du clavier : Échap et Piège à focus (WCAG 2.2)
        modalElement.addEventListener('keydown', handleModalKeydown);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isModalOpen()) {
                e.preventDefault();
                closeModal();
            }
        });
    }

    /**
     * Rendu HTML de la liste des cartes de projets selon la catégorie choisie.
     * @param {string} filter - 'all', 'etudiant' ou 'perso'
     */
    function renderProjectList(filter) {
        if (!listContainer) return;

        const filtered = allProjectsData.filter(p => {
            if (filter === 'all') return true;
            return p.categorie === filter;
        });

        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div class="modal-empty-state">
                    <p>Aucun projet trouvé dans cette catégorie.</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = filtered.map((project) => {
            const globalIndex = allProjectsData.findIndex(p => p.slug === project.slug);
            const figNum = String((globalIndex !== -1 ? globalIndex : 0) + 1).padStart(2, '0');
            const isCurrent = project.slug === activeSlug;
            
            // Image représentative (première image ou placeholder)
            const rawImg = (project.images && project.images.length > 0) ? project.images[0] : '';
            const imgSrc = rawImg.startsWith('../') ? rawImg : `../${rawImg}`;
            
            // Catégorie lisible
            const isEtudiant = project.categorie === 'etudiant';
            const catBadge = isEtudiant ? 'BUT MMI' : 'Photo & Série';
            
            // Tags (2 max pour conserver une vue aérée)
            const tagsHTML = (project.tags && project.tags.length > 0)
                ? project.tags.slice(0, 2).map(tag => `<span class="modal-project-tag">#${tag}</span>`).join('')
                : '';

            // Courte description condensée
            const shortDesc = project.description ? escapeHtml(project.description) : '';

            return `
                <a href="projet.html?slug=${project.slug}" 
                   class="modal-project-card ${isCurrent ? 'is-current' : ''}" 
                   ${isCurrent ? 'aria-current="page"' : ''}
                   data-slug="${project.slug}"
                   role="listitem"
                   aria-label="Planche ${figNum} : ${escapeHtml(project.titre)}${isCurrent ? ' (Planche actuelle)' : ''}">
                    
                    <div class="modal-project-thumb-frame">
                        <img src="${imgSrc}" alt="" loading="lazy" class="modal-project-thumb-img" width="120" height="90">
                        <span class="modal-project-thumb-fig">FIG. ${figNum}</span>
                    </div>

                    <div class="modal-project-info">
                        <div class="modal-project-meta-row">
                            <span class="modal-project-cat-badge ${isEtudiant ? 'is-etudiant' : 'is-perso'}">${catBadge}</span>
                            ${isCurrent ? '<span class="modal-project-current-badge"><span class="current-dot" aria-hidden="true"></span>Planche actuelle</span>' : ''}
                        </div>

                        <h3 class="modal-project-title">${escapeHtml(project.titre)}</h3>
                        
                        ${shortDesc ? `<p class="modal-project-desc">${shortDesc}</p>` : ''}

                        ${tagsHTML ? `<div class="modal-project-tags">${tagsHTML}</div>` : ''}
                    </div>

                    <div class="modal-project-arrow-wrap" aria-hidden="true">
                        <svg class="modal-project-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </div>
                </a>
            `;
        }).join('');

        // Attacher l'événement sur chaque carte
        const cards = listContainer.querySelectorAll('.modal-project-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                const cardSlug = card.getAttribute('data-slug');
                // Si on clique sur le projet déjà ouvert, on referme simplement la modale
                if (cardSlug === activeSlug) {
                    e.preventDefault();
                    closeModal();
                } else {
                    // Sinon, animation de fermeture puis redirection
                    closeModal();
                }
            });
        });
    }

    /**
     * Vérifie si la modale est actuellement ouverte.
     */
    function isModalOpen() {
        return modalElement && !modalElement.hasAttribute('hidden') && modalElement.classList.contains('is-open');
    }

    /**
     * Alterne l'état d'ouverture de la modale.
     */
    function toggleModal(sourceButton) {
        if (isModalOpen()) {
            closeModal();
        } else {
            openModal(sourceButton);
        }
    }

    /**
     * Ouvre la modale de navigation.
     */
    function openModal(sourceButton) {
        if (!modalElement) return;

        lastFocusedElement = sourceButton || document.activeElement;

        // Mise à jour de l'accessibilité sur les boutons déclencheurs
        triggerButtons.forEach(btn => {
            btn.setAttribute('aria-expanded', 'true');
            btn.classList.add('is-active');
        });

        // Déverrouillage et affichage avec animation
        modalElement.removeAttribute('hidden');
        modalElement.setAttribute('aria-hidden', 'false');
        
        // Bloquer le scroll de la page sous-jacente
        document.body.classList.add('project-modal-opened');

        // Forcer le reflow avant d'ajouter la classe active pour déclencher l'animation CSS
        void modalElement.offsetWidth;
        modalElement.classList.add('is-open');

        // Déplacer le focus de manière accessible
        setTimeout(() => {
            // Tenter de focaliser le bouton fermer ou le premier filtre
            const currentItem = modalElement.querySelector('.modal-project-card.is-current');
            if (currentItem) {
                // Scroll doux vers l'élément courant pour le centrer dans la vue
                currentItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
            if (closeBtn) {
                closeBtn.focus();
            } else {
                modalElement.focus();
            }
        }, 50);
    }

    /**
     * Ferme la modale de navigation.
     */
    function closeModal() {
        if (!modalElement || !isModalOpen()) return;

        modalElement.classList.remove('is-open');
        modalElement.setAttribute('aria-hidden', 'true');

        // Restaurer l'état des déclencheurs
        triggerButtons.forEach(btn => {
            btn.setAttribute('aria-expanded', 'false');
            btn.classList.remove('is-active');
        });

        // Débloquer le scroll
        document.body.classList.remove('project-modal-opened');

        // Attendre la fin de la transition CSS pour cacher complètement avec hidden
        setTimeout(() => {
            if (!isModalOpen()) {
                modalElement.setAttribute('hidden', '');
            }
            // Restaurer le focus sur le bouton déclencheur d'origine
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }, 220);
    }

    /**
     * Piège à focus pour l'accessibilité au clavier (WCAG 2.2 / RGAA).
     */
    function handleModalKeydown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
            return;
        }

        if (e.key === 'Tab') {
            const focusables = modalElement.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusables.length === 0) return;

            const firstElement = focusables[0];
            const lastElement = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Utilitaire d'échappement HTML simple pour la sécurité.
     */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Export global pour être appelé depuis script/projets.js
    window.initProjectNavigationModal = initProjectNavigationModal;
    window.openProjectNavigationModal = openModal;
    window.closeProjectNavigationModal = closeModal;
})();
