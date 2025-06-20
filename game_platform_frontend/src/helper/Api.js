import io from "socket.io-client";

// Haset Games API URL
const BASE_URL = "https://api.hasetgames.com";
export const socket = io("https://api.hasetgames.com");


// const BASE_URL = "http://localhost:5000";
// export const socket = io("http://localhost:5000");

export default BASE_URL;
