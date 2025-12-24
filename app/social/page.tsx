import "./social.css";
import LazyEmbed from "../components/LazyEmbed";
import {
    TwitchIcon,
    YouTubeIcon,
    InstagramIcon,
    TikTokIcon,
    XIcon,
    KickIcon,
    SnapchatIcon,
} from "../components/SocialIcons";

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
    const iconClass = "social-platform-icon";

    switch (platform) {
        case "twitch":
            return <TwitchIcon className={iconClass} />;
        case "kick":
            return <KickIcon className={iconClass} />;
        case "youtube":
            return <YouTubeIcon className={iconClass} />;
        case "instagram":
            return <InstagramIcon className={iconClass} />;
        case "tiktok":
            return <TikTokIcon className={iconClass} />;
        case "x":
            return <XIcon className={iconClass} />;
        case "snapchat":
            return <SnapchatIcon className={iconClass} />;
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
