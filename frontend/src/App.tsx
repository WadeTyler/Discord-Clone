
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import { Channel, Server, User } from './types/types'
import { useEffect } from 'react'
import { LoadingSpinnerLG } from './components/lib/util/LoadingSpinner'
import toast from 'react-hot-toast'
import { useWebSocket } from './context/WebSocketContext'
import ChannelPage from './pages/ChannelPage'
import DirectMessages from './pages/DirectMessages'

const App = () => {

  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL;


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

  // Current Server, Current Text Channel, Current Voice Channel, channels
  const { data:currentServer } = useQuery<Server | null>({ queryKey: ['currentServer'] });
  const { data:currentTextChannel } = useQuery<Channel | null>({ queryKey: ['currentTextChannel'] });
  const { data:currentVoiceChannel } = useQuery<Channel | null>({ queryKey: ['currentVoiceChannel'] });
  const { data:channels } = useQuery<Channel[]>({ queryKey: ['channels'] });

  useEffect(() => {
    console.log("authUser: ", authUser);

    // Set the server to the first server in the joined servers list
    if (authUser && joinedServers && currentServer === null) {
      console.log("Setting initial server to: ", joinedServers[0]);
      queryClient.setQueryData<Server>(['currentServer'], joinedServers[0]);
    }

    // Debugging
    console.log("Current Server: ", currentServer);
    console.log("Current Text Channel: ", currentTextChannel);
    console.log("Current Voice Channel: ", currentVoiceChannel);

  }, [authUser, joinedServers, currentServer, currentTextChannel, currentVoiceChannel]);


  /* ----------------------------- Web Socket ----------------------------- */

  // StompJS WebSocket Client
  const client = useWebSocket();

  // On Connecting to WebSocket Broker
  client.onConnect = () => {
    console.log("Connected to WebSocket Broker");
    client.publish({
      destination: "/app/onConnect",
      body: authUser?.userID,
    });
  };

  // On Disconnecting from WebSocket Broker
  client.onDisconnect = () => {
    disconnectClient();
  };

  // Disconnect WebSocket Client
  const disconnectClient =() => {

    if (client.connected) {
      client.publish({
        destination: "/app/onDisconnect",
        body: authUser?.userID,
      });
      console.log("Disconnected from WebSocket Broker");
    }

    
  };

  useEffect(() => {
    if (authUser && !client.active) {
      client.activate();
    }

    // Disconnect WebSocket Client on page unload
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

  useEffect(() => {
    if (client.connected) {

      // Handle websocket error messages
      client.subscribe(`/topic/error/${authUser?.userID}`, (response) => {
        const data = JSON.parse(response.body).body;
        toast.error(data.error);
      });

      
      if (currentServer) {

        // Handle current server updates.
        // If the owner of the server updates the server, all users in the server will receive the updated server.
        client.subscribe(`/topic/servers/${currentServer.serverID}/update`, (response) => {
          const data = JSON.parse(response.body);
          queryClient.setQueryData<Server>(['currentServer'], data);
          queryClient.invalidateQueries({ queryKey: ['joinedServers'] });
        });

        // Handle current server deletion.
        // If the owner of the server deletes the server, all users in the server will be redirected to the home page.
        client.subscribe(`/topic/servers/${currentServer.serverID}/delete`, (response) => {

          const server = JSON.parse(response.body);

          // If in a text channel in that server
          if (currentTextChannel?.serverID === server.serverID) {
            queryClient.setQueryData<Channel | null>(['currentTextChannel'], null);
          }

          // If in a voice channel in that server
          if (currentVoiceChannel?.serverID === server.serverID) {
            queryClient.setQueryData<Channel | null>(['currentVoiceChannel'], null);
          }

          queryClient.setQueryData<Server | null>(['currentServer'], null);
          queryClient.invalidateQueries({ queryKey: ['joinedServers'] });
          
        });

        // Handle current text channel updates.
        // If the owner of the text channel updates the text channel, all users in the server will receive the updated text channel.
        client.subscribe(`/topic/servers/${currentServer.serverID}/channels/update`, (response) => {
          const channel = JSON.parse(response.body);

          console.log("Updated Channel: ", channel);

          // Update the current text channel if it is the updated channel
          if (currentTextChannel?.channelID === channel.channelID) {
            queryClient.setQueryData<Channel | null>(['currentTextChannel'], channel);
          }


          // Update the current voice channel if it is the updated channel
          else if (currentVoiceChannel?.channelID === channel.channelID) {
            queryClient.setQueryData<Channel | null>(['currentVoiceChannel'], channel);
          }

          // Update the channels list
          if (channels) {
            const updatedChannels = channels.map((c) => {
              if (c.channelID === channel.channelID) {
                return channel;
              }
              return c;
            });

            queryClient.setQueryData<Channel[]>(['channels'], updatedChannels);
          }

        });

        // Handle new channel creation
        // If the owner of the server creates a new channel, all users in the server will receive the new channel.
        client.subscribe(`/topic/servers/${currentServer.serverID}/channels/new`, (response) => {
          const channel = JSON.parse(response.body);
          console.log("New Channel: ", channel);
          // Just refresh the list of channels
          queryClient.invalidateQueries({ queryKey: ['channels'] });
        });

        // Handle channel deletion
        // If the owner of the server deletes a channel, all users in the server will receive the deleted channel.
        client.subscribe(`/topic/servers/${currentServer.serverID}/channels/delete`, (response) => {
          const channel = JSON.parse(response.body);
          console.log("Deleted Channel: ", channel);

          // If in the deleted text channel
          if (currentTextChannel?.channelID === channel.channelID) {
            queryClient.setQueryData<Channel | null>(['currentTextChannel'], null);
          }

          // If in the deleted voice channel  
          if (currentVoiceChannel?.channelID === channel.channelID) {
            queryClient.setQueryData<Channel | null>(['currentVoiceChannel'], null);
          }

          // Then refresh the list of channels
          queryClient.invalidateQueries({ queryKey: ['channels'] });
        });
      }
    }

    // Cleanup
    return () => {
      if (client.connected) {
        client.unsubscribe(`/topic/servers/${currentServer?.serverID}/update`);
        client.unsubscribe(`/topic/servers/${currentServer?.serverID}/delete`);
        client.unsubscribe(`/topic/servers/${currentServer?.serverID}/channels/update`);
        client.unsubscribe(`/topic/servers/${currentServer?.serverID}/channels/new`);
        client.unsubscribe(`/topic/servers/${currentServer?.serverID}/channels/delete`);
        client.unsubscribe(`/topic/error/${authUser?.userID}`);
      }
    }
  }, [client, currentServer, channels, currentTextChannel, currentVoiceChannel, queryClient, authUser]);

  /* --------------------------------------------------------------------------------------- */

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
          <Route path="/" element={authUser ? <ChannelPage /> : <LoginPage />} />
          <Route path="/dm" element={authUser ? <DirectMessages /> : <LoginPage />} />
          <Route path="/channels/:serverID/:channelID" element={authUser ? <ChannelPage /> : <LoginPage />} />
          <Route path="*" element={authUser ? <ChannelPage /> : <LoginPage />} />
        </Routes>
      </div>
  )
}

export default App