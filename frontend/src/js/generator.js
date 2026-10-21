import '../styles/global.css';
import { renderHeader, renderFooter, showToast } from './shared.js';
import { api, escapeHtml } from './api.js';

renderHeader('workspace');
renderFooter();

const usageEl = document.getElementById('usageRemaining');
const draftsList = document.getElementById('draftsList');

function renderUsage(usage) {
  if (usageEl) usageEl.textContent = `${usage.remaining} of ${usage.limit} free generations left today`;
}

function draftItem(d) {
  const date = new Date(d.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `
    <li class="draft-item group flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors" data-id="${d.id}" data-testid="draft-item-${d.id}">
      <a href="/refinement.html?draft=${d.id}" class="flex-1 min-w-0 no-underline" data-testid="draft-open-${d.id}">
        <p class="text-body-sm font-semibold text-on-surface truncate">${escapeHtml(d.topic)}</p>
        <p class="text-[12px] text-on-surface-variant mt-0.5 capitalize">${date} · ${escapeHtml(d.tone)}</p>
      </a>
      <button class="draft-delete-btn opacity-60 group-hover:opacity-100 p-1 rounded-md text-on-surface-variant hover:text-error transition-opacity" title="Delete draft" data-testid="draft-delete-${d.id}">
        <span class="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </li>`;
}

async function loadDrafts() {
  if (!draftsList) return;
  try {
    const drafts = await api('/drafts?limit=8');
    draftsList.innerHTML = drafts.length
      ? drafts.map(draftItem).join('')
      : '<li class="text-body-sm text-on-surface-variant p-3" data-testid="drafts-empty">No drafts yet. Your generated posts will show up here.</li>';
  } catch (e) {
    draftsList.innerHTML = `<li class="text-body-sm text-error p-3">${escapeHtml(e.message)}</li>`;
  }
}

draftsList?.addEventListener('click', async (e) => {
  const btn = e.target.closest('.draft-delete-btn');
  if (!btn) return;
  const id = btn.closest('.draft-item').dataset.id;
  try {
    await api(`/drafts/${id}`, { method: 'DELETE' });
    showToast('Draft deleted', 'delete');
    loadDrafts();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

async function handleGenerate() {
  const btn = document.getElementById('generateBtn');
  const pulseBar = document.getElementById('generationProgress');
  const topicInput = document.querySelector('textarea[name="topic"]');
  const goalInput = document.querySelector('input[name="goal"]:checked');
  const toneInput = document.querySelector('input[name="tone"]:checked');

  const topic = topicInput.value.trim();
  if (!topic) {
    showToast('Please enter what you want to talk about.', 'error');
    topicInput.focus();
    return;
  }

  btn.disabled = true;
  btn.classList.add('opacity-80', 'pointer-events-none');
  const setBtn = (icon, text, spin = false) => {
    btn.innerHTML = `<span class="material-symbols-outlined ${spin ? 'animate-spin' : ''}">${icon}</span><span>${text}</span>`;
  };
  setBtn('refresh', 'Generating post...', true);
  pulseBar.classList.add('active');

  try {
    const { draft, usage } = await api('/generate', {
      method: 'POST',
      body: { topic, goal: goalInput.value, tone: toneInput.value, provider: 'groq' },
    });
    renderUsage(usage);
    setBtn('check_circle', 'Draft Ready');
    btn.classList.remove('opacity-80');
    pulseBar.classList.remove('active');
    showToast('Draft ready! Opening the editor...', 'edit_document');
    setTimeout(() => { window.location.href = `/refinement.html?draft=${draft.id}`; }, 1000);
  } catch (error) {
    showToast(error.message, 'error');
    btn.disabled = false;
    btn.classList.remove('opacity-80', 'pointer-events-none');
    setBtn('draw', 'Start Drafting');
    pulseBar.classList.remove('active');
  }
}

window.handleGenerate = handleGenerate;

document.querySelectorAll('.option-card input[type="radio"]').forEach((input) => {
  input.addEventListener('change', () => {
    document.querySelectorAll(`.option-card input[name="${input.name}"]`).forEach((sibling) => {
      sibling.nextElementSibling?.classList.remove('border-primary', 'bg-surface-container');
    });
    input.nextElementSibling?.classList.add('border-primary', 'bg-surface-container');
  });
});

api('/usage').then(renderUsage).catch(() => {});
loadDrafts();
