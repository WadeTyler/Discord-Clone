import { IconHash, IconVolume } from "@tabler/icons-react"
import { Channel } from "../../types/types"
import { useQuery, useQueryClient } from "@tanstack/react-query";


const ChannelButton = ({channel}: {
  channel: Channel,
}) => {

  // QueryClient
  const queryClient = useQueryClient();

  const {data: currentTextChannel} = useQuery<Channel | null>({ queryKey: ['currentTextChannel'] });
  const { data:currentVoiceChannel } = useQuery<Channel | null>({ queryKey: ['currentVoiceChannel'] });

  // Text Channels
  if (channel.type === 'text') return (
    <div 
    onClick={() => queryClient.setQueryData<Channel>(['currentTextChannel'], channel)}
    className={`flex items-center gap-1 px-2 py-1 rounded text-sm cursor-pointer duration-300 
    ${currentTextChannel?.channelID === channel.channelID ? 'bg-zinc-600 text-accent shadow-lg' : 'text-gray-400 hover:bg-zinc-700 hover:text-accent'}`} >
      <IconHash />
      <p>{channel.channelName}</p>
    </div>
  )
 
  // Voice Channels
  if (channel.type === 'voice') return (
    <div 
    onClick={() => queryClient.setQueryData<Channel>(['currentVoiceChannel'], channel)}
    className={`flex items-center gap-1 px-2 py-1 rounded text-sm cursor-pointer duration-300
      ${currentVoiceChannel?.channelID === channel.channelID ? 'text-white' : 'text-gray-400 hover:bg-zinc-700 hover:text-accent'}`}>
        <IconVolume />
        <p>{channel.channelName}</p>
    </div>
  )

}

export default ChannelButton