import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { BlockList } from "node:net";

export const runtime = "nodejs";
const privateNetworks = new BlockList();
for (const [address, prefix] of [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4]] as const) privateNetworks.addSubnet(address, prefix, "ipv4");
const MAX_BYTES = 5 * 1024 * 1024;

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams.get("url");
  if (!input) return new NextResponse("Missing url parameter", { status: 400 });
  let destination: URL;
  try { destination = new URL(input); } catch { return new NextResponse("Invalid URL", { status: 400 }); }
  try {
    for (let redirects = 0; redirects <= 5; redirects++) {
      if (!["http:", "https:"].includes(destination.protocol) || destination.username || destination.password || (destination.port && !["80", "443"].includes(destination.port))) return new NextResponse("Unsupported destination", { status: 400 });
      // Resolve once and pin the validated public IPv4 address to the connection.
      // IPv6-only destinations are rejected rather than allowing ambiguous mapped/private ranges.
      const addresses = await lookup(destination.hostname, { all: true, family: 4 });
      if (!addresses.length || addresses.some(({ address }) => privateNetworks.check(address, "ipv4"))) return new NextResponse("Private network destinations are not permitted", { status: 403 });
      const { promise, resolve, reject } = Promise.withResolvers<{ status: number; contentType: string; location?: string; body: Buffer }>();
      const upstream = (destination.protocol === "https:" ? httpsRequest : httpRequest)(destination, {
        headers: { "User-Agent": "OpenBSD-Portfolio/0.2", Accept: "*/*", "Accept-Encoding": "identity" },
        lookup: (_hostname, _options, callback) => callback(null, addresses[0].address, 4),
        signal: AbortSignal.timeout(8000),
      }, (response) => {
        const chunks: Buffer[] = [];
        let size = 0;
        response.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BYTES) response.destroy(new Error("Response exceeds size limit"));
          else chunks.push(chunk);
        });
        response.on("error", reject);
        response.on("end", () => resolve({ status: response.statusCode ?? 502, contentType: response.headers["content-type"] ?? "application/octet-stream", location: response.headers.location, body: Buffer.concat(chunks) }));
      });
      upstream.on("error", reject);
      upstream.end();
      const result = await promise;
      if ([301, 302, 303, 307, 308].includes(result.status) && result.location) {
        destination = new URL(result.location, destination);
        continue;
      }
      const headers = new Headers({ "Content-Type": result.contentType, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox allow-scripts allow-forms allow-popups; frame-ancestors 'self'", "Referrer-Policy": "no-referrer" });
      if ([204, 205, 304].includes(result.status)) return new NextResponse(null, { status: result.status, headers });
      if (/^(text\/html|application\/xhtml\+xml)/i.test(result.contentType)) {
        let html = result.body.toString("utf8");
        const escapedUrl = destination.href.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        if (!/<base\b/i.test(html)) {
          const base = `<base href="${escapedUrl}">`;
          html = /<head\b[^>]*>/i.test(html) ? html.replace(/<head\b[^>]*>/i, (head) => head + base) : base + html;
        }
        return new NextResponse(html, { status: result.status, headers });
      }
      return new NextResponse(new Uint8Array(result.body), { status: result.status, headers });
    }
    return new NextResponse("Too many redirects", { status: 502 });
  } catch {
    return new NextResponse("Unable to retrieve this public URL (unavailable, timed out, or too large).", { status: 502, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  }
}
