// voice.js — Asistente de voz Residencia Torre Mina
(function () {
  var VAPI_PUBLIC_KEY = '3ff52480-cbc0-4273-bc6d-ce1a5786abd7';

  var SYSTEM_PROMPT = [
    'Eres el asistente de voz de Residencia Torre Mina en San Martín de Porres, Lima, Perú.',
    'Atiendes posibles inquilinos por llamada. Habla en español, tono amigable y directo.',
    'Respuestas MUY cortas: máximo 2 oraciones. Es una llamada de voz, no texto.',
    '',
    'PRECIOS MENSUALES (todas con baño privado):',
    '- Económica S/500, Estándar S/650, Premium S/750, Mini Apartamento desde S/1500.',
    '',
    'INCLUIDO: Agua, luz, WiFi, limpieza. AMOBLADAS: cama, colchón, armario, escritorio, silla.',
    '',
    'REQUISITOS: Solo DNI + 1 mes adelanto. Sin recibo de sueldo. Garantía: 1 mes.',
    'CONTRATO: mínimo 3 meses (también mensual).',
    'NORMAS: visitas hasta 10pm, sin mascotas, sin estacionamiento (playa pública a 2 min).',
    '',
    'UBICACIÓN: San Martín de Porres, Lima, cerca de Plaza Norte.',
    'TRANSPORTE: 5 min Metropolitano, 8 min Tren Línea 1.',
    '',
    'AGENDAR: calendly.com/johnn-academic/visita-a-torre-mina o WhatsApp +51 933 589 691.',
    'HORARIO DE VISITAS: lunes a sábado 9am–5pm.',
    '',
    'Si preguntan por disponibilidad o quieren reservar, dales el WhatsApp o Calendly.',
    'No inventes información. Solo usa los datos de arriba.'
  ].join('\n');

  var ASSISTANT_CONFIG = {
    name: 'Asistente Torre Mina',
    firstMessage: '¡Hola! Soy el asistente de Torre Mina. ¿En qué puedo ayudarte?',
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'es'
    },
    model: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      maxTokens: 180,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }]
    },
    voice: {
      provider: 'azure',
      voiceId: 'es-PE-CamilaNeural'
    }
  };

  // ── DOM ──────────────────────────────────────────────────────────────────────
  var panel     = document.getElementById('vcallPanel');
  var toggleBtn = document.getElementById('vcallToggle');
  var closeBtn  = document.getElementById('vcallClose');
  var headerDot = document.getElementById('vcallDot');
  var headerSt  = document.getElementById('vcallHeaderStatus');
  var ring      = document.getElementById('vcallRing');
  var label     = document.getElementById('vcallLabel');
  var mainBtn   = document.getElementById('vcallMainBtn');
  var muteBtn   = document.getElementById('vcallMuteBtn');

  if (!panel || !toggleBtn) return;

  var isOpen     = false;
  var callActive = false;
  var isMuted    = false;
  var vapiInst   = null;

  // ── PANEL OPEN / CLOSE ───────────────────────────────────────────────────────
  toggleBtn.addEventListener('click', function () { isOpen ? closePanel() : openPanel(); });
  closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) closePanel(); });

  function openPanel() {
    isOpen = true;
    panel.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closePanel() {
    if (callActive) endCall();
    isOpen = false;
    panel.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  // ── CALL CONTROLS ────────────────────────────────────────────────────────────
  mainBtn.addEventListener('click', function () { callActive ? endCall() : startCall(); });

  muteBtn.addEventListener('click', function () {
    if (!vapiInst) return;
    isMuted = !isMuted;
    vapiInst.setMuted(isMuted);
    muteBtn.classList.toggle('is-muted', isMuted);
    muteBtn.setAttribute('aria-label', isMuted ? 'Activar micrófono' : 'Silenciar');
  });

  function startCall() {
    mainBtn.disabled = true;
    setLabel('Cargando asistente de voz...');
    setHeaderStatus('Cargando...');

    getVapi()
      .then(function (vapi) { vapi.start(ASSISTANT_CONFIG); })
      .catch(function (err) {
        console.error('Error iniciando llamada:', err);
        mainBtn.disabled = false;
        setLabel('Error: ' + (err.message || 'No se pudo conectar. Intenta de nuevo.'));
        setHeaderStatus('Error');
        setTimeout(resetLabel, 5000);
      });
  }

  function endCall() {
    if (vapiInst) vapiInst.stop();
  }

  // Carga Vapi una sola vez y reutiliza la instancia
  function getVapi() {
    if (vapiInst) return Promise.resolve(vapiInst);

    return import('https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/+esm')
      .then(function (mod) {
        var Vapi  = mod.default;
        vapiInst  = new Vapi(VAPI_PUBLIC_KEY);

        vapiInst.on('call-start',   onCallStart);
        vapiInst.on('call-end',     onCallEnd);
        vapiInst.on('speech-start', function () { ring.classList.add('is-speaking'); });
        vapiInst.on('speech-end',   function () { ring.classList.remove('is-speaking'); });
        vapiInst.on('error',        onError);

        return vapiInst;
      });
  }

  // ── VAPI EVENTS ──────────────────────────────────────────────────────────────
  function onCallStart() {
    callActive = true;
    mainBtn.disabled = false;
    mainBtn.classList.add('is-active');
    mainBtn.setAttribute('aria-label', 'Colgar');
    mainBtn.setAttribute('title', 'Colgar');
    muteBtn.hidden = false;
    headerDot.classList.add('is-live');
    setLabel('En llamada — habla normalmente');
    setHeaderStatus('En llamada');
  }

  function onCallEnd() {
    callActive = false;
    isMuted    = false;
    mainBtn.disabled = false;
    mainBtn.classList.remove('is-active');
    mainBtn.setAttribute('aria-label', 'Iniciar llamada');
    mainBtn.setAttribute('title', 'Iniciar llamada');
    muteBtn.hidden = true;
    muteBtn.classList.remove('is-muted');
    ring.classList.remove('is-speaking');
    headerDot.classList.remove('is-live');
    setLabel('Llamada terminada');
    setHeaderStatus('Lista para conectar');
    setTimeout(function () { if (!callActive) resetLabel(); }, 3500);
  }

  function onError(err) {
    console.error('Vapi error:', err);
    callActive = false;
    mainBtn.disabled = false;
    mainBtn.classList.remove('is-active');
    muteBtn.hidden = true;
    ring.classList.remove('is-speaking');
    headerDot.classList.remove('is-live');
    var msg = (err && (err.message || err.msg || err.error))
      ? (err.message || err.msg || err.error)
      : JSON.stringify(err);
    setLabel('Error: ' + msg);
    setHeaderStatus('Error');
    setTimeout(function () { if (!callActive) resetLabel(); }, 6000);
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  function setLabel(text)        { if (label)    label.textContent = text; }
  function setHeaderStatus(text) { if (headerSt) headerSt.textContent = text; }
  function resetLabel() {
    setLabel('Toca el botón para hablar con el asistente');
    setHeaderStatus('Lista para conectar');
  }
})();
