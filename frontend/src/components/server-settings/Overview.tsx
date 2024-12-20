import { useState } from 'react';
import { Server } from '../../types/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import SaveChangesBar from '../lib/SaveChangesBar';
import toast from 'react-hot-toast';

const Overview = () => {

  const API_URL = import.meta.env.VITE_API_URL;

  // Query Data
  const queryClient = useQueryClient();
  const {data:currentServer} = useQuery<Server | null>({ queryKey: ['currentServer'] });

  // States
  const [serverName, setServerName] = useState<string>(currentServer?.serverName || '');
  const [changesMade, setChangesMade] = useState<boolean>(false);

  // ServerName Split
  const splitServerName = currentServer?.serverName.split(" ");

  // Save Changes Mutation
  const { mutate:saveChanges, isPending:isSavingChanges } = useMutation({
    mutationFn: async () => {
      try {

        const serverRequest = {
          serverName: serverName,
          serverIcon: currentServer?.serverIcon
        }

        const response = await fetch(`${API_URL}/servers/${currentServer?.serverID}/update`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serverRequest),
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        // Update current server
        queryClient.setQueryData<Server | null>(['currentServer'], data);

        return data;
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
    onSuccess: () => {
      toast.success("Changes saved successfully!");
      queryClient.invalidateQueries({ queryKey: ['joinedServers']});
      setChangesMade(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred while saving changes."); 
    }

  })

  // Functions
  const handleSaveChanges = () => {
    console.log("Saving changes...");
    saveChanges();
  }

  const resetChanges = () => {
    console.log("Resetting changes...");
    setServerName(currentServer?.serverName || '');
    setChangesMade(false);
  }

  

  return (
    <div className='w-full flex flex-col items-center gap-4'>

      <header className='flex flex-col gap-4 w-full justify-center items-center'>
        
        <div className="flex flex-col max-w-[50rem] w-full justify-center gap-4">
          <h1 className='font-semibold text-white text-xl'>Server Overview</h1>
          <div className="flex gap-8 w-full">
            

            {/* Image */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-24 h-24 flex items-center justify-center bg-accentBlue rounded-full bg-center bg-cover shadow-lg shadow-tertiary"
                style={{ backgroundImage: currentServer?.serverIcon ? `url("${currentServer.serverIcon}")` : '' }}
              >
                {!currentServer?.serverIcon && 
                  <p className='text-white text-2xl'>
                    {splitServerName?.length === 1 ? splitServerName[0].charAt(0) : splitServerName?.map(name => name.charAt(0)).join("")}
                  </p>
                }
              </div>
              <p className="text-[.55rem] text-accentDark">Minimum Size: <strong>128x128</strong></p>
            </div>
            
            {/* Upload Image details */}
            <div className="flex flex-col w-36 gap-4">
              <p className='text-xs'>We recommend an image of at least 512x512 for the server.</p>
              <button className="w-fit border-zinc-600 border rounded text-xs px-4 py-2 hover:bg-zinc-600 text-white">Upload Image</button>
            </div>

            {/* Server Name */}
            <div className="flex flex-col gap-2 w-full max-w-64">
              <p className="input-label">SERVER NAME</p>
              <input type="text" className='input-bar' value={serverName} onChange={(e) => {
                setServerName(e.target.value);
                setChangesMade(true);
              } } />
            </div>

          </div>
        </div>

      </header>

      {changesMade && 
        <SaveChangesBar resetChanges={resetChanges} saveChanges={handleSaveChanges} />
      }


    </div>
  )
}

export default Overview
