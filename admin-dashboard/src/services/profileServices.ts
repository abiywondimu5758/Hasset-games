import { axiosInstance } from "./authServices";
import { BASE_URL } from "../helper/Api";

export const fetchProfile = async () => {
    const response = await axiosInstance.get(`${BASE_URL}/user/profile`); 
    return response.data;
  };