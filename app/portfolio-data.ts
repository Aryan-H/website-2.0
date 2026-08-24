export type DestinationId =
  | "about"
  | "education"
  | "experience"
  | "market"
  | "projects"
  | "hobbies"
  | "contact"
  | "overview";

export type Destination = {
  id: DestinationId;
  number: string;
  name: string;
  landmark: string;
  eyebrow: string;
  intro: string;
  accent: "amber" | "blue" | "violet" | "cyan" | "coral";
};

export const siteConfig = {
  name: "Aryan Hussain",
  title: "Software engineer building intelligent products and the systems behind them.",
  location: "Toronto, Canada",
  showOpportunityStatus: true,
  opportunityStatus: "Open to 2027 new-grad software engineering opportunities.",
  links: {
    email: "mailto:aryan.hussain@mail.utoronto.ca",
    linkedin: "https://www.linkedin.com/in/aryan-hussain-909238244/",
    github: "https://github.com/Aryan-H",
    resume: "/aryan-hussain-resume.pdf",
    market: "https://uoftmarket.com/",
  },
} as const;

export const destinations: Destination[] = [
  {
    id: "about",
    number: "01",
    name: "About me",
    landmark: "My apartment",
    eyebrow: "The warm light upstairs",
    intro:
      "A computer engineer who likes working where software, AI, product thinking, and systems meet.",
    accent: "amber",
  },
  {
    id: "education",
    number: "02",
    name: "Education",
    landmark: "UofT campus",
    eyebrow: "Learning in the city",
    intro:
      "Computer Engineering, an AI minor, and the student teams that turned coursework into real systems.",
    accent: "blue",
  },
  {
    id: "experience",
    number: "03",
    name: "Experience",
    landmark: "Shopify office",
    eyebrow: "Built floor by floor",
    intro:
      "A progression from customer-facing work to product, platform, and production software engineering.",
    accent: "violet",
  },
  {
    id: "market",
    number: "04",
    name: "UofTMarket",
    landmark: "Eaton Centre",
    eyebrow: "Flagship product",
    intro:
      "A student-only marketplace designed to make buying and selling around campus safer and more useful.",
    accent: "coral",
  },
  {
    id: "projects",
    number: "05",
    name: "Selected projects",
    landmark: "Harvourfront",
    eyebrow: "Experiments with consequence",
    intro:
      "Applied AI, pathfinding, audio intelligence, and the systems decisions that make them work.",
    accent: "cyan",
  },
  {
    id: "hobbies",
    number: "06",
    name: "Beyond work",
    landmark: "Climbing gym",
    eyebrow: "Away from the keyboard",
    intro:
      "Bouldering, badminton, tennis, and the satisfying work of getting a little better every session.",
    accent: "amber",
  },
  {
    id: "contact",
    number: "07",
    name: "Contact",
    landmark: "Union Station",
    eyebrow: "Next departure",
    intro:
      "For software roles, ambitious products, or a good engineering conversation—pick a line and say hello.",
    accent: "blue",
  },
  {
    id: "overview",
    number: "08",
    name: "Quick view",
    landmark: "CN Tower",
    eyebrow: "The city at a glance",
    intro:
      "The direct, recruiter-friendly version: experience, education, projects, skills, and contact in one view.",
    accent: "cyan",
  },
];

export const experience = [
  {
    floor: "05",
    company: "Shopify",
    role: "Software Engineering",
    period: "Current chapter",
    place: "Toronto, ON",
    summary:
      "Working at the scale of global commerce, where product judgment and durable engineering have to move together.",
    tags: ["Product engineering", "Commerce", "Systems at scale"],
  },
  {
    floor: "04",
    company: "Genesys",
    role: "Software Engineering",
    period: "Professional experience",
    place: "Toronto, ON",
    summary:
      "Contributed to production software and learned how mature teams operate across design, implementation, and delivery.",
    tags: ["Production systems", "Collaboration", "Delivery"],
  },
  {
    floor: "03",
    company: "Nirmata",
    role: "Software Engineer Intern",
    period: "Jun — Aug 2024",
    place: "San Jose, CA",
    summary:
      "Built permission-based security roles and a dynamic Kubernetes policy monitor for an enterprise SaaS platform serving 460+ customers.",
    tags: ["TypeScript", "React", "Kubernetes", "Node", "Sentry"],
    metric: "200% responsiveness improvement",
  },
  {
    floor: "02",
    company: "Illuminate Universe",
    role: "Intern",
    period: "May — Aug 2023",
    place: "Remote",
    summary:
      "Co-hosted an engineering podcast for students and designed a custom web video experience for the program.",
    tags: ["Communication", "HTML", "CSS", "Media"],
  },
  {
    floor: "01",
    company: "Lowe’s",
    role: "Electrical & Hardware Sales Associate",
    period: "May — Sep 2023",
    place: "Toronto, ON",
    summary:
      "Learned to translate ambiguous needs into practical solutions—an early lesson in listening before building.",
    tags: ["Customer empathy", "Problem solving", "Ownership"],
  },
];

export const projects = [
  {
    id: "interview",
    index: "A",
    title: "AI Interview Platform",
    category: "Voice + agent systems",
    description:
      "An interview environment exploring live voice, transcription, and AI-agent feedback loops without losing the human signal.",
    outcome: "A platform concept built around real-time conversation.",
    tags: ["AI agents", "Voice", "Transcription", "Product"],
  },
  {
    id: "mapability",
    index: "B",
    title: "Mapability",
    category: "Algorithms + systems",
    description:
      "A C++ GIS application built on OpenStreetMap data with A* navigation, accessible map modes, autocomplete, and route optimization.",
    outcome: "A* pathfinding measured 225% faster than the Dijkstra baseline.",
    tags: ["C++", "A*", "OpenStreetMap", "GTK"],
    href: "https://github.com/Aryan-H/MapAbility",
  },
  {
    id: "audiocat",
    index: "C",
    title: "AudioCat",
    category: "Applied machine learning",
    description:
      "A convolutional recurrent neural network that classifies WAV audio as music, speech, audiobooks, or TED Talks using mel-spectrograms.",
    outcome: "95.8% test accuracy across a dataset of 8,000+ audio samples.",
    tags: ["PyTorch", "Python", "CRNN", "Signal processing"],
    href: "https://github.com/Aryan-H/Audio-Media-Classification",
  },
  {
    id: "systems",
    index: "D",
    title: "Systems Lab",
    category: "Next build",
    description:
      "A reserved installation for deeper C++ and low-latency work—the next part of the waterfront is intentionally under construction.",
    outcome: "Currently exploring performance, concurrency, and systems design.",
    tags: ["C++", "Concurrency", "Performance", "In progress"],
  },
];

export const skills = {
  Languages: ["C / C++", "Python", "Java", "JavaScript", "TypeScript", "SQL"],
  Product: ["React", "Node", "Flask", "Django", "Redux", "Figma"],
  Data: ["PostgreSQL", "Firebase", "MongoDB", "PyTorch", "NumPy", "Pandas"],
  Systems: ["Kubernetes", "Docker", "AWS", "Linux", "Git", "Sentry", "FPGA"],
};

export const educationHighlights = [
  {
    title: "Computer Engineering + PEY",
    subtitle: "University of Toronto · 2022 — 2027",
    detail:
      "A systems-heavy foundation spanning algorithms, operating systems, databases, software design, machine learning, and computer hardware.",
  },
  {
    title: "Artificial Intelligence minor",
    subtitle: "Learning machines, carefully",
    detail:
      "Coursework and projects in machine learning, deep learning, and artificial intelligence, grounded in the engineering around the model.",
  },
  {
    title: "IEEE UofT",
    subtitle: "Web developer",
    detail:
      "Maintained team and hackathon software used for 1,000+ registrations and built a PostgreSQL-backed hardware sign-out system for 256 participants.",
  },
  {
    title: "Your Next Career Network",
    subtitle: "Software developer",
    detail:
      "Built registration and interactive venue-map systems supporting 6,000+ UofT career-fair registrations.",
  },
];

export const hobbies = [
  { name: "Bouldering", note: "Project the route, commit, adjust." },
  { name: "Badminton", note: "Fast decisions and even faster recovery." },
  { name: "Tennis", note: "Technique, repetition, and small improvements." },
  { name: "Fitness", note: "A reliable reset after long build sessions." },
];
