import axios, {type AxiosResponse} from "axios";
import { omdbAPIKey } from "../config.json";
import type {IMovie, IPerson} from "./types.ts";

/**
 * Fetch details of a movie by its omdbID.
 * @param movieID the omdbID of the movie to fetch.
 * @return Promise<IMovie> the details of the movie.
 */
export const fetchMovieDetails = async (movieID: string): Promise<IMovie> => {
    const url: string = `https://www.omdbapi.com/?i=${movieID}&apikey=${omdbAPIKey}&plot=full`;
    const response: AxiosResponse = await axios.get(url);
    if (response.status !== 200) {
        console.log("Error fetching movie details:", response.status);
        process.exit(1);
    }
    return {
        imdbID: response.data.imdbID,
        title: response.data.Title,
        year: response.data.Year,
        genre: response.data.Genre,
        director: response.data.Director,
        actors: response.data.Actors,
        plot: response.data.Plot,
        rated: response.data.Rated,
        runtime: response.data.Runtime,
        ratings: response.data.Ratings,
    };
}

/**
 * The main algorithm to calculate a score of a movie based on the preferences of a list of people.
 *
 * NOTE: plot elements of the movie were not given in the prompt, so my way of checking if a
 * move has a favorite plot element is by checking if the plot of the movie contains the plot element.
 *
 * The score is calculated as follows:
 * - if the release year of the movie matches the "afterYear" preference, add the weight to the score.
 * - if the release year of the movie is before the "beforeYear" preference, add the weight to the score.
 * - if the age rating of the movie is less than or equal to the "maximumAgeRating" preference, add
 *   the weight to the score.
 * - if the runtime of the movie is less than the "shorterThan" preference, add the weight to the score.
 * - if the genre of the movie matches the "favoriteGenre" preference, add the weight to the score.
 * - if the director of the movie matches the "leastFavoriteDirector" preference, subtract the weight
 *   from the score, as the person does not like this director.
 * - if the actors of the movie match the "favoriteActors" preference, add the weight divided by the
 *   number of matching actors to the score.
 * - if the Rotten Tomatoes score of the movie is greater than or equal to the
 *   "minimumRottenTomatoesScore", add the weight to the score.
 *
 * @param movie
 * @param people
 */
export const calculateScore = (movie: IMovie, people: IPerson[]): number => {

    // Represents the accumulated score for this movie.
    let score = 0;

    for (const person of people) {

        const prefs = person.preferences;

        // Was the movie released after the year the person prefers (inclusive)?
        if (prefs.afterYear && parseInt(movie.year) >= prefs.afterYear.value) {
            score += prefs.afterYear.weight;
        }

        // Was the movie released before the year the person prefers (exclusive)?
        if (prefs.beforeYear && parseInt(movie.year) < prefs.beforeYear.value) {
            score += prefs.beforeYear.weight;
        }

        // Does the movie have an age rating less than or equal to the person's preference?
        if (prefs.maximumAgeRating && movie.rated <= prefs.maximumAgeRating.value) {
            score += prefs.maximumAgeRating.weight;
        }

        // Is the runtime of the movie less than the person's preference?
        if (prefs.shorterThan && runtimeToMinutes(movie.runtime) < runtimeToMinutes(prefs.shorterThan.value)) {
            score += prefs.shorterThan.weight;
        }

        // Is the genre of the movie the person's favorite genre?
        if (prefs.favoriteGenre && movie.genre.toLowerCase().includes(prefs.favoriteGenre.value)) {
            score += prefs.favoriteGenre.weight;
        }

        // Is the director of the movie the person's least favorite director?
        if (prefs.leastFavoriteDirector && movie.director === prefs.leastFavoriteDirector.value) {
            score -= prefs.leastFavoriteDirector.weight;
        }

        // Does this movie have any of the person's favorite actors?
        if (prefs.favoriteActors) {
            const favoriteActors = prefs.favoriteActors.value;
            const movieActors = movie.actors.split(", ");
            const matchingActors = movieActors.filter(actor => favoriteActors.includes(actor));
            score += prefs.favoriteActors.weight / matchingActors.length;
        }

        // Does the plot of the movie contain any of the person's favorite plot elements?
        if (prefs.favoritePlotElements) {
            const plotElements = prefs.favoritePlotElements.value;
            const matchingElements = plotElements.filter(element => movie.plot.toLowerCase().includes(element.toLowerCase()));
            score += matchingElements.length * prefs.favoritePlotElements.weight;
        }

        // Does the Rotten Tomatoes score of the movie meet the person's minimum score?
        const rtScore = getRottenTomatoesScore(movie);
        if (prefs.minimumRottenTomatoesScore && rtScore !== null && rtScore >= prefs.minimumRottenTomatoesScore.value) {
            score += prefs.minimumRottenTomatoesScore.weight;
        }
    }

    return score;
}

/**
 * Rank a list of movies based on the preferences of a list of people. Movies are ordered
 * by score in descending order.
 * @param movies the list of movies to rank.
 * @param people the list of people with preferences.
 * @return { score: number, id: string }[] the list of movie IDs with their scores.
 */
export const rankMovies = (movies: IMovie[], people: IPerson[]): { score: number; id: string }[] => {
    return movies.map(movie => ({
        id: movie.imdbID,
        score: calculateScore(movie, people),
    })).sort((a, b) => b.score - a.score);
}

/**
 * Extract the Rotten Tomatoes score from a movie's ratings. It is converted from a percentage
 * to a number between 1 and 100.
 * @param movie the movie to extract the score from.
 * @return number the Rotten Tomatoes score.
 */
export const getRottenTomatoesScore = (movie: IMovie): number => {
    const rating = movie.ratings.find(r => r.source === "Rotten Tomatoes");
    if (rating) {
        return parseInt(rating.value.replace('%', ''), 10);
    }
    return 0;
}

/**
 * Convert a runtime string in the format "xh ymin" to minutes. This is necessary to compare
 * runtimes of movies to match them with the preferences of people.
 * @param runtime the runtime string to convert.
 * @return number the runtime in minutes.
 */
export const runtimeToMinutes = (runtime: string): number => {
    const [hours, minutes] = runtime.split("h").map(part => parseInt(part, 10) || 0);
    return hours * 60 + minutes;
}