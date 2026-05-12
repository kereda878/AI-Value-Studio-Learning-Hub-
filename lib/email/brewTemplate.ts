import type { Article, MorningBrew } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_COLOR_DEFAULT } from "@/lib/constants";
import type { Category } from "@/lib/constants";

interface BrewEmailOptions {
  brew: MorningBrew;
  articles: Article[];
  appUrl: string;
  trackingPixelUrl: string;
  unsubscribeUrl: string;
}

function categoryColor(cat: string | null): string {
  return cat ? (CATEGORY_COLORS[cat as Category] ?? CATEGORY_COLOR_DEFAULT) : CATEGORY_COLOR_DEFAULT;
}

function formatBrewDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function articleCard(article: Article, appUrl: string): string {
  const color = categoryColor(article.category);
  const imageHtml = article.image_url
    ? `<img src="${article.image_url}" alt="" width="80" height="80"
         style="width:80px;height:80px;border-radius:8px;object-fit:cover;display:block;" />`
    : `<div style="width:80px;height:80px;border-radius:8px;background:#1E1E1E;border:1px solid rgba(255,255,255,0.06);flex-shrink:0;"></div>`;

  const summary = article.ai_summary || article.summary || "";

  return `
  <tr>
    <td style="padding:0 0 16px 0;">
      <table cellpadding="0" cellspacing="0" width="100%"
             style="background:#1A1A1A;border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:16px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="80" valign="top" style="padding-right:14px;">
                  ${imageHtml}
                </td>
                <td valign="top">
                  ${article.category ? `
                  <div style="margin-bottom:6px;">
                    <span style="font-size:10px;font-weight:600;color:${color};background:${color}1A;
                                 border:1px solid ${color}33;padding:2px 8px;border-radius:20px;
                                 text-transform:uppercase;letter-spacing:0.05em;">
                      ${article.category}
                    </span>
                  </div>` : ""}
                  <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#FFFFFF;line-height:1.35;">
                    ${article.title}
                  </p>
                  ${summary ? `
                  <p style="margin:0 0 10px;font-size:13px;color:#8A8A8A;line-height:1.55;">
                    ${summary.length > 180 ? summary.slice(0, 177) + "…" : summary}
                  </p>` : ""}
                  <div style="display:flex;align-items:center;gap:10px;">
                    ${article.source ? `
                    <span style="font-size:11px;color:#5A5A5A;">${article.source}</span>
                    <span style="font-size:11px;color:#3A3A3A;">·</span>` : ""}
                    <a href="${appUrl}/articles/${article.id}"
                       style="font-size:12px;font-weight:600;color:#F45B69;text-decoration:none;">
                      Read on Bookshelf →
                    </a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export function buildBrewEmail(opts: BrewEmailOptions): string {
  const { brew, articles, appUrl, trackingPixelUrl, unsubscribeUrl } = opts;
  const dateLabel = formatBrewDate(brew.brew_date);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <title>Genpact Bookshelf — Morning Brew</title>
</head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <table cellpadding="0" cellspacing="0" width="100%" style="background:#0D0D0D;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Card -->
        <table cellpadding="0" cellspacing="0" width="600"
               style="max-width:600px;width:100%;background:#111111;border-radius:20px;
                      border:1px solid rgba(255,255,255,0.07);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(244,91,105,0.18) 0%,rgba(212,149,106,0.12) 100%);
                       border-bottom:1px solid rgba(255,255,255,0.07);padding:28px 28px 24px;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background:rgba(244,91,105,0.2);
                                   border:1px solid rgba(244,91,105,0.35);border-radius:10px;
                                   text-align:center;vertical-align:middle;padding-right:10px;">
                          <span style="font-size:16px;line-height:32px;">📖</span>
                        </td>
                        <td style="padding-left:10px;">
                          <span style="font-size:16px;font-weight:800;color:#FFFFFF;letter-spacing:-0.3px;">
                            Genpact Bookshelf
                          </span>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:10px 0 0;font-size:22px;font-weight:700;color:#F45B69;letter-spacing:-0.4px;">
                      Morning Brew ☕
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;color:#6A6A6A;">${dateLabel}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 28px;">

              ${brew.ai_intro ? `
              <!-- AI Intro -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#1E1A14;border:1px solid rgba(212,149,106,0.2);
                             border-radius:12px;padding:16px 18px;">
                    <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#D4956A;
                               text-transform:uppercase;letter-spacing:0.08em;">✨ Today's Theme</p>
                    <p style="margin:0;font-size:14px;color:#C0A880;line-height:1.6;">${brew.ai_intro}</p>
                  </td>
                </tr>
              </table>` : ""}

              <!-- Articles -->
              <table cellpadding="0" cellspacing="0" width="100%">
                ${articles.map((a) => articleCard(a, appUrl)).join("")}
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.06);padding:20px 28px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#4A4A4A;">
                You're receiving this because you opted in to the daily Genpact Bookshelf digest.
              </p>
              <p style="margin:0;font-size:12px;">
                <a href="${unsubscribeUrl}"
                   style="color:#5A5A5A;text-decoration:underline;">Unsubscribe</a>
                <span style="color:#3A3A3A;margin:0 8px;">·</span>
                <a href="${appUrl}"
                   style="color:#5A5A5A;text-decoration:underline;">Open app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <!-- 1×1 tracking pixel -->
  <img src="${trackingPixelUrl}" width="1" height="1" alt=""
       style="display:none;width:1px;height:1px;border:0;" />

</body>
</html>`;
}
