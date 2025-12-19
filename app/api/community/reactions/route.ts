import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type ReactionKey = "love" | "fire" | "brain" | "rip";
type PostType = "messages" | "strategies";

type Body = {
    postType: PostType;
    postId: string;
    anonId: string;
    key: ReactionKey | null; // null means "remove reaction"
};

const ALL_KEYS: ReactionKey[] = ["love", "fire", "brain", "rip"];

export async function GET() {
    return NextResponse.json({ error: "Use POST" }, { status: 405 });
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as Body;

        if (!body?.postType || !body?.postId || !body?.anonId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 1) Remove any existing reaction by this anon user for this post
        const del = await supabaseAdmin
            .from("reactions")
            .delete()
            .eq("post_type", body.postType)
            .eq("post_id", body.postId)
            .eq("anon_id", body.anonId);

        if (del.error) throw del.error;

        // 2) If key is not null, insert the new reaction
        if (body.key) {
            const ins = await supabaseAdmin.from("reactions").insert({
                post_type: body.postType,
                post_id: body.postId,
                anon_id: body.anonId,
                reaction_key: body.key,
            });

            if (ins.error) throw ins.error;
        }

        // 3) Return updated counts for this post
        const { data: rows, error } = await supabaseAdmin
            .from("reactions")
            .select("reaction_key")
            .eq("post_type", body.postType)
            .eq("post_id", body.postId);

        if (error) throw error;

        const counts: Record<ReactionKey, number> = { love: 0, fire: 0, brain: 0, rip: 0 };
        for (const r of rows ?? []) {
            const k = (r as { reaction_key: string }).reaction_key as ReactionKey;
            if (ALL_KEYS.includes(k)) counts[k] += 1;
        }

        return NextResponse.json({ counts });
    } catch (e: unknown) {
        console.error(e);
        return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 });
    }
}
