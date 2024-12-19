import { IconTrash, IconX } from "@tabler/icons-react";
import React, { SetStateAction, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query";
import { Server } from "../../types/types";
import Overview from "./Overview";
import DeleteServer from "./DeleteServer";


const ServerSettings = ({setShowServerSettings}: {setShowServerSettings: React.Dispatch<SetStateAction<boolean>>;}) => {

  // Query Data
  const {data:currentServer} = useQuery<Server | null>({ queryKey: ['currentServer'] });

  // States
  const [currentTab, setCurrentTab] = useState<string>('overview');

  return (
    <motion.div 
      initial={{opacity: 0, scale: 1.2}}
      animate={{opacity: 1, scale: 1}}
      transition={{ duration: 0.2 }}
      className="fixed w-full h-screen bg-primary z-40 flex items-center"
    >
      {/* Close Button */}
      <CloseServerSettingsButton setShowServerSettings={setShowServerSettings}/>
      {/* Sidebar */}
      <ServerSettingsSidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Body Container */}
      <div className="w-full h-full p-8 py-12 pr-16 relative">
        {currentTab === 'overview' && <Overview />}
        {currentTab === 'delete-server' && <DeleteServer currentServer={currentServer as Server} setCurrentTab={setCurrentTab} setShowServerSettings={setShowServerSettings} />}
      </div>
    </motion.div>
  )
}

export default ServerSettings

// Sidebar
const ServerSettingsSidebar = ({currentTab, setCurrentTab}: {
  currentTab: string;
  setCurrentTab: React.Dispatch<SetStateAction<string>>;
}) => {

  // Query Data
  const {data:currentServer} = useQuery<Server | null>({ queryKey: ['currentServer'] });

  return (
    <div className="w-64 min-h-screen max-h-screen overflow-y-auto bg-secondary px-4 py-12 flex flex-col gap-2 text-accentDark">

      {/* Server Name */}
      <h2 className="font-semibold text-xs pl-2">{currentServer?.serverName.toUpperCase()}</h2>

      {/* Tabs */}

      <p 
        onClick={() => setCurrentTab('overview')}
        className={`px-2 py-1 rounded hover:bg-primary ${currentTab === 'overview' && 'bg-primaryLight'}`}
      >
        Overview
      </p>

      <hr className="border-primaryLight"/>

      {/* User Management */}
      <h2 className="font-semibold text-xs pl-2">USER MANAGEMENT</h2>
      <p 
        onClick={() => setCurrentTab('members')}
        className={`px-2 py-1 rounded hover:bg-primary ${currentTab === 'members' && 'bg-primaryLight'}`}
      >
        Members
      </p>

      <hr className="border-primaryLight"/>
      <p 
        onClick={() => setCurrentTab('delete-server')}
        className={`px-2 py-1 rounded flex items-center justify-between hover:bg-primary ${currentTab === 'delete-server' && 'bg-primaryLight'}`}
      >
        Delete Server
        <IconTrash  className="p-1"/>
      </p>



    </div>
  )
}

// Close Button
const CloseServerSettingsButton = ({setShowServerSettings}: {setShowServerSettings: React.Dispatch<SetStateAction<boolean>>;}) => {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowServerSettings(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  },[]);


  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 text-accentDark hover:text-accent items-center justify-center z-50">
      <div 
      onClick={() => setShowServerSettings(false)}
      className="w-10 h-10 flex items-center justify-center rounded-full border-accentDark border-2 cursor-pointer">
        <IconX />
      </div>
      <p className="text-sm font-semibold">ESC</p>
    </div>
  )
}