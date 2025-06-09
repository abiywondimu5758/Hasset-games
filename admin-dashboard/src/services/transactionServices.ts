/* eslint-disable @typescript-eslint/no-explicit-any */

import { axiosInstance } from "./authServices";
import { BASE_URL } from "../helper/Api";

const API_URL = `${BASE_URL}/roles/transactions`;
interface FetchTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // Default sorting field for transactions
  sortOrder?: string; // Default sorting order
  status?: string | null;
  type?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

// Fetch all Transactions with sorting, filtering, and pagination
export const fetchTransactions = async ({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "created_at", // Default sorting field for transactions
  sortOrder = "asc", // Default sorting order
  type = null,
  status = null,
  startDate = null,
  endDate = null,
}: FetchTransactionsParams = {}) => {
  // Prepare query parameters
  const params: any = {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  };

  if (type) params.type = type;
  if (status) params.status = status;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  // Fetch transactions
  const response = await axiosInstance.get(`${API_URL}/`, {
    params,
  });

  return {
    transactions: response.data.transactions, // Fetched transactions
    pageInfo: response.data.pageInfo, // Pagination info
  };
};

// Fetch a specific Transaction by ID
export const fetchTransactionById = async (id: number): Promise<any> => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data; // Return the transaction details
};

export const verifyTransaction = async (tx_ref: string): Promise<any> => {
  
    const response = await axiosInstance.get(`${BASE_URL}/payment/verify`, {
      params: { tx_ref },
    });
    return response.data; // Return the transaction verification details

  
};
