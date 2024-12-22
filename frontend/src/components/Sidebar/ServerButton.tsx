import { useState } from "react"
import { Server } from "../../types/types"
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

const ServerButton = ({server}: {server: Server}) => {

  const [hovering, setHovering] = useState<boolean>(false);

  const queryClient = useQueryClient();

  return (
    <div className="relative px-4  flex items-center justify-center">
      <div 
      onClick={() => {
        queryClient.setQueryData<Server>(['currentServer'], server);
        console.log("ServerButton: Setting current server to: ", server);
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="w-12 h-12 flex items-center justify-center relative cursor-pointer rounded-[50%] hover:rounded-[30%] duration-300 bg-primary p-2">
        <img style={{content: `url("${server.serverIcon || "https://cdn.iconscout.com/icon/free/png-256/discord-3-569463.png"}")`}} alt="Server Icon" className='group-hover:rounded-md rounded-full w-full h-full duration-300'/>
      </div>

      {hovering && <ServerLabel server={server} />}

    </div>
  )
}

export default ServerButton

const ServerLabel = ({server}: {server: Server}) => {

  return (
    <motion.div 
    initial={{ scale: 0.9, translateX: "100%"  }}
    whileInView={{ scale: 1 }}
    transition={{ duration: .2 }}
    className="bg-tertiary absolute z-40 px-2 py-1 rounded">
      <p className="text-sm w-full whitespace-nowrap">{server.serverName}</p>
    </motion.div>
  )

}