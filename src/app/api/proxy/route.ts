import { NextResponse } from "next/server";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { PORTFOLIO_DATA } from "@/lib/portfolio-data";

function generateGitHubHtml(url: string): string {
  return `<!DOCTYPE html>
<html lang="en" data-color-mode="dark" data-dark-theme="dark">
<head>
  <meta charset="utf-8">
  <title>AtulPahal (Atul Pahal) · GitHub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0d1117;
      color: #c9d1d9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    header {
      background-color: #161b22;
      border-bottom: 1px solid #30363d;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo-area { display: flex; align-items: center; gap: 12px; font-weight: 600; color: #f0f6fc; }
    .logo { width: 24px; height: 24px; fill: #f0f6fc; }
    .external-btn {
      background-color: #238636;
      color: #ffffff;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .external-btn:hover { background-color: #2ea043; text-decoration: none; }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 32px;
    }
    .profile-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .avatar {
      width: 260px;
      height: 260px;
      border-radius: 50%;
      background-color: #21262d;
      border: 1px solid #30363d;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 72px;
      color: #8b949e;
    }
    .name-heading h1 { font-size: 24px; font-weight: 600; color: #f0f6fc; }
    .name-heading h2 { font-size: 18px; font-weight: 300; color: #8b949e; }
    .bio { font-size: 14px; color: #c9d1d9; }
    .meta-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #8b949e; }
    .main-content { display: flex; flex-direction: column; gap: 24px; }
    .tabs {
      display: flex;
      gap: 16px;
      border-bottom: 1px solid #30363d;
      padding-bottom: 8px;
    }
    .tab {
      padding: 8px 12px;
      font-weight: 600;
      color: #8b949e;
      border-bottom: 2px solid transparent;
    }
    .tab.active { color: #f0f6fc; border-color: #f78166; }
    .pins-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .pin-card {
      background-color: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
    }
    .pin-title { font-weight: 600; font-size: 14px; color: #58a6ff; }
    .pin-desc { font-size: 12px; color: #8b949e; }
    .pin-tags { display: flex; gap: 8px; font-size: 11px; color: #8b949e; }
    .lang-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  </style>
</head>
<body>
  <header>
    <div class="logo-area">
      <svg class="logo" viewBox="0 0 16 16"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
      <span>GitHub</span>
    </div>
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="external-btn">
      Open on GitHub.com ↗
    </a>
  </header>

  <div class="container">
    <div class="profile-card">
      <div class="avatar">👨‍💻</div>
      <div class="name-heading">
        <h1>${PORTFOLIO_DATA.name}</h1>
        <h2>AtulPahal</h2>
      </div>
      <div class="bio">${PORTFOLIO_DATA.bio}</div>
      <div class="meta-item">📍 ${PORTFOLIO_DATA.location}</div>
      <div class="meta-item">✉️ ${PORTFOLIO_DATA.email}</div>
      <div class="meta-item">🔗 <a href="${url}" target="_blank">${url}</a></div>
    </div>

    <div class="main-content">
      <div class="tabs">
        <div class="tab active">Overview</div>
        <div class="tab">Repositories (${PORTFOLIO_DATA.projects.length})</div>
        <div class="tab">Projects</div>
        <div class="tab">Stars</div>
      </div>

      <div style="font-weight: 600; font-size: 12px; color: #8b949e;">Pinned Repositories</div>

      <div class="pins-grid">
        ${PORTFOLIO_DATA.projects
          .map(
            (p) => `
          <div class="pin-card">
            <div>
              <div class="pin-title">${p.title}</div>
              <div class="pin-desc">${p.description}</div>
            </div>
            <div class="pin-tags">
              <span><span class="lang-dot" style="background-color: #3178c6;"></span> ${p.stack.join(" · ")}</span>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Check if requesting GitHub profile URL
  if (targetUrl.toLowerCase().includes("github.com")) {
    return new NextResponse(generateGitHubHtml(targetUrl), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": SYSTEM_CONFIG.userAgent,
      },
    });

    let body = await res.text();

    const headers = new Headers(res.headers);
    // Strip security headers that prevent embedding
    headers.delete("x-frame-options");
    headers.delete("content-security-policy");
    headers.delete("content-security-policy-report-only");
    headers.delete("x-content-security-policy");

    // Inject base tag to fix relative paths for assets/links
    const baseTag = `<base href="${new URL(targetUrl).href}">`;
    if (body.includes("<head>")) {
      body = body.replace("<head>", `<head>${baseTag}`);
    } else {
      body = `${baseTag}${body}`;
    }

    return new NextResponse(body, {
      status: res.status,
      headers,
    });
  } catch {
    // If fetching external site fails, serve the custom HTML template
    return new NextResponse(generateGitHubHtml(targetUrl), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
