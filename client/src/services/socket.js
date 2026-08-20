import { io } from "socket.io-client";

// Single shared socket instance for the whole app.
// Connects lazily — only opens once SocketProvider mounts.
const socket = io("/", {
  path: "/socket.io",
  autoConnect: false,
  transports: ["websocket", "polling"],
});

export default socket;
