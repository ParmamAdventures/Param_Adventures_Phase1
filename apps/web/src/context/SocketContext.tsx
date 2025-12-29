"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getAccessToken, API_URL } from "../lib/api";
import { useToast } from "../components/ui/ToastProvider";

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user && !socketRef.current) {
      const token = getAccessToken();
      if (!token) return;

      const socket = io(API_URL, {
        auth: { token },
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
        showToast(`📋 New Assignment: You are assigned as ${data.role} for ${data.tripTitle}`, "info");
      });

      socket.on("error", (err) => {
        console.error("Socket error:", err);
      });

      socketRef.current = socket;
    }

    if (!user && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, showToast]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
