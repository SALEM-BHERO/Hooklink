/**
 * HookLink AI — Hook Library Page
 * Filtering, search, copy-to-clipboard, and load-more functionality
 */

import '../styles/global.css';
import { renderHeader, renderFooter, showToast } from './shared.js';

/* ── Bootstrap shared components ── */
renderHeader('library');
renderFooter();

/* ── DOM references ── */
const filterRow = document.getElementById('filterRow');
const hookGrid = document.getElementById('hookGrid');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const joinBtn = document.getElementById('joinBtn');

const allCards = () => hookGrid.querySelectorAll('.hook-card');
const allPills = () => filterRow.querySelectorAll('.filter-pill');

/* ═══════════════════════════════════════════════════════════════
   Filter Pills
   ═══════════════════════════════════════════════════════════════ */

let activeFilter = 'all';

function setActivePill(btn) {
  allPills().forEach((pill) => {
    pill.classList.remove('bg-primary', 'text-on-primary');
    pill.classList.add('bg-surface-container-lowest', 'text-on-surface-variant');
  });
  btn.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant');
  btn.classList.add('bg-primary', 'text-on-primary');
}

function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();

  allCards().forEach((card) => {
    const matchesCategory =
      activeFilter === 'all' || card.dataset.category === activeFilter;

    const matchesSearch =
      !query || card.textContent.toLowerCase().includes(query);

    card.style.display = matchesCategory && matchesSearch ? '' : 'none';
  });
}

filterRow.addEventListener('click', (e) => {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;

  activeFilter = pill.dataset.filter;
  setActivePill(pill);
  applyFilters();
});

/* ═══════════════════════════════════════════════════════════════
   Search Input
   ═══════════════════════════════════════════════════════════════ */

searchInput.addEventListener('input', () => {
  applyFilters();
});

/* ═══════════════════════════════════════════════════════════════
   Copy to Clipboard
   ═══════════════════════════════════════════════════════════════ */

hookGrid.addEventListener('click', async (e) => {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;

  const card = btn.closest('.hook-card');
  const hookTextEl = card.querySelector('.hook-text');
  if (!hookTextEl) return;

  // Strip curly quotes and trim
  const text = hookTextEl.textContent
    .replace(/[\u201C\u201D]/g, '"')
    .trim();

  try {
    await navigator.clipboard.writeText(text);
    showToast('Hook copied to clipboard!', 'content_paste');
  } catch {
    showToast('Unable to copy — try manually.', 'error');
  }
});

/* ═══════════════════════════════════════════════════════════════
   Load More
   ═══════════════════════════════════════════════════════════════ */

loadMoreBtn.addEventListener('click', () => {
  showToast('More hooks coming soon!', 'hourglass_top');
});

/* ═══════════════════════════════════════════════════════════════
   Newsletter Join
   ═══════════════════════════════════════════════════════════════ */

if (joinBtn) {
  joinBtn.addEventListener('click', () => {
    showToast('Thanks for subscribing! 🎉', 'mark_email_read');
  });
}
