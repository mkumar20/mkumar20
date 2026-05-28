// State Management
const state = {
  counter: 0,
  theme: localStorage.getItem('theme') || 'dark'
};

// DOM Query Selectors
const DOM = {
  themeToggle: document.getElementById('theme-toggle'),
  btnAction: document.getElementById('btn-action'),
  counterVal: document.getElementById('counter-value'),
  counterDec: document.getElementById('counter-dec'),
  counterInc: document.getElementById('counter-inc')
};

// Initialize Application
function init() {
  applyTheme(state.theme);
  setupEventListeners();
  renderCounter();
}

// Theme Handling
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  if (DOM.themeToggle) {
    DOM.themeToggle.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(state.theme);
  createToast(`Theme switched to ${state.theme} mode!`);
}

// Counter Logic
function renderCounter() {
  if (DOM.counterVal) {
    DOM.counterVal.textContent = state.counter;
    
    // Quick micro-animation when value changes
    DOM.counterVal.style.transform = 'scale(1.1)';
    setTimeout(() => {
      DOM.counterVal.style.transform = 'scale(1)';
    }, 100);
  }
}

function increment() {
  state.counter++;
  renderCounter();
}

function decrement() {
  state.counter--;
  renderCounter();
}

// Creative Custom Notifications (Toast)
function createToast(message) {
  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  toast.textContent = message;
  
  // Custom toast styling injected dynamically if needed
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    zIndex: 9999,
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.9rem',
    fontWeight: '500',
    opacity: '0',
    transform: 'translateY(20px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  });
  
  document.body.appendChild(toast);
  
  // Trigger animation frame
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  
  // Clean up
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Event Listeners Registration
function setupEventListeners() {
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', toggleTheme);
  }
  
  if (DOM.btnAction) {
    DOM.btnAction.addEventListener('click', () => {
      createToast("🔥 Interactive Boilerplate Action Triggered!");
    });
  }
  
  if (DOM.counterInc) {
    DOM.counterInc.addEventListener('click', increment);
  }
  
  if (DOM.counterDec) {
    DOM.counterDec.addEventListener('click', decrement);
  }
}

// Run Initializer
document.addEventListener('DOMContentLoaded', init);
