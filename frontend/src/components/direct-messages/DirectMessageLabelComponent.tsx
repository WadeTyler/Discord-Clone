

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DMChannel } from '../../types/types';


const DirectMessageLabelComponent = ({dmChannel}: {
  dmChannel: DMChannel;
}) => {


  const queryClient = useQueryClient();
  const { data:currentDmChannel } = useQuery<DMChannel | null>({ queryKey: ['currentDmChannel'] });

  const setCurrentDMChannel = () => {
    queryClient.setQueryData<DMChannel>(['currentDmChannel'], dmChannel);
  }


  return (
    <div
      onClick={setCurrentDMChannel} 
      className={`w-full h-10 flex gap-2 items-center hover:bg-primary cursor-pointer rounded 
        ${currentDmChannel?.dmChannelID === dmChannel.dmChannelID ? 'bg-primaryLight' : ''}
      `}
    >
      
      <div className="w-8 h-8 min-w-8 min-h-8 rounded-full bg-center bg-cover"
        style={{ backgroundImage: dmChannel.avatar ? `url(${dmChannel.avatar})` : `url('./default-avatar.png')` }}
      >
        
      </div>

      <p className="text-accentDark w-full text-sm">{dmChannel.channelName}</p>

    </div>
  )
}

export default DirectMessageLabelComponent