import { IconHash, IconVolume } from "@tabler/icons-react"
import { Channel } from "../../types/types"
import { SetStateAction } from "react";


const ChannelButton = ({channel, selectedTextChannel, setSelectedTextChannel, selectedVoiceChannel, setSelectedVoiceChannel}: {
  channel: Channel;
  selectedTextChannel: Channel | null;
  setSelectedTextChannel: React.Dispatch<SetStateAction<Channel | null>>;
  selectedVoiceChannel: Channel | null;
  setSelectedVoiceChannel: React.Dispatch<SetStateAction<Channel | null>>;
}) => {
  return (
    <div 
    onClick={() => channel.type === 'text' ? setSelectedTextChannel(channel) : setSelectedVoiceChannel(channel)}
    className={`flex items-center gap-1 px-2 py-1 rounded text-sm cursor-pointer duration-300 
    ${selectedTextChannel === channel && channel.type === 'text' ? 'bg-zinc-600 text-accent shadow-lg' : 'text-gray-400 hover:bg-zinc-700 hover:text-accent'}
    ${selectedVoiceChannel === channel && channel.type === 'voice' ? 'text-accent' : 'text-gray-400 hover:bg-zinc-700 hover:text-accent'}
    `} >
      {channel.type === 'voice' && <IconVolume />}
      {channel.type === 'text' && <IconHash />}
      <p>{channel.channelName}</p>
    </div>
  )
}

export default ChannelButton