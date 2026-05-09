import type { Article, ArticleSuggestion, MorningBrew, Profile } from "@/lib/types";

export const DEMO_USER_ID = "demo-user-00000000-0000-0000-0000-000000000001";

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  email: "demo@genpact.com",
  full_name: "Demo Admin",
  avatar_url: null,
  role: "admin",
  created_at: new Date().toISOString(),
};

export const DEMO_ARTICLES: Article[] = [
  {
    id: "demo-art-0000-0000-0000-000000000001",
    title: "The AI-First Enterprise: How Leading Companies Are Restructuring for Generative AI",
    summary: "An in-depth look at how Fortune 500 companies are embedding AI into their core operating models.",
    ai_summary: "Leading enterprises are moving beyond AI pilots to full-scale transformation — restructuring teams, processes, and technology stacks around generative AI. The article examines the operating model shifts required to become truly AI-first and the cultural changes that must accompany them.",
    content: `The question is no longer whether to adopt generative AI, but how fast and how deeply to embed it into every layer of the enterprise.

The companies pulling ahead aren't running pilots — they're restructuring. They're reorganizing teams around AI capabilities, rewriting job descriptions, and building internal "AI factories" that continuously produce and deploy new models.

Three patterns emerge among the leaders: first, they appoint AI transformation officers with true P&L accountability. Second, they invest heavily in data infrastructure before deploying models. Third, they treat AI literacy as a core competency for every employee, not just technologists.

For operations-intensive businesses like Genpact's clients, the opportunity is particularly acute. Intelligent automation of transactional work can unlock 30-40% capacity — but only if leaders are willing to redesign processes end-to-end rather than layering AI on top of broken workflows.`,
    url: "https://hbr.org/ai-first-enterprise",
    image_url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop",
    category: "AI & Automation",
    tags: ["Generative AI", "Transformation"],
    source: "Harvard Business Review",
    author: "Andrew McAfee",
    ai_tags: ["Operating Model", "Enterprise AI", "Change Management"],
    is_featured: true,
    status: "published" as const,
    suggested_by_ai: false,
    read_count: 142,
    created_by: DEMO_USER_ID,
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-art-0000-0000-0000-000000000002",
    title: "From Cost Center to Value Driver: Reimagining Finance in the Age of AI",
    summary: "How AI-powered automation is reshaping the finance function from transaction processing to strategic advisory.",
    ai_summary: "Finance organizations embracing AI automation for transactional work are freeing capacity to become true strategic partners. This piece outlines the CFO roadmap from cost center to value driver — with practical steps and real-world examples from global enterprises.",
    content: `For decades, finance has been defined by its role as the keeper of the books. That definition is changing — fast.

AI-powered automation is handling the reconciliations, the close processes, the variance analyses. What's left for finance professionals is the work that actually requires judgment: scenario modeling, capital allocation, strategic partnering with the business.

The CFOs leading this transition share a common playbook. They start by automating the highest-volume, lowest-judgment work first — invoice processing, account reconciliation, regulatory reporting. This creates immediate ROI and builds organizational confidence in AI.

Then they reinvest the liberated capacity into FP&A, business partnering, and M&A support. Finance teams that once spent 80% of their time on transaction processing now spend 60% on analysis and advice.

The transformation isn't painless. It requires reskilling, new tooling, and — most critically — a shift in identity. Finance leaders must help their teams see themselves as analysts and advisors, not accountants.`,
    url: "https://mckinsey.com/finance-ai-value",
    image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop",
    category: "Finance",
    tags: ["CFO", "Finance Transformation"],
    source: "McKinsey & Company",
    author: "Mihir Desai",
    ai_tags: ["Automation", "Strategic Finance", "AI"],
    is_featured: false,
    status: "published" as const,
    suggested_by_ai: false,
    read_count: 87,
    created_by: DEMO_USER_ID,
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-art-0000-0000-0000-000000000003",
    title: "Leading Through Ambiguity: The New Leadership Playbook for 2026",
    summary: "What distinguishes the most effective leaders in periods of rapid technological and geopolitical change.",
    ai_summary: "The leaders who thrive today share three traits: comfort with incomplete information, ability to mobilize coalitions quickly, and a bias toward learning over certainty. This article breaks down the new leadership playbook with case studies from global enterprises navigating AI disruption.",
    content: `The old leadership playbook — set a clear vision, build a detailed plan, execute consistently — was built for a more predictable world. That world is gone.

Today's most effective leaders have learned to lead in fog. They make decisions with 60% of the information they'd like, adjust course faster than their organizations are comfortable with, and create psychological safety for their teams to do the same.

Research across 200 global executives in the past 18 months reveals three distinguishing behaviors. First, they separate reversible from irreversible decisions — moving fast on the former, slow and deliberate on the latter. Second, they invest heavily in sensing networks: diverse information sources, dissenting voices, and front-line feedback loops. Third, they are explicit about uncertainty with their teams rather than projecting false confidence.

For leaders in AI-intensive industries, there's an additional skill: knowing when to trust the model and when to override it. The best leaders are developing sophisticated intuition about AI's blind spots — and building organizations that can course-correct when AI gets it wrong.`,
    url: "https://strategy-business.com/leadership-2026",
    image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop",
    category: "Leadership",
    tags: ["Leadership", "Change Management"],
    source: "Strategy+Business",
    author: "Roger Martin",
    ai_tags: ["Executive", "Ambiguity", "Decision-Making"],
    is_featured: false,
    status: "published" as const,
    suggested_by_ai: false,
    read_count: 64,
    created_by: DEMO_USER_ID,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-art-0000-0000-0000-000000000004",
    title: "Agentic AI in Enterprise Operations: Moving from Demo to Deployment",
    summary: "The gap between AI agent demonstrations and production deployments — and how to close it.",
    ai_summary: "Most enterprise AI agent projects stall between proof-of-concept and production. This article identifies the five most common deployment blockers — data access, security, change management, governance, and integration — and provides a practical framework for overcoming each one.",
    content: `Every enterprise has seen the demo. The AI agent seamlessly navigates a complex workflow, makes smart decisions, hands off to humans at exactly the right moment. The audience is impressed. The pilot is approved.

Six months later, the project is stuck. Sound familiar?

The gap between AI agent demos and production deployment is the defining challenge of enterprise AI right now. After analyzing 40 enterprise agentic AI deployments across industries, five blockers emerge with remarkable consistency.

Data access is the first and most common. Agents need clean, real-time data to act — and most enterprises' data infrastructure wasn't built for that. The fix is often less about AI and more about data engineering.

Security and compliance is the second blocker. Agents that can take actions on behalf of users raise new questions about authorization, audit trails, and liability. Companies that solve this build dedicated "agent security" frameworks before scaling.

The other three blockers — change management, governance, and integration complexity — are equally important but more solvable with the right organizational scaffolding.

The enterprises that have successfully scaled agentic AI share one trait: they treated deployment as a product discipline, not an IT project.`,
    url: "https://gartner.com/agentic-ai-deployment",
    image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop",
    category: "AI & Automation",
    tags: ["Agentic AI", "Deployment"],
    source: "Gartner Research",
    author: "Erick Brethenoux",
    ai_tags: ["Enterprise AI", "Operations", "Governance"],
    is_featured: true,
    status: "published" as const,
    suggested_by_ai: false,
    read_count: 201,
    created_by: DEMO_USER_ID,
    published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-art-0000-0000-0000-000000000005",
    title: "Building High-Performance Distributed Teams: Lessons from Global Operations Leaders",
    summary: "Research-backed practices for leading geographically distributed teams to peak performance.",
    ai_summary: "Organizations with globally distributed workforces outperform on delivery when they invest in structured async communication, trust-building rituals, and deliberate career development at a distance. A study of 200 global teams reveals what actually separates high performers from the rest.",
    content: `Managing a distributed team across time zones, cultures, and languages is one of the hardest things a leader can do well. Most don't.

The research is clear: distributed teams underperform co-located teams on coordination and trust — but outperform them on diversity of thought, resilience, and access to talent. The question isn't whether to build distributed teams, but how to unlock their upside while minimizing the coordination costs.

Three practices consistently distinguish high-performing distributed teams. First, they treat asynchronous communication as a first-class discipline. Written updates, recorded context, and documented decisions aren't bureaucracy — they're the connective tissue that replaces hallway conversations.

Second, they invest disproportionately in in-person moments. Counter-intuitively, the highest-performing distributed teams meet face-to-face more often than average — but they're intentional about when and why. Team launches, major pivots, and culture-building moments are worth the travel budget.

Third, they build career development infrastructure that works at a distance. Sponsorship, visibility, and growth conversations don't happen organically on distributed teams — they must be designed in.

For Genpact, where delivery teams span Hyderabad, Warsaw, and Guadalajara, these lessons are directly applicable.`,
    url: "https://deloitte.com/distributed-teams",
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop",
    category: "People & Culture",
    tags: ["Remote Work", "Team Performance"],
    source: "Deloitte Insights",
    author: "Erica Volini",
    ai_tags: ["Culture", "Distributed Teams", "Leadership"],
    is_featured: false,
    status: "published" as const,
    suggested_by_ai: false,
    read_count: 53,
    created_by: DEMO_USER_ID,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_PENDING_ARTICLES: Article[] = [
  {
    id: "demo-pending-0000-0000-0000-000000000001",
    title: "The Talent Equation: Why AI Skills Are Now the Most Valuable Currency in Enterprise Hiring",
    summary: "New research reveals the premium companies are paying for AI-literate talent across every function.",
    ai_summary: "Organizations are paying 20-35% salary premiums for employees who can work effectively alongside AI systems. This piece examines what AI literacy actually means in practice across finance, operations, and technology roles, and how companies are building it internally.",
    content: null,
    url: "https://weforum.org/ai-talent-premium-2026",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
    category: "People & Culture",
    tags: ["Talent", "AI Skills", "Future of Work"],
    source: "World Economic Forum",
    author: "Saadia Zahidi",
    ai_tags: ["Hiring", "AI Literacy", "Compensation"],
    is_featured: false,
    status: "pending" as const,
    suggested_by_ai: false,
    read_count: 0,
    created_by: DEMO_USER_ID,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-pending-0000-0000-0000-000000000002",
    title: "Process Intelligence: The Missing Layer in Enterprise AI Deployments",
    summary: "Why AI initiatives fail without first mapping and optimizing the processes they're meant to transform.",
    ai_summary: "Process intelligence — the discipline of understanding how work actually flows before automating it — is emerging as the critical missing ingredient in most AI deployments. Companies that invest in process mining before AI see 3x higher ROI on automation projects.",
    content: null,
    url: "https://forrester.com/process-intelligence-ai",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
    category: "Operations",
    tags: ["Process Mining", "Automation", "Operations"],
    source: "Forrester Research",
    author: "Craig Le Clair",
    ai_tags: ["Process Intelligence", "Automation ROI", "Digital Operations"],
    is_featured: false,
    status: "pending" as const,
    suggested_by_ai: true,
    read_count: 0,
    created_by: DEMO_USER_ID,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-pending-0000-0000-0000-000000000003",
    title: "Data Governance in the Age of Generative AI: A Practical Framework",
    summary: "As GenAI proliferates across the enterprise, data governance is no longer optional — it's existential.",
    ai_summary: "Enterprises deploying generative AI without robust data governance frameworks are accumulating hidden risk. This practical guide outlines the five pillars of AI-ready data governance and how leading organizations are implementing them without slowing innovation.",
    content: null,
    url: "https://gartner.com/data-governance-genai",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop",
    category: "Data & Analytics",
    tags: ["Data Governance", "GenAI", "Compliance"],
    source: "Gartner",
    author: "Alan D. Duncan",
    ai_tags: ["Data Quality", "AI Risk", "Governance"],
    is_featured: false,
    status: "pending" as const,
    suggested_by_ai: true,
    read_count: 0,
    created_by: DEMO_USER_ID,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

export const DEMO_AI_SUGGESTIONS: ArticleSuggestion[] = [
  {
    id: "sug-001",
    title: "How CFOs Are Using AI Agents to Close the Books in Hours, Not Days",
    source: "CFO Magazine",
    category: "Finance",
    summary: "AI-powered financial close automation is cutting month-end close cycles from weeks to hours at leading enterprises. Explores the technology stack, change management approach, and measurable outcomes.",
    search_hint: "AI agents financial close automation CFO 2025 2026",
  },
  {
    id: "sug-002",
    title: "The Responsible AI Playbook: How Global Companies Are Building Ethical AI Programs",
    source: "MIT Sloan Management Review",
    category: "AI & Automation",
    summary: "As AI capabilities expand, governance and ethics programs are becoming competitive differentiators. This piece outlines the frameworks that leading multinationals are using to ensure AI is deployed responsibly.",
    search_hint: "responsible AI governance program enterprise ethics MIT Sloan",
  },
  {
    id: "sug-003",
    title: "Supply Chain Resilience in 2026: The Role of Predictive AI",
    source: "McKinsey & Company",
    category: "Operations",
    summary: "Predictive AI is transforming supply chain risk management from reactive to proactive. Companies using AI-powered demand forecasting are reducing inventory costs 20-30% while improving service levels.",
    search_hint: "supply chain AI predictive analytics resilience McKinsey 2026",
  },
  {
    id: "sug-004",
    title: "Why the Best Leaders Are Becoming 'AI Translators' for Their Organizations",
    source: "Harvard Business Review",
    category: "Leadership",
    summary: "The highest-value leadership skill emerging in 2026 is the ability to bridge AI capability and business application — translating technical possibilities into strategic decisions that non-technical stakeholders can act on.",
    search_hint: "AI leadership translator business HBR executive 2026",
  },
  {
    id: "sug-005",
    title: "The New ROI of Learning: How L&D Is Proving Its Value in the AI Era",
    source: "Deloitte Insights",
    category: "People & Culture",
    summary: "Learning & development programs are under pressure to demonstrate measurable business impact. New frameworks connect skill development directly to productivity gains, retention, and AI adoption velocity.",
    search_hint: "L&D ROI AI era learning development Deloitte 2026",
  },
  {
    id: "sug-006",
    title: "Cloud FinOps at Scale: Taming the Cost of Enterprise AI Infrastructure",
    source: "Forrester Research",
    category: "Technology",
    summary: "AI workloads are driving unexpected cloud cost explosions at enterprises. FinOps practices — combining finance, engineering, and operations — are emerging as the discipline that keeps AI investments profitable.",
    search_hint: "cloud FinOps AI infrastructure cost management enterprise Forrester",
  },
];

export const DEMO_BREW: MorningBrew = {
  id: "demo-brew-0000-0000-0000-000000000001",
  brew_date: new Date().toISOString().split("T")[0],
  article_ids: [
    "demo-art-0000-0000-0000-000000000001",
    "demo-art-0000-0000-0000-000000000004",
    "demo-art-0000-0000-0000-000000000002",
  ],
  ai_intro: "Good morning! Today's brew explores the forces reshaping enterprise work: AI that moves from pilot to production, finance teams reinventing their purpose, and the transformational leap to becoming an AI-first organization. Three perspectives, one clear message — the window for bold action is now.",
  theme: "From Pilot to Production",
  created_at: new Date().toISOString(),
  articles: [
    DEMO_ARTICLES[0],
    DEMO_ARTICLES[3],
    DEMO_ARTICLES[1],
  ],
};
