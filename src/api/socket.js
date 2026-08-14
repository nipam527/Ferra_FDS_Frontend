import {io} from "socket.io-client";
import {API_BASE_URL} from "./axiosInstance";

const socket = io(API_BASE_URL || "http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnectionAttempts: 3,
});

export default socket;