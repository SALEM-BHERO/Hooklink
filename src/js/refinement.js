/**
 * HookLink AI — Post Refinement Page
 * View toggle, hook application, and clipboard interactions
 */

import '../styles/global.css';
import { renderHeader, renderFooter, showToast } from './shared.js';

// ── Bootstrap shared layout ──
renderHeader('library');
renderFooter();

// ── DOM References ──
const desktopViewBtn = document.getElementById('desktopViewBtn');
const mobileViewBtn = document.getElementById('mobileViewBtn');
const postCanvas = document.getElementById('postCanvas');
const postBody = document.getElementById('postBody');
const copyBtn = document.getElementById('copyBtn');

// ═══════════════════════════════════════════════════════════════
//  View Mode Toggle
// ═══════════════════════════════════════════════════════════════

/**
 * Switches the post canvas between desktop (552px) and mobile (375px) widths
 * and toggles the active button styling.
 * @param {'desktop'|'mobile'} mode
 */
function toggleView(mode) {
  if (mode === 'mobile') {
    postCanvas.classList.remove('max-w-[552px]');
    postCanvas.classList.add('max-w-[375px]');

    // Active → mobile
    mobileViewBtn.classList.add('bg-white', 'shadow', 'text-primary');
    mobileViewBtn.classList.remove('text-on-surface-variant');

    // Inactive → desktop
    desktopViewBtn.classList.remove('bg-white', 'shadow', 'text-primary');
    desktopViewBtn.classList.add('text-on-surface-variant');
  } else {
    postCanvas.classList.remove('max-w-[375px]');
    postCanvas.classList.add('max-w-[552px]');

    // Active → desktop
    desktopViewBtn.classList.add('bg-white', 'shadow', 'text-primary');
    desktopViewBtn.classList.remove('text-on-surface-variant');

    // Inactive → mobile
    mobileViewBtn.classList.remove('bg-white', 'shadow', 'text-primary');
    mobileViewBtn.classList.add('text-on-surface-variant');
  }
}

// Expose to window for inline handlers if needed
window.toggleView = toggleView;

desktopViewBtn.addEventListener('click', () => toggleView('desktop'));
mobileViewBtn.addEventListener('click', () => toggleView('mobile'));

// ═══════════════════════════════════════════════════════════════
//  Apply Hook to Draft
// ═══════════════════════════════════════════════════════════════

/**
 * Replaces the first line of the post body with the supplied hook text
 * and briefly highlights the content to indicate the change.
 * @param {string} hookText
 */
function applyHook(hookText) {
  const content = postBody.innerText;
  const lines = content.split('\n');
  lines[0] = hookText;
  postBody.innerText = lines.join('\n');

  // Visual highlight feedback
  postBody.classList.add('bg-primary/5');
  setTimeout(() => {
    postBody.classList.remove('bg-primary/5');
  }, 800);

  showToast('Hook applied to draft', 'auto_awesome');
}

// Wire up all "Apply to Draft" buttons
document.querySelectorAll('.apply-hook-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    // The hook text lives in the sibling <p> inside the same card
    const card = btn.closest('.hook-card');
    const hookText = card.querySelector('p').innerText;
    applyHook(hookText);
  });
});

// ═══════════════════════════════════════════════════════════════
//  Copy Post to Clipboard
// ═══════════════════════════════════════════════════════════════

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(postBody.innerText);
    showToast('Post copied to clipboard', 'content_copy');
  } catch {
    showToast('Failed to copy — try again', 'error');
  }
});

// ═══════════════════════════════════════════════════════════════
//  Copy Individual Hook
// ═══════════════════════════════════════════════════════════════

document.querySelectorAll('.hook-copy-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const card = btn.closest('.hook-card');
    const hookText = card.querySelector('p').innerText;
    try {
      await navigator.clipboard.writeText(hookText);
      showToast('Hook copied to clipboard', 'content_copy');
    } catch {
      showToast('Failed to copy — try again', 'error');
    }
  });
});
