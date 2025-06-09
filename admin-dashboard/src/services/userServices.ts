/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { axiosInstance } from "./authServices";
import { UserUpdate } from "../types";
import { BASE_URL } from "../helper/Api";
const API_URL = `${BASE_URL}/roles`;

interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  verified?: boolean | null;
  role?: string | null; // Added role filter
  startDate?: string | null;
  endDate?: string | null;
}

export const fetchUsers = async ({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "registrationDate", // Default sorting field
  sortOrder = "asc", // Default sorting order
  verified = null, // Filter by verification status (null for all, true/false for specific)
  role = null, // Filter by role (null for all, specific role if provided)
  startDate = null, // Start date for filtering
  endDate = null, // End date for filtering
}: FetchUsersParams = {}) => {
  // Prepare query parameters
  const params = {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    verified,
    role,
    startDate,
    endDate,
  };

  // Only add verified if it's explicitly provided (true/false)
  if (verified !== null) {
    params.verified = verified;
  }

  // Only add role if it's explicitly provided
  if (role !== null) {
    params.role = role;
  }

  // Add date filters if provided
  if (startDate) {
    params.startDate = startDate;
  }
  if (endDate) {
    params.endDate = endDate;
  }

  const response = await axiosInstance.get(`${API_URL}/users`, {
    params,
  });

  return {
    users: response.data.users, // The fetched users
    pageInfo: response.data.pageInfo, // Information about pagination (current page, total pages, etc.)
  };
};


export const fetchUser = async (id: number, cardPage: number = 1, cardLimit: number = 10) => {
  const response = await axiosInstance.get(`${API_URL}/users/${id}`, {
    params: { cardPage, cardLimit },
  });
  console.log("response", response.data);
  return response.data;
};
export const updateUser = async (id: number | undefined, userData: UserUpdate): Promise<AxiosResponse<any>> => {
    // Using PUT or PATCH for updating data
    const response = await axiosInstance.put(`${API_URL}/users/${id}`, userData);
    return response.data;
  };

export const deleteUser = async (userId: number) => {
  const response = await axiosInstance.delete(`${API_URL}/delete-user`, {
    params: { userId }, // Include userId in params for GET requests
  });
  return response.data;
};
