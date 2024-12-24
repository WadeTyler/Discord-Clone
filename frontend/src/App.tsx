
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import { Channel, DirectMessage, DMChannel, Friend, Server, User } from './types/types'
import { useEffect } from 'react'
import { LoadingSpinnerLG } from './components/lib/util/LoadingSpinner'
import toast from 'react-hot-toast'
import { useWebSocket } from './context/WebSocketContext'
import ChannelPage from './pages/ChannelPage'
import Home from './pages/Home'


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
          const data = await response.json();

          if (!response.ok) throw new Error(data.error);

          return data;
        } catch (error) {
          toast.error((error as Error).message);
          return null;
        }
      }
    });

  // Query Data
  const { data:currentServer } = useQuery<Server | null>({ queryKey: ['currentServer'] });
  const { data:currentTextChannel } = useQuery<Channel | null>({ queryKey: ['currentTextChannel'] });
  const { data:currentVoiceChannel } = useQuery<Channel | null>({ queryKey: ['currentVoiceChannel'] });
  const { data:channels } = useQuery<Channel[]>({ queryKey: ['channels'] });
  const { data:usersInServer } = useQuery<User[]>({ queryKey: ['usersInServer'] });
  const { data:friends } = useQuery<Friend[]>({ queryKey: ['friends'] });
  const { data:friendRequests } = useQuery<Friend[]>({ queryKey: ['friendRequests'] });
  const { data:dmChannels } = useQuery<DMChannel[]>({ queryKey: ['dmChannels'] });  
  const { data:currentDmChannel } = useQuery<DMChannel | null>({ queryKey: ['currentDmChannel'] });


  useEffect(() => {
    console.log("authUser: ", authUser);
    console.log("Friends: ", friends);
    console.log("Friend Requests: ", friendRequests);

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

    // Handle websocket error messages
    client.subscribe(`/topic/error/${authUser?.userID}`, (response) => {
      const data = response.body;
      console.log("Error: ", data);
      toast.error(data);
    });

    client.subscribe(`/topic/success/${authUser?.userID}`, (response) => {
      const data = response.body;
      toast.success(data);
    });


    // Subscribe to friends
    client.subscribe(`/topic/friends/${authUser?.userID}`, (response) => {
      const friends = JSON.parse(response.body);
      console.log("Friends: ", friends);
      queryClient.setQueryData<Friend[]>(['friends'], friends);
    });

    // get friends
    const getFriends = async () => {
      client.publish({ 
        destination: "/app/friends", 
        body: authUser?.userID 
      });
    };
    getFriends();

    // Subscribe to new friend requests
    client.subscribe(`/topic/friends/requests/new/${authUser?.userID}`, (response) => {
      const data = JSON.parse(response.body);
      toast.success("You have a new friend request. From " + data.username + "#" + data.tag);
      getFriendRequests();
    });

    // get friend requests
    const getFriendRequests = async () => {
      client.publish({ 
        destination: "/app/friends/requests", 
        body: authUser?.userID 
      });
    }
    getFriendRequests();

    // Subscribe to all friend requests
    client.subscribe(`/topic/friends/requests/${authUser?.userID}`, (response) => {
      const requests = JSON.parse(response.body);
      console.log("Friend Requests: ", requests);
      queryClient.setQueryData<Friend[]>(['friendRequests'], requests);
    });

    // Subscribe to accepted friend requests
    client.subscribe(`/topic/friends/requests/accept/${authUser?.userID}`, (response) => {
      const data = response.body;
      console.log("Accepted Friend Request: ", data);
      toast.success(data);

      // reload friends and friend requests
      getFriendRequests();
      getFriends();
    });

    // Subscribe to declined friend requests
    client.subscribe(`/topic/friends/requests/decline/${authUser?.userID}`, (response) => {
      const data = response.body;
      toast.success(data);
      // reload friend requests
      getFriendRequests();
    });

    // Subscribe to friend removal
    client.subscribe(`/topic/friends/remove/${authUser?.userID}`, (response) => {
      const data = response.body;
      console.log(data);
      // reload friends
      getFriends();
    });

    // Subscribe to DM Channels
    client.subscribe(`/topic/dm/channels/${authUser?.userID}`, (response) => {
      const dmChannels: DMChannel[] = JSON.parse(response.body);
      console.log("DM Channels: ", dmChannels);
      queryClient.setQueryData<DMChannel[]>(['dmChannels'], dmChannels);
    });

    // Load DM Channels that the user is in on connect
    const getDMChannels = () => {
      client.publish({
        destination: "/app/dm/channels",
        body: authUser?.userID,
      });
    };
    getDMChannels();
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


  // Subscribe to all DM Channels
  useEffect(() => {
    if (client.connected && dmChannels) {
      for (const dmChannel of dmChannels) {
        client.subscribe(`/topic/dm/messages/new/${dmChannel.dmChannelID}`, (response) => {
          const data: DirectMessage = JSON.parse(response.body);
          console.log("New DM: ", data);
          // This is the point discord would play the notification sound
          // Just send a toast instead... :)

          // If the user is not in the DM Channel, send a toast notification
          if (!currentDmChannel || currentDmChannel.dmChannelID !== data.dmChannelID) {
            toast.success("New Message from " + dmChannel.channelName);
          }

        });
      }
    }

    // Cleanup
    return () => {
      if (client.connected && dmChannels) {
        for (const dmChannel of dmChannels) {
          client.unsubscribe(`/topic/dm/messages/new/${dmChannel.dmChannelID}`);
        }
      }
    }

  }, [client, dmChannels])
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

        // Handle users going online
        // If a user goes online, update the user's list to show that.
        client.subscribe(`/topic/servers/${currentServer.serverID}/users/online`, (response) => {
          const user = JSON.parse(response.body);
  
          if (usersInServer) {
            const updatedUsers = usersInServer.map((u) => {
              if (u.userID === user.userID) {
                return user;
              }
              return u;
            });

            queryClient.setQueryData<User[]>(['usersInServer'], updatedUsers);
          }
        });

        // Handle users going offline
        // If a user goes offline, update the user's list to show that.
        client.subscribe(`/topic/servers/${currentServer.serverID}/users/offline`, (response) => {
          const user = JSON.parse(response.body);
  
          if (usersInServer) {
            const updatedUsers = usersInServer.map((u) => {
              if (u.userID === user.userID) {
                return user;
              }
              return u;
            });

            queryClient.setQueryData<User[]>(['usersInServer'], updatedUsers);
          }
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
        client.unsubscribe(`/topic/servers/${currentServer?.serverID}/users/online`);
        client.unsubscribe(`/topic/servers/${currentServer?.serverID}/users/offline`);
        client.unsubscribe(`/topic/friends/${authUser?.userID}`);
      }
    }
  }, [client, currentServer, channels, currentTextChannel, currentVoiceChannel, queryClient, authUser, usersInServer]);

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
          <Route path="/" element={!authUser ? <LoginPage /> : (currentServer ? <ChannelPage /> : <Home />)} />
          <Route path="/login" element={!authUser ? <LoginPage /> : (currentServer ? <ChannelPage /> : <Home />)} />
          <Route path="*" element={authUser ? <ChannelPage /> : <LoginPage />} />
        </Routes>
      </div>
  )
}

export default App