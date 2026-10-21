export const PLATFORMS = {
  linkedin: { label: 'LinkedIn', icon: 'fa-brands fa-linkedin', color: '#0A66C2', limit: 3000 },
  instagram: { label: 'Instagram', icon: 'fa-brands fa-instagram', color: '#E1306C', limit: 2200 },
  facebook: { label: 'Facebook', icon: 'fa-brands fa-facebook', color: '#1877F2', limit: 63206 },
  x: { label: 'X', icon: 'fa-brands fa-x-twitter', color: '#0F1419', limit: 280 },
  threads: { label: 'Threads', icon: 'fa-brands fa-threads', color: '#101010', limit: 500 },
  tiktok: { label: 'TikTok', icon: 'fa-brands fa-tiktok', color: '#FE2C55', limit: 4000 },
  youtube: { label: 'YouTube', icon: 'fa-brands fa-youtube', color: '#FF0000', limit: 5000 },
};

export const platformOf = (id) => PLATFORMS[id] || PLATFORMS.linkedin;

export const platformIcon = (id, extra = '') => {
  const p = platformOf(id);
  return `<i class="${p.icon} ${extra}" style="color:${p.color}" aria-hidden="true"></i>`;
};
