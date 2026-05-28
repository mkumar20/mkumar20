// Global State Store
const state = {
  backlog: [],
  projects: [],
  templates: [],
  activeStatusFilter: 'all',
  activeCategoryFilter: 'all',
  searchQuery: '',
  activeModalTab: 'idea' // 'idea' or 'project'
};

// DOM Query Bindings
const DOM = {
  // Stats
  activeCount: document.getElementById('stat-active-count'),
  backlogCount: document.getElementById('stat-backlog-count'),
  templateCount: document.getElementById('stat-template-count'),

  // Filters
  searchInput: document.getElementById('search-input'),
  categoryFilter: document.getElementById('category-filter'),
  statusFilterTags: document.getElementById('status-filter-tags'),
  templateList: document.getElementById('template-list-container'),

  // Content Containers
  projectsGrid: document.getElementById('active-projects-grid'),
  backlogGrid: document.getElementById('backlog-grid'),

  // Actions
  refreshBtn: document.getElementById('refresh-btn'),
  openCreatorBtn: document.getElementById('open-creator-btn'),
  closeCreatorX: document.getElementById('close-creator-btn-x'),
  creatorModal: document.getElementById('creator-modal'),

  // Drawer
  specDrawer: document.getElementById('spec-drawer'),
  drawerTitle: document.getElementById('drawer-title'),
  drawerContent: document.getElementById('drawer-markdown-content'),
  closeDrawerBtn: document.getElementById('close-drawer-btn'),

  // Modal Forms
  tabIdea: document.getElementById('tab-idea'),
  tabProject: document.getElementById('tab-project'),
  createIdeaForm: document.getElementById('create-idea-form'),
  createProjectForm: document.getElementById('create-project-form'),
  projectTemplateSelect: document.getElementById('project-template'),
  cancelIdeaBtn: document.getElementById('cancel-idea-btn'),
  cancelProjectBtn: document.getElementById('cancel-project-btn')
};

// Core Fetch API Wrapper
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Server request failed');
    }
    return data;
  } catch (err) {
    createToast(`❌ Error: ${err.message}`);
    console.error(err);
    throw err;
  }
}

// Initializer
async function init() {
  setupEventListeners();
  await loadDashboardData();
  createToast('✨ Welcome back! Sandbox dashboard ready.');
}

// Fetch Master Portfolio Data
async function loadDashboardData() {
  try {
    const data = await apiRequest('/api/projects');
    
    state.backlog = data.backlog || [];
    state.projects = data.projects || [];
    state.templates = data.templates || [];

    // Populate template forms select options
    populateTemplateDropdowns();

    // Render Stats
    renderStats();

    // Render Lists
    renderPortfolio();
    renderTemplatesList();
  } catch (err) {
    console.error('Failed to load portfolio dashboard data', err);
  }
}

// Stats Renderer
function renderStats() {
  DOM.activeCount.textContent = state.projects.length;
  DOM.backlogCount.textContent = state.backlog.length;
  DOM.templateCount.textContent = state.templates.length;
}

// Dynamic Template dropdown filler
function populateTemplateDropdowns() {
  if (DOM.projectTemplateSelect) {
    DOM.projectTemplateSelect.innerHTML = state.templates.map(
      t => `<option value="${t}">${formatTemplateName(t)}</option>`
    ).join('');
  }
}

// Format folder templates name nicely (e.g. vanilla-web-app -> Vanilla Web App)
function formatTemplateName(name) {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Templates list widget in sidebar
function renderTemplatesList() {
  if (!DOM.templateList) return;
  if (state.templates.length === 0) {
    DOM.templateList.innerHTML = '<li class="loading-item">No templates found in templates/</li>';
    return;
  }

  const icons = {
    'vanilla-web-app': '🚀',
    'node-backend': '🔌',
    'chrome-extension': '🧩'
  };

  DOM.templateList.innerHTML = state.templates.map(t => `
    <li class="template-item">
      <span class="t-icon">${icons[t] || '🧬'}</span>
      <span>${formatTemplateName(t)}</span>
    </li>
  `).join('');
}

// Render dynamic portfolio based on filters and search queries
function renderPortfolio() {
  // Filter backlog list
  const filteredBacklog = state.backlog.filter(item => matchFilters(item));
  // Filter active projects
  const filteredProjects = state.projects.filter(item => matchFilters(item));

  // 1. Render Active Projects Grid
  if (filteredProjects.length === 0) {
    DOM.projectsGrid.innerHTML = `<div class="empty-state">No matching active projects found.</div>`;
  } else {
    DOM.projectsGrid.innerHTML = filteredProjects.map(proj => {
      const tagsHtml = proj.tags && proj.tags.length > 0 
        ? `<div class="tech-tags">${proj.tags.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>`
        : '';
        
      return `
        <article class="project-card">
          <div class="card-top">
            <div class="card-badge-row">
              <span class="cat-badge">${proj.category}</span>
              <span class="status-badge inprogress">⚡ In Progress</span>
            </div>
            <h3>${proj.title}</h3>
            <p class="pitch">Directory: projects/${proj.name}</p>
            ${tagsHtml}
          </div>
          <div class="card-actions">
            ${proj.hasReadme ? `<button class="btn btn-secondary btn-sm" onclick="viewSpec('project', '${proj.name}')">📖 View README</button>` : ''}
            <a href="file:///Users/mohit/Desktop/AntiGravityExplore/projects/${proj.name}" class="btn-link">Open Folder &rarr;</a>
          </div>
        </article>
      `;
    }).join('');
  }

  // 2. Render Backlog Grid
  if (filteredBacklog.length === 0) {
    DOM.backlogGrid.innerHTML = `<div class="empty-state">No matching backlog ideas found.</div>`;
  } else {
    DOM.backlogGrid.innerHTML = filteredBacklog.map(idea => {
      const tagsHtml = idea.tags && idea.tags.length > 0 
        ? `<div class="tech-tags">${idea.tags.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>`
        : '';

      const statusClass = idea.status.toLowerCase().replace(/\s+/g, '');
      const statusEmoji = idea.status === 'Idea' ? '💡' : idea.status === 'Paused' ? '⏸️' : '✅';

      return `
        <article class="project-card">
          <div class="card-top">
            <div class="card-badge-row">
              <span class="cat-badge">${idea.category}</span>
              <span class="status-badge ${statusClass}">${statusEmoji} ${idea.status}</span>
            </div>
            <h3>${idea.title}</h3>
            <p class="pitch">Created: ${idea.created || 'N/A'}</p>
            ${tagsHtml}
          </div>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" onclick="viewSpec('backlog', '${idea.filename}')">💡 View Spec</button>
            <button class="btn btn-secondary btn-sm" onclick="promptLaunch('${idea.title}')">🚀 Scaffold</button>
          </div>
        </article>
      `;
    }).join('');
  }
}

// Matching filters criteria helper
function matchFilters(item) {
  // Title matching query
  const title = (item.title || item.name || '').toLowerCase();
  if (state.searchQuery && !title.includes(state.searchQuery)) return false;

  // Category matching
  if (state.activeCategoryFilter !== 'all' && item.category !== state.activeCategoryFilter) return false;

  // Status matching
  if (state.activeStatusFilter !== 'all') {
    // Projects folder are implicitly In Progress or Completed, backlog matches metadata
    const itemStatus = item.status || 'In Progress';
    if (itemStatus !== state.activeStatusFilter) return false;
  }

  return true;
}

// Drawer: Fetch & display Markdown spec sheet
window.viewSpec = async function(type, name) {
  try {
    DOM.drawerTitle.textContent = `Rendering Specification...`;
    DOM.drawerContent.innerHTML = `<div class="loading-item">Fetching specifications from file...</div>`;
    
    // Slide Drawer out
    DOM.specDrawer.classList.add('active');

    const data = await apiRequest(`/api/content?type=${type}&name=${encodeURIComponent(name)}`);
    
    DOM.drawerTitle.textContent = type === 'backlog' ? `💡 Spec: ${name.replace('.md', '')}` : `🏗️ Project: ${name}`;
    
    // Parse Markdown using marked.js
    if (window.marked) {
      DOM.drawerContent.innerHTML = marked.parse(data.content);
    } else {
      DOM.drawerContent.innerHTML = `<pre>${data.content}</pre>`;
    }
  } catch (err) {
    DOM.drawerContent.innerHTML = `<div class="empty-state">Failed to render specifications file. ${err.message}</div>`;
  }
};

// Toggle Modal Dialog Creator
function toggleCreatorModal(show = true) {
  if (show) {
    DOM.creatorModal.classList.add('active');
  } else {
    DOM.creatorModal.classList.remove('active');
    DOM.createIdeaForm.reset();
    DOM.createProjectForm.reset();
  }
}

// Switch Creation Tabs
function switchModalTab(tab) {
  state.activeModalTab = tab;
  if (tab === 'idea') {
    DOM.tabIdea.classList.add('active');
    DOM.tabProject.classList.remove('active');
    DOM.createIdeaForm.classList.add('active');
    DOM.createProjectForm.classList.remove('active');
  } else {
    DOM.tabIdea.classList.remove('active');
    DOM.tabProject.classList.add('active');
    DOM.createIdeaForm.classList.remove('active');
    DOM.createProjectForm.classList.add('active');
  }
}

// Open Scaffold template from idea trigger shortcut
window.promptLaunch = function(ideaTitle) {
  toggleCreatorModal(true);
  switchModalTab('project');
  
  // Prefill project title with a URL-safe folder format
  const folderFormat = ideaTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const nameInput = document.getElementById('project-name');
  if (nameInput) {
    nameInput.value = folderFormat;
  }
};

// Dynamic Interactive Toast alerts
function createToast(message) {
  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    color: '#fff',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    boxShadow: '0 8px 30px rgba(139, 92, 246, 0.2)',
    backdropFilter: 'blur(10px)',
    padding: '0.8rem 1.6rem',
    borderRadius: '12px',
    zIndex: 9999,
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.9rem',
    fontWeight: '600',
    opacity: '0',
    transform: 'translateY(20px)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Event bindings
function setupEventListeners() {
  // Search & Filters inputs
  DOM.searchInput.addEventListener('keyup', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderPortfolio();
  });

  DOM.categoryFilter.addEventListener('change', (e) => {
    state.activeCategoryFilter = e.target.value;
    renderPortfolio();
  });

  // Status tag filters list click
  DOM.statusFilterTags.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-tag');
    if (!btn) return;

    // Toggle active state styling
    DOM.statusFilterTags.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    state.activeStatusFilter = btn.dataset.status;
    renderPortfolio();
  });

  // Refresh
  DOM.refreshBtn.addEventListener('click', async () => {
    createToast('⏳ Syncing directory status...');
    await loadDashboardData();
    createToast('✅ Project synchronization complete!');
  });

  // Creator Modal Open/Close
  DOM.openCreatorBtn.addEventListener('click', () => toggleCreatorModal(true));
  DOM.closeCreatorX.addEventListener('click', () => toggleCreatorModal(false));
  
  DOM.tabIdea.addEventListener('click', () => switchModalTab('idea'));
  DOM.tabProject.addEventListener('click', () => switchModalTab('project'));
  
  DOM.cancelIdeaBtn.addEventListener('click', () => toggleCreatorModal(false));
  DOM.cancelProjectBtn.addEventListener('click', () => toggleCreatorModal(false));

  // Drawer Close
  DOM.closeDrawerBtn.addEventListener('click', () => {
    DOM.specDrawer.classList.remove('active');
  });

  // Overlay click close helpers
  window.addEventListener('click', (e) => {
    if (e.target === DOM.creatorModal) toggleCreatorModal(false);
    if (e.target === DOM.specDrawer) DOM.specDrawer.classList.remove('active');
  });

  // Submit Forms Handlers
  DOM.createIdeaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('idea-title').value.trim();
    const category = document.getElementById('idea-category').value;
    const status = document.getElementById('idea-status').value;
    const tagsRaw = document.getElementById('idea-tags').value;
    const pitch = document.getElementById('idea-pitch').value.trim();

    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

    try {
      await apiRequest('/api/backlog', {
        method: 'POST',
        body: JSON.stringify({ title, status, category, tags, pitch })
      });

      createToast(`💡 Idea '${title}' successfully drafted in backlog/!`);
      toggleCreatorModal(false);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  });

  DOM.createProjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('project-name').value.trim();
    const template = DOM.projectTemplateSelect.value;

    try {
      const data = await apiRequest('/api/projects/create', {
        method: 'POST',
        body: JSON.stringify({ name, template })
      });

      createToast(`🚀 Project bootstrapped successfully inside projects/${data.folderName}!`);
      toggleCreatorModal(false);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  });
}

// Start the Dashboard Client
document.addEventListener('DOMContentLoaded', init);
