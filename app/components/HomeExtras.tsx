"use client";

import { useEffect, useMemo, useState } from "react";

type Clip = {
    id: string;
    url: string;
    embedUrl: string;
    clipSlug: string;
    title: string;
    thumbnailUrl: string;
    viewCount: number;
    createdAt: string;
    duration: number;
};

type Segment = {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    category: string;
    isCanceled: boolean;
};

function formatLocal(dtIso: string) {
    const d = new Date(dtIso);
    return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function HomeExtras() {
    const [clips, setClips] = useState<Clip[]>([]);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [activeClip, setActiveClip] = useState<Clip | null>(null);

    const parentHost = useMemo(() => {
        // MUST be hostname only, e.g. "sleazyg-27-website.vercel.app"
        return (process.env.NEXT_PUBLIC_TWITCH_PARENT ?? "localhost").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/twitch/clips?first=3&mode=recent");
                const data = await res.json();
                setClips(data.clips ?? []);
            } catch { }
        })();

        (async () => {
            try {
                const res = await fetch("/api/twitch/schedule");
                const data = await res.json();
                const upcoming = (data.segments ?? []).filter((s: Segment) => !s.isCanceled);
                setSegments(upcoming);
            } catch { }
        })();
    }, []);

    const embedSrc = activeClip
        ? `https://clips.twitch.tv/embed?clip=${encodeURIComponent(activeClip.clipSlug)}&parent=${encodeURIComponent(parentHost)}&autoplay=true&muted=false`
        : "";

    return (
        <section className="home-extras">
            {/* Latest clips */}
            <div className="home-block">
                <div className="home-block-head">
                    <h2 className="home-block-title">Latest Clips</h2>
                    <a className="home-block-link" href="/clips">View all →</a>
                </div>

                <div className="home-clips-row">
                    {clips.map((c) => (
                        <button
                            key={c.id}
                            className="home-clip-card"
                            onClick={() => setActiveClip(c)}
                            type="button"
                            aria-label={`Play clip: ${c.title}`}
                            title={c.title}
                        >
                            <div className="home-clip-thumb">
                                <img src={c.thumbnailUrl} alt={c.title} />
                                <span className="home-clip-play">▶</span>
                            </div>
                            <div className="home-clip-title">{c.title}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Schedule */}
            <div className="home-block">
                <div className="home-block-head">
                    <h2 className="home-block-title">Stream Schedule</h2>
                    <span className="home-block-sub">Pulled from Twitch</span>
                </div>

                {segments.length === 0 ? (
                    <div className="home-empty">No schedule found yet — check back soon.</div>
                ) : (
                    <div className="home-schedule">
                        {segments.slice(0, 5).map((s) => (
                            <div key={s.id} className="home-schedule-item">
                                <div className="home-schedule-time">
                                    <div className="home-schedule-start">{formatLocal(s.startTime)}</div>
                                    <div className="home-schedule-end">→ {formatLocal(s.endTime)}</div>
                                </div>
                                <div className="home-schedule-meta">
                                    <div className="home-schedule-title">{s.title || "Stream"}</div>
                                    {s.category ? <div className="home-schedule-cat">{s.category}</div> : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Clip modal */}
            {activeClip && (
                <div className="clip-modal" role="dialog" aria-modal="true" onClick={() => setActiveClip(null)}>
                    <div className="clip-modal-inner" onClick={(e) => e.stopPropagation()}>
                        <div className="clip-modal-top">
                            <div className="clip-modal-title">{activeClip.title}</div>
                            <button className="clip-modal-close" onClick={() => setActiveClip(null)} type="button">✕</button>
                        </div>

                        <div className="clip-modal-frame">
                            <iframe
                                src={embedSrc}
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                title="Clip player"
                            />
                        </div>

                        <div className="clip-modal-actions">
                            <a className="clip-modal-link" href={activeClip.url} target="_blank" rel="noreferrer">
                                Open on Twitch →
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
