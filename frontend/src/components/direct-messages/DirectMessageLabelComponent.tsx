

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {DMChannel, User} from '../../types/types';
import {IconX} from "@tabler/icons-react";
import {useWebSocket} from "../../context/WebSocketContext.tsx";


const DirectMessageLabelComponent = ({dmChannel}: {
  dmChannel: DMChannel;
}) => {


  // Query Data
  const queryClient = useQueryClient();
  const { data:currentDmChannel } = useQuery<DMChannel | null>({ queryKey: ['currentDmChannel'] });
  const { data:authuser } = useQuery<User | null>({ queryKey: ['authUser'] });

  const setCurrentDMChannel = () => {
    queryClient.setQueryData<DMChannel>(['currentDmChannel'], dmChannel);
  }

  // Websocket
  const client = useWebSocket();

  const hideDMChannel = () => {
    client.publish({
      destination: "/app/dm/channels/hide",
      body: JSON.stringify({
        dmChannelID: dmChannel?.dmChannelID,
        userID: authuser?.userID
      })
    })
  }


  if (dmChannel.show) return (
    <div
      onClick={setCurrentDMChannel} 
      className={`w-full h-10 flex gap-2 items-center hover:bg-primary cursor-pointer rounded group
        ${currentDmChannel?.dmChannelID === dmChannel.dmChannelID ? 'bg-primaryLight' : ''}
      `}
    >
      
      <div className="w-8 h-8 min-w-8 min-h-8 rounded-full bg-center bg-cover"
        style={{ backgroundImage: dmChannel.avatar ? `url(${dmChannel.avatar})` : `url('./default-avatar.png')` }}
      >
        
      </div>

      <p className="text-accentDark w-full text-sm">{dmChannel.channelName}</p>


      <div
        onClick={() => hideDMChannel()}
        className="group-hover:flex hidden"
      >
        <IconX />
      </div>
    </div>
  )
}

export default DirectMessageLabelComponent