import { NextResponse } from "next/server";

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TWITCH_STREAMS_URL = "https://api.twitch.tv/helix/streams";
const TWITCH_USERS_URL = "https://api.twitch.tv/helix/users";
const TWITCH_VIDEOS_URL = "https://api.twitch.tv/helix/videos";

let cachedToken: { access_token: string; expires_at: number } | null = null;

type TwitchStream = {
    id: string;
    title: string;
    game_name: string;
    viewer_count: number;
    started_at: string;
};

type TwitchVod = {
    id: string;
    url: string;
    thumbnail_url: string;
    title: string;
    created_at: string;
    duration: string;
    view_count: number;
};

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
        throw new Error("Failed to get Twitch token");
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

async function getUserId(token: string, login: string) {
    const res = await fetch(`${TWITCH_USERS_URL}?login=${login}`, {
        headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID || "",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Twitch user");
    }

    const data = await res.json();
    const user = data.data?.[0];

    if (!user) {
        throw new Error("Twitch user not found");
    }

    return user.id as string;
}

async function getLastVod(token: string, userId: string) {
    const url = `${TWITCH_VIDEOS_URL}?user_id=${userId}&type=archive&first=1`;
    const res = await fetch(url, {
        headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID || "",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Twitch videos");
    }

    const data = await res.json();
    const vod = (data.data as TwitchVod[] | undefined)?.[0];

    if (!vod) return null;

    // Twitch VOD thumbnails use %{width}x%{height} placeholders.
    // Replace them with actual numbers so the URL works.
    const thumbnailUrl = vod.thumbnail_url
        .replace("%{width}", "1280")
        .replace("%{height}", "720");

    return {
        title: vod.title,
        url: vod.url,
        thumbnailUrl,
        createdAt: vod.created_at,
        duration: vod.duration,
        viewCount: vod.view_count,
    };
}


export async function GET() {
    try {
        const userLogin = process.env.TWITCH_USER_LOGIN;

        if (!userLogin) {
            return NextResponse.json(
                { error: "TWITCH_USER_LOGIN not configured" },
                { status: 500 }
            );
        }

        const token = await getAppAccessToken();

        // Check if live
        const liveRes = await fetch(
            `${TWITCH_STREAMS_URL}?user_login=${encodeURIComponent(userLogin)}`,
            {
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID || "",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (!liveRes.ok) {
            throw new Error("Failed to fetch Twitch stream data");
        }

        const liveData = await liveRes.json();
        const stream = (liveData.data as TwitchStream[] | undefined)?.[0];

        // If live, return live info
        if (stream) {
            return NextResponse.json({
                live: true,
                title: stream.title,
                gameName: stream.game_name,
                viewerCount: stream.viewer_count,
                startedAt: stream.started_at,
            });
        }

        // Not live: fetch last VOD
        const userId = await getUserId(token, userLogin);
        const lastVod = await getLastVod(token, userId);

        if (!lastVod) {
            // Offline and no VODs found
            return NextResponse.json({ live: false });
        }

        return NextResponse.json({
            live: false,
            lastVod,
        });
    } catch (err) {
        console.error("Error in Twitch live API:", err);
        return NextResponse.json(
            { live: false, error: "Failed to fetch" },
            { status: 500 }
        );
    }
}
