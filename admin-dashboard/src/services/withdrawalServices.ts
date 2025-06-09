import { axiosInstance } from "./authServices";
import { BASE_URL } from "../helper/Api";
const API_URL = `${BASE_URL}/roles/withdrawals`;

interface FetchWithdrawalsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string | null;
}

export const fetchPendingWithdrawals = async ({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "createdAt", // Default sorting field
  sortOrder = "desc", // Default sorting order
  status = null,
}: FetchWithdrawalsParams = {}) => {
  // Prepare query parameters
  const params = {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    status,
  };
  if (status !== null) {
    params.status = status;
  }
  const response = await axiosInstance.get(`${API_URL}/pending`, {
    params,
  });

  return {
    pendingWithdrawals: response.data.pendingWithdrawals, // The fetched withdrawals
    pageInfo: response.data.pageInfo, // Information about pagination (current page, total pages, etc.)
  };
};

// Approve a withdrawal request
export const approveWithdrawal = async (withdrawalRequestId: number) => {
  const response = await axiosInstance.post(`${API_URL}/approve`, {
    withdrawalRequestId,
  });
  return response.data; // Return the response data
};

export const rejectWithdrawal = async (withdrawalRequestId: number) => {
  const response = await axiosInstance.post(`${API_URL}/reject`, {
    withdrawalRequestId,
  });
  return response.data; // Return the response data
};
