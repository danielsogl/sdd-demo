export type RawPokemonListItem = {
  readonly name: string;
  readonly url: string;
};

export type RawPokemonListResponse = {
  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly results: RawPokemonListItem[];
};

export type RawStatEntry = {
  readonly base_stat: number;
  readonly stat: {
    readonly name: string;
  };
};

export type RawTypeEntry = {
  readonly slot: number;
  readonly type: {
    readonly name: string;
  };
};

export type RawAbilityEntry = {
  readonly ability: {
    readonly name: string;
  };
  readonly is_hidden: boolean;
  readonly slot: number;
};

export type RawPokemonDetailResponse = {
  readonly id: number;
  readonly name: string;
  readonly height: number;
  readonly weight: number;
  readonly sprites: {
    readonly front_default: string | null;
  };
  readonly types: RawTypeEntry[];
  readonly abilities: RawAbilityEntry[];
  readonly stats: RawStatEntry[];
};
