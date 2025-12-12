import { NextResponse } from "next/server";

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TWITCH_USERS_URL = "https://api.twitch.tv/helix/users";
const TWITCH_CLIPS_URL = "https://api.twitch.tv/helix/clips";

let cachedToken: { access_token: string; expires_at: number } | null = null;

/* ---------------------- TYPES ---------------------- */

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

/* ---------------------- TOKEN FETCH ---------------------- */

async function getAppAccessToken() {
    if (cachedToken && cachedToken.expires_at > Date.now()) {
        return cachedToken.access_token;
    }

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Twitch client ID/secret not configured");
    }

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("grant_type", "client_credentials");

    const res = await fetch(TWITCH_TOKEN_URL, {
        method: "POST",
        body: params,
    });

    if (!res.ok) {
        throw new Error("Failed to obtain Twitch OAuth token");
    }

    const data = (await res.json()) as {
        access_token: string;
        expires_in: number;
    };

    cachedToken = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
}

/* ---------------------- GET USER ID ---------------------- */

async function getBroadcasterId(token: string, login: string) {
    const res = await fetch(`${TWITCH_USERS_URL}?login=${login}`, {
        headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID || "",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Twitch user profile");
    }

    const data = await res.json();
    const user = data.data?.[0];

    if (!user) {
        throw new Error("Twitch user not found");
    }

    return user.id as string;
}

/* ---------------------- ROUTE HANDLER ---------------------- */

export async function GET(req: Request) {
    try {
        const userLogin = process.env.TWITCH_USER_LOGIN;

        if (!userLogin) {
            return NextResponse.json(
                { error: "Missing TWITCH_USER_LOGIN in env" },
                { status: 500 }
            );
        }

        // Read optional cursor from query string
        const url = new URL(req.url);
        const cursor = url.searchParams.get("cursor") ?? undefined;

        const token = await getAppAccessToken();
        const broadcasterId = await getBroadcasterId(token, userLogin);

        // Build clips request with optional pagination
        const params = new URLSearchParams();
        params.set("broadcaster_id", broadcasterId);
        params.set("first", "12"); // page size

        if (cursor) {
            params.set("after", cursor);
        }

        const res = await fetch(`${TWITCH_CLIPS_URL}?${params.toString()}`, {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID || "",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Failed to fetch Twitch clips");
        }

        const data = await res.json();

        const clips = (data.data as TwitchClip[]).map((clip) => ({
            id: clip.id,
            url: clip.url,
            // We do not need embedUrl on the client any more.
            // We build the embed URL in the frontend from clip.id.
            title: clip.title,
            thumbnailUrl: clip.thumbnail_url,
            viewCount: clip.view_count,
            createdAt: clip.created_at,
            duration: clip.duration,
        }));

        const nextCursor = data.pagination?.cursor ?? null;

        return NextResponse.json({ clips, cursor: nextCursor });
    } catch (err) {
        console.error("Error in Twitch Clips API:", err);
        return NextResponse.json(
            { error: "Failed to fetch Twitch clips", clips: [], cursor: null },
            { status: 500 }
        );
    }
}
