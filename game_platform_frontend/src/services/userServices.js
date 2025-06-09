import BASE_URL from '../helper/Api';
import { axiosInstance } from './authServices';
const API_URL = `${BASE_URL}/user`;

export const fetchProfile = async () => {
  const response = await axiosInstance.get(`${API_URL}/profile`);
  return response.data.user;
};

export const changePassword = async (passwordData) => {
    const response = await axiosInstance.post(`${API_URL}/change-password`, passwordData);
    return response.data;
  };

export const changeUsername = async (username) => {
    const response = await axiosInstance.post(`${API_URL}/change-username`, username);
    return response.data;
  };

  export const fetchUserGameHistory = async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`${API_URL}/user-game-history`, {
      params: { page, limit }
    });
    return response.data;
  };

  export const fetchUserReferralHistory = async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`${API_URL}/user-referral-history`, {
      params: { page, limit }
    });
    return response.data;
  }

  export const fetchUserTransactionHistory = async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`${API_URL}/user-transaction-history`, {
      params: { page, limit }
    });
    return response.data;
  }
