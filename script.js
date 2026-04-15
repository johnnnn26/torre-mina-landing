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


/* -----------------------------------------------
   FAQ ACCORDION
----------------------------------------------- */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});


/* -----------------------------------------------
   LEAFLET MAP – ENTORNO
----------------------------------------------- */
(function () {
  const mapEl = document.getElementById('entornoMap');
  if (!mapEl) return;

  const map = L.map('entornoMap', {
    zoomControl: true,
    scrollWheelZoom: false,
    tap: false
  }).setView([-12.0084, -77.0578], 15);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Force recalculate size after DOM is fully painted
  setTimeout(() => map.invalidateSize(), 300);

  function makeIcon(color) {
    return L.divIcon({
      className: '',
      html: `<div style="width:32px;height:32px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid #fff"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -34]
    });
  }

  const COLORS = {
    home:          '#006D77',
    transporte:    '#4f46e5',
    supermercados: '#059669',
    salud:         '#e11d48',
    educacion:     '#b45309',
    ocio:          '#0284c7'
  };

  const pois = [
    { cat:'transporte',    lat:-12.0127, lng:-77.0578, name:'Metropolitano', desc:'Est. Naranjal · 5 min a pie' },
    { cat:'transporte',    lat:-12.0093, lng:-77.0488, name:'Tren Línea 1',  desc:'Est. Independencia · 8 min' },
    { cat:'transporte',    lat:-12.0038, lng:-77.0565, name:'Gran Terminal', desc:'Plaza Norte · 5 min' },
    { cat:'supermercados', lat:-12.0034, lng:-77.0562, name:'Metro',         desc:'Plaza Norte · 5 min a pie' },
    { cat:'supermercados', lat:-12.0058, lng:-77.0645, name:'PlazaVea',      desc:'Plaza Center SMP · 8 min' },
    { cat:'supermercados', lat:-12.0148, lng:-77.0623, name:'Makro',         desc:'Mayorista · 10 min' },
    { cat:'salud',         lat:-12.0055, lng:-77.0640, name:'Smart Fit',     desc:'Plaza Center SMP · 10 min' },
    { cat:'salud',         lat:-12.0040, lng:-77.0570, name:'Inkafarma',     desc:'Plaza Norte · 5 min' },
    { cat:'salud',         lat:-12.0168, lng:-77.0528, name:'Clínica San Pablo', desc:'Lima Norte · 10 min' },
    { cat:'educacion',     lat:-12.0178, lng:-77.0498, name:'UNI',           desc:'Univ. de Ingeniería · 15 min' },
    { cat:'educacion',     lat:-12.0312, lng:-77.0625, name:'SENATI',        desc:'Lima Norte · 15 min' },
    { cat:'ocio',          lat:-12.0032, lng:-77.0558, name:'Cineplanet',    desc:'Plaza Norte · 5 min' },
    { cat:'ocio',          lat:-12.0027, lng:-77.0553, name:'MegaPlaza',     desc:'Lima Norte · 15 min en bus' },
  ];

  // Torre Mina marker (always visible)
  const tmIcon = L.divIcon({
    className: '',
    html: `<div style="background:#006D77;color:#fff;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:700;font-family:Inter,sans-serif;box-shadow:0 2px 12px rgba(0,109,119,0.4);white-space:nowrap;border:2px solid #fff">📍 Torre Mina</div>`,
    iconAnchor: [55, 20],
    popupAnchor: [0, -24]
  });
  L.marker([-12.0084, -77.0578], { icon: tmIcon }).addTo(map)
    .bindPopup('<strong>Residencia Torre Mina</strong><br>Tu nueva casa en Lima Norte');

  // POI markers
  const markers = pois.map(p => {
    const m = L.marker([p.lat, p.lng], { icon: makeIcon(COLORS[p.cat]) })
      .bindPopup(`<strong>${p.name}</strong><br><span style="color:#666;font-size:13px">${p.desc}</span>`);
    m._cat = p.cat;
    m.addTo(map);
    return m;
  });

  // Filter buttons
  document.querySelectorAll('.mf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mf-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const cat = btn.dataset.cat;
      markers.forEach(m => {
        if (cat === 'all' || m._cat === cat) m.addTo(map);
        else map.removeLayer(m);
      });
    });
  });
})();
