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
    if (!res.ok) throw new Error("Failed to obtain Twitch OAuth token");

    const data = (await res.json()) as { access_token: string; expires_in: number };

    cachedToken = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
}

async function getBroadcasterId(token: string, login: string) {
    const res = await fetch(`${TWITCH_USERS_URL}?login=${login}`, {
        headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID || "",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch Twitch user profile");

    const data = await res.json();
    const user = data.data?.[0];
    if (!user) throw new Error("Twitch user not found");

    return user.id as string;
}

function extractClipSlug(embedUrl: string) {
    // Example: https://clips.twitch.tv/embed?clip=SomeSlug&parent=...
    try {
        const u = new URL(embedUrl);
        return u.searchParams.get("clip") ?? "";
    } catch {
        return "";
    }
}

export async function GET(req: Request) {
    try {
        const userLogin = process.env.TWITCH_USER_LOGIN;
        if (!userLogin) {
            return NextResponse.json({ error: "Missing TWITCH_USER_LOGIN in env" }, { status: 500 });
        }

        const url = new URL(req.url);
        const first = Math.min(Math.max(Number(url.searchParams.get("first") ?? "12"), 1), 20);

        // NEW: how far back to look (default 30 days)
        const days = Math.min(
            Math.max(Number(url.searchParams.get("days") ?? "360"), 1),
            365
        );

        const endedAt = new Date();
        const startedAt = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const startedIso = startedAt.toISOString();
        const endedIso = endedAt.toISOString();

        const token = await getAppAccessToken();
        const broadcasterId = await getBroadcasterId(token, userLogin);

        const res = await fetch(
            `${TWITCH_CLIPS_URL}?broadcaster_id=${broadcasterId}` +
            `&first=${first}` +
            `&started_at=${encodeURIComponent(startedIso)}` +
            `&ended_at=${encodeURIComponent(endedIso)}`,
            {
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID || "",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (!res.ok) throw new Error("Failed to fetch Twitch clips");

        const data = await res.json();

        const clips = (data.data as TwitchClip[])
            .map((clip) => ({
                id: clip.id,
                url: clip.url,
                embedUrl: clip.embed_url,
                clipSlug: extractClipSlug(clip.embed_url),
                title: clip.title,
                thumbnailUrl: clip.thumbnail_url,
                viewCount: clip.view_count,
                createdAt: clip.created_at,
                duration: clip.duration,
            }))
            // NEW: newest clips first
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );

        return NextResponse.json({ clips });
    } catch (err) {
        console.error("Error in Twitch Clips API:", err);
        return NextResponse.json({ error: "Failed to fetch Twitch clips" }, { status: 500 });
    }
}
