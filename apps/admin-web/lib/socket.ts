import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "./api";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000", {
      withCredentials: true,
      auth: (cb) => cb({ token: getAccessToken() }),
    });
  }
  return socket;
}
