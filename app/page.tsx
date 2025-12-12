"use client";

import React, { useEffect, useState } from "react";
import "./landing.css";

type LastVod = {
    title: string;
    url: string;
    thumbnailUrl: string;
    createdAt: string;
    duration: string;
    viewCount: number;
};

type LiveStatus = {
    live: boolean;
    title?: string;
    gameName?: string;
    viewerCount?: number;
    startedAt?: string;
    lastVod?: LastVod;
};

export default function Home() {
    const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
    const [liveLoading, setLiveLoading] = useState(true);

    const handleExploreClick = () => {
        const section = document.getElementById("hub-section");
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        async function fetchLive() {
            try {
                const res = await fetch("/api/twitch/live");
                const data = (await res.json()) as LiveStatus;
                setLiveStatus(data);
            } catch (e) {
                console.error("Failed to load live status", e);
                setLiveStatus({ live: false });
            } finally {
                setLiveLoading(false);
            }
        }

        fetchLive();
        const interval = setInterval(fetchLive, 60000);
        return () => clearInterval(interval);
    }, []);

    const isLive = !!liveStatus?.live;
    const hasVod = !isLive && !!liveStatus?.lastVod;
    const vod = liveStatus?.lastVod;
    const twitchParent = "localhost"; // change to your real domain when deployed

    return (
        <main className="landing-container">
            {/* Background Video */}
            <video
                className="bg-video"
                src="/videos/sporty-background.mp4"
                autoPlay
                muted
                loop
                playsInline
            />

            {/* Dark + color overlay for readability */}
            <div className="landing-overlay" />

            {/* Foreground content */}
            <div className="hero-layout">
                <section className="hero-content">
                    <p className="hero-kicker">Valorant / Variety / Community</p>

                    <h1 className="hero-title">SleazyG_27</h1>

                    <p className="hero-subtitle">
                        Clutches, chaos, and comfy vibes. Catch the next spike defuse, or
                        dive into the best moments from stream.
                    </p>

                    <div className="hero-actions">
                        <a
                            href="https://twitch.tv/SleazyG_27"
                            target="_blank"
                            rel="noreferrer"
                            className="hero-btn hero-btn-primary"
                        >
                            <span>Watch live on Twitch</span>
                        </a>

                        <button
                            type="button"
                            className="hero-btn hero-btn-ghost"
                            onClick={handleExploreClick}
                        >
                            Explore the hub
                        </button>
                    </div>

                    <div className="hero-pills">
                        <span className="hero-pill">Ranked grind</span>
                        <span className="hero-pill">Community games</span>
                        <span className="hero-pill">Chill vibes</span>
                    </div>
                </section>

                {/* Right side: quick hub preview */}
                <aside className="hero-preview">
                    <div className="preview-card">
                        <h2 className="preview-title">Clips and highlights</h2>
                        <p className="preview-text">
                            Hover to preview Twitch clips, see the best plays, whiffs, and
                            close rounds.
                        </p>
                    </div>

                    <div className="preview-grid">
                        <a href="/clips" className="preview-chip">
                            <span className="preview-chip-label">Clips</span>
                            <span className="preview-chip-sub">Top Twitch moments</span>
                        </a>
                        <a href="/social" className="preview-chip">
                            <span className="preview-chip-label">Socials</span>
                            <span className="preview-chip-sub">Stay in the loop</span>
                        </a>
                        <a href="/discord" className="preview-chip">
                            <span className="preview-chip-label">Discord</span>
                            <span className="preview-chip-sub">Join the squad</span>
                        </a>
                    </div>
                </aside>
            </div>

            {/* Live or last stream section */}
            {!liveLoading && (isLive || hasVod) && (
                <section className="live-section">
                    <div className="live-card">
                        <div className="live-header">
                            {isLive ? (
                                <span className="live-pill-hero">Live now</span>
                            ) : (
                                <span className="live-pill-offline">Offline</span>
                            )}

                            <div className="live-meta-main">
                                {isLive ? (
                                    <>
                                        <span className="live-title">
                                            {liveStatus?.title || "Live on Twitch"}
                                        </span>
                                        <span className="live-subtitle">
                                            {liveStatus?.gameName
                                                ? "Playing " + liveStatus.gameName
                                                : "Hanging out with chat"}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="live-title">Last stream</span>
                                        <span className="live-subtitle">
                                            {vod?.title || "Catch up on the latest broadcast."}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="live-body">
                            <div className="live-player-wrapper">
                                {isLive ? (
                                    <iframe
                                        className="live-player"
                                        src={
                                            "https://player.twitch.tv/?channel=SleazyG_27&parent=" +
                                            twitchParent +
                                            "&muted=true"
                                        }
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                        allowFullScreen
                                        title="SleazyG_27 live stream"
                                    />
                                ) : (
                                    vod && (
                                        <img
                                            src={vod.thumbnailUrl}
                                            alt={vod.title}
                                            className="live-vod-thumb"
                                        />
                                    )
                                )}
                            </div>

                            <div className="live-side-meta">
                                {isLive && typeof liveStatus?.viewerCount === "number" && (
                                    <div className="live-viewers">
                                        <span className="live-viewers-label">Viewers</span>
                                        <span className="live-viewers-count">
                                            {liveStatus.viewerCount}
                                        </span>
                                    </div>
                                )}

                                {!isLive && vod && (
                                    <div className="live-viewers">
                                        <span className="live-viewers-label">Last stream date</span>
                                        <span className="live-viewers-count">
                                            {new Date(vod.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}

                                {isLive ? (
                                    <a
                                        href="https://twitch.tv/SleazyG_27"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="live-watch-link"
                                    >
                                        Open stream on Twitch
                                    </a>
                                ) : (
                                    vod && (
                                        <a
                                            href={vod.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="live-watch-link"
                                        >
                                            Watch last stream
                                        </a>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Lower section anchor for smooth scroll */}
            <section id="hub-section" className="hub-section">
                <h2 className="hub-title">Welcome to the SleazyG hub</h2>
                <p className="hub-subtitle">
                    Everything in one place: clips, socials, and the community Discord.
                </p>

                <div className="hub-grid">
                    <a href="/clips" className="hub-card">
                        <h3>Watch clips</h3>
                        <p>Preview Twitch clips on hover and jump into the best moments.</p>
                    </a>
                    <a href="/social" className="hub-card">
                        <h3>Follow the journey</h3>
                        <p>
                            Twitch, TikTok, Instagram and more. Never miss an update or
                            stream.
                        </p>
                    </a>
                    <a href="/discord" className="hub-card">
                        <h3>Join the Discord</h3>
                        <p>
                            Hang out off stream, find teammates, and share your own plays and
                            memes.
                        </p>
                    </a>
                </div>
            </section>
        </main>
    );
}
