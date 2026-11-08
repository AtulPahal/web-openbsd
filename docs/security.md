# Security & Proxy Architecture

Documentation of the security model, SSRF protection mechanisms, content security policies, and iframe sandboxing implemented in `src/app/api/proxy/route.ts` and `src/components/apps/firefox.tsx`.

---

## 1. Threat Model & Overview

The desktop environment allows users to navigate the web via an embedded browser app (Firefox) and test HTTP requests. Because this requires server-side fetching of remote web pages to strip `X-Frame-Options` and inject `<base>` tags, a proxy endpoint (`/api/proxy`) is required.

Without strict security defenses, web proxies present severe attack vectors:
1. **Server-Side Request Forgery (SSRF)**: Attackers requesting internal LAN endpoints (`http://192.168.1.1`), loopback services (`http://127.0.0.1:3000`), or cloud metadata services (`http://169.254.169.254`).
2. **DNS Rebinding & Redirect Smuggling**: A hostname resolving to a public IP on first check, but redirecting to an internal IP.
3. **Cross-Site Scripting (XSS) on Desktop Origin**: Untrusted remote HTML executing on `localhost:3000` with full access to `localStorage`, session state, and parent DOM APIs.
4. **Denial of Service (DoS)**: Streaming gigabytes of binary data into memory.

---

## 2. SSRF Protection Architecture (`src/app/api/proxy/route.ts`)

### Subnet Blacklisting via Node `BlockList`
The proxy maintains a compiled IPv4 `BlockList` containing all non-routable, private, and sensitive CIDR subnets:

```typescript
const privateNetworks = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],        // RFC 1918 Private
  ["100.64.0.0", 10],     // Carrier Grade NAT
  ["127.0.0.0", 8],       // Loopback
  ["169.254.0.0", 16],    // Link-Local & Cloud Metadata (AWS/GCP/Azure)
  ["172.16.0.0", 12],     // RFC 1918 Private
  ["192.0.0.0", 24],      // IETF Protocol
  ["192.0.2.0", 24],      // TEST-NET-1
  ["192.168.0.0", 16],    // RFC 1918 Private
  ["198.18.0.0", 15],     // Benchmark
  ["198.51.100.0", 24],   // TEST-NET-2
  ["203.0.113.0", 24],    // TEST-NET-3
  ["224.0.0.0", 4],       // Multicast
  ["240.0.0.0", 4],       // Reserved
] as const) {
  privateNetworks.addSubnet(address, prefix, "ipv4");
}
```

### Destination Resolution & IP Pinning
1. **DNS Lookup**: Target hostname is resolved via `node:dns/promises`.
2. **Subnet Verification**: If any resolved IP belongs to `privateNetworks`, the proxy immediately rejects the request with `403 Forbidden`.
3. **Socket Pinning**: The verified IP address is passed directly to the HTTP agent's `lookup` option, pinning the connection to the verified IP and neutralizing DNS rebinding attacks.
4. **Recursive Redirect Validation**: Follows up to 5 HTTP redirects, executing full DNS resolution and subnet verification on every intermediate `Location` header.

### Stream Size Limiting
To prevent memory exhaustion attacks, incoming response streams are metered:
* **Max Payload**: 5 MB (`MAX_BYTES = 5 * 1024 * 1024`).
* If the stream exceeds 5 MB, the response is destroyed immediately and a controlled error is returned.

---

## 3. Iframe Sandboxing & Origin Isolation

### Client-Side Sandbox (`src/components/apps/firefox.tsx`)
```html
<iframe
  src="/api/proxy?url=..."
  sandbox="allow-scripts allow-popups allow-forms"
  ...
/>
```
* **No `allow-same-origin`**: Third-party JavaScript cannot access `window.parent`, cannot read `localStorage`, cannot access cookies, and cannot dispatch synthetic DOM events to the desktop environment.

### Server-Side CSP Injection
The proxy response injects defensive headers:
```http
Content-Security-Policy: sandbox allow-scripts allow-forms allow-popups; frame-ancestors 'self'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Cache-Control: no-store
```
* Even if an attacker navigates directly to `/api/proxy?url=...` in a top-level browser tab, the browser enforces the sandboxed CSP and blocks origin access.
