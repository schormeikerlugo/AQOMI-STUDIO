/**
 * Voice Assistant — speech recognition + synthesis
 */

const KNOWLEDGE_BASE = [
  { k: ['service', 'offer', 'package', 'what do you do', 'capabilities', 'provide'],
    r: 'We offer five services: Brand Essentials for early-stage brands, Studio Retainer for ongoing creative support, Full Production Build for complete brand systems, DreamLab for immersive brand experiences, and Brand Management for long-term partnerships.' },
  { k: ['price', 'cost', 'how much', 'pricing', 'rate', 'fee', 'budget', 'affordable', 'expensive'],
    r: 'Our pricing varies by scope. Brand Essentials is our most accessible package, Studio Retainer is a monthly engagement, and Full Production Build is our most comprehensive offering. Full pricing is on the Services page.' },
  { k: ['process', 'how does it work', 'steps', 'phases', 'how long', 'turnaround', 'workflow'],
    r: 'Our process runs six phases: Discovery, Positioning, Identity, Build, Guidelines, and Deploy. At every stage we ask one question \u2014 is this the bravest decision we can make? If not, we go back.' },
  { k: ['who are you', 'what is aqomi', 'about', 'story', 'history', 'founded', 'studio'],
    r: "AQOMI Studios is Canada's number one ranked branding and design agency, rated eighth in North America on Clutch. Over 18 years we've delivered more than 3,500 brand identities across 40 countries." },
  { k: ['portfolio', 'work', 'project', 'case study', 'examples', 'clients', 'brands', 'show me'],
    r: 'Our portfolio includes Shoe Guru, Rockhard, Aithr, NorthBay, Metegrity, Pansawan, and over 25 featured projects. Head to the Work page to browse everything.' },
  { k: ['contact', 'email', 'reach', 'get in touch', 'talk', 'message', 'phone'],
    r: 'You can reach us at info@aqomi.com for general inquiries, or press@aqomi.com for media. We respond within 48 hours with a tailored brief.' },
  { k: ['where', 'location', 'country', 'based', 'canada', 'city', 'remote'],
    r: 'AQOMI Studios is based in Canada. We work globally \u2014 across 40 countries \u2014 and collaborate remotely without any loss in quality or speed.' },
  { k: ['award', 'rated', 'clutch', 'ranking', 'number one', 'best', 'top', 'recognition'],
    r: "We're ranked number one in Canada and eighth in North America on Clutch, the world's leading B2B ratings platform. Our reviews reflect real client outcomes, not just aesthetics." },
  { k: ['start', 'hire', 'book', 'get started', 'work with', 'begin', 'kick off'],
    r: "To get started, book a call directly on our Book a Call page, or email info@aqomi.com. We'll respond within 48 hours with a tailored brief." },
  { k: ['industry', 'sector', 'niche', 'specialize', 'tech', 'luxury', 'hospitality', 'healthcare'],
    r: 'We work across all industries \u2014 tech, luxury, hospitality, healthcare, media, consumer goods, and more. Visit the Industries page to see how we approach each vertical.' },
  { k: ['dreamlab', 'dream lab', 'immersive', 'experience', 'space', 'interior', 'flagship'],
    r: 'DreamLab is our premium offering for brands that need to inhabit physical or digital spaces. It blends visual identity with experiential design \u2014 ideal for hospitality, retail, and flagship concepts.' },
  { k: ['retainer', 'monthly', 'ongoing', 'support', 'maintenance', 'dedicated'],
    r: 'Our Studio Retainer is a flexible monthly engagement giving you dedicated creative hours \u2014 perfect for brands that need consistent design support without a full-time hire.' },
  { k: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    r: "Hello! I'm the AQOMI Studios assistant. Ask me anything about our services, process, portfolio, or how to get started." },
  { k: ['thank', 'thanks', 'great', 'awesome', 'perfect'],
    r: "You're welcome. Feel free to ask anything else, or book a call when you're ready." },
];

const DEFAULT_RESPONSE = "Great question. For the most accurate answer, I'd recommend visiting our Services or Studio pages, or emailing us at info@aqomi.com \u2014 we respond within 48 hours.";

function matchQuery(q) {
  const lower = q.toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    for (const keyword of entry.k) {
      if (lower.includes(keyword)) return entry.r;
    }
  }
  return DEFAULT_RESPONSE;
}

export function initVoiceAssistant() {
  const synth  = window.speechSynthesis;
  const btn    = document.getElementById('va-btn');
  const card   = document.getElementById('va-card');
  const lbl    = document.getElementById('va-lbl');
  const msg    = document.getElementById('va-msg');
  const dots   = document.getElementById('va-dots');
  const micIc  = document.getElementById('va-mic-icon');
  const stopIc = document.getElementById('va-stop-icon');

  if (!btn || !card) return;

  let recognition = null;
  let isListening = false;

  function show(l, m, thinking) {
    lbl.textContent = l;
    msg.textContent = m;
    dots.style.display = thinking ? 'flex' : 'none';
    card.classList.remove('va-hidden');
  }

  function setIdle() {
    lbl.textContent = 'Tap to ask anything';
    msg.textContent = '';
    dots.style.display = 'none';
  }

  function setUI(on) {
    isListening = on;
    btn.classList.toggle('va-on', on);
    micIc.style.display  = on ? 'none' : 'block';
    stopIc.style.display = on ? 'block' : 'none';
  }

  function speak(text) {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    u.pitch = 1.02;
    const voices = synth.getVoices();
    const v = voices.find((v) => /Samantha|Google UK English Female|Karen|Moira|Fiona/.test(v.name));
    if (v) u.voice = v;
    u.onend = () => setIdle();
    synth.speak(u);
  }

  window.vaToggle = function () {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      show('Not supported', 'Voice input requires Chrome or Edge.', false);
      return;
    }

    if (isListening) {
      recognition.stop();
      setUI(false);
      card.classList.add('va-hidden');
      return;
    }

    synth.cancel();
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setUI(true); show('Listening\u2026', '', true); };

    recognition.onresult = (e) => {
      const q = e.results[0][0].transcript;
      show('You asked', q, false);
      setTimeout(() => {
        const answer = matchQuery(q);
        show('AQOMI Studios', answer, false);
        speak(answer);
      }, 350);
    };

    recognition.onerror = (e) => {
      setUI(false);
      if (e.error === 'no-speech') {
        card.classList.add('va-hidden');
      } else {
        show('Error', 'Could not hear you \u2014 please try again.', false);
        setTimeout(() => card.classList.add('va-hidden'), 2500);
      }
    };

    recognition.onend = () => setUI(false);
    recognition.start();
  };
}
