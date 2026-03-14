/* =============================================
   S1WEF — Main JavaScript (GitHub Pages / Static)
   All data is inlined; Discord status fetched
   directly from Lanyard (CORS-enabled public API).
   ============================================= */

// ── INLINE DATA (replaces Flask /api/* endpoints) ──

const STATS = {
  kills:          10,
  zombie_kills:   664,
  deaths:         15,
  kd_ratio:       0.67,
  playtime_hours: 171,
  distance_km:    1925,
  farthest_kill:  163.71,
  suicides:       2,
  last_updated:   "2026-03-13 22:22:40"
};

const SESSIONS = [
  {
    id: 1, date: "2026-03-13",
    server: "Survival Gaming Nederland", map: "Chernarus",
    kills: 3, zombie_kills: 120, survived: true,
    loot: ["AKM", "Military Vest", "Night Vision"],
    highlight: "Cleared Tisy Military Base solo", duration: "2h 45m"
  },
  {
    id: 2, date: "2026-03-11",
    server: "Survival Gaming Nederland", map: "Chernarus",
    kills: 2, zombie_kills: 89, survived: false,
    loot: ["MP5-K", "Press Vest", "Canteen"],
    highlight: "Ambushed at the train tracks near Zelenogorsk", duration: "1h 20m"
  },
  {
    id: 3, date: "2026-03-09",
    server: "Survival Gaming Nederland", map: "Chernarus",
    kills: 4, zombie_kills: 210, survived: true,
    loot: ["SVD", "Ghillie Suit", "First Aid Kit"],
    highlight: "163.71m confirmed kill — farthest on record", duration: "4h 10m"
  },
  {
    id: 4, date: "2026-03-06",
    server: "Survival Gaming Nederland", map: "Chernarus",
    kills: 1, zombie_kills: 145, survived: false,
    loot: ["Mosin", "Hunting Backpack"],
    highlight: "Died to a zombie horde after a firefight", duration: "3h 05m"
  },
  {
    id: 5, date: "2026-03-03",
    server: "Survival Gaming Nederland", map: "Chernarus",
    kills: 0, zombie_kills: 100, survived: true,
    loot: ["M4A1", "Plate Carrier", "Compass", "Radio"],
    highlight: "Full military kit run — in and out clean", duration: "2h 09m"
  }
];

const QUOTES = [
  "Every server is a new war.",
  "Trust no one. Loot everything.",
  "The infected are the least of your worries.",
  "Chernarus never forgets.",
  "One bullet. One chance.",
  "Survive. Adapt. Dominate.",
  "The northwest airfield calls.",
  "Ghillie up. Scope in. Wait.",
  "664 zeds down. Still counting.",
  "163 meters. One shot. One kill.",
  "Chernarus is the only map that matters.",
  "Je overleeft of je vergeet."
];

const DISCORD_USER_ID = "1166453965517500477";

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
let menuOpen = false;
hamburger?.addEventListener('click', () => {
  menuOpen = !menuOpen;
  Object.assign(navLinks.style, menuOpen ? {
    display: 'flex', flexDirection: 'column', position: 'absolute',
    top: '70px', left: '0', right: '0',
    background: 'rgba(8,10,8,0.98)', padding: '2rem',
    gap: '1.5rem', borderBottom: '1px solid rgba(90,120,70,0.25)',
    zIndex: '999'
  } : { display: 'none' });
});

// ── YEAR ──
document.getElementById('year').textContent = new Date().getFullYear();

// ── QUOTE (random, from inline array) ──
function loadQuote() {
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const hero = document.getElementById('heroQuote');
  const big  = document.getElementById('bigQuote');
  if (hero) hero.textContent = `"${quote}"`;
  if (big)  big.textContent  = `"${quote}"`;
}

// ── DISCORD STATUS (direct Lanyard API — CORS supported) ──
async function loadStatus() {
  const badge = document.getElementById('statusBadge');
  if (!badge) return;

  try {
    const resp = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
    if (!resp.ok) throw new Error('Lanyard fetch failed');
    const json = await resp.json();
    const data = json.data || {};

    const discordStatus = data.discord_status || 'offline';
    const activities    = data.activities || [];

    const playingDayZ = activities.some(a =>
      a.name && a.name.toLowerCase().includes('dayz')
    );
    const gameDetail = activities.find(a =>
      a.name && a.name.toLowerCase().includes('dayz')
    );
    const detailText = gameDetail
      ? (gameDetail.details || gameDetail.state || 'DayZ')
      : null;

    badge.classList.remove('ingame', 'online', 'idle', 'dnd', 'offline');

    if (playingDayZ) {
      badge.classList.add('ingame');
      badge.querySelector('.status-text').textContent = 'IN-GAME · Survival Gaming Nederland';
    } else {
      badge.classList.add(discordStatus || 'offline');
      badge.querySelector('.status-text').textContent = _statusLabel(discordStatus, false);
    }
  } catch (e) {
    console.warn('Discord status unavailable', e);
    badge.classList.remove('ingame', 'online', 'idle', 'dnd');
    badge.classList.add('offline');
    badge.querySelector('.status-text').textContent = 'Status unavailable';
  }
}

function _statusLabel(status, inGame) {
  if (inGame)            return 'IN-GAME · Survival Gaming Nederland';
  if (status === 'online') return 'ONLINE · Discord';
  if (status === 'idle')   return 'IDLE · Discord';
  if (status === 'dnd')    return 'DO NOT DISTURB';
  return 'OFFLINE';
}

// ── STATS (from inline data) ──
function loadStats() {
  document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('loading'));

  document.querySelectorAll('[data-key]').forEach(el => {
    const key      = el.dataset.key;
    const decimals = parseInt(el.dataset.decimals ?? '0', 10);
    const suffix   = el.dataset.suffix ?? '';
    if (STATS[key] !== undefined) {
      animateValue(el, 0, STATS[key], 1400, decimals, suffix);
    }
  });

  const lu = document.getElementById('statsUpdated');
  if (lu && STATS.last_updated) {
    lu.textContent = `// Last updated: ${STATS.last_updated}`;
  }
}

function animateValue(el, start, end, duration, decimals = 0, suffix = '') {
  const t0 = performance.now();
  function step(now) {
    const p    = Math.min((now - t0) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const cur  = start + (end - start) * ease;
    el.textContent = cur.toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── SESSIONS (from inline data) ──
function loadSessions() {
  const container = document.getElementById('sessionsList');
  if (!container) return;
  container.innerHTML = '';

  SESSIONS.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = `session-card ${s.survived ? '' : 'death'}`;
    card.style.animationDelay = `${i * 0.07}s`;
    card.innerHTML = `
      <div class="session-date-col">
        <div class="session-date">${formatDate(s.date)}</div>
        <div class="session-duration">${s.duration}</div>
      </div>
      <div class="session-body">
        <div class="session-server">${s.server} · ${s.map}</div>
        <div class="session-highlight">"${s.highlight}"</div>
        <div class="session-loot">
          ${s.loot.map(l => `<span class="loot-item">${l}</span>`).join('')}
        </div>
      </div>
      <div class="session-result-col">
        <div class="session-kills">${s.kills}</div>
        <div class="session-kills-label">Player Kills</div>
        <div class="session-zeds">🧟 ${s.zombie_kills} zeds</div>
        <div class="session-outcome ${s.survived ? 'survived' : 'died'}">
          ${s.survived ? '✓ SURVIVED' : '✗ DIED'}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.stat-card, .contact-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ── INIT ──
loadQuote();
loadStatus();
loadStats();
loadSessions();
setInterval(loadStatus, 60_000);
