/**
 * Agent Guard — Interactive DAG Ledger & Client Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initUniversalPromptCopy();
  initSnippetCopy();
  initGuardTabs();
  initFaqAccordion();
});

/**
 * 1. Copy Universal AI Agent Prompt
 */
function initUniversalPromptCopy() {
  const btn = document.getElementById('copy-universal-prompt');
  const promptEl = document.getElementById('universal-prompt-content');
  if (!btn || !promptEl) return;

  btn.addEventListener('click', async () => {
    const text = promptEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>Copied! ✓</span>';
      setTimeout(() => btn.innerHTML = originalText, 1800);
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.innerHTML = '<span>Copied! ✓</span>';
      setTimeout(() => btn.innerHTML = '<span>Copy Prompt</span>', 1800);
    }
  });
}

/**
 * 2. Snippet Copy Button
 */
function initSnippetCopy() {
  document.querySelectorAll('.snippet-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') || '';
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1600);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1600);
      }
    });
  });
}

/**
 * 3. Agent Guard Feature Tabs Auto-Cycling & Pill Positioning
 */
function initGuardTabs() {
  const splitContainer = document.getElementById('guard-split');
  const track = document.getElementById('guard-index-track');
  const pill = document.getElementById('guard-index-pill');
  const tabs = document.querySelectorAll('#guard-index-track .clears-index-item');
  const cards = document.querySelectorAll('#guard-media .dynamo-shot-card');
  const bodies = document.querySelectorAll('#guard-copy .clears-split-body');

  if (!track || !tabs.length) return;

  let currentIndex = 0;
  let isPaused = false;
  let timer = null;
  const DURATION = 5500;

  function updatePill(targetTab) {
    if (!pill || !targetTab) return;
    pill.style.width = targetTab.offsetWidth + 'px';
    pill.style.height = targetTab.offsetHeight + 'px';
    pill.style.transform = `translate(${targetTab.offsetLeft}px, ${targetTab.offsetTop}px)`;
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
          void fill.offsetWidth;
          fill.classList.add('clears-index-fill--run');
        }
      }
    });

    cards.forEach((card, i) => {
      if (i === index) {
        card.setAttribute('data-active', 'true');
      } else {
        card.removeAttribute('data-active');
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
    clearInterval(timer);
    if (!isPaused) {
      timer = setInterval(() => {
        if (!isPaused) {
          const next = (currentIndex + 1) % tabs.length;
          setActiveTab(next);
        }
      }, DURATION);
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => setActiveTab(i, true));
  });

  if (splitContainer) {
    splitContainer.addEventListener('mouseenter', () => isPaused = true);
    splitContainer.addEventListener('mouseleave', () => {
      isPaused = false;
      resetTimer();
    });
  }

  window.addEventListener('resize', () => updatePill(tabs[currentIndex]));

  setTimeout(() => {
    setActiveTab(0);
    resetTimer();
  }, 100);
}

/**
 * 4. FAQ Accordion
 */
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const trigger = item.querySelector('.faq-q');
    const panel = item.querySelector('.faq-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';

      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) {
          other.removeAttribute('data-open');
          other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-panel')?.setAttribute('inert', '');
        }
      });

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
