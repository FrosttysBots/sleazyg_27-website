import { Filter } from "bad-words";

const baseFilter = new Filter();

// Add your own words (keep this list in code, or load from env/file if you want)
const CUSTOM_BAD_WORDS: string[] = [
    // "word1",
    // "word2",
];

baseFilter.addWords(...CUSTOM_BAD_WORDS);

export type ModerationMode = "reject" | "clean";

export function moderateText(input: string, mode: ModerationMode) {
    const text = (input ?? "").trim();

    // basic guardrails
    if (!text) return { ok: false, text: "", reason: "Empty message." };
    if (text.length > 500) return { ok: false, text, reason: "Too long (max 500 chars)." };

    const isProfane = baseFilter.isProfane(text);

    if (!isProfane) return { ok: true, text };

    if (mode === "reject") {
        return { ok: false, text, reason: "Contains profanity." };
    }

    // mode === "clean"
    return { ok: true, text: baseFilter.clean(text) };
}
