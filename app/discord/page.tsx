import "./discord.css";

const DISCORD_INVITE = "https://discord.gg/Vrce9JnUtM"; // TODO: replace

export default function DiscordPage() {
    return (
        <div className="discord-page-wrapper">
            {/* HERO */}
            <section className="discord-hero">
                <div className="discord-hero-main">
                    <h1 className="discord-title">Join the SleazyG_27 Discord</h1>
                    <p className="discord-subtitle">
                        Hang out off stream, find teammates, share your clips, and stay up
                        to date with stream announcements and community events.
                    </p>

                    <div className="discord-tags">
                        <span>Valorant squads</span>
                        <span>Watch parties</span>
                        <span>Community nights</span>
                        <span>Chill chat</span>
                    </div>

                    <div className="discord-actions">
                        <a
                            href={DISCORD_INVITE}
                            target="_blank"
                            rel="noreferrer"
                            className="discord-btn discord-btn-primary"
                        >
                            Join the Discord
                        </a>
                        <a
                            href={DISCORD_INVITE}
                            target="_blank"
                            rel="noreferrer"
                            className="discord-btn discord-btn-ghost"
                        >
                            Open in Discord
                        </a>
                    </div>
                </div>

                {/* Right side: feature chips */}
                <div className="discord-hero-side">
                    <div className="discord-pill">
                        <span className="pill-title">Looking for group</span>
                        <span className="pill-desc">
                            Find teammates for ranked, customs, and community games.
                        </span>
                    </div>
                    <div className="discord-pill">
                        <span className="pill-title">Announcements</span>
                        <span className="pill-desc">
                            Go live pings, schedule updates, and special event info.
                        </span>
                    </div>
                    <div className="discord-pill">
                        <span className="pill-title">Clips & media</span>
                        <span className="pill-desc">
                            Share your best plays, memes, and art with the community.
                        </span>
                    </div>
                </div>
            </section>

            {/* WHAT'S INSIDE */}
            <section className="discord-section">
                <h2 className="discord-section-title">What&apos;s inside the server</h2>
                <p className="discord-section-subtitle">
                    A cozy place to hang out with people who enjoy the same chaos you see
                    on stream.
                </p>

                <div className="discord-grid">
                    <div className="discord-card">
                        <h3 className="discord-card-title">Game lobbies</h3>
                        <p className="discord-card-text">
                            Role-based channels for Valorant and other games, pingable roles,
                            and voice channels for ranked and customs.
                        </p>
                    </div>
                    <div className="discord-card">
                        <h3 className="discord-card-title">Community & chill</h3>
                        <p className="discord-card-text">
                            General chat, media channels, pets, food, and everything in
                            between. Perfect for hanging out between streams.
                        </p>
                    </div>
                    <div className="discord-card">
                        <h3 className="discord-card-title">Announcements & events</h3>
                        <p className="discord-card-text">
                            Stream schedule, special events, Discord-only movie nights, and
                            more to keep everyone in the loop.
                        </p>
                    </div>
                </div>
            </section>

            {/* SNAPSHOT / WIDGET PLACEHOLDER */}
            <section className="discord-section snapshot">
                <h2 className="discord-section-title">Server snapshot</h2>
                <p className="discord-section-subtitle">
                    Here&apos;s a quick look at the community space. Join in and say hi.
                </p>

                <div className="discord-snapshot-grid">
                    <div className="discord-stats-card">
                        <div className="discord-stat-row">
                            <span className="stat-label">Community vibe</span>
                            <span className="stat-value">Cozy but cracked</span>
                        </div>
                        <div className="discord-stat-row">
                            <span className="stat-label">Typical activity</span>
                            <span className="stat-value">Evenings & weekends</span>
                        </div>
                        <div className="discord-stat-row">
                            <span className="stat-label">Content focus</span>
                            <span className="stat-value">Valorant, variety, and chaos</span>
                        </div>
                        <p className="discord-stat-note">
                            Exact member / online counts can be added later with a Discord
                            widget or bot integration.
                        </p>
                    </div>

                    <div className="discord-widget-card">
                        <div className="discord-widget-frame">
                            <iframe
                                src="https://discord.com/widget?id=725246940647784528&theme=dark"
                                width="100%"
                                height="400"
                                frameBorder="0"
                                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
