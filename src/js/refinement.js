/**
 * HookLink AI — Post Refinement Page
 * Multi-Platform view toggle, live character counter, AI humanizer, and hook application.
 */

import '../styles/global.css';
import { renderHeader, renderFooter, showToast } from './shared.js';

// ── Bootstrap shared layout ──
renderHeader('library');
renderFooter();

// ── Localize Profile ──
let authorName = 'Alex Sterling';
let authorHandle = 'alexsterling';
let authorTitle = 'Founder @ HookLink AI | Content Systems';

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
if (timeZone.startsWith('Africa/')) {
  authorName = 'Tadiwa Maphosa';
  authorHandle = 'tadiwa.maphosa';
  authorTitle = 'Founder @ HookLink AI | Scaling African Tech';
} else if (timeZone.startsWith('Europe/')) {
  authorName = 'Alex Sterling';
  authorHandle = 'alexsterling';
  authorTitle = 'Founder @ HookLink AI | High-Performance Content Systems';
} else {
  authorName = 'Jordan Miller';
  authorHandle = 'jordan.miller';
  authorTitle = 'Founder @ HookLink AI | Digital Growth Strategist';
}

// ── DOM References ──
const desktopViewBtn = document.getElementById('desktopViewBtn');
const mobileViewBtn = document.getElementById('mobileViewBtn');
const postCanvas = document.getElementById('postCanvas');
const postBody = document.getElementById('postBody');
const copyBtn = document.getElementById('copyBtn');
const charCountBadge = document.getElementById('charCountBadge');
const humanizeBtn = document.getElementById('humanizeBtn');
const adaptPlatformBtn = document.getElementById('adaptPlatformBtn');
const platformHeader = document.getElementById('platformHeader');
const platformFooter = document.getElementById('platformFooter');
const postImageContainer = document.getElementById('postImageContainer');

let currentPlatform = sessionStorage.getItem('hooklink_platform') || 'linkedin';

// ═══════════════════════════════════════════════════════════════
//  View Mode Toggle (Desktop vs Mobile)
// ═══════════════════════════════════════════════════════════════
function toggleView(mode) {
  if (mode === 'mobile') {
    postCanvas.classList.remove('max-w-[552px]');
    postCanvas.classList.add('max-w-[375px]');

    mobileViewBtn.classList.add('bg-white', 'shadow', 'text-primary');
    mobileViewBtn.classList.remove('text-on-surface-variant');

    desktopViewBtn.classList.remove('bg-white', 'shadow', 'text-primary');
    desktopViewBtn.classList.add('text-on-surface-variant');
  } else {
    postCanvas.classList.remove('max-w-[375px]');
    postCanvas.classList.add('max-w-[552px]');

    desktopViewBtn.classList.add('bg-white', 'shadow', 'text-primary');
    desktopViewBtn.classList.remove('text-on-surface-variant');

    mobileViewBtn.classList.remove('bg-white', 'shadow', 'text-primary');
    mobileViewBtn.classList.add('text-on-surface-variant');
  }
}

if (desktopViewBtn) desktopViewBtn.addEventListener('click', () => toggleView('desktop'));
if (mobileViewBtn) mobileViewBtn.addEventListener('click', () => toggleView('mobile'));

// ═══════════════════════════════════════════════════════════════
//  Live Character & Word Counter
// ═══════════════════════════════════════════════════════════════
function updateStats() {
  if (!postBody || !charCountBadge) return;
  const text = postBody.innerText.trim();
  const chars = text.length;
  const words = text ? text.split(/\s+/).length : 0;

  if (currentPlatform === 'twitter') {
    if (chars > 280) {
      charCountBadge.innerHTML = `<span class="text-amber-600 font-bold">${chars}/280 chars • Thread Mode</span>`;
      charCountBadge.className = 'hidden sm:inline-flex items-center text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-300';
    } else {
      charCountBadge.innerHTML = `<span class="text-primary font-bold">${chars}/280 chars</span> • ${words} words`;
      charCountBadge.className = 'hidden sm:inline-flex items-center text-xs font-medium text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30';
    }
  } else {
    charCountBadge.innerHTML = `${chars} chars • ${words} words`;
    charCountBadge.className = 'hidden sm:inline-flex items-center text-xs font-medium text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30';
  }
}

if (postBody) {
  postBody.addEventListener('input', updateStats);
}

// ═══════════════════════════════════════════════════════════════
//  Multi-Platform Mockup Rendering
// ═══════════════════════════════════════════════════════════════
function renderPlatformFrame(platform) {
  currentPlatform = platform;
  sessionStorage.setItem('hooklink_platform', platform);

  // Update Tab Styling
  document.querySelectorAll('.platform-tab-btn').forEach((btn) => {
    if (btn.getAttribute('data-platform') === platform) {
      btn.className = 'platform-tab-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all bg-primary text-on-primary shadow-sm cursor-pointer shrink-0';
    } else {
      btn.className = 'platform-tab-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all bg-surface-container text-on-surface hover:text-primary cursor-pointer shrink-0';
    }
  });

  // Render Header according to platform
  if (platformHeader) {
    if (platform === 'instagram') {
      platformHeader.innerHTML = `
        <div class="flex items-center justify-between p-3.5 border-b border-outline-variant/20">
          <div class="flex items-center gap-3">
            <div class="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
              <img src="/images/avatar.png" alt="${authorName}" class="w-9 h-9 rounded-full object-cover border-2 border-white" />
            </div>
            <div>
              <div class="flex items-center gap-1">
                <span class="text-xs font-bold text-on-surface">${authorHandle}</span>
                <span class="text-xs text-primary font-bold cursor-pointer ml-1.5">• Follow</span>
              </div>
              <p class="text-[10px] text-on-surface-variant">Harare, Zimbabwe</p>
            </div>
          </div>
          <span class="material-symbols-outlined text-[18px] text-on-surface-variant cursor-pointer">more_horiz</span>
        </div>
      `;
    } else if (platform === 'twitter') {
      platformHeader.innerHTML = `
        <div class="flex items-start justify-between p-4 pb-2">
          <div class="flex items-start gap-3">
            <img src="/images/avatar.png" alt="${authorName}" class="w-10 h-10 rounded-full object-cover shrink-0" />
            <div>
              <div class="flex items-center gap-1">
                <span class="text-sm font-bold text-on-surface">${authorName}</span>
                <span class="material-symbols-outlined text-[15px] text-primary" style="font-variation-settings: 'FILL' 1">verified</span>
                <span class="text-xs text-on-surface-variant">@${authorHandle} • 2h</span>
              </div>
            </div>
          </div>
          <span class="font-bold text-sm text-on-surface-variant">𝕏</span>
        </div>
      `;
    } else if (platform === 'facebook') {
      platformHeader.innerHTML = `
        <div class="flex items-start justify-between p-4 pb-2">
          <div class="flex items-start gap-3">
            <img src="/images/avatar.png" alt="${authorName}" class="w-10 h-10 rounded-full object-cover shrink-0" />
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-bold text-on-surface">${authorName}</span>
                <span class="material-symbols-outlined text-[14px] text-blue-600" style="font-variation-settings: 'FILL' 1">check_circle</span>
              </div>
              <p class="text-[11px] text-on-surface-variant">2 hrs ago • 🌐 Public</p>
            </div>
          </div>
          <span class="material-symbols-outlined text-[18px] text-on-surface-variant cursor-pointer">more_horiz</span>
        </div>
      `;
    } else if (platform === 'threads') {
      platformHeader.innerHTML = `
        <div class="flex items-center justify-between p-4 pb-2">
          <div class="flex items-center gap-3">
            <img src="/images/avatar.png" alt="${authorName}" class="w-9 h-9 rounded-full object-cover shrink-0" />
            <div>
              <span class="text-sm font-bold text-on-surface">${authorHandle}</span>
              <span class="text-xs text-on-surface-variant ml-1">2h</span>
            </div>
          </div>
          <span class="material-symbols-outlined text-[18px] text-on-surface-variant cursor-pointer">more_horiz</span>
        </div>
      `;
    } else {
      // Default LinkedIn
      platformHeader.innerHTML = `
        <div class="flex items-start gap-3 p-4">
          <img src="/images/avatar.png" alt="${authorName}" class="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1">
              <span class="text-body-sm font-bold text-on-surface hover:text-primary transition-colors">${authorName}</span>
              <span class="text-body-sm text-on-surface-variant">• 1st</span>
            </div>
            <p class="text-[12px] text-on-surface-variant leading-tight mt-0.5">${authorTitle}</p>
            <p class="text-[12px] text-on-surface-variant leading-tight mt-0.5">2h • 🌐</p>
          </div>
          <button class="text-on-surface-variant hover:text-primary flex-shrink-0">
            <span class="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>
        </div>
      `;
    }
  }

  // Render Footer according to platform
  if (platformFooter) {
    if (platform === 'instagram') {
      platformFooter.innerHTML = `
        <div class="p-3.5 pt-2 border-t border-outline-variant/20">
          <div class="flex items-center justify-between mb-2.5">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-[24px] cursor-pointer hover:text-rose-500 transition-colors">favorite</span>
              <span class="material-symbols-outlined text-[24px] cursor-pointer hover:text-primary transition-colors">mode_comment</span>
              <span class="material-symbols-outlined text-[24px] cursor-pointer hover:text-primary transition-colors">send</span>
            </div>
            <span class="material-symbols-outlined text-[24px] cursor-pointer hover:text-primary transition-colors">bookmark</span>
          </div>
          <p class="text-xs font-bold text-on-surface">Liked by 418 people</p>
          <p class="text-[11px] text-on-surface-variant mt-1 cursor-pointer">View all 29 comments</p>
          <p class="text-[9px] uppercase tracking-wider text-on-surface-variant/70 mt-1">2 HOURS AGO</p>
        </div>
      `;
    } else if (platform === 'twitter') {
      platformFooter.innerHTML = `
        <div class="p-3.5 pt-2 border-t border-outline-variant/20">
          <div class="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
            <span>2:45 PM · Nov 2, 2026</span>
            <span>·</span>
            <span class="font-semibold text-on-surface">1,490</span> Views
          </div>
          <div class="flex items-center justify-between text-on-surface-variant pt-2 border-t border-outline-variant/20">
            <button class="flex items-center gap-1.5 hover:text-blue-500 transition-colors text-xs">
              <span class="material-symbols-outlined text-[18px]">chat_bubble</span> 24
            </button>
            <button class="flex items-center gap-1.5 hover:text-green-500 transition-colors text-xs">
              <span class="material-symbols-outlined text-[18px]">repeat</span> 68
            </button>
            <button class="flex items-center gap-1.5 hover:text-rose-500 transition-colors text-xs">
              <span class="material-symbols-outlined text-[18px]">favorite</span> 312
            </button>
            <button class="flex items-center gap-1.5 hover:text-primary transition-colors text-xs">
              <span class="material-symbols-outlined text-[18px]">bookmark</span> 49
            </button>
            <button class="flex items-center hover:text-primary transition-colors text-xs">
              <span class="material-symbols-outlined text-[18px]">share</span>
            </button>
          </div>
        </div>
      `;
    } else if (platform === 'facebook') {
      platformFooter.innerHTML = `
        <div class="px-4 py-2 border-t border-outline-variant/20">
          <div class="flex items-center justify-between text-xs text-on-surface-variant pb-2 border-b border-outline-variant/20">
            <div class="flex items-center gap-1">
              <span class="text-xs">👍❤️</span>
              <span>184</span>
            </div>
            <div>
              <span>32 comments</span> · <span>18 shares</span>
            </div>
          </div>
          <div class="grid grid-cols-3 pt-1 text-xs font-semibold text-on-surface-variant">
            <button class="flex items-center justify-center gap-2 py-2 hover:bg-surface-container rounded-lg transition-colors">
              <span class="material-symbols-outlined text-[18px]">thumb_up</span> Like
            </button>
            <button class="flex items-center justify-center gap-2 py-2 hover:bg-surface-container rounded-lg transition-colors">
              <span class="material-symbols-outlined text-[18px]">chat</span> Comment
            </button>
            <button class="flex items-center justify-center gap-2 py-2 hover:bg-surface-container rounded-lg transition-colors">
              <span class="material-symbols-outlined text-[18px]">share</span> Share
            </button>
          </div>
        </div>
      `;
    } else if (platform === 'threads') {
      platformFooter.innerHTML = `
        <div class="p-4 pt-1">
          <div class="flex items-center gap-4 text-on-surface-variant mb-2">
            <span class="material-symbols-outlined text-[20px] cursor-pointer hover:text-rose-500">favorite</span>
            <span class="material-symbols-outlined text-[20px] cursor-pointer hover:text-primary">mode_comment</span>
            <span class="material-symbols-outlined text-[20px] cursor-pointer hover:text-primary">repeat</span>
            <span class="material-symbols-outlined text-[20px] cursor-pointer hover:text-primary">send</span>
          </div>
          <p class="text-xs text-on-surface-variant">38 replies · 112 likes</p>
        </div>
      `;
    } else {
      // Default LinkedIn
      platformFooter.innerHTML = `
        <div class="px-4 pt-3 pb-1 border-t border-outline-variant/20">
          <div class="flex items-center justify-between text-[12px] text-on-surface-variant pb-2 border-b border-outline-variant/30">
            <div class="flex items-center gap-1">
              <span class="flex items-center justify-center w-5 h-5 bg-primary rounded-full">
                <span class="material-symbols-outlined text-on-primary text-[12px]">thumb_up</span>
              </span>
              <span class="flex items-center justify-center w-5 h-5 bg-tertiary rounded-full -ml-1.5">
                <span class="material-symbols-outlined text-on-tertiary text-[12px]">rocket_launch</span>
              </span>
              <span class="ml-1" id="likeCount">124 others</span>
            </div>
            <span id="commentCount">18 comments</span>
          </div>
          <div class="grid grid-cols-4 py-1" id="reactionBar">
            <button data-action="like" class="flex items-center justify-center gap-1.5 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-[13px] font-semibold">
              <span class="material-symbols-outlined text-[20px]">thumb_up</span> Like
            </button>
            <button data-action="comment" class="flex items-center justify-center gap-1.5 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-[13px] font-semibold">
              <span class="material-symbols-outlined text-[20px]">comment</span> Comment
            </button>
            <button data-action="repost" class="flex items-center justify-center gap-1.5 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-[13px] font-semibold">
              <span class="material-symbols-outlined text-[20px]">repeat</span> Repost
            </button>
            <button data-action="send" class="flex items-center justify-center gap-1.5 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-[13px] font-semibold">
              <span class="material-symbols-outlined text-[20px]">send</span> Send
            </button>
          </div>
        </div>
      `;
    }
  }

  updateStats();
}

// Wire up Platform Tab clicks
document.querySelectorAll('.platform-tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const platform = btn.getAttribute('data-platform');
    renderPlatformFrame(platform);
  });
});

// ═══════════════════════════════════════════════════════════════
//  One-Click "Humanize" Engine (Scrub AI Clichés)
// ═══════════════════════════════════════════════════════════════
const AI_REPLACEMENTS = [
  { match: /\bdelve into\b/gi, replace: 'explore' },
  { match: /\bdelve\b/gi, replace: 'look' },
  { match: /\bgame-changer\b/gi, replace: 'huge shift' },
  { match: /\btestament to\b/gi, replace: 'clear proof of' },
  { match: /\bunlock(?:ing)?\b/gi, replace: 'discovering' },
  { match: /\bnavigat(?:e|ing)\b/gi, replace: 'working through' },
  { match: /\bin today's (?:fast-paced|rapidly evolving) world\b/gi, replace: 'right now' },
  { match: /\bseamlessly\b/gi, replace: 'easily' },
  { match: /\bleverage\b/gi, replace: 'use' },
  { match: /\bharness\b/gi, replace: 'use' },
  { match: /\btapestry\b/gi, replace: 'mix' },
  { match: /\bpivotal\b/gi, replace: 'crucial' },
  { match: /\bit is important to remember that\b/gi, replace: 'remember:' },
  { match: /\bfoster(?:ing)?\b/gi, replace: 'building' }
];

if (humanizeBtn) {
  humanizeBtn.addEventListener('click', () => {
    if (!postBody) return;
    let text = postBody.innerText;
    let count = 0;

    AI_REPLACEMENTS.forEach(({ match, replace }) => {
      const occurrences = (text.match(match) || []).length;
      if (occurrences > 0) {
        count += occurrences;
        text = text.replace(match, replace);
      }
    });

    if (count > 0) {
      postBody.innerText = text;
      postBody.classList.add('bg-primary/5');
      setTimeout(() => postBody.classList.remove('bg-primary/5'), 800);
      showToast(`Scrubbed ${count} AI buzzwords! Natural tone restored.`, 'auto_fix_high');
      updateStats();
    } else {
      showToast('Your draft is already clean and human-sounding!', 'check_circle');
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  Adapt Draft to Current Platform
// ═══════════════════════════════════════════════════════════════
if (adaptPlatformBtn) {
  adaptPlatformBtn.addEventListener('click', async () => {
    if (!postBody) return;
    const currentText = postBody.innerText.trim();
    if (!currentText) return;

    const originalBtn = adaptPlatformBtn.innerHTML;
    adaptPlatformBtn.disabled = true;
    adaptPlatformBtn.innerHTML = `
      <span class="material-symbols-outlined animate-spin text-[16px]">refresh</span>
      Adapting for ${currentPlatform}...
    `;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentText,
          goal: `Reformat and optimize this exact post natively for ${currentPlatform.toUpperCase()}. Keep the core message but adapt paragraph lengths, hooks, call to action, and hashtags to fit ${currentPlatform} culture.`,
          tone: 'Authentic',
          platform: currentPlatform,
          provider: 'groq'
        })
      });

      if (!res.ok) throw new Error('Failed to adapt content');
      const data = await res.json();

      postBody.innerText = data.postBody;
      sessionStorage.setItem('hooklink_generated_post', data.postBody);
      sessionStorage.setItem('hooklink_generated_hooks', JSON.stringify(data.hooks));

      // Update hook cards
      const hookCards = document.querySelectorAll('.hook-card');
      if (data.hooks) {
        data.hooks.forEach((hook, index) => {
          if (hookCards[index]) {
            const titleEl = hookCards[index].querySelector('h4') || hookCards[index].querySelector('span');
            const textEl = hookCards[index].querySelector('p');
            if (titleEl) titleEl.innerText = hook.title;
            if (textEl) textEl.innerText = hook.text;
          }
        });
      }

      showToast(`Adapted post for ${currentPlatform.toUpperCase()}!`, 'auto_awesome');
      updateStats();

    } catch (err) {
      console.error(err);
      showToast('Could not adapt draft. Please try again.', 'error');
    } finally {
      adaptPlatformBtn.innerHTML = originalBtn;
      adaptPlatformBtn.disabled = false;
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  Apply Hook to Draft
// ═══════════════════════════════════════════════════════════════
function applyHook(hookText) {
  const content = postBody.innerText;
  const lines = content.split('\n');
  lines[0] = hookText;
  postBody.innerText = lines.join('\n');

  postBody.classList.add('bg-primary/5');
  setTimeout(() => {
    postBody.classList.remove('bg-primary/5');
  }, 800);

  updateStats();
  showToast('Hook applied to draft', 'auto_awesome');
}

document.querySelectorAll('.apply-hook-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.hook-card');
    const hookText = card.querySelector('p').innerText;
    applyHook(hookText);
  });
});

// ═══════════════════════════════════════════════════════════════
//  Copy to Clipboard
// ═══════════════════════════════════════════════════════════════
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(postBody.innerText);
      showToast('Post copied to clipboard', 'content_copy');
    } catch {
      showToast('Failed to copy — try again', 'error');
    }
  });
}

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

// ═══════════════════════════════════════════════════════════════
//  Dynamic State Loading
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const generatedPost = sessionStorage.getItem('hooklink_generated_post');
  const generatedHooksRaw = sessionStorage.getItem('hooklink_generated_hooks');
  const savedPlatform = sessionStorage.getItem('hooklink_platform') || 'linkedin';

  if (generatedPost && postBody) {
    postBody.innerText = generatedPost;
  }

  if (generatedHooksRaw) {
    try {
      const hooks = JSON.parse(generatedHooksRaw);
      const hookCards = document.querySelectorAll('.hook-card');
      
      hooks.forEach((hook, index) => {
        if (hookCards[index]) {
          const titleEl = hookCards[index].querySelector('h4');
          const textEl = hookCards[index].querySelector('p');
          if (titleEl) titleEl.innerText = hook.title;
          if (textEl) textEl.innerText = hook.text;
        }
      });
    } catch(e) {
      console.error('Failed to parse hooks from session', e);
    }
  }

  renderPlatformFrame(savedPlatform);
  updateStats();
});

// ═══════════════════════════════════════════════════════════════
//  Publish & Other Ideas
// ═══════════════════════════════════════════════════════════════
const publishBtn = document.getElementById('publishBtn');
if (publishBtn) {
  publishBtn.addEventListener('click', () => {
    publishBtn.innerHTML = `
      <span class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
      Publishing...
    `;
    setTimeout(() => {
      showToast(`Successfully prepared for ${currentPlatform.toUpperCase()}!`, 'check_circle');
      publishBtn.innerHTML = `
        <span class="material-symbols-outlined text-[18px]">check</span>
        Ready
      `;
      publishBtn.classList.replace('bg-primary', 'bg-tertiary');
      setTimeout(() => { window.location.href = '/workspace.html'; }, 2000);
    }, 1200);
  });
}

const tryOtherIdeasBtn = document.getElementById('tryOtherIdeasBtn');
if (tryOtherIdeasBtn) {
  tryOtherIdeasBtn.addEventListener('click', async () => {
    const originalText = tryOtherIdeasBtn.innerHTML;
    tryOtherIdeasBtn.disabled = true;
    tryOtherIdeasBtn.innerHTML = `
      <span class="material-symbols-outlined animate-spin text-[18px]">refresh</span>
      Generating Hooks...
    `;
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: postBody.innerText.substring(0, 500), 
          goal: `Generate 3 alternative opening hooks optimized specifically for ${currentPlatform.toUpperCase()}. Make them very different from each other.`,
          tone: 'Authentic',
          platform: currentPlatform,
          provider: 'groq'
        })
      });

      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      
      const hookCards = document.querySelectorAll('.hook-card');
      data.hooks.forEach((hook, index) => {
        if (hookCards[index]) {
          const titleEl = hookCards[index].querySelector('h4') || hookCards[index].querySelector('span');
          const textEl = hookCards[index].querySelector('p');
          if (titleEl) titleEl.innerText = hook.title;
          if (textEl) textEl.innerText = hook.text;
        }
      });
      
      sessionStorage.setItem('hooklink_generated_hooks', JSON.stringify(data.hooks));
      showToast(`New ${currentPlatform.toUpperCase()} hooks generated!`, 'auto_awesome');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate new hooks.', 'error');
    } finally {
      tryOtherIdeasBtn.innerHTML = originalText;
      tryOtherIdeasBtn.disabled = false;
    }
  });
}
