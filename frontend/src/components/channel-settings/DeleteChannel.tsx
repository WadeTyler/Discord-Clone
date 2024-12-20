import React from 'react'
import { Channel, Server } from '../../types/types'
import { IconHash, IconVolume } from '@tabler/icons-react';
import { LoadingSpinnerLG } from '../lib/util/LoadingSpinner';
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const DeleteChannel = ({channel, server, handleCancel, isDeletingChannel, setShowChannelSettings}: {
  channel: Channel | null;
  server: Server | null;
  handleCancel: () => void;
  isDeletingChannel: boolean;
  setShowChannelSettings: React.Dispatch<React.SetStateAction<boolean>>;
}) => {


  // API URL
  const API_URL = import.meta.env.VITE_API_URL;

  // QueryClient
  const queryClient = useQueryClient();

  // Mutation to delete channel
  const { mutate:deleteChannel, isPending:isLoadingDeletingChannel } = useMutation({
    mutationFn: async () => {
      try {
        
        const response = await fetch(`${API_URL}/servers/${server?.serverID}/channels/${channel?.channelID}/delete`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        return data;

      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
    onSuccess: () => {
      toast.success("Channel deleted successfully!");

      // Refresh channels
      queryClient.invalidateQueries({ queryKey: ['channels']});

      // Close channel settings
      setShowChannelSettings(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    }
  }) 

  const handleDeleteChannel = () => {
    deleteChannel();
  }

  if (channel) return (
      <div className='fixed w-full h-screen bg-[rgba(0,0,0,.8)] flex items-center justify-center top-0 left-0 text-sm'>
        <div className="w-[27rem] flex flex-col bg-primary rounded">
          <div className="p-4 flex flex-col gap-4">
            <h2 className="text-xl font-bold">Delete '{channel?.channelName ?? ''}'</h2>
            <p className=''>Are you sure you want to delete <strong className='inline-flex text-white'>{(channel?.type === 'text' && <IconHash className='w-4 h-4' />) || (channel?.type === 'voice' && <IconVolume className="w-4 h-4" />)}{channel.channelName}</strong>? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end items-center bg-secondary p-4 gap-4">
            {!isLoadingDeletingChannel && <p className='hover:underline cursor-pointer' onClick={() => handleCancel()}>Cancel</p>}
            {!isLoadingDeletingChannel 
            ? 
            <button 
              onClick={() => handleDeleteChannel()}
              className="bg-red-500 text-white hover:bg-red-600 duration-300 px-4 py-2 rounded"
            >
              Delete Channel
            </button>
            :
            <LoadingSpinnerLG />  
            }
          </div>
        </div>
  
  
      </div>
    )
}

export default DeleteChannel