"use client";

import { useEffect, useState } from "react";
import "./clips.css";

type Clip = {
    id: string;
    url: string;
    title: string;
    thumbnailUrl: string;
    viewCount: number;
    createdAt: string;
    duration: number;
};

type ClipsResponse = {
    clips: Clip[];
    cursor: string | null;
};

export default function ClipsPage() {
    const [clips, setClips] = useState<Clip[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeClipId, setActiveClipId] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    useEffect(() => {
        async function loadInitial() {
            try {
                const res = await fetch("/api/twitch/clips");
                if (!res.ok) throw new Error("Failed to load clips");
                const data = (await res.json()) as ClipsResponse;
                setClips(data.clips || []);
                setNextCursor(data.cursor ?? null);
            } catch (err) {
                console.error(err);
                setError("Could not load clips right now.");
            } finally {
                setLoading(false);
            }
        }

        loadInitial();
    }, []);

    async function loadMore() {
        if (!nextCursor) return;
        setLoadingMore(true);
        try {
            const res = await fetch(
                `/api/twitch/clips?cursor=${encodeURIComponent(nextCursor)}`
            );
            if (!res.ok) throw new Error("Failed to load more clips");
            const data = (await res.json()) as ClipsResponse;

            setClips((prev) => [...prev, ...(data.clips || [])]);
            setNextCursor(data.cursor ?? null);
        } catch (err) {
            console.error(err);
            // You could set an error state here if you want a message.
        } finally {
            setLoadingMore(false);
        }
    }

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString();
    }

    function formatViews(v: number) {
        if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M views";
        if (v >= 1_000) return (v / 1_000).toFixed(1) + "K views";
        return v + " views";
    }

    function formatDuration(d: number) {
        const sec = Math.round(d);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    // IMPORTANT: Twitch expects just the domain here (no https, no trailing slash)
    const TWITCH_PARENT = "sleazyg-27-website.vercel.app";

    function getEmbedSrc(clipId: string) {
        return `https://clips.twitch.tv/embed?clip=${encodeURIComponent(
            clipId
        )}&parent=${TWITCH_PARENT}&autoplay=true&muted=true`;
    }

    return (
        <div className="clips-container">
            <header className="clips-header">
                <h1 className="clips-title">Clips &amp; Highlights</h1>
                <p className="clips-subtitle">
                    Pulled directly from Sleazy&apos;s Twitch channel. Hover to preview,
                    click to watch on Twitch.
                </p>
            </header>

            {loading && <p>Loading clips…</p>}
            {error && <p>{error}</p>}
            {!loading && !error && clips.length === 0 && (
                <p>No clips found yet. Check back after the next stream!</p>
            )}

            <div className="clips-grid">
                {clips.map((clip) => {
                    const isActive = activeClipId === clip.id;
                    const embedSrc = getEmbedSrc(clip.id);

                    return (
                        <a
                            key={clip.id}
                            href={clip.url}
                            target="_blank"
                            rel="noreferrer"
                            className="clip-card"
                            onMouseEnter={() => setActiveClipId(clip.id)}
                            onMouseLeave={() => setActiveClipId(null)}
                        >
                            <div className="clip-thumb-wrapper">
                                {isActive ? (
                                    <iframe
                                        className="clip-embed"
                                        src={embedSrc}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                        allowFullScreen
                                        title={clip.title}
                                    />
                                ) : (
                                    <>
                                        <img
                                            src={clip.thumbnailUrl}
                                            alt={clip.title}
                                            className="clip-thumb"
                                        />
                                        <span className="clip-length-pill">
                                            {formatDuration(clip.duration)}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="clip-body">
                                <div className="clip-header-gradient">
                                    <div className="clip-title">{clip.title}</div>
                                    <div className="clip-meta">
                                        <span>{formatViews(clip.viewCount)}</span>
                                        <span>{formatDate(clip.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>

            {/* Load more button */}
            {!loading && !error && nextCursor && (
                <div className="clips-load-more">
                    <button
                        type="button"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="clips-load-more-btn"
                    >
                        {loadingMore ? "Loading more..." : "Load more clips"}
                    </button>
                </div>
            )}
        </div>
    );
}
