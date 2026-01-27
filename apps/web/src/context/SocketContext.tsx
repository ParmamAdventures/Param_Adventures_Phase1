"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getAccessToken, API_URL } from "../lib/api";
import { useToast } from "../components/ui/ToastProvider";

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

/**
 * React component for UI presentation and user interaction.
 * @param {Object} props - Component props
 * @returns {React.ReactElement} Component element
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (user && !socketRef.current) {
      const token = getAccessToken();
      if (!token) return;

      // Use explicit backend URL for WebSockets since Vercel Proxy doesn't handle WS well
      const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"], // Force websocket first
        withCredentials: true,
      });

      socket.on("connect", () => {
        console.log("🔌 Real-time connection established");
      });

      socket.on("booking_update", (data) => {
        showToast(data.message || "Booking update received!", "success");
      });

      socket.on("payment_update", (data) => {
        if (data.status === "SUCCESS") {
          showToast("💳 Payment Successful! Your adventure is confirmed.", "success");
        }
      });

      socket.on("assignment_update", (data) => {
        showToast(
          `📋 New Assignment: You are assigned as ${data.role} for ${data.tripTitle}`,
          "info",
        );
      });

      socket.on("error", (err) => {
        console.error("Socket error:", err);
      });

      socketRef.current = socket;
      setSocket(socket);
    }

    if (!user && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      socketRef.current = null;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [user, showToast]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
}

/**
 * React component for UI presentation and user interaction.
 * @param {Object} props - Component props
 * @returns {React.ReactElement} Component element
 */
export function useSocket() {
  return useContext(SocketContext);
}
