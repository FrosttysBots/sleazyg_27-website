import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ReactionKey = "love" | "fire" | "brain" | "rip";
const REACTION_KEYS: ReactionKey[] = ["love", "fire", "brain", "rip"];

function emptyCounts(): Record<ReactionKey, number> {
    return { love: 0, fire: 0, brain: 0, rip: 0 };
}

type MessageRow = {
    id: string;
    author: string | null;
    body: string | null;
    created_at: string;
};

type ReactionRow = {
    post_id: string;
    post_type: string;
    reaction_key: ReactionKey | string;
};

function shapeMessage(m: MessageRow, reactions: Record<ReactionKey, number>) {
    const { created_at, ...rest } = m;
    return { ...rest, createdAt: created_at, reactions };
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 80), 200);

    const { data: messages, error: msgErr } = await supabaseAdmin
        .from("messages")
        .select("id, author, body, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

    const safeMessages = (messages ?? []) as MessageRow[];
    const ids = safeMessages.map((m) => m.id);
    if (ids.length === 0) return NextResponse.json({ messages: [] });

    const { data: reactions, error: rxErr } = await supabaseAdmin
        .from("reactions")
        .select("post_id, post_type, reaction_key")
        .eq("post_type", "messages")
        .in("post_id", ids);

    const map = new Map<string, Record<ReactionKey, number>>();
    for (const id of ids) map.set(id, emptyCounts());

    if (!rxErr) {
        for (const r of (reactions ?? []) as ReactionRow[]) {
            const postId = r.post_id;
            const key = r.reaction_key;
            if (!map.has(postId)) map.set(postId, emptyCounts());
            if (REACTION_KEYS.includes(key as ReactionKey)) map.get(postId)![key as ReactionKey] += 1;
        }
    }

    return NextResponse.json({
        messages: safeMessages.map((m) => shapeMessage(m, map.get(m.id) ?? emptyCounts())),
    });
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

        const created = data as MessageRow;

        return NextResponse.json(
            { message: shapeMessage(created, emptyCounts()) },
            { status: 201 }
        );
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}