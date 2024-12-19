import { useEffect, useState } from "react";
import ServerList from "./ServerList"
import { Channel, Server, User } from "../../types/types";
import { IconChevronDown, IconCompassFilled, IconHeadphonesFilled, IconMicrophoneFilled, IconSettingsFilled } from "@tabler/icons-react";
import ChannelButton from "./ChannelButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UserSkeleton } from "../skeletons/Skeletons";
import { ChannelSkeleton } from "../skeletons/Skeletons";
import CloseButton from "../lib/CloseButton";
import UploadImage from "../lib/UploadImage";
import { LoadingSpinnerMD } from "../lib/util/LoadingSpinner";

const Sidebar = () => {

  // Query Data
  const {data:authUser, isPending:isLoadingAuthUser} = useQuery<User | null>({ queryKey: ['authUser'] });
  const {data:currentServer } = useQuery<Server | null>({ queryKey: ['currentServer'] });

  // States
  const [hoveringUserInfo, setHoveringUserInfo] = useState(false);
  const [creatingServer, setCreatingServer] = useState<boolean>(false);

  return (
    <div className="min-w-72 w-72 h-screen bg-secondary flex relative">

      {/* Creating Server */}
      {creatingServer && <CreatingServer setCreatingServer={setCreatingServer} />}

      {/* Server List */}
      <ServerList setCreatingServer={setCreatingServer} />

      {/* Show the ServerBar for the selected server */}
      {currentServer && <ServerBar /> }

      {/* Bottom Bar */}
      <div className="absolute bottom-0 w-full h-16 flex items-center bg-tertiary">

        {/* Nav Button */}
        <div className="w-16 px-4 h-full bg-tertiary flex items-center justify-center">
          <div className="min-w-12 w-12 p-2 flex items-center justify-center bg-primary hover:bg-green-500 hover:text-white cursor-pointer rounded-[50%] hover:rounded-[30%] duration-300" >
            <IconCompassFilled className="text-4xl w-full h-full"/>
          </div>
        </div>

        {/* User Util */}
        {authUser && !isLoadingAuthUser && (
          <div className="w-full h-full flex items-center p-2 justify-between">

            {/* Left Side */}
            <div 
            onMouseEnter={() => setHoveringUserInfo(true)}
            onMouseLeave={() => setHoveringUserInfo(false)}
            className="flex gap-1 items-center hover:bg-zinc-600 pr-2 py-1 rounded w-full cursor-pointer">
              {/* Avatar */}
              <div className={`bg-center bg-cover w-8 h-8 rounded-full`} 
              style={{ backgroundImage: authUser?.avatar ? `url(${authUser.avatar})` : `url('./default-avatar.png')` }}
              >

              </div>

              {/* Name */}
              <section className="flex flex-col text-sm justify-center">
                <p>{authUser?.username}</p>
                {!hoveringUserInfo && <p className="text-xs text-gray-400">{authUser?.status}</p>}
                {hoveringUserInfo && <p className="text-xs text-gray-400">#{authUser?.tag}</p>}
              </section>
            </div>

            <div className="flex items-center text-xs">
              <button className="hover:bg-primary p-1 rounded cursor-pointer">
                <IconMicrophoneFilled />
              </button>
              <button className="hover:bg-primary p-1 rounded cursor-pointer">
                <IconHeadphonesFilled />
              </button>
              <button className="hover:bg-primary p-1 rounded cursor-pointer">
                <IconSettingsFilled />
              </button>
            </div>

          
          </div>
        )}
        {isLoadingAuthUser && (
          <UserSkeleton />
        )}

      </div>

    </div>
  )
}

export default Sidebar

const ServerBar = () => {

  // QueryClient
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Current Server
  const {data:currentServer} = useQuery<Server | null>({ queryKey: ['currentServer'] });

  // Current Text Channel
  const { data:currentTextChannel } = useQuery<Channel | null>({ queryKey: ['currentTextChannel'] });

  useEffect(() => {
    console.log("Current Server: ", currentServer);
  }, [currentServer]);

  // Fetch channels
  const { data: channels, isPending:isLoadingChannels } = useQuery<Channel[]>({
    queryKey: ['channels'],
    queryFn: async () => {
      try {
        if (!currentServer) 
          throw new Error("No server selected");

        const response = await fetch(`${API_URL}/servers/${currentServer.serverID}/channels`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        return data;

      } catch (error) {
        toast.error((error as Error).message);
        return null;
      }
    }
  });


  useEffect(() => {
    // Invalidate channels query on server change
    if (currentServer?.serverID !== channels?.[0].serverID)
      queryClient.invalidateQueries({ queryKey: ['channels'] });

    // Set the first channel as the current channel
    if (channels && (!currentTextChannel || currentTextChannel.serverID !== channels[0].serverID)) {
      queryClient.setQueryData<Channel>(['currentTextChannel'], channels.filter(channel => channel.type === 'text')[0]);
    }

  }, [currentServer, channels]);


  return (

    <div className="h-full w-full bg-secondary flex flex-col gap-4">
      {/* Server Info */}
      <div className="h-12 w-full flex py-2 px-4 shadow-md border-b-tertiary border-b items-center justify-between">
        <p>{currentServer?.serverName}</p>
        <IconChevronDown />
      </div>

      {/* Text Channels */}
      <div className="flex flex-col gap-1 p-2">
        {!isLoadingChannels && channels?.map((channel: Channel) => (
          <ChannelButton key={channel.channelID} channel={channel} />
        ))}
        {isLoadingChannels && (
          Array.from({length: 10}, (_, index) => (
            <ChannelSkeleton key={index} />
          )))
        }
      </div>



    </div>
  )

}

const CreatingServer = ({setCreatingServer}: {
  setCreatingServer: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  // AuthUser
  const {data:authUser} = useQuery<User | null>({ queryKey: ['authUser'] });

  // States
  const [serverName, setServerName] = useState<string>(`${authUser?.username}'s Server`);

  // QueryClient
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();



  // Mutation to handle creating the server
  const { mutate:createServer, isPending:isLoadingCreateServer } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`${API_URL}/servers/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ serverName }),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        // Set current server to the newly created server
        queryClient.setQueryData<Server>(['currentServer'], data);

        return data;
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
    onSuccess: () => {
      toast.success("Server created successfully");
      queryClient.invalidateQueries({ queryKey: ['joinedServers'] });
      setCreatingServer(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    }
  })

  return (
    <div className="fixed w-full h-screen bg-[rgba(0,0,0,.8)] flex items-center justify-center z-40">
      <div className="bg-primary w-[28rem] flex flex-col gap-3 items-center relative rounded z-50">
        <div className="p-4 flex flex-col gap-3 items-center relative">
          <CloseButton setState={setCreatingServer} cn="absolute top-4 right-4"/>
          <h2 className="font-bold text-accent text-2xl">Customize Your Server</h2>
          <p className="text-accentDark text-sm text-center px-4">Give your new server a personality with a name and an icon. You can always change it later.</p>

          <UploadImage htmlFor="nothing-FIX-LATER"/>

          <section className="flex flex-col gap-1 w-full">
            <label htmlFor="serverName" className="input-label">SERVER NAME</label>
            <input type="text" id="serverName" className="input-bar" value={serverName} onChange={(e) => setServerName(e.target.value)} />
          </section>
          <p className="text-accentDark text-xs w-full text-start">By creating a server, you agree to Discord's <span className="blue-link">Community Guidelines</span>.</p>
        </div>

        <div className="w-full h-16 flex items-center justify-center bg-secondary rounded-b">
          {!isLoadingCreateServer && 
            <button 
              onClick={() => createServer()}
              className="submit-btn !px-8 text-sm"
            >
              Create
            </button>
          }
          {isLoadingCreateServer && <LoadingSpinnerMD />}
        </div>
      </div>
    </div>
  )
}