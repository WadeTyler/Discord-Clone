import React, { useState } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import ServerPage from './pages/ServerPage'
import { server1Channels, servers } from './constants/testData'
import { Channel, Server } from './types/types'

const App = () => {

  return (
    <div className="flex">
        <Sidebar />
        <Routes>
          <Route index element={<ServerPage />} />
        </Routes>
      </div>
  )
}

export default App