import { useState } from "react"
import { Server } from "../../types/types"

const ServerButton = ({server}: {server: Server}) => {

  const [hovering, setHovering] = useState<boolean>(false);

  return (
    <div className="relative">
      <div 
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="w-12 h-12 flex items-center justify-center relative cursor-pointer rounded-[50%] hover:rounded-[30%] duration-300 bg-primary p-2">
        <img src={server.serverIcon} alt="Server Icon" className='group-hover:rounded-md rounded-full w-full h-full duration-300'/>
      </div>

      {hovering && <ServerLabel server={server} />}

    </div>
  )
}

export default ServerButton

const ServerLabel = ({server}: {server: Server}) => {


  return (
    <div className="bg-tertiary absolute top-1/2 -translate-y-1/2 left-[150%] z-50 max-w-24 px-2 py-1 rounded">
      <p className="text-sm w-full whitespace-nowrap">{server.serverName}</p>
    </div>
  )

}