import { useState } from "react";
import ServerList from "./ServerList"
import { Channel, Server } from "../../types/types";
import { authUser, server1Channels, servers } from "../../constants/testData";
import { IconChevronDown, IconCompassFilled, IconHeadphonesFilled, IconMicrophoneFilled, IconSettingsFilled } from "@tabler/icons-react";
import ChannelButton from "./ChannelButton";
import { useAppContext } from "../../context/AppContext";

const Sidebar = () => {

  const { currentServer, setCurrentServer } = useAppContext();

  // Hover states
  const [hoveringUserInfo, setHoveringUserInfo] = useState(false);

  return (
    <div className="min-w-72 w-72 h-screen bg-secondary flex relative">
      <ServerList />

      {/* Show the ServerBar for the selected server */}
      {currentServer && <ServerBar server={currentServer} /> }

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
            <div className={`bg-[url("./default-avatar.png")] bg-center bg-cover w-8 h-8 rounded-full`}></div>

            {/* Name */}
            <section className="flex flex-col text-sm justify-center">
              <p>{authUser.username}</p>
              {!hoveringUserInfo && <p className="text-xs text-gray-400">{authUser.status}</p>}
              {hoveringUserInfo && <p className="text-xs text-gray-400">{authUser.tag}</p>}
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

const ServerBar = ({server}: {
  server: Server;
}) => {

  const [channels, setChannels] = useState<Channel[]>(server1Channels);

  return (

    <div className="h-full w-full bg-secondary flex flex-col gap-4">
      {/* Server Info */}
      <div className="h-12 w-full flex py-2 px-4 shadow-md border-b-tertiary border-b items-center justify-between">
        <p>{server.serverName}</p>
        <IconChevronDown />
      </div>

      {/* Text Channels */}
      <div className="flex flex-col gap-1 p-2">
        {channels.map((channel) => (
          <ChannelButton key={channel.channelID} channel={channel} />
        ))}
      </div>



    </div>
  )

}