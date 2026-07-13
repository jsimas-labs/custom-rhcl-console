package com.bb.rhcl.dnsprober;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.OPTIONS;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Live security-header probe used by the console plugin's HTTPRoute
 * Details Security tab. The plugin sends a URL; we perform a real HTTP
 * HEAD (falls back to GET when the server rejects HEAD) and report:
 *
 *   - HTTP status + latency
 *   - HSTS (Strict-Transport-Security)
 *   - CSP (Content-Security-Policy)
 *   - X-Content-Type-Options
 *   - X-Frame-Options
 *   - Referrer-Policy
 *   - Cache-Control (surfaced for sensitive routes only — always returned,
 *     the plugin decides whether to render it)
 *
 * The endpoint is intentionally permissive on TLS: an operator can be
 * probing a staging cert with a name mismatch. This tool's job is to
 * report what headers ARE returned, not to enforce chain validation —
 * that's what the /api/tls/probe endpoint is for.
 *
 * Rationale for a companion-service probe instead of a browser fetch:
 * the browser will not expose response headers via CORS unless the
 * server sets Access-Control-Expose-Headers, and we can't require that
 * from every backend the plugin might inspect. Doing the fetch from the
 * cluster side sidesteps CORS entirely.
 */
@Path("/api/headers/probe")
public class HeadersProbeResource {

    private static final int CONNECT_TIMEOUT_MS = 8_000;
    private static final int READ_TIMEOUT_MS = 8_000;

    public static final class Request {
        /** Full URL including scheme; e.g. https://api.example.com/api/v1/health. */
        public String url;
        /** Optional. When true, follows one redirect before reading headers.
         *  Default false — we want to see the FIRST response's headers. */
        public Boolean followRedirects;
        /** Optional Host header override (useful when probing via an
         *  internal service address). */
        public String hostHeader;
    }

    public static final class HeaderCheck {
        public String id;
        public String header;
        public boolean present;
        public String value;
        /** "passed" | "warning" | "failed" — the prober's own judgement,
         *  based on well-known good/bad values for that header. */
        public String status;
        public String detail;
    }

    public static final class Response_ {
        public String url;
        public String probedAt;
        public Integer httpStatus;
        public String httpStatusReason;
        public Long latencyMs;
        public List<HeaderCheck> headers;
        public String error;
    }

    /** Permissive TrustManager for probe pass — TLS validity is a
     *  separate concern surfaced by /api/tls/probe. */
    private static SSLContext insecureSslContext() throws Exception {
        SSLContext ctx = SSLContext.getInstance("TLS");
        ctx.init(new javax.net.ssl.KeyManager[0], new TrustManager[] {
            new X509TrustManager() {
                public void checkClientTrusted(java.security.cert.X509Certificate[] c, String a) {}
                public void checkServerTrusted(java.security.cert.X509Certificate[] c, String a) {}
                public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                    return new java.security.cert.X509Certificate[0];
                }
            }
        }, new java.security.SecureRandom());
        return ctx;
    }

    @OPTIONS
    public Response preflight() {
        return Response.ok()
            .header("Access-Control-Allow-Origin", "*")
            .header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
            .header("Access-Control-Allow-Headers", "content-type,accept,authorization")
            .build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response probe(Request req) {
        Response_ result = new Response_();
        result.probedAt = Instant.now().toString();
        result.headers = new ArrayList<>();

        if (req == null || req.url == null || req.url.isBlank()) {
            result.error = "url is required";
            return Response.status(400).entity(result).build();
        }

        URI uri;
        try {
            uri = URI.create(req.url);
            if (uri.getScheme() == null || uri.getHost() == null) {
                throw new IllegalArgumentException("url must include scheme and host");
            }
        } catch (Exception e) {
            result.error = "invalid url: " + e.getMessage();
            return Response.status(400).entity(result).build();
        }
        result.url = uri.toString();

        long start = System.nanoTime();
        Map<String, List<String>> responseHeaders = null;
        try {
            responseHeaders = performProbe(uri, req, "HEAD", result);
            // Some servers 405 on HEAD (Kuadrant's own wasm-shim used to
            // reject HEAD on protected routes) — fall back to GET so we
            // can still surface the headers.
            if (result.httpStatus != null && result.httpStatus == 405) {
                result.headers.clear();
                responseHeaders = performProbe(uri, req, "GET", result);
            }
        } catch (Exception e) {
            result.error = e.getClass().getSimpleName() + ": " + e.getMessage();
            result.latencyMs = Duration.ofNanos(System.nanoTime() - start).toMillis();
            return Response.ok(result).header("Access-Control-Allow-Origin", "*").build();
        }
        result.latencyMs = Duration.ofNanos(System.nanoTime() - start).toMillis();

        if (responseHeaders != null) {
            evaluateHeaders(responseHeaders, result);
        }
        return Response.ok(result).header("Access-Control-Allow-Origin", "*").build();
    }

    private Map<String, List<String>> performProbe(URI uri, Request req, String method, Response_ result)
        throws Exception {
        java.net.HttpURLConnection conn;
        if ("https".equalsIgnoreCase(uri.getScheme())) {
            HttpsURLConnection https = (HttpsURLConnection) uri.toURL().openConnection();
            https.setSSLSocketFactory(insecureSslContext().getSocketFactory());
            // Any host — trust decision belongs to /api/tls/probe.
            https.setHostnameVerifier((HostnameVerifier) (hostname, session) -> true);
            conn = https;
        } else {
            conn = (java.net.HttpURLConnection) uri.toURL().openConnection();
        }
        conn.setRequestMethod(method);
        conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
        conn.setReadTimeout(READ_TIMEOUT_MS);
        conn.setInstanceFollowRedirects(Boolean.TRUE.equals(req.followRedirects));
        if (req.hostHeader != null && !req.hostHeader.isBlank()) {
            conn.setRequestProperty("Host", req.hostHeader);
        }
        // Preserve the URL's Host header — some backends serve different
        // vhosts by name.
        conn.setRequestProperty("User-Agent", "rhcl-headers-probe/1.0");

        int code = conn.getResponseCode();
        result.httpStatus = code;
        result.httpStatusReason = conn.getResponseMessage();
        return conn.getHeaderFields();
    }

    private void evaluateHeaders(Map<String, List<String>> raw, Response_ result) {
        String hsts = firstHeaderValue(raw, "Strict-Transport-Security");
        String csp = firstHeaderValue(raw, "Content-Security-Policy");
        String xcto = firstHeaderValue(raw, "X-Content-Type-Options");
        String xfo = firstHeaderValue(raw, "X-Frame-Options");
        String refPolicy = firstHeaderValue(raw, "Referrer-Policy");
        String cacheControl = firstHeaderValue(raw, "Cache-Control");

        result.headers.add(evaluateHsts(hsts));
        result.headers.add(evaluateCsp(csp));
        result.headers.add(evaluateXcto(xcto));
        result.headers.add(evaluateXfo(xfo));
        result.headers.add(evaluateReferrerPolicy(refPolicy));
        result.headers.add(evaluateCacheControl(cacheControl));
    }

    private HeaderCheck evaluateHsts(String value) {
        HeaderCheck c = base("hsts", "Strict-Transport-Security", value);
        if (value == null) {
            c.status = "failed";
            c.detail = "Missing — HTTPS clients cannot pin to TLS on subsequent visits.";
            return c;
        }
        String v = value.toLowerCase(Locale.ROOT);
        boolean includeSub = v.contains("includesubdomains");
        boolean preload = v.contains("preload");
        long maxAge = extractDirective(v, "max-age");
        StringBuilder d = new StringBuilder();
        d.append("max-age=").append(maxAge);
        if (includeSub) d.append(", includeSubDomains");
        if (preload) d.append(", preload");
        c.detail = d.toString();
        if (maxAge < 15552000L) { // < 180 days
            c.status = "warning";
            c.detail = c.detail + " — recommended max-age >= 15552000 (180 days).";
        } else {
            c.status = "passed";
        }
        return c;
    }

    private HeaderCheck evaluateCsp(String value) {
        HeaderCheck c = base("csp", "Content-Security-Policy", value);
        if (value == null || value.isBlank()) {
            c.status = "warning";
            c.detail = "Not set — no browser-side content restriction.";
            return c;
        }
        String v = value.toLowerCase(Locale.ROOT);
        if (v.contains("default-src") || v.contains("script-src")) {
            c.status = "passed";
            c.detail = "Policy is present and restricts sources.";
        } else {
            c.status = "warning";
            c.detail = "Present but does not declare default-src or script-src.";
        }
        return c;
    }

    private HeaderCheck evaluateXcto(String value) {
        HeaderCheck c = base("x-content-type-options", "X-Content-Type-Options", value);
        if (value == null) {
            c.status = "failed";
            c.detail = "Missing — browsers may MIME-sniff response bodies.";
            return c;
        }
        if ("nosniff".equalsIgnoreCase(value.trim())) {
            c.status = "passed";
            c.detail = "nosniff — MIME sniffing disabled.";
        } else {
            c.status = "warning";
            c.detail = "Present but not set to 'nosniff'.";
        }
        return c;
    }

    private HeaderCheck evaluateXfo(String value) {
        HeaderCheck c = base("x-frame-options", "X-Frame-Options", value);
        if (value == null) {
            c.status = "warning";
            c.detail = "Not set — clickjacking is possible unless CSP frame-ancestors is present.";
            return c;
        }
        String v = value.trim().toLowerCase(Locale.ROOT);
        if ("deny".equals(v) || "sameorigin".equals(v)) {
            c.status = "passed";
            c.detail = value;
        } else {
            c.status = "warning";
            c.detail = "Non-standard value: " + value;
        }
        return c;
    }

    private HeaderCheck evaluateReferrerPolicy(String value) {
        HeaderCheck c = base("referrer-policy", "Referrer-Policy", value);
        if (value == null) {
            c.status = "warning";
            c.detail = "Not set — browser default (often no-referrer-when-downgrade) applies.";
            return c;
        }
        c.status = "passed";
        c.detail = value;
        return c;
    }

    private HeaderCheck evaluateCacheControl(String value) {
        HeaderCheck c = base("cache-control", "Cache-Control", value);
        if (value == null) {
            c.status = "skipped";
            c.detail = "Not set — evaluate per-route sensitivity.";
            return c;
        }
        String v = value.toLowerCase(Locale.ROOT);
        if (v.contains("no-store") || v.contains("private")) {
            c.status = "passed";
            c.detail = value;
        } else if (v.contains("public") || v.contains("max-age")) {
            c.status = "warning";
            c.detail = "Cacheable — verify this is appropriate for the route's sensitivity.";
        } else {
            c.status = "passed";
            c.detail = value;
        }
        return c;
    }

    private static HeaderCheck base(String id, String header, String value) {
        HeaderCheck c = new HeaderCheck();
        c.id = id;
        c.header = header;
        c.present = value != null;
        c.value = value;
        return c;
    }

    private static String firstHeaderValue(Map<String, List<String>> raw, String name) {
        for (Map.Entry<String, List<String>> e : raw.entrySet()) {
            if (e.getKey() != null && name.equalsIgnoreCase(e.getKey())) {
                List<String> vs = e.getValue();
                if (vs != null && !vs.isEmpty()) return vs.get(0);
            }
        }
        return null;
    }

    /** Reads a single directive value ("max-age=123") from a comma /
     *  semicolon-separated header, returning 0 when absent. */
    private static long extractDirective(String header, String directive) {
        if (header == null) return 0L;
        for (String token : header.split("[,;]")) {
            String t = token.trim();
            if (t.regionMatches(true, 0, directive, 0, directive.length())) {
                int eq = t.indexOf('=');
                if (eq > 0) {
                    try {
                        return Long.parseLong(t.substring(eq + 1).trim());
                    } catch (NumberFormatException ignored) {
                        return 0L;
                    }
                }
            }
        }
        return 0L;
    }
}
