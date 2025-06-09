/* eslint-disable no-unused-vars */
import axios from "axios";
import { authStore } from "../stores/AuthStore";
import BASE_URL from "../helper/Api";
const API_URL = `${BASE_URL}/auth`;
const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const sendOTP = async (userData) => {
  const response = await axios.post(`${API_URL}/send-otp`, userData);
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const forgotPassword = async (phoneNumber) => {
  const response = await axios.post(`${API_URL}/forgot-password`, {
    phoneNumber,
  });
  return response.data;
};

export const resendOTP = async (phoneNumber) => {
  const response = await axios.post(`${API_URL}/resend-otp`, { phoneNumber });
  return response.data;
};

export const changeForgottenPassword = async (userData) => {
  const response = await axios.post(
    `${API_URL}/change-forgotten-password`,
    userData
  );
  return response.data;
};

export const checkUsernameAvailability = async (username) => {
  const response = await axios.get(`${API_URL}/check-username`, {
    params: { username },
  });
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

export const logout = async() => {
  const token = localStorage.getItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  
  const response = await axios.post(`${API_URL}/logout`, {refreshToken:token});
  
  return ;
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }
  try {
    const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
    const { accessToken } = response.data;
    localStorage.setItem(TOKEN_KEY, accessToken); // Save the new access token
    return accessToken;
  } catch (error) {
    const errorMessage = error.message
    throw error; // Handle failed token refresh properly
  }
};


// Set up an Axios instance with request interceptor
export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, config } = error.response;

      if (status === 401 && !config.__isRetryRequest) {
        config.__isRetryRequest = true; // Prevents infinite loop if retrying

        try {
          // Attempt to refresh the token
          const newToken = await refreshToken();
          config.headers['Authorization'] = `Bearer ${newToken}`; // Set new token
          authStore.setAccessToken(newToken); // Update access token in AuthStore
          return axiosInstance(config); // Retry the failed request
        } catch (refreshError) {
          // Log out the user if refresh failed
          authStore.logout();
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);


