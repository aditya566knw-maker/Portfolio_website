export interface Project {
  slug: string;
  name: string;
  role: string;
  category: string;
  description: string;
  tools: string[];
  outcome: string;
  featured?: boolean;
}

// Content sourced strictly from the project brief. No fabricated metrics,
// clients, or results — outcomes are left as purpose statements where
// numeric results were not supplied.
export const projects: Project[] = [
  {
    slug: "workwitness",
    name: "WorkWitness",
    role: "Product & Strategy",
    category: "AI · Product · Automation",
    description:
      "An AI chief of staff for modern teams — built to bring together AI, automation and team intelligence into a single working layer for productivity.",
    tools: ["AI", "Product Strategy", "Automation", "Team Intelligence"],
    outcome:
      "Positioned as a modern AI-powered business productivity product, built at the intersection of strategy and generative technology.",
    featured: true,
  },
  {
    slug: "quanta-heal",
    name: "The Quanta Heal",
    role: "Brand & Marketing",
    category: "Brand Strategy · Digital Marketing",
    description:
      "Brand strategy and digital marketing support, shaping positioning and campaign direction for the venture.",
    tools: ["Brand Identity", "Campaign Planning", "Content Strategy"],
    outcome: "Contributed brand and marketing direction for the venture.",
  },
  {
    slug: "vyom-cloud",
    name: "Vyom Cloud",
    role: "Marketing & Analytics",
    category: "Digital Marketing · Analytics",
    description:
      "Marketing and analytics work supporting the venture's digital presence and performance tracking.",
    tools: ["Google Ads", "Analytics", "Performance Tracking"],
    outcome: "Supported the venture's digital marketing and analytics efforts.",
  },
  {
    slug: "navjyoti",
    name: "Navjyoti",
    role: "Brand Strategy",
    category: "Brand Strategy · Positioning",
    description:
      "Strategic brand and positioning work as part of independent consulting engagements.",
    tools: ["Market Positioning", "Brand Strategy"],
    outcome: "Delivered brand strategy direction as an independent consultant.",
  },
  {
    slug: "mangalshree",
    name: "Mangalshree",
    role: "Marketing",
    category: "Digital Marketing",
    description:
      "Digital marketing engagement focused on campaign planning and brand presence.",
    tools: ["Campaign Planning", "Digital Marketing"],
    outcome: "Delivered marketing support as part of consulting work.",
  },
  {
    slug: "shree-sai-digital",
    name: "Shree Sai Digital",
    role: "Marketing",
    category: "Digital Marketing",
    description:
      "Digital marketing engagement supporting campaign execution and brand visibility.",
    tools: ["Meta Ads", "Digital Marketing"],
    outcome: "Delivered marketing support as part of consulting work.",
  },
  {
    slug: "logmeonce",
    name: "LogMeOnce",
    role: "Marketing Associate",
    category: "Digital Marketing",
    description:
      "Marketing associate work during the engagement at Maltar Services, supporting campaign and content efforts.",
    tools: ["Meta Ads", "Google Ads", "Content Strategy"],
    outcome: "Contributed to marketing execution as Marketing Associate.",
  },
  {
    slug: "strategic-visualization",
    name: "Strategic Visualization",
    role: "Business Analytics",
    category: "Power BI · Data Visualization",
    description:
      "Business analytics and data visualization work translating raw data into strategic, decision-ready dashboards.",
    tools: ["Power BI", "Data Visualization", "Business Analytics"],
    outcome: "Applied analytics and visualization to support strategic decisions.",
  },
];
