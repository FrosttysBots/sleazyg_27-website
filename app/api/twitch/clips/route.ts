import { NextResponse } from "next/server";

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TWITCH_USERS_URL = "https://api.twitch.tv/helix/users";
const TWITCH_CLIPS_URL = "https://api.twitch.tv/helix/clips";

let cachedToken: { access_token: string; expires_at: number } | null = null;

type TwitchClip = {
    id: string;
    url: string;
    embed_url: string;
    title: string;
    thumbnail_url: string;
    view_count: number;
    created_at: string;
    duration: number;
};

async function assertOk(res: Response, label: string) {
    if (res.ok) return;
    const text = await res.text().catch(() => "");
    throw new Error(
        `${label} failed: ${res.status} ${res.statusText} :: ${text.slice(0, 800)}`
    );
}

/* ---------------------- TOKEN FETCH ---------------------- */
async function getAppAccessToken() {
    if (cachedToken && cachedToken.expires_at > Date.now()) return cachedToken.access_token;

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error("Twitch client ID/secret not configured");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("grant_type", "client_credentials");

    const res = await fetch(TWITCH_TOKEN_URL, { method: "POST", body: params });
    await assertOk(res, "TWITCH_TOKEN");

    const data = (await res.json()) as { access_token: string; expires_in: number };

    cachedToken = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
}

/* ---------------------- GET USER ID ---------------------- */
async function getBroadcasterId(token: string, login: string) {
    const res = await fetch(`${TWITCH_USERS_URL}?login=${encodeURIComponent(login)}`, {
        headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID || "",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    await assertOk(res, "TWITCH_USERS");

    const data = await res.json();
    const user = data.data?.[0];
    if (!user) throw new Error("Twitch user not found");

    return user.id as string;
}

/* ---------------------- SLUG HELPERS ---------------------- */
function extractClipSlugFromEmbed(embedUrl: string) {
    try {
        const u = new URL(embedUrl);
        return u.searchParams.get("clip") ?? "";
    } catch {
        return "";
    }
}

function extractClipSlugFromUrl(url: string) {
    // Example: https://www.twitch.tv/sleazyg_27/clip/SlugHere
    const marker = "/clip/";
    const idx = url.indexOf(marker);
    if (idx === -1) return "";
    return url.substring(idx + marker.length).split(/[?#/]/)[0] ?? "";
}

function getClipSlug(clip: { embed_url: string; url: string; id: string }) {
    return (
        extractClipSlugFromEmbed(clip.embed_url) ||
        extractClipSlugFromUrl(clip.url) ||
        clip.id
    );
}

/* ---------------------- ROUTE HANDLER ---------------------- */
export async function GET(req: Request) {
    try {
        const userLogin = process.env.TWITCH_USER_LOGIN;
        if (!userLogin) {
            return NextResponse.json(
                { error: "Missing TWITCH_USER_LOGIN in env", clips: [], cursor: null, hasMore: false },
                { status: 500 }
            );
        }

        const url = new URL(req.url);

        // sort: "views" (default) | "date"
        const sort = (url.searchParams.get("sort") ?? "views").toLowerCase();

        // How many clips per page
        const first = Math.min(Math.max(Number(url.searchParams.get("first") ?? "12"), 1), 20);

        // How far back to look (days)
        const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? "3650"), 1), 3650);

        // Cursor for pagination (incoming)
        const after = url.searchParams.get("after") ?? null;

        // Time window
        const endedAt = new Date();
        const startedAt = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const token = await getAppAccessToken();
        const broadcasterId = await getBroadcasterId(token, userLogin);

        const clipsUrl =
            `${TWITCH_CLIPS_URL}?broadcaster_id=${encodeURIComponent(broadcasterId)}` +
            `&first=${first}` +
            `&started_at=${encodeURIComponent(startedAt.toISOString())}` +
            `&ended_at=${encodeURIComponent(endedAt.toISOString())}` +
            (after ? `&after=${encodeURIComponent(after)}` : "");

        const res = await fetch(clipsUrl, {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID || "",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        await assertOk(res, "TWITCH_CLIPS");

        const data = await res.json();

        let clips = (data.data as TwitchClip[]).map((clip) => ({
            id: clip.id,
            url: clip.url,
            embedUrl: clip.embed_url,
            clipSlug: getClipSlug(clip),
            title: clip.title,
            thumbnailUrl: clip.thumbnail_url,
            viewCount: clip.view_count,
            createdAt: clip.created_at,
            duration: clip.duration,
        }));

        // IMPORTANT:
        // - For "views" we DO NOT sort (Twitch already returns most-viewed order)
        //   and sorting would mess with pagination semantics.
        // - For "date" (landing page), we sort newest-first.
        if (sort === "date") {
            clips = clips.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }

        const returnedCursor: string | null = data.pagination?.cursor ?? null;

        // End/loop protection
        const cursorDidNotAdvance =
            after !== null && returnedCursor !== null && returnedCursor === after;

        const likelyEndOfWindow = clips.length < first;

        const hasMore =
            !!returnedCursor &&
            !cursorDidNotAdvance &&
            !likelyEndOfWindow &&
            clips.length > 0;

        return NextResponse.json({
            clips,
            cursor: hasMore ? returnedCursor : null,
            hasMore,
        });
    } catch (err) {
        console.error("Error in Twitch Clips API:", err);
        const message = err instanceof Error ? err.message : "Unknown error";

        return NextResponse.json(
            {
                error: "Failed to fetch Twitch clips",
                details: message,
                clips: [],
                cursor: null,
                hasMore: false,
            },
            { status: 500 }
        );
    }
}
