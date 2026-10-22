/**
 * PROJECT MANAGER DESKTOP GUI — CLIENT APPLICATION
 * SPA moderne, réactive et fluide sans framework lourd
 */

(function () {
  'use strict';

  // État applicatif central
  const state = {
    portfolioDir: '',
    stats: {},
    projects: [],
    constants: { categories: [], tags: [], competences: [] },
    activeView: 'dashboard',
    activeCategory: 'all',
    statusFilter: 'all',
    searchQuery: '',
    sortBy: 'name_asc',
    displayMode: 'grid',
    activeProject: null,
    deleteTarget: null,
    duplicateTarget: null,
    currentMarkdown: '',
    backups: [],
    auth: {
      hasPassword: false,
      authenticated: false,
      isSetupMode: false
    }
  };

  /* ─────────────────────────────────────────────
     API HTTP SERVICES AVEC AUTHENTIFICATION
  ───────────────────────────────────────────── */
  function getAuthHeaders(extraHeaders = {}) {
    const token = localStorage.getItem('pm_token') || sessionStorage.getItem('pm_token');
    const headers = { 'Content-Type': 'application/json', ...extraHeaders };
    if (token) {
      headers['x-pm-token'] = token;
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  function handleAuthStatus(res) {
    if (res.status === 401) {
      localStorage.removeItem('pm_token');
      sessionStorage.removeItem('pm_token');
      state.auth.authenticated = false;
      showAuthScreen(state.auth.hasPassword ? 'login' : 'setup');
      throw new Error('Authentification requise');
    }
  }

  const api = {
    async get(endpoint) {
      const res = await fetch(`/api${endpoint}`, {
        headers: getAuthHeaders()
      });
      handleAuthStatus(res);
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      return await res.json();
    },

    async post(endpoint, data = {}) {
      const res = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      handleAuthStatus(res);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur HTTP ${res.status}`);
      }
      return await res.json();
    },

    async put(endpoint, data = {}) {
      const res = await fetch(`/api${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      handleAuthStatus(res);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur HTTP ${res.status}`);
      }
      return await res.json();
    },

    async delete(endpoint) {
      const res = await fetch(`/api${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      handleAuthStatus(res);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur HTTP ${res.status}`);
      }
      return await res.json();
    }
  };

  /* ─────────────────────────────────────────────
     NOTIFICATIONS TOAST
  ───────────────────────────────────────────── */
  function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✔';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 260);
    }, duration);
  }

  /* ─────────────────────────────────────────────
     GESTION DES MODALES
  ───────────────────────────────────────────── */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.removeAttribute('hidden');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.setAttribute('hidden', '');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.setAttribute('hidden', ''));
  }

  /* ─────────────────────────────────────────────
     ROUTER & NAVIGATION DES VUES
  ───────────────────────────────────────────── */
  function navigateTo(viewId) {
    state.activeView = viewId;
    window.location.hash = viewId;

    // Mise à jour des liens sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => {
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Affichage du bon panel
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    let targetPanel = document.getElementById(`view-${viewId}`);
    if (!targetPanel && (viewId === 'new' || viewId === 'project-form')) {
      targetPanel = document.getElementById('view-new') || document.getElementById('view-project-form');
    }
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Scroll en haut du workspace
    const mainEl = document.getElementById('app-main');
    if (mainEl) mainEl.scrollTop = 0;

    // Actions spécifiques par vue
    if (viewId === 'dashboard') renderDashboard();
    if (viewId === 'projects') renderProjectsList();
    if (viewId === 'new') setupNewProjectForm();
    if (viewId === 'tasks') renderTasksView();
    if (viewId === 'media') renderMediaView();
    if (viewId === 'audit') loadAndRenderAudit();
    if (viewId === 'presskit') renderPressKit();
    if (viewId === 'settings') renderSettingsView();
  }

  /* ─────────────────────────────────────────────
     CHARGEMENT INITIAL DES DONNÉES
  ───────────────────────────────────────────── */
  async function loadInitialData() {
    try {
      const [statusRes, projectsRes, constRes] = await Promise.all([
        api.get('/status'),
        api.get('/projects'),
        api.get('/constants')
      ]);

      state.portfolioDir = statusRes.portfolioDir;
      state.stats = statusRes;
      state.projects = projectsRes.projects || [];
      state.constants = constRes;

      // Mise à jour du header badge
      const dirNameEl = document.getElementById('current-dir-name');
      if (dirNameEl) {
        const parts = state.portfolioDir.split(/[\\/]/).filter(Boolean);
        dirNameEl.textContent = parts[parts.length - 1] || state.portfolioDir;
        dirNameEl.parentElement.title = state.portfolioDir;
      }

      // Mise à jour des badges sidebar
      updateSidebarBadges();

      // Navigation initiale basée sur le hash
      const initialHash = window.location.hash.replace('#', '') || 'dashboard';
      navigateTo(initialHash);
    } catch (err) {
      showToast('Impossible de charger les données du portfolio : ' + err.message, 'error', 5000);
    }
  }

  function updateSidebarBadges() {
    const projectsCountEl = document.getElementById('sidebar-projects-count');
    if (projectsCountEl) projectsCountEl.textContent = state.projects.length;

    let totalTasks = 0;
    state.projects.forEach(p => {
      if (Array.isArray(p.etapes)) totalTasks += p.etapes.length;
    });
    const tasksCountEl = document.getElementById('sidebar-tasks-count');
    if (tasksCountEl) tasksCountEl.textContent = totalTasks;
  }

  /* ─────────────────────────────────────────────
     1. VUE ACCUEIL (DASHBOARD)
  ───────────────────────────────────────────── */
  function renderDashboard() {
    const total = state.projects.length;
    const etudiant = state.projects.filter(p => p.categorie === 'etudiant').length;
    const perso = state.projects.filter(p => p.categorie === 'perso').length;

    let totalImages = 0;
    let totalSteps = 0;
    let completedSteps = 0;

    state.projects.forEach(p => {
      totalImages += (p.imageCount || 0);
      const steps = Array.isArray(p.etapes) ? p.etapes : [];
      totalSteps += steps.length;
      completedSteps += (p.completedSteps || 0);
    });

    const statTotalEl = document.getElementById('stat-total-projects');
    if (statTotalEl) statTotalEl.textContent = total;

    const statSplitEl = document.getElementById('stat-projects-split');
    if (statSplitEl) statSplitEl.textContent = `${perso} perso · ${etudiant} étudiant`;

    const statPersoEl = document.getElementById('stat-perso-projects');
    if (statPersoEl) statPersoEl.textContent = perso;

    const statEtudiantEl = document.getElementById('stat-etudiant-projects');
    if (statEtudiantEl) statEtudiantEl.textContent = etudiant;

    const statImagesEl = document.getElementById('stat-total-images');
    if (statImagesEl) statImagesEl.textContent = totalImages;

    const statStepsEl = document.getElementById('stat-total-steps');
    if (statStepsEl) statStepsEl.textContent = totalSteps;

    const statStepsProgEl = document.getElementById('stat-steps-progress');
    if (statStepsProgEl) {
      statStepsProgEl.textContent = totalSteps > 0 
        ? `${completedSteps}/${totalSteps} terminées (${Math.round((completedSteps/totalSteps)*100)}%)` 
        : 'Aucune étape définie';
    }

    // Projets récents (les 3 premiers)
    const recentGrid = document.getElementById('dashboard-recent-grid');
    if (recentGrid) {
      recentGrid.innerHTML = '';
      const recent = [...state.projects].slice(0, 3);
      recent.forEach(p => recentGrid.appendChild(createProjectCardElement(p)));
    }
  }

  /* ─────────────────────────────────────────────
     2. VUE LISTE DES PROJETS
  ───────────────────────────────────────────── */
  function renderProjectsList() {
    const gridEl = document.getElementById('projects-main-grid');
    const tableBody = document.getElementById('projects-table-body');
    const emptyState = document.getElementById('projects-empty-state');
    if (!gridEl || !tableBody) return;

    // Comptages des onglets
    const countAll = state.projects.length;
    const countEtudiant = state.projects.filter(p => p.categorie === 'etudiant').length;
    const countPerso = state.projects.filter(p => p.categorie === 'perso').length;

    const cTabAll = document.getElementById('count-tab-all');
    if (cTabAll) cTabAll.textContent = countAll;
    const cTabEtudiant = document.getElementById('count-tab-etudiant');
    if (cTabEtudiant) cTabEtudiant.textContent = countEtudiant;
    const cTabPerso = document.getElementById('count-tab-perso');
    if (cTabPerso) cTabPerso.textContent = countPerso;

    // Filtrage
    let filtered = [...state.projects];

    if (state.activeCategory !== 'all') {
      filtered = filtered.filter(p => p.categorie === state.activeCategory);
    }

    if (state.statusFilter && state.statusFilter !== 'all') {
      filtered = filtered.filter(p => p.computedStatus === state.statusFilter);
    }

    if (state.searchQuery.trim().length > 0) {
      const q = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const titleMatch = (p.titre || '').toLowerCase().includes(q);
        const slugMatch = (p.slug || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const tagMatch = Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q));
        const compMatch = Array.isArray(p.competences) && p.competences.some(c => c.toLowerCase().includes(q));
        return titleMatch || slugMatch || descMatch || tagMatch || compMatch;
      });
    }

    // Tri
    filtered.sort((a, b) => {
      if (state.sortBy === 'name_asc') return (a.titre || '').localeCompare(b.titre || '');
      if (state.sortBy === 'name_desc') return (b.titre || '').localeCompare(a.titre || '');
      if (state.sortBy === 'images_desc') return (b.imageCount || 0) - (a.imageCount || 0);
      if (state.sortBy === 'date_desc') return (new Date(b.lastModified || 0)) - (new Date(a.lastModified || 0));
      if (state.sortBy === 'category') return (a.categorie || '').localeCompare(b.categorie || '');
      return 0;
    });

    gridEl.innerHTML = '';
    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      gridEl.style.display = 'none';
      if (state.displayMode === 'table') {
        const tableContainer = document.getElementById('projects-main-table');
        if (tableContainer) tableContainer.style.display = 'none';
      }
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Rendu Grille
    filtered.forEach(p => {
      gridEl.appendChild(createProjectCardElement(p));
    });

    // Rendu Tableau
    filtered.forEach(p => {
      tableBody.appendChild(createProjectTableRowElement(p));
    });

    // Respect du mode d'affichage
    const tableContainer = document.getElementById('projects-main-table');
    if (state.displayMode === 'grid') {
      gridEl.style.display = 'grid';
      if (tableContainer) tableContainer.style.display = 'none';
    } else {
      gridEl.style.display = 'none';
      if (tableContainer) tableContainer.style.display = 'block';
    }
  }

  function createProjectCardElement(p) {
    const card = document.createElement('article');
    card.className = 'project-card';

    const coverUrl = p.coverImage ? `/api/image?path=${encodeURIComponent(p.coverImage)}` : '';
    const catLabel = p.categorie === 'etudiant' ? '🎓 Étudiant' : '🎨 Perso';

    const tagsHtml = (p.tags || []).slice(0, 3).map(t => `<span class="tag-pill" data-tag="${t}">#${t}</span>`).join('');
    const stepCount = Array.isArray(p.etapes) ? p.etapes.length : 0;

    card.innerHTML = `
      <div class="project-card-thumb-wrapper">
        ${coverUrl 
          ? `<img src="${coverUrl}" alt="${p.titre}" class="project-card-thumb" loading="lazy">` 
          : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font-size:0.8rem;background:#eee;">AUCUN VISUEL</div>`}
        <span class="project-card-cat-badge">${catLabel}</span>
        <span class="project-card-images-count">📷 ${p.imageCount || 0}</span>
      </div>
      <div class="project-card-body">
        <h3 class="project-card-title">${p.titre || p.slug}</h3>
        <p class="project-card-desc">${p.description || 'Note d\'intention non rédigée.'}</p>
        <div class="project-card-tags">${tagsHtml}</div>
        <div class="project-card-footer">
          <span class="project-card-meta">${stepCount} étape(s)</span>
          <div class="project-card-actions">
            <button class="btn btn-secondary btn-sm btn-open" title="Détails du projet">Détails</button>
            <button class="btn btn-secondary btn-sm btn-view-site" title="Voir sur le site web">🌐</button>
            <button class="btn btn-secondary btn-sm btn-dup" title="Dupliquer">📋</button>
            <button class="btn btn-secondary btn-sm btn-edit" title="Modifier">✏️</button>
            <button class="btn btn-danger btn-sm btn-delete" title="Supprimer">🗑️</button>
          </div>
        </div>
      </div>
    `;

    card.querySelector('.btn-open').addEventListener('click', (e) => { e.stopPropagation(); openProjectDetail(p); });
    card.querySelector('.btn-view-site')?.addEventListener('click', (e) => {
      e.stopPropagation();
      api.post(`/open-site?slug=${encodeURIComponent(p.slug)}`);
      showToast('Ouverture de la fiche projet dans votre navigateur...', 'info', 2000);
    });
    card.querySelector('.btn-dup')?.addEventListener('click', (e) => {
      e.stopPropagation();
      promptDuplicateProject(p);
    });
    card.querySelector('.btn-edit').addEventListener('click', (e) => { e.stopPropagation(); editProjectForm(p); });
    card.querySelector('.btn-delete').addEventListener('click', (e) => { e.stopPropagation(); promptDeleteProject(p); });
    
    // Filtre instantané au clic sur un tag
    card.querySelectorAll('.tag-pill').forEach(pill => {
      pill.style.cursor = 'pointer';
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = pill.getAttribute('data-tag');
        if (tag) {
          state.searchQuery = tag;
          const searchInput = document.getElementById('global-search-input');
          if (searchInput) searchInput.value = tag;
          const projSearch = document.getElementById('projects-search-input');
          if (projSearch) projSearch.value = tag;
          renderProjectsList();
        }
      });
    });

    card.addEventListener('click', (e) => {
      if (e.target.closest('.project-card-actions') || e.target.closest('.tag-pill')) return;
      openProjectDetail(p);
    });

    return card;
  }

  function createProjectTableRowElement(p) {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    const coverUrl = p.coverImage ? `/api/image?path=${encodeURIComponent(p.coverImage)}` : '';
    const catLabel = p.categorie === 'etudiant' ? '🎓 Étudiant' : '🎨 Perso';
    const tagsText = (p.tags || []).slice(0, 2).map(t => `#${t}`).join(' ');

    tr.innerHTML = `
      <td>
        ${coverUrl ? `<img src="${coverUrl}" class="table-thumb" alt="">` : `<div class="table-thumb"></div>`}
      </td>
      <td>
        <span class="table-title">${p.titre || p.slug}</span>
        <span class="table-slug">${p.slug}</span>
      </td>
      <td><span class="tag-pill">${catLabel}</span></td>
      <td><span style="font-size:0.75rem;color:var(--text-muted);">${tagsText || '—'}</span></td>
      <td><strong>${p.imageCount || 0}</strong> visuel(s)</td>
      <td>${(p.etapes || []).length} étape(s)</td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm btn-open">Détails</button>
        <button class="btn btn-secondary btn-sm btn-view-site" title="Voir sur le site">🌐</button>
        <button class="btn btn-secondary btn-sm btn-dup" title="Dupliquer">📋</button>
        <button class="btn btn-secondary btn-sm btn-edit">✏️</button>
        <button class="btn btn-danger btn-sm btn-delete">🗑️</button>
      </td>
    `;

    tr.querySelector('.btn-open').addEventListener('click', (e) => { e.stopPropagation(); openProjectDetail(p); });
    tr.querySelector('.btn-view-site')?.addEventListener('click', (e) => {
      e.stopPropagation();
      api.post(`/open-site?slug=${encodeURIComponent(p.slug)}`);
      showToast('Ouverture de la fiche projet dans votre navigateur...', 'info', 2000);
    });
    tr.querySelector('.btn-dup')?.addEventListener('click', (e) => {
      e.stopPropagation();
      promptDuplicateProject(p);
    });
    tr.querySelector('.btn-edit').addEventListener('click', (e) => { e.stopPropagation(); editProjectForm(p); });
    tr.querySelector('.btn-delete').addEventListener('click', (e) => { e.stopPropagation(); promptDeleteProject(p); });
    tr.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      openProjectDetail(p);
    });

    return tr;
  }

  /* ─────────────────────────────────────────────
     3. VUE DÉTAIL D'UN PROJET
  ───────────────────────────────────────────── */
  function openProjectDetail(project) {
    state.activeProject = project;
    navigateTo('project-detail');

    const detailContainer = document.getElementById('project-detail-content');
    if (!detailContainer) return;

    const coverUrl = project.coverImage ? `/api/image?path=${encodeURIComponent(project.coverImage)}` : '';
    const catLabel = project.categorie === 'etudiant' ? 'PROJET UNIVERSITAIRE · BUT MMI' : 'SÉRIE PHOTOGRAPHIQUE & TIRAGES';

    const tagsHtml = (project.tags || []).map(t => `<span class="tag-pill" style="font-size:0.8rem;padding:0.25rem 0.6rem;">#${t}</span>`).join(' ');
    const compHtml = (project.competences || []).map(c => `<span class="tag-pill" style="font-weight:700;font-size:0.8rem;padding:0.25rem 0.6rem;background:var(--primary);color:var(--primary-text);border-color:transparent;">${c}</span>`).join(' ');

    // Galeries
    const images = Array.isArray(project.images) ? project.images : [];
    let galleryGridHtml = '<p style="color:var(--text-muted);font-size:0.85rem;padding:0.75rem 0;">Aucune image associée à ce projet. Glissez des fichiers ci-dessous ou cliquez sur "Importer des photos".</p>';
    if (images.length > 0) {
      galleryGridHtml = `
        <div class="detail-gallery-grid">
          ${images.map((img, idx) => `
            <div class="detail-gallery-item ${idx === 0 ? 'is-cover-item' : ''}" data-src="/api/image?path=${encodeURIComponent(img)}" data-caption="FIG. ${String(idx+1).padStart(2, '0')} — ${img.split('/').pop()}">
              ${idx === 0 ? '<span class="item-cover-badge">⭐ COUVERTURE</span>' : ''}
              <img src="/api/image?path=${encodeURIComponent(img)}" alt="" loading="lazy">
              <div class="item-actions-bar" onclick="event.stopPropagation();">
                ${idx !== 0 ? `<button class="item-action-btn btn-set-cover" data-img="${img}" title="Définir comme couverture">⭐ Couv.</button>` : ''}
                ${idx > 0 ? `<button class="item-action-btn btn-move-left" data-idx="${idx}" title="Déplacer vers la gauche">◀</button>` : ''}
                ${idx < images.length - 1 ? `<button class="item-action-btn btn-move-right" data-idx="${idx}" title="Déplacer vers la droite">▶</button>` : ''}
                <button class="item-action-btn btn-del" data-img="${img}" title="Supprimer cette photo">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    const galleryHtml = `
      <div class="gallery-management-header">
        <h3 class="detail-section-title" style="margin:0;border:none;padding:0;">Galerie photographique (${images.length} visuels)</h3>
        <div class="gallery-tools-group">
          <input type="file" id="photos-upload-input" multiple accept=".webp,.png,.jpg,.jpeg,.avif" style="display:none;">
          <button class="btn btn-secondary btn-sm" id="btn-import-photos" title="Ajouter des images dans ce projet">+ Importer des photos</button>
          <button class="btn btn-secondary btn-sm" id="btn-open-photos-dir" title="Ouvrir le dossier dans l'explorateur Windows">📂 Dossier photos</button>
        </div>
      </div>

      <div class="gallery-dropzone" id="gallery-dropzone" title="Glissez vos fichiers images ici pour les ajouter directement au projet">
        <div class="gallery-dropzone-icon">📷</div>
        <div class="gallery-dropzone-title">Glissez-déposez vos photos WebP ou Haute Définition ici</div>
        <div class="gallery-dropzone-sub">Formats : WebP, JPEG, PNG, AVIF · Cliquez pour parcourir vos fichiers</div>
      </div>

      ${galleryGridHtml}
    `;

    // Réflexion
    const ref = project.reflexion || {};
    const refHtml = `
      <div class="reflexion-grid">
        <div class="reflexion-card">
          <div class="reflexion-card-num">01 / Cadrage</div>
          <div class="reflexion-card-title">Contexte</div>
          <p class="reflexion-card-text">${ref.contexte || 'Non renseigné.'}</p>
        </div>
        <div class="reflexion-card">
          <div class="reflexion-card-num">02 / Obstacles</div>
          <div class="reflexion-card-title">Défis & Contraintes</div>
          <p class="reflexion-card-text">${ref.difficultes || 'Non renseigné.'}</p>
        </div>
        <div class="reflexion-card">
          <div class="reflexion-card-num">03 / Succès</div>
          <div class="reflexion-card-title">Réussites</div>
          <p class="reflexion-card-text">${ref.reussites || 'Non renseigné.'}</p>
        </div>
        <div class="reflexion-card">
          <div class="reflexion-card-num">04 / Bilan</div>
          <div class="reflexion-card-title">Apprentissages</div>
          <p class="reflexion-card-text">${ref.apprentissages || 'Non renseigné.'}</p>
        </div>
      </div>
    `;

    // Étapes
    const etapes = Array.isArray(project.etapes) ? project.etapes : [];
    let etapesHtml = '<p style="color:var(--text-muted);font-size:0.85rem;">Aucune étape de conception enregistrée.</p>';
    if (etapes.length > 0) {
      etapesHtml = `
        <div class="detail-etapes-list">
          ${etapes.map((et, idx) => `
            <div class="detail-etape-item">
              <input type="checkbox" class="etape-checkbox" ${et.status === 'completed' || et.done ? 'checked' : ''} data-step-idx="${idx}">
              <div class="etape-info">
                <div class="etape-title">Étape ${idx + 1} : ${et.titre}</div>
                <div class="etape-desc">${et.desc || ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    detailContainer.innerHTML = `
      <div class="detail-hero-banner">
        ${coverUrl ? `<img src="${coverUrl}" class="detail-hero-img" alt="">` : ''}
        <div class="detail-hero-overlay">
          <div class="detail-badge-row">
            <span class="detail-badge">${catLabel}</span>
            <span class="detail-badge">SLUG: ${project.slug}</span>
            ${project.lien ? `<a href="${project.lien}" target="_blank" class="detail-badge" style="background:#FFFFFF;color:#000000;text-decoration:none;">Consulter en ligne ↗</a>` : ''}
          </div>
          <h1 class="detail-title">${project.titre}</h1>
        </div>
      </div>

      <div class="detail-content-body">
        <div class="detail-desc-box">${project.description || ''}</div>

        <h3 class="detail-section-title">Tags & Compétences</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.5rem;">
          ${tagsHtml} ${compHtml}
        </div>

        ${galleryHtml}

        <h3 class="detail-section-title">Analyse Réflexive (Carnet de bord)</h3>
        ${refHtml}

        <h3 class="detail-section-title">Étapes de Production & Jalons (${etapes.length})</h3>
        ${etapesHtml}
      </div>
    `;

    // Écouteurs sur la galerie (zoom lightbox)
    detailContainer.querySelectorAll('.detail-gallery-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.item-actions-bar')) return;
        const src = item.getAttribute('data-src');
        const caption = item.getAttribute('data-caption');
        openLightbox(src, caption);
      });
    });

    // Actions interactives sur chaque photo de la galerie
    detailContainer.querySelectorAll('.btn-set-cover').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const imgPath = btn.getAttribute('data-img');
        try {
          await api.post(`/projects/${project.categorie}/${project.slug}/set-cover`, { imagePath: imgPath });
          showToast('Image définie comme nouvelle couverture !', 'success');
          const updated = await api.get(`/projects/${project.categorie}/${project.slug}`);
          openProjectDetail(updated);
        } catch (err) {
          showToast('Erreur : ' + err.message, 'error');
        }
      });
    });

    detailContainer.querySelectorAll('.btn-move-left').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (idx <= 0) return;
        const newOrder = [...images];
        const tmp = newOrder[idx - 1];
        newOrder[idx - 1] = newOrder[idx];
        newOrder[idx] = tmp;
        try {
          await api.post(`/projects/${project.categorie}/${project.slug}/reorder-images`, { images: newOrder });
          const updated = await api.get(`/projects/${project.categorie}/${project.slug}`);
          openProjectDetail(updated);
        } catch (err) {
          showToast('Erreur de réordonnancement : ' + err.message, 'error');
        }
      });
    });

    detailContainer.querySelectorAll('.btn-move-right').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (idx >= images.length - 1) return;
        const newOrder = [...images];
        const tmp = newOrder[idx + 1];
        newOrder[idx + 1] = newOrder[idx];
        newOrder[idx] = tmp;
        try {
          await api.post(`/projects/${project.categorie}/${project.slug}/reorder-images`, { images: newOrder });
          const updated = await api.get(`/projects/${project.categorie}/${project.slug}`);
          openProjectDetail(updated);
        } catch (err) {
          showToast('Erreur de réordonnancement : ' + err.message, 'error');
        }
      });
    });

    detailContainer.querySelectorAll('.item-actions-bar .btn-del').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const imgPath = btn.getAttribute('data-img');
        const filename = imgPath.split('/').pop();
        if (confirm(`Voulez-vous supprimer définitivement la photo '${filename}' du projet et du disque ?`)) {
          try {
            await api.post(`/projects/${project.categorie}/${project.slug}/delete-image`, { imagePath: imgPath });
            showToast(`Photo '${filename}' supprimée avec succès.`, 'success');
            const updated = await api.get(`/projects/${project.categorie}/${project.slug}`);
            openProjectDetail(updated);
          } catch (err) {
            showToast('Erreur de suppression : ' + err.message, 'error');
          }
        }
      });
    });

    // Importation de photos via bouton ou dropzone
    const fileInput = detailContainer.querySelector('#photos-upload-input');
    const btnImport = detailContainer.querySelector('#btn-import-photos');
    const dropzone = detailContainer.querySelector('#gallery-dropzone');
    const btnOpenPhotosDir = detailContainer.querySelector('#btn-open-photos-dir');

    if (btnImport && fileInput) {
      btnImport.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) {
          uploadFilesForProject(project, Array.from(fileInput.files));
        }
      });
    }

    if (btnOpenPhotosDir) {
      btnOpenPhotosDir.addEventListener('click', async () => {
        try {
          await api.post(`/projects/${project.categorie}/${project.slug}/open-folder`);
          showToast('Dossier ouvert dans l\'explorateur Windows.', 'info', 1500);
        } catch (err) {
          showToast('Erreur : ' + err.message, 'error');
        }
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('is-dragover');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('is-dragover');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('is-dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          uploadFilesForProject(project, Array.from(e.dataTransfer.files));
        }
      });
    }

    // Écouteurs sur les étapes (tâches)
    detailContainer.querySelectorAll('.etape-checkbox').forEach(chk => {
      chk.addEventListener('change', async (e) => {
        const stepIdx = parseInt(e.target.getAttribute('data-step-idx'), 10);
        if (!Array.isArray(project.etapes) || !project.etapes[stepIdx]) return;

        project.etapes[stepIdx].status = e.target.checked ? 'completed' : 'pending';
        project.etapes[stepIdx].done = e.target.checked;

        try {
          await api.put(`/projects/${project.categorie}/${project.slug}`, project);
          showToast(`Étape ${stepIdx + 1} mise à jour !`, 'success');
          // Actualiser les stats locales
          const updatedProjects = await api.get('/projects');
          state.projects = updatedProjects.projects || [];
          updateSidebarBadges();
        } catch (err) {
          showToast('Erreur de mise à jour de l\'étape : ' + err.message, 'error');
        }
      });
    });

    // Boutons d'actions en haut de page
    const btnBack = document.getElementById('btn-detail-back');
    if (btnBack) btnBack.onclick = () => navigateTo('projects');

    const btnViewSite = document.getElementById('btn-detail-view-site');
    if (btnViewSite) {
      btnViewSite.onclick = () => {
        api.post(`/open-site?slug=${encodeURIComponent(project.slug)}`);
        showToast('Ouverture de la page projet dans votre navigateur...', 'info', 2000);
      };
    }

    const btnDuplicate = document.getElementById('btn-detail-duplicate');
    if (btnDuplicate) {
      btnDuplicate.onclick = () => promptDuplicateProject(project);
    }

    const btnExportMd = document.getElementById('btn-detail-export-md');
    if (btnExportMd) {
      btnExportMd.onclick = () => openMarkdownModal(project);
    }

    const btnOpenFolder = document.getElementById('btn-detail-open-folder');
    if (btnOpenFolder) {
      btnOpenFolder.onclick = async () => {
        try {
          await api.post(`/projects/${project.categorie}/${project.slug}/open-folder`);
          showToast('Dossier ouvert dans l\'explorateur Windows.', 'info', 1500);
        } catch (err) {
          showToast('Erreur : ' + err.message, 'error');
        }
      };
    }

    const btnExportPdf = document.getElementById('btn-detail-export-pdf');
    if (btnExportPdf) {
      btnExportPdf.onclick = () => {
        window.print();
      };
    }

    const btnEdit = document.getElementById('btn-detail-edit');
    if (btnEdit) btnEdit.onclick = () => editProjectForm(project);

    const btnSync = document.getElementById('btn-detail-sync');
    if (btnSync) btnSync.onclick = async () => {
      try {
        const res = await api.post(`/sync?slug=${project.slug}`);
        showToast(`Synchronisation terminée !`, 'success');
        const updated = await api.get(`/projects/${project.categorie}/${project.slug}`);
        openProjectDetail(updated);
      } catch (err) {
        showToast('Erreur de synchronisation : ' + err.message, 'error');
      }
    };

    const btnDelete = document.getElementById('btn-detail-delete');
    if (btnDelete) btnDelete.onclick = () => promptDeleteProject(project);
  }

  /* ─────────────────────────────────────────────
     4. FORMULAIRE CRÉATION & MODIFICATION
  ───────────────────────────────────────────── */
  function setupNewProjectForm() {
    state.activeProject = null;
    document.getElementById('form-view-title').textContent = 'Nouveau Projet';
    document.getElementById('form-view-subtitle').textContent = 'Créez une nouvelle fiche projet avec son dossier dédié.';
    document.getElementById('form-edit-original-cat').value = '';
    document.getElementById('form-edit-original-slug').value = '';

    document.getElementById('form-input-titre').value = '';
    document.getElementById('form-input-slug').value = '';
    document.getElementById('form-input-desc').value = '';
    document.getElementById('form-input-lien').value = '';

    document.querySelector('input[name="form-cat-choice"][value="perso"]').checked = true;

    document.getElementById('form-ref-contexte').value = '';
    document.getElementById('form-ref-difficultes').value = '';
    document.getElementById('form-ref-reussites').value = '';
    document.getElementById('form-ref-apprentissages').value = '';

    renderFormChips([], []);
    renderFormSteps([]);
  }

  function editProjectForm(project) {
    state.activeProject = project;
    navigateTo('new');

    document.getElementById('form-view-title').textContent = `Modifier : ${project.titre}`;
    document.getElementById('form-view-subtitle').textContent = `Édition des métadonnées du projet ${project.slug}`;
    document.getElementById('form-edit-original-cat').value = project.categorie;
    document.getElementById('form-edit-original-slug').value = project.slug;

    document.getElementById('form-input-titre').value = project.titre || '';
    document.getElementById('form-input-slug').value = project.slug || '';
    document.getElementById('form-input-desc').value = project.description || '';
    document.getElementById('form-input-lien').value = project.lien || '';

    const catRadio = document.querySelector(`input[name="form-cat-choice"][value="${project.categorie}"]`);
    if (catRadio) catRadio.checked = true;

    const ref = project.reflexion || {};
    document.getElementById('form-ref-contexte').value = ref.contexte || '';
    document.getElementById('form-ref-difficultes').value = ref.difficultes || '';
    document.getElementById('form-ref-reussites').value = ref.reussites || '';
    document.getElementById('form-ref-apprentissages').value = ref.apprentissages || '';

    renderFormChips(project.tags || [], project.competences || []);
    renderFormSteps(project.etapes || []);
  }

  function renderFormChips(selectedTags = [], selectedComp = []) {
    const tagsContainer = document.getElementById('form-tags-chips');
    const compContainer = document.getElementById('form-comp-chips');

    if (tagsContainer) {
      tagsContainer.innerHTML = '';
      const allTags = [...(state.constants.tags || [])];
      selectedTags.forEach(st => {
        if (!allTags.some(t => (t.value || t.name) === st)) {
          allTags.push({ value: st, name: st });
        }
      });
      allTags.forEach(t => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `chip-btn ${selectedTags.includes(t.value || t.name) ? 'selected' : ''}`;
        btn.textContent = t.name || t.value;
        btn.addEventListener('click', () => btn.classList.toggle('selected'));
        tagsContainer.appendChild(btn);
      });

      // Bouton pour ajouter un tag sur mesure
      const addTagBtn = document.createElement('button');
      addTagBtn.type = 'button';
      addTagBtn.className = 'chip-btn';
      addTagBtn.style.borderStyle = 'dashed';
      addTagBtn.textContent = '+ Ajouter un tag...';
      addTagBtn.addEventListener('click', () => {
        const customTag = prompt('Nom du tag personnalisé à ajouter :');
        if (customTag && customTag.trim()) {
          const clean = customTag.trim();
          const newBtn = document.createElement('button');
          newBtn.type = 'button';
          newBtn.className = 'chip-btn selected';
          newBtn.textContent = clean;
          newBtn.addEventListener('click', () => newBtn.classList.toggle('selected'));
          tagsContainer.insertBefore(newBtn, addTagBtn);
        }
      });
      tagsContainer.appendChild(addTagBtn);
    }

    if (compContainer) {
      compContainer.innerHTML = '';
      const allComp = [...(state.constants.competences || [])];
      selectedComp.forEach(sc => {
        if (!allComp.some(c => (c.value || c.name) === sc)) {
          allComp.push({ value: sc, name: sc });
        }
      });
      allComp.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `chip-btn ${selectedComp.includes(c.value || c.name) ? 'selected' : ''}`;
        btn.textContent = c.name || c.value;
        btn.addEventListener('click', () => btn.classList.toggle('selected'));
        compContainer.appendChild(btn);
      });

      // Bouton pour ajouter une compétence sur mesure
      const addCompBtn = document.createElement('button');
      addCompBtn.type = 'button';
      addCompBtn.className = 'chip-btn';
      addCompBtn.style.borderStyle = 'dashed';
      addCompBtn.textContent = '+ Ajouter une compétence...';
      addCompBtn.addEventListener('click', () => {
        const customComp = prompt('Nom du logiciel ou de la compétence à ajouter :');
        if (customComp && customComp.trim()) {
          const clean = customComp.trim();
          const newBtn = document.createElement('button');
          newBtn.type = 'button';
          newBtn.className = 'chip-btn selected';
          newBtn.textContent = clean;
          newBtn.addEventListener('click', () => newBtn.classList.toggle('selected'));
          compContainer.insertBefore(newBtn, addCompBtn);
        }
      });
      compContainer.appendChild(addCompBtn);
    }
  }

  function renderFormSteps(steps = []) {
    const listEl = document.getElementById('form-steps-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    steps.forEach((st, idx) => addStepToForm(st.titre || '', st.desc || ''));
  }

  function addStepToForm(titre = '', desc = '') {
    const listEl = document.getElementById('form-steps-list');
    if (!listEl) return;

    const idx = listEl.children.length + 1;
    const row = document.createElement('div');
    row.className = 'form-step-item';
    row.innerHTML = `
      <span class="form-step-num">#${String(idx).padStart(2, '0')}</span>
      <div class="form-step-fields">
        <input type="text" class="form-input form-step-title" placeholder="Titre de l'étape (ex: Prise de vue)" value="${titre}" required>
        <textarea class="form-textarea form-step-desc" rows="2" placeholder="Description courte du workflow...">${desc}</textarea>
      </div>
      <button type="button" class="form-step-delete" title="Supprimer cette étape">&times;</button>
    `;

    row.querySelector('.form-step-delete').addEventListener('click', () => {
      row.remove();
      // Réindexer les numéros
      listEl.querySelectorAll('.form-step-item').forEach((it, i) => {
        it.querySelector('.form-step-num').textContent = `#${String(i + 1).padStart(2, '0')}`;
      });
    });

    listEl.appendChild(row);
  }

  async function saveProjectForm() {
    const titre = document.getElementById('form-input-titre').value.trim();
    const rawSlug = document.getElementById('form-input-slug').value.trim();
    const description = document.getElementById('form-input-desc').value.trim();
    const lien = document.getElementById('form-input-lien').value.trim();
    const categorie = document.querySelector('input[name="form-cat-choice"]:checked')?.value || 'perso';

    if (!titre) {
      showToast('Le titre du projet est obligatoire.', 'error');
      document.getElementById('form-input-titre').focus();
      return;
    }

    const slug = rawSlug
      ? rawSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)+/g, '')
      : titre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (!slug) {
      showToast('Le slug du projet est obligatoire.', 'error');
      document.getElementById('form-input-slug').focus();
      return;
    }

    let cleanLien = lien || null;
    if (cleanLien && !/^https?:\/\//i.test(cleanLien)) {
      cleanLien = 'https://' + cleanLien;
    }

    // Récupération des tags et compétences
    const tags = [];
    document.querySelectorAll('#form-tags-chips .chip-btn.selected').forEach(btn => tags.push(btn.textContent.trim()));

    const competences = [];
    document.querySelectorAll('#form-comp-chips .chip-btn.selected').forEach(btn => competences.push(btn.textContent.trim()));

    // Récupération des étapes
    const etapes = [];
    document.querySelectorAll('#form-steps-list .form-step-item').forEach(it => {
      const stepTitre = it.querySelector('.form-step-title').value.trim();
      const stepDesc = it.querySelector('.form-step-desc').value.trim();
      if (stepTitre) {
        etapes.push({ titre: stepTitre, desc: stepDesc, status: 'pending' });
      }
    });

    const reflexion = {
      contexte: document.getElementById('form-ref-contexte').value.trim(),
      difficultes: document.getElementById('form-ref-difficultes').value.trim(),
      reussites: document.getElementById('form-ref-reussites').value.trim(),
      apprentissages: document.getElementById('form-ref-apprentissages').value.trim()
    };

    const payload = {
      titre,
      slug,
      categorie,
      description,
      lien: cleanLien,
      tags,
      competences,
      reflexion,
      etapes
    };

    const origCat = document.getElementById('form-edit-original-cat').value;
    const origSlug = document.getElementById('form-edit-original-slug').value;
    const isEdit = origCat && origSlug;

    const saveBtn = document.getElementById('btn-form-save');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Enregistrement...';
    }

    try {
      if (isEdit) {
        await api.put(`/projects/${origCat}/${origSlug}`, payload);
        showToast(`Projet '${titre}' mis à jour avec succès !`, 'success');
      } else {
        await api.post('/projects', payload);
        showToast(`Nouveau projet '${titre}' créé avec succès !`, 'success');
      }

      // Recharger la liste complète des projets
      const updatedList = await api.get('/projects');
      state.projects = updatedList.projects || [];
      updateSidebarBadges();

      // Rediriger vers la liste des projets
      navigateTo('projects');
    } catch (err) {
      showToast('Erreur lors de l\'enregistrement : ' + err.message, 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          <span>Enregistrer le projet</span>
        `;
      }
    }
  }

  /* ─────────────────────────────────────────────
     5. VUE TÂCHES & WORKFLOW
  ───────────────────────────────────────────── */
  function renderTasksView() {
    const container = document.getElementById('tasks-main-container');
    const summaryEl = document.getElementById('tasks-overall-summary');
    const selectFilter = document.getElementById('tasks-project-filter');
    if (!container) return;

    // Remplir le sélecteur de projets
    if (selectFilter) {
      const prevVal = selectFilter.value || 'all';
      selectFilter.innerHTML = '<option value="all">Tous les projets</option>';
      state.projects.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.slug;
        opt.textContent = p.titre || p.slug;
        if (p.slug === prevVal) opt.selected = true;
        selectFilter.appendChild(opt);
      });
      selectFilter.onchange = () => filterTasksDisplay();
    }

    let allStepsCount = 0;
    let completedCount = 0;

    state.projects.forEach(p => {
      const steps = Array.isArray(p.etapes) ? p.etapes : [];
      allStepsCount += steps.length;
      completedCount += (p.completedSteps || 0);
    });

    if (summaryEl) {
      const pct = allStepsCount > 0 ? Math.round((completedCount / allStepsCount) * 100) : 100;
      summaryEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:700;font-size:0.95rem;">Progression globale du portfolio</span>
          <span style="font-weight:800;font-family:var(--font-mono);">${completedCount} / ${allStepsCount} étapes (${pct}%)</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${pct}%;"></div>
        </div>
      `;
    }

    container.innerHTML = '';

    state.projects.forEach(project => {
      const steps = Array.isArray(project.etapes) ? project.etapes : [];
      if (steps.length === 0) return;

      const card = document.createElement('div');
      card.className = 'task-project-card';
      card.setAttribute('data-project-slug', project.slug);

      card.innerHTML = `
        <div class="task-project-header">
          <span class="task-project-title">${project.titre}</span>
          <span class="task-project-badge">${project.completedSteps || 0}/${steps.length}</span>
        </div>
        <div class="detail-etapes-list">
          ${steps.map((st, i) => `
            <div class="detail-etape-item">
              <input type="checkbox" class="task-step-check" ${st.status === 'completed' || st.done ? 'checked' : ''} data-cat="${project.categorie}" data-slug="${project.slug}" data-step-idx="${i}">
              <div class="etape-info">
                <div class="etape-title" style="font-size:0.85rem;">${st.titre}</div>
                <div class="etape-desc" style="font-size:0.75rem;">${st.desc || ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      card.querySelectorAll('.task-step-check').forEach(chk => {
        chk.addEventListener('change', async (e) => {
          const cat = e.target.getAttribute('data-cat');
          const slug = e.target.getAttribute('data-slug');
          const idx = parseInt(e.target.getAttribute('data-step-idx'), 10);

          const proj = state.projects.find(p => p.slug === slug);
          if (!proj || !proj.etapes[idx]) return;

          proj.etapes[idx].status = e.target.checked ? 'completed' : 'pending';
          proj.etapes[idx].done = e.target.checked;

          try {
            await api.put(`/projects/${cat}/${slug}`, proj);
            showToast('Tâche mise à jour !', 'success', 2000);
            const updated = await api.get('/projects');
            state.projects = updated.projects || [];
            updateSidebarBadges();
            renderTasksView();
          } catch (err) {
            showToast('Erreur : ' + err.message, 'error');
          }
        });
      });

      container.appendChild(card);
    });

    filterTasksDisplay();
  }

  function filterTasksDisplay() {
    const selectFilter = document.getElementById('tasks-project-filter');
    const selectedSlug = selectFilter ? selectFilter.value : 'all';
    document.querySelectorAll('.task-project-card').forEach(card => {
      const cardSlug = card.getAttribute('data-project-slug');
      if (selectedSlug === 'all' || cardSlug === selectedSlug) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  /* ─────────────────────────────────────────────
     6. VUE MÉDIAS & GALERIES
  ───────────────────────────────────────────── */
  function renderMediaView() {
    const container = document.getElementById('media-projects-container');
    if (!container) return;
    container.innerHTML = '';

    state.projects.forEach(project => {
      const images = Array.isArray(project.images) ? project.images : [];
      const item = document.createElement('div');
      item.className = 'settings-card';
      item.style.marginBottom = '1.25rem';

      const galleryThumbs = images.slice(0, 8).map(img => `
        <div style="width:70px;height:70px;border-radius:4px;overflow:hidden;border:1px solid var(--border-color);cursor:pointer;" class="media-thumb-zoom" data-src="/api/image?path=${encodeURIComponent(img)}" data-caption="${project.titre} — ${img}">
          <img src="/api/image?path=${encodeURIComponent(img)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
        </div>
      `).join('');

      item.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
          <div>
            <h3 style="font-size:1.05rem;font-weight:800;">${project.titre}</h3>
            <span style="font-size:0.75rem;font-family:var(--font-mono);color:var(--text-muted);">${project.relativePath}</span>
          </div>
          <button class="btn btn-secondary btn-sm btn-media-sync-single">
            🔄 Synchroniser ce projet (${images.length} images)
          </button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;">
          ${galleryThumbs}
          ${images.length > 8 ? `<span style="font-size:0.8rem;color:var(--text-muted);font-weight:700;">+ ${images.length - 8} autre(s)</span>` : ''}
        </div>
      `;

      item.querySelector('.btn-media-sync-single').addEventListener('click', async () => {
        try {
          await api.post(`/sync?slug=${project.slug}`);
          showToast(`Images de '${project.titre}' synchronisées !`, 'success');
          const updated = await api.get('/projects');
          state.projects = updated.projects || [];
          renderMediaView();
        } catch (err) {
          showToast('Erreur : ' + err.message, 'error');
        }
      });

      item.querySelectorAll('.media-thumb-zoom').forEach(thumb => {
        thumb.addEventListener('click', () => {
          openLightbox(thumb.getAttribute('data-src'), thumb.getAttribute('data-caption'));
        });
      });

      container.appendChild(item);
    });
  }

  /* ─────────────────────────────────────────────
     7. VUE AUDIT & SANTÉ
  ───────────────────────────────────────────── */
  async function loadAndRenderAudit() {
    const container = document.getElementById('audit-results-container');
    if (!container) return;
    container.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-muted);">Exécution de l\'audit en cours...</div>';

    try {
      const report = await api.get('/audit');
      container.innerHTML = '';

      const isClean = 
        report.missingJsonFiles.length === 0 &&
        report.orphanFolders.length === 0 &&
        report.zeroImageProjects.length === 0 &&
        report.missingImageFiles.length === 0;

      // Carte Bilan
      const summaryCard = document.createElement('div');
      summaryCard.className = `audit-card ${isClean ? 'status-ok' : 'status-warning'}`;
      summaryCard.innerHTML = `
        <div class="audit-card-title">
          <span>${isClean ? '✨ Diagnostic Positif : Portfolio 100% Conforme' : '⚠️ Anomalies détectées nécessitant votre attention'}</span>
        </div>
        <p style="font-size:0.88rem;color:var(--text-muted);">
          Total fiches inspectées : <strong>${report.totalInList}</strong> · Projets opérationnels : <strong>${report.validProjects}</strong>
        </p>
      `;
      container.appendChild(summaryCard);

      // Dossiers orphelins
      if (report.orphanFolders.length > 0) {
        const orphanCard = document.createElement('div');
        orphanCard.className = 'audit-card status-warning';
        orphanCard.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div class="audit-card-title">📁 Dossiers présents sur le disque mais non indexés (${report.orphanFolders.length})</div>
            <button class="btn btn-primary btn-sm" id="btn-fix-orphans">➕ Les ajouter automatiquement</button>
          </div>
          <ul class="audit-list">
            ${report.orphanFolders.map(f => `<li class="audit-item">${f}</li>`).join('')}
          </ul>
        `;
        orphanCard.querySelector('#btn-fix-orphans').addEventListener('click', async () => {
          try {
            await api.post('/audit/fix', { action: 'fix_orphans' });
            showToast('Dossiers orphelins indexés avec succès !', 'success');
            loadInitialData();
            loadAndRenderAudit();
          } catch (err) {
            showToast('Erreur : ' + err.message, 'error');
          }
        });
        container.appendChild(orphanCard);
      }

      // Fichiers manquants 404
      if (report.missingJsonFiles.length > 0) {
        const missingCard = document.createElement('div');
        missingCard.className = 'audit-card status-error';
        missingCard.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div class="audit-card-title">❌ Fiches introuvables sur le disque (${report.missingJsonFiles.length})</div>
            <button class="btn btn-danger btn-sm" id="btn-fix-missing">🧹 Nettoyer liste_projets.json</button>
          </div>
          <ul class="audit-list">
            ${report.missingJsonFiles.map(f => `<li class="audit-item" style="color:var(--accent-red);">${f}</li>`).join('')}
          </ul>
        `;
        missingCard.querySelector('#btn-fix-missing').addEventListener('click', async () => {
          try {
            await api.post('/audit/fix', { action: 'clean_missing' });
            showToast('Entrées manquantes retirées avec succès !', 'success');
            loadInitialData();
            loadAndRenderAudit();
          } catch (err) {
            showToast('Erreur : ' + err.message, 'error');
          }
        });
        container.appendChild(missingCard);
      }

      // Projets sans images
      if (report.zeroImageProjects.length > 0) {
        const zeroCard = document.createElement('div');
        zeroCard.className = 'audit-card status-warning';
        zeroCard.innerHTML = `
          <div class="audit-card-title">📷 Projets sans images associées (${report.zeroImageProjects.length})</div>
          <ul class="audit-list">
            ${report.zeroImageProjects.map(p => `<li class="audit-item">${p.title} (${p.path})</li>`).join('')}
          </ul>
        `;
        container.appendChild(zeroCard);
      }
    } catch (err) {
      container.innerHTML = `<div class="audit-card status-error">Erreur d'audit : ${err.message}</div>`;
    }
  }

  /* ─────────────────────────────────────────────
     7. VUE DOSSIER DE PRESSE & PLANCHES A4
  ───────────────────────────────────────────── */
  let currentPressKitFilter = 'all';

  function renderPressKit(filter) {
    if (filter) currentPressKitFilter = filter;
    const container = document.getElementById('presskit-preview-container');
    if (!container) return;

    let filteredProjects = state.projects || [];
    if (currentPressKitFilter !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.categorie === currentPressKitFilter);
    }

    const totalProjects = filteredProjects.length;
    const dateStr = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

    // 1. Feuille de couverture A4
    const coverSheetHtml = `
      <div class="a4-sheet">
        <div class="a4-sheet-header">
          <span class="a4-header-brand">PORTFOLIO ÉDITORIAL · SACHA GUITTER</span>
          <span class="a4-header-page">COUVERTURE / 01</span>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div style="font-family: var(--font-mono, monospace); font-size: 0.8rem; letter-spacing: 0.15em; text-transform: uppercase; color: #666666;">
            Édition Numérique & Tirages A4
          </div>
          <h1 class="a4-cover-title">DOSSIER DE PRESSE & PORTFOLIO</h1>
          <div class="a4-cover-sub">Sacha GUITTER — BUT MMI & Photographe Animalier / Créatif Visuel</div>

          <div class="a4-cover-grid">
            <div>
              <div class="a4-cover-meta-item">
                <span class="a4-cover-meta-label">Auteur & Direction Artistique</span>
                <span class="a4-cover-meta-val">Sacha GUITTER</span>
              </div>
              <div class="a4-cover-meta-item">
                <span class="a4-cover-meta-label">Formation Universitaire</span>
                <span class="a4-cover-meta-val">BUT MMI (IUT de Laval — Le Mans Université)</span>
              </div>
              <div class="a4-cover-meta-item">
                <span class="a4-cover-meta-label">Bassin Géographique</span>
                <span class="a4-cover-meta-val">Laval (53) — Sablé-sur-Sarthe (72)</span>
              </div>
            </div>

            <div>
              <div class="a4-cover-meta-item">
                <span class="a4-cover-meta-label">Contact Professionnel</span>
                <span class="a4-cover-meta-val">sachaguitterphoto@gmail.com</span>
              </div>
              <div class="a4-cover-meta-item">
                <span class="a4-cover-meta-label">Téléphone</span>
                <span class="a4-cover-meta-val">+33 7 49 61 09 90</span>
              </div>
              <div class="a4-cover-meta-item">
                <span class="a4-cover-meta-label">Index des Réalisations</span>
                <span class="a4-cover-meta-val">${totalProjects} planche(s) projet(s) sélectionnée(s)</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 1.5rem; font-size: 0.9rem; line-height: 1.6; border: 1px solid #000000; padding: 1.25rem; background: #F8F8F8;">
            <strong>Note d'intention éditoriale :</strong> Ce dossier rassemble une sélection de travaux photographiques de terrain et de réalisations graphiques, éditoriales et interactives menées dans le cadre du BUT MMI et de créations d'auteur. Conçu dans l'esprit du graphisme suisse rigoureux et de l'édition d'art A4 paysage.
          </div>
        </div>

        <div class="a4-sheet-footer">
          <span>Date d'édition : ${dateStr}</span>
          <span>Sacha Guitter · Tous droits réservés</span>
        </div>
      </div>
    `;

    // 2. Planches individuelles pour chaque projet
    const projectSheetsHtml = filteredProjects.map((p, idx) => {
      const coverUrl = p.coverImage ? `/api/image?path=${encodeURIComponent(p.coverImage)}` : '';
      const catLabel = p.categorie === 'etudiant' ? 'PROJET BUT MMI' : 'SÉRIE PHOTOGRAPHIQUE';
      const images = Array.isArray(p.images) ? p.images.slice(0, 3) : [];
      const tags = (p.tags || []).slice(0, 6);
      const comps = (p.competences || []).slice(0, 4);
      const ref = p.reflexion || {};

      return `
        <div class="a4-sheet a4-project-plate">
          <div class="a4-sheet-header">
            <span class="a4-header-brand">PLANCHE N° ${String(idx + 1).padStart(2, '0')} · ${catLabel}</span>
            <span class="a4-header-page">PAGE ${String(idx + 2).padStart(2, '0')} / ${String(totalProjects + 1).padStart(2, '0')}</span>
          </div>

          <div class="a4-project-top">
            <div>
              <h2 class="a4-project-title">${p.titre}</h2>
              <span class="a4-project-cat">${p.categorie === 'etudiant' ? 'Projet Universitaire IUT Laval' : 'Série Photographique Personnelle'} · SLUG: ${p.slug}</span>
            </div>
            ${p.lien ? `<span style="font-size: 0.72rem; border: 1px solid #000000; padding: 0.25rem 0.5rem; font-weight:700;">EN LIGNE</span>` : ''}
          </div>

          <div class="a4-project-layout">
            <div>
              ${coverUrl ? `<img src="${coverUrl}" class="a4-project-img" alt="${p.titre}">` : '<div style="height:200px;background:#EEEEEE;display:flex;align-items:center;justify-content:center;">Aucune couverture</div>'}
              
              ${images.length > 0 ? `
                <div class="a4-project-gallery">
                  ${images.map(img => `<img src="/api/image?path=${encodeURIComponent(img)}" alt="">`).join('')}
                </div>
              ` : ''}
            </div>

            <div>
              <p class="a4-project-desc">${p.description || 'Projet éditorial du portfolio de Sacha Guitter.'}</p>

              <div class="a4-project-meta-box">
                <span class="a4-cover-meta-label">Compétences & Tags</span>
                <div class="a4-badge-list">
                  ${comps.map(c => `<span class="a4-badge" style="background:#000000;color:#FFFFFF;">${c}</span>`).join('')}
                  ${tags.map(t => `<span class="a4-badge">#${t}</span>`).join('')}
                </div>
              </div>

              ${(ref.contexte || ref.reussites || ref.apprentissages) ? `
                <div style="border-left: 2px solid #000000; padding-left: 0.75rem; margin-top: 0.75rem; font-size: 0.8rem; line-height: 1.45;">
                  ${ref.contexte ? `<div style="margin-bottom:0.4rem;"><strong>Contexte :</strong> ${ref.contexte}</div>` : ''}
                  ${ref.reussites ? `<div style="margin-bottom:0.4rem;"><strong>Réussites :</strong> ${ref.reussites}</div>` : ''}
                  ${ref.apprentissages ? `<div><strong>Bilan :</strong> ${ref.apprentissages}</div>` : ''}
                </div>
              ` : ''}
            </div>
          </div>

          <div class="a4-sheet-footer">
            <span>Sacha GUITTER · Portfolio Éditorial</span>
            <span>Planche ${idx + 1} sur ${totalProjects}</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = coverSheetHtml + projectSheetsHtml;
  }

  /* ─────────────────────────────────────────────
     GESTION AVANCÉE DES SAUVEGARDES, MARROWND, BUILD & DUPLICATION
  ───────────────────────────────────────────── */
  async function loadAndRenderBackups() {
    const container = document.getElementById('backups-manager-container');
    if (!container) return;

    try {
      const res = await api.get('/backups');
      const backups = res.backups || [];
      state.backups = backups;

      if (backups.length === 0) {
        container.innerHTML = '<p style="padding:1rem;color:var(--text-muted);font-size:0.85rem;">Aucune sauvegarde archivée dans <code>json/backups/</code>.</p>';
        return;
      }

      container.innerHTML = `
        <table class="backups-table">
          <thead>
            <tr>
              <th>Nom de sauvegarde</th>
              <th>Date & Heure</th>
              <th>Projets</th>
              <th>Poids</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${backups.map(b => {
              const d = new Date(b.mtime);
              const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              return `
                <tr>
                  <td><code>${b.filename}</code></td>
                  <td>${dateStr}</td>
                  <td><strong>${b.projectCount}</strong> projet(s)</td>
                  <td>${b.sizeFormatted}</td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm btn-restore-backup" data-filename="${b.filename}" title="Restaurer cette version">Restaurer</button>
                    <button class="btn btn-danger btn-sm btn-delete-backup" data-filename="${b.filename}" title="Supprimer définitivement cette archive">🗑️</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

      container.querySelectorAll('.btn-restore-backup').forEach(btn => {
        btn.addEventListener('click', async () => {
          const fn = btn.getAttribute('data-filename');
          if (confirm(`Voulez-vous vraiment restaurer la sauvegarde '${fn}' ? Une sauvegarde automatique de l'état actuel sera d'abord créée.`)) {
            try {
              showToast('Restauration en cours...', 'info', 1500);
              await api.post('/backups/restore', { filename: fn });
              showToast(`Sauvegarde '${fn}' restaurée avec succès !`, 'success');
              await loadInitialData();
              loadAndRenderBackups();
            } catch (err) {
              showToast('Erreur de restauration : ' + err.message, 'error');
            }
          }
        });
      });

      container.querySelectorAll('.btn-delete-backup').forEach(btn => {
        btn.addEventListener('click', async () => {
          const fn = btn.getAttribute('data-filename');
          if (confirm(`Supprimer définitivement l'archive '${fn}' ?`)) {
            try {
              await api.delete(`/backups/${encodeURIComponent(fn)}`);
              showToast(`Sauvegarde supprimée.`, 'info');
              loadAndRenderBackups();
            } catch (err) {
              showToast('Erreur : ' + err.message, 'error');
            }
          }
        });
      });

    } catch (err) {
      container.innerHTML = `<p style="padding:1rem;color:var(--accent-red);font-size:0.85rem;">Erreur de chargement des sauvegardes : ${err.message}</p>`;
    }
  }

  async function uploadFilesForProject(project, files) {
    if (!files || files.length === 0) return;
    const validExts = ['.webp', '.png', '.jpg', '.jpeg', '.avif', '.gif', '.svg'];
    let count = 0;

    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExts.includes(ext)) {
        showToast(`Format non supporté ignoré : ${file.name}`, 'warning', 2500);
        continue;
      }

      showToast(`Importation de ${file.name}...`, 'info', 1200);
      try {
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const b64 = reader.result.split(',')[1];
            resolve(b64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        await api.post(`/projects/${project.categorie}/${project.slug}/upload-image`, {
          filename: file.name,
          data: base64Data
        });
        count++;
      } catch (err) {
        showToast(`Erreur sur ${file.name} : ${err.message}`, 'error', 3000);
      }
    }

    if (count > 0) {
      showToast(`${count} image(s) importée(s) avec succès !`, 'success');
      const updated = await api.get(`/projects/${project.categorie}/${project.slug}`);
      openProjectDetail(updated);
      const allProjects = await api.get('/projects');
      state.projects = allProjects.projects || [];
      updateSidebarBadges();
    }
  }

  function promptDuplicateProject(project) {
    state.duplicateTarget = project;
    const srcEl = document.getElementById('duplicate-source-title');
    if (srcEl) srcEl.textContent = `${project.titre} (${project.slug})`;
    const titleInput = document.getElementById('duplicate-input-title');
    if (titleInput) titleInput.value = `${project.titre} (Copie)`;
    const slugInput = document.getElementById('duplicate-input-slug');
    if (slugInput) slugInput.value = `${project.slug}-copie`;
    openModal('modal-duplicate');
  }

  async function executeProjectDuplication() {
    if (!state.duplicateTarget) return;
    const titleInput = document.getElementById('duplicate-input-title');
    const slugInput = document.getElementById('duplicate-input-slug');
    const newTitle = titleInput ? titleInput.value.trim() : '';
    const newSlug = slugInput ? slugInput.value.trim() : '';
    if (!newTitle || !newSlug) {
      showToast('Titre et slug requis.', 'error');
      return;
    }

    try {
      showToast('Duplication en cours...', 'info', 1500);
      const res = await api.post(`/projects/${state.duplicateTarget.categorie}/${state.duplicateTarget.slug}/duplicate`, {
        newTitle,
        newSlug
      });
      showToast(`Projet dupliqué avec succès : ${newTitle}`, 'success');
      closeModal('modal-duplicate');
      const updated = await api.get('/projects');
      state.projects = updated.projects || [];
      updateSidebarBadges();
      if (res.project) {
        openProjectDetail(res.project);
      } else {
        navigateTo('projects');
      }
    } catch (err) {
      showToast('Erreur de duplication : ' + err.message, 'error');
    }
  }

  async function openMarkdownModal(project) {
    try {
      showToast('Génération Markdown...', 'info', 1000);
      const res = await api.get(`/projects/${project.categorie}/${project.slug}/markdown`);
      state.currentMarkdown = res.markdown || '';
      const textEl = document.getElementById('markdown-export-text');
      if (textEl) textEl.value = state.currentMarkdown;
      openModal('modal-markdown');
    } catch (err) {
      showToast('Erreur de génération Markdown : ' + err.message, 'error');
    }
  }

  async function triggerBuildProject() {
    const statusBox = document.getElementById('build-status-box');
    const consoleOutput = document.getElementById('build-console-output');
    if (statusBox) {
      statusBox.className = 'build-status-box';
      statusBox.textContent = 'Compilation Vite en cours (npm run build)...';
    }
    if (consoleOutput) {
      consoleOutput.textContent = 'Démarrage du processus de compilation...\n';
    }
    openModal('modal-build');

    try {
      const res = await api.post('/build');
      if (consoleOutput) consoleOutput.textContent = res.output || '(Aucune sortie)';
      if (res.success) {
        if (statusBox) {
          statusBox.className = 'build-status-box is-success';
          statusBox.textContent = `✔ Compilation réussie en ${res.elapsedMs} ms ! Le dossier dist/ est à jour.`;
        }
        showToast(`Compilation réussie en ${res.elapsedMs} ms !`, 'success');
      } else {
        if (statusBox) {
          statusBox.className = 'build-status-box is-error';
          statusBox.textContent = '❌ Échec de compilation. Consultez la sortie console ci-dessous.';
        }
        showToast('Erreur lors du build.', 'error');
      }
    } catch (err) {
      if (statusBox) {
        statusBox.className = 'build-status-box is-error';
        statusBox.textContent = '❌ Erreur de communication : ' + err.message;
      }
      showToast('Erreur : ' + err.message, 'error');
    }
  }

  /* ─────────────────────────────────────────────
     8. VUE PARAMÈTRES
  ───────────────────────────────────────────── */
  function renderSettingsView() {
    const inputPath = document.getElementById('settings-input-path');
    if (inputPath) inputPath.value = state.portfolioDir;
    loadAndRenderBackups();
    updateSettingsAuthUI();
  }

  /* ─────────────────────────────────────────────
     SUPPRESSION D'UN PROJET
  ───────────────────────────────────────────── */
  function promptDeleteProject(project) {
    state.deleteTarget = project;
    const titleEl = document.getElementById('delete-modal-project-title');
    if (titleEl) titleEl.textContent = `${project.titre} (${project.slug})`;
    openModal('modal-delete');
  }

  async function executeProjectDeletion() {
    if (!state.deleteTarget) return;

    const mode = document.querySelector('input[name="delete-mode-radio"]:checked')?.value || 'unindex';
    const { categorie, slug, titre } = state.deleteTarget;

    try {
      await api.delete(`/projects/${categorie}/${slug}?mode=${mode}`);
      showToast(`Projet '${titre}' supprimé avec succès.`, 'success');
      closeModal('modal-delete');

      // Si nous étions sur la page détail du projet supprimé, retour aux projets
      if (state.activeView === 'project-detail') {
        navigateTo('projects');
      }

      // Recharger les données
      const updated = await api.get('/projects');
      state.projects = updated.projects || [];
      updateSidebarBadges();
      renderProjectsList();
    } catch (err) {
      showToast('Erreur lors de la suppression : ' + err.message, 'error');
    }
  }

  /* ─────────────────────────────────────────────
     LIGHTBOX
  ───────────────────────────────────────────── */
  function openLightbox(src, caption) {
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    if (img) img.src = src;
    if (cap) cap.textContent = caption || '';
    openModal('modal-lightbox');
  }

  /* ─────────────────────────────────────────────
     ÉVÉNEMENTS & INITIALISATION
  ───────────────────────────────────────────── */
  function initEvents() {
    // Navigation router hashchange
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      if (hash !== state.activeView) {
        navigateTo(hash);
      }
    });

    // Gestion responsive de la sidebar (tiroir mobile + repli desktop)
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');

    const closeMobileSidebar = () => {
      if (sidebar) sidebar.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-active');
    };

    const toggleSidebar = () => {
      if (!sidebar) return;
      if (window.innerWidth <= 900) {
        const isOpen = sidebar.classList.toggle('is-open');
        if (backdrop) backdrop.classList.toggle('is-active', isOpen);
      } else {
        sidebar.classList.toggle('is-collapsed');
      }
    };

    if (btnToggleSidebar) btnToggleSidebar.addEventListener('click', toggleSidebar);
    if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeMobileSidebar);
    if (backdrop) backdrop.addEventListener('click', closeMobileSidebar);

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        closeMobileSidebar();
      }
    });

    // Liens sidebar avec fermeture automatique sur petit écran
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        navigateTo(view);
        if (window.innerWidth <= 900) {
          closeMobileSidebar();
        }
      });
    });

    // Basculer thème clair/sombre
    const btnTheme = document.getElementById('btn-toggle-theme');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        const isDark = document.body.classList.contains('theme-dark');
        document.body.className = isDark ? 'theme-light' : 'theme-dark';
        localStorage.setItem('pm_theme', isDark ? 'theme-light' : 'theme-dark');
      });
    }

    // Restaurer le thème mémorisé
    const savedTheme = localStorage.getItem('pm_theme') || 'theme-light';
    document.body.className = savedTheme;

    // Synchronisation rapide globale
    const runQuickSync = async () => {
      try {
        showToast('Synchronisation des images en cours...', 'info', 2000);
        const res = await api.post('/sync');
        showToast(`Synchronisation terminée ! ${res.count || 0} projet(s) actualisé(s).`, 'success');
        const updated = await api.get('/projects');
        state.projects = updated.projects || [];
        updateSidebarBadges();
        if (state.activeView === 'projects') renderProjectsList();
        if (state.activeView === 'dashboard') renderDashboard();
      } catch (err) {
        showToast('Erreur : ' + err.message, 'error');
      }
    };

    document.getElementById('btn-quick-sync')?.addEventListener('click', runQuickSync);
    document.getElementById('btn-dashboard-sync')?.addEventListener('click', runQuickSync);
    document.getElementById('qa-sync-media')?.addEventListener('click', runQuickSync);
    document.getElementById('btn-media-sync-all')?.addEventListener('click', runQuickSync);

    // Boutons "Nouveau projet"
    const goNewProject = () => navigateTo('new');
    document.getElementById('btn-header-new-project')?.addEventListener('click', goNewProject);
    document.getElementById('btn-dashboard-new')?.addEventListener('click', goNewProject);
    document.getElementById('btn-projects-new')?.addEventListener('click', goNewProject);
    document.getElementById('qa-new-project')?.addEventListener('click', goNewProject);

    // Boutons Header (Build & Site)
    document.getElementById('btn-header-build')?.addEventListener('click', triggerBuildProject);
    document.getElementById('btn-header-open-site')?.addEventListener('click', () => {
      api.post('/open-site');
      showToast('Ouverture du portfolio dans votre navigateur...', 'info', 2000);
    });

    // Actions rapides dashboard
    document.getElementById('qa-audit')?.addEventListener('click', () => navigateTo('audit'));
    document.getElementById('qa-backup')?.addEventListener('click', async () => {
      try {
        const res = await api.post('/backup');
        showToast(`Sauvegarde créée : ${res.backupFile.split(/[\\/]/).pop()}`, 'success');
      } catch (err) {
        showToast('Erreur de sauvegarde : ' + err.message, 'error');
      }
    });

    // Recherche globale dans le header
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (state.activeView !== 'projects') {
          navigateTo('projects');
        } else {
          renderProjectsList();
        }
      });
    }

    // Onglets de filtre par catégorie
    document.querySelectorAll('#category-filter-tabs .filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#category-filter-tabs .filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeCategory = tab.getAttribute('data-filter');
        renderProjectsList();
      });
    });

    // Recherche mini dans la toolbar
    const miniSearch = document.getElementById('projects-search-input');
    if (miniSearch) {
      miniSearch.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderProjectsList();
      });
    }

    // Filtre statut d'avancement
    const statusSelect = document.getElementById('projects-status-select');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        state.statusFilter = e.target.value;
        renderProjectsList();
      });
    }

    // Tri
    const sortSelect = document.getElementById('projects-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderProjectsList();
      });
    }

    // Bascule grille / tableau
    const btnGrid = document.getElementById('btn-mode-grid');
    const btnTable = document.getElementById('btn-mode-table');
    if (btnGrid && btnTable) {
      btnGrid.addEventListener('click', () => {
        btnGrid.classList.add('active');
        btnTable.classList.remove('active');
        state.displayMode = 'grid';
        renderProjectsList();
      });

      btnTable.addEventListener('click', () => {
        btnTable.classList.add('active');
        btnGrid.classList.remove('active');
        state.displayMode = 'table';
        renderProjectsList();
      });
    }

    // Réinitialiser les filtres (état vide)
    document.getElementById('btn-empty-reset')?.addEventListener('click', () => {
      state.searchQuery = '';
      state.activeCategory = 'all';
      if (globalSearch) globalSearch.value = '';
      if (miniSearch) miniSearch.value = '';
      document.querySelectorAll('#category-filter-tabs .filter-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-filter') === 'all');
      });
      renderProjectsList();
    });

    // Formulaire : auto-génération du slug
    const inputTitre = document.getElementById('form-input-titre');
    const inputSlug = document.getElementById('form-input-slug');
    if (inputTitre && inputSlug) {
      inputTitre.addEventListener('input', () => {
        const isEditing = !!document.getElementById('form-edit-original-slug').value;
        if (!isEditing || !inputSlug.value) {
          inputSlug.value = inputTitre.value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        }
      });
    }

    // Formulaire : bouton ajouter étape
    document.getElementById('btn-form-add-step')?.addEventListener('click', () => addStepToForm());

    // Formulaire : Enregistrer & Annuler
    document.getElementById('btn-form-save')?.addEventListener('click', saveProjectForm);
    document.getElementById('btn-form-cancel')?.addEventListener('click', () => navigateTo('projects'));

    // Modale Suppression
    document.getElementById('btn-confirm-delete')?.addEventListener('click', executeProjectDeletion);

    // Modale Duplication
    const dupTitle = document.getElementById('duplicate-input-title');
    const dupSlug = document.getElementById('duplicate-input-slug');
    if (dupTitle && dupSlug) {
      dupTitle.addEventListener('input', () => {
        dupSlug.value = dupTitle.value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      });
    }
    document.getElementById('btn-confirm-duplicate')?.addEventListener('click', executeProjectDuplication);

    // Modale Export Markdown
    document.getElementById('btn-copy-markdown')?.addEventListener('click', () => {
      const textEl = document.getElementById('markdown-export-text');
      if (textEl && textEl.value) {
        navigator.clipboard.writeText(textEl.value).then(() => {
          showToast('Fiche Markdown copiée dans le presse-papiers !', 'success');
        }).catch(err => {
          showToast('Impossible de copier automatiquement : ' + err.message, 'error');
        });
      }
    });

    document.getElementById('btn-download-markdown')?.addEventListener('click', () => {
      const text = (document.getElementById('markdown-export-text')?.value) || state.currentMarkdown;
      if (!text) return;
      const slug = (state.activeProject && state.activeProject.slug) ? state.activeProject.slug : 'projet';
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-rapport-mmi.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Fichier Markdown téléchargé !', 'success');
    });

    // Bouton rafraîchir l'audit
    document.getElementById('btn-audit-refresh')?.addEventListener('click', () => {
      loadAndRenderAudit();
      showToast('Audit actualisé !', 'info', 1500);
    });

    // Boutons Dossier de Presse & Impression A4
    document.getElementById('btn-dashboard-presskit')?.addEventListener('click', () => navigateTo('presskit'));
    document.getElementById('btn-presskit-print')?.addEventListener('click', () => window.print());
    document.getElementById('btn-presskit-refresh')?.addEventListener('click', () => {
      renderPressKit(currentPressKitFilter);
      showToast('Dossier de presse actualisé !', 'info', 1500);
    });

    // Filtres du dossier de presse
    document.querySelectorAll('#presskit-filter-pills .presskit-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#presskit-filter-pills .presskit-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-pk-filter');
        renderPressKit(filter);
      });
    });

    // Modale Changement de Dossier
    const headerDirBadge = document.getElementById('header-dir-badge');
    const btnChangePath = document.getElementById('btn-settings-change-path');
    const modalInputPath = document.getElementById('modal-input-portfolio-path');
    const openChangeDirModal = () => {
      const errorEl = document.getElementById('modal-path-error');
      if (errorEl) errorEl.style.display = 'none';
      if (modalInputPath) modalInputPath.value = state.portfolioDir;
      openModal('modal-change-dir');
    };
    if (headerDirBadge) headerDirBadge.addEventListener('click', openChangeDirModal);
    if (btnChangePath) btnChangePath.addEventListener('click', openChangeDirModal);

    document.getElementById('btn-confirm-change-dir')?.addEventListener('click', async () => {
      const newPath = modalInputPath ? modalInputPath.value.trim() : '';
      const errorEl = document.getElementById('modal-path-error');
      if (!newPath) return;

      try {
        const res = await api.post('/switch-portfolio', { path: newPath });
        showToast('Dossier de portfolio changé avec succès !', 'success');
        closeModal('modal-change-dir');
        loadInitialData();
      } catch (err) {
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.textContent = err.message;
        }
      }
    });

    // Paramètres : Ouvrir dossier portfolio
    document.getElementById('btn-settings-open-dir')?.addEventListener('click', async () => {
      try {
        await api.post('/open-portfolio-dir');
        showToast('Dossier portfolio ouvert dans l\'Explorateur Windows.', 'info', 1500);
      } catch (err) {
        showToast('Erreur : ' + err.message, 'error');
      }
    });

    // Paramètres : Sauvegarde manuelle
    document.getElementById('btn-settings-create-backup')?.addEventListener('click', async () => {
      const fb = document.getElementById('backup-feedback');
      try {
        const res = await api.post('/backup');
        const filename = res.backupFile ? res.backupFile.split(/[\\/]/).pop() : 'sauvegarde';
        if (fb) fb.innerHTML = `<span style="color:var(--accent-green);font-size:0.85rem;">✔ Sauvegarde créée : ${filename}</span>`;
        showToast('Sauvegarde effectuée !', 'success');
        loadAndRenderBackups();
      } catch (err) {
        if (fb) fb.innerHTML = `<span style="color:var(--accent-red);font-size:0.85rem;">❌ ${err.message}</span>`;
      }
    });

    // Paramètres : Choix du thème
    document.querySelectorAll('input[name="setting-theme"]').forEach(r => {
      r.addEventListener('change', (e) => {
        document.body.className = e.target.value;
        localStorage.setItem('pm_theme', e.target.value);
      });
    });

    // Paramètres : Fermer l'application
    document.getElementById('btn-settings-shutdown')?.addEventListener('click', async () => {
      if (confirm('Voulez-vous vraiment fermer Project Manager ?')) {
        await api.post('/shutdown').catch(() => {});
        window.close();
      }
    });

    // Boutons de fermeture des modales
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });

    // Clic sur l'arrière-plan sombre d'une modale pour la fermer
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          closeAllModals();
        }
      });
    });

    // Raccourcis clavier universels
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigateTo('new');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && state.activeView === 'new') {
        e.preventDefault();
        saveProjectForm();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        const sidebar = document.getElementById('app-sidebar');
        if (sidebar) sidebar.classList.toggle('is-collapsed');
      }
    });
  }

  /* ─────────────────────────────────────────────
     GESTION DE L'AUTHENTIFICATION & SÉCURITÉ
  ───────────────────────────────────────────── */
  let isPwdSetupMode = false;

  async function checkAuthStatus() {
    try {
      const res = await fetch('/api/auth/status', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Status auth error');
      const data = await res.json();
      state.auth.hasPassword = Boolean(data.hasPassword);
      state.auth.authenticated = Boolean(data.authenticated);

      // Si aucun mot de passe n'est configuré : accès direct et libre immédiat !
      if (!state.auth.hasPassword) {
        state.auth.authenticated = true;
        hideAuthScreen();
        updateSettingsAuthUI();
        return true;
      }

      // Si authentifié (token valide en mémoire/stockage) : accès direct
      if (state.auth.authenticated) {
        hideAuthScreen();
        updateSettingsAuthUI();
        return true;
      }

      // Sinon, afficher l'écran d'accès simplifié
      showAuthScreen('login');
      return false;
    } catch (err) {
      console.warn('Vérification auth :', err.message);
      hideAuthScreen();
      return true;
    }
  }

  function showAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    const appShell = document.getElementById('app-shell');
    if (!authScreen) return;

    authScreen.classList.remove('is-hidden');
    if (appShell) appShell.style.display = 'none';

    const errorBox = document.getElementById('auth-error-msg');
    if (errorBox) {
      errorBox.textContent = '';
      errorBox.classList.add('is-hidden');
    }

    const pwdLogin = document.getElementById('auth-password-input');
    if (pwdLogin) {
      pwdLogin.value = '';
      setTimeout(() => pwdLogin.focus(), 100);
    }
  }

  function hideAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    const appShell = document.getElementById('app-shell');
    if (authScreen) authScreen.classList.add('is-hidden');
    if (appShell) appShell.style.display = 'flex';
  }

  async function handleAuthFormSubmit(e) {
    e.preventDefault();
    const errorBox = document.getElementById('auth-error-msg');
    const card = document.querySelector('.auth-card');
    const submitBtn = document.getElementById('auth-btn-submit');
    const loginInput = document.getElementById('auth-password-input');
    const pwd = loginInput ? loginInput.value.trim() : '';

    const showError = (msg) => {
      if (errorBox) {
        errorBox.textContent = msg;
        errorBox.classList.remove('is-hidden');
      }
      if (card) {
        card.classList.remove('is-shaking');
        void card.offsetWidth;
        card.classList.add('is-shaking');
        setTimeout(() => card.classList.remove('is-shaking'), 450);
      }
      loginInput?.focus();
    };

    if (errorBox) errorBox.classList.add('is-hidden');

    if (!pwd) {
      showError('Saisissez votre mot de passe');
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, rememberMe: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Mot de passe incorrect');

      if (data.token) {
        localStorage.setItem('pm_token', data.token);
      }

      state.auth.authenticated = true;
      hideAuthScreen();
      updateSettingsAuthUI();
      showToast('Connexion réussie', 'success');
      loadInitialData();
    } catch (err) {
      showError(err.message);
      loginInput?.select();
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  async function logoutAndLock() {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('pm_token');
    sessionStorage.removeItem('pm_token');
    state.auth.authenticated = false;

    if (state.auth.hasPassword) {
      showAuthScreen('login');
      showToast('Session verrouillée', 'info');
    } else {
      showToast('Accès libre : aucun mot de passe actif', 'info');
    }
  }

  function updateSettingsAuthUI() {
    const statusDesc = document.getElementById('settings-auth-status-desc');
    const badge = document.getElementById('settings-auth-badge');
    const btnSetup = document.getElementById('btn-settings-setup-pwd');
    const btnChange = document.getElementById('btn-settings-change-pwd');
    const btnDisable = document.getElementById('btn-settings-disable-pwd');

    if (state.auth.hasPassword) {
      if (statusDesc) statusDesc.textContent = 'Accès au gestionnaire protégé par mot de passe (modifiable dans .pm-auth.json ou ci-dessous).';
      if (badge) {
        badge.textContent = 'Protégé';
        badge.className = 'badge';
        badge.style.backgroundColor = '#059669';
        badge.style.color = '#FFFFFF';
      }
      if (btnSetup) btnSetup.style.display = 'none';
      if (btnChange) btnChange.style.display = 'inline-flex';
      if (btnDisable) btnDisable.style.display = 'inline-flex';
    } else {
      if (statusDesc) statusDesc.textContent = 'Aucun mot de passe actif. L\'accès est 100% libre sur cette machine.';
      if (badge) {
        badge.textContent = 'Accès libre';
        badge.className = 'badge';
        badge.style.backgroundColor = '#2563EB';
        badge.style.color = '#FFFFFF';
      }
      if (btnSetup) btnSetup.style.display = 'inline-flex';
      if (btnChange) btnChange.style.display = 'none';
      if (btnDisable) btnDisable.style.display = 'none';
    }
  }

  function openChangePwdModal(isSetup = false) {
    isPwdSetupMode = isSetup;
    const modalTitle = document.querySelector('#modal-change-pwd .modal-title');
    const inputNew = document.getElementById('pwd-new');
    const inputConfirm = document.getElementById('pwd-confirm');
    const errorEl = document.getElementById('pwd-change-error');

    if (errorEl) errorEl.style.display = 'none';
    if (inputNew) inputNew.value = '';
    if (inputConfirm) inputConfirm.value = '';

    if (modalTitle) {
      modalTitle.textContent = isSetup ? 'Définir un code d\'accès' : 'Modifier le code d\'accès';
    }
    openModal('modal-change-pwd');
    setTimeout(() => inputNew?.focus(), 100);
  }

  function openDisablePwdModal() {
    const errorEl = document.getElementById('pwd-disable-error');
    if (errorEl) errorEl.style.display = 'none';
    openModal('modal-disable-pwd');
  }

  async function handleConfirmChangePwd() {
    const errorEl = document.getElementById('pwd-change-error');
    const inputNew = document.getElementById('pwd-new');
    const inputConfirm = document.getElementById('pwd-confirm');

    const newPwd = inputNew?.value || '';
    const confirmPwd = inputConfirm?.value || '';

    const showError = (msg) => {
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
      }
    };

    if (!newPwd) {
      showError('Veuillez renseigner un code.');
      inputNew?.focus();
      return;
    }
    if (newPwd !== confirmPwd) {
      showError('Les deux saisies ne correspondent pas.');
      inputConfirm?.focus();
      return;
    }

    try {
      if (isPwdSetupMode) {
        const res = await api.post('/auth/setup', { password: newPwd });
        if (res.token) {
          localStorage.setItem('pm_token', res.token);
        }
        state.auth.hasPassword = true;
        showToast('Code d\'accès activé avec succès !', 'success');
      } else {
        await api.post('/auth/change-password', {
          newPassword: newPwd
        });
        showToast('Code d\'accès modifié avec succès !', 'success');
      }
      closeModal('modal-change-pwd');
      updateSettingsAuthUI();
    } catch (err) {
      showError(err.message);
    }
  }

  async function handleConfirmDisablePwd() {
    try {
      await api.post('/auth/remove-password', {});
      state.auth.hasPassword = false;
      closeModal('modal-disable-pwd');
      updateSettingsAuthUI();
      showToast('Protection par mot de passe désactivée. Accès libre !', 'info');
    } catch (err) {
      const errorEl = document.getElementById('pwd-disable-error');
      if (errorEl) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
      }
    }
  }

  function initAuthEvents() {
    // Bouton de déconnexion / verrouillage du header
    document.getElementById('btn-header-lock')?.addEventListener('click', logoutAndLock);

    // Formulaire d'authentification principal (case unique)
    document.getElementById('auth-form')?.addEventListener('submit', handleAuthFormSubmit);

    // Basculer l'affichage du mot de passe dans les modales
    document.querySelectorAll('.btn-toggle-visibility').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = targetId ? document.getElementById(targetId) : btn.parentElement?.querySelector('input');
        if (input) {
          const isPassword = input.getAttribute('type') === 'password';
          input.setAttribute('type', isPassword ? 'text' : 'password');
          btn.textContent = isPassword ? '🙈' : '👁️';
        }
      });
    });

    // Paramètres : Gestion de sécurité
    document.getElementById('btn-settings-setup-pwd')?.addEventListener('click', () => openChangePwdModal(true));
    document.getElementById('btn-settings-change-pwd')?.addEventListener('click', () => openChangePwdModal(false));
    document.getElementById('btn-settings-disable-pwd')?.addEventListener('click', openDisablePwdModal);
    document.getElementById('btn-confirm-change-pwd')?.addEventListener('click', handleConfirmChangePwd);
    document.getElementById('btn-confirm-disable-pwd')?.addEventListener('click', handleConfirmDisablePwd);
  }

  // Démarrage sécurisé de l'application (gère le cas où le DOM est déjà prêt)
  async function startApplication() {
    initEvents();
    initAuthEvents();

    const canProceed = await checkAuthStatus();
    if (canProceed) {
      loadInitialData();
    }

    // Heartbeat périodique pour maintenir le serveur actif
    setInterval(() => {
      fetch('/api/heartbeat', { method: 'POST' }).catch(() => {});
    }, 3000);

    // Réveil immédiat si l'onglet redevient actif après un changement d'onglet
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        fetch('/api/heartbeat', { method: 'POST' }).catch(() => {});
      }
    });

    // Notification de fermeture au serveur
    window.addEventListener('beforeunload', () => {
      try {
        navigator.sendBeacon('/api/shutdown');
      } catch {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApplication);
  } else {
    startApplication();
  }
})();
