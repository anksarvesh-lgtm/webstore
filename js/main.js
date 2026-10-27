/**
 * Purge for Mac — Replicated Interactive Client Controller
 * Hand-crafted with exact parity to Next.js client modules
 */

document.addEventListener('DOMContentLoaded', () => {
  initGitHubStars();
  initSnippetCopy();
  initClearsTabs();
  initFaqAccordion();
  initSmoothScroll();
});

/**
 * 1. Fetch live GitHub stars count and display formatted badge
 */
function initGitHubStars() {
  const starsEl = document.getElementById('nav-github-stars');
  if (!starsEl) return;

  fetch('https://api.github.com/repos/jithin-sabu/purge-app')
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (!data || data.stargazers_count == null) return;
      const count = data.stargazers_count;
      let formatted;
      if (count >= 1e6) {
        const val = count / 1e6;
        formatted = (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'M';
      } else if (count >= 1e3) {
        const val = count / 1e3;
        formatted = (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'k';
      } else {
        formatted = String(count);
      }
      starsEl.textContent = formatted;
      starsEl.removeAttribute('aria-hidden');
    })
    .catch(() => {
      // Fallback star count if rate-limited
      starsEl.textContent = '1.3k';
      starsEl.removeAttribute('aria-hidden');
    });
}

/**
 * 2. Terminal copy-to-clipboard button with visual feedback
 */
function initSnippetCopy() {
  const buttons = document.querySelectorAll('.snippet-copy');
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy') || 'brew install --cask purge';
      try {
        await navigator.clipboard.writeText(textToCopy);
        btn.classList.add('copied');
        btn.setAttribute('aria-label', 'copied');
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.setAttribute('aria-label', 'copy command');
        }, 1600);
      } catch (e) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1600);
      }
    });
  });
}

/**
 * 3. Clears section: Interactive auto-advancing tabs, sliding pill, and synced media
 */
function initClearsTabs() {
  const splitContainer = document.getElementById('clears-split');
  const track = document.getElementById('clears-index-track');
  const pill = document.getElementById('clears-index-pill');
  const tabs = document.querySelectorAll('.clears-index-item');
  const shots = document.querySelectorAll('.clears-shot');
  const bodies = document.querySelectorAll('.clears-split-body');

  if (!track || !tabs.length) return;

  let currentIndex = 0;
  let isPaused = false;
  let autoAdvanceTimer = null;
  const DURATION = 5500;

  function updatePill(targetTab) {
    if (!pill || !targetTab) return;
    const x = targetTab.offsetLeft;
    const y = targetTab.offsetTop;
    const w = targetTab.offsetWidth;
    const h = targetTab.offsetHeight;
    pill.style.width = w + 'px';
    pill.style.height = h + 'px';
    pill.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    pill.setAttribute('data-ready', 'true');
  }

  function setActiveTab(index, userTriggered = false) {
    if (index < 0 || index >= tabs.length) return;
    currentIndex = index;

    tabs.forEach((tab, i) => {
      const isSelected = i === index;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      const fill = tab.querySelector('.clears-index-fill');
      if (fill) {
        fill.classList.remove('clears-index-fill--run');
        if (isSelected) {
          void fill.offsetWidth; // trigger reflow
          fill.classList.add('clears-index-fill--run');
        }
      }
    });

    shots.forEach((shot, i) => {
      if (i === index) {
        shot.setAttribute('data-active', 'true');
      } else {
        shot.removeAttribute('data-active');
      }
    });

    bodies.forEach((body, i) => {
      if (i === index) {
        body.setAttribute('data-active', 'true');
        body.removeAttribute('aria-hidden');
      } else {
        body.removeAttribute('data-active');
        body.setAttribute('aria-hidden', 'true');
      }
    });

    updatePill(tabs[index]);

    if (userTriggered) {
      resetTimer();
    }
  }

  function resetTimer() {
    clearInterval(autoAdvanceTimer);
    if (!isPaused) {
      autoAdvanceTimer = setInterval(() => {
        if (!isPaused) {
          const nextIndex = (currentIndex + 1) % tabs.length;
          setActiveTab(nextIndex);
        }
      }, DURATION);
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setActiveTab(index, true));
  });

  if (splitContainer) {
    splitContainer.addEventListener('mouseenter', () => {
      isPaused = true;
    });
    splitContainer.addEventListener('mouseleave', () => {
      isPaused = false;
      resetTimer();
    });
  }

  // Handle window resizing to keep pill correctly bounded
  window.addEventListener('resize', () => {
    updatePill(tabs[currentIndex]);
  });

  // Initial pill position and timer start
  setTimeout(() => {
    setActiveTab(0);
    resetTimer();
  }, 100);
}

/**
 * 4. FAQ accordion with accessible ARIA toggle
 */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const trigger = item.querySelector('.faq-q');
    const panel = item.querySelector('.faq-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';

      // Close all other panels for clean single-accordion behavior
      items.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.removeAttribute('data-open');
          const otherTrigger = otherItem.querySelector('.faq-q');
          const otherPanel = otherItem.querySelector('.faq-panel');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.setAttribute('inert', '');
        }
      });

      // Toggle this panel
      if (isOpen) {
        item.removeAttribute('data-open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('inert', '');
      } else {
        item.setAttribute('data-open', 'true');
        trigger.setAttribute('aria-expanded', 'true');
        panel.removeAttribute('inert');
      }
    });
  });
}

/**
 * 5. Smooth scroll for in-page anchors
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
