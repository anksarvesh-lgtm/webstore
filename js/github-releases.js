/**
 * GitHub Releases Auto-Fetch Engine & 1-Click Direct Downloader
 * Automatically polls and synchronizes latest releases so users always get the freshest build.
 */

(function () {
  const CONFIG = {
    pollIntervalMs: 30000, // Auto-check every 30 seconds
    dynamo: {
      repo: 'anksarvesh-lgtm/dynamo-mac',
      fallbackVersion: '2.1.9',
      fallbackDmg: 'https://github.com/anksarvesh-lgtm/dynamo-mac/releases/download/v2.1.9/LiquidDynamo-2.1.9.dmg',
      releasesUrl: 'https://github.com/anksarvesh-lgtm/dynamo-mac/releases/latest',
      directDownloadUrl: '/download/dynamo'
    },
    guard: {
      repo: 'anksarvesh-lgtm/agent-guard',
      fallbackVersion: '0.2.21',
      fallbackInstall: 'curl -fsSL https://raw.githubusercontent.com/anksarvesh-lgtm/agent-guard/main/install.sh | bash',
      releasesUrl: 'https://github.com/anksarvesh-lgtm/agent-guard/releases/latest',
      directDownloadUrl: '/download/guard'
    }
  };

  let activeReleases = {
    dynamo: {
      version: CONFIG.dynamo.fallbackVersion,
      downloadUrl: CONFIG.dynamo.directDownloadUrl,
      releasesUrl: CONFIG.dynamo.releasesUrl,
      publishedAt: 'October 2026'
    },
    guard: {
      version: CONFIG.guard.fallbackVersion,
      downloadUrl: CONFIG.guard.directDownloadUrl,
      releasesUrl: CONFIG.guard.releasesUrl,
      publishedAt: 'October 2026'
    }
  };

  let isFetching = false;
  let updateIndicatorEl = null;

  function createOrGetIndicator() {
    if (updateIndicatorEl) return updateIndicatorEl;

    // Look for product banner or navigation to attach live sync badge
    const banner = document.querySelector('.product-banner-inner') || document.querySelector('.nav-inner');
    if (!banner) return null;

    let el = document.getElementById('live-release-indicator');
    if (!el) {
      el = document.createElement('div');
      el.id = 'live-release-indicator';
      el.className = 'live-release-indicator';
      el.innerHTML = `
        <span class="live-dot" id="live-dot" aria-hidden="true"></span>
        <span class="live-text" id="live-text">Auto-Syncing GitHub Releases</span>
      `;
      // Insert into banner
      banner.appendChild(el);
    }
    updateIndicatorEl = el;
    return updateIndicatorEl;
  }

  function setIndicatorStatus(status, text) {
    const el = createOrGetIndicator();
    if (!el) return;

    const dot = el.querySelector('#live-dot');
    const label = el.querySelector('#live-text');

    if (dot) {
      dot.className = `live-dot live-dot--${status}`;
    }
    if (label) {
      label.textContent = text;
    }
  }

  // 1. Fetch from server API endpoint (which handles caching and no rate limits)
  async function fetchServerReleases() {
    try {
      const res = await fetch('/api/latest-releases?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('Server API unavailable');
      const data = await res.json();
      if (data && data.status === 'ok') {
        return {
          dynamo: data.dynamo,
          guard: data.guard
        };
      }
    } catch (_) {}
    return null;
  }

  // 2. Direct GitHub API fallback
  async function fetchGitHubFallback(productKey) {
    const conf = CONFIG[productKey];
    if (!conf) return null;

    try {
      const res = await fetch(`https://api.github.com/repos/${conf.repo}/releases/latest`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      const version = String(data.tag_name || '').replace(/^v/i, '') || conf.fallbackVersion;
      
      let downloadUrl = conf.directDownloadUrl || conf.fallbackDmg;
      if (data.assets && data.assets.length > 0) {
        const dmgAsset = data.assets.find(a => a.name.toLowerCase().endsWith('.dmg'));
        if (dmgAsset && dmgAsset.browser_download_url) {
          downloadUrl = dmgAsset.browser_download_url;
        }
      }

      return {
        version,
        downloadUrl,
        publishedAt: data.published_at ? new Date(data.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Latest Release'
      };
    } catch (_) {
      return null;
    }
  }

  function applyToDOM(productKey, release) {
    if (!release) return;

    const oldVersion = activeReleases[productKey] ? activeReleases[productKey].version : null;
    activeReleases[productKey] = release;

    // Ensure download buttons link to freshest releases
    const downloadBtns = document.querySelectorAll(`[data-gh-download="${productKey}"]`);
    downloadBtns.forEach(btn => {
      btn.setAttribute('href', release.downloadUrl || (productKey === 'dynamo' ? '/download/dynamo' : '/download/guard'));
      btn.setAttribute('download', '');
    });

    // Update release date labels if present
    if (release.publishedAt) {
      const dateLabels = document.querySelectorAll(`[data-gh-date="${productKey}"]`);
      dateLabels.forEach(el => {
        el.textContent = release.publishedAt;
      });
    }
  }

  async function performAutoFetch() {
    if (isFetching) return;
    isFetching = true;
    setIndicatorStatus('checking', 'Checking for updates...');

    try {
      // Step 1: Query server-side release API
      const serverData = await fetchServerReleases();
      if (serverData) {
        if (serverData.dynamo) applyToDOM('dynamo', serverData.dynamo);
        if (serverData.guard) applyToDOM('guard', serverData.guard);
        
        setIndicatorStatus('active', 'Auto-Sync Live · Up to Date');
        return;
      }

      // Step 2: Fallback to direct GitHub query
      const [dynamoRel, guardRel] = await Promise.all([
        fetchGitHubFallback('dynamo'),
        fetchGitHubFallback('guard')
      ]);

      if (dynamoRel) applyToDOM('dynamo', dynamoRel);
      if (guardRel) applyToDOM('guard', guardRel);

      setIndicatorStatus('active', 'Auto-Sync Live · Up to Date');
    } catch (e) {
      setIndicatorStatus('active', 'Auto-Sync Active');
    } finally {
      isFetching = false;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial immediate DOM population (zero layout shift)
    applyToDOM('dynamo', activeReleases.dynamo);
    applyToDOM('guard', activeReleases.guard);
    createOrGetIndicator();

    // 2. Fetch latest updates immediately
    performAutoFetch();

    // 3. Auto-poll periodically in background (30s)
    setInterval(performAutoFetch, CONFIG.pollIntervalMs);

    // 4. Auto-refresh when user returns to tab
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        performAutoFetch();
      }
    });

    window.addEventListener('focus', () => {
      performAutoFetch();
    });
  });

  // Expose global controller for manual checks or debugging
  window.AutoReleaseSync = {
    checkNow: performAutoFetch,
    getReleases: () => activeReleases
  };
})();
