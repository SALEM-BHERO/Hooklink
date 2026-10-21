import '../styles/global.css';
import { renderHeader, renderFooter, showToast } from './shared.js';
import { api, escapeHtml } from './api.js';
import { platformIcon, platformOf } from './platforms.js';

renderHeader('library');
renderFooter();

const PAGE = 8;
const BADGE = {
  'curiosity-gap': 'bg-tertiary-fixed text-on-tertiary-fixed',
  'the-listicle': 'bg-secondary-container text-on-secondary-container',
  'the-controversy': 'bg-error-container text-on-error-container',
  'technical-insight': 'bg-surface-container-high text-on-surface',
};

const filterRow = document.getElementById('filterRow');
const hookGrid = document.getElementById('hookGrid');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const viewingCount = document.getElementById('viewingCount');

let state = { category: 'all', platform: 'all', q: '', loaded: 0, total: 0 };
let items = [];
let requestSeq = 0;
let loading = false;

const num = (n) => `#${String(n).padStart(2, '0')}`;
const tags = (h) => `<div class="flex items-center gap-2 mb-4" data-testid="hook-platforms-${h.number}">${(h.platforms || []).map((p) => `<span title="${platformOf(p).label}">${platformIcon(p, 'text-[15px]')}</span>`).join('')}</div>`;

const copyBtn = (h, featured) => featured
  ? `<button class="copy-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-body-sm font-semibold hover:shadow-lg transition-all active:scale-95" data-testid="copy-hook-${h.number}"><span class="material-symbols-outlined text-[18px]">content_copy</span>Copy Idea</button>`
  : `<button class="copy-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-body-sm text-on-surface-variant hover:bg-surface-container hover:border-primary/40 transition-all" data-testid="copy-hook-${h.number}"><span class="material-symbols-outlined text-[18px]">content_copy</span>Copy</button>`;

function card(h) {
  const badge = `<span class="px-3 py-1 rounded-lg ${BADGE[h.category]} text-xs font-bold uppercase tracking-wider">${escapeHtml(h.category_label)}</span>`;
  if (h.featured) {
    return `
    <div class="hook-card md:col-span-2 lg:col-span-2 bg-primary-fixed/10 border-2 border-primary-container rounded-xl p-8 hover:shadow-lg transition-all" data-number="${h.number}" data-testid="hook-card-${h.number}">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-3">${badge}<span class="px-3 py-1 rounded-lg bg-tertiary text-on-tertiary text-xs font-bold uppercase tracking-wider">Editor's Pick</span></div>
        <span class="text-body-sm text-on-surface-variant/60 font-mono">${num(h.number)}</span>
      </div>
      ${tags(h)}
      <h3 class="text-headline-md font-headline font-bold text-on-surface mt-3 mb-3">${escapeHtml(h.title || '')}</h3>
      <p class="hook-text text-on-surface-variant italic leading-relaxed text-body-lg mb-4">&ldquo;${escapeHtml(h.text)}&rdquo;</p>
      <p class="text-body-sm text-on-surface-variant/70 mb-6"><span class="font-semibold text-on-surface-variant">Why it works:</span> ${escapeHtml(h.why || '')}</p>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-body-sm text-on-surface-variant/80"><span class="material-symbols-outlined text-[18px] text-tertiary">lightbulb</span><span>${escapeHtml(h.theme)}</span></div>
        ${copyBtn(h, true)}
      </div>
    </div>`;
  }
  return `
    <div class="hook-card flex flex-col bg-white border border-outline-variant/40 rounded-xl p-6 hover:shadow-lg transition-all" data-number="${h.number}" data-testid="hook-card-${h.number}">
      <div class="flex items-center justify-between mb-4">${badge}<span class="text-body-sm text-on-surface-variant/60 font-mono">${num(h.number)}</span></div>
      ${tags(h)}
      <p class="hook-text text-on-surface-variant italic leading-relaxed text-body-md mb-6">&ldquo;${escapeHtml(h.text)}&rdquo;</p>
      <div class="flex items-center justify-between mt-auto">
        <div class="flex items-center gap-2 text-body-sm text-on-surface-variant/80"><span class="material-symbols-outlined text-[18px] text-primary">bookmark</span><span>${escapeHtml(h.theme)}</span></div>
        ${copyBtn(h, false)}
      </div>
    </div>`;
}

function renderFooterState() {
  viewingCount.textContent = state.total ? `Viewing ${state.loaded} of ${state.total} ideas` : 'No ideas match your search.';
  loadMoreBtn.classList.toggle('hidden', state.loaded >= state.total);
}

async function fetchPage(reset) {
  if (!reset && loading) return;
  const seq = ++requestSeq;
  loading = true;
  const skip = reset ? 0 : state.loaded;
  const params = new URLSearchParams({ category: state.category, platform: state.platform, q: state.q, skip, limit: PAGE });
  try {
    const data = await api(`/library?${params}`);
    if (seq !== requestSeq) return;
    if (reset) items = [];
    items = items.concat(data.items);
    state.total = data.total;
    state.loaded = items.length;
    const html = data.items.map(card).join('');
    if (reset) hookGrid.innerHTML = html; else hookGrid.insertAdjacentHTML('beforeend', html);
    renderFooterState();
  } catch (e) {
    if (seq === requestSeq) showToast(e.message, 'error');
  } finally {
    if (seq === requestSeq) loading = false;
  }
}

filterRow.addEventListener('click', (e) => {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;
  filterRow.querySelectorAll('.filter-pill').forEach((p) => {
    const on = p === pill;
    p.classList.toggle('bg-primary', on);
    p.classList.toggle('text-on-primary', on);
    p.classList.toggle('bg-surface-container-lowest', !on);
    p.classList.toggle('text-on-surface-variant', !on);
  });
  state.category = pill.dataset.filter;
  fetchPage(true);
});

document.getElementById('platformRow').addEventListener('click', (e) => {
  const pill = e.target.closest('.platform-pill');
  if (!pill) return;
  document.querySelectorAll('.platform-pill').forEach((p) => {
    const on = p === pill;
    p.classList.toggle('bg-on-background', on);
    p.classList.toggle('text-on-primary', on);
    p.classList.toggle('bg-surface-container-lowest', !on);
    p.classList.toggle('text-on-surface-variant', !on);
  });
  state.platform = pill.dataset.platform;
  fetchPage(true);
});

let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.q = searchInput.value.trim(); fetchPage(true); }, 300);
});

hookGrid.addEventListener('click', async (e) => {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;
  const hook = items.find((h) => String(h.number) === btn.closest('.hook-card').dataset.number);
  try {
    await navigator.clipboard.writeText(hook.text);
    showToast('Hook copied to clipboard!', 'content_paste');
  } catch {
    showToast('Unable to copy — try manually.', 'error');
  }
});

loadMoreBtn.addEventListener('click', () => fetchPage(false));

document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('newsletterEmail');
  try {
    const res = await api('/newsletter', { method: 'POST', body: { email: input.value.trim() } });
    showToast(res.already ? "You're already subscribed!" : 'Thanks for subscribing!', 'mark_email_read');
    input.value = '';
  } catch (err) {
    showToast(err.message === 'Please check your input and try again.' ? 'Please enter a valid email address.' : err.message, 'error');
  }
});

fetchPage(true);
