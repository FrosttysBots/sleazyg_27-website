import "./social.css";
import LazyEmbed from "../components/LazyEmbed";

type Platform = "twitch" | "kick" | "youtube" | "instagram" | "tiktok" | "x" | "snapchat";

type SocialLink = {
    name: string;
    handle: string;
    description: string;
    url: string;
    accent: "purple" | "red" | "pink" | "green" | "blue" | "yellow";
    tag?: string;
    platform: Platform;
};

const primarySocials: SocialLink[] = [
    {
        name: "Twitch",
        handle: "twitch.tv/SleazyG_27",
        description: "Main home for streams, clutches, and late-night vibes.",
        url: "https://twitch.tv/SleazyG_27",
        accent: "purple",
        tag: "Live streams",
        platform: "twitch",
    },
    {
        name: "Kick",
        handle: "kick.com/sleazyg27",
        description: "Alt stream home - same enrgy, same Sleazy.",
        url: "https://kick.com/sleazyg27",
        accent: "green",
        tag: "Live streams",
        platform: "kick",
    },
    {
        name: "YouTube",
        handle: "@bluntbaby420",
        description: "Long-form content, VODs, and highlight edits.",
        url: "https://www.youtube.com/@bluntbaby420",
        accent: "red",
        tag: "VODs & highlights",
        platform: "youtube",
    },
    {
        name: "Instagram",
        handle: "@sleazyg_27",
        description: "IRL moments, clips, and behind-the-scenes posts.",
        url: "https://instagram.com/sleazyg_27",
        accent: "pink",
        tag: "Photos & reels",
        platform: "instagram",
    },
];

const secondarySocials: SocialLink[] = [
    {
        name: "TikTok",
        handle: "@blunt_baby27",
        description: "Short clips, funny moments, and trending edits.",
        url: "https://tiktok.com/@blunt_baby27",
        accent: "green",
        platform: "tiktok",
    },
    {
        name: "X (Twitter)",
        handle: "@sportyg27",
        description: "Updates, announcements, and random thoughts.",
        url: "https://x.com/sportyg27",
        accent: "blue",
        platform: "x",
    },
    {
        name: "Snapchat",
        handle: "@sleazyg_27",
        description: "Behind-the-scenes snaps, quick updates, and daily vibes.",
        url: "https://www.snapchat.com/add/sleazyg_27",
        accent: "yellow",
        platform: "snapchat",
    },
];

const allSocials: SocialLink[] = [...primarySocials, ...secondarySocials];

const TWITCH_PARENT = process.env.NEXT_PUBLIC_TWITCH_PARENT ?? "localhost";

const twitchEmbedSrc = `https://player.twitch.tv/?channel=SleazyG_27&parent=${TWITCH_PARENT}&muted=true`;

// TODO: replace VIDEO_ID_HERE with a real video or playlist ID
const youtubeEmbedSrc = "https://www.youtube.com/embed/pLoDxSjqsZ8";

function SocialIcon({ platform }: { platform: Platform }) {
    switch (platform) {
        case "twitch":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M4 3h16v10.5L16 17H12.5L10 19.5H8v-2.5H4V3z"
                        fill="currentColor"
                    />
                    <path d="M14 7h2v5h-2zM10.5 7h2v5h-2z" fill="#000" />
                </svg>
            );

        case "kick":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M6 5h4v6l5-6h5l-6.5 7.3L20 19h-5.2l-4-4.6-0.8.9V19H6V5z"
                        fill="currentColor"
                    />
                </svg>
            );
        case "youtube":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M21 8.2s-.2-1.5-.8-2.1c-.8-.9-1.6-.9-2-1C15.7 5 12 5 12 5h0s-3.7 0-6.2.1c-.4 0-1.2.1-2 .9C3.2 6.7 3 8.2 3 8.2S2.8 9.9 2.8 11.6v1.7S3 15.9 3.8 16.6c.8.9 1.8.9 2.2 1 1.6.1 6 .1 6 .1s3.7 0 6.2-.1c.4 0 1.2-.1 2-.9.6-.6.8-2.3.8-2.3s.2-1.7.2-3.3v-1.7C21.2 9.9 21 8.2 21 8.2z"
                        fill="currentColor"
                    />
                    <path d="M10 9l4 2.5-4 2.5z" fill="#000" />
                </svg>
            );
        case "instagram":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect
                        x="3.5"
                        y="3.5"
                        width="17"
                        height="17"
                        rx="5"
                        ry="5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        fill="none"
                    />
                    <circle
                        cx="12"
                        cy="12"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        fill="none"
                    />
                    <circle cx="17" cy="7" r="1.3" fill="currentColor" />
                </svg>
            );
        case "tiktok":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M14.5 5.5c.5 1.4 1.6 2.5 3 2.9V11c-1.2-.1-2.3-.6-3.2-1.4v4.7c0 2.5-1.9 4.5-4.4 4.7C7.9 19.2 6 17.4 6 15.1c0-2.4 1.9-4.3 4.3-4.4.4 0 .7 0 1 .1v2.3a2.1 2.1 0 00-1-.2c-1.1.1-1.9 1-1.9 2.1 0 1.2 1 2.1 2.2 2.1 1.1-.1 1.9-1 1.9-2.2V5.5h2z"
                        fill="currentColor"
                    />
                </svg>
            );
        case "x":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M6 5l5 6.6L6.2 19H8l3.8-4.7L15 19h3l-5.2-6.9L18 5h-1.8l-3.6 4.5L10 5H6z"
                        fill="currentColor"
                    />
                </svg>
            );

        case "snapchat":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M12 2c2.6 0 4.7 2.1 4.7 4.7v3.2c0 .7.6 1.3 1.3 1.3h.5c.5 0 .9.4.9.9 0 .3-.2.6-.5.8-.6.3-1.3.4-2 .5-.4 1.7-1.5 3.2-3 4.1l.3 1.4c.1.5-.2 1-.7 1.1-.7.1-1.4.2-2.1.2s-1.4-.1-2.1-.2c-.5-.1-.8-.6-.7-1.1l.3-1.4c-1.5-.9-2.6-2.4-3-4.1-.7-.1-1.4-.2-2-.5-.3-.2-.5-.5-.5-.8 0-.5.4-.9.9-.9H6c.7 0 1.3-.6 1.3-1.3V6.7C7.3 4.1 9.4 2 12 2z"
                        fill="currentColor"
                    />
                </svg>
            );

        default:
            return null;
    }
}

export default function SocialPage() {
    return (
        <div className="social-page-wrapper">
            {/* HERO */}
            <section className="social-hero">
                <div className="social-hero-content">
                    <h1 className="social-hero-title">Find SleazyG_27 Online</h1>
                    <p className="social-hero-subtitle">
                        All her platforms in one place. Follow for streams, VODs, clips,
                        and behind-the-scenes moments, wherever you like to hang out.
                    </p>

                    <div className="social-hero-tags">
                        <span>Valorant</span>
                        <span>Variety Gaming</span>
                        <span>Community</span>
                        <span>Comfy vibes</span>
                    </div>
                </div>

                {/* icon quick links */}
                <div className="social-quick-links">
                    {allSocials.map((s) => (
                        <a
                            key={s.name}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`social-quick-link social-accent-${s.accent}`}
                        >
                            <span className="social-quick-link-icon">
                                <SocialIcon platform={s.platform} />
                            </span>
                            <span className="quick-link-name">{s.name}</span>
                        </a>
                    ))}
                </div>
            </section>

            {/* MAIN PLATFORMS */}
            <section className="social-section">
                <h2 className="social-section-title">Main platforms</h2>
                <p className="social-section-subtitle">
                    These are the core places to watch streams and keep up with new
                    content.
                </p>

                <div className="social-grid">
                    {primarySocials.map((s, i) => (
                        <a
                            key={s.name}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`social-card social-accent-${s.accent}`}
                            style={{ animationDelay: `${i * 0.12}s` }}
                        >
                            <div className="social-card-icon-circle">
                                <SocialIcon platform={s.platform} />
                            </div>

                            <div className="social-card-header">
                                <h3 className="social-name">{s.name}</h3>
                                {s.tag && <span className="social-tag-pill">{s.tag}</span>}
                            </div>

                            <p className="social-handle">{s.handle}</p>
                            <p className="social-description">{s.description}</p>
                        </a>
                    ))}
                </div>
            </section>

            {/* SECONDARY PLATFORMS */}
            <section className="social-section">
                <h2 className="social-section-title">More socials</h2>
                <p className="social-section-subtitle">
                    Extra places where you can see clips, updates, and hang with the
                    community.
                </p>

                <div className="social-grid secondary">
                    {secondarySocials.map((s, i) => (
                        <a
                            key={s.name}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`social-card social-secondary social-accent-${s.accent}`}
                            style={{ animationDelay: `${i * 0.12}s` }}
                        >
                            <div className="social-card-icon-circle small">
                                <SocialIcon platform={s.platform} />
                            </div>
                            <h3 className="social-name">{s.name}</h3>
                            <p className="social-handle">{s.handle}</p>
                            <p className="social-description">{s.description}</p>
                        </a>
                    ))}
                </div>
            </section>

            {/* EMBEDS */}
            <section className="social-section embeds">
                <h2 className="social-section-title">Previews</h2>
                <p className="social-section-subtitle">
                    Get a quick look at what she is creating on key platforms.
                </p>

                <div className="social-embeds-grid">
                    {/* Twitch preview */}
                    <div className="embed-card">
                        <h3 className="embed-title">Twitch channel</h3>
                        <p className="embed-subtitle">
                            Watch the stream directly from your browser.
                        </p>
                        <div className="embed-frame-wrapper">
                            <LazyEmbed
                                className="embed-frame"
                                src={twitchEmbedSrc}
                                title="Twitch preview"
                            />
                        </div>
                    </div>

                    {/* YouTube preview */}
                    <div className="embed-card">
                        <h3 className="embed-title">YouTube content</h3>
                        <p className="embed-subtitle">
                            A peek at her latest video or playlist.
                        </p>
                        <div className="embed-frame-wrapper">
                            <LazyEmbed
                                className="embed-frame"
                                src={youtubeEmbedSrc}
                                title="YouTube preview"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
