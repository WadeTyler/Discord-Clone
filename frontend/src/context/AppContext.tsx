import { createContext, ReactNode, useContext, useState } from "react";
import { Channel, Server } from "../types/types"
import { servers } from "../constants/testData";


type AppContextType = {
  currentServer: Server | null;
  setCurrentServer: (server: Server) => void;
  currentTextChannel: Channel | null;
  setCurrentTextChannel: (channel: Channel) => void;
  currentVoiceChannel: Channel | null;
  setCurrentVoiceChannel: (channel: Channel) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentServer, setCurrentServer] = useState<Server | null>(servers[0]);
  const [currentTextChannel, setCurrentTextChannel] = useState<Channel | null>(null);
  const [currentVoiceChannel, setCurrentVoiceChannel] = useState<Channel | null>(null);

  return (
    <AppContext.Provider
      value={{
        currentServer,
        setCurrentServer,
        currentTextChannel,
        setCurrentTextChannel,
        currentVoiceChannel,
        setCurrentVoiceChannel
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}