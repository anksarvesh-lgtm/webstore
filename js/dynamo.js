/**
 * LiquidDynamo — Interactive Notch Simulator & Client Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initNotchSimulator();
  initSnippetCopy();
  initDynamoTabs();
  initFaqAccordion();
});

/**
 * 1. Interactive MacBook Notch Simulator
 */
function initNotchSimulator() {
  const notch = document.getElementById('simulated-notch');
  const modeBtns = document.querySelectorAll('.mode-btn');
  const modePanels = document.querySelectorAll('.mode-panel');
  const wingLeft = document.getElementById('wing-left');
  const wingRight = document.getElementById('wing-right');

  if (!notch) return;

  // Toggle Notch Expansion
  notch.addEventListener('click', (e) => {
    // If clicking on mode buttons or inputs inside, do not collapse
    if (e.target.closest('.mode-btn') || e.target.closest('.ctl-btn')) return;
    notch.classList.toggle('expanded');
  });

  // Mode Switcher inside Island
  modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetMode = btn.dataset.mode;

      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      modePanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `mode-${targetMode}`) {
          panel.classList.add('active');
        }
      });
    });
  });

  // Fluctuate Wing Metrics Organically
  setInterval(() => {
    if (!notch.classList.contains('expanded')) {
      const cpuVal = Math.floor(28 + Math.random() * 25);
      const gpuVal = Math.floor(40 + Math.random() * 30);
      
      const cpuBar = wingLeft?.querySelector('.metric-bar-fill');
      const cpuText = wingLeft?.querySelector('.metric-val');
      if (cpuBar && cpuText) {
        cpuBar.style.width = cpuVal + '%';
        cpuText.textContent = cpuVal + '%';
      }

      const gpuBar = wingRight?.querySelector('.metric-bar-fill');
      const gpuText = wingRight?.querySelector('.metric-val');
      if (gpuBar && gpuText) {
        gpuBar.style.width = gpuVal + '%';
        gpuText.textContent = gpuVal + '%';
      }
    }
  }, 2200);

  // Music Play/Pause toggle
  const playBtn = document.querySelector('.ctl-play');
  const eqBars = document.querySelectorAll('.eq-bar');
  let isPlaying = true;
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isPlaying = !isPlaying;
      playBtn.textContent = isPlaying ? '⏸' : '▶';
      eqBars.forEach(bar => {
        bar.style.animationPlayState = isPlaying ? 'running' : 'paused';
      });
    });
  }
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
 * 3. Feature Tabs Auto-Cycling & Pill Positioning
 */
function initDynamoTabs() {
  const splitContainer = document.getElementById('dynamo-split');
  const track = document.getElementById('dynamo-index-track');
  const pill = document.getElementById('dynamo-index-pill');
  const tabs = document.querySelectorAll('#dynamo-index-track .clears-index-item');
  const cards = document.querySelectorAll('#dynamo-media .dynamo-shot-card');
  const bodies = document.querySelectorAll('#dynamo-copy .clears-split-body');

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
