"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

    // Close mobile menu whenever route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const isLive = !!liveStatus?.live;

    const links = useMemo(
        () => [
            { href: "/", label: "Home" },
            { href: "/clips", label: "Clips" },
            { href: "/community", label: "Community"},
            { href: "/social", label: "Socials" },
            { href: "/discord", label: "Discord" },
        ],
        []
    );

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <header className="navbar">
            <div className="navbar-inner">
                {/* Brand */}
                <Link href="/" className="nav-brand" aria-label="Go home">
                    <span className="nav-brand-mark" />
                    <span className="nav-brand-text">
                        <span className="nav-brand-name">SleazyG_27</span>
                        <span className="nav-brand-sub">Valorant, variety, community</span>
                    </span>
                </Link>

                {/* Desktop links */}
                <nav className="nav-links" aria-label="Primary navigation">
                    {links.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={"nav-link" + (active ? " nav-link-active" : "")}
                                aria-current={active ? "page" : undefined}
                            >
                                <span className="nav-link-dot" aria-hidden="true" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right side */}
                <div className="nav-right">
                    <a
                        href="https://twitch.tv/SleazyG_27"
                        target="_blank"
                        rel="noreferrer"
                        className="nav-twitch-link"
                        aria-label={isLive ? "SleazyG_27 is live on Twitch" : "SleazyG_27 on Twitch"}
                    >
                        <span className={"nav-live-pill" + (isLive ? " nav-live-pill-on" : "")}>
                            <span className={"nav-live-dot" + (isLive ? " nav-live-dot-on" : "")} />
                            <span className="nav-live-text">{isLive ? "Live now" : "Offline"}</span>
                        </span>
                        <span className="nav-twitch-text">Twitch</span>
                    </a>

                    {/* Mobile toggle */}
                    <button
                        type="button"
                        className={"nav-toggle" + (isMenuOpen ? " nav-toggle-open" : "")}
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                    >
                        <span />
                        <span />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="nav-mobile-menu">
                    {links.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={"nav-mobile-link" + (active ? " nav-mobile-link-active" : "")}
                            >
                                <span className="nav-mobile-dot" aria-hidden="true" />
                                {link.label}
                            </Link>
                        );
                    })}

                    <a
                        href="https://twitch.tv/SleazyG_27"
                        target="_blank"
                        rel="noreferrer"
                        className="nav-mobile-twitch"
                    >
                        <span className={"nav-live-dot" + (isLive ? " nav-live-dot-on" : "")} />
                        <span>{isLive ? "Watch live on Twitch" : "Visit Twitch"}</span>
                    </a>
                </div>
            )}
        </header>
    );
}
