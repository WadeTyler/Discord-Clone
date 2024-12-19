import { useEffect, useState } from "react";
import ServerList from "./ServerList"
import { Channel, Server, User } from "../../types/types";
import { authUser } from "../../constants/testData";
import { IconChevronDown, IconCompassFilled, IconHeadphonesFilled, IconMicrophoneFilled, IconSettingsFilled } from "@tabler/icons-react";
import ChannelButton from "./ChannelButton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {

  // Query Data
  const {data:authUser} = useQuery<User | null>({ queryKey: ['authUser'] });
  const {data:currentServer } = useQuery<Server | null>({ queryKey: ['currentServer'] });

  // Hover states
  const [hoveringUserInfo, setHoveringUserInfo] = useState(false);

  return (
    <div className="min-w-72 w-72 h-screen bg-secondary flex relative">
      <ServerList />

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
  const { data: channels } = useQuery<Channel[]>({
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
        {channels?.map((channel) => (
          <ChannelButton key={channel.channelID} channel={channel} />
        ))}
      </div>



    </div>
  )

}