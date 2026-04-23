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
  document.querySelector('.hero')?.classList.add('ready');
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

    // Stagger via CSS --i custom property
    const siblings = Array.from(
      entry.target.parentElement.querySelectorAll('[data-animate]')
    );
    const idx = siblings.indexOf(entry.target);
    entry.target.style.setProperty('--i', idx);
    entry.target.classList.add('in-view');

    animObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

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
   ROOM PLANNER
----------------------------------------------- */
(function () {
  const canvas = document.getElementById('plannerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let cssW = 600, cssH = 440;
  let roomW = 350, roomD = 380;
  let items = [];
  let selected = null;
  let dragging = false;
  let dragOffX = 0, dragOffY = 0;

  const PAD = 46;
  const COLORS = [
    '#D4B896','#A8C8D8','#B4D4B0','#D4C4A4','#C4B0D4',
    '#D4A4A0','#A0D4C4','#C8D4A4','#D4C8A8','#B0C4D8'
  ];
  let colorIdx = 0;

  const PRESETS = [
    { name: 'Cama 1 plaza',    w: 90,  d: 190, emoji: '🛏️' },
    { name: 'Cama 1½ plazas', w: 120, d: 190, emoji: '🛏️' },
    { name: 'Cama 2 plazas',  w: 140, d: 190, emoji: '🛏️' },
    { name: 'Cama Queen',     w: 160, d: 200, emoji: '🛏️' },
    { name: 'Cama King',      w: 200, d: 200, emoji: '🛏️' },
    { name: 'Escritorio',     w: 120, d: 60,  emoji: '🖵️' },
    { name: 'Armario doble',  w: 160, d: 60,  emoji: '🚪' },
    { name: 'Mesa de noche',  w: 50,  d: 40,  emoji: '🗄️' },
    { name: 'Silla',          w: 50,  d: 50,  emoji: '🪑' },
    { name: 'Sofá 2p',   w: 150, d: 80,  emoji: '🛋️' },
  ];

  function getScale() {
    return Math.min((cssW - PAD * 2) / roomW, (cssH - PAD * 2) / roomD);
  }
  function roomToCanvas(rx, ry) {
    const s = getScale();
    const ox = (cssW - roomW * s) / 2;
    const oy = (cssH - roomD * s) / 2;
    return [ox + rx * s, oy + ry * s];
  }
  function canvasToRoom(cx, cy) {
    const s = getScale();
    const ox = (cssW - roomW * s) / 2;
    const oy = (cssH - roomD * s) / 2;
    return [(cx - ox) / s, (cy - oy) / s];
  }
  function itemFits(item) {
    const iw = item.rotated ? item.d : item.w;
    const id = item.rotated ? item.w : item.d;
    return item.x >= 0 && item.y >= 0 && item.x + iw <= roomW && item.y + id <= roomD;
  }
  function rRect(x, y, w, h, r) {
    if (typeof ctx.roundRect === 'function') { ctx.roundRect(x, y, w, h, r); }
    else { ctx.rect(x, y, w, h); }
  }

  function draw() {
    const s = getScale();
    const [ox, oy] = roomToCanvas(0, 0);
    const rw = roomW * s;
    const rd = roomD * s;

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = '#F7F4F0';
    ctx.fillRect(0, 0, cssW, cssH);

    ctx.shadowColor = 'rgba(0,0,0,0.09)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FDFAF6';
    ctx.beginPath(); rRect(ox, oy, rw, rd, 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';

    ctx.strokeStyle = '#8C6D4F';
    ctx.lineWidth = 2;
    ctx.beginPath(); rRect(ox, oy, rw, rd, 2); ctx.stroke();

    ctx.strokeStyle = 'rgba(140,109,79,0.07)';
    ctx.lineWidth = 0.75;
    const gs = 50 * s;
    for (let x = ox; x <= ox + rw + 0.5; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + rd); ctx.stroke();
    }
    for (let y = oy; y <= oy + rd + 0.5; y += gs) {
      ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + rw, y); ctx.stroke();
    }

    ctx.font = '11px Inter, -apple-system, sans-serif';
    ctx.fillStyle = '#ADA099';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(roomW + ' cm', ox + rw / 2, oy - 8);
    ctx.save();
    ctx.translate(ox - 12, oy + rd / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = 'top';
    ctx.fillText(roomD + ' cm', 0, 0);
    ctx.restore();
    ctx.textBaseline = 'alphabetic';

    items.forEach(item => {
      const iw = item.rotated ? item.d : item.w;
      const id = item.rotated ? item.w : item.d;
      const fits = itemFits(item);
      const isSel = item === selected;
      const [ix, iy] = roomToCanvas(item.x, item.y);
      const cw = iw * s;
      const ch = id * s;

      ctx.shadowColor = isSel ? 'rgba(140,109,79,0.30)' : 'rgba(0,0,0,0.09)';
      ctx.shadowBlur = isSel ? 10 : 5;
      ctx.shadowOffsetY = isSel ? 0 : 2;
      ctx.fillStyle = fits ? item.color : 'rgba(239,68,68,0.22)';
      ctx.beginPath(); rRect(ix, iy, cw, ch, 3); ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

      ctx.strokeStyle = isSel ? '#8C6D4F' : (fits ? 'rgba(140,109,79,0.40)' : '#ef4444');
      ctx.lineWidth = isSel ? 2 : 1.5;
      ctx.beginPath(); rRect(ix, iy, cw, ch, 3); ctx.stroke();

      const fs = Math.max(9, Math.min(13, cw / 7));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (ch > fs * 2.8) {
        ctx.font = '600 ' + fs + 'px Inter, -apple-system, sans-serif';
        ctx.fillStyle = fits ? '#4A3728' : '#b91c1c';
        ctx.fillText(item.name, ix + cw / 2, iy + ch / 2 - fs * 0.65, cw - 8);
        ctx.font = (fs - 1) + 'px Inter, -apple-system, sans-serif';
        ctx.fillStyle = fits ? '#6B5E52' : '#dc2626';
        ctx.fillText(iw + '\xD7' + id + ' cm', ix + cw / 2, iy + ch / 2 + fs * 0.75, cw - 8);
      } else if (ch > fs * 1.4) {
        ctx.font = '600 ' + fs + 'px Inter, -apple-system, sans-serif';
        ctx.fillStyle = fits ? '#4A3728' : '#b91c1c';
        ctx.fillText(iw + '\xD7' + id, ix + cw / 2, iy + ch / 2, cw - 4);
      }
      ctx.textBaseline = 'alphabetic';
    });
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.clientWidth;
    const h = Math.min(Math.round(w * 0.65), 500);
    cssW = w; cssH = h;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  new ResizeObserver(resize).observe(canvas.parentElement);
  resize();

  document.getElementById('roomW').addEventListener('input', function () {
    roomW = Math.max(150, +this.value || 350); draw();
  });
  document.getElementById('roomD').addEventListener('input', function () {
    roomD = Math.max(150, +this.value || 380); draw();
  });
  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.preset-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      roomW = +btn.dataset.w;
      roomD = +btn.dataset.d;
      document.getElementById('roomW').value = roomW;
      document.getElementById('roomD').value = roomD;
      draw();
    });
  });

  var furGrid = document.getElementById('furnitureGrid');
  if (furGrid) {
    PRESETS.forEach(function (p) {
      var btn = document.createElement('button');
      btn.className = 'fur-btn';
      btn.title = p.name + ' – ' + p.w + '\xD7' + p.d + ' cm';

      var emojiSpan = document.createElement('span');
      emojiSpan.className = 'fur-emoji';
      emojiSpan.textContent = p.emoji;

      var info = document.createElement('span');
      info.className = 'fur-info';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'fur-name';
      nameSpan.textContent = p.name;

      var sizeSpan = document.createElement('span');
      sizeSpan.className = 'fur-size';
      sizeSpan.textContent = p.w + '\xD7' + p.d + ' cm';

      info.appendChild(nameSpan);
      info.appendChild(sizeSpan);
      btn.appendChild(emojiSpan);
      btn.appendChild(info);
      btn.addEventListener('click', function () { addFurniture(p.name, p.w, p.d); });
      furGrid.appendChild(btn);
    });
  }

  function addFurniture(name, w, d) {
    var offset = (items.length % 6) * 15;
    var item = {
      id: Date.now() + Math.random(),
      name: name, w: w, d: d,
      x: Math.min(offset + 5, Math.max(0, roomW - w - 5)),
      y: Math.min(offset + 5, Math.max(0, roomD - d - 5)),
      rotated: false,
      color: COLORS[colorIdx++ % COLORS.length]
    };
    items.push(item);
    selected = item;
    renderItems();
    draw();
  }

  var addCustomBtn = document.getElementById('addCustomFurniture');
  if (addCustomBtn) {
    addCustomBtn.addEventListener('click', function () {
      var name = (document.getElementById('customFurName').value.trim()) || 'Mueble';
      var w = +document.getElementById('customFurW').value || 100;
      var d = +document.getElementById('customFurD').value || 60;
      if (w > 0 && d > 0) addFurniture(name, w, d);
    });
  }

  function renderItems() {
    var wrap = document.getElementById('plannerItemsWrap');
    var list = document.getElementById('plannerItemsList');
    if (!wrap || !list) return;
    wrap.style.display = items.length ? 'block' : 'none';
    while (list.firstChild) list.removeChild(list.firstChild);

    items.forEach(function (item) {
      var iw = item.rotated ? item.d : item.w;
      var id = item.rotated ? item.w : item.d;
      var fits = itemFits(item);
      var isSel = item === selected;

      var row = document.createElement('div');
      row.className = 'item-row' + (isSel ? ' item-row--sel' : '');

      var dot = document.createElement('span');
      dot.className = 'item-dot';
      dot.style.background = item.color;

      var lbl = document.createElement('span');
      lbl.className = 'item-label';
      lbl.textContent = item.name;
      var sm = document.createElement('small');
      sm.textContent = iw + '\xD7' + id + ' cm';
      lbl.appendChild(sm);

      var status = document.createElement('span');
      status.className = 'item-status ' + (fits ? 'fit-ok' : 'fit-no');
      status.textContent = fits ? '✓' : '✗ No';

      var btnRot = document.createElement('button');
      btnRot.className = 'item-act';
      btnRot.dataset.act = 'rot';
      btnRot.dataset.id = String(item.id);
      btnRot.title = 'Rotar 90\xB0';
      btnRot.setAttribute('aria-label', 'Rotar');
      btnRot.textContent = '↻';

      var btnDel = document.createElement('button');
      btnDel.className = 'item-act';
      btnDel.dataset.act = 'del';
      btnDel.dataset.id = String(item.id);
      btnDel.title = 'Eliminar';
      btnDel.setAttribute('aria-label', 'Eliminar');
      btnDel.textContent = '\xD7';

      row.appendChild(dot);
      row.appendChild(lbl);
      row.appendChild(status);
      row.appendChild(btnRot);
      row.appendChild(btnDel);

      row.addEventListener('click', function (e) {
        if (e.target.closest('.item-act')) return;
        selected = item;
        draw(); renderItems();
      });
      list.appendChild(row);
    });

    list.querySelectorAll('.item-act').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = +btn.dataset.id;
        var item = items.find(function (i) { return i.id === id; });
        if (!item) return;
        if (btn.dataset.act === 'rot') {
          item.rotated = !item.rotated;
        } else {
          items = items.filter(function (i) { return i.id !== id; });
          if (selected && selected.id === id) selected = null;
        }
        draw(); renderItems();
      });
    });
  }

  function getPos(e) {
    var rect = canvas.getBoundingClientRect();
    var src = (e.touches && e.touches[0]) || e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }
  function hitTest(cx, cy) {
    var s = getScale();
    for (var i = items.length - 1; i >= 0; i--) {
      var item = items[i];
      var iw = item.rotated ? item.d : item.w;
      var id = item.rotated ? item.w : item.d;
      var ref = roomToCanvas(item.x, item.y);
      var ix = ref[0], iy = ref[1];
      if (cx >= ix && cx <= ix + iw * s && cy >= iy && cy <= iy + id * s) return item;
    }
    return null;
  }

  function onDown(e) {
    var pos = getPos(e);
    var hit = hitTest(pos.x, pos.y);
    selected = hit;
    if (hit) {
      dragging = true;
      var ref = roomToCanvas(hit.x, hit.y);
      dragOffX = pos.x - ref[0];
      dragOffY = pos.y - ref[1];
      items.splice(items.indexOf(hit), 1);
      items.push(hit);
    }
    draw(); renderItems();
  }
  function onMove(e) {
    if (!dragging || !selected) return;
    if (e.cancelable) e.preventDefault();
    var pos = getPos(e);
    var ref = canvasToRoom(pos.x - dragOffX, pos.y - dragOffY);
    selected.x = ref[0];
    selected.y = ref[1];
    draw();
  }
  function onUp() {
    if (dragging && selected) renderItems();
    dragging = false;
  }

  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onUp);
  canvas.addEventListener('mouseleave', onUp);
  canvas.addEventListener('touchstart', onDown, { passive: true });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onUp);

  document.addEventListener('keydown', function (e) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
    if (!selected) return;
    if (e.key === 'r' || e.key === 'R') {
      selected.rotated = !selected.rotated;
      draw(); renderItems();
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      items = items.filter(function (i) { return i !== selected; });
      selected = null;
      draw(); renderItems();
    }
  });
})();


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

  setTimeout(() => map.invalidateSize(), 200);
  window.addEventListener('load', () => map.invalidateSize());

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
