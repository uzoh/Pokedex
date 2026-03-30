// Pokemon type to color mapping
export const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878",
  fighting: "#C03028",
  flying: "#A890F0",
  poison: "#A040A0",
  ground: "#E0C068",
  rock: "#B8A038",
  bug: "#A8B820",
  ghost: "#705898",
  steel: "#B8B8D0",
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  psychic: "#F85888",
  ice: "#98D8D8",
  dragon: "#7038F8",
  dark: "#705848",
  fairy: "#EE99AC",
};

// Pokemon stat display labels
export const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "sp-attack": "SP.A",
  "sp-defense": "SP.D",
  speed: "SPD",
};

// Stat bar color thresholds
export const STAT_BAR_COLORS = {
  high: "#10B981",   // Green
  medium: "#F59E0B", // Amber
  low: "#EF4444",    // Red
};

// Stat thresholds (as percentages of max stat)
export const STAT_THRESHOLDS = {
  high: 75,
  medium: 50,
} as const;
