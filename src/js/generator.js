/**
 * HookLink AI — Generator Page Script
 * Handles content generation, daily prompt carousel, messy brain dump mode, and voice profiles.
 */

import '../styles/global.css';
import { renderHeader, renderFooter, showToast } from './shared.js';

// ── Mount shared layout ──
renderHeader('workspace');
renderFooter();

// ── Daily Prompts Definition ──
const DAILY_PROMPTS = [
  { day: 'Sun', name: 'Sunday', title: 'Weekly Vision', prompt: 'A mindset reset or core goal for our business this upcoming week' },
  { day: 'Mon', name: 'Monday', title: 'Lesson Learned', prompt: 'A hard lesson I learned last week from a real operational mistake' },
  { day: 'Tue', name: 'Tuesday', title: 'Unpopular Truth', prompt: 'An unpopular truth most founders or professionals in my industry refuse to admit' },
  { day: 'Wed', name: 'Wednesday', title: 'Daily Breakdown', prompt: 'A step-by-step breakdown of a process or tool we rely on every day to get results' },
  { day: 'Thu', name: 'Thursday', title: 'Real Metrics', prompt: 'A transparent breakdown of actual numbers, metrics, or revenue from our business' },
  { day: 'Fri', name: 'Friday', title: 'Week Reflection', prompt: 'A candid reflection or celebration of a key win our team achieved this week' },
  { day: 'Sat', name: 'Saturday', title: 'Behind The Scenes', prompt: 'An unfiltered behind-the-scenes look at how we recharge or solve problems off the clock' }
];

// ── Initialize Daily Inspiration Carousel ──
function initDailyCarousel() {
  const carousel = document.getElementById('dailyCarousel');
  const todayBadge = document.getElementById('todayDayBadge');
  if (!carousel) return;

  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  if (todayBadge) {
    todayBadge.innerText = DAILY_PROMPTS[todayIndex].name;
  }

  carousel.innerHTML = DAILY_PROMPTS.map((item, index) => {
    const isToday = index === todayIndex;
    return `
      <div 
        class="daily-prompt-card shrink-0 w-60 p-3.5 rounded-xl border ${isToday ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant/50 bg-surface-container-low hover:border-primary/40'} cursor-pointer transition-all"
        data-prompt="${item.prompt}"
      >
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold ${isToday ? 'text-primary' : 'text-on-surface'}">${item.name}</span>
          ${isToday ? '<span class="text-[9px] font-black uppercase tracking-wider text-on-primary bg-primary px-1.5 py-0.5 rounded">Today</span>' : `<span class="text-[10px] text-on-surface-variant font-medium">${item.day}</span>`}
        </div>
        <p class="text-xs font-semibold text-on-surface line-clamp-1 mb-1">${item.title}</p>
        <p class="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">${item.prompt}</p>
      </div>
    `;
  }).join('');

  // Wire up click on cards
  carousel.querySelectorAll('.daily-prompt-card').forEach((card) => {
    card.addEventListener('click', () => {
      const topicInput = document.getElementById('topicInput');
      const prompt = card.getAttribute('data-prompt');
      if (topicInput && prompt) {
        topicInput.value = prompt;
        topicInput.focus();
        showToast('Prompt loaded into topic!', 'auto_awesome');
      }
    });
  });
}

// ── Initialize Voice Profile & Brain Dump Mode ──
function initWorkspaceHelpers() {
  const brainDumpToggle = document.getElementById('brainDumpToggle');
  const topicInput = document.getElementById('topicInput');
  const voiceToggleBtn = document.getElementById('voiceProfileToggleBtn');
  const voiceContent = document.getElementById('voiceProfileContent');
  const voiceArrow = document.getElementById('voiceProfileArrow');
  const voiceInput = document.getElementById('voiceProfileInput');
  const voiceBadge = document.getElementById('voiceProfileStatusBadge');
  const clearVoiceBtn = document.getElementById('clearVoiceProfileBtn');

  // Brain Dump Toggle Handler
  if (brainDumpToggle && topicInput) {
    brainDumpToggle.addEventListener('change', () => {
      if (brainDumpToggle.checked) {
        topicInput.placeholder = "Paste your raw thoughts, WhatsApp voice note transcript, meeting bullets, or fragmented ideas here. We will extract the golden insight...";
        showToast('Messy Brain Dump Mode active! Paste unorganized thoughts.', 'mic');
      } else {
        topicInput.placeholder = "e.g., Lessons from scaling a bootstrap team in Zimbabwe...";
      }
    });
  }

  // Load Saved Voice Profile
  const savedProfile = localStorage.getItem('hooklink_voice_profile') || '';
  if (voiceInput && savedProfile) {
    voiceInput.value = savedProfile;
    if (voiceBadge) voiceBadge.classList.remove('hidden');
  }

  // Voice Profile Toggle Expansion
  if (voiceToggleBtn && voiceContent && voiceArrow) {
    voiceToggleBtn.addEventListener('click', () => {
      const isHidden = voiceContent.classList.contains('hidden');
      voiceContent.classList.toggle('hidden');
      voiceArrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  // Save Voice Profile on Input
  if (voiceInput) {
    voiceInput.addEventListener('input', () => {
      const val = voiceInput.value.trim();
      if (val) {
        localStorage.setItem('hooklink_voice_profile', val);
        if (voiceBadge) voiceBadge.classList.remove('hidden');
      } else {
        localStorage.removeItem('hooklink_voice_profile');
        if (voiceBadge) voiceBadge.classList.add('hidden');
      }
    });
  }

  // Clear Voice Profile
  if (clearVoiceBtn && voiceInput) {
    clearVoiceBtn.addEventListener('click', () => {
      voiceInput.value = '';
      localStorage.removeItem('hooklink_voice_profile');
      if (voiceBadge) voiceBadge.classList.add('hidden');
      showToast('Voice profile cleared', 'info');
    });
  }

  // Quick Idea Chips
  document.querySelectorAll('.idea-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (topicInput && prompt) {
        topicInput.value = prompt;
        topicInput.focus();
      }
    });
  });
}

// ── Generate Post Handler ──
async function handleGenerate() {
  const btn = document.getElementById('generateBtn');
  const pulseBar = document.getElementById('generationProgress');
  const topicInput = document.querySelector('textarea[name="topic"]');
  const goalInput = document.querySelector('input[name="goal"]:checked');
  const toneInput = document.querySelector('input[name="tone"]:checked');
  const brainDumpToggle = document.getElementById('brainDumpToggle');

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

  const platformInput = document.querySelector('input[name="platform"]:checked');
  const platform = platformInput ? platformInput.value : 'linkedin';
  const specificDetailInput = document.querySelector('input[name="specificDetail"]');
  const specificDetail = specificDetailInput ? specificDetailInput.value.trim() : '';
  const isBrainDump = brainDumpToggle ? brainDumpToggle.checked : false;
  const voiceProfile = localStorage.getItem('hooklink_voice_profile') || '';

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        goal: goalInput.value,
        tone: toneInput.value,
        platform,
        specificDetail,
        isBrainDump,
        voiceProfile,
        provider: 'groq'
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || 'API Error');
    }
    const data = await res.json();

    // Increment usage count
    currentCount++;
    localStorage.setItem(countKey, currentCount.toString());

    // Save generated content to session state
    sessionStorage.setItem('hooklink_generated_post', data.postBody);
    sessionStorage.setItem('hooklink_generated_hooks', JSON.stringify(data.hooks));
    sessionStorage.setItem('hooklink_platform', platform);

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
    showToast(error.message || 'Something went wrong. Please try again.', 'error');
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
    const name = input.name;
    document.querySelectorAll(`.option-card input[name="${name}"]`).forEach((sibling) => {
      const label = sibling.nextElementSibling;
      if (label) {
        label.classList.remove('border-primary', 'bg-surface-container');
      }
    });

    const selectedLabel = input.nextElementSibling;
    if (selectedLabel) {
      selectedLabel.classList.add('border-primary', 'bg-surface-container');
    }
  });
});

// ── Initialize on DOM Load ──
document.addEventListener('DOMContentLoaded', () => {
  initDailyCarousel();
  initWorkspaceHelpers();
});
