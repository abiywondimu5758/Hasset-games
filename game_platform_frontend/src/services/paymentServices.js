import { axiosInstance } from "./authServices";
import BASE_URL from "../helper/Api";
const API_URL = `${BASE_URL}`;

// Function to initiate a deposit
export const initiateDeposit = async (depositData) => {
  const response = await axiosInstance.post(
    `${API_URL}/payment/deposit`,
    depositData
  );

  return response.data;
};

export const initiateDirectDeposit = async (directdepositData) => {
  const response = await axiosInstance.post(
    `${API_URL}/payment/directdeposit`,
    directdepositData
  );

  return response.data;
};


// Function to verify a payment
export const verifyPayment = async (txRef) => {
  const response = await axiosInstance.get(`${API_URL}/payment/verify`, {
    params: { tx_ref: txRef },
  });
  return response.data;
};

// Function to initiate a withdrawal
export const initiateWithdrawal = async (withdrawalData) => {
  const response = await axiosInstance.post(
    `${API_URL}/payment/withdraw`,
    withdrawalData
  );
  return response.data;
};

// Function to get the list of banks
export const getBanks = async () => {
  const response = await axiosInstance.get(`${API_URL}/payment/banks`);
  return response.data;
};
