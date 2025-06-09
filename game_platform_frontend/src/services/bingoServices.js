import { axiosInstance } from "./authServices";
import BASE_URL from "../helper/Api";
const API_URL = `${BASE_URL}/bingo`;

export const fetchStakes = async () => {
  const response = await axiosInstance.get(`${API_URL}/stakes`);
  return response.data;
};

export const checkIfPlayerInGame = async () => {
  const response = await axiosInstance.get(`${API_URL}/Check-player`);
  return response.data;
};

export const joinGame = async (stakeId) => {
  const response = await axiosInstance.post(`${API_URL}/join`, { stakeId });
  return response.data;
};

export const fetchGameStatus = async (gameId) => {
  const response = await axiosInstance.get(`${API_URL}/game-status`, {
    params: { gameId },
  });
  return response.data;
};

export const fetchBingoCards = async () => {
  const response = await axiosInstance.get(`${API_URL}/bingo-cards`);
  return response.data;
};

export const leaveGame = async (stakeId) => {
  const response = await axiosInstance.put(`${API_URL}/leave-game`, {
    stakeId,
  });
  return response.data;
};

export const changeCard = async (gameId, cardId) => {
  const response = await axiosInstance.put(`${API_URL}/update-game`, {
    gameId,
    cardId,
  });
  return response.data;
};

export const markNumber = async (num, gameId, cardId) => {
  const response = await axiosInstance.post(`${API_URL}/mark-number`, {
    num,
    gameId,
    cardId,
  });
  return response.data;
};

export const getMarkedListById = async (gameId, cardId) => {
  const response = await axiosInstance.post(`${API_URL}/marked-list`, {
    gameId,
    cardId,
  });
  return response.data;
};

export const declareBingo = async (gameId) => {
  const response = await axiosInstance.post(`${API_URL}/declare-bingo`, {
    gameId,
  });
  return response.data;
};

export const toggleAutoPlay = async (gameId, cardId, autoPlay) => {
  const response = await axiosInstance.post(`${API_URL}/toggle-game-mode`, {
    gameId,
    cardId,
    autoPlay,
  });
  return response.data;
};

export const getGameById = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/games/${id}`);
  return response.data;
};
