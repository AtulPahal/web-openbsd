import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
    // We use the full targetUrl so that relative paths like "style.css" resolve to "https://target.com/path/style.css"
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
  } catch (error) {
    return new NextResponse("Failed to fetch the URL", { status: 500 });
  }
}
