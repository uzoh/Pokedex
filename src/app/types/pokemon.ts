export type PokemonListItem = {
  name: string;
  url: string;
};

export type PokemonListResponse = {
  results: PokemonListItem[];
  count: number;
  next: string | null;
  previous: string | null;
};
