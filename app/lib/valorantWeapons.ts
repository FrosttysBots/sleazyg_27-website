// Valorant Weapon UUID to Name mapping
// Data sourced from valorant-api.com

export type WeaponCategory = "sidearm" | "smg" | "shotgun" | "rifle" | "sniper" | "heavy" | "melee";

export type WeaponInfo = {
    uuid: string;
    name: string;
    category: WeaponCategory;
};

// Main weapon UUIDs (these are the actual UUIDs from Valorant API)
export const WEAPON_MAP: Record<string, WeaponInfo> = {
    // Sidearms
    "29a0cfab-485b-f5d5-779a-b59f85e204a8": { uuid: "29a0cfab-485b-f5d5-779a-b59f85e204a8", name: "Classic", category: "sidearm" },
    "42da8ccc-40d5-affc-beec-15aa47b42eda": { uuid: "42da8ccc-40d5-affc-beec-15aa47b42eda", name: "Shorty", category: "sidearm" },
    "44d4e95c-4157-0037-81b2-17841bf2e8e3": { uuid: "44d4e95c-4157-0037-81b2-17841bf2e8e3", name: "Frenzy", category: "sidearm" },
    "1baa85b4-4c70-1284-64bb-6481dfc3bb4e": { uuid: "1baa85b4-4c70-1284-64bb-6481dfc3bb4e", name: "Ghost", category: "sidearm" },
    "e336c6b8-418d-9340-d77f-7a9e4cfe0702": { uuid: "e336c6b8-418d-9340-d77f-7a9e4cfe0702", name: "Sheriff", category: "sidearm" },

    // SMGs
    "f7e1b454-4ad4-1063-ec0a-159e56b58941": { uuid: "f7e1b454-4ad4-1063-ec0a-159e56b58941", name: "Stinger", category: "smg" },
    "462080d1-4035-2937-7c09-27aa2a5c27a7": { uuid: "462080d1-4035-2937-7c09-27aa2a5c27a7", name: "Spectre", category: "smg" },

    // Shotguns
    "910be174-449b-c412-ab22-d0873436b21b": { uuid: "910be174-449b-c412-ab22-d0873436b21b", name: "Bucky", category: "shotgun" },
    "ec845bf4-4f79-ddda-a3da-0db3774b2794": { uuid: "ec845bf4-4f79-ddda-a3da-0db3774b2794", name: "Judge", category: "shotgun" },

    // Rifles
    "ae3de142-4d85-2547-dd26-4e90bed35cf7": { uuid: "ae3de142-4d85-2547-dd26-4e90bed35cf7", name: "Bulldog", category: "rifle" },
    "4ade7faa-4cf1-8376-95ef-39884480959b": { uuid: "4ade7faa-4cf1-8376-95ef-39884480959b", name: "Guardian", category: "rifle" },
    "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a": { uuid: "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a", name: "Phantom", category: "rifle" },
    "9c82e19d-4575-0200-1a81-3eacf00cf872": { uuid: "9c82e19d-4575-0200-1a81-3eacf00cf872", name: "Vandal", category: "rifle" },

    // Snipers
    "c4883e50-4494-202c-3ec3-6b8a9284f00b": { uuid: "c4883e50-4494-202c-3ec3-6b8a9284f00b", name: "Marshal", category: "sniper" },
    "a03b24d3-4319-996d-0f8c-94bbfba1dfc7": { uuid: "a03b24d3-4319-996d-0f8c-94bbfba1dfc7", name: "Outlaw", category: "sniper" },
    "5f0aaf7a-4289-3998-d5ff-eb9a5cf7f5aa": { uuid: "5f0aaf7a-4289-3998-d5ff-eb9a5cf7f5aa", name: "Operator", category: "sniper" },

    // Heavy
    "55d8a0f4-4274-ca67-fe2c-06ab45efdf58": { uuid: "55d8a0f4-4274-ca67-fe2c-06ab45efdf58", name: "Ares", category: "heavy" },
    "63e6c2b6-4a8e-869c-3d4c-e38355226584": { uuid: "63e6c2b6-4a8e-869c-3d4c-e38355226584", name: "Odin", category: "heavy" },

    // Melee
    "2f59173c-4bed-b6c3-2191-dea9b58be9c7": { uuid: "2f59173c-4bed-b6c3-2191-dea9b58be9c7", name: "Melee", category: "melee" },
};

// Reverse lookup: name to UUID
export const WEAPON_NAME_TO_UUID: Record<string, string> = Object.fromEntries(
    Object.values(WEAPON_MAP).map(w => [w.name.toLowerCase(), w.uuid])
);

/**
 * Get weapon name from UUID
 */
export function getWeaponName(uuid: string): string {
    return WEAPON_MAP[uuid]?.name || "Unknown";
}

/**
 * Get weapon icon URL from valorant-api.com CDN
 */
export function getWeaponIconUrl(uuid: string): string {
    return `https://media.valorant-api.com/weapons/${uuid}/displayicon.png`;
}

/**
 * Get weapon kill icon URL (smaller, for kill feed style)
 */
export function getWeaponKillIconUrl(uuid: string): string {
    return `https://media.valorant-api.com/weapons/${uuid}/killstreamicon.png`;
}

/**
 * Get weapon category
 */
export function getWeaponCategory(uuid: string): WeaponCategory | null {
    return WEAPON_MAP[uuid]?.category || null;
}

/**
 * Get all weapons in a category
 */
export function getWeaponsByCategory(category: WeaponCategory): WeaponInfo[] {
    return Object.values(WEAPON_MAP).filter(w => w.category === category);
}
