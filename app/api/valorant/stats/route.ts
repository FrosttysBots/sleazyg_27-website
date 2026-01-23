import { NextResponse } from "next/server";
import { getWeaponName } from "@/app/lib/valorantWeapons";

const RIOT_NAME = "SleazyG27";
const RIOT_TAG = "f34r";
const REGION = "na"; // North America

// Henrik's Valorant API base URL
const API_BASE = "https://api.henrikdev.xyz";
const API_KEY = process.env.HENRIKDEV_API_KEY || "";

type AccountData = {
    puuid: string;
    region: string;
    account_level: number;
    name: string;
    tag: string;
    card: {
        small: string;
        large: string;
        wide: string;
        id: string;
    };
};

type MMRData = {
    current_data: {
        currenttier: number;
        currenttierpatched: string;
        ranking_in_tier: number;
        mmr_change_to_last_game: number;
        elo: number;
        games_needed_for_rating: number;
        old: boolean;
    };
    highest_rank: {
        old: boolean;
        tier: number;
        patched_tier: string;
        season: string;
    };
};

// V3 Match structure from Henrik's API
type V3Match = {
    metadata: {
        matchid: string;
        map: string;
        game_start: number;
        game_start_patched: string;
        game_length: number;
        mode: string;
        queue: string;
        region: string;
    };
    players: {
        all_players: Array<{
            puuid: string;
            name: string;
            tag: string;
            team: string;
            level: number;
            character: string;
            currenttier: number;
            currenttier_patched: string;
            stats: {
                score: number;
                kills: number;
                deaths: number;
                assists: number;
                headshots: number;
                bodyshots: number;
                legshots: number;
            };
        }>;
    };
    teams: {
        red: { has_won: boolean; rounds_won: number; rounds_lost: number };
        blue: { has_won: boolean; rounds_won: number; rounds_lost: number };
    };
    kills?: Array<{
        killer_puuid: string;
        victim_puuid: string;
        assistants: string[];
        damage_weapon_id: string;
        damage_weapon_name?: string;
        secondary_fire_mode: boolean;
        player_locations_on_kill: unknown[];
        victim_death_location: { x: number; y: number };
    }>;
};

export async function GET() {
    try {
        // Headers with API key
        const headers: HeadersInit = API_KEY ? { Authorization: API_KEY } : {};

        // Fetch account data and MMR first
        const [accountRes, mmrRes] = await Promise.all([
            fetch(`${API_BASE}/valorant/v1/account/${RIOT_NAME}/${RIOT_TAG}`, {
                headers,
                cache: "no-store",
            }),
            fetch(`${API_BASE}/valorant/v2/mmr/${REGION}/${RIOT_NAME}/${RIOT_TAG}`, {
                headers,
                cache: "no-store",
            }),
        ]);

        // Parse responses
        const accountJson = await accountRes.json();
        const mmrJson = await mmrRes.json();

        // Check for account errors
        if (accountJson.status !== 200) {
            return NextResponse.json(
                { error: "Failed to fetch account data", details: accountJson },
                { status: 500 }
            );
        }

        const account: AccountData = accountJson.data;
        const puuid = account.puuid;
        const mmr: MMRData | null = mmrJson.status === 200 ? mmrJson.data : null;

        // Fetch matches - 20 gives better sample size for stats
        const matchesRes = await fetch(
            `${API_BASE}/valorant/v3/matches/${REGION}/${RIOT_NAME}/${RIOT_TAG}?mode=competitive&size=20`,
            {
                headers,
                cache: "no-store",
            }
        );
        const matchesJson = await matchesRes.json();
        const matches: V3Match[] = matchesJson.status === 200 ? matchesJson.data || [] : [];

        // Calculate stats from recent matches
        let totalKills = 0;
        let totalDeaths = 0;
        let totalAssists = 0;
        let totalHeadshots = 0;
        let totalBodyshots = 0;
        let totalLegshots = 0;
        let wins = 0;
        let losses = 0;
        const agentCounts: Record<string, number> = {};
        const weaponKills: Record<string, { kills: number; headshots: number }> = {};

        const processedMatches: Array<{
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
        }> = [];

        for (const match of matches) {
            if (!match.players?.all_players) continue;

            // Find the player in this match
            const player = match.players.all_players.find(
                (p) => p.puuid === puuid || (p.name.toLowerCase() === RIOT_NAME.toLowerCase() && p.tag.toLowerCase() === RIOT_TAG.toLowerCase())
            );

            if (!player) continue;

            // Accumulate stats
            totalKills += player.stats.kills;
            totalDeaths += player.stats.deaths;
            totalAssists += player.stats.assists;
            totalHeadshots += player.stats.headshots;
            totalBodyshots += player.stats.bodyshots;
            totalLegshots += player.stats.legshots;

            // Count agent usage
            if (player.character) {
                agentCounts[player.character] = (agentCounts[player.character] || 0) + 1;
            }

            // Process kills for weapon stats
            if (match.kills) {
                for (const kill of match.kills) {
                    if (kill.killer_puuid === puuid && kill.damage_weapon_id) {
                        const weaponId = kill.damage_weapon_id;
                        if (!weaponKills[weaponId]) {
                            weaponKills[weaponId] = { kills: 0, headshots: 0 };
                        }
                        weaponKills[weaponId].kills++;
                    }
                }
            }

            // Determine win/loss
            const playerTeam = player.team.toLowerCase();
            const teamData = playerTeam === "red" ? match.teams?.red : match.teams?.blue;
            const won = teamData?.has_won ?? false;

            if (won) {
                wins++;
            } else {
                losses++;
            }

            // Build match info
            const playerTeamData = playerTeam === "red" ? match.teams?.red : match.teams?.blue;
            const enemyTeamData = playerTeam === "red" ? match.teams?.blue : match.teams?.red;

            processedMatches.push({
                id: match.metadata.matchid,
                map: match.metadata.map,
                mode: match.metadata.mode,
                date: match.metadata.game_start_patched,
                agent: player.character,
                kills: player.stats.kills,
                deaths: player.stats.deaths,
                assists: player.stats.assists,
                won,
                score: `${playerTeamData?.rounds_won || 0}-${enemyTeamData?.rounds_won || 0}`,
            });
        }

        const gamesPlayed = processedMatches.length;
        const kd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);
        const totalShots = totalHeadshots + totalBodyshots + totalLegshots;
        const headshotPercent = totalShots > 0 ? ((totalHeadshots / totalShots) * 100).toFixed(1) : "0";
        const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(0) : "0";

        // Get top 3 agents
        const topAgents = Object.entries(agentCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([agent, count]) => ({ agent, games: count }));

        // Get top 6 weapons
        const weaponStats = Object.entries(weaponKills)
            .map(([weaponId, data]) => ({
                weaponId,
                weaponName: getWeaponName(weaponId),
                kills: data.kills,
                headshots: data.headshots,
            }))
            .sort((a, b) => b.kills - a.kills)
            .slice(0, 6);

        // Build response
        const stats = {
            account: {
                name: account.name,
                tag: account.tag,
                level: account.account_level,
                card: account.card,
            },
            rank: mmr ? {
                current: mmr.current_data?.currenttierpatched || "Unranked",
                tier: mmr.current_data?.currenttier || 0,
                rr: mmr.current_data?.ranking_in_tier || 0,
                elo: mmr.current_data?.elo || 0,
                lastChange: mmr.current_data?.mmr_change_to_last_game || 0,
                peakRank: mmr.highest_rank?.patched_tier || null,
                peakSeason: mmr.highest_rank?.season || null,
            } : null,
            recentStats: {
                gamesPlayed,
                wins,
                losses,
                winRate: `${winRate}%`,
                kills: totalKills,
                deaths: totalDeaths,
                assists: totalAssists,
                kd,
                headshotPercent: `${headshotPercent}%`,
                topAgents,
            },
            recentMatches: processedMatches,
            weaponStats,
            lastUpdated: new Date().toISOString(),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching Valorant stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats", details: String(error) },
            { status: 500 }
        );
    }
}
