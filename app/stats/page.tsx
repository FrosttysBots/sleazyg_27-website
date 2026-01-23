"use client";

import { useEffect, useState } from "react";
import "./stats.css";

type TopAgent = {
    agent: string;
    games: number;
};

type RecentMatch = {
    id: string;
    map: string;
    mode: string;
    date: string;
    agent: string;
    kills: number;
    deaths: number;
    assists: number;
    won: boolean;
    score: string;
};

type WeaponStats = {
    weaponId: string;
    weaponName: string;
    kills: number;
    headshots: number;
};

type ValorantStats = {
    account: {
        name: string;
        tag: string;
        level: number;
        card: {
            small: string;
            large: string;
            wide: string;
        };
    };
    rank: {
        current: string;
        tier: number;
        rr: number;
        elo: number;
        lastChange: number;
        peakRank: string | null;
        peakSeason: string | null;
    } | null;
    recentStats: {
        gamesPlayed: number;
        wins: number;
        losses: number;
        winRate: string;
        kills: number;
        deaths: number;
        assists: number;
        kd: string;
        headshotPercent: string;
        topAgents: TopAgent[];
    };
    recentMatches: RecentMatch[];
    weaponStats?: WeaponStats[];
    lastUpdated: string;
};

// Rank tier to color mapping
function getRankColor(tier: number): string {
    if (tier >= 24) return "#ff4654"; // Radiant
    if (tier >= 21) return "#ff4654"; // Immortal
    if (tier >= 18) return "#b388ff"; // Ascendant
    if (tier >= 15) return "#59c9a5"; // Diamond
    if (tier >= 12) return "#22d3ee"; // Platinum
    if (tier >= 9) return "#ffd700"; // Gold
    if (tier >= 6) return "#c0c0c0"; // Silver
    if (tier >= 3) return "#cd7f32"; // Bronze
    return "#6b7280"; // Iron/Unranked
}

// Get rank icon URL from Henrik's CDN or local mapping
function getRankIcon(tierName: string): string {
    // Map tier names to rank icon URLs
    const tier = tierName.toLowerCase().replace(/\s+/g, "");
    return `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${getTierNumber(tierName)}/largeicon.png`;
}

function getTierNumber(tierName: string): number {
    const tierMap: Record<string, number> = {
        "iron 1": 3, "iron 2": 4, "iron 3": 5,
        "bronze 1": 6, "bronze 2": 7, "bronze 3": 8,
        "silver 1": 9, "silver 2": 10, "silver 3": 11,
        "gold 1": 12, "gold 2": 13, "gold 3": 14,
        "platinum 1": 15, "platinum 2": 16, "platinum 3": 17,
        "diamond 1": 18, "diamond 2": 19, "diamond 3": 20,
        "ascendant 1": 21, "ascendant 2": 22, "ascendant 3": 23,
        "immortal 1": 24, "immortal 2": 25, "immortal 3": 26,
        "radiant": 27,
    };
    return tierMap[tierName.toLowerCase()] || 0;
}

export default function StatsPage() {
    const [stats, setStats] = useState<ValorantStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Comparison state
    const [compareMode, setCompareMode] = useState(false);
    const [compareRiotId, setCompareRiotId] = useState("");
    const [compareStats, setCompareStats] = useState<ValorantStats | null>(null);
    const [compareLoading, setCompareLoading] = useState(false);
    const [compareError, setCompareError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/valorant/stats");
                if (!res.ok) throw new Error("Failed to fetch stats");
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    async function handleCompare(e: React.FormEvent) {
        e.preventDefault();
        if (!compareRiotId.includes("#")) {
            setCompareError("Invalid format. Use: Name#TAG");
            return;
        }

        setCompareLoading(true);
        setCompareError(null);
        setCompareStats(null);

        try {
            const res = await fetch("/api/valorant/compare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ riotId: compareRiotId }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setCompareStats(data);
        } catch (err) {
            setCompareError(err instanceof Error ? err.message : "Failed to fetch stats");
        } finally {
            setCompareLoading(false);
        }
    }

    function clearComparison() {
        setCompareStats(null);
        setCompareRiotId("");
        setCompareError(null);
    }

    if (loading) {
        return (
            <div className="stats-page">
                <div className="stats-loading">
                    <div className="stats-loading-spinner" />
                    <span>Loading Valorant Stats...</span>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="stats-page">
                <div className="stats-error">
                    <span className="stats-error-icon">⚠</span>
                    <h2>Failed to load stats</h2>
                    <p>{error || "Unknown error occurred"}</p>
                </div>
            </div>
        );
    }

    const rankColor = stats.rank ? getRankColor(stats.rank.tier) : "#6b7280";

    return (
        <div className="stats-page">
            {/* Hero Section */}
            <section className="stats-hero">
                <div className="stats-hero-bg" style={{ backgroundImage: `url(${stats.account.card.wide})` }} />
                <div className="stats-hero-overlay" />

                <div className="stats-hero-content">
                    <div className="stats-profile">
                        <div className="stats-avatar">
                            <img src={stats.account.card.small} alt="Player card" />
                        </div>
                        <div className="stats-profile-info">
                            <h1 className="stats-name">
                                {stats.account.name}
                                <span className="stats-tag">#{stats.account.tag}</span>
                            </h1>
                            <div className="stats-level">Level {stats.account.level}</div>
                        </div>
                    </div>

                    {stats.rank && (
                        <div className="stats-rank-card" style={{ borderColor: rankColor }}>
                            <div className="stats-rank-icon">
                                <img
                                    src={getRankIcon(stats.rank.current)}
                                    alt={stats.rank.current}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                            <div className="stats-rank-info">
                                <div className="stats-rank-label">Current Rank</div>
                                <div className="stats-rank-name" style={{ color: rankColor }}>
                                    {stats.rank.current}
                                </div>
                                <div className="stats-rank-rr">
                                    {stats.rank.rr} RR
                                    {stats.rank.lastChange !== 0 && (
                                        <span className={stats.rank.lastChange > 0 ? "rr-gain" : "rr-loss"}>
                                            {stats.rank.lastChange > 0 ? "+" : ""}{stats.rank.lastChange}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {stats.rank.peakRank && (
                                <div className="stats-peak-rank">
                                    <span className="peak-label">Peak</span>
                                    <span className="peak-value">{stats.rank.peakRank}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Compare Your Stats Section */}
            <section className="compare-section">
                <button
                    className={`compare-toggle ${compareMode ? "active" : ""}`}
                    onClick={() => setCompareMode(!compareMode)}
                >
                    <span className="compare-toggle-icon">{compareMode ? "×" : "⚔"}</span>
                    {compareMode ? "Close Comparison" : "Compare Your Stats"}
                </button>

                {compareMode && (
                    <div className="compare-form-container">
                        <form onSubmit={handleCompare} className="compare-form">
                            <input
                                type="text"
                                value={compareRiotId}
                                onChange={(e) => setCompareRiotId(e.target.value)}
                                placeholder="Enter your Riot ID (e.g., TenZ#0505)"
                                className="compare-input"
                                disabled={compareLoading}
                            />
                            <button type="submit" className="compare-submit" disabled={compareLoading}>
                                {compareLoading ? (
                                    <span className="compare-spinner" />
                                ) : (
                                    "Compare"
                                )}
                            </button>
                        </form>
                        {compareError && <p className="compare-error">{compareError}</p>}
                        {compareStats && (
                            <button className="compare-clear" onClick={clearComparison}>
                                Clear Comparison
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* Stats Grid - Comparison Mode */}
            {compareStats ? (
                <section className="stats-section">
                    <h2 className="stats-section-title">
                        <span className="stats-section-icon">◆</span>
                        Stats Comparison
                    </h2>

                    <div className="comparison-grid">
                        {/* Sleazy's Stats */}
                        <div className="comparison-column comparison-sleazy">
                            <div className="comparison-header">
                                <img src={stats.account.card.small} alt="Sleazy" className="comparison-avatar" />
                                <span>{stats.account.name}</span>
                            </div>
                            <div className="comparison-stats">
                                <ComparisonStat
                                    label="Win Rate"
                                    value={stats.recentStats.winRate}
                                    compareValue={compareStats.recentStats.winRate}
                                    isLeft={true}
                                />
                                <ComparisonStat
                                    label="K/D"
                                    value={stats.recentStats.kd}
                                    compareValue={compareStats.recentStats.kd}
                                    isLeft={true}
                                />
                                <ComparisonStat
                                    label="Headshot %"
                                    value={stats.recentStats.headshotPercent}
                                    compareValue={compareStats.recentStats.headshotPercent}
                                    isLeft={true}
                                    isHeadshot={true}
                                />
                                <ComparisonStat
                                    label="Avg Kills"
                                    value={stats.recentStats.gamesPlayed > 0 ? (stats.recentStats.kills / stats.recentStats.gamesPlayed).toFixed(1) : "0"}
                                    compareValue={compareStats.recentStats.gamesPlayed > 0 ? (compareStats.recentStats.kills / compareStats.recentStats.gamesPlayed).toFixed(1) : "0"}
                                    isLeft={true}
                                />
                            </div>
                        </div>

                        {/* Visitor's Stats */}
                        <div className="comparison-column comparison-visitor">
                            <div className="comparison-header">
                                <img src={compareStats.account.card.small} alt={compareStats.account.name} className="comparison-avatar" />
                                <span>{compareStats.account.name}</span>
                            </div>
                            <div className="comparison-stats">
                                <ComparisonStat
                                    label="Win Rate"
                                    value={compareStats.recentStats.winRate}
                                    compareValue={stats.recentStats.winRate}
                                    isLeft={false}
                                />
                                <ComparisonStat
                                    label="K/D"
                                    value={compareStats.recentStats.kd}
                                    compareValue={stats.recentStats.kd}
                                    isLeft={false}
                                />
                                <ComparisonStat
                                    label="Headshot %"
                                    value={compareStats.recentStats.headshotPercent}
                                    compareValue={stats.recentStats.headshotPercent}
                                    isLeft={false}
                                    isHeadshot={true}
                                />
                                <ComparisonStat
                                    label="Avg Kills"
                                    value={compareStats.recentStats.gamesPlayed > 0 ? (compareStats.recentStats.kills / compareStats.recentStats.gamesPlayed).toFixed(1) : "0"}
                                    compareValue={stats.recentStats.gamesPlayed > 0 ? (stats.recentStats.kills / stats.recentStats.gamesPlayed).toFixed(1) : "0"}
                                    isLeft={false}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                /* Stats Grid - Normal Mode */
                <section className="stats-section">
                    <h2 className="stats-section-title">
                        <span className="stats-section-icon">◆</span>
                        Recent Performance
                        <span className="stats-section-sub">Last {stats.recentStats.gamesPlayed} competitive games</span>
                    </h2>

                    <div className="stats-grid">
                        {/* Win Rate */}
                        <div className="stat-card stat-card-large">
                            <div className="stat-card-header">Win Rate</div>
                            <div className="stat-card-value stat-winrate">{stats.recentStats.winRate}</div>
                            <div className="stat-card-sub">
                                <span className="wins">{stats.recentStats.wins}W</span>
                                <span className="separator">-</span>
                                <span className="losses">{stats.recentStats.losses}L</span>
                            </div>
                        </div>

                        {/* K/D Ratio */}
                        <div className="stat-card stat-card-large">
                            <div className="stat-card-header">K/D Ratio</div>
                            <div className="stat-card-value">{stats.recentStats.kd}</div>
                            <div className="stat-card-sub">
                                {stats.recentStats.kills}K / {stats.recentStats.deaths}D / {stats.recentStats.assists}A
                            </div>
                        </div>

                        {/* Headshot % */}
                        <div className="stat-card">
                            <div className="stat-card-header">Headshot %</div>
                            <div className="stat-card-value stat-headshot">{stats.recentStats.headshotPercent}</div>
                        </div>

                        {/* Games Played */}
                        <div className="stat-card">
                            <div className="stat-card-header">Games</div>
                            <div className="stat-card-value">{stats.recentStats.gamesPlayed}</div>
                        </div>

                        {/* Total Kills */}
                        <div className="stat-card">
                            <div className="stat-card-header">Total Kills</div>
                            <div className="stat-card-value">{stats.recentStats.kills}</div>
                        </div>

                        {/* Avg Kills */}
                        <div className="stat-card">
                            <div className="stat-card-header">Avg Kills</div>
                            <div className="stat-card-value">
                                {stats.recentStats.gamesPlayed > 0
                                    ? (stats.recentStats.kills / stats.recentStats.gamesPlayed).toFixed(1)
                                    : "0"}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Top Agents */}
            {stats.recentStats.topAgents.length > 0 && (
                <section className="stats-section">
                    <h2 className="stats-section-title">
                        <span className="stats-section-icon">◆</span>
                        Top Agents
                    </h2>

                    <div className="agents-grid">
                        {stats.recentStats.topAgents.map((agent, index) => (
                            <div key={agent.agent} className="agent-card">
                                <div className="agent-rank">#{index + 1}</div>
                                <div className="agent-icon">
                                    <img
                                        src={`https://media.valorant-api.com/agents/${getAgentUuid(agent.agent)}/displayicon.png`}
                                        alt={agent.agent}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/agent-placeholder.png";
                                        }}
                                    />
                                </div>
                                <div className="agent-name">{agent.agent}</div>
                                <div className="agent-games">{agent.games} games</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Weapon Stats */}
            {stats.weaponStats && stats.weaponStats.length > 0 && (
                <section className="stats-section">
                    <h2 className="stats-section-title">
                        <span className="stats-section-icon">◆</span>
                        Top Weapons
                        {compareStats && <span className="stats-section-sub">Comparison View</span>}
                    </h2>

                    <div className="weapons-grid">
                        {stats.weaponStats.map((weapon, index) => {
                            const maxKills = stats.weaponStats![0].kills;
                            const percentage = maxKills > 0 ? (weapon.kills / maxKills) * 100 : 0;
                            const compareWeapon = compareStats?.weaponStats?.find(w => w.weaponId === weapon.weaponId);

                            return (
                                <div key={weapon.weaponId} className="weapon-card">
                                    <div className="weapon-rank">#{index + 1}</div>
                                    <div className="weapon-icon">
                                        <img
                                            src={`https://media.valorant-api.com/weapons/${weapon.weaponId}/displayicon.png`}
                                            alt={weapon.weaponName}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.opacity = '0.3';
                                            }}
                                        />
                                    </div>
                                    <div className="weapon-info">
                                        <div className="weapon-name">{weapon.weaponName}</div>
                                        <div className="weapon-kills">{weapon.kills} kills</div>
                                        <div className="weapon-bar">
                                            <div
                                                className="weapon-bar-fill weapon-bar-sleazy"
                                                style={{ width: `${percentage}%` }}
                                            />
                                            {compareWeapon && (
                                                <div
                                                    className="weapon-bar-fill weapon-bar-visitor"
                                                    style={{ width: `${maxKills > 0 ? (compareWeapon.kills / maxKills) * 100 : 0}%` }}
                                                />
                                            )}
                                        </div>
                                        {compareWeapon && (
                                            <div className="weapon-compare-info">
                                                <span className="compare-label">{compareStats?.account.name}:</span>
                                                <span className="compare-value">{compareWeapon.kills} kills</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Recent Matches */}
            <section className="stats-section">
                <h2 className="stats-section-title">
                    <span className="stats-section-icon">◆</span>
                    Recent Matches
                </h2>

                <div className="matches-list">
                    {stats.recentMatches.map((match) => (
                        <div key={match.id} className={`match-card ${match.won ? "match-win" : "match-loss"}`}>
                            <div className="match-result">
                                <span className="match-result-text">{match.won ? "WIN" : "LOSS"}</span>
                                <span className="match-score">{match.score}</span>
                            </div>
                            <div className="match-info">
                                <div className="match-map">{match.map}</div>
                                <div className="match-mode">{match.mode}</div>
                            </div>
                            <div className="match-agent">
                                <img
                                    src={`https://media.valorant-api.com/agents/${getAgentUuid(match.agent)}/displayicon.png`}
                                    alt={match.agent}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                <span>{match.agent}</span>
                            </div>
                            <div className="match-kda">
                                <span className="match-kills">{match.kills}</span>
                                <span className="match-separator">/</span>
                                <span className="match-deaths">{match.deaths}</span>
                                <span className="match-separator">/</span>
                                <span className="match-assists">{match.assists}</span>
                            </div>
                            <div className="match-date">{match.date}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Last Updated */}
            <div className="stats-footer">
                <span>Data provided by Henrik's Valorant API</span>
                <a
                    href={`https://tracker.gg/valorant/profile/riot/${encodeURIComponent(stats.account.name)}%23${encodeURIComponent(stats.account.tag)}/overview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tracker-link"
                >
                    View Lifetime Stats on Tracker.gg →
                </a>
                <span>Last updated: {new Date(stats.lastUpdated).toLocaleString()}</span>
            </div>
        </div>
    );
}

// Agent name to UUID mapping for icons
function getAgentUuid(agentName: string): string {
    const agentMap: Record<string, string> = {
        "Jett": "add6443a-41bd-e414-f6ad-e58d267f4e95",
        "Phoenix": "eb93336a-449b-9c1b-0a54-a891f7921d69",
        "Reyna": "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
        "Raze": "f94c3b30-42be-e959-889c-5aa313dba261",
        "Yoru": "7f94d92c-4234-0a36-9646-3a87eb8b5c89",
        "Neon": "bb2a4828-46eb-8cd1-e765-15848195d751",
        "Iso": "0e38b510-41a8-5780-5e8f-568b2a4f2d6c",
        "Sage": "569fdd95-4d10-43ab-ca70-79becc718b46",
        "Omen": "8e253930-4c05-31dd-1b6c-968525494517",
        "Brimstone": "9f0d8ba9-4140-b941-57d3-a7ad57c6b417",
        "Viper": "707eab51-4836-f488-046a-cda6bf494859",
        "Killjoy": "1e58de9c-4950-5125-93e9-a0aee9f98746",
        "Cypher": "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
        "Sova": "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
        "Breach": "5f8d3a7f-467b-97f3-062c-13acf203c006",
        "Skye": "6f2a04ca-43e0-be17-7f36-b3908627744d",
        "Kay/O": "601dbbe7-43ce-be57-2a40-4abd24953621",
        "Chamber": "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
        "Astra": "41fb69c1-4189-7b37-f117-bcaf1e96f1bf",
        "Gekko": "e370fa57-4757-3604-3648-499e1f642d3f",
        "Fade": "dade69b4-4f5a-8528-247b-219e5a1facd6",
        "Harbor": "95b78ed7-4637-86d9-7e41-71ba8c293152",
        "Deadlock": "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235",
        "Clove": "1dbf2edd-4729-0984-3115-daa5eed44993",
        "Vyse": "efba5359-4016-a1e5-7626-b1ae76895f3e",
    };
    return agentMap[agentName] || "";
}

// Comparison stat component
function ComparisonStat({
    label,
    value,
    compareValue,
    isLeft,
    isHeadshot = false,
}: {
    label: string;
    value: string;
    compareValue: string;
    isLeft: boolean;
    isHeadshot?: boolean;
}) {
    const numValue = parseFloat(value.replace("%", ""));
    const numCompare = parseFloat(compareValue.replace("%", ""));
    const diff = numValue - numCompare;
    const hasDiff = !isNaN(diff) && diff !== 0;

    return (
        <div className="comparison-stat">
            <div className="comparison-stat-label">{label}</div>
            <div className={`comparison-stat-value ${isHeadshot ? "stat-headshot" : ""}`}>
                {value}
            </div>
            {hasDiff && (
                <div className={`comparison-diff ${diff > 0 ? "diff-positive" : "diff-negative"}`}>
                    {diff > 0 ? "+" : ""}{diff.toFixed(1).replace(/\.0$/, "")}
                    {value.includes("%") ? "%" : ""}
                </div>
            )}
        </div>
    );
}
