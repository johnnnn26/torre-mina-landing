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


/* -----------------------------------------------
   BOOKING CALENDAR
----------------------------------------------- */
(function () {
  const grid        = document.getElementById('calGrid');
  const monthLabel  = document.getElementById('calMonthLabel');
  const btnPrev     = document.getElementById('calPrev');
  const btnNext     = document.getElementById('calNext');
  if (!grid) return;

  // Fake booked dates: [month(0-indexed), day]
  const bookedDates = {
    '2026-3':  [3, 8, 14, 22, 27],   // April 2026
    '2026-4':  [5, 12, 19, 20, 26],  // May 2026
    '2026-5':  [2, 9, 16, 23, 30],   // June 2026
  };

  const today = new Date();
  let current = new Date(today.getFullYear(), today.getMonth(), 1);

  function render() {
    const year  = current.getFullYear();
    const month = current.getMonth();
    const key   = `${year}-${month}`;
    const booked = bookedDates[key] || [];

    monthLabel.textContent = current.toLocaleString('es-PE', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    // Convert Sunday-first to Monday-first
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    grid.innerHTML = '';

    // Empty cells before first day
    for (let i = 0; i < offset; i++) {
      const el = document.createElement('div');
      el.className = 'cal-day empty';
      grid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date    = new Date(year, month, d);
      const isSun   = date.getDay() === 0;
      const isPast  = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = date.toDateString() === today.toDateString();
      const isBooked = booked.includes(d);

      const el = document.createElement('div');
      el.textContent = d;

      let cls = 'cal-day';
      if (isSun)       cls += ' sunday past';
      else if (isPast) cls += ' past';
      else if (isBooked) cls += ' booked';
      else             cls += ' free';

      if (isToday) cls += ' today';
      el.className = cls;

      if (!isPast && !isSun && !isBooked) {
        el.title = 'Disponible – haz clic para agendar';
        el.addEventListener('click', () => {
          window.open('https://calendly.com/johnn-academic/visita-a-torre-mina', '_blank');
        });
      }

      grid.appendChild(el);
    }
  }

  btnPrev.addEventListener('click', () => {
    current.setMonth(current.getMonth() - 1);
    render();
  });
  btnNext.addEventListener('click', () => {
    current.setMonth(current.getMonth() + 1);
    render();
  });

  render();
})();
