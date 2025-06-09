/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { axiosInstance } from "./authServices";
import { BASE_URL } from "../helper/Api";
const API_URL = `${BASE_URL}/roles/referred-users`;

// List all referred users with filtering, sorting, and pagination
interface FetchReferredUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // Default sorting field for referred users
  sortOrder?: string; // Default sorting order
  startDate?: string | null; // Start date for filtering
  endDate?: string | null; // End date for filtering
}

export const fetchReferredUsers = async ({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "registrationDate",
  sortOrder = "asc",
  startDate = null,
  endDate = null,
}: FetchReferredUsersParams = {}) => {
  // Prepare query parameters
  const params: any = { // Using 'any' to handle dynamic properties
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  };

  // Add specific filters if provided
  if (startDate) {
    params.startDate = new Date(startDate).toISOString(); // Format as ISO string
  }
  if (endDate) {
    params.endDate = new Date(endDate).toISOString(); // Format as ISO string
  }

    const response = await axiosInstance.get(`${API_URL}/`, {
      params,
    });

    return {
      referredUsers: response.data.referredUsers, // Fetched referred users
      pageInfo: response.data.pageInfo, // Pagination info
    
  }
};

// Fetch a referred user by ID
export const fetchReferredUser = async (id: number): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response;

};

// Delete a referred user by ID
export const deleteReferredUser = async (userId: number): Promise<AxiosResponse<any>> => {
  
    const response = await axiosInstance.delete(`${API_URL}/delete-referred-user`, {
      params: { userId },
    });
    return response.data;
  
};
