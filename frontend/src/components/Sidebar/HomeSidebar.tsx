import { IconFriends } from '@tabler/icons-react';
import React, { useState } from 'react'

const HomeSidebar = () => {


  return (
    <div className='w-full h-full flex flex-col gap-4'>


      {/* Search Bar */}
      <div className="h-12 w-full flex p-[.5rem] shadow-md border-b-tertiary border-b items-center justify-center">
        <input type="text" placeholder='Find or start a conversation' className="input-bar h-6 text-xs w-full"/>
      </div>

      {/* Direct Messages */}
      <div className="w-full h-full flex flex-col"></div>



    </div>
  )
}

export default HomeSidebar
