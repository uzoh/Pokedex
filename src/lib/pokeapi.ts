import type { PokemonListItem, PokemonListResponse } from "../app/types/pokemon";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const SPRITES_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

/**
 * Extracts the Pokémon ID from a URL
 */
export function pokemonIdFromUrl(url: string): number | null {
  const match = url.match(/\/(\d+)\/$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Fetches a list of Pokémon
 */
export async function fetchPokemonList(
  limit: number = 151,
  offset: number = 0
): Promise<PokemonListItem[]> {
  const response = await fetch(
    `${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon list: ${response.statusText}`);
  }

  const data = (await response.json()) as PokemonListResponse;
  return data.results;
}

/**
 * Gets the official artwork sprite URL for a Pokémon
 */
export function spriteUrlForPokemonUrl(url: string): string | null {
  const id = pokemonIdFromUrl(url);
  if (id == null) return null;
  return `${SPRITES_BASE}/${id}.png`;
}

/**
 * Fetches detailed information about a specific Pokémon
 */
export async function fetchPokemonDetails(nameOrId: string | number) {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${nameOrId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon details: ${response.statusText}`);
  }

  return response.json();
}
