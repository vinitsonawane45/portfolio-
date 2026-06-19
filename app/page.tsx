'use client';

import {
  useState, useEffect, useRef, Suspense, useMemo, ChangeEvent, MouseEvent, FormEvent,
} from 'react';
import {
  Linkedin, Mail, Phone, Award, BadgeCheck, Building, Lightbulb,
  Code, Database, BrainCircuit, Cloud, BarChart3, GitMerge, Briefcase,
  Search, ArrowRight, Sun, Moon, Terminal, User, ChevronDown,
  Command, Zap, Cpu, Sparkles, ExternalLink, Copy, Check, Package, Send,
  Github, GraduationCap, Trophy, MessageSquare, Loader2,
  FlaskConical, FlaskRound, AlertTriangle, GitBranch, BookOpen,
  Rocket, MessageCircle, ChevronRight, Filter, ThumbsUp, HandHelping,
} from 'lucide-react';

import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import emailjs from '@emailjs/browser';

// ─── Types ────────────────────────────────────────────────────────────────────
type Theme = 'dark' | 'light' | 'matrix';
// ─── Theme Hook ───────────────────────────────────────────────────────────────
const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => {
    try { const s = (localStorage.getItem('portfolio-theme') as Theme) || 'dark'; setTheme(s); }
    catch { setTheme('dark'); }
  }, []);
  useEffect(() => {
    try { localStorage.setItem('portfolio-theme', theme); } catch {}
    document.body.dataset.theme = theme;
  }, [theme]);
  return [theme, setTheme] as const;
};


// ─── Custom Cursor ────────────────────────────────────────────────────────────
function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef  = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafRef  = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return;
    const onMove = (e: globalThis.MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
        dotRef.current.style.opacity = '1';
      }
    };
    const animate = () => {
      ringPos.current.x += (posRef.current.x - ringPos.current.x) * 0.11;
      ringPos.current.y += (posRef.current.y - ringPos.current.y) * 0.11;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`;
        ringRef.current.style.opacity = '1';
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    const setHover = (on: boolean) => {
      dotRef.current?.classList.toggle('cursor-hover', on);
      ringRef.current?.classList.toggle('cursor-hover', on);
    };
    const bindHover = () => {
      document.querySelectorAll<HTMLElement>('a,button,input,textarea,select').forEach(el => {
        el.addEventListener('mouseenter', () => setHover(true));
        el.addEventListener('mouseleave', () => setHover(false));
      });
    };
    document.addEventListener('mousemove', onMove);
    bindHover();
    const mo = new MutationObserver(bindHover);
    mo.observe(document.body, { childList: true, subtree: true });
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
      mo.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}

// ─── Magnetic Wrapper ─────────────────────────────────────────────────────────
function MagneticWrapper({ children, strength = 0.28 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
  };
  const onMouseLeave = () => { if (ref.current) ref.current.style.transform = 'translate(0,0)'; };
  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      style={{ display: 'inline-block', transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)' }}>
      {children}
    </div>
  );
}

// ─── Spotlight Card ───────────────────────────────────────────────────────────
function SpotlightCard({ children, className = '', style }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
    el.style.setProperty('--sp-o', '1');
  };
  const onMouseLeave = () => ref.current?.style.setProperty('--sp-o', '0');
  return (
    <div ref={ref} className={`spotlight-card ${className}`} style={style}
      onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {children}
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return;
      done.current = true; obs.disconnect();
      const dur = 1200; const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        setCount(Math.round((1 - Math.pow(1 - p, 4)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Typing Effect ────────────────────────────────────────────────────────────
function useTyping(texts: string[], speed = 88, pause = 2200) {
  const [displayed, setDisplayed] = useState('');
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const cur = texts[idx];
    let timer: ReturnType<typeof setTimeout>;
    if (!deleting && charIdx < cur.length)        timer = setTimeout(() => setCharIdx(c => c + 1), speed);
    else if (!deleting && charIdx === cur.length)  timer = setTimeout(() => setDeleting(true), pause);
    else if (deleting && charIdx > 0)             timer = setTimeout(() => setCharIdx(c => c - 1), speed / 2.2);
    else { setDeleting(false); setIdx(i => (i + 1) % texts.length); }
    return () => clearTimeout(timer);
  }, [charIdx, deleting, idx, texts, speed, pause]);
  useEffect(() => { setDisplayed(texts[idx].slice(0, charIdx)); }, [charIdx, idx, texts]);
  return displayed;
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function useScrollReveal(deps: React.DependencyList = []) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.07, rootMargin: '0px 0px -40px 0px' },
    );

    // Small delay so newly-mounted DOM (e.g. after page navigation) is present before querying.
    const id = requestAnimationFrame(() => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
        const rect = el.getBoundingClientRect();
        // If it's already within the viewport when mounted, reveal it immediately
        // instead of waiting for a scroll event that may never come.
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('revealed');
        } else {
          obs.observe(el);
        }
      });
    });

    return () => { cancelAnimationFrame(id); obs.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy} aria-label="Copy">
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
// EmailJS config — pulled from environment variables, NEVER hardcode these values here.
// Setup:
// 1. Create a free account at dashboard.emailjs.com → Email Services → connect your Gmail → copy the Service ID
// 2. Email Templates → make sure your template's variables are named EXACTLY:
//      {{name}}     → sender's name
//      {{email}}    → sender's email (used as Reply To)
//      {{title}}    → subject line
//      {{message}}  → message body
//      {{time}}     → timestamp (auto-filled below, optional in your template)
//    These must match the variable names below 1:1 — EmailJS returns a 400 with no detail if a
//    variable used in the "To Email" / "Reply To" fields isn't present in the data you send.
// 3. Account → General → copy your Public Key
// 4. Create a file named `.env.local` in your project root (same level as package.json) with:
//      NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
//      NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
//      NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
// 5. Restart `npm run dev` after adding/changing .env.local — Next.js only reads it on startup.
// 6. Add the SAME three variables in your hosting provider's dashboard (Vercel → Settings → Environment Variables)
//    before deploying, otherwise the live site won't have them.
const EMAILJS_SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  ?? '';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? '';
const EMAILJS_PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  ?? '';

function ContactForm() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errMsg, setErrMsg]   = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject || !form.message.trim()) {
      setStatus('error'); setErrMsg('Please fill in every field before sending.');
      return;
    }
    setStatus('sending'); setErrMsg('');
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        // Env vars not set up yet — surface a clear message instead of pretending success
        throw new Error('CONFIG_MISSING');
      }
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          // These keys must match the {{variable}} names inside your EmailJS template exactly.
          name:    form.name,
          email:   form.email,
          title:   form.subject,
          message: form.message,
          time:    new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );
      setStatus('sent');
      setTimeout(() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }); }, 4000);
    } catch (err) {
      setStatus('error');
      // Log the real EmailJS error to the console for debugging — status code alone (400) hides the reason.
      console.error('EmailJS send failed:', err);
      const emailjsText = (err as { text?: string })?.text;
      setErrMsg(
        err instanceof Error && err.message === 'CONFIG_MISSING'
          ? 'Form is not yet connected — add your EmailJS keys to .env.local (see comments in the code).'
          : emailjsText
            ? `Send failed: ${emailjsText}`
            : 'Something went wrong sending your message. Please try again or email me directly.'
      );
    }
  };

  const isDisabled = status === 'sending' || status === 'sent';

  return (
    <form ref={formRef} className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-label" htmlFor="cf-name">Your Name</label>
          <input id="cf-name" name="name" type="text" className="cf-input"
            placeholder="Recruiter / Friend" value={form.name} onChange={handle} required />
        </div>
        <div className="cf-field">
          <label className="cf-label" htmlFor="cf-email">Email Address</label>
          <input id="cf-email" name="email" type="email" className="cf-input"
            placeholder="you@company.com" value={form.email} onChange={handle} required />
        </div>
      </div>
      <div className="cf-field">
        <label className="cf-label" htmlFor="cf-subject">Subject</label>
        <select id="cf-subject" name="subject" className="cf-input cf-select"
          value={form.subject} onChange={handle} required>
          <option value="" disabled>Select a topic…</option>
          <option value="internship">Internship Opportunity</option>
          <option value="collaboration">Project Collaboration</option>
          <option value="freelance">Freelance Work</option>
          <option value="general">General Enquiry</option>
        </select>
      </div>
      <div className="cf-field">
        <label className="cf-label" htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="message" className="cf-input cf-textarea"
          placeholder="Tell me about the opportunity or project…"
          rows={5} value={form.message} onChange={handle} required />
      </div>
      {status === 'error' && errMsg && (
        <p className="cf-error" role="alert">{errMsg}</p>
      )}
      <button type="submit" className={`cf-submit cf-submit--${status}`} disabled={isDisabled}>
        {status === 'idle'    && <><Send    size={15} aria-hidden="true" /> Send Message</>}
        {status === 'sending' && <><Loader2 size={15} className="spin"   aria-hidden="true" /> Sending…</>}
        {status === 'sent'    && <><Check   size={15} aria-hidden="true" /> Message Sent!</>}
        {status === 'error'   && <><Mail    size={15} aria-hidden="true" /> Try Again</>}
      </button>
    </form>
  );
}

// ─── 3D Starfield ─────────────────────────────────────────────────────────────
function Global3DScene({ theme }: { theme: Theme }) {
  const count  = theme === 'matrix' ? 7000 : theme === 'light' ? 3000 : 6000;
  const factor = theme === 'light' ? 3 : 4;
  return (
    <div className="global-canvas-container" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={count} factor={factor} saturation={0} fade speed={0.4} />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} autoRotate autoRotateSpeed={0.12} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const skills = [
  { title: 'AI / ML',        icon: <BrainCircuit size={18}/>, color: '#a78bfa', list: ['LLMs (GPT-4, Gemini, Llama 3)', 'LangChain', 'RAG Pipelines', 'Hugging Face', 'NLP', 'Prompt Engineering', 'Fine-tuning','Transformers'] },
  { title: 'Languages',      icon: <Code         size={18}/>, color: '#6c8eff', list: ['Python', 'JavaScript ES6+', 'SQL', 'HTML5 / CSS3', 'Bash / Shell'] },
  { title: 'Backend',        icon: <Briefcase    size={18}/>, color: '#f59e0b', list: ['Flask', 'FastAPI', 'Streamlit', 'RESTful APIs', 'Node.js', 'Microservices'] },
  { title: 'Cloud & DevOps', icon: <Cloud        size={18}/>, color: '#f97316', list: ['AWS EC2', 'S3', 'Lambda', 'Docker', 'GitHub Actions', 'CI/CD', 'Railway', 'Render'] },
  { title: 'Databases',      icon: <Database     size={18}/>, color: '#34d399', list: ['MongoDB', 'MySQL', 'ChromaDB', 'DynamoDB','Firebase'] },
  { title: 'Data & Viz',     icon: <BarChart3    size={18}/>, color: '#22d3ee', list: ['scikit-learn', 'pandas', 'NumPy', 'Matplotlib', 'Power BI', 'Jupyter','Tableau'] },
  { title: 'Tools',          icon: <GitMerge     size={18}/>, color: '#fb7185', list: ['Git & GitHub', 'VS Code', 'Postman', 'Jupyter Notebooks'] },
];

const experiences = [
  {
    date: 'Jan 2024 — Mar 2024', title: 'Data Science Intern',
    company: 'IBM SkillsBuild', tag: 'Remote', color: '#5b8df6',
    description: [
      'Spearheaded analysis of a 10,000+ record dataset to identify customer churn patterns using Pandas & NumPy.',
      'Architected predictive ML models (Logistic Regression, Decision Trees) achieving 85% validation accuracy.',
      'Formulated interactive Power BI dashboards translating technical data into actionable business insights.',
    ],
  },
  {
    date: 'Jun 2023 — Aug 2023', title: 'Cloud Computing Intern',
    company: 'AWS Cloud Internship Program', tag: 'Remote', color: '#f59e0b',
    description: [
      'Orchestrated deployment of a high-availability Flask app on AWS EC2 with Docker — maintained 99.9% uptime.',
      'Established CI/CD pipelines via AWS CodePipeline, reducing release cycle time by 40%.',
      'Constructed serverless workflows with AWS Lambda & S3, reducing system latency by 30%.',
    ],
  },
];

const projects = [
  {
    title: 'AI Email Assistant',
    tag: 'Python · Flask · LangChain · OpenAI API',
    accent: '#6c8eff', glow: 'rgba(108,142,255,0.14)', icon: '✉️',
    description: [
      'Production-ready Chrome extension integrating ChatGPT, Gemini & Groq APIs for smart email drafting.',
      'Multi-Model Reasoning cut API costs by 15% while maintaining 85% smart-reply accuracy.',
      'Secure Railway backend with OAuth2 authentication and MongoDB user preference storage.',
    ],
    metrics: ['85% Accuracy', '15% Cost Cut', 'OAuth2', 'Multi-Model'],
    github: 'https://github.com/vinitsonawane45',
    isTeam: false,
  },
  {
    title: 'Saransh AI',
    tag: 'Hugging Face · Ollama · React.js',
    accent: '#34d399', glow: 'rgba(52,211,153,0.14)', icon: '🧠',
    description: [
      'NLP engine using fine-tuned Ollama models generating summaries with 90% semantic consistency.',
      'Sentiment Analysis auto-tags content tone for automated content moderation workflows.',
      'React.js frontend with real-time streaming and multi-document support (Mistral, DeepSeek).',
    ],
    metrics: ['90% Consistency', 'Sentiment Analysis', 'Multi-doc'],
    github: 'https://github.com/SAURABHSALVE',
    isTeam: true,
  },
  {
    title: 'RAG Document Intelligence',
    tag: 'LlamaIndex · Vector Search · Streamlit',
    accent: '#f59e0b', glow: 'rgba(245,158,11,0.14)', icon: '📄',
    description: [
      'RAG system querying complex PDFs via Vector Embeddings and LlamaIndex pipelines.',
      'Semantic Search retrieves context-aware answers, significantly outperforming keyword search.',
      'Streamlit UI with drag-and-drop upload and chat-style Q&A interface.',
    ],
    metrics: ['RAG Pipeline', 'Vector Search', 'PDF Q&A'],
    github: 'https://github.com/SAURABHSALVE',
    isTeam: true,
  },
  {
    title: 'Mental Health Assistant',
    tag: 'ChatGPT API · Python · Intent Detection',
    accent: '#fb7185', glow: 'rgba(251,113,133,0.14)', icon: '💬',
    description: [
      'Empathetic conversational agent using advanced Prompt Engineering for safe, context-aware responses.',
      'Real-time Intent Detection analyses user mood and routes to appropriate support resources.',
      'Guardrails and content filters ensure responsible AI in sensitive mental-health conversations.',
    ],
    metrics: ['Intent Detection', 'Prompt Engineering', 'Safe AI'],
    github: 'https://github.com/vinitsonawane45',
    isTeam: false,
  },
];

const certifications = [
  { title: 'Prompt Engineering for Everyone',          issuer: 'IBM Skills Network',             icon: <Award size={16}/>,     color: '#6c8eff', year: '2024', month: 'Nov', desc: 'Where it started — learning to talk to LLMs the right way before building anything on top of them.' },
  { title: 'Building LLM Apps with Prompt Engineering', issuer: 'NVIDIA Deep Learning Institute', icon: <Award size={16}/>,     color: '#76b900', year: '2025', month: 'Mar', desc: 'Went deeper into structuring prompts for real applications, not just chat — context windows, chaining, evaluation.' },
  { title: 'ServiceNow Fundamentals',                  issuer: 'ServiceNow',                     icon: <BadgeCheck size={16}/>, color: '#fb7185', year: '2025', month: 'May', desc: 'Picked up enterprise workflow automation fundamentals — useful context for building AI tools people actually use at work.' },
  { title: 'GenAI Mastery Workshop',                   issuer: 'OpenAI × NxtWave',               icon: <Sparkles size={16}/>,  color: '#10a37f', year: '2025', month: 'Aug', desc: 'Selected for an intensive hands-on buildathon — shipped a working GenAI prototype under deadline pressure.' },
  { title: 'Gen AI Academy Certification',              issuer: 'Google Cloud',                   icon: <Award size={16}/>,     color: '#4285f4', year: '2025', month: 'Oct', desc: 'Formalised cloud-native GenAI patterns — Vertex AI, embeddings, and production deployment practices.' },
];

const achievements = [
  {
    title: 'Gen AI Exchange Hackathon',
    role: 'Top Finalist',
    year: '2025',
    desc: 'Developed an AR & Blockchain-based AI storytelling platform — top finalist among hundreds of competing teams nationwide.',
    color: '#f59e0b',
    icon: '🏆',
  },
  {
    title: 'OpenAI × NxtWave Buildathon',
    role: 'Selected Participant',
    year: '2025',
    desc: 'Competitively selected based on technical skills for the exclusive GenAI Mastery Workshop and Buildathon.',
    color: '#10a37f',
    icon: '🎯',
  },
];

// ─── Builder's Lab data ─────────────────────────────────────────────────────
type LabStage = { label: string; detail: string; kind: 'idea' | 'experiment' | 'failure' | 'decision' | 'lesson' | 'shipped' };
type LabEntry = {
  id: string;
  title: string;
  status: 'shipped' | 'in-progress' | 'stuck';
  statusLabel: string;
  oneLiner: string;
  accent: string;
  startDate: string;
  stack: string[];
  stages: LabStage[];
  currentlyStuckOn?: string;
  helpWanted?: string;
};

const labEntries: LabEntry[] = [
  {
    id: 'rag-doc',
    title: 'RAG Document Intelligence',
    status: 'shipped',
    statusLabel: 'Shipped',
    oneLiner: 'Querying messy PDFs in plain English without losing the source citation.',
    accent: '#f59e0b',
    startDate: 'Feb 2025',
    stack: ['LlamaIndex', 'ChromaDB', 'Streamlit'],
    stages: [
      { kind: 'idea', label: 'The itch', detail: 'Reading 40-page research PDFs to find one paragraph felt absurd in 2025. Wanted to just ask the document a question.' },
      { kind: 'experiment', label: 'First attempt: naive chunking', detail: 'Split PDFs into fixed 500-character chunks and embedded each one. Worked for short docs, fell apart on anything with tables or multi-column layouts.' },
      { kind: 'failure', label: 'Chunking broke on tables', detail: 'Financial tables got sliced mid-row, so the model confidently answered with numbers from the wrong column. Embarrassing demo moment in front of a mentor.' },
      { kind: 'decision', label: 'Switched to semantic + layout-aware chunking', detail: 'Moved to LlamaIndex\'s node parser with overlap and added a layout-detection pre-pass so tables stay intact as single chunks instead of being split.' },
      { kind: 'experiment', label: 'Tuning retrieval top-k', detail: 'Tried k=3 (too narrow, missed context) and k=10 (too noisy, model got distracted). Settled on k=5 with a re-ranking step.' },
      { kind: 'lesson', label: 'Lesson learned', detail: 'Chunking strategy matters more than the embedding model you pick. I spent a week comparing embedding models when the real bug was upstream in how I was slicing text.' },
      { kind: 'shipped', label: 'Shipped', detail: 'Live demo handles PDFs up to 200 pages with source-page citations on every answer.' },
    ],
  },
  {
    id: 'email-assistant',
    title: 'AI Email Assistant',
    status: 'shipped',
    statusLabel: 'Shipped',
    oneLiner: 'A Chrome extension that drafts replies without sounding like a robot wrote them.',
    accent: '#6c8eff',
    startDate: 'Oct 2024',
    stack: ['Flask', 'LangChain', 'OAuth2', 'MongoDB'],
    stages: [
      { kind: 'idea', label: 'The itch', detail: 'Watched a friend spend 20 minutes drafting a 3-line email reply. Figured a model could do the first draft in 3 seconds.' },
      { kind: 'experiment', label: 'Single-model prototype', detail: 'Wired up GPT-4 directly from the extension to draft replies based on the email thread. It worked, but API costs were climbing fast during testing.' },
      { kind: 'failure', label: 'Cost spiral during user testing', detail: 'Five testers in one afternoon racked up a surprising bill, since every keystroke pause triggered a fresh completion call with no caching.' },
      { kind: 'decision', label: 'Multi-model routing', detail: 'Routed simple replies to a cheaper model (Groq) and only escalated to GPT-4 for nuanced or long threads. Added debounced triggering instead of per-keystroke calls.' },
      { kind: 'experiment', label: 'OAuth integration pain', detail: 'Gmail\'s OAuth consent screen kept rejecting the extension during review. Took three resubmissions and a scopes audit to get approved.' },
      { kind: 'lesson', label: 'Lesson learned', detail: 'Ship the boring cost-control plumbing (caching, debouncing, model routing) before the demo-able feature, not after. I had it backwards the first time.' },
      { kind: 'shipped', label: 'Shipped', detail: 'Cut API costs by 15% versus the single-model version while keeping 85% smart-reply accuracy in testing.' },
    ],
  },
  {
    id: 'mental-health-bot',
    title: 'Mental Health Assistant',
    status: 'in-progress',
    statusLabel: 'In Progress',
    oneLiner: 'A conversational agent that has to know when *not* to respond like a chatbot.',
    accent: '#fb7185',
    startDate: 'May 2025',
    stack: ['ChatGPT API', 'Python', 'Intent Detection'],
    stages: [
      { kind: 'idea', label: 'The itch', detail: 'Most "AI therapist" demos online felt tone-deaf — cheerful chatbot energy applied to genuinely heavy topics. Wanted to build one with actual guardrails baked in from day one, not bolted on after.' },
      { kind: 'experiment', label: 'Prompt-only safety attempt', detail: 'Started with a long system prompt asking the model to "be careful and supportive." It worked on happy-path tests but was inconsistent under edge cases.' },
      { kind: 'failure', label: 'Guardrails too easy to route around', detail: 'A rephrased message could slip past the prompt-based safety instructions. Realised prompting alone wasn\'t a safety architecture, just a suggestion.' },
      { kind: 'decision', label: 'Added a dedicated intent-classification layer', detail: 'Now every message passes through a separate, smaller classifier before the main model sees it. High-risk intents get routed to a fixed, human-reviewed response with real resources — never a freeform generation.' },
      { kind: 'experiment', label: 'Testing classifier precision', detail: 'Currently building a labeled test set of ambiguous phrasing to measure false negatives on the intent classifier, since a missed flag here matters more than a false positive.' },
      { kind: 'lesson', label: 'Lesson so far', detail: 'For anything safety-sensitive, the model\'s output is the last line of defence, not the first. The architecture around it has to do most of the work.' },
    ],
  },
  {
    id: 'saransh-ai',
    title: 'Saransh AI',
    status: 'in-progress',
    statusLabel: 'In Progress · Team',
    oneLiner: 'Multi-document summarisation that stays consistent across 5+ source files at once.',
    accent: '#34d399',
    startDate: 'Mar 2025',
    stack: ['Hugging Face', 'Ollama', 'React.js'],
    stages: [
      { kind: 'idea', label: 'The itch', detail: 'Built with a teammate (Saurabh) after both of us got tired of manually cross-referencing five research papers for one literature review.' },
      { kind: 'experiment', label: 'Single-pass summarisation', detail: 'Fed all documents into one giant context window and asked for a unified summary. Quality degraded sharply past 3 documents — the model started conflating sources.' },
      { kind: 'failure', label: 'Source conflation', detail: 'The summary attributed a finding from Document A to Document C. Caught it by accident during a demo — not something we\'d tested for explicitly.' },
      { kind: 'decision', label: 'Per-document summarise-then-merge pipeline', detail: 'Switched to summarising each document independently first, tagging every claim with its source, then running a second pass that merges and resolves overlaps.' },
      { kind: 'experiment', label: 'Local model swap (Ollama)', detail: 'Currently testing Mistral and DeepSeek running locally via Ollama to cut hosted-API costs for the merge step, comparing semantic consistency scores between them.' },
      { kind: 'lesson', label: 'Lesson so far', detail: 'Splitting a problem into smaller, independently-verifiable steps beats one clever prompt every time — even when the clever prompt looks like it\'s working in early tests.' },
    ],
  },
  {
    id: 'voice-rag',
    title: 'Voice-First RAG Agent',
    status: 'stuck',
    statusLabel: 'Stuck — need a hand',
    oneLiner: 'Trying to make a RAG pipeline fast enough to feel natural over voice, not just text.',
    accent: '#a78bfa',
    startDate: 'Jun 2026',
    stack: ['Whisper', 'LlamaIndex', 'WebSockets'],
    stages: [
      { kind: 'idea', label: 'The itch', detail: 'Text-based RAG demos are everywhere, but talking to your documents feels like a genuinely different product. Wanted to see how far I could push latency down for a voice interface.' },
      { kind: 'experiment', label: 'Streaming pipeline v1', detail: 'Wired together Whisper for transcription, the existing RAG retrieval pipeline, and a TTS response — all sequential. Round-trip latency landed around 6-8 seconds, which feels broken in a voice context.' },
      { kind: 'failure', label: 'Latency budget blown', detail: 'Tried parallelising retrieval with transcription completion, but retrieval needs the full query text, so there is a hard dependency I couldn\'t fully remove.' },
      { kind: 'decision', label: 'Investigating partial-query retrieval', detail: 'Exploring whether I can kick off a speculative retrieval pass on partial transcripts and refine it once the full query lands, similar to how search-as-you-type works.' },
    ],
    currentlyStuckOn: 'Speculative retrieval on partial transcripts keeps returning irrelevant chunks early, which sometimes anchors the final answer in the wrong direction even after the full query arrives.',
    helpWanted: 'If you\'ve worked on streaming RAG, low-latency voice pipelines, or speculative retrieval patterns, I\'d genuinely love a pointer — drop a note via the contact form below.',
  },
];

// ─── Command Menu ─────────────────────────────────────────────────────────────
type CmdItem  = { icon: React.ElementType; text: string; sub?: string; href?: string; newTab?: boolean; action?: () => void };
type CmdGroup = { group: string; items: CmdItem[] };

const ALL_COMMANDS: CmdGroup[] = [
  { group: 'Links', items: [
    { icon: Linkedin, text: 'LinkedIn', sub: 'linkedin.com/in/vinit-sonawane', href: 'https://www.linkedin.com/in/vinit-sonawane-14b00632a/', newTab: true },
    { icon: Github,   text: 'GitHub',   sub: 'github.com/vinitsonawane45',     href: 'https://github.com/vinitsonawane45',   newTab: true },
    { icon: Mail,     text: 'Email',    sub: 'vinitsonawane76@gmail.com',      href: 'mailto:vinitsonawane76@gmail.com' },
    { icon: Phone,    text: 'Phone',    sub: '+91 9975294916',                 href: 'tel:+919975294916' },
  ]},
  { group: 'Navigate', items: [
    { icon: User,         text: 'About',         action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: BrainCircuit, text: 'Skills',         action: () => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: Briefcase,    text: 'Experience',     action: () => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: Package,      text: 'Projects',       action: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: FlaskConical, text: "Builder's Lab",  action: () => document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: Award,        text: 'Certifications', action: () => document.getElementById('certifications')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: Trophy,       text: 'Achievements',   action: () => document.getElementById('achievements')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: Send,         text: 'Contact',        action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) },
  ]},
];

function CommandMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch]       = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_COMMANDS;
    const q = search.toLowerCase();
    return ALL_COMMANDS.flatMap(g => {
      const items = g.items.filter(i => i.text.toLowerCase().includes(q) || i.sub?.toLowerCase().includes(q));
      return items.length ? [{ ...g, items }] : [];
    });
  }, [search]);

  const flat = useMemo(() => filtered.flatMap(g => g.items), [filtered]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 60); }, [isOpen]);
  useEffect(() => { if (!isOpen) { setSearch(''); setActiveIdx(0); } }, [isOpen]);
  useEffect(() => { setActiveIdx(0); }, [search]);

  const execute = (item: CmdItem) => {
    item.action?.();
    if (item.href && item.newTab)                  window.open(item.href, '_blank', 'noopener,noreferrer');
    if (item.href && !item.newTab && !item.action) window.location.href = item.href;
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape')    { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => (i + 1) % Math.max(flat.length, 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => (i - 1 + Math.max(flat.length, 1)) % Math.max(flat.length, 1)); }
      if (e.key === 'Enter' && flat[activeIdx]) execute(flat[activeIdx]);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, flat, activeIdx, onClose]);

  if (!isOpen) return null;
  

  return (
    <div className="cmd-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="cmd-modal" onClick={e => e.stopPropagation()}>
        <div className="cmd-search-row">
          <Search size={15} className="cmd-search-icon" aria-hidden="true" />
          <input ref={inputRef} className="cmd-input" placeholder="Search commands or links…"
            value={search} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} aria-label="Search" />
          <kbd className="cmd-esc">Esc</kbd>
        </div>
        <div className="cmd-list" role="listbox">
          {flat.length === 0 && <p className="cmd-empty">No results for &ldquo;<strong>{search}</strong>&rdquo;</p>}
          {filtered.map((group, groupIndex) => (
            <div key={group.group}>
              <p className="cmd-group-label">{group.group}</p>
              {group.items.map((item, itemIndex) => {
                const cur = groupIndex * 100 + itemIndex;
                const Icon = item.icon;
                return (
                  <button key={item.text} className={`cmd-item ${cur === activeIdx ? 'active' : ''}`}
                    onMouseEnter={() => setActiveIdx(cur)} onClick={() => execute(item)} role="option" aria-selected={cur === activeIdx}>
                    {/* <span className="cmd-item-icon"><Icon size={15} /></span> */}
                    <span className="cmd-item-body">
                     <span className="cmd-item-text">{item.text}</span>
                      {item.sub && <span className="cmd-item-sub">{item.sub}</span>}
                    </span>
                    <ArrowRight size={13} className="cmd-arrow" aria-hidden="true" />
                  </button>
                );
              })}
              
            </div>
          ))}
        </div>
        <div className="cmd-footer" aria-hidden="true">
          <span><kbd>↑↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

// ─── Theme Switcher ───────────────────────────────────────────────────────────
function ThemeSwitcher({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <div className="theme-switcher" role="group" aria-label="Colour scheme">
      {([['light', <Sun size={13}/>, 'Light'], ['dark', <Moon size={13}/>, 'Dark'], ['matrix', <Terminal size={13}/>, 'Matrix']] as [Theme, React.ReactNode, string][]).map(([t, icon, label]) => (
        <MagneticWrapper key={t} strength={0.18}>
          <button className={`theme-btn ${theme === t ? 'active' : ''}`} onClick={() => setTheme(t)}
            aria-label={`${label} mode`} aria-pressed={theme === t}>{icon}</button>
        </MagneticWrapper>
      ))}
    </div>
  );
}

// ─── Builder's Lab ────────────────────────────────────────────────────────────
const STAGE_META: Record<LabStage['kind'], { icon: React.ElementType; label: string; color: string }> = {
  idea:       { icon: Lightbulb,      label: 'Idea',       color: '#a78bfa' },
  experiment: { icon: FlaskRound,     label: 'Experiment',  color: '#22d3ee' },
  failure:    { icon: AlertTriangle,  label: 'Failure',     color: '#fb7185' },
  decision:   { icon: GitBranch,      label: 'Decision',    color: '#f59e0b' },
  lesson:     { icon: BookOpen,       label: 'Lesson',      color: '#34d399' },
  shipped:    { icon: Rocket,         label: 'Shipped',     color: '#6c8eff' },
};

const STATUS_META: Record<LabEntry['status'], { color: string; dot: string }> = {
  shipped:     { color: '#34d399', dot: '#34d399' },
  'in-progress': { color: '#f59e0b', dot: '#f59e0b' },
  stuck:       { color: '#fb7185', dot: '#fb7185' },
};

function LabEntryCard({ entry, index, isOpen, onToggle }: {
  entry: LabEntry; index: number; isOpen: boolean; onToggle: () => void;
}) {
  const sMeta = STATUS_META[entry.status];
  return (
    <SpotlightCard
      className={`lab-card reveal ${isOpen ? 'lab-card--open' : ''} ${entry.status === 'stuck' ? 'lab-card--stuck' : ''}`}
      style={{ '--lab-accent': entry.accent, transitionDelay: `${index * 60}ms` } as React.CSSProperties}
    >
      <button className="lab-card-head" onClick={onToggle} aria-expanded={isOpen} aria-controls={`lab-body-${entry.id}`}>
        <div className="lab-card-head-top">
          <span className="lab-status-pill" style={{ color: sMeta.color, background: `${sMeta.color}16`, borderColor: `${sMeta.color}38` }}>
            <span className="lab-status-dot" style={{ background: sMeta.dot }} aria-hidden="true" />
            {entry.statusLabel}
          </span>
          <span className="lab-date">{entry.startDate}</span>
        </div>
        <h3 className="lab-title">{entry.title}</h3>
        <p className="lab-oneliner">{entry.oneLiner}</p>
        <div className="lab-stack-row">
          {entry.stack.map(s => (
            <span key={s} className="lab-stack-chip" style={{ borderColor: `${entry.accent}38`, color: entry.accent }}>{s}</span>
          ))}
        </div>
        <span className="lab-expand-hint">
          {isOpen ? 'Hide the build log' : 'See the build log'}
          <ChevronRight size={14} className={`lab-chevron ${isOpen ? 'lab-chevron--open' : ''}`} aria-hidden="true" />
        </span>
      </button>

      <div id={`lab-body-${entry.id}`} className={`lab-card-body ${isOpen ? 'lab-card-body--open' : ''}`}>
        <div className="lab-timeline">
          {entry.stages.map((stage, i) => {
            const meta = STAGE_META[stage.kind];
            const Icon = meta.icon;
            return (
              <div key={i} className="lab-stage">
                <div className="lab-stage-rail" aria-hidden="true">
                  <span className="lab-stage-dot" style={{ background: meta.color, boxShadow: `0 0 0 3px ${meta.color}22` }}>
                    <Icon 
                      size={11} 
                    />
                  </span>
                  {i < entry.stages.length - 1 && <span className="lab-stage-line" />}
                </div>
                <div className="lab-stage-content">
                  <span className="lab-stage-kind" style={{ color: meta.color }}>{meta.label}</span>
                  <p className="lab-stage-label">{stage.label}</p>
                  <p className="lab-stage-detail">{stage.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {entry.status === 'stuck' && entry.currentlyStuckOn && (
          <div className="lab-stuck-box">
            <div className="lab-stuck-head">
              <HandHelping size={15} aria-hidden="true" />
              <span>Currently stuck on</span>
            </div>
            <p className="lab-stuck-text">{entry.currentlyStuckOn}</p>
            {entry.helpWanted && <p className="lab-stuck-help">{entry.helpWanted}</p>}
            <a href="#contact" className="lab-stuck-cta">
              <MessageCircle size={13} aria-hidden="true" /> Offer a pointer
            </a>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}

// ─── Builder's Lab ─── Dev Story Cards ──────────────────────────────────────
function LabStoryCard({ entry, index }: { entry: LabEntry; index: number }) {
  const [activeStage, setActiveStage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 120 + 18));
  const sMeta = STATUS_META[entry.status];
  const stage = entry.stages[activeStage];
  const stageMeta = STAGE_META[stage.kind];
  const StageIcon = stageMeta.icon;

  const stageEmoji: Record<LabStage['kind'], string> = {
    idea: '💡', experiment: '🧪', failure: '💥', decision: '⚡', lesson: '📖', shipped: '🚀',
  };

  const shareText = `"${stage.label}" — from building ${entry.title}. ${stage.detail.slice(0, 120)}… by @vinitsonawane`;

  return (
    <article
      className={`lab-story-card reveal`}
      style={{ '--story-accent': entry.accent, animationDelay: `${index * 80}ms` } as React.CSSProperties}
    >
      {/* Top bar */}
      <div className="lsc-topbar">
        <div className="lsc-project-tag" style={{ color: entry.accent, background: `${entry.accent}14`, borderColor: `${entry.accent}28` }}>
          {entry.title}
        </div>
        <div className="lsc-meta-right">
          <span className="lsc-status" style={{ color: sMeta.color }}>
            <span className="lsc-status-dot" style={{ background: sMeta.color }} />
            {entry.statusLabel}
          </span>
          <span className="lsc-date">{entry.startDate}</span>
        </div>
      </div>

      {/* Stage progress dots */}
      <div className="lsc-stage-dots" role="tablist" aria-label="Build stages">
        {entry.stages.map((s, i) => {
          const sm = STAGE_META[s.kind];
          return (
            <button
              key={i} role="tab" aria-selected={i === activeStage}
              className={`lsc-dot ${i === activeStage ? 'lsc-dot--active' : ''} ${i < activeStage ? 'lsc-dot--done' : ''}`}
              style={i === activeStage ? { background: sm.color, boxShadow: `0 0 8px ${sm.color}88` } : {}}
              onClick={() => setActiveStage(i)}
              title={s.label}
            >
              {i < activeStage ? '✓' : stageEmoji[s.kind]}
            </button>
          );
        })}
      </div>

      {/* Main story content */}
      <div className="lsc-body">
        <div className="lsc-stage-kicker" style={{ color: stageMeta.color }}>
          <StageIcon size={12} aria-hidden="true" />
          {stageMeta.label} · Step {activeStage + 1} of {entry.stages.length}
        </div>
        <h3 className="lsc-headline">{stage.label}</h3>
        <p className="lsc-detail">{stage.detail}</p>

        {/* Stack pills */}
        <div className="lsc-stack">
          {entry.stack.map(s => (
            <span key={s} className="lsc-stack-pill" style={{ borderColor: `${entry.accent}30`, color: entry.accent }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Nav arrows */}
      <div className="lsc-nav">
        <button className="lsc-nav-btn" onClick={() => setActiveStage(i => Math.max(0, i - 1))}
          disabled={activeStage === 0} aria-label="Previous stage">
          ←
        </button>
        <span className="lsc-nav-count">{activeStage + 1} / {entry.stages.length}</span>
        <button className="lsc-nav-btn" onClick={() => setActiveStage(i => Math.min(entry.stages.length - 1, i + 1))}
          disabled={activeStage === entry.stages.length - 1} aria-label="Next stage">
          →
        </button>
      </div>

      {/* Footer actions */}
      <div className="lsc-footer">
        <button
          className={`lsc-action-btn lsc-like-btn ${liked ? 'lsc-action-btn--active' : ''}`}
          onClick={() => { setLiked(l => !l); setLikeCount(n => liked ? n - 1 : n + 1); }}
          aria-label={liked ? 'Unlike' : 'Like'} aria-pressed={liked}
        >
          <span>{liked ? '❤️' : '🤍'}</span>
          <span className="lsc-action-count">{likeCount}</span>
        </button>

        <button
          className={`lsc-action-btn ${bookmarked ? 'lsc-action-btn--active' : ''}`}
          onClick={() => setBookmarked(b => !b)}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <span>{bookmarked ? '🔖' : '📎'}</span>
          <span className="lsc-action-label">{bookmarked ? 'Saved' : 'Save'}</span>
        </button>

        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
          target="_blank" rel="noopener noreferrer"
          className="lsc-action-btn lsc-share-btn"
          aria-label="Share on X / Twitter"
        >
          <span>𝕏</span>
          <span className="lsc-action-label">Share</span>
        </a>

        <a href={entry.github || 'https://github.com/vinitsonawane45'} target="_blank" rel="noopener noreferrer"
          className="lsc-action-btn" aria-label="View code">
          <Github size={13} />
          <span className="lsc-action-label">Code</span>
        </a>
      </div>
    </article>
  );
}

function LabSection({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [filter, setFilter] = useState<'all' | LabEntry['status']>('all');

  const FILTERS = [
    { key: 'all',         label: 'All Projects',   emoji: '🗂️' },
    { key: 'shipped',     label: 'Shipped',         emoji: '🚀' },
    { key: 'in-progress', label: 'In Progress',     emoji: '⚡' },
    { key: 'stuck',       label: 'Need Help',       emoji: '🆘' },
  ] as const;

  const filtered = filter === 'all' ? labEntries : labEntries.filter(e => e.status === filter);

  return (
    <section id="lab" className="section lab-section">
      <div className="container">

        {/* Hero header */}
        <div className="lab-header reveal">
          <div className="lab-header-left">
            <p className="section-label">// the_process</p>
            <h2 className="section-heading">Builder&apos;s Lab</h2>
            <p className="lab-tagline">
              Real build diaries — not just the highlight reel. Click through every stage:
              the spark, the experiment, the failure, the fix, and the ship.
            </p>
          </div>
          <div className="lab-header-stats">
            <div className="lab-hstat">
              <span className="lab-hstat-num">{labEntries.length}</span>
              <span className="lab-hstat-label">Projects</span>
            </div>
            <div className="lab-hstat">
              <span className="lab-hstat-num">{labEntries.reduce((a, e) => a + e.stages.length, 0)}</span>
              <span className="lab-hstat-label">Build stages</span>
            </div>
            <div className="lab-hstat">
              <span className="lab-hstat-num">{labEntries.filter(e => e.status === 'shipped').length}</span>
              <span className="lab-hstat-label">Shipped</span>
            </div>
          </div>
        </div>

        {/* Filter row */}
        <div className="lab-filters reveal" role="group" aria-label="Filter projects">
          {FILTERS.map(f => (
            <button key={f.key}
              className={`lab-filter-chip ${filter === f.key ? 'lab-filter-chip--active' : ''}`}
              onClick={() => setFilter(f.key as typeof filter)}>
              {f.emoji} {f.label}
            </button>
          ))}
        </div>

        {/* Story cards grid */}
        <div className="lab-stories-grid">
          {filtered.map((entry, i) => (
            <LabStoryCard key={entry.id} entry={entry} index={i} />
          ))}
        </div>

        {/* CTA banner */}
        <div className="lab-cta-banner reveal">
          <div className="lab-cta-content">
            <span className="lab-cta-icon">🤝</span>
            <div>
              <p className="lab-cta-title">Built something similar? Hit a wall I haven&apos;t?</p>
              <p className="lab-cta-sub">Drop me a message — I reply to everything, especially technical threads.</p>
            </div>
            <button className="lab-cta-btn" onClick={() => onNavigate('contact')}>
              <MessageCircle size={14} /> Let&apos;s talk
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── Page types ───────────────────────────────────────────────────────────────
type PageId = 'home' | 'about' | 'skills' | 'experience' | 'projects' | 'lab' | 'certifications' | 'achievements' | 'contact';

const PAGE_META: Record<PageId, { label: string; icon: React.ElementType; short: string }> = {
  home:           { label: 'Home',           icon: User,         short: '~' },
  about:          { label: 'About',          icon: User,         short: '01' },
  skills:         { label: 'Skills',         icon: BrainCircuit, short: '02' },
  experience:     { label: 'Experience',     icon: Briefcase,    short: '03' },
  projects:       { label: 'Projects',       icon: Package,      short: '04' },
  lab:            { label: "Builder's Lab",  icon: FlaskConical, short: '05' },
  certifications: { label: 'Certifications', icon: Award,        short: '06' },
  achievements:   { label: 'Achievements',  icon: Trophy,       short: '07' },
  contact:        { label: 'Contact',        icon: Send,         short: '08' },
};

const NAV_PAGES: PageId[] = ['about','skills','experience','projects','lab','certifications','achievements','contact'];

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ theme, setTheme, onOpenCmd, activePage, onNavigate }: {
  theme: Theme; setTheme: (t: Theme) => void; onOpenCmd: () => void;
  activePage: PageId; onNavigate: (p: PageId) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const go = (p: PageId) => { onNavigate(p); setMobileOpen(false); };

  return (
    <>
      <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>

        {/* Logo */}
        <button className="header-logo" onClick={() => go('home')} aria-label="Home">
          <span className="logo-bracket">[</span>VS<span className="logo-bracket">]</span>
          <span className="logo-full-name">Vinit Sonawane</span>
        </button>

        {/* Desktop sidebar nav */}
        <nav className="header-nav" aria-label="Main navigation">
          {NAV_PAGES.map(id => {
            const meta = PAGE_META[id];
            const Icon = meta.icon;
            return (
              <button key={id} onClick={() => go(id)}
                className={`nav-btn ${activePage === id ? 'nav-btn--active' : ''}`}
                aria-current={activePage === id ? 'page' : undefined}>
                {activePage === id && <span className="nav-btn-indicator" aria-hidden="true" />}
                <Icon size={15} className="nav-btn-icon" aria-hidden="true" />
                <span className="nav-btn-text">{meta.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
          <button className="header-command-btn" onClick={onOpenCmd} aria-label="Command palette (Ctrl+K)">
            <Command size={14} /><span className="cmd-shortcut">⌘K</span>
          </button>
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d={mobileOpen ? 'M3 3l10 10M13 3L3 13' : 'M2 4h12M2 8h12M2 12h12'}
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <nav className="mobile-nav-drawer" aria-label="Mobile navigation">
            <div className="mobile-nav-header">
              <span className="mobile-nav-brand"><span className="logo-bracket">[</span>VS<span className="logo-bracket">]</span></span>
              <button className="mobile-nav-close-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="mobile-nav-links">
              {NAV_PAGES.map(id => {
                const meta = PAGE_META[id];
                const Icon = meta.icon;
                return (
                  <button key={id} onClick={() => go(id)}
                    className={`mobile-nav-item ${activePage === id ? 'mobile-nav-item--active' : ''}`}>
                    <span className="mobile-nav-num">{meta.short}</span>
                    <Icon size={15} className="mobile-nav-icon" aria-hidden="true" />
                    <span className="mobile-nav-label">{meta.label}</span>
                    {activePage === id && <span className="mobile-nav-active-dot" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <div className="mobile-nav-footer">
              <a href="https://github.com/vinitsonawane45" target="_blank" rel="noopener noreferrer" className="mobile-nav-social">
                <Github size={14} /> GitHub
              </a>
              <a href="mailto:vinitsonawane76@gmail.com" className="mobile-nav-social">
                <Mail size={14} /> Email
              </a>
            </div>
          </nav>
        </>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
// ─── Page transition wrapper ──────────────────────────────────────────────────
function PageView({ children, pageKey }: { children: React.ReactNode; pageKey: string }) {
  useScrollReveal([pageKey]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pageKey]);
  return <div className="page-view" key={pageKey}>{children}</div>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [isCmd, setIsCmd] = useState(false);
  const [theme, setTheme] = useTheme();
  const [activePage, setActivePage] = useState<PageId>('home');
  const typed = useTyping(['AI Engineer', 'ML Engineer', 'LLM Builder', 'Cloud Developer', 'Data Scientist'], 88, 2200);

  useScrollReveal([activePage]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsCmd(v => !v); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const navigate = (p: PageId) => { setActivePage(p); };

  const renderPage = () => {
    if (activePage === 'home') return null; // hero is always rendered below

    return (
      <PageView pageKey={activePage}>
        <div className="inner-page">
          {/* Page breadcrumb */}
          <div className="page-breadcrumb container">
            <button className="page-back-btn" onClick={() => navigate('home')} aria-label="Back to home">
              <ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} aria-hidden="true" />
              Home
            </button>
            <span className="page-bc-sep" aria-hidden="true">/</span>
            <span className="page-bc-current">{PAGE_META[activePage].label}</span>
          </div>

          {activePage === 'about' && (
            <section className="section">
              <div className="container about-grid">
                <div className="about-left reveal">
                  <p className="section-label">// about_me</p>
                  <h2 className="section-heading">
                    Building the<br />
                    <em>intelligent layer</em><br />
                    of tomorrow.
                  </h2>
                  <div className="about-deco" aria-hidden="true">
                    <div className="deco-line" /><Cpu size={36} className="deco-icon" />
                  </div>
                </div>
                <div className="about-right">
                  <p className="about-text reveal" style={{ transitionDelay: '80ms' }}>
                    Results-oriented AI Engineer proficient in building scalable backend systems and
                    Generative AI applications. Expertise in Python, Flask, and AWS with a proven track
                    record of optimising latency by 30% and achieving 85% accuracy in NLP models using
                    RAG architectures and LLMs.
                  </p>
                  <p className="about-text reveal" style={{ transitionDelay: '160ms' }}>
                    Currently pursuing B.Tech in Computer Science & Engineering at Dr. Babasaheb
                    Ambedkar Technological University (expected May 2026). Skilled across the full SDLC —
                    from designing secure APIs to deploying via CI/CD pipelines.
                  </p>
                  <div className="edu-card reveal" style={{ transitionDelay: '240ms' }}>
                    <div className="edu-icon" aria-hidden="true"><GraduationCap size={18} /></div>
                    <div className="edu-body">
                      <span className="edu-degree">B.Tech — Computer Science &amp; Engineering</span>
                      <span className="edu-univ">Dr. Babasaheb Ambedkar Technological University, Maharashtra</span>
                      <span className="edu-detail">Expected May 2026 · AI · Cloud Computing · DBMS · OOP</span>
                    </div>
                  </div>
                  <div className="about-stack reveal" style={{ transitionDelay: '320ms' }}>
                    <p className="about-stack-label">// tech_stack</p>
                    <div className="about-tags">
                      {['Python', 'LangChain', 'AWS', 'Flask', 'LLMs', 'RAG', 'Docker', 'MongoDB', 'FastAPI', 'Hugging Face'].map(tag => (
                        <span key={tag} className="about-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePage === 'skills' && (
            <section className="section">
              <div className="container">
                <div className="section-header reveal">
                  <p className="section-label">// capabilities</p>
                  <h2 className="section-heading">Technical Skills</h2>
                </div>
                <div className="skills-grid">
                  {skills.map((cat, i) => (
                    <SpotlightCard key={cat.title} className="skill-card reveal"
                      style={{ '--card-accent': cat.color, transitionDelay: `${i * 50}ms` } as React.CSSProperties}>
                      <div className="skill-card-top">
                        <span className="skill-icon-wrap" style={{ color: cat.color, background: `${cat.color}1a` }} aria-hidden="true">{cat.icon}</span>
                        <span className="skill-card-title">{cat.title}</span>
                        <div className="skill-card-glow" aria-hidden="true" style={{ background: `radial-gradient(circle at center, ${cat.color}22, transparent 65%)` }} />
                      </div>
                      <div className="skill-pills">
                        {cat.list.map(s => <span key={s} className="skill-pill">{s}</span>)}
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activePage === 'experience' && (
            <section className="section">
              <div className="container">
                <div className="section-header reveal">
                  <p className="section-label">// work_history</p>
                  <h2 className="section-heading">Experience</h2>
                </div>
                <div className="exp-list">
                  {experiences.map((exp, i) => (
                    <SpotlightCard key={exp.title} className="exp-card reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                      <div className="exp-left">
                        <div className="exp-timeline" aria-hidden="true">
                          <div className="exp-dot" style={{ background: exp.color, boxShadow: `0 0 10px ${exp.color}99` }} />
                          {i < experiences.length - 1 && <div className="exp-connector" />}
                        </div>
                        <div className="exp-meta">
                          <time className="exp-date">{exp.date}</time>
                          <span className="exp-remote-tag">{exp.tag}</span>
                        </div>
                      </div>
                      <div className="exp-right">
                        <div className="exp-heading-block">
                          <h3 className="exp-title">{exp.title}</h3>
                          <p className="exp-company">{exp.company}</p>
                        </div>
                        <ul className="exp-bullets">
                          {exp.description.map((d, j) => (
                            <li key={j}><span className="bullet-arrow" style={{ color: exp.color }} aria-hidden="true">▸</span>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activePage === 'projects' && (
            <section className="section">
              <div className="container">
                <div className="section-header reveal">
                  <p className="section-label">// portfolio</p>
                  <h2 className="section-heading">Projects</h2>
                </div>
                <div className="project-grid">
                  {projects.map((p, i) => (
                    <SpotlightCard key={p.title} className="project-card reveal"
                      style={{ '--proj-accent': p.accent, '--proj-glow': p.glow, transitionDelay: `${i * 70}ms` } as React.CSSProperties}>
                      <div className="project-card-inner">
                        <div className="project-top-row">
                          <span className="project-emoji" aria-hidden="true">{p.icon}</span>
                          <div className="project-top-right">
                            {p.isTeam && <span className="project-team-badge"><GitMerge size={10} aria-hidden="true" /> Contributor</span>}
                            <span className="project-num" aria-hidden="true">0{i + 1}</span>
                          </div>
                        </div>
                        <div className="project-tag-row"><span className="project-tag">{p.tag}</span></div>
                        <h3 className="project-title">{p.title}</h3>
                        <ul className="project-desc">
                          {p.description.map((d, j) => (
                            <li key={j}><span className="proj-bullet" style={{ color: p.accent }} aria-hidden="true">→</span>{d}</li>
                          ))}
                        </ul>
                        <div className="project-footer">
                          <div className="project-chips">
                            {p.metrics.map(m => (
                              <span key={m} className="project-chip" style={{ color: p.accent, background: `${p.accent}14`, borderColor: `${p.accent}2e` }}>{m}</span>
                            ))}
                          </div>
                          <a href={p.github} target="_blank" rel="noopener noreferrer"
                            className="project-github-btn" aria-label={`View ${p.title} on GitHub`}
                            style={{ color: p.accent, borderColor: `${p.accent}40` }}>
                            <Github size={13} aria-hidden="true" /> Code
                          </a>
                        </div>
                      </div>
                      <div className="project-glow-bg" aria-hidden="true" />
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activePage === 'lab' && <LabSection onNavigate={navigate} />}

          {activePage === 'certifications' && (
            <section className="section">
              <div className="container">
                <div className="cert-header reveal">
                  <p className="section-label">// credentials</p>
                  <h2 className="section-heading">The Certification Journey</h2>
                  <p className="cert-journey-sub">
                    Five credentials, one continuous thread — each one building on the last,
                    from first prompt to production-ready GenAI systems.
                  </p>
                </div>

                <div className="cert-journey">
                  <div className="cert-journey-rail" aria-hidden="true" />
                  {certifications.map((cert, i) => (
                    <div key={cert.title} className="cert-journey-item reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                      <div className="cert-journey-node-col">
                        <span className="cert-journey-node" style={{ background: cert.color, boxShadow: `0 0 0 4px ${cert.color}22, 0 0 16px ${cert.color}55` }}>
                          {i + 1}
                        </span>
                      </div>
                      <SpotlightCard className="cert-journey-card" style={{ '--cert-color': cert.color } as React.CSSProperties}>
                        <div className="cert-journey-top">
                          <div className="cert-journey-icon" style={{ color: cert.color, background: `${cert.color}1a`, borderColor: `${cert.color}35` }} aria-hidden="true">
                            {cert.icon}
                          </div>
                          <div className="cert-journey-meta">
                            <span className="cert-journey-date">{cert.month} {cert.year}</span>
                            <div className="cert-journey-verified"><Check size={10} aria-hidden="true" /> Verified</div>
                          </div>
                        </div>
                        <h3 className="cert-journey-title">{cert.title}</h3>
                        <p className="cert-journey-issuer">{cert.issuer}</p>
                        <p className="cert-journey-desc">{cert.desc}</p>
                      </SpotlightCard>
                    </div>
                  ))}

                  {/* Journey end marker */}
                  <div className="cert-journey-item cert-journey-item--end reveal">
                    <div className="cert-journey-node-col">
                      <span className="cert-journey-node cert-journey-node--end">
                        <Sparkles size={13} aria-hidden="true" />
                      </span>
                    </div>
                    <div className="cert-journey-end-text">
                      <span>Still learning — next stop, MLOps & multi-modal AI.</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePage === 'achievements' && (
            <section className="section">
              <div className="container">
                <div className="section-header reveal">
                  <p className="section-label">// recognition</p>
                  <h2 className="section-heading">Achievements</h2>
                </div>
                <div className="ach-grid">
                  {achievements.map((a, i) => (
                    <SpotlightCard key={a.title} className="ach-card reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                      <div className="ach-top">
                        <span className="ach-emoji" aria-hidden="true">{a.icon}</span>
                        <span className="ach-year">{a.year}</span>
                      </div>
                      <div className="ach-role" style={{ color: a.color }}>{a.role}</div>
                      <h3 className="ach-title">{a.title}</h3>
                      <p className="ach-desc">{a.desc}</p>
                      <div className="ach-bar" aria-hidden="true" style={{ background: `linear-gradient(90deg, ${a.color}33, transparent)` }} />
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activePage === 'contact' && (
            <section className="section">
              <div className="container">
                <div className="section-header reveal">
                  <p className="section-label">// let&apos;s_connect</p>
                  <h2 className="section-heading">Get in Touch</h2>
                </div>
                <div className="contact-layout">
                  <div className="contact-info reveal">
                    <p className="contact-sub">
                      Actively seeking internship roles in AI Engineering, ML, and Cloud. Open to
                      collaborations, freelance work, or just a friendly chat about AI &amp; LLMs.
                    </p>
                    <div className="contact-availability">
                      <span className="avail-dot" aria-hidden="true" />
                      Available for internships starting immediately
                    </div>
                    <div className="contact-links">
                      {([
                        { href: 'mailto:vinitsonawane76@gmail.com', icon: <Mail size={17}/>, label: 'Email', value: 'vinitsonawane76@gmail.com', copy: 'vinitsonawane76@gmail.com' },
                        { href: 'https://www.linkedin.com/in/vinit-sonawane-14b00632a/', newTab: true, icon: <Linkedin size={17}/>, label: 'LinkedIn', value: 'linkedin.com/in/vinit-sonawane' },
                        { href: 'https://github.com/vinitsonawane45', newTab: true, icon: <Github size={17}/>, label: 'GitHub', value: 'github.com/vinitsonawane45' },
                        { href: 'tel:+919975294916', icon: <Phone size={17}/>, label: 'Phone', value: '+91 9975294916', copy: '+919975294916' },
                      ] as { href: string; icon: React.ReactNode; label: string; value: string; copy?: string; newTab?: boolean }[]).map(link => (
                        <div key={link.label} className="contact-row">
                          <a href={link.href} target={link.newTab ? '_blank' : undefined}
                            rel={link.newTab ? 'noopener noreferrer' : undefined}
                            className="contact-link-card" aria-label={`${link.label}: ${link.value}`}>
                            <span className="contact-link-icon" aria-hidden="true">{link.icon}</span>
                            <span className="contact-link-info">
                              <span className="contact-link-label">{link.label}</span>
                              <span className="contact-link-val">{link.value}</span>
                            </span>
                            <ExternalLink size={13} className="contact-ext" aria-hidden="true" />
                          </a>
                          {link.copy && <CopyButton text={link.copy} />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="contact-form-wrap reveal" style={{ transitionDelay: '120ms' }}>
                    <div className="cf-header">
                      <MessageSquare size={17} className="cf-header-icon" aria-hidden="true" />
                      <span className="cf-header-title">Send a Message</span>
                    </div>
                    <ContactForm />
                  </div>
                </div>
              </div>
            </section>
          )}

          <footer className="footer">
            <div className="container footer-inner">
              <span className="footer-brand"><span className="logo-bracket">[</span>VS<span className="logo-bracket">]</span></span>
              <p className="footer-copy">&copy; {new Date().getFullYear()} Vinit Sonawane &middot; AI Engineer &middot; Built with Next.js</p>
              <span className="footer-status"><span className="status-dot" aria-hidden="true" />Available</span>
            </div>
          </footer>
        </div>
      </PageView>
    );
  };

  return (
    <>
      <CustomCursor />
      <Global3DScene theme={theme} />
      <div className="page-glow" aria-hidden="true" />
      <Header theme={theme} setTheme={setTheme} onOpenCmd={() => setIsCmd(true)}
        activePage={activePage} onNavigate={navigate} />
      <CommandMenu isOpen={isCmd} onClose={() => setIsCmd(false)} />

      <main id="main-content">
        {/* Hero — always shown, hides when on inner page */}
        <section id="home" className={`hero-section ${activePage !== 'home' ? 'hero-section--hidden' : ''}`}>
          <div className="hero-bg-grid" aria-hidden="true" />
          <div className="hero-orb orb-1" aria-hidden="true" />
          <div className="hero-orb orb-2" aria-hidden="true" />

          <div className="container hero-content">
            <div className="hero-text-col">
              <div className="hero-badge reveal">
                <span className="hero-badge-dot" aria-hidden="true" />
                Open to opportunities · Aurangabad, Maharashtra
                <Sparkles size={11} aria-hidden="true" />
              </div>

              <h1 className="hero-title reveal">
                <span className="hero-name-solid">Vinit</span>
                <span className="hero-name-outline">Sonawane</span>
              </h1>

              <div className="hero-terminal reveal" aria-label={`Role: ${typed}`}>
                <span className="t-prompt">~$</span>
                <span className="t-cmd"> role</span>
                <span className="t-eq"> = </span>
                <span className="t-str">&ldquo;{typed}&rdquo;</span>
                <span className="t-cursor" aria-hidden="true">▌</span>
              </div>

              <p className="hero-desc reveal">
                B.Tech CS candidate at Dr. BATU — crafting LLM pipelines, RAG systems,
                and scalable cloud infrastructure. Turning raw data into real decisions.
              </p>

              <div className="hero-stats reveal">
                {([
                  [85, '%+', 'Model Accuracy'],
                  [2,  '',   'Internships'],
                  [7,  '+',  'Certifications'],
                  [4,  '',   'Projects Built'],
                  [30, '%',  'Latency Cut'],
                ] as [number, string, string][]).map(([val, suf, label]) => (
                  <div key={label} className="hero-stat">
                    <span className="hero-stat-val"><Counter target={val} suffix={suf} /></span>
                    <span className="hero-stat-label">{label}</span>
                  </div>
                ))}
              </div>

              <div className="hero-ctas reveal">
                <MagneticWrapper>
                  <button className="btn-primary" onClick={() => navigate('contact')}><Zap size={14} aria-hidden="true" /> Get in Touch</button>
                </MagneticWrapper>
                <MagneticWrapper>
                  <button className="btn-outline" onClick={() => navigate('projects')}>View Projects <ArrowRight size={14} aria-hidden="true" /></button>
                </MagneticWrapper>
                <MagneticWrapper>
                  <a href="https://github.com/vinitsonawane45" target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    <Github size={14} aria-hidden="true" /> GitHub
                  </a>
                </MagneticWrapper>
              </div>

              <div className="hero-socials reveal">
                {([
                  ['https://www.linkedin.com/in/vinit-sonawane-14b00632a/', <Linkedin size={16}/>, 'LinkedIn', true],
                  ['https://github.com/vinitsonawane45', <Github size={16}/>, 'GitHub', true],
                  ['mailto:vinitsonawane76@gmail.com', <Mail size={16}/>, 'Email', false],
                  ['tel:+919975294916', <Phone size={16}/>, 'Phone', false],
                ] as [string, React.ReactNode, string, boolean][]).map(([href, icon, label, newTab]) => (
                  <MagneticWrapper key={label} strength={0.32}>
                    <a href={href} target={newTab ? '_blank' : undefined}
                      rel={newTab ? 'noopener noreferrer' : undefined}
                      className="social-btn" aria-label={label}>{icon}</a>
                  </MagneticWrapper>
                ))}
              </div>

              {/* Quick nav grid on home */}
              <div className="hero-nav-grid reveal">
                {NAV_PAGES.map(id => {
                  const meta = PAGE_META[id];
                  const Icon = meta.icon;
                  return (
                    <button key={id} className="hero-nav-tile" onClick={() => navigate(id)}>
                      <Icon size={14} className="hero-nav-tile-icon" aria-hidden="true" />
                      <span>{meta.label}</span>
                      <ArrowRight size={11} className="hero-nav-tile-arrow" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo */}
            <div className="hero-photo-col reveal">
              <div className="hero-photo-wrap">
                <div className="hero-photo-glow" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Vinit_photo.jpeg" alt="Vinit Sonawane" className="hero-photo-img" width={340} height={410} />
                <span className="hero-photo-corner hero-photo-corner--tl" aria-hidden="true" />
                <span className="hero-photo-corner hero-photo-corner--tr" aria-hidden="true" />
                <span className="hero-photo-corner hero-photo-corner--bl" aria-hidden="true" />
                <span className="hero-photo-corner hero-photo-corner--br" aria-hidden="true" />
                <div className="hero-chip hero-chip--tl">
                  <span className="hero-chip-dot" style={{ background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }} />
                  LLM Engineer
                </div>
                <div className="hero-chip hero-chip--br">
                  <span className="hero-chip-dot" style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                  RAG · LangChain
                </div>
                <div className="hero-chip hero-chip--bl">
                  <span className="hero-chip-dot" style={{ background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
                  AWS · Docker
                </div>
                <div className="hero-photo-badge">
                  <span className="hero-photo-badge-dot" aria-hidden="true" />
                  Available for work
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inner pages */}
        {activePage !== 'home' && renderPage()}
      </main>
    </>
  );
}