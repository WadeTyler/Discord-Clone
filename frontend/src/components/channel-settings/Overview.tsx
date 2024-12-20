import React, { useState } from 'react'
import { Channel } from '../../types/types'
import SaveChangesBar from '../lib/SaveChangesBar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const Overview = ({channel}: {
  channel: Channel | null;
}) => {

  const API_URL = import.meta.env.VITE_API_URL;

  // QueryClient
  const queryClient = useQueryClient();
  const { data: currentTextChannel } = useQuery<Channel | null>({ queryKey: ['currentTextChannel'] });
  const { data: currentVoiceChannel } = useQuery<Channel | null>({ queryKey: ['currentVoiceChannel'] });

  // States
  const [newChannelName, setNewChannelName] = useState<string>(channel?.channelName || '');
  const [newChannelDescription, setNewChannelDescription] = useState<string>(channel?.channelDescription || '');
  const [changesMade, setChangesMade] = useState<boolean>(false);


  // Update channel mutation
  const { mutate:updateChannel, isPending:isLoadingUpdateChannel } = useMutation({
    mutationFn: async () => {
      try {

        if (!newChannelName) throw new Error("Channel name is required."); 

        if (newChannelName.charAt(0) === '-' || newChannelName.charAt(newChannelName.length-1) === '-') {
          throw new Error("Channel name cannot start or end with a hyphen");
        }

        const updateRequest = {
          channelName: newChannelName,
          channelDescription: newChannelDescription
        }

        const response = await fetch(`${API_URL}/servers/${channel?.serverID}/channels/${channel?.channelID}/update`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateRequest),
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        return data;
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
    onSuccess: (data) => {
      toast.success("Channel updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['channels']});

      // If it is the current channel update it
      if (data?.channelID === currentTextChannel?.channelID) {
        queryClient.setQueryData<Channel | null>(['currentTextChannel'], data);
      }

      else if (data?.channelID === currentVoiceChannel?.channelID) {
        queryClient.setQueryData<Channel | null>(['currentVoiceChannel'], data);
      }

      setChangesMade(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred while saving changes.");
    }
  })

  // Save Changes
  const saveChanges = () => {
    updateChannel();
  }

  // Reset Changes
  const resetChanges = () => {
    setNewChannelName(channel?.channelName || '');
    setNewChannelDescription(channel?.channelDescription || '');
    setChangesMade(false);
  }

  return (
    <div className='w-full flex flex-col gap-4 relative'>
      <div className="max-w-[50rem] flex flex-col gap-6">
        <h2 className='font-bold text-white text-xl'>Overview</h2>

        {/* Channel Name */}
        <div className="flex flex-col gap-1">
          <p className="input-label">CHANNEL NAME</p>
          <input type="text" maxLength={50} className="input-bar" value={newChannelName} onChange={(e) => {
            const value = e.target.value.toLocaleLowerCase().replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, "");
            setNewChannelName(value);
            setChangesMade(true);
          }}/>
        </div>

        <hr  className='w-full border-primaryLight'/>

        <div className="flex flex-col gap-1">
          <p className="input-label">CHANNEL TOPIC</p>
          <div className="relative h-24 text-sm flex">
            <textarea className="resize-none w-full h-full bg-transparent input-bar" maxLength={1024} value={newChannelDescription} placeholder='Let everyone know how to use this channel!' onChange={(e) => {
              setNewChannelDescription(e.target.value);
              setChangesMade(true);  
            }} />
            <p className="absolute bottom-2 right-2 text-accentDark text-xs">{1024 - newChannelDescription.length}</p>
          </div>
        </div>

      </div>

      {changesMade && 
        <SaveChangesBar resetChanges={resetChanges} saveChanges={saveChanges} isPending={isLoadingUpdateChannel} />
      }

    </div>
  )
}

export default Overview