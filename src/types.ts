// Represents the original prompt received from the server.
export interface IPrompt {
  movies: string[];
  people: IPerson[];
}

// Represents a preference with a value and a weight.
export interface IPreference<T> {
  value: T;
  weight: number;
}

// Represents a person with movie preferences.
export interface IPerson {
  name: string;
  preferences: {
    afterYear?: IPreference<number>;
    beforeYear?: IPreference<number>;
    maximumAgeRating?: IPreference<string>;
    shorterThan?: IPreference<string>;
    favoriteGenre?: IPreference<string>;
    leastFavoriteDirector?: IPreference<string>;
    favoriteActors?: IPreference<string[]>;
    favoritePlotElements?: IPreference<string[]>;
    minimumRottenTomatoesScore?: IPreference<number>;
  };
}

// Represents a movie with details that will be ranked.
export interface IMovie {
  imdbID: string;
  title: string;
  year: string;
  genre: string;
  director: string;
  actors: string;
  plot: string;
  rated: string;
  runtime: string;
  ratings: { source: string, value: string }[];
}