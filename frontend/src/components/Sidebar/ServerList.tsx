
import { IconBrandDiscordFilled, IconPlus } from '@tabler/icons-react';
import ServerButton from './ServerButton';
import { SetStateAction, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Channel, Friend, Server } from '../../types/types';
import { ServerIconSkeleton } from '../skeletons/Skeletons';

const ServerList = ({setCreatingServer}: {setCreatingServer: React.Dispatch<SetStateAction<boolean>>;}) => {

  // Query Data
  const queryClient = useQueryClient();
  const {data:servers, isPending:isLoadingServers} = useQuery<Server[] | null>({ queryKey: ['joinedServers'] });
  const {data:currentServer} = useQuery<Server | null>({ queryKey: ['currentServer'] });
  const { data:friendRequests } = useQuery<Friend[]>({ queryKey: ['friendRequests'] });

  // States
  const [hoveringNewServer, setNewServerHover] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<number>(0);

  useEffect(() => {
    // Update Notification count everytime friendRequests changes, TODO: add direct messages later
    if (friendRequests) {
      setNotifications(friendRequests.length);
    }
  }, [friendRequests]);

  // Handle Go Home
  const handleGoHome = () => {
    queryClient.setQueryData<Server | null>(['currentServer'], null);
    queryClient.setQueryData<Channel | null>(['currentTextChannel'], null);
  }

  return (
    <div className="flex flex-col gap-2 items-center h-screen py-2 bg-tertiary relative w-16">

      {/* Home */}
      <div 
      onClick={handleGoHome}
      className=" w-12 h-12 flex items-center justify-center bg-primary cursor-pointer rounded-[50%] hover:rounded-[30%] duration-300 p-2 relative">
        <IconBrandDiscordFilled className='text-4xl w-full h-full'/>
        {notifications > 0 && (
          <div className="w-4 h-4 flex items-center z-30 justify-center text-white bg-red-500 text-xs rounded-full absolute bottom-0 right-0">
            {notifications}
          </div>
        )}
      </div>

      <hr className="w-full my-2 border-primary"/>

      {/* Server List */}
      <div className="flex flex-col gap-2 items-center h-fit w-full relative">
        {!isLoadingServers && servers?.map(server => (
          <div className="relative">
            <ServerButton key={server.serverID} server={server} />
            {currentServer?.serverID === server.serverID && (
              <div className="bg-accent h-full absolute -left-1 top-0 w-4 rounded-full"></div>
            )}
          </div>
        ))}
        {isLoadingServers && (
          Array.from({ length: 5 }, () => (
            <ServerIconSkeleton />
          ) )
        )}

        {/* Create Sever Button */}
        <div 
        onMouseEnter={() => setNewServerHover(true)}
        onMouseLeave={() => setNewServerHover(false)}
        onClick={() => setCreatingServer(true)}
        className="w-12 h-12 flex items-center justify-center relative cursor-pointer rounded-[50%] hover:rounded-[30%] duration-300 hover:bg-green-500 hover:text-white bg-primary p-2 text-green-500">
          <IconPlus/>
          {hoveringNewServer && <NewServerLabel />}

        </div>
      </div>

    </div>
  )
}

export default ServerList

const NewServerLabel = () => {
  return (
    <motion.div 
    initial={{ scale: 0.9 }}
    whileInView={{ scale: 1 }}
    transition={{ duration: .1 }}
    className="bg-tertiary absolute top-1/2 -translate-y-1/2 left-[150%] z-50 max-w-24 px-2 py-1 rounded">
      <p className="text-sm w-full whitespace-nowrap text-accent">Add a Server</p>
    </motion.div>
  )

}