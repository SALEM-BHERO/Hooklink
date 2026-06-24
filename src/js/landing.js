/**
 * HookLink AI — Landing Page Module
 */

// Import global styles (processed by Vite + Tailwind)
import '../styles/global.css';

// Shared header & footer components
import { renderHeader, renderFooter } from './shared.js';

// ── Render shell ──
renderHeader('home');
renderFooter();

// ── Intersection Observer: fade-in-up on scroll ──
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -60px 0px',
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in-up');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all elements marked for animation
document.querySelectorAll('.section-animate').forEach((el) => {
  // Start hidden; the animation will reveal them
  el.style.opacity = '0';
  observer.observe(el);
});
