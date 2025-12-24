"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./community.css";
import Image from "next/image";

type BoardTab = "messages" | "strategies";
type SortMode = "new" | "top";

type ReactionKey = "love" | "fire" | "brain" | "rip";

type Weapon = "Vandal" | "Phantom" | "Operator" | "Any";
type Action = "Push" | "Hold" | "Fake" | "Lurk" | "Utility";
type DurationRounds = 1 | 2 | 3 | 4 | 5;

const REACTIONS: { key: ReactionKey; label: string; iconSrc: string; iconAlt?: string }[] = [
    { key: "love", label: "Love", iconSrc: "/reactions/love.png", iconAlt: "Love" },
    { key: "fire", label: "Rage", iconSrc: "/reactions/fire.png", iconAlt: "Fire" },
    { key: "brain", label: "Cool", iconSrc: "/reactions/brain.png", iconAlt: "Brain" },
    { key: "rip", label: "RIP", iconSrc: "/reactions/rip.png", iconAlt: "RIP" },
];

type BasePost = {
    id: string;
    createdAt: string; // ISO
    author: string;
    body: string;
    reactions: Record<ReactionKey, number>;
};

type Strategy = BasePost & {
    title: string;
    weapon: Weapon;
    action: Action;
    durationRounds: DurationRounds;
};

type UserReactions = Record<string, ReactionKey | null>;

function getAnonId() {
    if (typeof window === "undefined") return "";
    const key = "sleazy_anon_id";
    let id = localStorage.getItem(key);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(key, id);
    }
    return id;
}

function loadUserReactions(): UserReactions {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem("sleazy_user_reactions");
        return raw ? (JSON.parse(raw) as UserReactions) : {};
    } catch {
        return {};
    }
}

function saveUserReactions(next: UserReactions) {
    try {
        localStorage.setItem("sleazy_user_reactions", JSON.stringify(next));
    } catch {
        // ignore
    }
}

function sumReactions(r: Record<ReactionKey, number>) {
    return Object.values(r).reduce((a, b) => a + b, 0);
}

const HOT_THRESHOLD = 8; // Posts with 8+ reactions get hot badge
const CONFETTI_THRESHOLD = 15; // Crossing this triggers confetti

/* ---------------------- PARTICLE BURST ---------------------- */
function createParticleBurst(
    container: HTMLElement,
    reactionKey: ReactionKey,
    count: number = 8
) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement("div");
        particle.className = `particle particle-${reactionKey}`;

        // Random direction
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const distance = 30 + Math.random() * 40;
        const px = Math.cos(angle) * distance;
        const py = Math.sin(angle) * distance;

        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.setProperty("--px", `${px}px`);
        particle.style.setProperty("--py", `${py}px`);

        container.appendChild(particle);

        // Remove after animation
        setTimeout(() => particle.remove(), 600);
    }
}

/* ---------------------- CONFETTI BURST ---------------------- */
function triggerConfetti() {
    const container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);

    const colors = ["#002aff", "#22d3ee", "#a855f7", "#f97316", "#3b82f6", "#10b981"];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = `${-10 - Math.random() * 20}%`;
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
        container.appendChild(confetti);
    }

    // Cleanup after animation
    setTimeout(() => container.remove(), 4000);
}

/* ---------------------- RELATIVE TIME ---------------------- */

function toDateMs(value: string | null | undefined) {
    if (!value) return NaN;

    // Accept "YYYY-MM-DD HH:MM:SS" by converting space to "T"
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    return new Date(normalized).getTime();
}

function formatRelative(iso: string | null | undefined) {
    const now = Date.now();
    const t = toDateMs(iso);
    if (!Number.isFinite(t)) return "—";

    const diffSec = Math.max(0, Math.floor((now - t) / 1000));
    if (diffSec < 10) return "just now";
    if (diffSec < 60) return `${diffSec}s ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;

    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;

    const diffWk = Math.floor(diffDay / 7);
    if (diffWk < 5) return `${diffWk}w ago`;

    const diffMo = Math.floor(diffDay / 30);
    if (diffMo < 12) return `${diffMo}mo ago`;

    const diffYr = Math.floor(diffDay / 365);
    return `${diffYr}y ago`;
}

function ClientRelativeTime({ iso }: { iso: string | null | undefined }) {
    const [text, setText] = useState("");

    useEffect(() => {
        const update = () => setText(formatRelative(iso));
        update();
        const id = window.setInterval(update, 30_000);
        return () => window.clearInterval(id);
    }, [iso]);

    const title =
        iso && Number.isFinite(new Date(iso).getTime())
            ? new Date(iso).toLocaleString()
            : "";

    return (
        <span suppressHydrationWarning title={title}>
            {text || "—"}
        </span>
    );
}


/* ---------------------- SAFE FETCH HELPERS ---------------------- */

async function safeJson<T>(res: Response): Promise<T> {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Expected JSON but got "${ct || "unknown"}". First 120 chars: ${text.slice(0, 120)}`);
    }
    return (await res.json()) as T;
}

function clampDuration(v: number): DurationRounds {
    if (v <= 1) return 1;
    if (v === 2) return 2;
    if (v === 3) return 3;
    if (v === 4) return 4;
    return 5;
}

export default function CommunityPage() {
    const [isTouchUi, setIsTouchUi] = useState(false);

    const [messages, setMessages] = useState<BasePost[]>([]);
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [userReactions, setUserReactions] = useState<UserReactions>({});

    const [tab, setTab] = useState<BoardTab>("messages");
    const [sort, setSort] = useState<SortMode>("new");

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formAuthor, setFormAuthor] = useState("");
    const [formMessage, setFormMessage] = useState("");

    const [formTitle, setFormTitle] = useState("");
    const [formWeapon, setFormWeapon] = useState<Weapon>("Any");
    const [formAction, setFormAction] = useState<Action>("Push");
    const [formDuration, setFormDuration] = useState<DurationRounds>(1);
    const [formDetails, setFormDetails] = useState("");

    // Track newly created posts for highlight effect
    const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());

    // Track bouncing reaction buttons
    const [bouncingBtns, setBouncingBtns] = useState<Set<string>>(new Set());

    // Touch UI detect (mobile)
    useEffect(() => {
        const mq = window.matchMedia?.("(hover: none) and (pointer: coarse)");
        const update = () => setIsTouchUi(!!mq?.matches);
        update();
        mq?.addEventListener?.("change", update);
        return () => mq?.removeEventListener?.("change", update);
    }, []);

    // Load saved reactions once
    useEffect(() => {
        setUserReactions(loadUserReactions());
    }, []);

    // Load community data (single source of truth)
    useEffect(() => {
        let cancelled = false;

        async function loadCommunity() {
            try {
                setLoading(true);
                setError(null);

                const [mRes, sRes] = await Promise.all([
                    fetch(`/api/community/messages?sort=${sort}&limit=80`, { cache: "no-store" }),
                    fetch(`/api/community/strategies?sort=${sort}&limit=80`, { cache: "no-store" }),
                ]);

                if (!mRes.ok) throw new Error(`Messages failed: ${mRes.status}`);
                if (!sRes.ok) throw new Error(`Strategies failed: ${sRes.status}`);

                // Recommended: API already returns normalized shape
                const mData = await safeJson<{ messages: BasePost[] }>(mRes);
                const sData = await safeJson<{ strategies: Strategy[] }>(sRes);

                if (cancelled) return;
                setMessages(Array.isArray(mData.messages) ? mData.messages : []);
                setStrategies(Array.isArray(sData.strategies) ? sData.strategies : []);
            } catch (e) {
                if (cancelled) return;
                setMessages([]);
                setStrategies([]);
                setError(e instanceof Error ? e.message : "Something went wrong");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadCommunity();
        return () => {
            cancelled = true;
        };
    }, [sort]);

    const items = useMemo(() => {
        const arr = tab === "messages" ? messages : strategies;
        return [...arr].sort((a, b) => {
            if (sort === "top") return sumReactions(b.reactions) - sumReactions(a.reactions);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [tab, sort, messages, strategies]);

    /* ---------------------- MOBILE LONG PRESS PICKER ---------------------- */
    const LONG_PRESS_MS = 420;
    const [pickerPostId, setPickerPostId] = useState<string | null>(null);
    const pressTimerRef = useRef<number | null>(null);
    const longPressFiredRef = useRef(false);

    function clearPressTimer() {
        if (pressTimerRef.current !== null) {
            window.clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
    }

    function startLongPress(postId: string) {
        longPressFiredRef.current = false;
        clearPressTimer();
        pressTimerRef.current = window.setTimeout(() => {
            longPressFiredRef.current = true;
            setPickerPostId(postId);
        }, LONG_PRESS_MS);
    }

    function endLongPress() {
        clearPressTimer();
    }

    useEffect(() => {
        if (!pickerPostId) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPickerPostId(null);
        };

        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            if (!target.closest(".reaction-picker")) setPickerPostId(null);
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("pointerdown", onPointerDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("pointerdown", onPointerDown);
        };
    }, [pickerPostId]);


    /* ---------------------Scroll-Paralax-------------------- */

    useEffect(() => {
        // Respect reduced motion
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        if (reduce) return;

        const cards = Array.from(document.querySelectorAll<HTMLElement>(".board-card"));
        if (!cards.length) return;

        // Give each card a stable "personality"
        for (const el of cards) {
            // only assign once
            if (!el.dataset.px) {
                el.dataset.px = (Math.random() * 2 - 1).toFixed(3); // -1..1
                el.dataset.py = (Math.random() * 2 - 1).toFixed(3);
                el.dataset.ps = (0.6 + Math.random() * 0.8).toFixed(3); // 0.6..1.4 (strength)
            }
        }

        let raf = 0;

        const update = () => {
            raf = 0;

            const vh = window.innerHeight || 1;
            const maxY = 10; // px (keep subtle)
            const maxX = 6;  // px

            for (const el of cards) {
                const rect = el.getBoundingClientRect();

                // center of card in viewport, normalized to -1..1
                const centerY = rect.top + rect.height / 2;
                const n = ((centerY / vh) - 0.5) * 2; // -1..1 (top..bottom)

                const px = Number(el.dataset.px || 0);
                const py = Number(el.dataset.py || 0);
                const ps = Number(el.dataset.ps || 1);

                // Parallax increases away from center slightly
                const y = -n * maxY * py * ps; // invert so it feels “depthy”
                const x = (n * maxX) * px * ps;

                el.style.setProperty("--parallax-x", `${x.toFixed(2)}px`);
                el.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
            }
        };

        const requestUpdate = () => {
            if (raf) return;
            raf = window.requestAnimationFrame(update);
        };

        // Initial + on scroll/resize
        update();
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate);

        return () => {
            window.removeEventListener("scroll", requestUpdate);
            window.removeEventListener("resize", requestUpdate);
            if (raf) window.cancelAnimationFrame(raf);
        };
    }, [tab, sort, messages.length, strategies.length]);



    /* ---------------------- REACTIONS ---------------------- */

    async function reactToPost(id: string, key: ReactionKey, buttonElement?: HTMLElement) {
        const anonId = getAnonId();

        const current = userReactions[id] ?? null;
        const nextSelection: ReactionKey | null = current === key ? null : key;

        // Get current total before change
        const currentPost =
            tab === "messages"
                ? messages.find((m) => m.id === id)
                : strategies.find((s) => s.id === id);
        const prevTotal = currentPost ? sumReactions(currentPost.reactions) : 0;

        // optimistic UI
        const apply = (p: BasePost): BasePost => {
            if (p.id !== id) return p;

            const next = { ...p.reactions };
            if (current) next[current] = Math.max(0, (next[current] ?? 0) - 1);
            if (nextSelection) next[nextSelection] = (next[nextSelection] ?? 0) + 1;

            return { ...p, reactions: next };
        };

        if (tab === "messages") setMessages((prev) => prev.map(apply));
        else setStrategies((prev) => prev.map((p) => apply(p) as Strategy));

        setUserReactions((prev) => {
            const updated: UserReactions = { ...prev, [id]: nextSelection };
            saveUserReactions(updated);
            return updated;
        });

        // Trigger bounce animation on button
        if (nextSelection && buttonElement) {
            const btnKey = `${id}-${key}`;
            setBouncingBtns((prev) => new Set(prev).add(btnKey));
            setTimeout(() => {
                setBouncingBtns((prev) => {
                    const next = new Set(prev);
                    next.delete(btnKey);
                    return next;
                });
            }, 400);

            // Particle burst effect
            const particleContainer = buttonElement.closest(".reactions-wrap");
            if (particleContainer) {
                createParticleBurst(particleContainer as HTMLElement, key, 6);
            }
        }

        // persist
        try {
            const res = await fetch("/api/community/reactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    postType: tab, // "messages" | "strategies"
                    postId: id,
                    anonId,
                    key: nextSelection, // null removes
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Reactions API failed (${res.status}). ${text.slice(0, 120)}`);
            }

            const data = await safeJson<{ counts: Record<ReactionKey, number> }>(res);
            const newTotal = sumReactions(data.counts);

            // Trigger confetti if crossing threshold!
            if (prevTotal < CONFETTI_THRESHOLD && newTotal >= CONFETTI_THRESHOLD) {
                triggerConfetti();
            }

            const applyCounts = (p: BasePost) => (p.id === id ? { ...p, reactions: data.counts } : p);
            if (tab === "messages") setMessages((prev) => prev.map(applyCounts));
            else setStrategies((prev) => prev.map((p) => applyCounts(p) as Strategy));
        } catch (e) {
            console.error("Failed to persist reaction:", e);
            // optional: show a toast later
        }
    }

    /* ---------------------- CREATE POSTS ---------------------- */

    async function submitPost() {
        try {
            if (tab === "messages") {
                const res = await fetch("/api/community/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ author: formAuthor, body: formMessage }),
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Post message failed (${res.status}): ${text.slice(0, 120)}`);
                }

                const data = await safeJson<{ message: BasePost }>(res);
                setMessages((prev) => [data.message, ...prev]);

                // Track as new for highlight effect
                setNewPostIds((prev) => new Set(prev).add(data.message.id));
                setTimeout(() => {
                    setNewPostIds((prev) => {
                        const next = new Set(prev);
                        next.delete(data.message.id);
                        return next;
                    });
                }, 2000);
            } else {
                const res = await fetch("/api/community/strategies", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        author: formAuthor,
                        title: formTitle,
                        body: formDetails,
                        weapon: formWeapon,
                        action: formAction,
                        durationRounds: formDuration,
                    }),
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Post strategy failed (${res.status}): ${text.slice(0, 120)}`);
                }

                const data = await safeJson<{ strategy: Strategy }>(res);
                setStrategies((prev) => [data.strategy, ...prev]);

                // Track as new for highlight effect
                setNewPostIds((prev) => new Set(prev).add(data.strategy.id));
                setTimeout(() => {
                    setNewPostIds((prev) => {
                        const next = new Set(prev);
                        next.delete(data.strategy.id);
                        return next;
                    });
                }, 2000);
            }

            // reset + close
            setFormAuthor("");
            setFormMessage("");
            setFormTitle("");
            setFormWeapon("Any");
            setFormAction("Push");
            setFormDuration(1);
            setFormDetails("");
            setIsModalOpen(false);
        } catch (e) {
            console.error(e);
            alert(e instanceof Error ? e.message : "Failed to post");
        }
    }

    return (
        <main className="community-page">
            <header className="community-head">
                <div>
                    <h1 className="community-title">Community</h1>
                    <p className="community-sub">
                        Leave messages for Sleazy & drop strategies the squad can vote to the top.
                    </p>
                </div>

                <div className="community-controls">
                    <div className="segmented">
                        <button
                            type="button"
                            className={"seg-btn" + (tab === "messages" ? " seg-active" : "")}
                            onClick={() => setTab("messages")}
                        >
                            Message Board
                        </button>
                        <button
                            type="button"
                            className={"seg-btn" + (tab === "strategies" ? " seg-active" : "")}
                            onClick={() => setTab("strategies")}
                        >
                            Strategies
                        </button>
                    </div>

                    <div className="sort-row">
                        <span className="sort-label">Sort</span>
                        <button
                            type="button"
                            className={"sort-chip" + (sort === "new" ? " sort-chip-active" : "")}
                            onClick={() => setSort("new")}
                        >
                            Newest
                        </button>
                        <button
                            type="button"
                            className={"sort-chip" + (sort === "top" ? " sort-chip-active" : "")}
                            onClick={() => setSort("top")}
                        >
                            Top
                        </button>
                    </div>
                </div>
            </header>

            {loading && <div className="community-loading">Loading Community...</div>}
            {error && <div className="community-error">{error}</div>}

            <section className="board">
                <div className="board-grid">
                    {items.map((post) => {
                        const isStrategy = tab === "strategies";
                        const s = post as Strategy;
                        const totalReactions = sumReactions(post.reactions);
                        const isHot = totalReactions >= HOT_THRESHOLD;
                        const isNew = newPostIds.has(post.id);

                        const cardClasses = [
                            "board-card",
                            isStrategy && "board-card-strategy",
                            isNew && "board-card-new",
                        ]
                            .filter(Boolean)
                            .join(" ");

                        return (
                            <article key={post.id} className={cardClasses}>
                                {/* Hot badge for popular posts */}
                                {isHot && (
                                    <div className="hot-badge">
                                        <span className="hot-badge-icon">🔥</span>
                                        <span>HOT</span>
                                    </div>
                                )}

                                {isStrategy && (
                                    <div className="strategy-top">
                                        <div className="strategy-title">{s.title}</div>
                                        <div className="strategy-tags">
                                            <span className="tag">{s.weapon}</span>
                                            <span className="tag">{s.action}</span>
                                            <span className="tag">{s.durationRounds} rounds</span>
                                        </div>
                                    </div>
                                )}

                                <div className="board-body">{post.body}</div>

                                <div className="board-foot">
                                    <div className="board-meta">
                                        <span className="meta-author">{post.author}</span>
                                        <span className="meta-dot">•</span>
                                        <span className="meta-time">
                                            <ClientRelativeTime iso={post.createdAt} />
                                        </span>
                                    </div>

                                    <div className="reactions reactions-wrap">
                                        {REACTIONS.map((r) => {
                                            const btnKey = `${post.id}-${r.key}`;
                                            const isBouncing = bouncingBtns.has(btnKey);
                                            const btnClasses = [
                                                "react-btn",
                                                `react-${r.key}`,
                                                userReactions[post.id] === r.key && "react-btn-active",
                                                isBouncing && "react-btn-bounce",
                                            ]
                                                .filter(Boolean)
                                                .join(" ");

                                            return (
                                            <button
                                                key={r.key}
                                                type="button"
                                                className={btnClasses}
                                                // Mobile-only long press
                                                onPointerDown={() => {
                                                    if (!isTouchUi) return;
                                                    startLongPress(post.id);
                                                }}
                                                onPointerUp={() => {
                                                    if (!isTouchUi) return;
                                                    endLongPress();
                                                }}
                                                onPointerCancel={() => {
                                                    if (!isTouchUi) return;
                                                    endLongPress();
                                                }}
                                                onPointerLeave={() => {
                                                    if (!isTouchUi) return;
                                                    endLongPress();
                                                }}
                                                onClick={(e) => {
                                                    if (isTouchUi && longPressFiredRef.current) {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        return;
                                                    }
                                                    reactToPost(post.id, r.key, e.currentTarget);
                                                }}
                                                aria-label={`React ${r.label}`}
                                                title={r.label}
                                            >
                                                <Image
                                                    src={r.iconSrc}
                                                    alt={r.iconAlt ?? r.label}
                                                    width={18}
                                                    height={18}
                                                    className="react-icon"
                                                    />
                                                <span className={"react-count" + (userReactions[post.id] === r.key ? " react-count-pop" : "")}>
                                                    {post.reactions?.[r.key] ?? 0}
                                                </span>
                                            </button>
                                            );
                                        })}

                                        {isTouchUi && pickerPostId === post.id && (
                                            <div className="reaction-picker" role="menu" aria-label="Choose reaction">
                                                {REACTIONS.map((r) => (
                                                    <button
                                                        key={r.key}
                                                        type="button"
                                                        className={"reaction-picker-btn react-" + r.key}
                                                        role="menuitem"
                                                        onClick={() => {
                                                            reactToPost(post.id, r.key);
                                                            setPickerPostId(null);
                                                        }}
                                                        aria-label={r.label}
                                                        title={r.label}
                                                    >
                                                        <span className="reaction-picker-emoji">{r.iconSrc}</span>
                                                        <span className="reaction-picker-label">{r.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* Floating Action Button */}
            <button type="button" className="fab" onClick={() => setIsModalOpen(true)} aria-label={tab === "messages" ? "Post a message" : "Add a strategy"}>
                <span className="fab-icon">+</span>
                <span className="fab-text">{tab === "messages" ? "Post Message" : "Add Strategy"}</span>
            </button>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true">
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="modal-title">{tab === "messages" ? "Post a message" : "Create a strategy"}</div>
                            <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close">
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            {tab === "messages" ? (
                                <div className="form">
                                    <label className="field">
                                        <span>Message</span>
                                        <textarea
                                            className="input"
                                            placeholder="Leave something for Sleazy / the squad…"
                                            rows={5}
                                            value={formMessage}
                                            onChange={(e) => setFormMessage(e.currentTarget.value)}
                                        />
                                    </label>

                                    <label className="field">
                                        <span>Name (optional)</span>
                                        <input
                                            className="input"
                                            placeholder="Anonymous"
                                            value={formAuthor}
                                            onChange={(e) => setFormAuthor(e.currentTarget.value)}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="form">
                                    <label className="field">
                                        <span>Title</span>
                                        <input
                                            className="input"
                                            placeholder='e.g. "Eco Fake A → B"'
                                            value={formTitle}
                                            onChange={(e) => setFormTitle(e.currentTarget.value)}
                                        />
                                    </label>

                                    <div className="field-grid">
                                        <label className="field">
                                            <span>Choose Weapon</span>
                                            <select
                                                className="input"
                                                value={formWeapon}
                                                onChange={(e) => setFormWeapon(e.currentTarget.value as Weapon)}
                                            >
                                                <option value="Any">Any</option>
                                                <option value="Vandal">Vandal</option>
                                                <option value="Phantom">Phantom</option>
                                                <option value="Operator">Operator</option>
                                                <option value="Sherrif">Sherrif</option>
                                            </select>
                                        </label>

                                        <label className="field">
                                            <span>Choose Action</span>
                                            <select
                                                className="input"
                                                value={formAction}
                                                onChange={(e) => setFormAction(e.currentTarget.value as Action)}
                                            >
                                                <option value="Push">Push</option>
                                                <option value="Hold">Hold</option>
                                                <option value="Fake">Fake</option>
                                                <option value="Lurk">Lurk</option>
                                                <option value="Utility">Utility</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </label>

                                        <label className="field">
                                            <span>Duration</span>
                                            <select
                                                className="input"
                                                value={formDuration}
                                                onChange={(e) => setFormDuration(clampDuration(Number(e.currentTarget.value)))}
                                            >
                                                <option value={1}>1 round</option>
                                                <option value={2}>2 rounds</option>
                                                <option value={3}>3 rounds</option>
                                                <option value={4}>4 rounds</option>
                                                <option value={5}>5 rounds</option>
                                            </select>
                                        </label>
                                    </div>

                                    <label className="field">
                                        <span>Details</span>
                                        <textarea
                                            className="input"
                                            placeholder="Explain the strat clearly…"
                                            rows={5}
                                            value={formDetails}
                                            onChange={(e) => setFormDetails(e.currentTarget.value)}
                                        />
                                    </label>

                                    <label className="field">
                                        <span>Name (optional)</span>
                                        <input
                                            className="input"
                                            placeholder="Anonymous"
                                            value={formAuthor}
                                            onChange={(e) => setFormAuthor(e.currentTarget.value)}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={submitPost}
                                disabled={
                                    tab === "messages"
                                        ? formMessage.trim().length === 0
                                        : formTitle.trim().length === 0 || formDetails.trim().length === 0
                                }
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
