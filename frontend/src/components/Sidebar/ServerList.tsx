
import { IconBrandDiscordFilled } from '@tabler/icons-react';
import { servers } from '../../constants/testData';
import ServerButton from './ServerButton';

const ServerList = () => {
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
      </div>

    </div>
  )
}

export default ServerList