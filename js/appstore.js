/**
 * App Store by Agrigence — Interactive Storefront Controller
 * Manages category filtering, live search, tab switching, and instant GET downloads
 */

(function () {
  let searchTimeout = null;

  function initSearch() {
    const searchInput = document.getElementById('store-search');
    const clearBtn = document.getElementById('store-search-clear');
    const cards = document.querySelectorAll('[data-store-app]');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (clearBtn) {
        clearBtn.classList.toggle('active', q.length > 0);
      }

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        let matchCount = 0;
        cards.forEach(card => {
          const text = (card.getAttribute('data-store-keywords') || '') + ' ' + (card.textContent || '');
          const matches = q === '' || text.toLowerCase().includes(q);
          card.style.display = matches ? '' : 'none';
          if (matches) matchCount++;
        });

        const emptyState = document.getElementById('store-search-empty');
        if (emptyState) {
          emptyState.style.display = (matchCount === 0 && q.length > 0) ? 'block' : 'none';
        }
      }, 100);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
      });
    }

    // Keyboard shortcut: Cmd+K or Ctrl+K or "/" to focus search
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      } else if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  function initCategoryTabs() {
    const tabs = document.querySelectorAll('[data-store-tab]');
    const sections = document.querySelectorAll('[data-tab-section]');

    if (!tabs.length) return;

    function activateTab(targetTab) {
      tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-store-tab') === targetTab));
      sections.forEach(s => {
        const secTabStr = s.getAttribute('data-tab-section') || '';
        const tokens = secTabStr.split(/\s+/).filter(Boolean);
        if (targetTab === 'all' || targetTab === 'discover') {
          s.style.display = '';
        } else {
          s.style.display = tokens.includes(targetTab) ? '' : 'none';
        }
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = tab.getAttribute('data-store-tab');
        if (!target) return;
        e.preventDefault();
        activateTab(target);

        // Smooth scroll to section if matching ID exists
        const sec = document.getElementById(target);
        if (sec && target !== 'discover') {
          sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Check URL hash on load
    const hash = window.location.hash.replace('#', '');
    if (hash && ['discover', 'platform-macos', 'platform-cli', 'type-utilities', 'type-devtools', 'utilities', 'dev-tools', 'updates'].includes(hash)) {
      activateTab(hash);
    }
  }

  function initQuickFilters() {
    const filterPills = document.querySelectorAll('.quick-filter-pill');
    if (!filterPills.length) return;

    let activePlatform = 'all';
    let activeType = 'all';

    function applyFilters() {
      const items = document.querySelectorAll('[data-platform-group], [data-type-group]');
      items.forEach(el => {
        const plat = el.getAttribute('data-platform-group');
        const type = el.getAttribute('data-type-group');

        const matchPlat = (activePlatform === 'all') || (plat && (plat === activePlatform || plat.split(' ').includes(activePlatform)));
        const matchType = (activeType === 'all') || (type && (type === activeType || type.split(' ').includes(activeType)));

        el.style.display = (matchPlat && matchType) ? '' : 'none';
      });
    }

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const group = pill.getAttribute('data-filter-group');
        const value = pill.getAttribute('data-filter-value');

        // Toggle active button in group
        document.querySelectorAll(`.quick-filter-pill[data-filter-group="${group}"]`).forEach(p => {
          p.classList.toggle('active', p === pill);
        });

        if (group === 'platform') activePlatform = value;
        if (group === 'type') activeType = value;

        applyFilters();
      });
    });
  }

  function initSimulatorCockpit() {
    const btns = document.querySelectorAll('.cockpit-btn');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.toggle('active', b === btn));
        const mode = btn.getAttribute('data-mode');
        
        const views = document.querySelectorAll('.hud-mode-view');
        views.forEach(v => {
          v.style.display = v.id === `mode-view-${mode}` ? '' : 'none';
        });

        const leftWing = document.getElementById('wing-left');
        const rightWing = document.getElementById('wing-right');
        if (leftWing && rightWing) {
          if (mode === 'minimal') {
            leftWing.style.opacity = '0.35';
            rightWing.style.opacity = '0.35';
          } else {
            leftWing.style.opacity = '1';
            rightWing.style.opacity = '1';
          }
        }
      });
    });
  }

  function initCardNavigation() {
    const clickableCards = document.querySelectorAll('[data-app-url]');
    clickableCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // If user clicked directly on a download GET button or a control button/input, allow default behavior
        if (e.target.closest('.btn-get') || e.target.closest('[data-gh-download]') || e.target.closest('button') || e.target.closest('input')) {
          return;
        }
        
        const url = card.getAttribute('data-app-url');
        if (url) {
          window.location.href = url;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initCategoryTabs();
    initQuickFilters();
    initSimulatorCockpit();
    initCardNavigation();
  });
})();

