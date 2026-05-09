-- ============================================================
-- Genpact Knowledge Hub — Seed Data (Development Only)
-- Run this after schema.sql and functions.sql to get started
-- ============================================================

-- Insert sample articles
INSERT INTO public.articles (title, summary, ai_summary, url, category, tags, source, author, is_featured, published_at)
VALUES
(
  'The AI-First Enterprise: How Leading Companies Are Restructuring for Generative AI',
  'An in-depth look at how Fortune 500 companies are embedding AI into their core operating models.',
  'Leading enterprises are moving beyond AI pilots to full-scale transformation — restructuring teams, processes, and technology stacks around generative AI capabilities. This article examines the operating model shifts and cultural changes required to become truly AI-first.',
  'https://hbr.org/ai-first-enterprise',
  'AI & Automation',
  ARRAY['Generative AI', 'Operating Model', 'Transformation'],
  'Harvard Business Review',
  'Andrew McAfee',
  true,
  NOW() - INTERVAL '1 day'
),
(
  'From Cost Center to Value Driver: Reimagining Finance in the Age of AI',
  'How AI-powered automation is reshaping the finance function from transaction processing to strategic advisory.',
  'Finance organizations that embrace AI automation for transactional work are freeing up capacity to become true strategic partners to the business. This piece outlines the roadmap from cost center to value driver, with practical steps for CFOs leading the transformation.',
  'https://mckinsey.com/finance-ai-value',
  'Finance',
  ARRAY['CFO', 'Finance Transformation', 'Automation'],
  'McKinsey & Company',
  'Mihir Desai',
  false,
  NOW() - INTERVAL '2 days'
),
(
  'Leading Through Ambiguity: The New Leadership Playbook for 2026',
  'What distinguishes the most effective leaders in periods of rapid technological and geopolitical change.',
  'The leaders who thrive in today''s environment share three traits: comfort with incomplete information, ability to mobilize coalitions quickly, and a bias toward learning over certainty. This article breaks down the new leadership playbook with case studies from global enterprises.',
  'https://strategy-business.com/leadership-2026',
  'Leadership',
  ARRAY['Leadership', 'Change Management', 'Executive'],
  'Strategy+Business',
  'Roger Martin',
  false,
  NOW() - INTERVAL '3 days'
),
(
  'Agentic AI in Enterprise Operations: Moving from Demo to Deployment',
  'The gap between AI agent demonstrations and production deployments — and how to close it.',
  'Most enterprise AI agent projects stall between proof-of-concept and production. This article identifies the five most common deployment blockers — data access, security, change management, governance, and integration — and provides a framework for overcoming each.',
  'https://gartner.com/agentic-ai-deployment',
  'AI & Automation',
  ARRAY['Agentic AI', 'Deployment', 'Enterprise AI'],
  'Gartner Research',
  'Erick Brethenoux',
  true,
  NOW() - INTERVAL '4 days'
),
(
  'Building High-Performance Distributed Teams: Lessons from Global Operations Leaders',
  'Research-backed practices for leading geographically distributed teams to peak performance.',
  'Organizations with globally distributed workforces outperform on delivery when they invest in three areas: structured async communication, trust-building rituals, and deliberate career development at a distance. This study of 200 global teams reveals what actually works.',
  'https://deloitte.com/distributed-teams',
  'People & Culture',
  ARRAY['Remote Work', 'Team Performance', 'Culture'],
  'Deloitte Insights',
  'Erica Volini',
  false,
  NOW() - INTERVAL '5 days'
);

-- ============================================================
-- To use as today's Morning Brew:
-- 1. Get two article IDs from the articles table
-- 2. Run:
--    INSERT INTO public.morning_brew (brew_date, article_ids, ai_intro, theme)
--    VALUES (CURRENT_DATE, ARRAY['<id1>', '<id2>']::UUID[], 'Your intro...', 'Your theme');
-- ============================================================
