import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getAuthTokenFromCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("Authentication="));
  return match?.split("=")[1];
}

export const getSocket = () => {
  if (!socket && typeof window !== "undefined") {
    const token = getAuthTokenFromCookie();

    socket = io("http://localhost:2000", {
      autoConnect: false,
      transports: ["websocket"],
      withCredentials: true, // envoie bien les cookies HTTP
      auth: { token }, // et, si présent, envoie aussi le JWT explicitement
    });
  }
  return socket;
};
