document.addEventListener("DOMContentLoaded", () => {
    const isHomePage = !!document.querySelector('#grid-etudiant, #grid-perso, .galerie-grid');

    // Déterminer le préfixe du chemin selon qu'on soit à la racine ou dans html/
    const isRoot = !!document.querySelector('#grid-etudiant') || !!document.querySelector('.hero-wrapper');
    const jsonPath = isRoot ? 'json/' : '../json/';
    const basePath = isRoot ? '' : '../';
    const listPath = jsonPath + 'liste_projets.json';

    fetch(listPath)
        .then(response => response.json())
        .then(projectPaths => {
            const promises = projectPaths.map(path => {
                const cleanPath = path.startsWith('../') ? path.substring(3) : path;
                return fetch(basePath + cleanPath)
                    .then(res => res.ok ? res.json() : null)
                    .catch(() => null);
            });
            
            return Promise.all(promises).then(results => results.filter(p => p !== null));
        })
        .then(projects => {
            if (document.querySelector('#grid-etudiant')) {
                renderGalleryWithCategories(projects);
            } else if (document.getElementById('project-title')) {
                setupSingleProjectPage(projects);
            }
        })
        .catch(error => console.error("Erreur lors du chargement des projets:", error));

    /* ─────────────────────────────────────────────
       Galerie avec onglets & catégories
    ───────────────────────────────────────────── */
    function renderGalleryWithCategories(projects) {
        const gridEtudiant = document.getElementById('grid-etudiant');
        const gridPerso    = document.getElementById('grid-perso');
        const countEtudiant = document.getElementById('count-etudiant');
        const countPerso    = document.getElementById('count-perso');

        if (!gridEtudiant || !gridPerso) return;

        const etudiantProjects = projects.filter(p => p.categorie === 'etudiant');
        const persoProjects    = projects.filter(p => p.categorie === 'perso');

        if (countEtudiant) countEtudiant.textContent = `[ ${etudiantProjects.length} PROJET${etudiantProjects.length > 1 ? 'S' : ''} ]`;
        if (countPerso)    countPerso.textContent    = `[ ${persoProjects.length} PROJET${persoProjects.length > 1 ? 'S' : ''} ]`;

        renderCards(etudiantProjects, gridEtudiant, projects);
        renderCards(persoProjects,    gridPerso, projects);
    }

    /* ─────────────────────────────────────────────
       Génération des cartes de tirages photo :
       Uniquement l'image avec texte superposé en bas
    ───────────────────────────────────────────── */
    function renderCards(projectList, gridEl, allProjects) {
        gridEl.innerHTML = '';

        if (projectList.length === 0) {
            gridEl.innerHTML = '<p style="padding: 2rem; color: #777;">Aucun projet dans cette catégorie pour l\'instant.</p>';
            return;
        }

        projectList.forEach((project, idx) => {
            const globalIndex = allProjects ? allProjects.findIndex(p => p.slug === project.slug) : idx;
            const figNumber = String((globalIndex !== -1 ? globalIndex : idx) + 1).padStart(2, '0');
            const previewImage = (project.images && project.images.length > 0) ? project.images[0] : '';

            const card = document.createElement('a');
            card.href = `html/projet.html?slug=${project.slug}`;
            card.className = 'project-card-visual';
            card.setAttribute('aria-label', `Explorer le projet ${project.titre}`);

            card.innerHTML = `
                <div class="project-visual-media">
                    <img src="${previewImage}" alt="${project.titre}" loading="lazy" class="project-visual-img">
                </div>
                <div class="project-visual-overlay">
                    <div class="project-visual-meta">
                        <span class="project-visual-fig">FIG. ${figNumber}</span>
                        <span class="project-visual-separator">—</span>
                        <span class="project-visual-title">${project.titre}</span>
                    </div>
                    <div class="project-visual-arrow" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </div>
            `;
            gridEl.appendChild(card);
        });
    }

    /* ─────────────────────────────────────────────
       Page individuelle de projet (projet.html)
       Mise en page éditoriale fidèle aux chapitres du PDF
    ───────────────────────────────────────────── */
    function setupSingleProjectPage(projects) {
        const urlParams = new URLSearchParams(window.location.search);
        let slug = urlParams.get('slug');

        if (!slug && projects.length > 0) {
            slug = projects[0].slug;
        }

        const currentIndex = projects.findIndex(p => p.slug === slug);
        if (currentIndex === -1) {
            console.error("Projet non trouvé :", slug);
            const mainEl = document.querySelector('main') || document.body;
            mainEl.innerHTML = `
                <div class="container" style="padding: 6rem 1.5rem; text-align: center;">
                    <span style="font-family: var(--font-title); font-size: 1.75rem; font-weight: 700; display: block; margin-bottom: 1rem;">PLANCHE NON TROUVÉE</span>
                    <p style="color: var(--text-muted); margin-bottom: 2rem;">Le projet demandé "${slug || ''}" n'existe pas ou a été déplacé.</p>
                    <a href="../index.html" class="tag" style="background:#000000; color:#FFFFFF; text-decoration:none; padding: 0.75rem 1.5rem; display:inline-block; font-weight:700;">← Retour à l'accueil du portfolio</a>
                </div>
            `;
            return;
        }

        const project = projects[currentIndex];

        // Titre de l'onglet et métadonnées éditoriales
        document.title = `${project.titre} — Planche Éditoriale · Sacha GUITTER`;

        // Indicateur de numéro de planche
        const plateNumberEl = document.getElementById('project-plate-number');
        if (plateNumberEl) {
            const formattedCurrent = String(currentIndex + 1).padStart(2, '0');
            const formattedTotal = String(projects.length).padStart(2, '0');
            plateNumberEl.textContent = `PLANCHE ÉDITORIALE N° ${formattedCurrent} / ${formattedTotal}`;
        }

        // Badge de catégorie
        const catBadgeEl = document.getElementById('project-category-badge');
        if (catBadgeEl) {
            if (project.categorie === 'etudiant') {
                catBadgeEl.textContent = 'PROJET UNIVERSITAIRE · BUT MMI LAVAL';
            } else {
                catBadgeEl.textContent = 'SÉRIE PHOTOGRAPHIQUE & REPORTAGE TERRAIN';
            }
        }

        // Titre principal
        const titleEl = document.getElementById('project-title');
        if (titleEl) titleEl.textContent = project.titre;

        // Métadonnées & tags
        const metaEl = document.getElementById('project-meta');
        if (metaEl) {
            let metaHTML = '';
            if (project.images && project.images.length > 0) {
                metaHTML += `<span class="tag" style="background:#000000; color:#FFFFFF; border-color:#000000;">${project.images.length} TIRAGE${project.images.length > 1 ? 'S' : ''} ARCHIVE</span>`;
            }
            if (project.tags && project.tags.length > 0) {
                metaHTML += project.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ');
            }
            if (project.lien) {
                metaHTML += ` <a href="${project.lien}" class="tag" style="background:#000000; color:#FFFFFF; text-decoration:none;" target="_blank" rel="noopener noreferrer">Consulter en ligne ↗</a>`;
            }
            metaEl.innerHTML = metaHTML;
        }

        // Description / Note d'intention
        const descEl = document.getElementById('project-description');
        if (descEl) descEl.textContent = project.description || 'Note d\'intention en cours de rédaction.';

        // Compétences mobilisées
        const skillsEl = document.getElementById('project-skills');
        if (skillsEl && project.competences && project.competences.length > 0) {
            skillsEl.innerHTML = project.competences.map(skill => `
                <span class="tag" style="border-color:#000000; font-weight:700;">${skill}</span>
            `).join(' ');
        } else if (skillsEl) {
            skillsEl.innerHTML = '<span class="tag" style="border-color:#000000; font-weight:700;">Photographie argentique / numérique</span> <span class="tag" style="border-color:#000000; font-weight:700;">Direction artistique</span>';
        }

        // Étapes de conception / workflow
        const etapesContainer = document.getElementById('project-etapes-container');
        const etapesList = document.getElementById('project-etapes');
        if (etapesContainer && etapesList && project.etapes && project.etapes.length > 0) {
            etapesContainer.style.display = 'block';
            etapesList.innerHTML = project.etapes.map((etape, idx) => `
                <div class="etape-item">
                    <h4 class="etape-title">${etape.titre}</h4>
                    <p class="etape-desc">${etape.desc}</p>
                </div>
            `).join('');
        } else if (etapesContainer) {
            etapesContainer.style.display = 'none';
        }

        // Cadre de la planche maîtresse (FIG. 01)
        const masterContainer = document.getElementById('project-master-container');
        if (masterContainer && project.images && project.images.length > 0) {
            const masterSrc = `../${project.images[0]}`;
            masterContainer.innerHTML = `
                <div class="master-img-wrapper" tabindex="0" role="button" aria-label="Agrandir la planche maîtresse : ${project.titre}" data-full-src="${masterSrc}" data-caption="FIG. 01 — PLANCHE MAÎTRESSE : ${project.titre}">
                    <img src="${masterSrc}" alt="${project.titre} — Planche maîtresse" class="master-img">
                </div>
                <div class="master-caption">
                    <span>FIG. 01 — PLANCHE MAÎTRESSE</span>
                    <span class="zoom-hint">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        AGRANDIR
                    </span>
                </div>
            `;
        }

        // Carnet de terrain & analyse réflexive (Attendu universitaire BUT MMI)
        const reflexionSection = document.getElementById('project-reflexion-section');
        const reflexionGrid = document.getElementById('project-reflexion');
        if (reflexionSection && reflexionGrid && project.reflexion) {
            const hasReflexion = project.reflexion.contexte || project.reflexion.difficultes || project.reflexion.reussites || project.reflexion.apprentissages;
            if (hasReflexion) {
                reflexionSection.style.display = 'block';
                let rHTML = '';
                
                // Volet 1 : Contexte
                const contexteText = project.reflexion.contexte || 'Cadrage universitaire au département MMI de Laval / Recherche photographique sur le terrain.';
                rHTML += `
                    <div class="notebook-card">
                        <h3 class="notebook-card-title">01 / Contexte & Cadrage</h3>
                        <p>${contexteText}</p>
                    </div>
                `;

                // Volet 2 : Défis & Contraintes
                const defisText = project.reflexion.difficultes || 'Gestion de la lumière naturelle ou artificielle, réactivité immédiate et choix de focale.';
                rHTML += `
                    <div class="notebook-card">
                        <h3 class="notebook-card-title">02 / Défis & Contraintes</h3>
                        <p>${defisText}</p>
                    </div>
                `;

                // Volet 3 : Bilan & Apprentissages
                const bilanText = [project.reflexion.reussites, project.reflexion.apprentissages].filter(Boolean).join(' ') || 'Développement des compétences d\'éditing, de cohérence visuelle et d\'exposition.';
                rHTML += `
                    <div class="notebook-card">
                        <h3 class="notebook-card-title">03 / Bilan & Apprentissages</h3>
                        <p>${bilanText}</p>
                    </div>
                `;

                reflexionGrid.innerHTML = rHTML;
            } else {
                reflexionSection.style.display = 'none';
            }
        }

        // Galerie rythmée des tirages complémentaires (à partir de l'image 2)
        const gallerySection = document.getElementById('project-gallery-section');
        const galleryGrid = document.getElementById('project-images');
        const galleryCountEl = document.getElementById('gallery-count');

        if (gallerySection && galleryGrid && project.images && project.images.length > 1) {
            const extraImages = project.images.slice(1);
            gallerySection.style.display = 'block';
            if (galleryCountEl) {
                galleryCountEl.textContent = `[ ${extraImages.length} TIRAGE${extraImages.length > 1 ? 'S COMPLÉMENTAIRES' : ' COMPLÉMENTAIRE'} ]`;
            }

            // Génération avec rythme éditorial (diptyques et planches contact)
            let galleryHTML = '';
            
            if (extraImages.length === 1) {
                const img = extraImages[0];
                galleryHTML = `
                    <div class="gallery-item" tabindex="0" role="button" aria-label="Agrandir FIG. 02 : ${project.titre}" data-full-src="../${img}" data-caption="FIG. 02 — ${project.titre}">
                        <img src="../${img}" alt="${project.titre}" loading="lazy" class="gallery-img">
                        <div class="gallery-item-caption">
                            <span>FIG. 02 — SECOND TIRAGE</span>
                            <span>TIRAGE ARCHIVE</span>
                        </div>
                    </div>
                `;
            } else if (extraImages.length === 2) {
                galleryHTML = `
                    <div class="curated-diptych">
                        ${extraImages.map((img, i) => {
                            const figNum = String(i + 2).padStart(2, '0');
                            return `
                                <div class="gallery-item" tabindex="0" role="button" aria-label="Agrandir FIG. ${figNum} : ${project.titre}" data-full-src="../${img}" data-caption="FIG. ${figNum} — ${project.titre}">
                                    <img src="../${img}" alt="${project.titre}" loading="lazy" class="gallery-img">
                                    <div class="gallery-item-caption">
                                        <span>FIG. ${figNum}</span>
                                        <span>TIRAGE ARCHIVE</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                // Pour 3 images ou plus : diptyque d'ouverture puis planche-contact
                const firstPair = extraImages.slice(0, 2);
                const contactSheet = extraImages.slice(2);

                galleryHTML += `
                    <div class="curated-diptych">
                        ${firstPair.map((img, i) => {
                            const figNum = String(i + 2).padStart(2, '0');
                            return `
                                <div class="gallery-item" tabindex="0" role="button" aria-label="Agrandir FIG. ${figNum} : ${project.titre}" data-full-src="../${img}" data-caption="FIG. ${figNum} — ${project.titre}">
                                    <img src="../${img}" alt="${project.titre}" loading="lazy" class="gallery-img">
                                    <div class="gallery-item-caption">
                                        <span>FIG. ${figNum}</span>
                                        <span>TIRAGE ARCHIVE</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;

                if (contactSheet.length > 0) {
                    galleryHTML += `
                        <div class="curated-contact-sheet">
                            ${contactSheet.map((img, i) => {
                                const figNum = String(i + 4).padStart(2, '0');
                                return `
                                    <div class="gallery-item" tabindex="0" role="button" aria-label="Agrandir FIG. ${figNum} : ${project.titre}" data-full-src="../${img}" data-caption="FIG. ${figNum} — ${project.titre}">
                                        <img src="../${img}" alt="${project.titre}" loading="lazy" class="gallery-img">
                                        <div class="gallery-item-caption">
                                            <span>FIG. ${figNum}</span>
                                            <span>PLANCHE CONTACT</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                }
            }

            galleryGrid.innerHTML = galleryHTML;
        } else if (gallerySection) {
            gallerySection.style.display = 'none';
        }

        // Navigation entre planches (Pagination de livre)
        const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
        const nextIndex = (currentIndex + 1) % projects.length;

        const spreadPrevBtn = document.getElementById('spread-prev-btn');
        const spreadPrevTitle = document.getElementById('spread-prev-title');
        const spreadNextBtn = document.getElementById('spread-next-btn');
        const spreadNextTitle = document.getElementById('spread-next-title');

        if (spreadPrevBtn && spreadPrevTitle) {
            spreadPrevBtn.href = `projet.html?slug=${projects[prevIndex].slug}`;
            spreadPrevTitle.textContent = projects[prevIndex].titre;
        }
        if (spreadNextBtn && spreadNextTitle) {
            spreadNextBtn.href = `projet.html?slug=${projects[nextIndex].slug}`;
            spreadNextTitle.textContent = projects[nextIndex].titre;
        }

        // Nav fixe du haut
        const prevBtn = document.getElementById('prev-project-btn');
        const nextBtn = document.getElementById('next-project-btn');
        if (prevBtn) prevBtn.href = `projet.html?slug=${projects[prevIndex].slug}`;
        if (nextBtn) nextBtn.href = `projet.html?slug=${projects[nextIndex].slug}`;

        // Initialisation de la Lightbox
        setupLightbox();

        // Initialisation de la modale de navigation rapide entre projets
        if (typeof initProjectNavigationModal === 'function') {
            initProjectNavigationModal(projects, slug);
        }
    }

    /* ─────────────────────────────────────────────
       Lightbox de tirage photographique accessible
    ───────────────────────────────────────────── */
    function setupLightbox() {
        const lightbox = document.getElementById('art-lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const closeBtn = document.getElementById('lightbox-close');
        const overlay = document.getElementById('lightbox-overlay');

        if (!lightbox || !lightboxImg) return;

        let lastFocusedElement = null;

        function openModal(src, caption) {
            lastFocusedElement = document.activeElement;
            lightboxImg.src = src;
            lightboxImg.alt = caption || 'Tirage photographique';
            if (lightboxCaption) lightboxCaption.textContent = caption || '';
            lightbox.removeAttribute('hidden');
            document.body.style.overflow = 'hidden';
            if (closeBtn) closeBtn.focus();
        }

        function closeModal() {
            lightbox.setAttribute('hidden', '');
            lightboxImg.src = '';
            document.body.style.overflow = '';
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }

        function triggerIfKey(e, callback) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                callback();
            }
        }

        // Clic & Clavier sur l'image maîtresse
        const masterWrapper = document.querySelector('.master-img-wrapper');
        if (masterWrapper) {
            const triggerMaster = () => {
                const src = masterWrapper.getAttribute('data-full-src');
                const caption = masterWrapper.getAttribute('data-caption');
                if (src) openModal(src, caption);
            };
            masterWrapper.addEventListener('click', triggerMaster);
            masterWrapper.addEventListener('keydown', (e) => triggerIfKey(e, triggerMaster));
        }

        // Clic & Clavier sur les items de la galerie
        document.querySelectorAll('.gallery-item').forEach(item => {
            const triggerItem = () => {
                const src = item.getAttribute('data-full-src');
                const caption = item.getAttribute('data-caption');
                if (src) openModal(src, caption);
            };
            item.addEventListener('click', triggerItem);
            item.addEventListener('keydown', (e) => triggerIfKey(e, triggerItem));
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);

        // Piège à focus & Échap dans la modale (WCAG 2.2 / RGAA 4.1.2)
        lightbox.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
                return;
            }
            if (e.key === 'Tab') {
                const focusables = lightbox.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
                if (focusables.length === 0) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) {
                closeModal();
            }
        });
    }
});
