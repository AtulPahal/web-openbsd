import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    let body = await res.text();

    const headers = new Headers(res.headers);
    headers.delete("x-frame-options");
    headers.delete("content-security-policy");
    headers.delete("content-security-policy-report-only");
    headers.delete("x-content-security-policy");
    headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

    // Inject base tag so relative assets/links resolve to the live website origin
    const baseTag = `<base href="${parsedUrl.origin}/">`;
    if (body.includes("<head>")) {
      body = body.replace("<head>", `<head>${baseTag}`);
    } else if (body.includes("<HEAD>")) {
      body = body.replace("<HEAD>", `<HEAD>${baseTag}`);
    } else {
      body = `${baseTag}${body}`;
    }

    return new NextResponse(body, {
      status: res.status,
      headers,
    });
  } catch (err) {
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head><title>Proxy Error</title></head>
<body style="font-family: sans-serif; padding: 32px; background: #0d1117; color: #c9d1d9; text-align: center;">
  <h2>Failed to connect to ${targetUrl}</h2>
  <p style="margin-top: 12px; color: #8b949e;">${String(err)}</p>
  <p style="margin-top: 16px;"><a href="${targetUrl}" target="_blank" style="color: #58a6ff;">Open ${targetUrl} in New Tab ↗</a></p>
</body>
</html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
