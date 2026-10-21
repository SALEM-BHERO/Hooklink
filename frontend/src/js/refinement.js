import '../styles/global.css';
import { renderHeader, renderFooter, showToast } from './shared.js';
import { api } from './api.js';

renderHeader('workspace');
renderFooter();

const draftId = new URLSearchParams(window.location.search).get('draft');

// Localized mock profile
const profileNameEl = document.getElementById('profileName');
const profileTitleEl = document.getElementById('profileTitle');
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
const profile = tz.startsWith('Africa/')
  ? ['Tadiwa Maphosa', 'Founder @ HookLink AI | Scaling African Tech']
  : tz.startsWith('Europe/')
    ? ['Alex Sterling', 'Founder @ HookLink AI | High-Performance Content Systems']
    : ['Jordan Miller', 'Founder @ HookLink AI | Digital Growth Strategist'];
profileNameEl.textContent = profile[0];
profileTitleEl.textContent = profile[1];

const desktopViewBtn = document.getElementById('desktopViewBtn');
const mobileViewBtn = document.getElementById('mobileViewBtn');
const postCanvas = document.getElementById('postCanvas');
const postBody = document.getElementById('postBody');
const hookCards = () => document.querySelectorAll('.hook-card');

document.querySelectorAll('.hook-card').forEach((card, i) => {
  card.dataset.testid = `hook-card-${i}`;
  card.querySelector('span').classList.add('hook-title');
  card.querySelector('p').classList.add('hook-text');
  card.querySelector('.apply-hook-btn').dataset.testid = `apply-hook-btn-${i}`;
  card.querySelector('.hook-copy-btn').dataset.testid = `copy-hook-btn-${i}`;
});

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

function currentHooks() {
  return [...hookCards()].map((c) => ({
    title: c.querySelector('.hook-title').innerText,
    text: c.querySelector('.hook-text').innerText,
  }));
}

function flash() {
  postBody.classList.add('bg-primary/5');
  setTimeout(() => postBody.classList.remove('bg-primary/5'), 800);
}

async function loadDraft() {
  if (!draftId) return;
  try {
    const draft = await api(`/drafts/${draftId}`);
    postBody.innerText = draft.post_body;
    renderHooks(draft.hooks);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function saveDraft(silent = false) {
  if (!draftId) {
    if (!silent) showToast('Generate a post in the Workspace to save drafts.', 'info');
    return;
  }
  try {
    await api(`/drafts/${draftId}`, { method: 'PUT', body: { post_body: postBody.innerText, hooks: currentHooks() } });
    if (!silent) showToast('Draft saved', 'save');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// Busy-state wrapper for AI buttons
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

hookCards().forEach((card) => {
  card.querySelector('.apply-hook-btn').addEventListener('click', () => {
    const lines = postBody.innerText.split('\n');
    lines[0] = card.querySelector('.hook-text').innerText;
    postBody.innerText = lines.join('\n');
    flash();
    showToast('Hook applied to draft', 'auto_awesome');
    saveDraft(true);
  });
  card.querySelector('.hook-copy-btn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(card.querySelector('.hook-text').innerText);
      showToast('Hook copied to clipboard', 'content_copy');
    } catch {
      showToast('Failed to copy — try again', 'error');
    }
  });
});

document.getElementById('copyBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(postBody.innerText);
    showToast('Post copied to clipboard', 'content_copy');
  } catch {
    showToast('Failed to copy — try again', 'error');
  }
});

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
      body: { post_body: postBody.innerText, tone: opt.dataset.tone, draft_id: draftId },
    });
    postBody.innerText = data.post_body;
    flash();
    showToast(`Rewritten in a ${opt.dataset.tone} tone · ${data.usage.remaining} left today`, 'palette');
  });
});

// Regenerate hooks
const tryOtherIdeasBtn = document.getElementById('tryOtherIdeasBtn');
tryOtherIdeasBtn.addEventListener('click', () => withBusy(tryOtherIdeasBtn, 'Generating Hooks...', async () => {
  const data = await api('/hooks/regenerate', {
    method: 'POST',
    body: { post_body: postBody.innerText, draft_id: draftId },
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
    showToast('Successfully published to LinkedIn!', 'check_circle');
    publishBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Published';
    publishBtn.classList.replace('bg-primary', 'bg-tertiary');
    setTimeout(() => { window.location.href = '/workspace.html'; }, 2000);
  }, 1500);
});

// Reaction mock
const likeCountEl = document.getElementById('likeCount');
const commentCountEl = document.getElementById('commentCount');
let hasLiked = false;
let comments = 0;
document.getElementById('reactionBar').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'like') {
    hasLiked = !hasLiked;
    likeCountEl.innerText = hasLiked ? 'You and 0 others' : '0 others';
    btn.classList.toggle('text-primary');
  } else if (action === 'comment') {
    comments++;
    commentCountEl.innerText = `${comments} comments`;
    showToast('Opening comment editor...', 'comment');
  } else {
    showToast(`${action} action clicked.`, 'info');
  }
});

loadDraft();
