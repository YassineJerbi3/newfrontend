// utils/socket.ts

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns a singleton Socket.IO client instance.
 * Automatically connects (with credentials/cookies) when first called in the browser.
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") {
    // On the server, we don't open a socket
    return null;
  }
  if (!socket) {
    socket = io("http://localhost:2000", {
      transports: ["websocket"],
      withCredentials: true,
    });
    console.log("🚀 WS client created & connecting (cookies will be sent)");
  }
  return socket;
}
