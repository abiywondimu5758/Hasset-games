import io from "socket.io-client";
const BASE_URL = "https://api.bingo.fortunebets.net";
export const socket = io("https://api.bingo.fortunebets.net");

// const BASE_URL = "http://localhost:5000";
// export const socket = io("http://localhost:5000");

export default BASE_URL;
