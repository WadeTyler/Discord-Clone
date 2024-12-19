
import React, { SetStateAction } from 'react';
import { Server } from '../../types/types'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinnerLG } from '../lib/util/LoadingSpinner';

const DeleteServer = ({currentServer, setCurrentTab, setShowServerSettings }: {currentServer: Server; setCurrentTab: React.Dispatch<SetStateAction<string>>; setShowServerSettings: React.Dispatch<SetStateAction<boolean>>;}) => {

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleCancel = () => {
    setCurrentTab('overview');
  }


  const { mutate:deleteServer, isPending:isDeletingServer } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`${API_URL}/servers/${currentServer.serverID}/delete`, {
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
      toast.success("Server deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['joinedServers']});
      queryClient.setQueryData<null>(['currentServer'], null);
      setShowServerSettings(false);
      // Redirect to dms
      navigate('/dm');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    }
  })

  const handleDeleteServer = () => {
    deleteServer();
  }

  return (
    <div className='fixed w-full h-screen bg-[rgba(0,0,0,.8)] flex items-center justify-center top-0 left-0 text-sm'>
      <div className="w-[27rem] flex flex-col bg-primary rounded">
        <div className="p-4 flex flex-col gap-4">
          <h2 className="text-xl font-bold">Delete '{currentServer.serverName}'</h2>
          <p>Are you sure you want to delete <strong>{currentServer.serverName}</strong>? This action cannot be undone.</p>
        </div>
        <div className="flex justify-end items-center bg-secondary p-4 gap-4">
          {!isDeletingServer && <p className='hover:underline cursor-pointer' onClick={() => handleCancel()}>Cancel</p>}
          {!isDeletingServer 
          ? 
          <button 
            onClick={() => handleDeleteServer()}
            className="bg-red-500 text-white hover:bg-red-600 duration-300 px-4 py-2 rounded"
          >
            Delete Server
          </button>
          :
          <LoadingSpinnerLG />  
          }
        </div>
      </div>


    </div>
  )
}

export default DeleteServer