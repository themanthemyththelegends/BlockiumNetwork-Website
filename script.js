const SERVER = 'play.blockium.net';
const API = `https://api.mcsrvstat.us/3/${SERVER}`;

async function fetchStatus() {
  try {
    const start = Date.now();
    const res = await fetch(API);
    const pingMs = Date.now() - start;
    const d = await res.json();

    if (!d.online) {
      document.getElementById('statusDot').style.background = '#f56565';
      document.getElementById('playerCount').textContent = 'offline';
      document.getElementById('pingDisplay').textContent = '—';
      document.getElementById('versionDisplay').textContent = '—';
      document.getElementById('playersList').innerHTML = '<p class="players-loading" style="animation:none">Server offline</p>';
      return;
    }

    const count = d.players?.online ?? 0;
    const max   = d.players?.max ?? 0;
    const ver   = d.version ?? 'Unknown';

    document.getElementById('playerCount').textContent = `${count} / ${max}`;
    document.getElementById('pingDisplay').textContent = `${pingMs}ms`;
    document.getElementById('versionDisplay').textContent = ver;
    
    const totalJoinedEl = document.getElementById('totalJoined');
    if (totalJoinedEl) {
        totalJoinedEl.textContent = max > 0 ? `${max}+` : '—';
    }

    const list = document.getElementById('playersList');
    const names = d.players?.list ?? [];
    if (count === 0) {
      list.innerHTML = '<p class="players-loading" style="animation:none;color:var(--muted2)">No players online</p>';
    } else {
      const shown = names.slice(0, 6);
      list.innerHTML = shown.map(p => {
        const n = p.name || p;
        const initials = n.slice(0,2).toUpperCase();
        return `<div class="player-entry">
          <div class="player-avatar">${initials}</div>
          <span class="player-name">${n}</span>
        </div>`;
      }).join('');
      if (count > 6) {
        list.innerHTML += `<p style="font-family:var(--mono);font-size:11px;color:var(--muted2);text-align:center;margin-top:4px;">+${count-6} more</p>`;
      }
    }
  } catch(e) {
    const list = document.getElementById('playersList');
    if (list) {
        list.innerHTML = '<p class="players-loading" style="animation:none;color:var(--muted2)">Could not reach API</p>';
    }
  }
}

function copyIP() {
  navigator.clipboard.writeText(SERVER).then(() => {
    const t = document.getElementById('copyToast');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const ipCard = document.getElementById('ipCard');
    if (ipCard) {
        ipCard.addEventListener('click', copyIP);
    }
    
    // Initial fetch
    fetchStatus();
    // Refresh every 60 seconds
    setInterval(fetchStatus, 60000);
});
