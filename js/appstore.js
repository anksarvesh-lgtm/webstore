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
        const secTab = s.getAttribute('data-tab-section');
        if (targetTab === 'all' || targetTab === 'discover') {
          s.style.display = '';
        } else {
          s.style.display = (secTab === targetTab) ? '' : 'none';
        }
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = tab.getAttribute('data-store-tab');
        if (target.startsWith('#')) return; // Allow natural anchor jumps
        e.preventDefault();
        activateTab(target);
      });
    });

    // Check URL hash on load
    const hash = window.location.hash.replace('#', '');
    if (hash && ['discover', 'utilities', 'dev-tools', 'updates'].includes(hash)) {
      activateTab(hash);
    }
  }

  function initCardNavigation() {
    const clickableCards = document.querySelectorAll('[data-app-url]');
    clickableCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // If user clicked directly on a download GET button, allow default download behavior
        if (e.target.closest('.btn-get') || e.target.closest('[data-gh-download]')) {
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
    initCardNavigation();
  });
})();

