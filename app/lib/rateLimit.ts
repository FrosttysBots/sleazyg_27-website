type Bucket = { count: number; resetAt: number };

// NOTE: This is in-memory. Works great in dev and on a single server.
// On serverless (Vercel), instances can reset; later you can swap to Upstash.
const buckets = new Map<string, Bucket>();

export function rateLimit({
    key,
    limit,
    windowMs,
}: {
    key: string;
    limit: number;
    windowMs: number;
}) {
    const now = Date.now();
    const b = buckets.get(key);

    if (!b || now > b.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    if (b.count >= limit) {
        return { allowed: false, remaining: 0, resetAt: b.resetAt };
    }

    b.count += 1;
    buckets.set(key, b);
    return { allowed: true, remaining: limit - b.count, resetAt: b.resetAt };
}

export function getClientIp(req: Request) {
    // Vercel/Proxies usually set x-forwarded-for
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();

    // Fallbacks
    return req.headers.get("x-real-ip") ?? "unknown";
}
