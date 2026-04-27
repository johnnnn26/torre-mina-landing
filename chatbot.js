// ==============================================
//   CHATBOT WIDGET — Residencia Torre Mina
// ==============================================
(function () {
  // ── CONFIGURACIÓN ──────────────────────────
  // 1. Ve a https://console.anthropic.com y crea una API key (gratis con créditos iniciales)
  // 2. Reemplaza 'TU_API_KEY_AQUI' con tu key
  // NOTA: para producción, mueve esta key a un backend para no exponerla en el navegador
  var ANTHROPIC_API_KEY = 'TU_API_KEY_AQUI';
  var MODEL = 'claude-haiku-4-5-20251001';

  var SYSTEM_PROMPT = [
    'Eres el asistente virtual de Séptimo, edificio de habitaciones en San Martín de Porres, Lima, Perú.',
    'Respondes a posibles inquilinos de forma amigable y concisa. Siempre en español.',
    'Respuestas cortas (máx 3 oraciones salvo que pidan detalles).',
    '',
    'HABITACIONES Y PRECIOS MENSUALES (pisos 3, 4 y 5 — 12 cuartos en total):',
    '- Económica: S/ 500/mes',
    '- Estándar: S/ 650/mes',
    '- Premium: S/ 750/mes',
    'Todas incluyen baño privado. NO vienen amobladas — se entregan recién pintadas con piso de porcelana crema.',
    '',
    'MINI DEPARTAMENTO (2do piso): S/ 1,500/mes. 2 dormitorios, sala, cocina, baño privado, lavandería. Sin amoblar.',
    '',
    'SERVICIOS INCLUIDOS (sin costo extra): Agua, luz, internet de alta velocidad.',
    'ÁREAS COMUNES: Lavadero por piso, terraza para tender ropa.',
    '',
    'EDIFICIO: 7 pisos. Planta baja tiene restaurante, brostería, bodega y chicharronería.',
    '',
    'REQUISITOS:',
    '- Solo DNI vigente + 1 mes de adelanto',
    '- No se piden recibos de sueldo ni carta de trabajo',
    '- Garantía: 1 mes (se devuelve al final si el cuarto está bien)',
    '',
    'CONTRATO MÍNIMO: 3 meses (también hay opción mensual)',
    'NORMAS: Visitas hasta las 10 pm. No mascotas. Sin estacionamiento propio (playa pública a 2 min).',
    '',
    'UBICACIÓN: San Martín de Porres, Lima. Cerca de Plaza Norte.',
    'ENTORNO: 5 min del Metropolitano, Plaza Norte, Metro supermercado, Cineplanet.',
    '8 min del Tren Línea 1. 10 min de Clínica San Pablo. 15 min de UNI y MegaPlaza.',
    '',
    'HORARIO DE VISITAS: Lunes a sábado, 9am–5pm. ATENCIÓN: Todos los días 8am–9pm.',
    'WHATSAPP: +51 933 589 691',
    'AGENDAR VISITA: https://calendly.com/johnn-academic/visita-a-torre-mina',
    '',
    'PROCESO: 1) Contactar por WhatsApp → 2) Visitar → 3) Firmar contrato → 4) Recibir llaves.',
    'Si quieren reservar o hablar con una persona, dales el WhatsApp o el link de Calendly.',
    'Si no sabes algo, sugiere el WhatsApp +51 933 589 691. No inventes información.'
  ].join('\n');

  // ── DOM ────────────────────────────────────
  var bubble    = document.getElementById('chatBubble');
  var panel     = document.getElementById('chatPanel');
  var toggle    = document.getElementById('chatToggle');
  var closeBtn  = document.getElementById('chatClose');
  var msgsEl    = document.getElementById('chatMessages');
  var inputEl   = document.getElementById('chatInput');
  var sendBtn   = document.getElementById('chatSend');
  var quickWrap = document.getElementById('chatQuickWrap');

  if (!bubble) return;

  var history   = [];
  var isOpen    = false;
  var isLoading = false;

  // ── OPEN / CLOSE ───────────────────────────
  function openChat() {
    isOpen = true;
    panel.classList.add('is-open');
    bubble.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (history.length === 0) {
      addBotText('Hola! Soy el asistente de Séptimo. Puedo ayudarte con precios, servicios y cómo agendar una visita. ¿Qué quieres saber?');
    }
    setTimeout(function () { inputEl.focus(); }, 280);
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove('is-open');
    bubble.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () { isOpen ? closeChat() : openChat(); });
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

  // ── QUICK BUTTONS ──────────────────────────
  document.querySelectorAll('.chat-quick-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      sendMessage(btn.dataset.q);
      quickWrap.style.display = 'none';
    });
  });

  // ── SEND ───────────────────────────────────
  sendBtn.addEventListener('click', sendFromInput);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFromInput(); }
  });

  function sendFromInput() {
    var text = inputEl.value.trim();
    if (!text || isLoading) return;
    inputEl.value = '';
    quickWrap.style.display = 'none';
    sendMessage(text);
  }

  async function sendMessage(text) {
    if (isLoading) return;
    addUserText(text);
    history.push({ role: 'user', content: text });
    isLoading = true;
    sendBtn.disabled = true;
    var typingEl = addTyping();

    try {
      var res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 350,
          system: SYSTEM_PROMPT,
          messages: history
        })
      });

      if (!res.ok) {
        var errData = await res.json().catch(function () { return {}; });
        throw new Error((errData.error && errData.error.message) || 'HTTP ' + res.status);
      }

      var data  = await res.json();
      var reply = data.content[0].text;
      history.push({ role: 'assistant', content: reply });
      typingEl.remove();
      addBotText(reply);

    } catch (err) {
      typingEl.remove();
      console.error('Chatbot error:', err);
      addErrorMsg();
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  // ── RENDER HELPERS (sin innerHTML) ─────────

  function addUserText(text) {
    var d = document.createElement('div');
    d.className = 'chat-msg chat-msg-user';
    d.textContent = text;
    msgsEl.appendChild(d);
    scrollBottom();
  }

  // Convierte URLs en texto a enlaces usando split + DOM (sin innerHTML ni regex.exec)
  function addBotText(text) {
    var d = document.createElement('div');
    d.className = 'chat-msg chat-msg-bot';
    var urlRe = /(https?:\/\/[^\s]+)/g;
    var parts  = text.split(urlRe);
    parts.forEach(function (part) {
      if (/^https?:\/\//.test(part)) {
        var a = document.createElement('a');
        a.href        = part;
        a.target      = '_blank';
        a.rel         = 'noopener noreferrer';
        a.style.color = 'var(--accent)';
        a.textContent = part;
        d.appendChild(a);
      } else {
        d.appendChild(document.createTextNode(part));
      }
    });
    msgsEl.appendChild(d);
    scrollBottom();
  }

  function addErrorMsg() {
    var d = document.createElement('div');
    d.className = 'chat-msg chat-msg-bot';
    d.appendChild(document.createTextNode('Tuve un problema al conectarme. Escríbenos por '));
    var a = document.createElement('a');
    a.href        = 'https://wa.me/51933589691';
    a.target      = '_blank';
    a.rel         = 'noopener noreferrer';
    a.style.color = 'var(--accent)';
    a.textContent = 'WhatsApp +51 933 589 691';
    d.appendChild(a);
    d.appendChild(document.createTextNode(' y te atendemos enseguida.'));
    msgsEl.appendChild(d);
    scrollBottom();
  }

  function addTyping() {
    var d = document.createElement('div');
    d.className = 'chat-msg chat-msg-bot chat-typing';
    for (var i = 0; i < 3; i++) { d.appendChild(document.createElement('span')); }
    msgsEl.appendChild(d);
    scrollBottom();
    return d;
  }

  function scrollBottom() {
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }
})();
