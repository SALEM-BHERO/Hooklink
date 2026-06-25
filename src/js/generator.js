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
async function handleGenerate() {
  const btn = document.getElementById('generateBtn');
  const pulseBar = document.getElementById('generationProgress');
  const topicInput = document.querySelector('textarea[name="topic"]');
  const goalInput = document.querySelector('input[name="goal"]:checked');
  const toneInput = document.querySelector('input[name="tone"]:checked');

  if (!btn || !pulseBar || !topicInput || !goalInput || !toneInput) return;

  // Rate limiting (5 per day)
  const today = new Date().toLocaleDateString();
  const usageKey = 'hooklink_usage_date';
  const countKey = 'hooklink_usage_count';
  
  if (localStorage.getItem(usageKey) !== today) {
    localStorage.setItem(usageKey, today);
    localStorage.setItem(countKey, '0');
  }
  
  let currentCount = parseInt(localStorage.getItem(countKey) || '0');
  if (currentCount >= 5) {
    showToast('Daily limit reached. Please come back tomorrow!', 'error');
    return;
  }

  const topic = topicInput.value.trim();
  if (!topic) {
    showToast('Please enter what you want to talk about.', 'error');
    topicInput.focus();
    return;
  }

  // Disable button & show processing state
  btn.disabled = true;
  btn.classList.add('opacity-80', 'pointer-events-none');
  
  const updateBtnText = (text) => {
    btn.innerHTML = `
      <span class="material-symbols-outlined animate-spin">refresh</span>
      <span>${text}</span>
    `;
  };

  updateBtnText('Generating post...');
  pulseBar.classList.add('active');

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        goal: goalInput.value,
        tone: toneInput.value,
        provider: 'groq'
      })
    });

    if (!res.ok) throw new Error('API Error');
    const data = await res.json();

    // Increment usage count
    currentCount++;
    localStorage.setItem(countKey, currentCount.toString());

    // Save generated content to session state
    sessionStorage.setItem('hooklink_generated_post', data.postBody);
    sessionStorage.setItem('hooklink_generated_hooks', JSON.stringify(data.hooks));

    // Update button to success state
    btn.innerHTML = `
      <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">check_circle</span>
      <span>Draft Ready</span>
    `;
    btn.classList.remove('opacity-80');
    btn.classList.add('bg-primary');

    pulseBar.classList.remove('active');
    showToast('Draft ready! Opening the editor...', 'edit_document');

    setTimeout(() => {
      window.location.href = '/refinement.html';
    }, 1000);

  } catch (error) {
    console.error(error);
    showToast('Generation failed. Is the backend running?', 'error');
    btn.disabled = false;
    btn.classList.remove('opacity-80', 'pointer-events-none');
    updateBtnText('Start Drafting');
    pulseBar.classList.remove('active');
  }
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
