/**
 * HookLink — Shared Components
 * Reusable header and footer injection
 */

/**
 * Renders the top navigation bar
 * @param {string} activePage - The current page identifier ('home'|'features'|'pricing'|'library')
 */
export function renderHeader(activePage = '') {
  const header = document.createElement('header');
  header.className = 'fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/40 h-20';
  header.innerHTML = `
    <div class="flex justify-between items-center px-4 md:px-margin-desktop h-full max-w-[1280px] mx-auto">
      <div class="flex items-center gap-8">
        <a href="/" class="text-headline-md font-headline font-bold text-primary no-underline">HookLink</a>
        <nav class="hidden md:flex gap-6 items-center">
          <a href="/" class="nav-link ${activePage === 'home' ? 'active' : ''}">Features</a>
          <a href="/library.html" class="nav-link ${activePage === 'library' ? 'active' : ''}">Library</a>
        </nav>
      </div>
      <div class="flex items-center gap-4">
        <!-- Mobile Menu Button -->
        <button id="mobileMenuBtn" class="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <a href="/workspace.html" class="hidden md:block bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold text-sm tracking-wider hover:shadow-lg transition-all active:scale-95">Start Writing</a>
      </div>
    </div>
    <!-- Mobile Menu -->
    <div id="mobileMenu" class="md:hidden hidden absolute top-20 left-0 w-full bg-surface border-b border-outline-variant shadow-xl">
      <nav class="flex flex-col p-4 gap-2">
        <a href="/" class="nav-link py-3 px-4 rounded-lg hover:bg-surface-container-low ${activePage === 'home' ? 'active' : ''}">Features</a>
        <a href="/library.html" class="nav-link py-3 px-4 rounded-lg hover:bg-surface-container-low ${activePage === 'library' ? 'active' : ''}">Library</a>
        <a href="/workspace.html" class="mt-2 bg-primary text-on-primary text-center rounded-xl font-semibold text-sm py-3 hover:shadow-lg transition-all">Start Writing</a>
      </nav>
    </div>
  `;

  document.body.prepend(header);

  // Mobile menu toggle
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const icon = menuBtn.querySelector('.material-symbols-outlined');
      icon.textContent = mobileMenu.classList.contains('hidden') ? 'menu' : 'close';
    });
  }
}

/**
 * Renders the footer
 */
export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'bg-surface-container-lowest border-t border-outline-variant w-full py-unit-xl mt-20';
  footer.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-gutter px-4 md:px-margin-desktop max-w-[1280px] mx-auto">
      <div class="col-span-1">
        <span class="text-headline-md font-headline font-black text-on-surface">HookLink</span>
        <p class="mt-4 text-body-sm text-on-surface-variant">A simple writing workspace for sharing your best ideas.</p>
      </div>
      <div class="space-y-4">
        <h4 class="text-label-md font-semibold text-primary uppercase tracking-wider">Product</h4>
        <ul class="space-y-2">
          <li><a class="text-body-sm text-on-surface-variant hover:underline decoration-primary underline-offset-4" href="/library.html">Templates</a></li>
          <li><a class="text-body-sm text-on-surface-variant hover:underline decoration-primary underline-offset-4" href="/workspace.html">Tone Guide</a></li>
        </ul>
      </div>
      <div class="space-y-4">
        <h4 class="text-label-md font-semibold text-primary uppercase tracking-wider">Support</h4>
        <ul class="space-y-2">
          <li><a class="text-body-sm text-on-surface-variant hover:underline decoration-primary underline-offset-4" href="#">Privacy Policy</a></li>
          <li><a class="text-body-sm text-on-surface-variant hover:underline decoration-primary underline-offset-4" href="#">Terms of Service</a></li>
        </ul>
      </div>
      <div class="space-y-4">
        <h4 class="text-label-md font-semibold text-primary uppercase tracking-wider">Connect</h4>
        <ul class="space-y-2">
          <li><a class="text-body-sm text-on-surface-variant hover:underline decoration-primary underline-offset-4" href="#">Twitter</a></li>
          <li><a class="text-body-sm text-on-surface-variant hover:underline decoration-primary underline-offset-4" href="#">LinkedIn</a></li>
        </ul>
      </div>
    </div>
    <div class="max-w-[1280px] mx-auto px-4 md:px-margin-desktop mt-12 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="text-body-sm text-on-surface-variant opacity-80">© 2024 HookLink. All rights reserved.</p>
      <p class="text-body-sm text-on-surface-variant font-medium">Made by <a href="https://salem-portfolio-psi.vercel.app/" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Salem Gwashavanhu</a> of Muonde Technology.</p>
    </div>
  `;

  document.body.appendChild(footer);
}

/**
 * Shows a toast notification
 * @param {string} message
 * @param {string} icon - Material symbol name
 * @param {number} duration - ms to show
 */
export function showToast(message, icon = 'auto_awesome', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-8 right-8 bg-on-background text-on-primary px-6 py-4 rounded-xl shadow-2xl toast-notification translate-y-20 opacity-0 z-[100] flex items-center gap-3';
  toast.innerHTML = `<span class="material-symbols-outlined text-tertiary-fixed">${icon}</span> <span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-20', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    setTimeout(() => toast.remove(), 500);
  }, duration);
}
