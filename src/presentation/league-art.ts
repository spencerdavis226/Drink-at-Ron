import { asset } from "./theme";

// Display-only lookup by stable card ID. Old saved card snapshots gain the
// same art without importing card text or changing their schema or outcomes.
export const leagueBadges: Readonly<Record<string, string>> = {
  "pokemon.gym-brock": "boulder",
  "pokemon.gym-misty": "cascade",
  "pokemon.gym-lt-surge": "thunder",
  "pokemon.gym-erika": "rainbow",
  "pokemon.gym-koga": "soul",
  "pokemon.gym-sabrina": "marsh",
  "pokemon.gym-blaine": "volcano",
  "pokemon.gym-giovanni": "earth",
  "pokemon.gym-falkner": "zephyr",
  "pokemon.gym-bugsy": "hive",
  "pokemon.gym-whitney": "plain",
  "pokemon.gym-morty": "fog",
  "pokemon.gym-chuck": "storm",
  "pokemon.gym-jasmine": "mineral",
  "pokemon.gym-pryce": "glacier",
  "pokemon.gym-clair": "rising",
  "pokemon.gym-roxanne": "stone",
  "pokemon.gym-brawly": "knuckle",
  "pokemon.gym-wattson": "dynamo",
  "pokemon.gym-flannery": "heat",
  "pokemon.gym-norman": "balance",
  "pokemon.gym-winona": "feather",
  "pokemon.gym-tate-liza": "mind",
  "pokemon.gym-wallace": "rain",
};

export const badgeArt = (cardId: string) => {
  const badge = leagueBadges[cardId];
  return badge ? asset(`art/badges/${badge}.webp`) : undefined;
};

const stageBanners: Readonly<Record<string, string>> = {
  pearl: "legendary",
  violet: "elite-four",
  crimson: "champion",
};
export const stageArt = (tone: string) => {
  const banner = stageBanners[tone];
  return banner ? asset(`art/banners/${banner}.webp`) : undefined;
};
