export const PLATFORMS = {
  linkedin: { label: 'LinkedIn', icon: 'fa-brands fa-linkedin', color: '#0A66C2', limit: 3000, ideal: [600, 1800], tags: [3, 5],
    share: (t) => `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(t)}`, prefill: true },
  instagram: { label: 'Instagram', icon: 'fa-brands fa-instagram', color: '#E1306C', limit: 2200, ideal: [300, 1500], tags: [8, 15],
    share: () => 'https://www.instagram.com/', prefill: false },
  facebook: { label: 'Facebook', icon: 'fa-brands fa-facebook', color: '#1877F2', limit: 63206, ideal: [200, 900], tags: [0, 3],
    share: () => 'https://www.facebook.com/', prefill: false },
  x: { label: 'X', icon: 'fa-brands fa-x-twitter', color: '#0F1419', limit: 280, ideal: [70, 280], tags: [0, 2],
    share: (t) => `https://x.com/intent/post?text=${encodeURIComponent(t)}`, prefill: true },
  threads: { label: 'Threads', icon: 'fa-brands fa-threads', color: '#101010', limit: 500, ideal: [100, 500], tags: [0, 1],
    share: (t) => `https://www.threads.net/intent/post?text=${encodeURIComponent(t)}`, prefill: true },
  tiktok: { label: 'TikTok', icon: 'fa-brands fa-tiktok', color: '#FE2C55', limit: 4000, ideal: [500, 1500], tags: [3, 6],
    share: () => 'https://www.tiktok.com/tiktokstudio/upload', prefill: false },
  youtube: { label: 'YouTube', icon: 'fa-brands fa-youtube', color: '#FF0000', limit: 5000, ideal: [800, 3000], tags: [3, 5],
    share: () => 'https://studio.youtube.com/', prefill: false },
};

export const platformOf = (id) => PLATFORMS[id] || PLATFORMS.linkedin;

export const platformIcon = (id, extra = '') => {
  const p = platformOf(id);
  return `<i class="${p.icon} ${extra}" style="color:${p.color}" aria-hidden="true"></i>`;
};

export const splitThread = (text) => text.split(/\n\s*\n/).filter((t) => /^\s*\d+\//.test(t));
