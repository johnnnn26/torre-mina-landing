// voice.js — Asistente de voz Residencia Torre Mina
// Plataforma: Vapi.ai  |  https://vapi.ai
// Crea tu cuenta en vapi.ai, ve a Dashboard → Keys y copia tu Public Key

import Vapi from 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/+esm';

// ── CONFIGURACIÓN ────────────────────────────────────────────────────────────
// Reemplaza este valor con tu Public Key de Vapi (seguro usarla en el browser)
const VAPI_PUBLIC_KEY = '3ff52480-cbc0-4273-bc6d-ce1a5786abd7';

// Configuración del asistente de voz
const ASSISTANT_CONFIG = {
  firstMessage: '¡Hola! Soy el asistente de voz de Torre Mina. ¿En qué puedo ayudarte?',
  model: {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    maxTokens: 180,
    messages: [
      {
        role: 'system',
        content: [
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
          'NORMAS: visitas hasta 10pm, sin mascotas, sin estacionamiento (hay playa pública a 2 min).',
          '',
          'UBICACIÓN: San Martín de Porres, Lima, cerca de Plaza Norte.',
          'TRANSPORTE: 5 min Metropolitano, 8 min Tren Línea 1.',
          '',
          'AGENDAR: calendly.com/johnn-academic/visita-a-torre-mina o WhatsApp +51 933 589 691.',
          'HORARIO DE VISITAS: lunes a sábado 9am–5pm.',
          '',
          'Si preguntan por disponibilidad o quieren reservar, dales el WhatsApp o Calendly.',
          'No inventes información. Solo usa los datos de arriba.'
        ].join('\n')
      }
    ]
  },
  voice: {
    provider: 'azure',
    voiceId: 'es-PE-CamilaNeural'   // Voz femenina, español peruano
  }
};

// ── DOM ──────────────────────────────────────────────────────────────────────
const bubble    = document.getElementById('vcallBubble');
const panel     = document.getElementById('vcallPanel');
const toggleBtn = document.getElementById('vcallToggle');
const closeBtn  = document.getElementById('vcallClose');
const headerDot = document.getElementById('vcallDot');
const headerSt  = document.getElementById('vcallHeaderStatus');
const ring      = document.getElementById('vcallRing');
const label     = document.getElementById('vcallLabel');
const mainBtn   = document.getElementById('vcallMainBtn');
const muteBtn   = document.getElementById('vcallMuteBtn');

if (!bubble) throw new Error('Voice widget: elementos no encontrados en el DOM');

// ── ESTADO ───────────────────────────────────────────────────────────────────
let isOpen     = false;
let callActive = false;
let isMuted    = false;

const vapi = new Vapi(VAPI_PUBLIC_KEY);

// ── ABRIR / CERRAR PANEL ─────────────────────────────────────────────────────
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

toggleBtn.addEventListener('click', function () { isOpen ? closePanel() : openPanel(); });
closeBtn.addEventListener('click', closePanel);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) closePanel(); });

// ── LLAMADA ──────────────────────────────────────────────────────────────────
mainBtn.addEventListener('click', function () {
  if (callActive) endCall();
  else startCall();
});

muteBtn.addEventListener('click', function () {
  isMuted = !isMuted;
  vapi.setMuted(isMuted);
  muteBtn.classList.toggle('is-muted', isMuted);
  muteBtn.setAttribute('aria-label', isMuted ? 'Activar micrófono' : 'Silenciar');
  muteBtn.setAttribute('title',      isMuted ? 'Activar micrófono' : 'Silenciar');
});

function startCall() {
  setLabel('Conectando...');
  setHeaderStatus('Conectando...');
  mainBtn.disabled = true;
  vapi.start(ASSISTANT_CONFIG);
}

function endCall() {
  vapi.stop();
}

// ── EVENTOS VAPI ─────────────────────────────────────────────────────────────
vapi.on('call-start', function () {
  callActive = true;
  mainBtn.disabled = false;
  mainBtn.classList.add('is-active');
  mainBtn.setAttribute('aria-label', 'Colgar');
  mainBtn.setAttribute('title', 'Colgar');
  muteBtn.hidden = false;
  headerDot.classList.add('is-live');
  setLabel('En llamada — habla normalmente');
  setHeaderStatus('En llamada');
});

vapi.on('call-end', function () {
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
  setTimeout(function () {
    if (!callActive) setLabel('Toca el botón para hablar con el asistente');
  }, 3500);
});

vapi.on('speech-start', function () { ring.classList.add('is-speaking'); });
vapi.on('speech-end',   function () { ring.classList.remove('is-speaking'); });

vapi.on('error', function (err) {
  console.error('Vapi error:', err);
  callActive = false;
  mainBtn.disabled = false;
  mainBtn.classList.remove('is-active');
  muteBtn.hidden = true;
  ring.classList.remove('is-speaking');
  headerDot.classList.remove('is-live');
  setLabel('Error al conectar. Verifica tu conexión e inténtalo de nuevo.');
  setHeaderStatus('Sin conexión');
  setTimeout(function () {
    if (!callActive) {
      setLabel('Toca el botón para hablar con el asistente');
      setHeaderStatus('Lista para conectar');
    }
  }, 5000);
});

// ── HELPERS ──────────────────────────────────────────────────────────────────
function setLabel(text)        { label.textContent = text; }
function setHeaderStatus(text) { headerSt.textContent = text; }
