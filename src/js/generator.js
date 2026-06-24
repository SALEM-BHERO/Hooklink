/**
 * HookLink AI — Generator Page Script
 * Handles the content generation form, AI simulation, and navigation.
 */

import '../styles/global.css';
import { renderHeader, renderFooter, showToast } from './shared.js';

// ── Mount shared layout ──
renderHeader('workspace');
renderFooter();

// ── Generate Post Handler ──
function handleGenerate() {
  const btn = document.getElementById('generateBtn');
  const pulseBar = document.getElementById('generationProgress');

  if (!btn || !pulseBar) return;

  // Disable button & show processing state
  btn.disabled = true;
  btn.classList.add('opacity-80', 'pointer-events-none');
  btn.innerHTML = `
    <span class="material-symbols-outlined animate-spin">refresh</span>
    <span>Processing...</span>
  `;

  // Activate AI pulse bar
  pulseBar.classList.add('active');

  // After 3s — generation "complete"
  setTimeout(() => {
    // Update button to success state
    btn.innerHTML = `
      <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">check_circle</span>
      <span>Post Ready</span>
    `;
    btn.classList.remove('opacity-80');
    btn.classList.add('bg-primary');

    // Hide pulse bar
    pulseBar.classList.remove('active');

    // Show toast notification
    showToast('Generation Complete! View in Post Previews.', 'auto_awesome');

    // After 5s — redirect to refinement page
    setTimeout(() => {
      window.location.href = '/refinement.html';
    }, 5000);
  }, 3000);
}

// ── Expose to window for onclick ──
window.handleGenerate = handleGenerate;

// ── Option Card Change Listeners ──
document.querySelectorAll('.option-card input[type="radio"]').forEach((input) => {
  input.addEventListener('change', () => {
    // Get all cards in the same group
    const name = input.name;
    document.querySelectorAll(`.option-card input[name="${name}"]`).forEach((sibling) => {
      const label = sibling.nextElementSibling;
      if (label) {
        label.classList.remove('border-primary', 'bg-surface-container');
      }
    });

    // Highlight selected card label (CSS handles via :checked, this adds extra feedback)
    const selectedLabel = input.nextElementSibling;
    if (selectedLabel) {
      selectedLabel.classList.add('border-primary', 'bg-surface-container');
    }
  });
});
