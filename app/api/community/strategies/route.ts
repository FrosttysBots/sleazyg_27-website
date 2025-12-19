import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type ReactionKey = "love" | "fire" | "brain" | "rip";
type Weapon = "Vandal" | "Phantom" | "Operator" | "Any";
type Action = "Push" | "Hold" | "Fake" | "Lurk" | "Utility";
type DurationRounds = 1 | 2 | 3 | 4 | 5;

function emptyReactions(): Record<ReactionKey, number> {
    return { love: 0, fire: 0, brain: 0, rip: 0 };
}

function clampDuration(n: number): DurationRounds {
    if (n <= 1) return 1;
    if (n === 2) return 2;
    if (n === 3) return 3;
    if (n === 4) return 4;
    return 5;
}

function asWeapon(v: unknown): Weapon {
    return v === "Vandal" || v === "Phantom" || v === "Operator" || v === "Any" ? v : "Any";
}

function asAction(v: unknown): Action {
    return v === "Push" || v === "Hold" || v === "Fake" || v === "Lurk" || v === "Utility" ? v : "Utility";
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 80), 200);
    const sort = searchParams.get("sort") === "top" ? "top" : "new";

    // NOTE: "top" sorting needs reaction counts; for now we just sort by created_at.
    const { data, error } = await supabaseAdmin
        .from("strategies")
        .select("id, author, title, body, weapon, action, duration_rounds, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const strategies = (data ?? []).map((s) => ({
        id: s.id,
        author: s.author ?? "Anonymous",
        title: s.title,
        body: s.body,
        weapon: asWeapon(s.weapon),
        action: asAction(s.action),
        durationRounds: clampDuration(Number(s.duration_rounds ?? 1)), // normalize
        createdAt: s.created_at,                                      // normalize
        reactions: emptyReactions(),                                   // keep UI stable
    }));

    return NextResponse.json({ strategies });
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as {
            author?: string;
            title?: string;
            body?: string;
            weapon?: Weapon;
            action?: Action;
            durationRounds?: number;
        };

        const author = (body.author ?? "").trim() || "Anonymous";
        const title = (body.title ?? "").trim();
        const details = (body.body ?? "").trim();

        const weapon = asWeapon(body.weapon);
        const action = asAction(body.action);
        const duration_rounds = clampDuration(Number(body.durationRounds ?? 1));

        if (!title || !details) {
            return NextResponse.json({ error: "Title and details are required" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("strategies")
            .insert({
                author,
                title,
                body: details,
                weapon,
                action,
                duration_rounds,
            })
            .select("id, author, title, body, weapon, action, duration_rounds, created_at")
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!data) return NextResponse.json({ error: "Insert failed" }, { status: 500 });

        const strategy = {
            id: data.id,
            author: data.author ?? "Anonymous",
            title: data.title,
            body: data.body,
            weapon: asWeapon(data.weapon),
            action: asAction(data.action),
            durationRounds: clampDuration(Number(data.duration_rounds ?? 1)),
            createdAt: data.created_at,          // normalize
            reactions: emptyReactions(),         // keep UI stable
        };

        return NextResponse.json({ strategy }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
