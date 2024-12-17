
import { IconBrandDiscordFilled, IconPlus } from '@tabler/icons-react';
import { servers } from '../../constants/testData';
import ServerButton from './ServerButton';
import { useState } from 'react';
import { motion } from 'framer-motion';

const ServerList = () => {

  const [hoveringNewServer, setNewServerHover] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-2 items-center h-screen px-4 py-2 bg-tertiary relative w-16">

      {/* Direct Messages */}
      <div className=" w-12 h-12 flex items-center justify-center bg-primary cursor-pointer rounded-[50%] hover:rounded-[30%] duration-300 p-2">
        <IconBrandDiscordFilled className='text-4xl w-full h-full'/>
      </div>

      <hr className="w-full my-2 border-primary"/>

      {/* Server List */}
      <div className="flex flex-col gap-2 items-center h-fit w-full relative">
        {servers.map(server => (
          <ServerButton key={server.serverID} server={server} />
        ))}

        <div 
        onMouseEnter={() => setNewServerHover(true)}
        onMouseLeave={() => setNewServerHover(false)}
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