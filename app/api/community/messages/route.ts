import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type ReactionKey = "love" | "fire" | "brain" | "rip";

function emptyReactions(): Record<ReactionKey, number> {
    return { love: 0, fire: 0, brain: 0, rip: 0 };
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 80), 200);
    const sort = searchParams.get("sort") === "top" ? "top" : "new";

    // NOTE: "top" sorting needs reaction counts; for now we just sort by created_at.
    const { data, error } = await supabaseAdmin
        .from("messages")
        .select("id, author, body, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const messages = (data ?? []).map((m) => ({
        id: m.id,
        author: m.author ?? "Anonymous",
        body: m.body,
        createdAt: m.created_at,          // normalize
        reactions: emptyReactions(),      // keep UI stable
    }));

    return NextResponse.json({ messages });
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as { author?: string; body?: string };
        const author = (body.author ?? "").trim() || "Anonymous";
        const text = (body.body ?? "").trim();

        if (!text) return NextResponse.json({ error: "Message is required" }, { status: 400 });

        const { data, error } = await supabaseAdmin
            .from("messages")
            .insert({ author, body: text })
            .select("id, author, body, created_at")
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!data) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

        const message = {
            id: data.id,
            author: data.author ?? "Anonymous",
            body: data.body,
            createdAt: data.created_at,      // normalize
            reactions: emptyReactions(),     // keep UI stable
        };

        return NextResponse.json({ message }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
