// voice.js — Asistente de voz Torre Mina · ElevenLabs Conversational AI
(function () {
  var AGENT_ID   = 'agent_3101kpw9exmnfswth43a6anrqqee';
  var EL_API_KEY = 'sk_b76f23a25585195a385bf2836f45e9b71a3626a896b51b3b';

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

  var isOpen       = false;
  var callActive   = false;
  var isMuted      = false;
  var conversation = null;

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
    if (!conversation) return;
    isMuted = !isMuted;
    conversation.setMicMuted(isMuted);
    muteBtn.classList.toggle('is-muted', isMuted);
    muteBtn.setAttribute('aria-label', isMuted ? 'Activar micrófono' : 'Silenciar');
  });

  function startCall() {
    mainBtn.disabled = true;
    setLabel('Conectando con Camila...');
    setHeaderStatus('Conectando...');

    import('https://esm.sh/@11labs/client')
      .then(function (mod) {
        var Conversation = mod.Conversation;
        return Conversation.startSession({
          agentId:       AGENT_ID,
          authorization: EL_API_KEY,
          onConnect:    onCallStart,
          onDisconnect: onCallEnd,
          onError:      onError,
          onModeChange: function (data) {
            if (data.mode === 'speaking') ring.classList.add('is-speaking');
            else                         ring.classList.remove('is-speaking');
          }
        });
      })
      .then(function (conv) { conversation = conv; })
      .catch(function (err) {
        console.error('ElevenLabs error:', err);
        mainBtn.disabled = false;
        setLabel('Error: ' + (err.message || 'No se pudo conectar. Intenta de nuevo.'));
        setHeaderStatus('Error');
        setTimeout(resetLabel, 5000);
      });
  }

  function endCall() {
    if (conversation) {
      conversation.endSession();
      conversation = null;
    }
  }

  // ── EVENTOS ──────────────────────────────────────────────────────────────────
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
    conversation = null;
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
    console.error('ElevenLabs error:', err);
    callActive = false;
    conversation = null;
    mainBtn.disabled = false;
    mainBtn.classList.remove('is-active');
    muteBtn.hidden = true;
    ring.classList.remove('is-speaking');
    headerDot.classList.remove('is-live');
    var msg = (err && (err.message || err.msg)) ? (err.message || err.msg) : String(err);
    setLabel('Error: ' + msg);
    setHeaderStatus('Error');
    setTimeout(function () { if (!callActive) resetLabel(); }, 6000);
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  function setLabel(text)        { if (label)    label.textContent = text; }
  function setHeaderStatus(text) { if (headerSt) headerSt.textContent = text; }
  function resetLabel() {
    setLabel('Toca el botón para hablar con Camila');
    setHeaderStatus('Lista para conectar');
  }
})();
