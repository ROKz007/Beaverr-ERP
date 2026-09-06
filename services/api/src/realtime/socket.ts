import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { env } from "../config/env";
import { verifyAccessToken, type AccessTokenPayload } from "../utils/jwt";
import { bookingsRepository } from "../modules/bookings/bookings.repository";

const ADMIN_ROLES = new Set(["SOCIETY_ADMIN", "DEPT_HEAD"]);
const SECURITY_ROLES = new Set(["GUARD", "SOCIETY_ADMIN", "DEPT_HEAD"]);

let io: Server | undefined;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, { cors: { origin: env.frontendUrls, credentials: true } });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      socket.data.user = verifyAccessToken(token) as AccessTokenPayload;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as AccessTokenPayload;
    socket.join(`user:${user.userId}`);
    socket.join(`society:${user.societyId}`);
    if (SECURITY_ROLES.has(user.role)) {
      socket.join(`security:${user.societyId}`);
    }

    socket.on("booking:subscribe", async (bookingId: string) => {
      const booking = await bookingsRepository.findById(user.societyId, bookingId);
      if (!booking) return;
      const isAdmin = ADMIN_ROLES.has(user.role);
      if (!isAdmin && booking.residentId !== user.userId) return;
      socket.join(`booking:${bookingId}`);
    });
  });

  return io;
}

export function emitBookingUpdate(bookingId: string, payload: unknown) {
  io?.to(`booking:${bookingId}`).emit("booking:update", payload);
}

export function emitNotification(userId: string, payload: unknown) {
  io?.to(`user:${userId}`).emit("notification:new", payload);
}

export function emitPaymentReceived(userId: string, payload: unknown) {
  io?.to(`user:${userId}`).emit("payment:received", payload);
}

export function emitSosTriggered(societyId: string, payload: unknown) {
  io?.to(`security:${societyId}`).emit("sos:triggered", payload);
}

export function emitEmergencyBroadcast(societyId: string, payload: unknown) {
  io?.to(`society:${societyId}`).emit("emergency:broadcast", payload);
}
