/* ==============================================
   RESIDENCIA TORRE MINA – script.js  v2
   ============================================== */

'use strict';

/* --- DOM refs --- */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const waFloat   = document.getElementById('waFloat');
const hero      = document.querySelector('.hero');

/* -----------------------------------------------
   NAVBAR: scroll shadow + hero image zoom trigger
----------------------------------------------- */
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

// Trigger hero image slow zoom-out on load
window.addEventListener('load', () => {
  hero?.classList.add('ready');
});


/* -----------------------------------------------
   MOBILE MENU
----------------------------------------------- */
hamburger.addEventListener('click', toggleMenu);

function toggleMenu() {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
});


/* -----------------------------------------------
   SMOOTH SCROLL — respect nav height
----------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* -----------------------------------------------
   SCROLL ANIMATIONS (IntersectionObserver)
----------------------------------------------- */
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    // Stagger siblings by 80ms
    const siblings = Array.from(
      entry.target.parentElement.querySelectorAll('[data-animate]')
    );
    const idx = siblings.indexOf(entry.target);

    setTimeout(() => {
      entry.target.classList.add('in-view');
    }, idx * 80);

    animObserver.unobserve(entry.target);
  });
}, { threshold: 0.10, rootMargin: '0px 0px -36px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));


/* -----------------------------------------------
   FLOATING WHATSAPP — delayed entrance
----------------------------------------------- */
setTimeout(() => {
  waFloat?.classList.add('visible');
}, 1600);


/* -----------------------------------------------
   ACTIVE NAV LINK on scroll
----------------------------------------------- */
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
      const active = link.getAttribute('href') === `#${id}`;
      link.style.color      = active ? 'var(--accent)' : '';
      link.style.fontWeight = active ? '700' : '';
    });
  });
}, { threshold: 0.45 });

sections.forEach(s => navObserver.observe(s));


/* -----------------------------------------------
   KEYBOARD: Enter on room card → click CTA
----------------------------------------------- */
document.querySelectorAll('.room-card').forEach(card => {
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter') card.querySelector('a')?.click();
  });
});
