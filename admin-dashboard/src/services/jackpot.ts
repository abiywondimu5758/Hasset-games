import { BASE_URL } from "../helper/Api";
import { UpdatePrize} from "../types";
import { axiosInstance } from "./authServices";

const API_URL = `${BASE_URL}/roles/jackpot`;


export const fetchPeriods = async() => {
    const response = await axiosInstance.get(`${API_URL}/periods`);
    return response.data;
};

export const drawWinners = async (periodId: number) => {
    const response = await axiosInstance.post(`${API_URL}/draw-winners/${periodId}`);
    return response.data;
}

export const assignPrize = async ( winners: UpdatePrize[]|undefined) => {
    // Using PUT or PATCH for updating data
    const response = await axiosInstance.put(`${API_URL}/assign-prizes`, {winners});
    return response.data;
  };

  export const checkWinners = async(periodId:number|null) => {
    const response = await axiosInstance.get(`${API_URL}/${periodId}`);
    return response.data;
};