/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { axiosInstance } from "./authServices";
import { BASE_URL } from "../helper/Api";
const API_URL = `${BASE_URL}/roles/user-bingo-cards`;

// List all bingo games
interface FetchBingoCardsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // Default sorting field for games
  sortOrder?: string; // Default sorting order
  autoPlay?: boolean | null; // Filter by autoPlay (null for all, true/false for specific)
  startDate?: string | null; // Start date for filtering
  endDate?: string | null; // End date for filtering
}

export const fetchUserBingoCards = async ({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "createdAt",
  sortOrder = "asc",
  autoPlay = null,
  startDate = null,
  endDate = null,
}: FetchBingoCardsParams = {}) => {
  // Prepare query parameters
  const params: any = { // Using 'any' here to avoid type errors with dynamic properties
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  };

  // Add specific filters only if provided

  if (autoPlay !== null) {
    params.active = String(autoPlay); // Ensure this is a string
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
      userBingoCards: response.data.userBingoCards, // Fetched user bingo cards
      pageInfo: response.data.pageInfo, // Information about pagination
    };

};
  

// Fetch a user bingo card by ID
export const fetchUserBingoCard = async (userId: number|null, gameId:number|null): Promise<AxiosResponse<any>> => {
  const response = await axiosInstance.get(`${API_URL}/card`,{params:{
    userId,
    gameId
  }});
  return response;
};



// Delete a bingo card by ID
export const deleteUserBingoCard = async (userId: number,gameId:number,cardId:number): Promise<AxiosResponse<any>> => {
  const response = await axiosInstance.delete(`${API_URL}/delete-bingo-card`, {
    params: { userId,gameId,cardId },
  });
  return response.data;
};
