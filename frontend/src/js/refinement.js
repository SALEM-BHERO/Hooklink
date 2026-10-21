import '../styles/global.css';
import { renderHeader, renderFooter, showToast } from './shared.js';
import { api } from './api.js';
import { platformIcon, platformOf } from './platforms.js';
import { renderPreview } from './previews.js';

renderHeader('workspace');
renderFooter();

const draftId = new URLSearchParams(window.location.search).get('draft');
let platform = 'linkedin';

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
const profile = tz.startsWith('Africa/')
  ? { name: 'Tadiwa Maphosa', handle: 'tadiwa.builds', title: 'Founder @ HookLink AI | Scaling African Tech' }
  : tz.startsWith('Europe/')
    ? { name: 'Alex Sterling', handle: 'alexsterling', title: 'Founder @ HookLink AI | High-Performance Content Systems' }
    : { name: 'Jordan Miller', handle: 'jordanmiller', title: 'Founder @ HookLink AI | Digital Growth Strategist' };

const SAMPLE = `Good writing doesn't just happen. It takes practice and structure.

Here is the 3-step framework we use to write clearly:

1. The Opening: Does the first line make people want to read more?
2. The Value: Are you teaching something useful?
3. The Next Step: Is it clear what the reader should do?

#ContentStrategy #WritingTips`;

const postCanvas = document.getElementById('postCanvas');
const desktopViewBtn = document.getElementById('desktopViewBtn');
const mobileViewBtn = document.getElementById('mobileViewBtn');
const charCount = document.getElementById('charCount');
const body = () => document.getElementById('postBody');
const hookCards = () => document.querySelectorAll('.hook-card');

function updateMeta() {
  const p = platformOf(platform);
  const text = body().innerText;
  const tweets = platform === 'x' ? text.split(/\n\s*\n/).filter((t) => /^\s*\d+\//.test(t)) : [];
  const len = tweets.length > 1 ? Math.max(...tweets.map((t) => t.trim().length)) : text.trim().length;
  charCount.textContent = tweets.length > 1
    ? `${tweets.length}-post thread · longest ${len} / ${p.limit}`
    : `${len.toLocaleString()} / ${p.limit.toLocaleString()}`;
  charCount.classList.toggle('text-error', len > p.limit);
  const yt = document.getElementById('ytTitle');
  if (yt) yt.textContent = text.split('\n')[0];
}

function mountPreview(text) {
  postCanvas.innerHTML = renderPreview(platform, profile);
  body().innerText = text;
  body().addEventListener('input', updateMeta);
  document.getElementById('platformBadge').innerHTML = `${platformIcon(platform)} ${platformOf(platform).label}`;
  document.querySelector('[data-testid="hooks-panel-title"]').textContent = platform === 'youtube' ? 'Title Variations' : 'Opening Variations';
  updateMeta();
}

document.querySelectorAll('.hook-card').forEach((card, i) => {
  card.dataset.testid = `hook-card-${i}`;
  card.querySelector('span').classList.add('hook-title');
  card.querySelector('p').classList.add('hook-text');
  card.querySelector('.apply-hook-btn').dataset.testid = `apply-hook-btn-${i}`;
  card.querySelector('.hook-copy-btn').dataset.testid = `copy-hook-btn-${i}`;
});
document.querySelector('.glass-panel h2').dataset.testid = 'hooks-panel-title';

// View toggle
const ACTIVE = ['bg-white', 'shadow', 'text-primary'];
function toggleView(mode) {
  const mobile = mode === 'mobile';
  postCanvas.classList.toggle('max-w-[375px]', mobile);
  postCanvas.classList.toggle('max-w-[552px]', !mobile);
  [[mobileViewBtn, mobile], [desktopViewBtn, !mobile]].forEach(([b, on]) => {
    ACTIVE.forEach((c) => b.classList.toggle(c, on));
    b.classList.toggle('text-on-surface-variant', !on);
  });
}
desktopViewBtn.addEventListener('click', () => toggleView('desktop'));
mobileViewBtn.addEventListener('click', () => toggleView('mobile'));

function renderHooks(hooks) {
  hooks.forEach((hook, i) => {
    const card = hookCards()[i];
    if (!card) return;
    card.querySelector('.hook-title').innerText = hook.title;
    card.querySelector('.hook-text').innerText = hook.text;
  });
}

const currentHooks = () => [...hookCards()].map((c) => ({
  title: c.querySelector('.hook-title').innerText,
  text: c.querySelector('.hook-text').innerText,
}));

function setBody(text) {
  body().innerText = text;
  body().classList.add('bg-primary/5');
  setTimeout(() => body().classList.remove('bg-primary/5'), 800);
  updateMeta();
}

async function loadDraft() {
  if (!draftId) return mountPreview(SAMPLE);
  try {
    const draft = await api(`/drafts/${draftId}`);
    platform = draft.platform || 'linkedin';
    mountPreview(draft.post_body);
    renderHooks(draft.hooks);
  } catch (e) {
    mountPreview(SAMPLE);
    showToast(e.message, 'error');
  }
}

async function saveDraft(silent = false) {
  if (!draftId) {
    if (!silent) showToast('Generate a post in the Workspace to save drafts.', 'info');
    return;
  }
  try {
    await api(`/drafts/${draftId}`, { method: 'PUT', body: { post_body: body().innerText, hooks: currentHooks() } });
    if (!silent) showToast('Draft saved', 'save');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function withBusy(btn, label, fn) {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">refresh</span> ${label}`;
  try {
    await fn();
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    btn.innerHTML = original;
    btn.disabled = false;
  }
}

async function copyText(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(msg, 'content_copy');
  } catch {
    showToast('Failed to copy — try again', 'error');
  }
}

hookCards().forEach((card) => {
  card.querySelector('.apply-hook-btn').addEventListener('click', () => {
    const lines = body().innerText.split('\n');
    const label = lines[0].match(/^HOOK[^:]{0,15}:\s*/i)?.[0] || '';
    lines[0] = label + card.querySelector('.hook-text').innerText;
    setBody(lines.join('\n'));
    showToast('Hook applied to draft', 'auto_awesome');
    saveDraft(true);
  });
  card.querySelector('.hook-copy-btn').addEventListener('click', () => copyText(card.querySelector('.hook-text').innerText, 'Hook copied to clipboard'));
});

document.getElementById('copyBtn').addEventListener('click', () => copyText(body().innerText, `Copied — ready to paste into ${platformOf(platform).label}`));
document.getElementById('saveBtn').addEventListener('click', () => saveDraft());

// Refine tone
const refineToneBtn = document.getElementById('refineToneBtn');
const toneMenu = document.getElementById('toneMenu');
refineToneBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toneMenu.classList.toggle('hidden');
});
document.addEventListener('click', () => toneMenu.classList.add('hidden'));
toneMenu.addEventListener('click', (e) => {
  const opt = e.target.closest('.tone-option');
  if (!opt) return;
  toneMenu.classList.add('hidden');
  withBusy(refineToneBtn, 'Refining...', async () => {
    const data = await api('/refine-tone', {
      method: 'POST',
      body: { post_body: body().innerText, tone: opt.dataset.tone, draft_id: draftId, platform },
    });
    setBody(data.post_body);
    showToast(`Rewritten in a ${opt.dataset.tone} tone · ${data.usage.remaining} left today`, 'palette');
  });
});

const tryOtherIdeasBtn = document.getElementById('tryOtherIdeasBtn');
tryOtherIdeasBtn.addEventListener('click', () => withBusy(tryOtherIdeasBtn, 'Generating Hooks...', async () => {
  const data = await api('/hooks/regenerate', {
    method: 'POST',
    body: { post_body: body().innerText, draft_id: draftId, platform },
  });
  renderHooks(data.hooks);
  showToast(`New hooks generated · ${data.usage.remaining} left today`, 'auto_awesome');
}));

// Publish (mock)
const publishBtn = document.getElementById('publishBtn');
publishBtn.addEventListener('click', async () => {
  publishBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Publishing...';
  await saveDraft(true);
  setTimeout(() => {
    showToast(`Successfully published to ${platformOf(platform).label}!`, 'check_circle');
    publishBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Published';
    publishBtn.classList.replace('bg-primary', 'bg-tertiary');
    setTimeout(() => { window.location.href = '/workspace.html'; }, 2000);
  }, 1500);
});

// Preview interaction mocks
postCanvas.addEventListener('click', (e) => {
  const btn = e.target.closest('.preview-action');
  if (!btn) return;
  btn.classList.toggle('!text-[#E0245E]');
  btn.querySelector('i')?.classList.toggle('fa-solid');
});

loadDraft();
