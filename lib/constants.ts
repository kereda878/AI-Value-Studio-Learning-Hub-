export const CATEGORIES = [
  "AI & Automation",
  "Leadership",
  "Finance",
  "Operations",
  "Technology",
  "Strategy",
  "People & Culture",
  "Client Delivery",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  "AI & Automation": "#D4956A",
  "Leadership":      "#C87E9A",
  "Finance":         "#DCB464",
  "Operations":      "#7EC8C8",
  "Technology":      "#7EA3CC",
  "Strategy":        "#B07EC8",
  "People & Culture":"#C8A07E",
  "Client Delivery": "#7EC895",
  "Other":           "#A0A0A0",
};

export const CATEGORY_COLOR_DEFAULT = "#A0A0A0";

export const APP_NAME = "Genpact Bookshelf";
export const APP_TAGLINE = "Genpact — Empowering Learning";

export const MORNING_BREW_MAX_ARTICLES = 3;
export const RECENT_ARTICLES_LIMIT = 20;
export const RECOMMENDATIONS_LIMIT = 3;
export const READ_HISTORY_LIMIT = 10;
