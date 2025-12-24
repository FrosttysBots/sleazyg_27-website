"use client";

import React, { useEffect, useState } from "react";
import "./landing.css";
import HomeExtras from "./components/HomeExtras";
import LazyEmbed from "./components/LazyEmbed";

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
    const [uptime, setUptime] = useState("");

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

    // Calculate uptime
    useEffect(() => {
        if (!liveStatus?.live || !liveStatus?.startedAt) {
            setUptime("");
            return;
        }

        const updateUptime = () => {
            const start = new Date(liveStatus.startedAt!).getTime();
            const now = Date.now();
            const diff = now - start;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setUptime(`${hours}h ${minutes}m`);
        };

        updateUptime();
        const interval = setInterval(updateUptime, 60000);
        return () => clearInterval(interval);
    }, [liveStatus?.live, liveStatus?.startedAt]);

    const isLive = !!liveStatus?.live;
    const hasVod = !isLive && !!liveStatus?.lastVod;
    const vod = liveStatus?.lastVod;
    const twitchParent =
        typeof window !== "undefined" ? window.location.hostname : "localhost";

    return (
        <main className="esports-landing">
            {/* Animated background grid */}
            <div className="esports-grid-bg" />

            {/* Scanline overlay */}
            <div className="esports-scanlines" />

            {/* Hero Section - Stream Focus */}
            <section className="esports-hero">
                {/* Top bar with branding */}
                <div className="esports-topbar">
                    <div className="esports-brand">
                        <span className="esports-brand-icon">◆</span>
                        <span className="esports-brand-name">SLEAZYG_27</span>
                    </div>
                    <div className="esports-tagline">
                        VALORANT // VARIETY // COMMUNITY
                    </div>
                </div>

                {/* Main content grid */}
                <div className="esports-main">
                    {/* Left side - Stream player */}
                    <div className="esports-player-section">
                        {/* HUD Frame */}
                        <div className="hud-frame">
                            <div className="hud-corner hud-corner-tl" />
                            <div className="hud-corner hud-corner-tr" />
                            <div className="hud-corner hud-corner-bl" />
                            <div className="hud-corner hud-corner-br" />

                            {/* Status badge */}
                            <div className={`hud-status ${isLive ? 'hud-status-live' : 'hud-status-offline'}`}>
                                <span className="hud-status-dot" />
                                <span className="hud-status-text">
                                    {isLive ? 'LIVE' : 'OFFLINE'}
                                </span>
                            </div>

                            {/* Player wrapper */}
                            <div className="esports-player-wrapper">
                                {liveLoading ? (
                                    <div className="esports-player-loading">
                                        <div className="loading-spinner" />
                                        <span>CONNECTING...</span>
                                    </div>
                                ) : (
                                    <LazyEmbed
                                        className="esports-player"
                                        src={
                                            "https://player.twitch.tv/?channel=SleazyG_27&parent=" +
                                            encodeURIComponent(twitchParent) +
                                            "&muted=true"
                                        }
                                        allow="autoplay; encrypted-media; picture-in-picture"
                                        title="SleazyG_27 Twitch channel"
                                    />
                                )}
                            </div>

                            {/* Bottom info bar */}
                            <div className="hud-info-bar">
                                <div className="hud-info-item">
                                    <span className="hud-info-label">GAME</span>
                                    <span className="hud-info-value">
                                        {isLive ? (liveStatus?.gameName || 'Just Chatting') : (hasVod ? 'Last Stream' : '—')}
                                    </span>
                                </div>
                                <div className="hud-info-divider" />
                                <div className="hud-info-item">
                                    <span className="hud-info-label">
                                        {isLive ? 'VIEWERS' : 'DATE'}
                                    </span>
                                    <span className="hud-info-value hud-info-highlight">
                                        {isLive
                                            ? (liveStatus?.viewerCount?.toLocaleString() || '—')
                                            : (hasVod ? new Date(vod!.createdAt).toLocaleDateString() : '—')
                                        }
                                    </span>
                                </div>
                                {isLive && uptime && (
                                    <>
                                        <div className="hud-info-divider" />
                                        <div className="hud-info-item">
                                            <span className="hud-info-label">UPTIME</span>
                                            <span className="hud-info-value">{uptime}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stream title below player */}
                        <div className="esports-stream-title">
                            <span className="stream-title-text">
                                {isLive
                                    ? (liveStatus?.title || 'Live on Twitch')
                                    : (hasVod ? vod!.title : 'Stream offline - Check back soon!')
                                }
                            </span>
                        </div>
                    </div>

                    {/* Right side - Quick actions */}
                    <div className="esports-sidebar">
                        {/* Primary CTA */}
                        <a
                            href="https://twitch.tv/SleazyG_27"
                            target="_blank"
                            rel="noreferrer"
                            className="esports-cta-primary"
                        >
                            <span className="cta-icon">▶</span>
                            <span className="cta-text">
                                {isLive ? 'JOIN STREAM' : 'FOLLOW CHANNEL'}
                            </span>
                            <span className="cta-arrow">→</span>
                        </a>

                        {/* Quick nav cards */}
                        <div className="esports-nav-grid">
                            <a href="/clips" className="esports-nav-card">
                                <div className="nav-card-icon">🎬</div>
                                <div className="nav-card-content">
                                    <span className="nav-card-title">CLIPS</span>
                                    <span className="nav-card-sub">Top Moments</span>
                                </div>
                                <div className="nav-card-arrow">›</div>
                            </a>

                            <a href="/community" className="esports-nav-card">
                                <div className="nav-card-icon">💬</div>
                                <div className="nav-card-content">
                                    <span className="nav-card-title">COMMUNITY</span>
                                    <span className="nav-card-sub">Messages & Strats</span>
                                </div>
                                <div className="nav-card-arrow">›</div>
                            </a>

                            <a href="/social" className="esports-nav-card">
                                <div className="nav-card-icon">📱</div>
                                <div className="nav-card-content">
                                    <span className="nav-card-title">SOCIALS</span>
                                    <span className="nav-card-sub">Stay Connected</span>
                                </div>
                                <div className="nav-card-arrow">›</div>
                            </a>

                            <a href="/discord" className="esports-nav-card esports-nav-card-discord">
                                <div className="nav-card-icon">🎮</div>
                                <div className="nav-card-content">
                                    <span className="nav-card-title">DISCORD</span>
                                    <span className="nav-card-sub">Join the Squad</span>
                                </div>
                                <div className="nav-card-arrow">›</div>
                            </a>
                        </div>

                        {/* Stats panel */}
                        <div className="esports-stats-panel">
                            <div className="stats-header">
                                <span className="stats-header-icon">◇</span>
                                <span>QUICK STATS</span>
                            </div>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-value">VAL</span>
                                    <span className="stat-label">Main Game</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">CHILL</span>
                                    <span className="stat-label">Vibes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Angled divider */}
            <div className="esports-divider">
                <div className="divider-line" />
                <span className="divider-text">FEATURED CONTENT</span>
                <div className="divider-line" />
            </div>

            {/* Featured section */}
            <section className="esports-featured">
                <HomeExtras />
            </section>
        </main>
    );
}
