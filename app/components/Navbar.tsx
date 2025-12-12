"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./navbar.css";

type LiveStatus = {
    live: boolean;
};

export default function Navbar() {
    const pathname = usePathname();
    const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        async function fetchLive() {
            try {
                const res = await fetch("/api/twitch/live");
                const data = (await res.json()) as LiveStatus;
                setLiveStatus(data);
            } catch (e) {
                console.error("Failed to fetch live status", e);
                setLiveStatus({ live: false });
            }
        }

        fetchLive();
        const interval = setInterval(fetchLive, 60000);
        return () => clearInterval(interval);
    }, []);

    const isLive = !!liveStatus?.live;

    const links = [
        { href: "/", label: "Home" },
        { href: "/clips", label: "Clips" },
        { href: "/social", label: "Socials" },
        { href: "/discord", label: "Discord" },
    ];

    const isActive = (href: string) =>
        href === "/"
            ? pathname === "/"
            : pathname.startsWith(href);

    return (
        <header className="navbar">
            <div className="navbar-inner">
                {/* Brand on the left */}
                <div className="nav-brand">
                    <div className="nav-brand-mark" />
                    <div className="nav-brand-text">
                        <span className="nav-brand-name">SleazyG_27</span>
                        <span className="nav-brand-sub">Valorant, variety, community</span>
                    </div>
                </div>

                {/* Desktop links */}
                <nav className="nav-links">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={
                                "nav-link" + (isActive(link.href) ? " nav-link-active" : "")
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right side: live status + Twitch link */}
                <div className="nav-right">
                    <a
                        href="https://twitch.tv/SleazyG_27"
                        target="_blank"
                        rel="noreferrer"
                        className="nav-twitch-link"
                    >
                        <span className="nav-live-pill">
                            <span
                                className={
                                    "nav-live-dot" + (isLive ? " nav-live-dot-on" : "")
                                }
                            />
                            <span className="nav-live-text">
                                {isLive ? "Live now" : "Offline"}
                            </span>
                        </span>
                        <span className="nav-twitch-text">Twitch</span>
                    </a>

                    {/* Mobile menu toggle */}
                    <button
                        type="button"
                        className={
                            "nav-toggle" + (isMenuOpen ? " nav-toggle-open" : "")
                        }
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                    >
                        <span />
                        <span />
                    </button>
                </div>
            </div>

            {/* Mobile menu panel */}
            {isMenuOpen && (
                <div className="nav-mobile-menu">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={
                                "nav-mobile-link" +
                                (isActive(link.href) ? " nav-mobile-link-active" : "")
                            }
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <a
                        href="https://twitch.tv/SleazyG_27"
                        target="_blank"
                        rel="noreferrer"
                        className="nav-mobile-twitch"
                    >
                        <span
                            className={
                                "nav-live-dot" + (isLive ? " nav-live-dot-on" : "")
                            }
                        />
                        <span>{isLive ? "Watch live on Twitch" : "Visit Twitch"}</span>
                    </a>
                </div>
            )}
        </header>
    );
}
