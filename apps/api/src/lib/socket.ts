import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedisClient } from "./redis";
import { verifyAccessToken } from "../utils/jwt";
import { logger } from "./logger";

let io: Server;

export function initSocket(httpServer: any) {
  const pubClient = createRedisClient();
  const subClient = createRedisClient();

  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://param-adventures-phase1-web.vercel.app",
        "https://param-adventures-phase1-web-git-main-akashs-projects.vercel.app", // Adjust if needed
        process.env.FRONTEND_URL || "", // Allow env var override
      ].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true, // Required for cookies/headers if client sends them
    },
  });

  io.adapter(createAdapter(pubClient, subClient));

  // Authentication Middleware for Sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token;
      const payload = verifyAccessToken(actualToken);
      (socket as any).userId = payload.sub;
      next();
    } catch {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    logger.info(`🔌 Socket connected: ${socket.id} (User: ${userId})`);

    // Join a private room for this user
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

/**
 * Emit an event to a specific user
 */
export function emitToUser(userId: string, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}
