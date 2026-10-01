// Central content store. Nothing here is invented beyond the brief —
// if information wasn't supplied, the copy stays neutral instead of guessing.

export const identity = {
  name: "Aditya Singh",
  brand: "InkOfJatayu",
  location: "Indore, Madhya Pradesh, India",
  role: "IT Operations Associate, Growwstacks / MTEC Software and Business Automations Pvt. Ltd.",
  positioning: ["Digital Marketing", "Business Analytics", "AI Creative Technology"],
  statement:
    "I build at the intersection of strategy, data, technology and visual storytelling.",
  email: "aditya566knw@gmail.com",
};

export const education = [
  {
    degree: "MBA — Business Analytics & Finance",
    school: "DAVV, Indore",
    period: "2023–2025",
  },
  {
    degree: "BBA — Marketing",
    school: "DAVV, Indore",
    period: "2020–2023",
  },
];

export interface SkillCategory {
  key: string;
  title: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    key: "marketing",
    title: "Marketing",
    skills: [
      "Meta Ads",
      "Google Ads",
      "Campaign Planning",
      "Consumer Research",
      "Competitive Intelligence",
    ],
  },
  {
    key: "analytics",
    title: "Analytics",
    skills: [
      "Power BI",
      "Google Analytics / GA4",
      "Google Search Console",
      "Performance Tracking",
      "Data Visualization",
    ],
  },
  {
    key: "branding",
    title: "Branding",
    skills: [
      "Brand Identity",
      "Market Positioning",
      "Strategic Storytelling",
      "Content Strategy",
    ],
  },
  {
    key: "ai",
    title: "AI",
    skills: [
      "ChatGPT",
      "Claude",
      "Gemini",
      "Prompt Engineering",
      "AI Image Generation",
      "AI Video Generation",
      "Automated Workflows",
    ],
  },
  {
    key: "development",
    title: "Development",
    skills: [
      "Vibe Coding",
      "HTML/CSS",
      "Website Workflows",
      "AI-Assisted Development",
    ],
  },
];

export interface TimelineEntry {
  period: string;
  title: string;
  org?: string;
}

export const timeline: TimelineEntry[] = [
  {
    period: "2023",
    title: "Independent Brand Strategist & Consultant",
  },
  {
    period: "2024",
    title: "Marketing Associate",
    org: "Maltar Services",
  },
  {
    period: "2024–Present",
    title: "Strategic Brand Executive",
    org: "Ventilia",
  },
  {
    period: "2026–Present",
    title: "IT Operations Associate",
    org: "Growwstacks / MTEC",
  },
];

export interface Certification {
  title: string;
  issuer: string;
}

export const certifications: Certification[] = [
  {
    title: "Foundations of Digital Marketing & E-commerce",
    issuer: "Google",
  },
  {
    title: "Young Industry Enthusiast — Retail Focus",
    issuer: "Infosys",
  },
];

export const aiLab = {
  heading: "The AI Lab",
  tagline: "Where strategy meets generative technology.",
  capabilities: [
    "AI Image Generation",
    "AI Video Generation",
    "Prompt Engineering",
    "Creative Automation",
    "Vibe Coding",
    "AI-Assisted Workflows",
  ],
};

// Only included if real URLs are supplied. Currently none provided — leave
// empty rather than fabricating links. Populate with real URLs when available.
export const socials: { label: string; url: string }[] = [];
