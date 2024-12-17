
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import ServerPage from './pages/ServerPage'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import { Server, User } from './types/types'
import { useEffect } from 'react'
import { LoadingSpinnerLG } from './components/lib/util/LoadingSpinner'
import toast from 'react-hot-toast'

const App = () => {

  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL;

  // Auth User
  const { data:authUser, isLoading:loadingAuthUser } = useQuery<User | null>({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          console.log("You are not logged in.");
          return null;
        }

        return data;
      } catch (error) {
        console.log("Error fetching authUser: " + (error as Error).message);
        return null;
      }
    }
  });

  // Joined Servers
  const { data:joinedServers } = useQuery<Server[] | null>({
      queryKey: ['joinedServers'],
      queryFn: async () => {
        try {
          const response = await fetch(`${API_URL}/servers/joined`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          const data = await response.json();[]
  
          if (!response.ok) throw new Error(data.error);
  
          return data;
        } catch (error) {
          toast.error((error as Error).message);
          return null;
        }
      }
    });
  
    useEffect(() => {
      console.log("joinedServers: ", joinedServers);
    }, [joinedServers]);

  useEffect(() => {
    console.log("authUser: ", authUser);
  }, [authUser]);


  if (loadingAuthUser) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-primary">
        <LoadingSpinnerLG />
      </div>
    )
  }

  return (
    <div className="flex">
        {authUser && <Sidebar />}
        <Routes>
          <Route path="/" element={authUser ? <ServerPage /> : <LoginPage />} />
          <Route path="/channels/:serverID/:channelID" element={authUser ? <ServerPage /> : <LoginPage />} />
          <Route path="*" element={authUser ? <ServerPage /> : <LoginPage />} />
        </Routes>
      </div>
  )
}

export default App