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

export type PokemonDetail = {
  id: number;
  name: string;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
  abilities: Array<{
    ability: {
      name: string;
    };
  }>;
  base_experience: number;
};
