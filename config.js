/**
 * ============================================================
 *  PORTFOLIO CONFIG — Edit this file to update your portfolio
 *  No HTML or CSS knowledge needed!
 * ============================================================
 */
const PORTFOLIO = {

  /* ── Personal Info ─────────────────────────────────────── */
  name: {
    first: "VARAD",
    last:  "Kokate"
  },
  tagline:  "Building intelligent & IoT solutions that matter.",
  focus:    "B.Tech CSE · Ashokrao Mane Group of Institutions · Kolhapur, Maharashtra",
  eyebrow:  "Computer Science & Engineering",

  /* Rotating words in hero (add/remove freely) */
  rotatingWords: [
    "Full-Stack",
    "AI-Powered",
    "IoT-Enabled",
    "React-based",
    "Data-Driven"
  ],

  /* ── Contact ────────────────────────────────────────────── */
  contact: {
    email:    "varadkokate.tech@gmail.com",
    phone:    "+91 70200 58902",
    location: "Kolhapur, Maharashtra",
    linkedin: "https://linkedin.com/in/varad-kokate",
    github:   "https://github.com/varadkokate",

    /* Contact form delivery.
       - Leave "" → the form opens the visitor's email app with the message pre-filled.
       - Paste a Formspree URL (e.g. "https://formspree.io/f/xxxxxxx") → messages are
         delivered straight to your inbox without the visitor leaving the site. */
    formEndpoint: ""
  },

  /* ── Live GitHub activity (home page) ───────────────────── */
  /* Uses GitHub's public API. Set username to "" to hide the section. */
  github: {
    username: "varadkokate"
  },

  /* ── Stats (shown on home page) ─────────────────────────── */
  stats: [
    { value: "3+",  label: "Projects Shipped" },
    { value: "1",   label: "Industry Internship" },
    { value: "500+",label: "SKUs in E-Commerce App" }
  ],

  /* ── About / Intro (home page bio) ──────────────────────── */
  about: {
    bio: "Computer Science undergraduate with hands-on experience in software development, data analysis, web technologies, and IoT applications.",
    highlights: [
      { icon: "🎓", title: "Education",   text: "B.Tech CSE @ Ashokrao Mane Group of Institutions (2024–2027)" },
      { icon: "💼", title: "Experience",  text: "Web Dev Intern @ Pcube Technologies, Kolhapur" },
      { icon: "🤖", title: "Interests",   text: "AI Agents · IoT · Full-Stack Development · Data Analysis" }
    ]
  },

  /* ── Projects ───────────────────────────────────────────── */
  /* accent options: "saffron" | "coral" | "aqua"             */
  projects: [
    {
      no:      "01",
      accent:  "saffron",
      kind:    "AI / Web Platform",
      title:   "AI-Powered Data Cleaning Platform",
      summary: "A full-stack platform that uses AI Agents to automatically detect, flag, and fix dirty Excel data — saving hours of manual cleanup.",
      bullets: [
        "Built with React.js + Next.js for a responsive, fast UI",
        "Integrated AI Agent pipeline for intelligent data-quality rules",
        "Handles Excel import/export with automated preprocessing",
        "REST API layer connecting frontend to AI processing backend"
      ],
      tech:   "React.js · Next.js · AI Agent · Excel API · REST",
      stat:   { value: "AI", label: "Automated data cleaning" },
      link:   ""
    },
    {
      no:      "02",
      accent:  "coral",
      kind:    "IoT / Android",
      title:   "Hand Gesture Controlled Music System",
      summary: "An ESP32-based embedded system that reads hand gestures via ultrasonic sensors to control music playback, paired with a custom Android app.",
      bullets: [
        "ESP32 microcontroller with HC-SR04 ultrasonic gesture sensing",
        "DFPlayer Mini module for on-device audio playback",
        "Custom Android app for Bluetooth-based remote control",
        "Real-time gesture-to-command mapping with debounce logic"
      ],
      tech:   "ESP32 · HC-SR04 · DFPlayer Mini · Android · Bluetooth",
      stat:   { value: "IoT", label: "Gesture-based hardware" },
      link:   ""
    },
    {
      no:      "03",
      accent:  "aqua",
      kind:    "AI / Mobile App",
      title:   "AI Chatbot for College Students",
      summary: "A KivyMD mobile app featuring an AI chatbot that reads college PDFs and answers student questions with text-to-speech output.",
      bullets: [
        "Python + KivyMD cross-platform mobile interface",
        "PyPDF2 for parsing and indexing college documents",
        "SQLite for persistent chat history and user sessions",
        "Text-to-Speech (TTS) for hands-free interaction"
      ],
      tech:   "Python · KivyMD · SQLite · PyPDF2 · TTS",
      stat:   { value: "AI", label: "PDF-aware chatbot" },
      link:   ""
    }
    /* ── To add a new project, copy the block above and paste below ── */
  ],

  /* ── Experience & Education (timeline) ──────────────────── */
  /* badge options: "work" | "edu" | "current"                */
  timeline: [
    {
      badge:   "work",
      date:    "Jun – Jul 2023",
      title:   "Web Development Intern",
      org:     "Pcube Technologies, Kolhapur",
      desc:    "Built and deployed a full-stack E-Commerce platform handling 500+ SKUs.",
      bullets: [
        "Developed frontend with HTML, Bootstrap, and custom CSS",
        "Built PHP backend with MySQL for product & order management",
        "Integrated dynamic product catalog with search & filter",
        "Delivered production-ready build within 2-month internship"
      ]
    },
    {
      badge:   "current",
      date:    "2024 – 2027",
      title:   "B.Tech — Computer Science & Engineering",
      org:     "Ashokrao Mane Group of Institutions, Kolhapur",
      desc:    "Currently in third year. Focus on software engineering, AI, and IoT.",
      bullets: []
    },
    {
      badge:   "edu",
      date:    "2021 – 2024",
      title:   "Diploma — Computer Science & Engineering",
      org:     "Polytechnic Institute, Maharashtra",
      desc:    "Foundation in programming, electronics, and computer systems.",
      bullets: []
    }
    /* ── To add a new entry, copy a block above and paste below ── */
  ],

  /* ── Skills ─────────────────────────────────────────────── */
  /* accent options: "" (saffron default) | "coral" | "aqua" | "cream" */
  /* Every pill below also appears in the infinite marquee on the Skills page. */
  skillGroups: [
    {
      accent: "",
      glyph:  "⌨️",
      name:   "Programming Languages",
      desc:   "Core languages I write daily",
      pills:  ["Python", "Java", "JavaScript", "SQL"]
    },
    {
      accent: "coral",
      glyph:  "🌐",
      name:   "Web Technologies",
      desc:   "Frontend & full-stack tools",
      pills:  ["HTML", "CSS", "React.js", "Next.js", "REST API", "Bootstrap"]
    },
    {
      accent: "aqua",
      glyph:  "🤖",
      name:   "AI & Data",
      desc:   "AI, data processing & analysis",
      pills:  ["AI Agents", "Data Cleaning", "Data Analysis", "Excel Processing", "PyPDF2"]
    },
    {
      accent: "cream",
      glyph:  "📱",
      name:   "Mobile & IoT",
      desc:   "Mobile development & embedded systems",
      pills:  ["Android Development", "KivyMD", "ESP32", "HC-SR04", "DFPlayer Mini", "Bluetooth"]
    },
    {
      accent: "coral",
      glyph:  "🗄️",
      name:   "Databases",
      desc:   "Data storage & management",
      pills:  ["MySQL", "SQLite", "SQL"]
    },
    {
      accent: "aqua",
      glyph:  "🛠️",
      name:   "Tools & Platforms",
      desc:   "Dev tools and environments",
      pills:  ["Git", "GitHub", "VS Code", "PHP", "Linux"]
    }
    /* ── To add a new skill group, copy a block above and paste below ── */
  ],

  /* ── Core Strengths (skills page bottom) ────────────────── */
  strengths: [
    { icon: "🧩", label: "Problem Solving" },
    { icon: "📊", label: "Analytical Thinking" },
    { icon: "💻", label: "Software Development" },
    { icon: "📈", label: "Data Analysis" },
    { icon: "⚡", label: "Quick Learning" },
    { icon: "🤝", label: "Team Collaboration" },
    { icon: "📢", label: "Technical Communication" },
    { icon: "🔄", label: "Adaptability" }
    /* ── To add a strength, add { icon: "emoji", label: "Name" } ── */
  ],

  /* ── Marquee words (big scrolling banner on home) ───────── */
  marqueeWords: [
    { text: "React",      outline: false },
    { text: "Next.js",    outline: true  },
    { text: "Python",     outline: false },
    { text: "AI Agents",  outline: true  },
    { text: "ESP32",      outline: false },
    { text: "Android",    outline: true  },
    { text: "Full-Stack", outline: false },
    { text: "IoT",        outline: true  }
  ],

  /* ── Footer ─────────────────────────────────────────────── */
  footer: {
    copy: "Varad Kokate",
    links: [
      { label: "GitHub",   href: "https://github.com/varadkokate" },
      { label: "LinkedIn", href: "https://linkedin.com/in/varad-kokate" },
      /* NOTE: your old footer used varadkokate101@gmail.com while the contact
         section used varadkokate.tech@gmail.com. Pick the one you actually read. */
      { label: "Email",    href: "mailto:varadkokate.tech@gmail.com" }
    ]
  }
};

/* Top-level `const` is not a window property, so expose it explicitly. */
window.PORTFOLIO = PORTFOLIO;
