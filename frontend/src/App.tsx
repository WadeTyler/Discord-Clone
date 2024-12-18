
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import ServerPage from './pages/ServerPage'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import { Channel, Server, User } from './types/types'
import { useEffect } from 'react'
import { LoadingSpinnerLG } from './components/lib/util/LoadingSpinner'
import toast from 'react-hot-toast'
import { Client } from '@stomp/stompjs'

const App = () => {

  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL;
  const BROKER_URL = import.meta.env.VITE_BROKER_URL; 


  // Auth User
  const { data:authUser, isLoading:loadingAuthUser } = useQuery<User | null>({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          console.log("You are not logged in.");
          return null;
        }

        return data;
      } catch (error) {
        console.log("Error fetching authUser: " + (error as Error).message);
        return null;
      }
    }
  });

  // Joined Servers
  const { data:joinedServers } = useQuery<Server[] | null>({
      queryKey: ['joinedServers'],
      queryFn: async () => {
        try {
          const response = await fetch(`${API_URL}/servers/joined`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          const data = await response.json();[]
  
          if (!response.ok) throw new Error(data.error);
  
          return data;
        } catch (error) {
          toast.error((error as Error).message);
          return null;
        }
      }
    });

  // Current Server, Current Text Channel, Current Voice Channel
  const { data:currentServer } = useQuery<Server | null>({ queryKey: ['currentServer'] });
  const { data:currentTextChannel } = useQuery<Channel | null>({ queryKey: ['currentTextChannel'] });
  const { data:currentVoiceChannel } = useQuery<Channel | null>({ queryKey: ['currentVoiceChannel'] });

  // StompJS WebSocket Client
  const client = new Client({
    brokerURL: BROKER_URL,
    debug: (str) => {
      console.log(str);
    }
  });

  client.onConnect = () => {
    console.log("Connected to WebSocket Broker");
    client.publish({
      destination: "/app/onConnect",
      body: authUser?.userID,
    });
  };

  client.onDisconnect = () => {
    disconnectClient();
  };

  const disconnectClient =() => {
    client.publish({
      destination: "/app/onDisconnect",
      body: authUser?.userID,
    });
    console.log("Disconnected from WebSocket Broker");
  }

  useEffect(() => {
    console.log("authUser: ", authUser);

    // Set the server to the first server in the joined servers list
    if (authUser && joinedServers && currentServer === null) {
      console.log("Setting initial server to: ", joinedServers[0]);
      queryClient.setQueryData<Server>(['currentServer'], joinedServers[0]);
    }



    console.log("Current Server: ", currentServer);
    console.log("Current Text Channel: ", currentTextChannel);
    console.log("Current Voice Channel: ", currentVoiceChannel);

  }, [authUser, joinedServers, currentServer, currentTextChannel, currentVoiceChannel]);

  useEffect(() => {
    if (authUser && !client.active) {
      client.activate();
    }

    const handleBeforeUnload = () => {
      if (client.active) {
        disconnectClient();
        console.log("Deactivating WebSocket Client");
        client.deactivate();
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);


    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (client.active) {
        disconnectClient();
        console.log("Deactivating WebSocket Client");
        client.deactivate();
      }
    };
  }, [authUser]);

  if (loadingAuthUser) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-primary">
        <LoadingSpinnerLG />
      </div>
    )
  }

  return (
    <div className="flex">
        {authUser && <Sidebar />}
        <Routes>
          <Route path="/" element={authUser ? <ServerPage /> : <LoginPage />} />
          <Route path="/channels/:serverID/:channelID" element={authUser ? <ServerPage /> : <LoginPage />} />
          <Route path="*" element={authUser ? <ServerPage /> : <LoginPage />} />
        </Routes>
      </div>
  )
}

export default App