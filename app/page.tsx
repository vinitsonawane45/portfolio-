'use client';

import {
  useState, useEffect, useRef, Suspense, useMemo, ChangeEvent, MouseEvent, FormEvent,
} from 'react';
import {
  Linkedin, Mail, Phone, Award, BadgeCheck, Building, Lightbulb,
  Code, Database, BrainCircuit, Cloud, BarChart3, GitMerge, Briefcase,
  Search, ArrowRight, Sun, Moon, Terminal, User, ChevronDown,
  Command, Zap, Cpu, Sparkles, ExternalLink, Copy, Check, Package, Send,
  Github, GraduationCap, Trophy, MessageSquare, Loader2, Menu, X,
} from 'lucide-react';

import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';

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
  const isTouch = useRef(false);
  useEffect(() => {
    isTouch.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isTouch.current) return;
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
function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.07, rootMargin: '0px 0px -40px 0px' },
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
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
function ContactForm() {
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    await new Promise(r => setTimeout(r, 1400));
    setStatus('sent');
    setTimeout(() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }); }, 4000);
  };

  const isDisabled = status === 'sending' || status === 'sent';

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
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
  title: '🌍 Multi-Lingual Blog Generator',
  tag: 'AWS · Cloud Computing · DevOps · Deployment',
  accent: '#6c8eff',
  glow: 'rgba(108,142,255,0.14)',
  role: 'Contributor',
  icon: '☁️',
  description: [
    'Hands-on AWS project demonstrating cloud deployment, resource management, and scalable infrastructure design.',
    'Worked with core AWS services like EC2, S3, and IAM for secure and efficient cloud architecture.',
    'Focused on deployment pipelines and real-world cloud use cases aligned with DevOps practices.',
    <a href="https://github.com/SAURABHSALVE/AWS-DEVPOST" target="_blank" rel="noopener noreferrer">
      View Project
    </a>
  ],
  metrics: ['AWS Deployment', 'Cloud Architecture', 'IAM Security'],
},
{
  title: 'Artisan Craft Platform',
  tag: 'Generative AI · Hackathon · NLP',
  accent: '#ec4899',
  glow: 'rgba(236,72,153,0.14)',
  role: 'Contributor',
  icon: '🚀',
  description: [
    'Hackathon-based GenAI project solving real-world problems using LLMs.',
    'Implemented NLP and prompt engineering techniques.',
    'Built with focus on rapid prototyping and innovation.',
    <a href="https://github.com/SAURABHSALVE/genai-hackathon-artisans" target="_blank" rel="noopener noreferrer">
      View Project
    </a>
  ],
  metrics: ['Hackathon Build', 'NLP', 'Rapid Prototyping'],
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
  },
  {
  title: 'AI Image Generator',
  tag: 'Generative AI · OpenAI API · Python',
  accent: '#f59e0b',
  glow: 'rgba(245,158,11,0.14)',
  icon: '🎨',
  role: 'Contributor',
  description: [
    'AI-based image generation system using generative models to create visuals from text prompts.',
    'Integrated prompt-based generation with API handling.',
    'Explores practical applications of generative AI.',
    <a href="https://github.com/SAURABHSALVE/image-generation" target="_blank" rel="noopener noreferrer">
      View Project
    </a>
  ],
  metrics: ['Generative AI', 'Prompt-Based Output', 'API Usage'],
},
  {
    title: 'Mental Health Assistant',
    tag: 'ChatGPT API · Python · Intent Detection · Conversational AI',
    accent: '#fb7185',
    glow: 'rgba(251,113,133,0.14)',
    role: 'Contributor',
    icon: '💬',
    description: [
      'AI-powered mental health assistant built using ChatGPT API for empathetic, context-aware conversations.',
      'Integrated real-time intent detection to classify user emotions and dynamically route responses (support, escalation, or guidance).',
      'Implemented safety guardrails, prompt engineering, and content filtering to handle sensitive mental-health scenarios responsibly.',
      'Inspired by real-world AI healthcare platforms like :contentReference[oaicite:0]{index=0}, focusing on scalable and ethical AI solutions in health domains.',
      'Live prototype available: ',
      <a href="https://chatgpt.com/g/g-aDXDetJ0x-techcare" target="_blank" rel="noopener noreferrer">
        View Project
      </a>
    ],
    metrics: [
      'Intent Detection System',
      'Prompt Engineering',
      'Safe AI Guardrails',
      'Conversational Flow Design'
    ],
  },
  {
  title: 'Crypto Currency Tracker',
  tag: 'React · API Integration · Real-Time Data',
  accent: '#22c55e',
  glow: 'rgba(34,197,94,0.14)',
  icon: '📈',
  role: 'Contributor',
  description: [
    'Real-time cryptocurrency tracking dashboard using external APIs for live market data.',
    'Displays price trends, market stats, and dynamic updates with responsive UI.',
    'Focused on API handling and frontend visualization.',
    <a href="https://github.com/vinitsonawane45/crypto-currency-tracker" target="_blank" rel="noopener noreferrer">
      View Project
    </a>
  ],
  metrics: ['Live Data', 'API Integration', 'Frontend UI'],
},
{
  title: '🤖 Multi-Agent RAG System',
  tag: 'AI Agents · LLM · RAG · LangChain · Vector DB',
  accent: '#8b5cf6',
  glow: 'rgba(139,92,246,0.14)',
  icon: '🧠',
  description: [
    'Designed and implemented a multi-agent Retrieval-Augmented Generation (RAG) system capable of collaborative reasoning and dynamic task execution.',
    'Built modular AI agents that interact with each other to handle document retrieval, query processing, and response generation using LLMs.',
    'Integrated vector databases and embedding pipelines for efficient semantic search and context-aware answers.',
    'Focused on scalable architecture, agent orchestration, and real-world AI system design beyond basic RAG pipelines.',
    <a href="https://github.com/vinitsonawane45/Multi_Agent_Rag" target="_blank" rel="noopener noreferrer">
      View Project
    </a>
  ],
  metrics: ['Multi-Agent System', 'RAG Pipeline', 'LLM Orchestration'],
}
];

const certifications = [
  { title: 'Building LLM Apps with Prompt Engineering', issuer: 'NVIDIA Deep Learning Institute', icon: <Award size={15}/>,     color: '#76b900', year: '2025' },
  { title: 'Gen AI Academy Certification',              issuer: 'Google Cloud',                   icon: <Award size={15}/>,     color: '#4285f4', year: '2025' },
  { title: 'GenAI Mastery Workshop',                   issuer: 'OpenAI × NxtWave',               icon: <Sparkles size={15}/>,  color: '#10a37f', year: '2025' },
  { title: 'Prompt Engineering for Everyone',          issuer: 'IBM Skills Network',             icon: <Award size={15}/>,     color: '#6c8eff', year: '2024' },
  { title: 'ServiceNow Fundamentals',                  issuer: 'ServiceNow',                     icon: <BadgeCheck size={15}/>, color: '#fb7185', year: '2025' },
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

// ─── Mobile Nav Drawer ────────────────────────────────────────────────────────
function MobileNavDrawer({ isOpen, onClose, activeId }: { isOpen: boolean; onClose: () => void; activeId: string }) {
  const navItems = ['about','skills','experience','projects','certifications','achievements','contact'];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onClose();
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-nav-overlay" onClick={onClose} aria-hidden="true" />
      <nav className="mobile-nav-drawer" role="navigation" aria-label="Mobile navigation">
        <div className="mobile-nav-handle" aria-hidden="true" />
        <div className="mobile-nav-links">
          {navItems.map(id => (
            <button key={id} className={`mobile-nav-link ${activeId === id ? 'mobile-nav-link--active' : ''}`}
              onClick={() => scrollTo(id)} aria-current={activeId === id ? 'page' : undefined}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem', color: 'var(--accent)', opacity: 0.5 }}>
                ~/
              </span>
              {id}
            </button>
          ))}
          <div className="mobile-nav-divider" />
          <a href="https://github.com/vinitsonawane45" target="_blank" rel="noopener noreferrer"
            className="mobile-nav-link" onClick={onClose}>
            <Github size={15} aria-hidden="true" /> GitHub
          </a>
          <a href="mailto:vinitsonawane76@gmail.com" className="mobile-nav-link" onClick={onClose}>
            <Mail size={15} aria-hidden="true" /> Email
          </a>
        </div>
      </nav>
    </>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ theme, setTheme, onOpenCmd }: { theme: Theme; setTheme: (t: Theme) => void; onOpenCmd: () => void }) {
  const [visible,    setVisible]    = useState(false);
  const [scrollPct,  setScrollPct]  = useState(0);
  const [activeId,   setActiveId]   = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const ids = ['home','about','skills','experience','projects','certifications','achievements','contact'];
    const onScroll = () => {
      const winH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(winH > 0 ? (window.scrollY / winH) * 100 : 0);
      setVisible(window.scrollY > window.innerHeight * 0.85);
      for (const id of [...ids].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 130) { setActiveId(id); break; }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      <header className={`site-header ${visible ? 'visible' : ''}`}>
        <div className="header-progress" style={{ width: `${scrollPct}%` }} aria-hidden="true" />
        <button className="header-logo" onClick={() => scrollTo('home')} aria-label="Back to top">
          <span className="logo-bracket">[</span>VS<span className="logo-bracket">]</span>
        </button>
        <nav className="header-nav" aria-label="Main navigation">
          {['about','skills','experience','projects','contact'].map(id => (
            <button key={id} onClick={() => scrollTo(id)}
              className={`nav-btn ${activeId === id ? 'nav-btn--active' : ''}`}
              aria-current={activeId === id ? 'page' : undefined}>
              <span className="nav-btn-text">{id}</span>
              <span className="nav-btn-indicator" aria-hidden="true" />
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
          <MagneticWrapper strength={0.22}>
            <button className="header-command-btn" onClick={onOpenCmd} aria-label="Command palette (Ctrl+K)">
              <Command size={14} /><span className="cmd-shortcut" aria-hidden="true">⌘K</span>
            </button>
          </MagneticWrapper>
          {/* Mobile menu toggle */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>
      <MobileNavDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} activeId={activeId} />
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [isCmd, setIsCmd] = useState(false);
  const [theme, setTheme] = useTheme();
  const typed = useTyping(['AI Engineer', 'ML Engineer', 'LLM Builder', 'Cloud Developer', 'Data Scientist'], 88, 2200);

  useScrollReveal();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsCmd(v => !v); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <>
      <CustomCursor />
      <Global3DScene theme={theme} />
      <div className="page-glow" aria-hidden="true" />
      <Header theme={theme} setTheme={setTheme} onOpenCmd={() => setIsCmd(true)} />
      <CommandMenu isOpen={isCmd} onClose={() => setIsCmd(false)} />

      <main id="main-content">

        {/* ══ HERO ══ */}
        <section id="home" className="hero-section">
          <div className="hero-bg-grid" aria-hidden="true" />
          <div className="hero-orb orb-1" aria-hidden="true" />
          <div className="hero-orb orb-2" aria-hidden="true" />

          <div className="container hero-content">
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
                [5,  '',   'Certifications'],
                [30, '%',  'Latency Cut'],
                [4,  '',   'Projects'],
              ] as [number, string, string][]).map(([val, suf, label]) => (
                <div key={label} className="hero-stat">
                  <span className="hero-stat-val"><Counter target={val} suffix={suf} /></span>
                  <span className="hero-stat-label">{label}</span>
                </div>
              ))}
            </div>

            <div className="hero-ctas reveal">
              <MagneticWrapper>
                <a href="#contact" className="btn-primary"><Zap size={14} aria-hidden="true" /> Get in Touch</a>
              </MagneticWrapper>
              <MagneticWrapper>
                <a href="#projects" className="btn-outline">View Projects <ArrowRight size={14} aria-hidden="true" /></a>
              </MagneticWrapper>
              <MagneticWrapper>
                <a href="https://github.com/vinitsonawane45" target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <Github size={14} aria-hidden="true" /> GitHub
                </a>
              </MagneticWrapper>
            </div>

            <div className="hero-socials reveal">
              {([
                ['https://www.linkedin.com/in/vinit-sonawane-14b00632a/',   <Linkedin size={16}/>, 'LinkedIn', true],
                ['https://github.com/vinitsonawane45',        <Github   size={16}/>, 'GitHub',   true],
                ['mailto:vinitsonawane76@gmail.com',          <Mail     size={16}/>, 'Email',    false],
                ['tel:+919975294916',                         <Phone    size={16}/>, 'Phone',    false],
              ] as [string, React.ReactNode, string, boolean][]).map(([href, icon, label, newTab]) => (
                <MagneticWrapper key={label} strength={0.32}>
                  <a href={href} target={newTab ? '_blank' : undefined}
                    rel={newTab ? 'noopener noreferrer' : undefined}
                    className="social-btn" aria-label={label}>{icon}</a>
                </MagneticWrapper>
              ))}
            </div>
          </div>

          <div className="scroll-hint" aria-hidden="true">
            <div className="scroll-hint-line" />
            <ChevronDown size={17} />
          </div>
        </section>

        {/* ══ ABOUT ══ */}
        <section id="about" className="section">
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
                  <span className="edu-detail">Expected May 2026  · AI · Cloud Computing · DBMS · OOP</span>
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

        {/* ══ SKILLS ══ */}
        <section id="skills" className="section">
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
                    <span className="skill-icon-wrap" style={{ color: cat.color, background: `${cat.color}1a` }} aria-hidden="true">
                      {cat.icon}
                    </span>
                    <span className="skill-card-title">{cat.title}</span>
                    <div className="skill-card-glow" aria-hidden="true"
                      style={{ background: `radial-gradient(circle at center, ${cat.color}22, transparent 65%)` }} />
                  </div>
                  <div className="skill-pills">
                    {cat.list.map(s => <span key={s} className="skill-pill">{s}</span>)}
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* ══ EXPERIENCE ══ */}
        <section id="experience" className="section">
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
                        <li key={j}>
                          <span className="bullet-arrow" style={{ color: exp.color }} aria-hidden="true">▸</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PROJECTS ══ */}
        <section id="projects" className="section">
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
                      <span className="project-num" aria-hidden="true">0{i + 1}</span>
                    </div>
                    <div className="project-tag-row">
                      <span className="project-tag">{p.tag}</span>
                    </div>
                    <h3 className="project-title">{p.title}</h3>
                    <ul className="project-desc">
                      {p.description.map((d, j) => (
                        <li key={j}><span className="proj-bullet" style={{ color: p.accent }} aria-hidden="true">→</span>{d}</li>
                      ))}
                    </ul>
                    <div className="project-footer">
                      {p.metrics.map(m => (
                        <span key={m} className="project-chip"
                          style={{ color: p.accent, background: `${p.accent}14`, borderColor: `${p.accent}2e` }}>{m}</span>
                      ))}
                    </div>
                  </div>
                  <div className="project-glow-bg" aria-hidden="true" />
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CERTIFICATIONS ══ */}
        <section id="certifications" className="section">
          <div className="container">
            <div className="section-header reveal">
              <p className="section-label">// credentials</p>
              <h2 className="section-heading">Certifications</h2>
            </div>
            <div className="cert-grid">
              {certifications.map((cert, i) => (
                <SpotlightCard key={cert.title} className="cert-card reveal"
                  style={{ '--cert-color': cert.color, transitionDelay: `${i * 60}ms` } as React.CSSProperties}>
                  <div className="cert-icon-box"
                    style={{ color: cert.color, background: `${cert.color}1a`, borderColor: `${cert.color}2e` }}
                    aria-hidden="true">{cert.icon}</div>
                  <div className="cert-body">
                    <span className="cert-name">{cert.title}</span>
                    <span className="cert-from">{cert.issuer}</span>
                  </div>
                  <div className="cert-right-col">
                    <span className="cert-year">{cert.year}</span>
                    <div className="cert-badge"><Check size={10} aria-hidden="true" /><span>Verified</span></div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ACHIEVEMENTS ══ */}
        <section id="achievements" className="section">
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
                  <div className="ach-bar" aria-hidden="true"
                    style={{ background: `linear-gradient(90deg, ${a.color}33, transparent)` }} />
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CONTACT ══ */}
        <section id="contact" className="section">
          <div className="container">
            <div className="section-header reveal">
              <p className="section-label">// let&apos;s_connect</p>
              <h2 className="section-heading">Get in Touch</h2>
            </div>
            <div className="contact-layout">

              {/* Info column */}
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
                    { href: 'mailto:vinitsonawane76@gmail.com',                          icon: <Mail     size={17}/>, label: 'Email',    value: 'vinitsonawane76@gmail.com',       copy: 'vinitsonawane76@gmail.com' },
                    { href: 'https://www.linkedin.com/in/vinit-sonawane-14b00632a/', newTab: true, icon: <Linkedin size={17}/>, label: 'LinkedIn', value: 'linkedin.com/in/vinit-sonawane' },
                    { href: 'https://github.com/vinitsonawane45', newTab: true,            icon: <Github   size={17}/>, label: 'GitHub',   value: 'github.com/vinitsonawane45' },
                    { href: 'tel:+919975294916',                                          icon: <Phone    size={17}/>, label: 'Phone',    value: '+91 9975294916',                  copy: '+919975294916' },
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

              {/* Form column */}
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

      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span className="footer-brand">
            <span className="logo-bracket">[</span>VS<span className="logo-bracket">]</span>
          </span>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Vinit Sonawane &middot; AI Engineer &middot; Built with Next.js
          </p>
          <span className="footer-status">
            <span className="status-dot" aria-hidden="true" />Available
          </span>
        </div>
      </footer>
    </>
  );
}