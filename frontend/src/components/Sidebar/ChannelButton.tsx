import { IconHash, IconSettings, IconVolume } from "@tabler/icons-react"
import { Channel, Server, User } from "../../types/types"
import { useQuery, useQueryClient } from "@tanstack/react-query";


const ChannelButton = ({channel, editChannel}: {
  channel: Channel;
  editChannel: (channel: Channel) => void;
}) => {

  // QueryClient
  const queryClient = useQueryClient();

  const { data: currentServer } = useQuery<Server | null>({ queryKey: ['currentServer'] });
  const { data: currentTextChannel } = useQuery<Channel | null>({ queryKey: ['currentTextChannel'] });
  const { data: currentVoiceChannel } = useQuery<Channel | null>({ queryKey: ['currentVoiceChannel'] });
  const { data: authUser } = useQuery<User | null>({ queryKey: ['authUser'] });

  const channelName = channel.channelName.length > 15 ? channel.channelName.slice(0, 15) + '...' : channel.channelName;

  // Text Channels
  if (channel.type === 'text') return (
    <div 
    onClick={() => queryClient.setQueryData<Channel>(['currentTextChannel'], channel)}
    className={`flex items-center gap-1 px-2 py-1 rounded text-sm cursor-pointer duration-300 group
    ${currentTextChannel?.channelID === channel.channelID ? 'bg-zinc-600 text-accent shadow-lg' : 'text-gray-400 hover:bg-zinc-700 hover:text-accent'}`} >
      <IconHash />
      <p>{channelName}</p>

      {/* Settings Button */}
      {authUser?.userID === currentServer?.serverOwner && (
        <IconSettings onClick={(e) => {e.stopPropagation(); editChannel(channel);}} className="hidden group-hover:block w-4 h-4 ml-auto z-30 hover:text-white hover:scale-110 duration-300"/>
      )}
    </div>
  )
 
  // Voice Channels
  if (channel.type === 'voice') return (
    <div 
    onClick={() => queryClient.setQueryData<Channel>(['currentVoiceChannel'], channel)}
    className={`flex items-center gap-1 px-2 py-1 rounded text-sm cursor-pointer duration-300 group
      ${currentVoiceChannel?.channelID === channel.channelID ? 'text-white' : 'text-gray-400 hover:bg-zinc-700 hover:text-accent'}`}>
        <IconVolume />
        <p>{channelName}</p> 

        {/* Settings Button */}
        {authUser?.userID === currentServer?.serverOwner && (
          <IconSettings onClick={(e) => {e.stopPropagation(); editChannel(channel);}} className="hidden group-hover:block w-4 h-4 ml-auto z-30 hover:text-white hover:scale-110 duration-300"/>
        )}
    </div>
  )

}

export default ChannelButton