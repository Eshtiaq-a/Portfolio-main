import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Code2,
  Database,
  ExternalLink,
  Github,
  GraduationCap,
  Menu,
  Server,
  Terminal,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const GITHUB_URL = "https://github.com/Eshtiaq-a";
const LINKEDIN_URL = "https://www.linkedin.com/in/eshtiaq-ahmad33/";
const CURATION_ENDPOINT = import.meta.env.VITE_CURATION_ENDPOINT as string | undefined;

type Project = {
  title: string;
  tag: string;
  description: string;
  liveUrl: string;
  sourceUrl: string;
  visual: "stash" | "wreck";
  details: string[];
};

const projects: Project[] = [
  {
    title: "WrechShip — Maritime Disaster Dataset & Explorer",
    tag: "PYTHON · GEOSPATIAL DATA · WEB",
    description:
      "An open-source historical dataset and exploration tool for documented maritime disasters, designed for researchers, developers, and data visualisation work.",
    liveUrl: "https://www.wreckship.me/",
    sourceUrl: "https://github.com/Eshtiaq-a/Wrechship",
    visual: "wreck",
    details: [
      "5,649 documented shipwreck records with vessel, loss, casualty, and coordinate data",
      "Structured CSV, JSON, Python, Pandas, mapping, and geospatial analysis workflows",
      "Supporting scripts for importing, cleaning, validating, and updating data",
      "A public data-explorer website for browsing the collection",
    ],
  },
  {
    title: "Stash — Student Money Manager",
    tag: "NEXT.JS · TYPESCRIPT · SUPABASE",
    description:
      "A student-focused money-management application for tracking daily expenses, setting monthly budgets, and making saving more engaging through a points system.",
    liveUrl: "https://stash-saver.vercel.app/",
    sourceUrl: "https://github.com/Eshtiaq-a/stash-money-manager",
    visual: "stash",
    details: [
      "One-tap expense logging for food, transport, shopping, and other categories",
      "Personal daily limits, monthly budgets, and gamified Stash Points",
      "Multi-currency support for BDT, USD, INR, and SAR",
      "Google and GitHub authentication through Supabase",
      "Built with Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Supabase, and PostgreSQL",
    ],
  },
];

const skillGroups = [
  { icon: Code2, label: "LANGUAGES", state: "PRACTISING", items: "Python · TypeScript · C · HTML · CSS", detail: "Building fundamentals through useful, small software." },
  { icon: Database, label: "AI & DATA", state: "EXPLORING", items: "Machine Learning · Data Science · Data Analysis", detail: "Learning how data becomes a better product decision." },
  { icon: Server, label: "DEVELOPMENT", state: "BUILDING", items: "Git/GitHub · Web Development · Responsive UI", detail: "Making ideas clear, usable, and easy to iterate on." },
  { icon: Terminal, label: "CURRENTLY LEARNING", state: "EXPLORING", items: "Deep Learning · Model Deployment · Data Visualisation", detail: "Going deeper, one well-documented experiment at a time." },
];

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return <motion.div className={className} initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

function ProjectVisual({ type }: { type: Project["visual"] }) {
  if (type === "stash") {
    return <div className="visual visual-stash" aria-label="Stash savings progress preview">
      <div className="chart-label mono">STASH_POINTS / MONTHLY_GOAL</div><div className="chart-value">72<span>%</span></div>
      <div className="bar-track"><span style={{ width: "72%" }} /></div>
      <div className="chart-grid">{[24, 46, 34, 68, 51, 82, 72].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div>
      <span className="visual-corner mono">MONEY / MADE ENGAGING</span>
    </div>;
  }
  return <div className="visual visual-wreck" aria-label="WrechShip geospatial data preview">
    <div className="map-lines" /><div className="coordinate mono">41°43′N<br />12°29′E</div><div className="map-pin" /><div className="wreck-caption mono">5,649 RECORDS / OPEN DATA</div>
  </div>;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const detailId = `${project.visual}-details`;
  return <article className="project-card">
    <div className="project-info">
      <span className="project-index mono">0{index + 1} / 02</span>
      <h3>{project.title}</h3><span className="project-tag mono">{project.tag}</span>
      <p>{project.description}</p>
      <div className="project-actions">
        <a className="button button-primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">{project.visual === "stash" ? "Live demo" : "Explore dataset"} <ExternalLink size={14} /></a>
        <a className="button button-quiet" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">View source <Github size={14} /></a>
        <a className="text-link mono" href={`#${detailId}`}> {project.visual === "stash" ? "CASE STUDY" : "PROJECT DETAILS"} <ArrowDown size={14} /></a>
      </div>
    </div>
    <ProjectVisual type={project.visual} />
  </article>;
}

function AdminSubmit() {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!CURATION_ENDPOINT) {
      setStatus("The protected curation endpoint is not configured.");
      return;
    }
    setIsSubmitting(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${CURATION_ENDPOINT.replace(/\/$/, "")}/submissions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      if (!response.ok) throw new Error("Submission was rejected");
      event.currentTarget.reset();
      setStatus("Submitted for private server-side evaluation.");
    } catch {
      setStatus("Submission failed. Sign in as the portfolio admin and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <section className="admin-submit content-section">
    <div className="section-heading"><span className="section-number mono">// ADMIN</span><h2>Submit evidence<span>.</span></h2></div>
    <p className="admin-notice">Private admin submissions are evaluated server-side. LinkedIn is never scraped, and no secret is stored in this browser.</p>
    <form className="submission-form" onSubmit={submit}>
      <label>Source type<select name="sourceType" required defaultValue="project"><option value="project">New project</option><option value="linkedin_post">LinkedIn post</option><option value="credential">Credential</option><option value="achievement">Award or competition</option><option value="publication">Publication</option></select></label>
      <label>Source URL<input name="sourceUrl" type="url" required placeholder="https://..." /></label>
      <label>Supporting description<textarea name="description" required rows={5} placeholder="Describe what this source verifies and include evidence." /></label>
      <button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Submit for evaluation"} <ArrowUpRight size={14} /></button>
      {status && <p className="admin-status mono" role="status">{status}</p>}
    </form>
  </section>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const closeMenu = () => setMenuOpen(false);
  if (window.location.pathname === "/admin/submit") {
    return <div className="site-shell"><AdminSubmit /></div>;
  }
  return <div className="site-shell">
    <header className="nav-wrap"><nav className="nav-bar" aria-label="Primary navigation">
      <a className="brand" href="#top" onClick={closeMenu}>Eshtiaq Ahmad <span>AI/ML ENGINEER IN PROGRESS</span></a>
      <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>{["projects", "skills", "about", "credentials", "contact"].map((item) => <a href={`#${item}`} key={item} onClick={closeMenu}>{item[0].toUpperCase() + item.slice(1)}</a>)}<a className="mobile-connect" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Connect on LinkedIn <ArrowUpRight size={15} /></a></div>
      <a className="nav-cta" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">Connect on LinkedIn <ArrowUpRight size={15} /></a>
      <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
    </nav></header>

    <main id="top">
      <section className="hero section-grid">
        <div className="hero-copy">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="eyebrow"><span className="status-dot" /> BUILDING TOWARD AI/ML <i>·</i> DHAKA, BANGLADESH</motion.div>
          <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>I turn curiosity<br />into intelligent<br /><span>software.</span><b className="cursor" aria-hidden="true">_</b></motion.h1>
          <motion.p initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.25 }}>Software Engineering student at Daffodil International University, exploring Python, data science, machine learning, and thoughtful products that solve real problems.</motion.p>
          <div className="hero-actions"><a className="button button-primary" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">Connect on LinkedIn <ArrowUpRight size={16} /></a><a className="button button-quiet" href="#projects">Explore projects <ArrowUpRight size={16} /></a></div>
          <div className="pill-list mono">{["PYTHON", "MACHINE LEARNING", "DATA SCIENCE", "TYPESCRIPT", "C"].map((pill) => <span key={pill}>{pill}</span>)}</div>
        </div>
        <div className="terminal-wrap"><div className="terminal-card"><div className="terminal-top"><span className="terminal-dots"><i /><i /><i /></span><span className="mono">eshtiaq_ahmad.py</span><span className="mono">PY3</span></div><pre><code><span className="syntax-comment"># eshtiaq_ahmad.py</span>{"\n\n"}<span className="syntax-keyword">developer</span> = {"{"}{"\n"}  <span className="syntax-key">"role"</span>: <span className="syntax-string">"Software Engineering Student"</span>,{"\n"}  <span className="syntax-key">"focus"</span>: [<span className="syntax-string">"AI/ML"</span>, <span className="syntax-string">"Data Science"</span>, <span className="syntax-string">"Python"</span>],{"\n"}  <span className="syntax-key">"learning"</span>: <span className="syntax-bool">True</span>{"\n"}{"}"}</code></pre><div className="terminal-bottom mono"><span /> RUNNING / LEARNING IN PUBLIC</div></div></div>
      </section>

      <section id="projects" className="content-section"><Reveal><div className="section-heading"><span className="section-number mono">// 01</span><h2>Projects<span>.</span></h2><p>Two curated projects with verifiable proof of work.</p></div></Reveal><div className="project-list">{projects.map((project, index) => <Reveal key={project.title} delay={index * 0.08}><ProjectCard project={project} index={index} /></Reveal>)}</div></section>

      <section id="project-details" className="content-section details-section"><Reveal><div className="section-heading"><span className="section-number mono">// 02</span><h2>Project details<span>.</span></h2><p>What each project makes possible.</p></div></Reveal><div className="details-grid">{projects.map((project) => <Reveal key={project.title}><article id={`${project.visual}-details`} className="detail-card"><span className="project-tag mono">{project.tag}</span><h3>{project.title}</h3><ul>{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul><a className="text-link mono" href={project.liveUrl} target="_blank" rel="noopener noreferrer">VISIT LIVE DEMO <ExternalLink size={14} /></a></article></Reveal>)}</div></section>

      <section id="skills" className="content-section skills-section"><Reveal><div className="section-heading"><span className="section-number mono">// 03</span><h2>What I’m building with<span>.</span></h2><p>A practical toolkit, growing with every experiment.</p></div></Reveal><div className="skill-grid">{skillGroups.map((skill, index) => <Reveal key={skill.label} delay={index * 0.08}><article className="skill-card"><div className="skill-card-top"><skill.icon size={22} strokeWidth={1.5} /><span className="mono">{skill.state}</span></div><span className="skill-label mono">{skill.label}</span><h3>{skill.items}</h3><p>{skill.detail}</p></article></Reveal>)}</div></section>

      <section id="about" className="content-section about-section"><Reveal><div className="section-heading"><span className="section-number mono">// 04</span><h2>About me<span>.</span></h2></div></Reveal><div className="about-grid"><Reveal><div className="about-copy"><p className="lead">I’m Eshtiaq Ahmad, a Software Engineering student at Daffodil International University. I enjoy turning ideas into working software and sharing that progress through projects.</p><p>Right now, I’m focused on Python, data science, and machine learning. I’m especially interested in the space where clean software engineering meets intelligent systems.</p></div></Reveal><Reveal delay={0.12}><div className="focus-panel"><div className="focus-icon"><GraduationCap size={24} /></div><span className="mono">CURRENTLY FOCUSED ON</span><h3>From fundamentals<br />to intelligent systems.</h3><ul><li>Python &amp; data workflows</li><li>Machine learning foundations</li><li>Thoughtful software projects</li></ul></div></Reveal></div></section>

      <section id="credentials" className="content-section credentials-section"><Reveal><div className="section-heading"><span className="section-number mono">// 05</span><h2>Credentials<span>.</span></h2><p>Focused learning, represented accurately.</p></div></Reveal><Reveal delay={0.12}><article className="credential-card"><GraduationCap size={24} /><div><span className="project-tag mono">FOCUSED LEARNING · GENERATIVE AI</span><h3>Career Essentials in Generative AI by Microsoft and LinkedIn</h3><p>Issued by Microsoft · September 2026</p><span className="mono">Focus: Prompt Engineering</span></div></article></Reveal></section>

      <section id="contact" className="contact-section"><div className="contact-glow" /><Reveal><span className="section-number mono">// 06 · SAY HELLO</span><h2>Let’s learn, build,<br /><span>and create something useful.</span></h2><p>Open to collaborations, learning opportunities, and conversations around software engineering, data, and AI.</p><div className="hero-actions"><a className="button button-primary" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">Connect on LinkedIn <ArrowUpRight size={16} /></a><a className="button button-quiet" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">View GitHub <ArrowUpRight size={16} /></a></div></Reveal></section>
    </main>
    <footer><div><strong>Eshtiaq Ahmad</strong><span>Software Engineering Student · Dhaka, Bangladesh</span></div><span className="mono">© 2026 · BUILT WITH CURIOSITY</span><div className="socials"><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={16} /></a><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><ArrowUpRight size={16} /></a></div></footer>
  </div>;
}

export default App;
