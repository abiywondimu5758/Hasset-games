import { axiosInstance } from "./authServices";
import { BASE_URL } from "../helper/Api";

const API_URL = `${BASE_URL}/roles`;

export const calculateMonthlyAggregates = async (
  startDate?: string,
  endDate?: string
) => {
  let url = `${API_URL}/calculateMonthlyAggregates`;
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await axiosInstance.get(url);
  return response.data;
};

export const calculateFees = async (startDate: string, endDate: string) => {
  let url = `${API_URL}/calculateFees`;
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  
  const response = await axiosInstance.get(url);
  return response.data;
};

export const fetchLast7DaysStats = async () => {
  const url = `${API_URL}/fetchLast7DaysStats`;
  const response = await axiosInstance.get(url);
  return response.data;
};

export const fetchDashboardData = async () => {
  const url = `${API_URL}/fetchDashboardData`;
  const response = await axiosInstance.get(url);
  return response.data;
};

export const fetchPlatformFeeStats = async () => {
  const url = `${API_URL}/fetchPlatformFeeStats`;
  const response = await axiosInstance.get(url);
  return response.data;
};
