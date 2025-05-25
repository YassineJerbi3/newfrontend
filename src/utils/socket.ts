// utils/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io("http://localhost:2000", {
      // simply drop autoConnect:false so it connects as soon as you call io()
      transports: ["websocket"],
      withCredentials: true,
    });
    console.log("🚀 WS client created & connecting (cookies will be sent)");
  }
  return socket;
}
