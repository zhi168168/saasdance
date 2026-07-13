import { ProcessStage, SiteState } from "./constants";

import { Category } from "@/models/category";
import { Site } from "@/models/site";

const now = Date.now();

export const seedCategories: Category[] = [
  {
    _id: "cat-for-sale",
    icon: "shopping-cart",
    name: "For Sale",
    featured: false,
    weight: 160,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-deals",
    icon: "badge-percent",
    name: "Deals",
    featured: false,
    weight: 150,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-premium",
    icon: "crown",
    name: "Premium",
    featured: false,
    weight: 140,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-reviews",
    icon: "clipboard-list",
    name: "Reviews",
    featured: false,
    weight: 130,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-leaderboard",
    icon: "trophy",
    name: "Leaderboard",
    featured: false,
    weight: 120,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-ai",
    icon: "sparkles",
    name: "Artificial Intelligence",
    featured: true,
    weight: 100,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-devtools",
    icon: "code",
    name: "Developer Tools",
    featured: true,
    weight: 90,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-productivity",
    icon: "zap",
    name: "Productivity",
    featured: true,
    weight: 80,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-marketing",
    icon: "megaphone",
    name: "Marketing",
    featured: true,
    weight: 70,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-design",
    icon: "palette",
    name: "Design",
    featured: true,
    weight: 60,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-games",
    icon: "gamepad",
    name: "Games",
    featured: true,
    weight: 58,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-analytics",
    icon: "chart",
    name: "Analytics",
    featured: true,
    weight: 50,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-seo",
    icon: "trending-up",
    name: "SEO",
    featured: false,
    weight: 75,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-directories",
    icon: "folder",
    name: "Directories",
    featured: false,
    weight: 74,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-automation",
    icon: "workflow",
    name: "Automation",
    featured: false,
    weight: 73,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-boilerplates",
    icon: "layers",
    name: "Boilerplates",
    featured: false,
    weight: 72,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-writing",
    icon: "pen-line",
    name: "Writing",
    featured: false,
    weight: 65,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-no-code",
    icon: "mouse-pointer",
    name: "No Code",
    featured: false,
    weight: 55,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-community",
    icon: "users",
    name: "Community",
    featured: false,
    weight: 54,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-education",
    icon: "graduation-cap",
    name: "Education",
    featured: false,
    weight: 53,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "cat-email-marketing",
    icon: "mail",
    name: "Email Marketing",
    featured: false,
    weight: 52,
    createdAt: now,
    updatedAt: now,
  },
];

function screenshot(url: string) {
  return `https://image.thum.io/get/width/900/crop/506/noanimate/${url}`;
}

function site(data: Partial<Site> & Pick<Site, "name" | "url" | "siteKey">): Site {
  return {
    _id: `seed-${data.siteKey}`,
    userId: "seed-user",
    featured: false,
    weight: 0,
    snapshot: screenshot(data.url),
    desceription: "",
    pricingType: "Freemium",
    categories: [],
    images: [],
    features: [],
    usecases: [],
    users: [],
    relatedSearchs: [],
    pricings: [],
    links: {
      pricing: `${data.url}/pricing`,
    },
    voteCount: 0,
    metaKeywords: [],
    metaDesceription: "",
    searchSuggestWords: [],
    state: SiteState.published,
    processStage: ProcessStage.success,
    createdAt: now,
    updatedAt: now,
    ...data,
  };
}

export const seedSites: Site[] = [
  site({
    siteKey: "perplexity",
    name: "Perplexity",
    url: "https://www.perplexity.ai",
    featured: true,
    weight: 120,
    voteCount: 428,
    desceription:
      "AI answer engine for research, cited search, and fast knowledge discovery.",
    categories: ["Artificial Intelligence", "Productivity"],
    features: ["Cited answers", "Research collections", "Follow-up search"],
    usecases: ["Market research", "Technical exploration", "Content briefs"],
  }),
  site({
    siteKey: "linear",
    name: "Linear",
    url: "https://linear.app",
    featured: true,
    weight: 110,
    voteCount: 386,
    desceription:
      "Issue tracking and product planning for software teams that care about speed.",
    categories: ["Productivity", "Developer Tools"],
    features: ["Fast issue tracking", "Roadmaps", "Git integrations"],
    usecases: ["Sprint planning", "Bug triage", "Product roadmaps"],
  }),
  site({
    siteKey: "supabase",
    name: "Supabase",
    url: "https://supabase.com",
    featured: true,
    weight: 100,
    voteCount: 352,
    desceription:
      "Open source backend platform with Postgres, auth, storage, realtime APIs, and edge functions.",
    categories: ["Developer Tools"],
    features: ["Hosted Postgres", "Authentication", "Storage"],
    usecases: ["SaaS backends", "MVP development", "Internal tools"],
  }),
  site({
    siteKey: "framer",
    name: "Framer",
    url: "https://www.framer.com",
    featured: true,
    weight: 95,
    voteCount: 214,
    desceription:
      "Visual website builder for teams designing and shipping polished marketing sites.",
    categories: ["Design", "Marketing"],
    features: ["Visual canvas", "CMS", "Animations"],
    usecases: ["Landing pages", "Portfolios", "Product websites"],
  }),
  site({
    siteKey: "plausible",
    name: "Plausible",
    url: "https://plausible.io",
    weight: 90,
    voteCount: 168,
    desceription:
      "Privacy-friendly website analytics with simple dashboards and lightweight tracking.",
    categories: ["Analytics", "Marketing"],
    features: ["Cookie-free analytics", "Goal tracking", "Public dashboards"],
    usecases: ["Website analytics", "Campaign reporting", "Privacy-first tracking"],
  }),
  site({
    siteKey: "resend",
    name: "Resend",
    url: "https://resend.com",
    weight: 86,
    voteCount: 156,
    desceription:
      "Email API for developers sending transactional and product emails.",
    categories: ["Developer Tools", "Marketing"],
    features: ["Email API", "React email support", "Domain management"],
    usecases: ["Transactional email", "Onboarding flows", "Product notifications"],
  }),
  site({
    siteKey: "raycast",
    name: "Raycast",
    url: "https://www.raycast.com",
    weight: 82,
    voteCount: 144,
    desceription:
      "Productivity launcher for macOS with extensions, AI, snippets, and workflow automation.",
    categories: ["Productivity"],
    features: ["Command launcher", "Extensions", "AI commands"],
    usecases: ["Daily workflows", "Team shortcuts", "Quick automation"],
  }),
  site({
    siteKey: "vercel",
    name: "Vercel",
    url: "https://vercel.com",
    weight: 78,
    voteCount: 133,
    desceription:
      "Frontend cloud platform for deploying, previewing, and scaling web applications.",
    categories: ["Developer Tools"],
    features: ["Preview deployments", "Edge network", "Analytics"],
    usecases: ["Next.js hosting", "Frontend deployments", "SaaS websites"],
  }),
  site({
    siteKey: "posthog",
    name: "PostHog",
    url: "https://posthog.com",
    weight: 74,
    voteCount: 121,
    desceription:
      "Open source product analytics suite with events, feature flags, experiments, and session replay.",
    categories: ["Analytics", "Developer Tools"],
    features: ["Product analytics", "Feature flags", "Session replay"],
    usecases: ["Product analytics", "Experimentation", "User behavior research"],
  }),
  site({
    siteKey: "tally",
    name: "Tally",
    url: "https://tally.so",
    weight: 70,
    voteCount: 117,
    desceription:
      "Simple form builder for surveys, lead capture, applications, and internal workflows.",
    categories: ["Productivity", "Marketing"],
    features: ["No-code forms", "Conditional logic", "Embeds"],
    usecases: ["Lead forms", "Surveys", "Submission workflows"],
  }),
  site({
    siteKey: "figma",
    name: "Figma",
    url: "https://www.figma.com",
    weight: 66,
    voteCount: 108,
    desceription:
      "Collaborative design platform for UI design, prototyping, whiteboarding, and design systems.",
    categories: ["Design"],
    features: ["Realtime collaboration", "Prototyping", "Design systems"],
    usecases: ["Product design", "UX workflows", "Team design systems"],
  }),
  site({
    siteKey: "ahrefs",
    name: "Ahrefs",
    url: "https://ahrefs.com",
    weight: 62,
    voteCount: 97,
    desceription:
      "SEO platform for keyword research, competitor analysis, backlinks, and content opportunities.",
    categories: ["Marketing", "Analytics"],
    features: ["Keyword research", "Site audit", "Backlink analysis"],
    usecases: ["SEO research", "Content planning", "Competitor analysis"],
  }),
];

export function searchSeedSites({
  search,
  page,
  category,
  pageSize = 24,
}: {
  search: string;
  page: number;
  category: string;
  pageSize?: number;
}) {
  const query = search.trim().toLowerCase();
  const filtered = seedSites.filter((tool) => {
    const categoryMatch = !category || tool.categories.includes(category);
    const searchMatch =
      !query ||
      [tool.name, tool.desceription, tool.siteKey, ...tool.categories]
        .join(" ")
        .toLowerCase()
        .includes(query);

    return categoryMatch && searchMatch;
  });

  return {
    page,
    sites: filtered.slice((page - 1) * pageSize, page * pageSize),
    hasNext: filtered.length > page * pageSize,
  };
}
