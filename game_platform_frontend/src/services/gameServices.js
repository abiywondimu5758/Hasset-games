import { axiosInstance } from './authServices';
import BASE_URL from '../helper/Api';
const API_URL = `${BASE_URL}/games`;

export const fetchGames = async () => {
  const response = await axiosInstance.get(`${API_URL}/games`);
  return response.data.games;
};