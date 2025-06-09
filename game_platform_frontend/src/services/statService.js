import { axiosInstance } from "./authServices";
import BASE_URL from "../helper/Api";
const API_URL = `${BASE_URL}/stats`;

export const fetchWeekly = async (page,limit) => {
  const response = await axiosInstance.get(`${API_URL}/weekly-leaderboard`, {
    params: { page, limit },
  });
  return response.data;
};

export const fetchMonthly = async (page,limit) => {
  const response = await axiosInstance.get(`${API_URL}/monthly-leaderboard`, {
    params: { page, limit },
  });
  return response.data;
};

export const fetchYearly = async (page,limit) => {
  
  const response = await axiosInstance.get(`${API_URL}/yearly-leaderboard`, {
    params: { page, limit },
  });
  return response.data;
};

export const fetchBonusLeaderboard = async () => {
  const response = await axiosInstance.get(`${API_URL}/bonus-leaderboard`);
  return response.data;
}
