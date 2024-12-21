import { Client } from "@stomp/stompjs";
import React, { createContext, useContext } from "react";

// Broker URL
const BROKER_URL = import.meta.env.VITE_BROKER_URL;

// Context to store the WebSocket Client
const WebSocketContext = createContext<Client | null>(null);

// Provider to use the WebSocket Client
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Create a new WebSocket Client
  const client = new Client({
    brokerURL: BROKER_URL,
    // debug: (str) => {
    //   console.log("WebSocket Client Debug: ", str);
    // },
  });

  return <WebSocketContext.Provider value={client}>{children}</WebSocketContext.Provider>
};

// Hook to use the WebSocket Client
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }

  return context;
}