import axios from 'axios';
import { BASE_URL } from '../helper/Api';
import { RegisterData, LoginCredentials } from '../types';
const API_URL = `${BASE_URL}/auth`;
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';



export const register = async (userData: RegisterData) => {
  const response = await axios.post(`${API_URL}/staff-register`, userData);
  return response.data;
};

export const login = async (credentials: LoginCredentials) => {
  const response = await axios.post(`${API_URL}/staff-login`, credentials);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};


// Set up an Axios instance with request interceptor
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }
    const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
    const { accessToken } = response.data;
    localStorage.setItem(TOKEN_KEY, accessToken); // Save the new access token
    return accessToken;

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
          const newToken = await refreshToken();
          config.headers['Authorization'] = `Bearer ${newToken}`; 
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

