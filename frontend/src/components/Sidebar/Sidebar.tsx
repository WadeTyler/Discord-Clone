import React, {SetStateAction, useEffect, useState} from "react";
import ServerList from "./ServerList"
import {Channel, Server, User} from "../../types/types";
import {
  IconChevronDown,
  IconCompassFilled,
  IconDoorExit,
  IconHash,
  IconHeadphonesFilled,
  IconMicrophoneFilled,
  IconPlus,
  IconSettingsFilled,
  IconUsers,
  IconVolume,
  IconX
} from "@tabler/icons-react";
import ChannelButton from "./ChannelButton";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {UserSkeleton} from "../skeletons/Skeletons";
import {ChannelSkeleton} from "../skeletons/Skeletons";
import CloseButton from "../lib/CloseButton";
import UploadImage from "../lib/UploadImage";
import {LoadingSpinnerMD} from "../lib/util/LoadingSpinner";
import {motion} from "framer-motion";
import ServerSettings from "../server-settings/ServerSettings";
import ChannelSettings from "../channel-settings/ChannelSettings";
import UserAvatar from "../users/UserAvatar";
import HomeSidebar from "./HomeSidebar";
import CreatingInvite from "../server-settings/CreatingInvite.tsx";
// import { filter } from "framer-motion/client";

const Sidebar = () => {

  // Query Data
  const {data: authUser, isPending: isLoadingAuthUser} = useQuery<User | null>({queryKey: ['authUser']});
  const {data: currentServer} = useQuery<Server | null>({queryKey: ['currentServer']});

  // States
  const [hoveringUserInfo, setHoveringUserInfo] = useState(false);
  const [creatingServer, setCreatingServer] = useState<boolean>(false);
  const [creatingChannel, setCreatingChannel] = useState<boolean>(false);
  const [creatingInvite, setCreatingInvite] = useState<boolean>(false);
  const [newChannelType, setNewChannelType] = useState<string>('text');
  const [showServerSettings, setShowServerSettings] = useState<boolean>(false);
  const [showChannelSettings, setShowChannelSettings] = useState<boolean>(false);
  const [channelToEdit, setChannelToEdit] = useState<Channel | null>(null);

  // Functions
  const editChannel = (channel: Channel) => {
    setChannelToEdit(channel);
    setShowChannelSettings(true);
  }

  return (
    <div className="min-w-72 w-72 h-screen bg-secondary flex relative">


      {/* Creating Server */}
      {creatingServer && <CreatingServer setCreatingServer={setCreatingServer}/>}

      {/* Creating Channel */}
      {creatingChannel && <CreatingChannel setCreatingChannel={setCreatingChannel} newChannelType={newChannelType}
                                           setNewChannelType={setNewChannelType}/>}

      {/* Creating Invite */}
      {creatingInvite && <CreatingInvite setCreatingInvite={setCreatingInvite}/>}

      {/* Server List */}
      <ServerList setCreatingServer={setCreatingServer}/>

      {/* Show the ServerBar for the selected server */}
      {currentServer &&
          <ServerBar setShowServerSettings={setShowServerSettings} setCreatingChannel={setCreatingChannel}
                     setNewChannelType={setNewChannelType} editChannel={editChannel}
                     setCreatingInvite={setCreatingInvite}/>}

      {/* Home Mode */}
      {!currentServer && (
        <HomeSidebar/>
      )}

      {/* Show server settings */}
      {showServerSettings && <ServerSettings setShowServerSettings={setShowServerSettings}/>}

      {/* Show Channel settings */}
      {showChannelSettings && currentServer && channelToEdit &&
          <ChannelSettings channel={channelToEdit} server={currentServer}
                           setShowChannelSettings={setShowChannelSettings}/>}

      {/* Bottom Bar */}
      <div className="absolute bottom-0 w-full h-16 flex items-center bg-tertiary">

        {/* Nav Button */}
        <div className="w-16 px-4 h-full bg-tertiary flex items-center justify-center">
          <div
            className="min-w-12 w-12 p-2 flex items-center justify-center bg-primary hover:bg-green-500 hover:text-white cursor-pointer rounded-[50%] hover:rounded-[30%] duration-300">
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
              <UserAvatar avatar={authUser?.avatar} status={authUser?.status} backgroundColor="tertiary"/>

              {/* Name */}
              <section className="flex flex-col text-sm justify-cente overflow-hidden">
                <p>{authUser?.username}</p>
                {!hoveringUserInfo && <p className="text-xs text-gray-400">{authUser?.status}</p>}
                {hoveringUserInfo &&
                    <motion.p initial={{y: 100}} animate={{y: 0}} transition={{duration: .2}}
                              className="text-xs text-gray-400">#{authUser?.tag}</motion.p>}
              </section>
            </div>

            <div className="flex items-center text-xs">
              <button className="hover:bg-primary p-1 rounded cursor-pointer">
                <IconMicrophoneFilled/>
              </button>
              <button className="hover:bg-primary p-1 rounded cursor-pointer">
                <IconHeadphonesFilled/>
              </button>
              <button className="hover:bg-primary p-1 rounded cursor-pointer">
                <IconSettingsFilled/>
              </button>
            </div>


          </div>
        )}
        {isLoadingAuthUser && (
          <UserSkeleton/>
        )}

      </div>

    </div>
  )
}

export default Sidebar

const ServerBar = ({
                     setShowServerSettings,
                     setNewChannelType,
                     setCreatingChannel,
                     editChannel,
                     setCreatingInvite,
                   }: {
  setShowServerSettings: React.Dispatch<SetStateAction<boolean>>;
  setNewChannelType: React.Dispatch<SetStateAction<string>>;
  setCreatingChannel: React.Dispatch<SetStateAction<boolean>>;
  editChannel: (channel: Channel) => void;
  setCreatingInvite: React.Dispatch<SetStateAction<boolean>>;
}) => {

  // QueryClient
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL;

  // Current Server
  const {data: currentServer} = useQuery<Server | null>({queryKey: ['currentServer']});
  const {data: authUser} = useQuery<User | null>({queryKey: ['authUser']});

  // Current Text Channel
  const {data: currentTextChannel} = useQuery<Channel | null>({queryKey: ['currentTextChannel']});

  useEffect(() => {
    console.log("Current Server: ", currentServer);
  }, [currentServer]);

  // Fetch channels
  const {data: channels, isPending: isLoadingChannels} = useQuery<Channel[]>({
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

  // States
  const [showServerOptionsDropdown, setShowServerOptionsDropdown] = useState<boolean>(false);

  // Close server options on server change
  useEffect(() => {
    setShowServerOptionsDropdown(false);
  }, [currentServer]);


  useEffect(() => {
    // On server change, refresh channels
    if (currentServer) {
      queryClient.invalidateQueries({queryKey: ['channels']});
    }
  }, [currentServer]);


  useEffect(() => {
    // Set the first channel as the current channel
    if (channels && (!currentTextChannel || currentTextChannel.serverID !== channels[0].serverID)) {
      queryClient.setQueryData<Channel>(['currentTextChannel'], channels.filter(channel => channel.type === 'text')[0]);
    }

    // if channel is deleted, set the first channel as the current channel
    if (channels && currentTextChannel && !channels.find(channel => channel.channelID === currentTextChannel.channelID)) {
      queryClient.setQueryData<Channel>(['currentTextChannel'], channels.filter(channel => channel.type === 'text')[0]);
    }

  }, [currentServer, channels, currentTextChannel]);

  return (

    <div className="h-full w-full bg-secondary flex flex-col gap-4 relative">
      {/* Server Info */}
      <div
        onClick={() => setShowServerOptionsDropdown(!showServerOptionsDropdown)}
        className="h-12 w-full flex py-2 px-4 shadow-md border-b-tertiary border-b items-center justify-between hover:bg-primary cursor-pointer"
      >
        <p className="text-white font-semibold text-sm">{currentServer?.serverName}</p>
        {showServerOptionsDropdown && <IconX className="text-xs"/>}
        {!showServerOptionsDropdown && <IconChevronDown className="text-xs"/>}
      </div>

      {/* Server Options */}
      {showServerOptionsDropdown && <ServerOptionsDropdown setShowServerSettings={setShowServerSettings}
                                                           setShowServerOptionsDropdown={setShowServerOptionsDropdown}
                                                           setCreatingInvite={setCreatingInvite}/>}


      <div className="flex flex-col gap-2 p-2 overflow-x-hidden overflow-y-auto h-full pb-24">
        {/* Text Channels */}
        <section className="flex w-full justify-between items-center">
          <p className="text-accentDark text-xs font-semibold">TEXT CHANNELS</p>
          {authUser?.userID === currentServer?.serverOwner && (
            <IconPlus
              onClick={() => {
                setNewChannelType('text');
                setCreatingChannel(true);
              }}
              className="w-5 h-5 hover:text-white cursor-pointer"/>
          )}
        </section>
        {!isLoadingChannels && channels?.filter((channel: Channel) => channel.type === 'text').map((channel: Channel) => (
          <ChannelButton key={channel.channelID} channel={channel} editChannel={editChannel}/>
        ))}

        {/* Voice Channels */}
        <section className="flex w-full justify-between items-center">
          <p className="text-accentDark text-xs font-semibold">VOICE CHANNELS</p>
          {authUser?.userID === currentServer?.serverOwner && (
            <IconPlus
              onClick={() => {
                setNewChannelType('voice');
                setCreatingChannel(true);
              }}
              className="w-5 h-5 hover:text-white cursor-pointer"/>
          )}
        </section>
        {!isLoadingChannels && channels?.filter((channel: Channel) => channel.type === 'voice').map((channel: Channel) => (
          <ChannelButton key={channel.channelID} channel={channel} editChannel={editChannel}/>
        ))}

        {isLoadingChannels && (
          Array.from({length: 10}, (_, index) => (
            <ChannelSkeleton key={index}/>
          )))
        }
      </div>

    </div>
  )

}

// Server Options Dropdown
const ServerOptionsDropdown = ({setShowServerSettings, setShowServerOptionsDropdown, setCreatingInvite}: {
  setShowServerSettings: React.Dispatch<SetStateAction<boolean>>;
  setShowServerOptionsDropdown: React.Dispatch<SetStateAction<boolean>>;
  setCreatingInvite: React.Dispatch<SetStateAction<boolean>>;
}) => {

  const API_URL = import.meta.env.VITE_API_URL;

  // Query Data
  const queryClient = useQueryClient();
  const {data: authUser} = useQuery<User | null>({queryKey: ['authUser']});
  const {data: currentServer} = useQuery<Server | null>({queryKey: ['currentServer']});

  // States
  const [isOwner, setIsOwner] = useState<boolean>(authUser?.userID === currentServer?.serverOwner || false);

  // Leave server mutation.
  const {mutate: leaveServer, isPending: leavingServer} = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`${API_URL}/servers/${currentServer?.serverID}/leave`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        return data;

      } catch (e) {
        throw new Error((e as Error).message);
      }
    },
    onSuccess: () => {
      queryClient.setQueryData<Server | null>(['currentServer'], null);
      queryClient.setQueryData<Channel | null>(['currentTextChannel'], null);
      queryClient.invalidateQueries({queryKey: ['joinedServers']});
      toast.success("Server left successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    }

  })

  // Determine if user the owner of the server on server change or authUser change.
  useEffect(() => {
    setIsOwner(authUser?.userID === currentServer?.serverOwner || false);
  }, [authUser, currentServer]);

  return (
    <motion.div
      initial={{opacity: 0, y: -10, scale: 0.8, x: "-50%"}}
      animate={{opacity: 1, y: 0, scale: 1}}
      className="bg-tertiary p-2 flex flex-col items-center gap-1 absolute  top-[calc(3rem+1rem)] left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] rounded text-accentDark text-sm no-hightlight">

      {/* Invite people */}
      <section
        onClick={() => setCreatingInvite(true)}
        className="flex justify-between items-center w-full text-accentBlue hover:bg-accentBlueDark hover:text-white p-2 rounded cursor-pointer">
        Invite People
        <IconUsers/>
      </section>

      <hr className="w-full border-primary"/>

      {/* Owner Options */}
      {isOwner &&
          <section
              onClick={() => {
                setShowServerSettings(true);
                setShowServerOptionsDropdown(false);
              }}
              className="flex justify-between items-center w-full hover:bg-accentBlueDark hover:text-white p-2 rounded cursor-pointer">
              Server Settings
              <IconSettingsFilled/>
          </section>
      }

      <hr className="w-full border-primary"/>

      {/* Non Owner Options */}
      {!isOwner && !leavingServer &&
          <section
              onClick={() => leaveServer()}
              className="flex justify-between items-center w-full text-red-600 hover:bg-accentBlueDark hover:text-white p-2 rounded cursor-pointer"
          >
              Leave Server
              <IconDoorExit/>
          </section>
      }
      {leavingServer &&
          <LoadingSpinnerMD/>
      }
    </motion.div>
  )
}


// Panel for creating server
const CreatingServer = ({setCreatingServer}: {
  setCreatingServer: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  // AuthUser
  const {data: authUser} = useQuery<User | null>({queryKey: ['authUser']});

  // States
  const [serverName, setServerName] = useState<string>(`${authUser?.username}'s Server`);

  // QueryClient
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();


  // Mutation to handle creating the server
  const {mutate: createServer, isPending: isLoadingCreateServer} = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`${API_URL}/servers/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({serverName}),
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
      queryClient.invalidateQueries({queryKey: ['joinedServers']});
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
          <p className="text-accentDark text-sm text-center px-4">Give your new server a personality with a
            name and an icon. You can always change it later.</p>

          <UploadImage htmlFor="nothing-FIX-LATER"/>

          <section className="flex flex-col gap-1 w-full">
            <label htmlFor="serverName" className="input-label">SERVER NAME</label>
            <input type="text" id="serverName" className="input-bar" value={serverName}
                   onChange={(e) => setServerName(e.target.value)}/>
          </section>
          <p className="text-accentDark text-xs w-full text-start">By creating a server, you agree to
            Discord's <span className="blue-link">Community Guidelines</span>.</p>
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
          {isLoadingCreateServer && <LoadingSpinnerMD/>}
        </div>
      </div>
    </div>
  )
}

// Panel for creating channel
const CreatingChannel = ({setCreatingChannel, newChannelType, setNewChannelType}: {
  setCreatingChannel: React.Dispatch<SetStateAction<boolean>>;
  newChannelType: string;
  setNewChannelType: React.Dispatch<SetStateAction<string>>;
}) => {


  const API_URL = import.meta.env.VITE_API_URL;

  // Query Data
  const queryClient = useQueryClient();
  const {data: currentServer} = useQuery<Server | null>({queryKey: ['currentServer']});

  // States
  const [channelName, setChannelName] = useState<string>('');

  // Mutation to create channel
  const {mutate: createChannel, isPending: isLoadingCreateChannel} = useMutation({
    mutationFn: async () => {
      try {

        // Validate channel name
        if (!channelName) {
          throw new Error("Channel name cannot be empty");
        }

        if (channelName.charAt(0) === '-' || channelName.charAt(channelName.length - 1) === '-') {
          throw new Error("Channel name cannot start or end with a hyphen");
        }

        const channelRequest = {
          channelName: channelName,
          type: newChannelType,
        };

        const response = await fetch(`${API_URL}/servers/${currentServer?.serverID}/channels/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(channelRequest),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        return data;

      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
    onSuccess: (data: Channel) => {
      toast.success("Channel created successfully");
      queryClient.invalidateQueries({queryKey: ['channels']});

      // Set the newly created channel as the current channel
      if (data.type === 'text') {
        queryClient.setQueryData<Channel>(['currentTextChannel'], data);
      } else if (data.type === 'voice') {
        queryClient.setQueryData<Channel>(['currentVoiceChannel'], data);
      }

      setCreatingChannel(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    }
  })

  return (
    <div className="fixed bg-[rgba(0,0,0,.8)] w-full h-screen flex items-center justify-center z-40 top-0 left-0">

      <div className="bg-primary w-[28rem] flex flex-col z-50 relative rounded">

        <CloseButton setState={setCreatingChannel} cn="absolute top-4 right-4"/>

        <div className="p-4 flex flex-col gap-4 text-accentDark">
          <section className="flex flex-col">
            <h2 className="text-xl text-accent">Create Channel</h2>
            <p
              className="text-xs">in {newChannelType.charAt(0).toLocaleUpperCase() + newChannelType.substring(1)} Channels</p>
          </section>

          {/* Options */}
          <div className="flex flex-col gap-2">
            <p className="input-label">CHANNEL TYPE</p>

            {/* Text Channel Option */}
            <div
              onClick={() => setNewChannelType('text')}
              className={`w-full flex  justify-between gap-2 items-center p-2 rounded cursor-pointer ${newChannelType === 'text' ? 'bg-primaryLight' : 'bg-secondary'}`}>
              <IconHash/>
              <section className="flex flex-col gap-1">
                <p className={`${newChannelType === 'text' && 'text-white'}`}>Text</p>
                <p className="text-xs">Send messages, images, GIFs, emoji, opinions, and puns</p>
              </section>

              <div
                className="w-5 h-5 border-white border-2 rounded-full flex items-center justify-center">
                {newChannelType === 'text' && <div className="w-3 h-3 bg-white rounded-full"></div>}
              </div>
            </div>


            {/* Voice Channel Option */}
            <div
              onClick={() => setNewChannelType('voice')}
              className={`w-full flex  justify-between gap-2 items-center p-2 rounded cursor-pointer ${newChannelType === 'voice' ? 'bg-primaryLight' : 'bg-secondary'}`}>
              <IconVolume/>
              <section className="flex flex-col gap-1">
                <p className={`${newChannelType === 'voice' && 'text-white'}`}>Voice</p>
                <p className="text-xs">Hang out together with voice, video, and screen share</p>
              </section>

              <div
                className="w-5 h-5 border-white border-2 rounded-full flex items-center justify-center">
                {newChannelType === 'voice' && <div className="w-3 h-3 bg-white rounded-full"></div>}
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="flex flex-col gap-2">
            <p className="input-label">CHANNEL NAME</p>
            <div className="flex gap-1 input-bar items-center text-sm">
              {newChannelType === 'text' && <IconHash/>}
              {newChannelType === 'voice' && <IconVolume/>}
              <input type="text"
                     placeholder="new-channel"
                     maxLength={50}
                     value={channelName}
                     onChange={(e) => {
                       const value = e.target.value.toLocaleLowerCase().replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, "");
                       setChannelName(value);
                     }}
                     className="w-full h-full bg-transparent focus:outline-none text-accent"/>
            </div>
          </div>

        </div>

        <div className="bg-secondary flex items-center justify-end p-4 rounded-b gap-4">
          <p onClick={() => setCreatingChannel(false)}
             className="text-xs text-accentDark hover:underline cursor-pointer">Cancel</p>
          {!isLoadingCreateChannel &&
              <button onClick={() => createChannel()} className="submit-btn text-sm px-4 py-3">Create
                  Channel</button>}
          {isLoadingCreateChannel && <LoadingSpinnerMD/>}
        </div>

      </div>

    </div>
  )
}