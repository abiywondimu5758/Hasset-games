/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { axiosInstance } from "./authServices";
import { BonusPeriodUpdate, AddBonusPeriod } from "../types"; // Assuming you have a types file with this
import { BASE_URL } from "../helper/Api";

const API_URL = `${BASE_URL}/roles/bonus-periods`;

interface FetchBonusPeriodsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // Default sorting field for bonus period
  sortOrder?: string; // Default sorting order
  status?: string | null;
  type?: string | null;
  startDate?: string | null; 
  endDate?: string | null;
}

// Fetch all Bonus Periods with sorting, filtering, and pagination
export const fetchBonusPeriods = async ({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "createdAt",
  sortOrder = "asc",
  type = null,
  status = null,
  startDate = null,
  endDate = null
}: FetchBonusPeriodsParams = {}) => {
  // Prepare query parameters
  const params: any = {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    status,
    type,
    startDate,
    endDate
  };

  if (type !== null) {
    params.type = type;
  }

  if (status !== null) {
    params.status = status;
  }

  // Add date filters if provided
  if (startDate) {
    params.startDate = startDate;
  }
  if (endDate) {
    params.endDate = endDate;
  }
  const response = await axiosInstance.get(`${API_URL}/`, {
    params,
  });

  return {
    bonusPeriods: response.data.bonusPeriods, // Fetched bonus periods
    pageInfo: response.data.pageInfo, // Pagination info
  };
};

// Fetch a Bonus Period by ID
export const fetchBonusPeriod = async (
  id: number,
  page: number = 1, // Default to page 1
  limit: number = 10 // Default to limit 10
) => {
  
    const response = await axiosInstance.get(`${API_URL}/${id}`, {
      params: { page, limit }, // Pass pagination parameters
    });
    return {
      bonusPeriod:response.data.bonusPeriod,
      pageInfo:response.data.pageInfo,
    }
};

// Update a Bonus Period (only the status field, for example)
export const updateBonusPeriod = async (
  id: number,
  status: BonusPeriodUpdate // Assuming `BonusPeriodUpdate` only contains status
): Promise<AxiosResponse<any>> => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, status);
  return response.data;
};

// Delete a Bonus Period by ID
export const deleteBonusPeriod = async (
  bonusPeriodId: number
): Promise<AxiosResponse<any>> => {
  const response = await axiosInstance.delete(`${API_URL}/${bonusPeriodId}`);
  return response.data;
};

export const addBonusPeriod = async (addBonusPeriod: AddBonusPeriod): Promise<AxiosResponse<any>> => {
  const response = await axiosInstance.post(`${API_URL}/create`, addBonusPeriod);
  return response.data;
}