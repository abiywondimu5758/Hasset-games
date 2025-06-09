/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { axiosInstance } from "./authServices";
import { BingoGameUpdate} from "../types"
import { BASE_URL } from "../helper/Api";
// import { BingoGameUpdate } from "../types";
const API_URL = `${BASE_URL}/roles/bingo-games`;

// List all bingo games
interface FetchBingoGamesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // Default sorting field for games
  sortOrder?: string; // Default sorting order
  hasEnded?: boolean | null; // Filter by game status (null for all, true/false for ended games)
  active?: boolean | null; // Filter by active games (null for all, true/false for specific)
  startDate?: string | null; // Start date for filtering
  endDate?: string | null; // End date for filtering
}

export const fetchBingoGames = async ({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "createdAt",
  sortOrder = "asc",
  hasEnded = null,
  active = null,
  startDate = null,
  endDate = null,
}: FetchBingoGamesParams = {}) => {
  // Prepare query parameters
  const params: any = { // Using 'any' here to avoid type errors with dynamic properties
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  };

  // Add specific filters only if provided
  if (hasEnded !== null) {
    params.hasEnded = String(hasEnded); // Ensure this is a string
  }
  if (active !== null) {
    params.active = String(active); // Ensure this is a string
  }
  if (startDate) {
    params.startDate = new Date(startDate).toISOString(); // Ensure date is formatted as ISO string
  }
  if (endDate) {
    params.endDate = new Date(endDate).toISOString(); // Ensure date is formatted as ISO string
  }


    const response = await axiosInstance.get(`${API_URL}/`, {
      params,
    });

    return {
      bingoGames: response.data.bingoGames, // Fetched bingo games
      pageInfo: response.data.pageInfo, // Information about pagination
    };

};
  

// Fetch a bingo game by ID
export const fetchBingoGame = async (id: number): Promise<AxiosResponse<any>> => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response;
};

// Update a bingo game (only the `hasEnded` and `active` fields)
export const updateBingoGame = async (id: number, gameData: BingoGameUpdate): Promise<AxiosResponse<any>> => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, gameData);
  return response.data;
};

// Delete a bingo game by ID
export const deleteBingoGame = async (gameId: number): Promise<AxiosResponse<any>> => {
  const response = await axiosInstance.delete(`${API_URL}/delete-bingo-game`, {
    params: { gameId },
  });
  return response.data;
};
