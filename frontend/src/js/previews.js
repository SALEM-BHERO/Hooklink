import { escapeHtml } from './api.js';

const BODY = (cls = '') =>
  `<div id="postBody" data-testid="post-body" contenteditable="true" class="whitespace-pre-line outline-none focus:ring-2 focus:ring-primary/10 rounded transition-all ${cls}"></div>`;
const IMG = '/images/post-visual.png';
const act = (_action, icon, label = '', cls = '') =>
  `<span class="flex items-center justify-center gap-1.5 py-2 ${cls}"><i class="${icon}"></i>${label ? `<span>${label}</span>` : ''}</span>`;

let initials = 'Y';
const avatar = (size = 'w-10 h-10') =>
  `<div class="${size} rounded-full flex-shrink-0 flex items-center justify-center bg-primary text-on-primary font-bold text-[14px]">${initials}</div>`;

const linkedin = ({ name, title }) => `
  <div class="bg-white rounded-lg linkedin-shadow">
    <div class="flex items-start gap-3 p-4">${avatar('w-12 h-12')}
      <div class="flex-1 min-w-0">
        <p class="text-body-sm font-bold text-on-surface">${name}</p>
        <p class="text-[12px] text-on-surface-variant leading-tight mt-0.5">${title}</p>
        <p class="text-[12px] text-on-surface-variant mt-0.5">Now • <i class="fa-solid fa-earth-africa"></i></p>
      </div><i class="fa-solid fa-ellipsis text-on-surface-variant"></i>
    </div>
    ${BODY('px-4 pb-3 text-body-sm text-on-surface')}
    <img src="${IMG}" alt="" class="w-full h-[300px] object-cover" />
    <div class="grid grid-cols-4 px-2 py-1 text-[13px] font-semibold text-on-surface-variant border-t border-outline-variant/30">
      ${act('like', 'fa-regular fa-thumbs-up', 'Like')}${act('comment', 'fa-regular fa-comment-dots', 'Comment')}${act('repost', 'fa-solid fa-retweet', 'Repost')}${act('send', 'fa-regular fa-paper-plane', 'Send')}
    </div>
  </div>`;

const instagram = ({ handle }) => `
  <div class="bg-white rounded-lg border border-black/10 overflow-hidden">
    <div class="flex items-center gap-3 px-3 py-2.5">
      <div class="p-[2px] rounded-full" style="background:linear-gradient(45deg,#feda75,#d62976,#4f5bd5)">${avatar('w-8 h-8 border-2 border-white')}</div>
      <p class="flex-1 text-[13px] font-semibold">${handle}</p><i class="fa-solid fa-ellipsis"></i>
    </div>
    <img src="${IMG}" alt="" class="w-full aspect-square object-cover" />
    <div class="flex items-center gap-1 px-1.5 pt-1 text-[22px]">
      ${act('like', 'fa-regular fa-heart', '', 'px-2')}${act('comment', 'fa-regular fa-comment', '', 'px-2')}${act('send', 'fa-regular fa-paper-plane', '', 'px-2')}
      <span class="flex-1"></span>${act('save', 'fa-regular fa-bookmark', '', 'px-2')}
    </div>
        <div class="px-3 pt-1 pb-4 text-[13px] text-[#262626]"><span class="font-semibold">${handle}</span> ${BODY('inline')}</div>
  </div>`;

const facebook = ({ name }) => `
  <div class="bg-white rounded-lg shadow-sm border border-black/5">
    <div class="flex items-center gap-2.5 px-4 pt-3 pb-2">${avatar()}
      <div class="flex-1"><p class="text-[15px] font-semibold text-[#050505]">${name}</p><p class="text-[13px] text-[#65676B]">Just now · <i class="fa-solid fa-earth-africa"></i></p></div>
      <i class="fa-solid fa-ellipsis text-[#65676B]"></i>
    </div>
    ${BODY('px-4 pb-3 text-[15px] text-[#050505]')}
    <img src="${IMG}" alt="" class="w-full h-[300px] object-cover" />
    <div class="grid grid-cols-3 mx-3 py-1 border-t border-black/10 text-[15px] font-semibold text-[#65676B]">
      ${act('like', 'fa-regular fa-thumbs-up', 'Like')}${act('comment', 'fa-regular fa-comment', 'Comment')}${act('share', 'fa-solid fa-share', 'Share')}
    </div>
  </div>`;

const x = ({ name, handle }) => `
  <div class="bg-white rounded-2xl border border-black/10 p-4 flex gap-3">${avatar()}
    <div class="flex-1 min-w-0">
      <p class="text-[15px]"><span class="font-bold text-[#0F1419]">${name}</span> <span class="text-[#536471]">@${handle} · now</span></p>
      ${BODY('text-[15px] text-[#0F1419] mt-0.5')}
      <img src="${IMG}" alt="" class="mt-3 w-full h-[260px] object-cover rounded-2xl border border-black/10" />
      <div class="flex justify-between mt-2 text-[13px] text-[#536471] max-w-[420px]">
        ${act('reply', 'fa-regular fa-comment')}${act('repost', 'fa-solid fa-retweet')}${act('like', 'fa-regular fa-heart')}${act('views', 'fa-solid fa-chart-simple')}${act('save', 'fa-regular fa-bookmark')}
      </div>
    </div>
  </div>`;

const threads = ({ handle }) => `
  <div class="bg-white rounded-2xl border border-black/10 p-4 flex gap-3">
    <div class="flex flex-col items-center">${avatar('w-9 h-9')}<div class="w-[2px] flex-1 bg-black/10 mt-2 rounded"></div></div>
    <div class="flex-1 min-w-0">
      <p class="text-[15px]"><span class="font-semibold">${handle}</span> <span class="text-[#999]">· now</span></p>
      ${BODY('text-[15px] text-[#101010] mt-0.5')}
      <div class="flex gap-2 mt-3 text-[17px] text-[#101010]">
        ${act('like', 'fa-regular fa-heart', '', 'px-2')}${act('reply', 'fa-regular fa-comment', '', 'px-2')}${act('repost', 'fa-solid fa-retweet', '', 'px-2')}${act('send', 'fa-regular fa-paper-plane', '', 'px-2')}
      </div>
    </div>
  </div>`;

const tiktok = ({ handle }) => `
  <div class="relative mx-auto w-full max-w-[340px] aspect-[9/16] rounded-[28px] overflow-hidden bg-black text-white shadow-2xl">
    <img src="${IMG}" alt="" class="absolute inset-0 w-full h-full object-cover opacity-70" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30"></div>
    <p class="absolute top-4 inset-x-0 text-center text-[15px] font-semibold"><span class="opacity-60">Following</span> &nbsp; For You</p>
    <div class="absolute right-2.5 bottom-24 flex flex-col items-center gap-4 text-[26px]">
      ${avatar('w-11 h-11 border-2 border-white')}
      ${act('like', 'fa-solid fa-heart', '', 'flex-col !gap-0')}${act('comment', 'fa-solid fa-comment-dots', '', 'flex-col')}${act('save', 'fa-solid fa-bookmark', '', 'flex-col')}${act('share', 'fa-solid fa-share', '', 'flex-col')}
    </div>
    <div class="absolute left-3 right-16 bottom-4 max-h-[55%] overflow-y-auto">
      <p class="text-[15px] font-semibold mb-1">@${handle}</p>
      ${BODY('text-[13px] leading-snug')}
      <p class="text-[12px] mt-2 opacity-90"><i class="fa-solid fa-music"></i> original sound - ${handle}</p>
    </div>
  </div>`;

const youtube = ({ name }) => `
  <div class="bg-white rounded-xl overflow-hidden border border-black/10">
    <div class="relative aspect-video bg-black">
      <img src="${IMG}" alt="" class="w-full h-full object-cover" />
      <i class="fa-brands fa-youtube absolute inset-0 m-auto w-fit h-fit text-[56px] text-[#FF0000] drop-shadow"></i>
    </div>
    <div class="p-4">
      <p id="ytTitle" data-testid="youtube-title" class="text-[18px] font-bold text-[#0F0F0F] leading-snug"></p>
      <div class="flex items-center gap-3 mt-3">${avatar('w-9 h-9')}
        <div class="flex-1"><p class="text-[14px] font-semibold">${name}</p></div>
        <span class="bg-[#0F0F0F] text-white text-[14px] font-semibold px-4 py-2 rounded-full">Subscribe</span>
      </div>
      <div class="flex gap-2 mt-3 text-[14px]">${act('like', 'fa-regular fa-thumbs-up', 'Like', 'bg-black/5 px-3 rounded-full')}${act('share', 'fa-solid fa-share', 'Share', 'bg-black/5 px-3 rounded-full')}</div>
      <div class="mt-3 bg-black/5 rounded-xl p-3 text-[14px] text-[#0F0F0F]"><p class="font-semibold mb-1">Description</p>${BODY()}</div>
    </div>
  </div>`;

const TEMPLATES = { linkedin, instagram, facebook, x, threads, tiktok, youtube };

export function renderPreview(platform, profile) {
  initials = escapeHtml((profile.name.match(/\b\w/g) || ['Y']).slice(0, 2).join('').toUpperCase());
  const safe = { name: escapeHtml(profile.name), title: escapeHtml(profile.title), handle: escapeHtml(profile.handle) };
  return (TEMPLATES[platform] || linkedin)(safe);
}
