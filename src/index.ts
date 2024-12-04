import { fetchMovieDetails, rankMovies } from "./util.ts";
import { getPrompt, submitRanking } from "./generate_api.ts";
import type {  IMovie, IPrompt } from "./types.ts";

const prompt: IPrompt = await getPrompt();

const movieDetails: IMovie[] = await Promise.all(prompt.movies.map(fetchMovieDetails));
const rankedMovies: {score: number, id: string}[] = rankMovies(movieDetails, prompt.people);
const ranking: string[] = rankedMovies.map(movie => movie.id);

const score: number = await submitRanking(ranking);
console.log(`SCORE ACHIEVED: ${score}`);
console.log(ranking);

// [ "tt1285016",
//   "tt2582802",
//   "tt0062622",
//   "tt15239678",
//   "tt2084970",
//   "tt1074638",
//   "tt2278388",
//   "tt0432283",
//   "tt0264464",
//   "tt22022452"
// ]