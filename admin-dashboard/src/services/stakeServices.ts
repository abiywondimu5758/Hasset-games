/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { axiosInstance } from "./authServices";
import { BASE_URL } from "../helper/Api";
const API_URL = `${BASE_URL}/roles/stakes`;

interface FetchStakesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // Default sorting field for stakes
  sortOrder?: string; // Default sorting order
}

export const fetchStakes = async ({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "amount",
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
    stakes: response.data.stakes, // Fetched stakes
    pageInfo: response.data.pageInfo, // Pagination info
  };
};

// Delete a referred user by ID
export const deleteStake = async (
  stakeId: number
): Promise<AxiosResponse<any>> => {
  const response = await axiosInstance.delete(`${API_URL}/delete-stake/${stakeId}`);
  return response.data;
};

export const addStake = async (amount: number): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance.post(`${API_URL}/create`, {amount});
    return response.data;
}