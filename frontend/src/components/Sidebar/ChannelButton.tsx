import { IconHash, IconVolume } from "@tabler/icons-react"
import { Channel } from "../../types/types"
import { useQuery, useQueryClient } from "@tanstack/react-query";


const ChannelButton = ({channel}: {
  channel: Channel,
}) => {

  // QueryClient
  const queryClient = useQueryClient();

  const {data: currentTextChannel} = useQuery({ queryKey: ['currentTextChannel'] });
  const {data: currentVoiceChannel} = useQuery({ queryKey: ['currentVoiceChannel'] });
 
  return (
    <div 
    onClick={() => channel.type === 'text' ? queryClient.setQueryData<Channel>(['currentTextChannel'], channel) : queryClient.setQueryData<Channel>(['currentVoiceChannel'], channel)}
    className={`flex items-center gap-1 px-2 py-1 rounded text-sm cursor-pointer duration-300 
    ${currentTextChannel === channel && channel.type === 'text' ? 'bg-zinc-600 text-accent shadow-lg' : 'text-gray-400 hover:bg-zinc-700 hover:text-accent'}
    ${currentVoiceChannel === channel && channel.type === 'voice' ? 'text-accent' : 'text-gray-400 hover:bg-zinc-700 hover:text-accent'}
    `} >
      {channel.type === 'voice' && <IconVolume />}
      {channel.type === 'text' && <IconHash />}
      <p>{channel.channelName}</p>
    </div>
  )
}

export default ChannelButton