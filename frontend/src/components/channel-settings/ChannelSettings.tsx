import { IconHash, IconTrash, IconVolume, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion'
import React, { SetStateAction, useEffect } from 'react'
import { Channel, Server } from '../../types/types';
import DeleteChannel from './DeleteChannel';
import Overview from './Overview';

const ChannelSettings = ({channel, server, setShowChannelSettings}: {
  channel: Channel | null;
  server: Server | null;
  setShowChannelSettings: React.Dispatch<SetStateAction<boolean>>;
}) => {


  // States
  const [currentTab, setCurrentTab] = React.useState<string>('overview');

  return (
    <motion.div 
      initial={{opacity: 0, scale: 1.2}}
      animate={{opacity: 1, scale: 1}}
      transition={{ duration: 0.2 }}
      className="fixed w-full h-screen bg-primary z-40 flex items-center"
    >
      
      {/* Close Button */}
      <CloseChannelSettingsButton setShowChannelSettings={setShowChannelSettings}/>
      
      {/* Sidebar */}
      <ChannelSettingsSidebar channel={channel} currentTab={currentTab} setCurrentTab={setCurrentTab} />
      {/* Body Container */}
      <div className="w-full h-full flex justify-center p-8 py-12 pr-16 relative">
        {currentTab === 'overview' && <Overview channel={channel} />}
        {currentTab === 'delete-channel' && <DeleteChannel channel={channel} server={server} handleCancel={() => setCurrentTab('overview')} setShowChannelSettings={setShowChannelSettings} />}
      </div>
    </motion.div>
  )
}

// Channel Settings Sidebar

// Sidebar
const ChannelSettingsSidebar = ({channel, currentTab, setCurrentTab}: {
  channel: Channel | null;
  currentTab: string;
  setCurrentTab: React.Dispatch<SetStateAction<string>>;
}) => {

  return (
    <div className="w-64 min-h-screen max-h-screen overflow-y-auto bg-secondary px-4 py-12 flex flex-col gap-2 text-accentDark">

      {/* Server Name */}
      <h2 className="font-semibold text-xs pl-2 flex items-center gap-1">{channel?.type === 'text' ? <IconHash className='w-4 h-4'/> : <IconVolume className='w-4 h-4'/>}{channel?.channelName.toUpperCase()}</h2>

      {/* Tabs */}

      <p 
        onClick={() => setCurrentTab('overview')}
        className={`px-2 py-1 rounded hover:bg-primary cursor-pointer ${currentTab === 'overview' && 'bg-primaryLight'}`}
      >
        Overview
      </p>

      <hr className="border-primaryLight"/>

      <p 
        onClick={() => setCurrentTab('delete-channel')}
        className={`px-2 py-1 rounded flex items-center justify-between hover:bg-primary cursor-pointer ${currentTab === 'delete-channel' && 'bg-primaryLight'}`}
      >
        Delete Channel
        <IconTrash  className="p-1"/>
      </p>



    </div>
  )
}


// Close Button
const CloseChannelSettingsButton = ({setShowChannelSettings}: {setShowChannelSettings: React.Dispatch<SetStateAction<boolean>>;}) => {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowChannelSettings(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  },[]);


  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 text-accentDark hover:text-accent items-center justify-center z-50">
      <div 
      onClick={() => setShowChannelSettings(false)}
      className="w-10 h-10 flex items-center justify-center rounded-full border-accentDark border-2 cursor-pointer">
        <IconX />
      </div>
      <p className="text-sm font-semibold">ESC</p>
    </div>
  )
}

export default ChannelSettings