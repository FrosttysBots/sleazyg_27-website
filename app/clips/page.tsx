"use client";

import { useEffect, useState } from "react";

type Clip = {
    id: string;
    url: string;
    embedUrl: string;
    title: string;
    thumbnailUrl: string;
    viewCount: number;
    createdAt: string;
    duration: number;
};

export default function ClipsPage() {
    const [clips, setClips] = useState<Clip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeClipId, setActiveClipId] = useState<string | null>(null);

    useEffect(() => {
        async function loadClips() {
            try {
                const res = await fetch("/api/twitch/clips");
                if (!res.ok) throw new Error("Failed to load clips");
                const data = await res.json();
                setClips(data.clips || []);
            } catch (err) {
                console.error(err);
                setError("Could not load clips right now.");
            } finally {
                setLoading(false);
            }
        }

        loadClips();
    }, []);

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString();
    }

    function formatViews(v: number) {
        if (v >= 1000000) return (v / 1000000).toFixed(1) + "M views";
        if (v >= 1000) return (v / 1000).toFixed(1) + "K views";
        return v + " views";
    }

    function formatDuration(d: number) {
        const sec = Math.round(d);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    // For Twitch embed, you must include your domain as `parent`
    // In dev we use localhost; in production change this.
    const TWITCH_PARENT = "https://sleazyg-27-website.vercel.app/"; // change to your domain when deployed

    return (
        <div className="clips-container">
            <header className="clips-header">
                <h1 className="clips-title">Clips & Highlights</h1>
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
                    const embedSrc = `${clip.embedUrl}&parent=${TWITCH_PARENT}&autoplay=true&muted=true`;

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
                                        allowFullScreen={false}
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
        </div>
    );
}
