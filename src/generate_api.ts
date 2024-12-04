import axios, {type AxiosResponse} from "axios";
import {baseURL, token} from "../config.json";
import type {IPrompt} from "./types.ts";

/**
 * Fetch the prompt from the server.
 * @return Promise<IPrompt> the prompt received from the server.
 */
export const getPrompt = async (): Promise<IPrompt> => {
    const response: AxiosResponse = await axios.get(`${baseURL}/${token}/prompt`);
    if (response.status !== 200) {
        console.log("Error fetching prompt:", response.status);
        process.exit(1);
    }
    return response.data;
}

/**
 * Submit a ranking to the server. The response will be the score achieved.
 * @param ranking the ranking of movie IDs, in order, to submit.
 * @return Promise<number> the score achieved by the ranking.
 */
export const submitRanking = async (ranking: string[]): Promise<number> => {
    const response: AxiosResponse = await axios.post(`${baseURL}/${token}/submit`, ranking);
    if (response.status !== 201) {
        console.log("Error submitting ranking:", response.status);
        process.exit(1);
    }
    return response.data;
}