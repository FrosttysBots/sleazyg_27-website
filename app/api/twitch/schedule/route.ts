import { NextResponse } from "next/server";

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TWITCH_USERS_URL = "https://api.twitch.tv/helix/users";
const TWITCH_SCHEDULE_URL = "https://api.twitch.tv/helix/schedule";

let cachedToken: { access_token: string; expires_at: number } | null = null;

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

export async function GET() {
    try {
        const userLogin = process.env.TWITCH_USER_LOGIN;
        if (!userLogin) {
            return NextResponse.json({ error: "Missing TWITCH_USER_LOGIN in env" }, { status: 500 });
        }

        const token = await getAppAccessToken();
        const broadcasterId = await getBroadcasterId(token, userLogin);

        // Get schedule (Twitch returns segments + broadcaster info)
        const res = await fetch(`${TWITCH_SCHEDULE_URL}?broadcaster_id=${broadcasterId}&first=8`, {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID || "",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        // If streamer has no schedule set, Twitch may 404 or return empty-ish payload depending on account
        if (!res.ok) {
            return NextResponse.json({ segments: [] }, { status: 200 });
        }

        const data = await res.json();

        const segments = (data.data?.segments ?? []).map((s: any) => ({
            id: s.id,
            title: s.title ?? "",
            startTime: s.start_time,
            endTime: s.end_time,
            category: s.category?.name ?? "",
            isCanceled: Boolean(s.is_canceled),
        }));

        return NextResponse.json({ segments });
    } catch (err) {
        console.error("Error in Twitch Schedule API:", err);
        return NextResponse.json({ segments: [] }, { status: 200 });
    }
}
