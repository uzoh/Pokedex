import type { PokemonListItem, PokemonListResponse, PokemonDetail } from "../types/pokemon";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const SPRITES_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export type PokemonListResult = {
  results: PokemonListItem[];
  count: number;
  hasMore: boolean;
};

export function pokemonIdFromUrl(url: string): number | null {
  const parts = url.split("/").filter(Boolean);
  const id = Number(parts[parts.length - 1]);
  return Number.isFinite(id) ? id : null;
}

export async function fetchPokemonList(
  limit = 151,
  offset = 0
): Promise<PokemonListResult> {
  const res = await fetch(
    `${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`
  );
  if (!res.ok) {
    throw new Error(`PokéAPI request failed (${res.status})`);
  }
  const data = (await res.json()) as PokemonListResponse;
  return {
    results: data.results,
    count: data.count,
    hasMore: data.next !== null,
  };
}

export function spriteUrlForPokemonUrl(url: string): string | null {
  const id = pokemonIdFromUrl(url);
  if (id == null) return null;
  return `${SPRITES_BASE}/${id}.png`;
}

export async function fetchPokemonDetails(nameOrId: string | number): Promise<PokemonDetail> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${nameOrId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon details: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Runtime validation of required fields
  if (
    !data ||
    typeof data.id !== "number" ||
    typeof data.name !== "string" ||
    !data.sprites?.other?.["official-artwork"]?.front_default ||
    !Array.isArray(data.types) ||
    !Array.isArray(data.stats) ||
    !Array.isArray(data.abilities) ||
    typeof data.height !== "number" ||
    typeof data.weight !== "number" ||
    typeof data.base_experience !== "number"
  ) {
    throw new Error("Invalid Pokémon details response: missing or malformed required fields");
  }
  
  return data as PokemonDetail;
}
