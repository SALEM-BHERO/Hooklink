import { platformOf, splitThread } from './platforms.js';

const syllables = (w) => {
  const s = w.toLowerCase().replace(/[^a-z]/g, '');
  if (s.length <= 3) return 1;
  return (s.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g) || [1]).length;
};

const level = (score) => (score >= 70 ? 'Easy to read' : score >= 50 ? 'Fairly easy' : score >= 30 ? 'Hard' : 'Very hard');

export function analyze(text, platform) {
  const p = platformOf(platform);
  const clean = text.replace(/#\w+/g, '').replace(/https?:\/\/\S+/g, '');
  const words = clean.match(/[A-Za-z'’]+/g) || [];
  const sentences = Math.max((clean.match(/[^.!?\n]+[.!?\n]+/g) || []).length, 1);
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  const flesch = words.length
    ? Math.round(Math.min(100, Math.max(0, 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syl / words.length))))
    : 0;
  const thread = platform === 'x' ? splitThread(text) : [];
  const len = thread.length > 1 ? Math.max(...thread.map((t) => t.trim().length)) : text.trim().length;
  const [min, max] = p.ideal;
  const lengthFit = len === 0 ? 0 : len < min ? Math.round((len / min) * 100) : len <= max ? 100 : Math.max(0, Math.round(100 - ((len - max) / max) * 100));
  const hashtags = (text.match(/#\w+/g) || []).length;
  const emojis = (text.match(/\p{Extended_Pictographic}/gu) || []).length;
  return {
    flesch, level: level(flesch), lengthFit, len, min, max,
    lengthNote: len < min ? 'A bit short' : len <= max ? 'Ideal length' : len <= p.limit ? 'Longer than ideal' : 'Over the limit',
    hashtags, tagRange: p.tags, tagsOk: hashtags >= p.tags[0] && hashtags <= p.tags[1],
    emojis, words: words.length, readMins: Math.max(1, Math.round(words.length / 200)),
  };
}

const bar = (id, label, value, note, color, unit = '%') => `
  <div class="flex flex-col gap-2" data-testid="analysis-${id}">
    <div class="flex items-center justify-between">
      <span class="text-body-sm font-semibold text-on-surface">${label}</span>
      <span class="text-body-sm font-bold ${color}" data-testid="analysis-${id}-value">${value}${unit}</span>
    </div>
    <div class="w-full h-2 bg-surface-container rounded-full overflow-hidden">
      <div class="h-full rounded-full transition-all duration-700 ${color.replace('text-', 'bg-')}" style="width:${value}%"></div>
    </div>
    <span class="text-[12px] text-on-surface-variant">${note}</span>
  </div>`;

const stat = (id, label, value, ok = true) => `
  <div class="bg-surface-container-low rounded-lg p-3" data-testid="analysis-${id}">
    <p class="text-[11px] uppercase tracking-wider text-on-surface-variant">${label}</p>
    <p class="text-body-md font-bold ${ok ? 'text-on-surface' : 'text-error'}">${value}</p>
  </div>`;

export function renderAnalysis(a) {
  return `
    ${bar('readability', 'Readability', a.flesch, `${a.level} (Flesch reading ease)`, 'text-primary', '/100')}
    ${bar('length', 'Length fit', a.lengthFit, `${a.lengthNote} · ideal ${a.min.toLocaleString()}-${a.max.toLocaleString()} chars`, a.lengthFit >= 80 ? 'text-tertiary' : 'text-error')}
    <div class="grid grid-cols-2 gap-2">
      ${stat('hashtags', `Hashtags (${a.tagRange[0]}-${a.tagRange[1]})`, a.hashtags, a.tagsOk)}
      ${stat('emojis', 'Emojis', a.emojis)}
      ${stat('words', 'Words', a.words)}
      ${stat('read-time', 'Read time', `${a.readMins} min`)}
    </div>`;
}
