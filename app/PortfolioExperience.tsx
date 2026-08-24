"use client";

import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Circle,
  Cpu,
  Download,
  FileText,
  Code as Github,
  GraduationCap,
  Layers3,
  Network as Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Mountain,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import {
  destinations,
  educationHighlights,
  experience,
  hobbies,
  projects,
  siteConfig,
  skills,
  type Destination,
  type DestinationId,
} from "./portfolio-data";

const CityScene = lazy(() => import("./CityScene"));

const destinationIds = new Set(destinations.map((destination) => destination.id));

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

type SceneBoundaryProps = {
  children: ReactNode;
  onFailure: () => void;
};

class SceneBoundary extends Component<SceneBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    if (this.state.failed) return <StaticCity />;
    return this.props.children;
  }
}

function StaticCity() {
  return (
    <div className="static-city" aria-hidden="true">
      <div className="static-haze static-haze-one" />
      <div className="static-haze static-haze-two" />
      <div className="static-skyline static-skyline-back" />
      <div className="static-skyline static-skyline-front" />
      <div className="static-cn-tower">
        <i />
      </div>
      <div className="static-route static-route-one" />
      <div className="static-route static-route-two" />
      <div className="static-water" />
    </div>
  );
}

function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <i />
    </span>
  );
}

function OpportunityStatus({ compact = false }: { compact?: boolean }) {
  if (!siteConfig.showOpportunityStatus) return null;

  return (
    <div className={`opportunity-status${compact ? " is-compact" : ""}`}>
      <span className="status-pulse" aria-hidden="true" />
      <span>{siteConfig.opportunityStatus}</span>
    </div>
  );
}

function TagList({ tags }: { tags: readonly string[] | string[] }) {
  return (
    <ul className="tag-list" aria-label="Technologies and focus areas">
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}

function DestinationPanel({
  destination,
  onClose,
  onQuickView,
}: {
  destination: Destination;
  onClose: () => void;
  onQuickView: () => void;
}) {
  return (
    <aside className={`destination-panel accent-${destination.accent}`} aria-labelledby="destination-title">
      <div className="panel-topline">
        <div>
          <span className="panel-kicker">{destination.landmark}</span>
          <span className="panel-coordinate">TOR / {destination.number}</span>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Return to city overview">
          <X size={18} strokeWidth={1.7} />
        </button>
      </div>

      <div className="panel-heading">
        <p>{destination.eyebrow}</p>
        <h2 id="destination-title">{destination.name}</h2>
        <span>{destination.intro}</span>
      </div>

      <div className="panel-scroll">{renderDestinationContent(destination.id, onQuickView)}</div>

      <div className="panel-footer">
        <span>Press Esc to return</span>
        <button className="text-button" onClick={onQuickView}>
          Quick view <ChevronRight size={14} />
        </button>
      </div>
    </aside>
  );
}

function renderDestinationContent(id: DestinationId, onQuickView: () => void) {
  if (id === "about") {
    return (
      <div className="about-room">
        <div className="room-window" aria-hidden="true">
          <span className="window-city-line" />
          <span className="window-city-line is-short" />
          <span className="window-moon" />
        </div>
        <p className="editorial-copy">
          I’m Aryan—a University of Toronto computer engineering student who enjoys
          building the complete thing: the model or algorithm, the system around it,
          and the product experience people actually touch.
        </p>
        <p>
          I started coding in middle school and kept following the interesting seams:
          software meeting hardware, AI meeting human judgment, and prototypes becoming
          reliable products. Right now I’m especially curious about intelligent product
          systems, low-latency software, and infrastructure that stays understandable as
          it scales.
        </p>
        <div className="room-objects" aria-label="Things on Aryan's desk">
          <span><Cpu size={16} /> systems notebook</span>
          <span><Mountain size={16} /> climbing chalk</span>
          <span><Radio size={16} /> audio experiments</span>
          <span><Layers3 size={16} /> product sketches</span>
        </div>
      </div>
    );
  }

  if (id === "education") {
    return (
      <div className="campus-list">
        {educationHighlights.map((item, index) => (
          <article key={item.title} className="campus-building">
            <span className="building-index">0{index + 1}</span>
            <div>
              <h3>{item.title}</h3>
              <p className="item-meta">{item.subtitle}</p>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (id === "experience") {
    return (
      <div className="career-tower">
        <div className="elevator-rail" aria-hidden="true">
          {experience.map((item) => <span key={item.floor}>{item.floor}</span>)}
        </div>
        <div className="career-floors">
          {experience.map((item, index) => (
            <article key={item.company} className={`career-floor floor-${index + 1}`}>
              <div className="floor-glass">
                <div className="floor-heading">
                  <span>Floor {item.floor}</span>
                  <span>{item.period}</span>
                </div>
                <h3>{item.company}</h3>
                <p className="item-meta">{item.role} · {item.place}</p>
                <p>{item.summary}</p>
                {"metric" in item && item.metric ? <strong className="metric-line">{item.metric}</strong> : null}
                <TagList tags={item.tags} />
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (id === "market") {
    return (
      <div className="market-case-study">
        <div className="market-hero-stat">
          <span>400+</span>
          <p>students joined the marketplace</p>
        </div>
        <div className="market-listings" aria-label="Example marketplace activity">
          <div><span>MAT137 textbook</span><strong>$32</strong><small>St. George · just now</small></div>
          <div><span>Desk lamp</span><strong>$18</strong><small>New College · 4m</small></div>
          <div><span>Looking for: bike</span><strong>Request</strong><small>fulfilled · 12m</small></div>
        </div>
        <section className="case-block">
          <span className="case-number">01 / Problem</span>
          <h3>General marketplaces don’t understand campus.</h3>
          <p>
            Students were scattered across group chats and broad resale apps. Trust,
            pickup distance, UofT identity, and the rhythm of move-in and exam seasons
            were all afterthoughts.
          </p>
        </section>
        <section className="case-block">
          <span className="case-number">02 / Product</span>
          <h3>A smaller network with better context.</h3>
          <p>
            Aryan co-created and developed a verified UofT marketplace with listings,
            requests, saved items, search, messaging, image upload, and notifications.
          </p>
        </section>
        <div className="architecture-flow" aria-label="UofTMarket product architecture">
          <span><ShieldCheck size={17} /> Verified UofT access</span>
          <i />
          <span><Search size={17} /> Listings + requests</span>
          <i />
          <span><MessageCircle size={17} /> Search + messaging</span>
        </div>
        <TagList tags={["React", "TypeScript", "Supabase", "Product design"]} />
        <a className="primary-link" href={siteConfig.links.market} target="_blank" rel="noreferrer">
          Visit UofTMarket <ArrowUpRight size={15} />
        </a>
      </div>
    );
  }

  if (id === "projects") {
    return (
      <div className="project-installations">
        {projects.map((project) => (
          <article key={project.id} className={`project-installation project-${project.id}`}>
            <span className="installation-index">{project.index}</span>
            <div>
              <p className="item-meta">{project.category}</p>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <strong>{project.outcome}</strong>
              <TagList tags={project.tags} />
              {project.href ? (
                <a href={project.href} target="_blank" rel="noreferrer">
                  View code <ArrowUpRight size={14} />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (id === "hobbies") {
    return (
      <div className="hobby-gym">
        <div className="climbing-wall" aria-hidden="true">
          <span className="hold hold-a" /><span className="hold hold-b" />
          <span className="hold hold-c" /><span className="hold hold-d" />
          <span className="hold hold-e" /><span className="hold hold-f" />
          <span className="route-thread" />
          <small>V4 · BLUE</small>
        </div>
        <div className="hobby-list">
          {hobbies.map((hobby, index) => (
            <div key={hobby.name}>
              <span>0{index + 1}</span>
              <h3>{hobby.name}</h3>
              <p>{hobby.note}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "contact") {
    const departures = [
      { time: "NOW", destination: "Message Aryan", platform: "Email", href: siteConfig.links.email, icon: Mail },
      { time: "02", destination: "Professional network", platform: "LinkedIn", href: siteConfig.links.linkedin, icon: Linkedin },
      { time: "05", destination: "View code", platform: "GitHub", href: siteConfig.links.github, icon: Github },
      { time: "08", destination: "Download profile", platform: "Résumé", href: siteConfig.links.resume, icon: FileText, download: true },
    ];

    return (
      <div className="departures-board">
        <div className="board-header">
          <span>TIME</span><span>DESTINATION</span><span>PLATFORM</span>
        </div>
        {departures.map((departure) => {
          const Icon = departure.icon;
          return (
            <a
              key={departure.platform}
              href={departure.href}
              target={departure.href.startsWith("http") ? "_blank" : undefined}
              rel={departure.href.startsWith("http") ? "noreferrer" : undefined}
              download={departure.download}
            >
              <span>{departure.time}</span>
              <strong>{departure.destination}</strong>
              <span><Icon size={15} /> {departure.platform}</span>
              <ChevronRight size={15} />
            </a>
          );
        })}
        <div className="platform-note"><Circle size={8} fill="currentColor" /> Union concourse · connections open</div>
      </div>
    );
  }

  return (
    <div className="overview-redirect">
      <Sparkles size={24} />
      <h3>Ready for the direct route?</h3>
      <p>Open the conventional portfolio with every essential detail in one scroll.</p>
      <button className="primary-link" onClick={onQuickView}>Open quick view <ArrowUpRight size={15} /></button>
    </div>
  );
}

function QuickView({
  open,
  onClose,
  onExplore,
}: {
  open: boolean;
  onClose: () => void;
  onExplore: (id: DestinationId) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="quick-view" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
      <header className="quick-header">
        <a className="brand-lockup" href="#top" onClick={(event) => { event.preventDefault(); onClose(); }}>
          <LogoMark />
          <span>Aryan Hussain</span>
        </a>
        <nav aria-label="Quick view sections">
          <a href="#qv-experience">Experience</a>
          <a href="#qv-projects">Projects</a>
          <a href="#qv-education">Education</a>
          <a href="#qv-contact">Contact</a>
        </nav>
        <button ref={closeRef} className="quick-close" onClick={onClose}>
          <ArrowLeft size={16} /> Back to city
        </button>
      </header>

      <main className="quick-main">
        <section className="quick-hero">
          <div>
            <p className="section-label">Recruiter view · Toronto, Canada</p>
            <h1 id="quick-view-title">Software engineer.<br /><em>Product thinker.</em><br />Systems builder.</h1>
          </div>
          <div className="quick-summary">
            <p>
              Aryan builds intelligent products end-to-end—from algorithms and AI to the
              production systems and interfaces that make them useful.
            </p>
            <OpportunityStatus compact />
            <div className="hero-actions">
              <a className="button-primary" href={siteConfig.links.resume} download>
                <Download size={16} /> Résumé
              </a>
              <a className="button-secondary" href={siteConfig.links.email}>
                <Mail size={16} /> Get in touch
              </a>
            </div>
          </div>
        </section>

        <section className="quick-section" id="qv-experience">
          <div className="section-intro">
            <p className="section-label">01 / Experience</p>
            <h2>Learning to build at every scale.</h2>
          </div>
          <div className="quick-experience-list">
            {experience.map((item) => (
              <article key={item.company}>
                <span className="quick-period">{item.period}</span>
                <div>
                  <h3>{item.company}</h3>
                  <p className="item-meta">{item.role} · {item.place}</p>
                </div>
                <div>
                  <p>{item.summary}</p>
                  {"metric" in item && item.metric ? <strong>{item.metric}</strong> : null}
                  <TagList tags={item.tags} />
                </div>
              </article>
            ))}
          </div>
          <button className="section-explore" onClick={() => onExplore("experience")}>
            Explore the career tower <ArrowUpRight size={15} />
          </button>
        </section>

        <section className="quick-section project-section" id="qv-projects">
          <div className="section-intro">
            <p className="section-label">02 / Selected work</p>
            <h2>Products, algorithms, and intelligent systems.</h2>
          </div>
          <div className="quick-project-grid">
            <article className="quick-project featured-project">
              <div className="featured-stat"><span>400+</span><small>users</small></div>
              <p className="item-meta">Flagship independent product</p>
              <h3>UofTMarket</h3>
              <p>
                A verified campus marketplace for listings, requests, saved items,
                messaging, and the very specific realities of student life.
              </p>
              <TagList tags={["React", "TypeScript", "Supabase", "Product"]} />
              <a href={siteConfig.links.market} target="_blank" rel="noreferrer">Live product <ArrowUpRight size={14} /></a>
            </article>
            {projects.slice(0, 3).map((project) => (
              <article key={project.id} className="quick-project">
                <span className="project-letter">{project.index}</span>
                <p className="item-meta">{project.category}</p>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <strong>{project.outcome}</strong>
                <TagList tags={project.tags} />
                {project.href ? <a href={project.href} target="_blank" rel="noreferrer">View code <ArrowUpRight size={14} /></a> : null}
              </article>
            ))}
          </div>
          <button className="section-explore" onClick={() => onExplore("projects")}>
            Visit Harvourfront <ArrowUpRight size={15} />
          </button>
        </section>

        <section className="quick-section education-section" id="qv-education">
          <div className="section-intro">
            <p className="section-label">03 / Education</p>
            <h2>Computer engineering, with range.</h2>
          </div>
          <div className="education-layout">
            <div className="degree-card">
              <GraduationCap size={24} strokeWidth={1.4} />
              <p>University of Toronto</p>
              <h3>BASc, Computer Engineering + PEY</h3>
              <span>Artificial Intelligence minor · 2022—2027</span>
            </div>
            <div className="education-items">
              {educationHighlights.slice(2).map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p className="item-meta">{item.subtitle}</p>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="quick-section skill-section">
          <div className="section-intro">
            <p className="section-label">04 / Toolkit</p>
            <h2>Comfortable across the stack.</h2>
          </div>
          <div className="skill-matrix">
            {Object.entries(skills).map(([group, items]) => (
              <div key={group}>
                <h3>{group}</h3>
                <p>{items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="quick-contact" id="qv-contact">
          <p className="section-label">05 / Contact · Union Station</p>
          <h2>Let’s build something<br /><em>worth navigating.</em></h2>
          <div className="contact-actions">
            <a href={siteConfig.links.email}><Mail size={16} /> Email Aryan</a>
            <a href={siteConfig.links.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a>
            <a href={siteConfig.links.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>
            <a href={siteConfig.links.resume} download><Download size={16} /> Résumé</a>
          </div>
        </section>

        <section className="city-index" aria-label="Explore portfolio locations">
          <div>
            <p className="section-label">Prefer to explore?</p>
            <h2>Choose a Toronto destination.</h2>
          </div>
          <div className="city-index-grid">
            {destinations.filter((destination) => destination.id !== "overview").map((destination) => (
              <button key={destination.id} onClick={() => onExplore(destination.id)}>
                <span>{destination.number}</span>
                <strong>{destination.landmark}</strong>
                <small>{destination.name}</small>
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="quick-footer">
        <span>Designed and built by Aryan Hussain</span>
        <span>Toronto · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

function MobilePortfolio() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="mobile-site" id="top">
      <header className="mobile-header">
        <a className="brand-lockup" href="#top" onClick={closeMenu}><LogoMark /><span>AH</span></a>
        <button className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="mobile-menu">
          {menuOpen ? <X size={18} /> : <Menu size={18} />} <span>{menuOpen ? "Close" : "Menu"}</span>
        </button>
        <nav id="mobile-menu" className={menuOpen ? "is-open" : ""} aria-label="Mobile navigation">
          {[
            ["About", "#mobile-about"], ["Experience", "#mobile-experience"],
            ["Projects", "#mobile-projects"], ["Education", "#mobile-education"],
            ["Contact", "#mobile-contact"],
          ].map(([label, href]) => <a key={label} href={href} onClick={closeMenu}>{label}</a>)}
        </nav>
      </header>

      <main>
        <section className="mobile-hero">
          <div className="mobile-skyline" aria-hidden="true"><span /><span /><span /><span /><i /></div>
          <p className="section-label">Toronto, Canada · Software engineer</p>
          <h1>Aryan<br />Hussain<span>.</span></h1>
          <p className="mobile-tagline">{siteConfig.title}</p>
          <OpportunityStatus />
          <div className="hero-actions">
            <a className="button-primary" href="#mobile-projects">View work <ArrowUpRight size={15} /></a>
            <a className="button-secondary" href={siteConfig.links.resume} download>Résumé <Download size={15} /></a>
          </div>
          <p className="desktop-note"><Sparkles size={13} /> Visit on desktop to explore Toronto in 3D.</p>
        </section>

        <section className="mobile-section" id="mobile-about">
          <p className="section-label">01 / About</p>
          <h2>Building the model, the system, and the product around it.</h2>
          <p className="mobile-lede">
            I’m a University of Toronto computer engineering student working across
            software, AI, product, and systems. I care about strong technical decisions—and
            making the result feel obvious to the person using it.
          </p>
          <div className="mobile-facts">
            <span><MapPin size={15} /> Toronto, ON</span>
            <span><GraduationCap size={15} /> UofT ECE + AI</span>
            <span><Cpu size={15} /> Software + systems</span>
          </div>
        </section>

        <section className="mobile-section" id="mobile-experience">
          <p className="section-label">02 / Experience</p>
          <h2>Career, floor by floor.</h2>
          <div className="mobile-timeline">
            {experience.map((item) => (
              <article key={item.company}>
                <span className="timeline-dot" />
                <div className="mobile-role-heading"><h3>{item.company}</h3><span>{item.period}</span></div>
                <p className="item-meta">{item.role} · {item.place}</p>
                <p>{item.summary}</p>
                {"metric" in item && item.metric ? <strong>{item.metric}</strong> : null}
                <TagList tags={item.tags} />
              </article>
            ))}
          </div>
        </section>

        <section className="mobile-section mobile-market">
          <p className="section-label">Flagship product / UofTMarket</p>
          <div className="mobile-market-stat"><span>400+</span><small>students joined</small></div>
          <h2>A safer marketplace, made specifically for campus.</h2>
          <p>
            Aryan co-created and developed a verified UofT platform for listings, requests,
            saved items, search, messaging, and notifications.
          </p>
          <TagList tags={["React", "TypeScript", "Supabase", "Product"]} />
          <a className="primary-link" href={siteConfig.links.market} target="_blank" rel="noreferrer">Visit UofTMarket <ArrowUpRight size={14} /></a>
        </section>

        <section className="mobile-section" id="mobile-projects">
          <p className="section-label">03 / Selected projects</p>
          <h2>Technical ideas made tangible.</h2>
          <div className="mobile-projects">
            {projects.map((project) => (
              <article key={project.id}>
                <span className="project-letter">{project.index}</span>
                <p className="item-meta">{project.category}</p>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <strong>{project.outcome}</strong>
                <TagList tags={project.tags} />
                {project.href ? <a href={project.href} target="_blank" rel="noreferrer">View code <ArrowUpRight size={14} /></a> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="mobile-section" id="mobile-education">
          <p className="section-label">04 / Education + community</p>
          <h2>University of Toronto.</h2>
          <div className="mobile-degree">
            <span>2022—2027</span>
            <h3>BASc Computer Engineering + PEY</h3>
            <p>Artificial Intelligence minor</p>
          </div>
          <div className="mobile-education-list">
            {educationHighlights.map((item) => (
              <article key={item.title}><Check size={15} /><div><h3>{item.title}</h3><p>{item.detail}</p></div></article>
            ))}
          </div>
        </section>

        <section className="mobile-section mobile-skills">
          <p className="section-label">05 / Toolkit</p>
          <h2>Across the stack.</h2>
          {Object.entries(skills).map(([group, items]) => (
            <div key={group}><h3>{group}</h3><p>{items.join(" · ")}</p></div>
          ))}
        </section>

        <section className="mobile-section mobile-hobbies">
          <p className="section-label">06 / Away from the keyboard</p>
          <h2>Movement helps the ideas move.</h2>
          <div>{hobbies.map((hobby, index) => <span key={hobby.name}><small>0{index + 1}</small>{hobby.name}</span>)}</div>
        </section>

        <section className="mobile-contact" id="mobile-contact">
          <p className="section-label">07 / Contact · Union Station</p>
          <h2>Where should we go next?</h2>
          <p>For software roles, ambitious products, or a good engineering conversation.</p>
          <div className="contact-actions">
            <a href={siteConfig.links.email}><Mail size={16} /> Email</a>
            <a href={siteConfig.links.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a>
            <a href={siteConfig.links.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>
            <a href={siteConfig.links.resume} download><Download size={16} /> Résumé</a>
          </div>
        </section>
      </main>
      <footer className="mobile-footer"><LogoMark /><span>Built by Aryan in Toronto.</span></footer>
    </div>
  );
}

export default function PortfolioExperience() {
  const [selected, setSelected] = useState<DestinationId | null>(null);
  const [hovered, setHovered] = useState<DestinationId | null>(null);
  const [quickView, setQuickView] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const desktopCapable = useMedia("(min-width: 960px)");
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.id === selected) ?? null,
    [selected],
  );

  const setHash = useCallback((hash: string) => {
    if (window.location.hash === hash) return;
    window.history.pushState({}, "", hash || window.location.pathname);
  }, []);

  const openDestination = useCallback((id: DestinationId, updateHash = true) => {
    if (id === "overview") {
      setSelected(null);
      setQuickView(true);
      if (updateHash) setHash("#quick-view");
      return;
    }
    setQuickView(false);
    setSelected(id);
    if (updateHash) setHash(`#${id}`);
  }, [setHash]);

  const returnToCity = useCallback((updateHash = true) => {
    setSelected(null);
    setQuickView(false);
    setHovered(null);
    if (updateHash) setHash("");
  }, [setHash]);

  const showQuickView = useCallback((updateHash = true) => {
    setSelected(null);
    setQuickView(true);
    if (updateHash) setHash("#quick-view");
  }, [setHash]);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "quick-view") {
        setSelected(null);
        setQuickView(true);
      } else if (destinationIds.has(hash as DestinationId)) {
        openDestination(hash as DestinationId, false);
      } else {
        returnToCity(false);
      }
    };
    syncFromHash();
    window.addEventListener("popstate", syncFromHash);
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.removeEventListener("popstate", syncFromHash);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [openDestination, returnToCity]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (selected || quickView)) returnToCity();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [quickView, returnToCity, selected]);

  return (
    <>
      <div className="desktop-site" id="top">
        <div className="scene-layer" aria-hidden="true">
          {desktopCapable && !sceneFailed ? (
            <SceneBoundary onFailure={() => setSceneFailed(true)}>
              <Suspense fallback={<div className="scene-loading"><span /><p>Illuminating Toronto</p></div>}>
                <CityScene
                  selected={selected}
                  hovered={hovered}
                  onSelect={openDestination}
                  onHover={setHovered}
                  reducedMotion={reducedMotion}
                />
              </Suspense>
            </SceneBoundary>
          ) : <StaticCity />}
        </div>
        <div className="scene-grain" aria-hidden="true" />
        <div className="scene-vignette" aria-hidden="true" />

        <header className="desktop-header">
          <button className="brand-lockup brand-button" onClick={() => returnToCity()} aria-label="Return to Toronto overview">
            <LogoMark />
            <span className="desktop-brand-name">Aryan Hussain</span>
            <span className="desktop-brand-place">Toronto</span>
          </button>
          <nav aria-label="Primary navigation">
            <button className={!selected && !quickView ? "is-active" : ""} onClick={() => returnToCity()}>Explore</button>
            <button onClick={() => showQuickView()}>Quick View</button>
            <a href={siteConfig.links.resume} download>Résumé</a>
            <button onClick={() => openDestination("contact")}>Contact</button>
          </nav>
          <div className="desktop-header-status">
            <OpportunityStatus compact />
          </div>
        </header>

        <h1 className="sr-only">Aryan Hussain — interactive Toronto portfolio</h1>

        <nav className={`destination-rail${selected ? " has-selection" : ""}`} aria-label="Toronto portfolio destinations">
          {destinations.map((destination) => (
            <button
              key={destination.id}
              className={selected === destination.id ? "is-active" : ""}
              onMouseEnter={() => setHovered(destination.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(destination.id)}
              onBlur={() => setHovered(null)}
              onClick={() => openDestination(destination.id)}
              aria-label={`${destination.landmark}: ${destination.name}`}
            >
              <span>{destination.number}</span>
              <i />
              <strong>{destination.landmark}</strong>
            </button>
          ))}
        </nav>

        {selectedDestination ? (
          <DestinationPanel destination={selectedDestination} onClose={() => returnToCity()} onQuickView={() => showQuickView()} />
        ) : null}

        {!selected && !quickView ? (
          <div className="explore-hint"><Zap size={13} /><span>Hover a signal or use the destination index</span></div>
        ) : null}

        <div className="scene-credit" aria-hidden="true"><span>TORONTO / NIGHT</span><span>LIVE SYSTEM MAP</span></div>
      </div>

      <MobilePortfolio />

      <QuickView
        open={quickView}
        onClose={() => returnToCity()}
        onExplore={(id) => openDestination(id)}
      />
    </>
  );
}
