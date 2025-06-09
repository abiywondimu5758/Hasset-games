
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { axiosInstance } from "./authServices";
import {BingoCardUpdate} from "../types";
import { BASE_URL } from "../helper/Api";
const API_URL = `${BASE_URL}/roles/bingo-cards`;

interface FetchStakesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // Default sorting field for bingo card
  sortOrder?: string; // Default sorting order
}

export const fetchBingoCards = async ({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "id",
  sortOrder = "asc",
}: FetchStakesParams = {}) => {
  // Prepare query parameters
  const params: any = {
    // Using 'any' to handle dynamic properties
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  };

  const response = await axiosInstance.get(`${API_URL}/`, {
    params,
  });

  return {
    bingoCards: response.data.bingoCards, // Fetched bingo cards
    pageInfo: response.data.pageInfo, // Pagination info
  };
};

// Fetch a bingo Card by ID
export const fetchBingoCard = async (id: number): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response;
  };

// Update a bingo Card (only the number fields)
export const updateBingoCard = async (id: number, numbers: BingoCardUpdate): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, numbers);
    return response.data;
  };

// Delete a bingo Card by ID
export const deleteBingoCard = async (
  cardId: number
): Promise<AxiosResponse<any>> => {
  const response = await axiosInstance.delete(`${API_URL}/${cardId}`);
  return response.data;
};

export const generateBingoCards = async (): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance.post(`${API_URL}/generate-cards`);
    return response.data;
  };

  export const regenerateBingoCards = async (): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance.post(`${API_URL}/regenerate-cards`);
    return response.data;
  };

export const deleteAllBingoCards = async (): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance.post(`${API_URL}/delete-bingo-cards`);
    return response.data;
  };

export const addStake = async (amount: number): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance.post(`${API_URL}/create`, {amount});
    return response.data;
}