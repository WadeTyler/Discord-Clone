import { IconFriends, IconSearch } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { DMChannel, Friend, User } from "../types/types";
import { useQuery } from "@tanstack/react-query";
import FriendCard from "../components/friends/FriendCard";
import FriendRequestCard from "../components/friends/FriendRequestCard";
import { useWebSocket } from "../context/WebSocketContext";
import DirectMessageHeaderBar from "../components/direct-messages/DirectMessageHeaderBar";
import DirectMessagesContainer from "../components/direct-messages/DirectMessagesContainer";


const Home = () => {

  // Query Data
  const { data:currentDmChannel } = useQuery<DMChannel | null>({ queryKey: ['currentDmChannel'] });

  // Tabs: "Online", "All", "Pending", "Blocked", "Add Friend"
  const [currentTab, setCurrentTab] = useState<string>('Online');

  return (
    <div className="w-full h-screen flex flex-col gap-4 relative">
      {/* Header Bars */}
      {!currentDmChannel && <FriendsHeaderBar currentTab={currentTab} setCurrentTab={setCurrentTab} />}
      {currentDmChannel && <DirectMessageHeaderBar currentDmChannel={currentDmChannel} />}

      {/* Container */}
      {!currentDmChannel && currentTab !== 'Add Friend' && (
        <div className="w-full p-4 flex flex-col relative gap-4">
          {/* Search Bar */}
          <div className="input-bar w-full h-9 flex items-center">
            <input type="text" placeholder="Search" className="w-full h-full bg-transparent input-bar"/>
            <IconSearch className="text-accentDark"/>
          </div>
          {currentTab === 'Online' && <OnlineFriends />}
          {currentTab === 'All' && <AllFriends />}
          {currentTab === 'Pending' && <Pending />}
        </div>
      )}
      
      {/* Dms */}
      {currentDmChannel && <DirectMessagesContainer />}


      {!currentDmChannel && currentTab === 'Add Friend' && <AddFriend />}
    </div>
  )
}

export default Home


/// ------------------------------ FRIENDS ------------------------------

const FriendsHeaderBar = ({currentTab, setCurrentTab}: {
  currentTab: string;
  setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
}) => {

  // QueryData
  const {data:friendRequest} = useQuery<Friend[]>({ queryKey: ['friendRequests'] });

  return (
    <div className="h-12 w-full flex p-[.5rem] shadow-md border-b-tertiary border-b items-center">

      <div className="flex gap-2 items-center pr-4 mr-4 border-r border-r-primaryLight text-accent">
        <IconFriends />
        Friends
      </div>


      {/* Tabs */}
      <div className="flex gap-2 items-center">
        <FriendPageTab currentTab={currentTab} setCurrentTab={setCurrentTab} tabName='Online' />
        <FriendPageTab currentTab={currentTab} setCurrentTab={setCurrentTab} tabName='All' />
        <div className="flex items-center gap-1 relative">
          <FriendPageTab currentTab={currentTab} setCurrentTab={setCurrentTab} tabName='Pending' />
          {friendRequest && friendRequest?.length > 0 && 
            <div className="w-4 h-4 bg-red-500 flex items-center justify-center rounded-full">
              <p className="text-white text-xs">{friendRequest?.length}</p>
            </div>
          }
        </div>
        <FriendPageTab currentTab={currentTab} setCurrentTab={setCurrentTab} tabName='Blocked' />
        <button 
          className={`text-sm px-3 py-1 rounded bg-green-700 font-semibold ${currentTab === 'Add Friend' && 'text-green-500 bg-transparent'}`}
          onClick={() => setCurrentTab('Add Friend')}
        >
          Add Friend
        </button>
      </div>
    </div>
  )
}

const FriendPageTab = ({currentTab, setCurrentTab, tabName }: {
  currentTab: string;
  setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
  tabName: string;
}) => {
  return (
    <button 
      className={`text-sm px-3 py-1 rounded ${currentTab === tabName ? 'bg-primaryLight text-white' : 'text-accentDark hover:bg-primaryLight hover:text-accent'}`} 
      onClick={() => setCurrentTab(tabName)}
    >
      {tabName}
    </button>
  )
}

const OnlineFriends = () => {

  const { data:friends } = useQuery<Friend[]>({ queryKey: ['friends'] });

  return (
    <div className="w-full h-full flex flex-col">
      

      {/* Online Count */}
      <p className="input-label pb-4">Online  - {friends?.filter(friend => friend.status === 'Online').length}</p>

      {/* Friends List */}
      {friends?.filter(friend => friend.status === 'Online').map(friend => (
        <FriendCard key={friend.userID} friend={friend} />
      ))}

    </div>
  )
}

const AllFriends = () => {
  const { data:friends } = useQuery<Friend[]>({ queryKey: ['friends'] });

  return (
    <div className="w-full h-full flex flex-col">

      {/* All Friends Count */}
      <p className="input-label pb-4">All Friends - {friends?.length}</p>

      {/* Friends List */}
      {friends?.map(friend => (
        <FriendCard key={friend.userID} friend={friend} />
      ))}

    </div>
  )
}

const Pending = () => {

  const {data:friendRequests} = useQuery<Friend[]>({ queryKey: ['friendRequests'] });


  return (
    <div className="w-full h-full flex flex-col">

    {/* Pending Count */}
    <p className="input-label pb-4">Pending - {friendRequests?.length}</p>

    {/* Friends List */}
    {friendRequests?.map(friend => (
      <FriendRequestCard key={friend.userID} friend={friend} />
    ))}

    </div>
  )
}

const AddFriend = () => {

  const client = useWebSocket();

  const { data:authUser } = useQuery<User>({ queryKey: ['authUser'] });

  const [targetUser, setTargetUser] = useState<string>('');

  const handleSendFriendRequest = () => {
    const friendRequest = {
      friend1: authUser?.userID,
      friend2: targetUser
    };

    client.publish({
      destination: '/app/friends/requests/send',
      body: JSON.stringify(friendRequest)
    });
  }

  useEffect(() => {

  })
  

  return (
    <div className="w-full p-4 flex flex-col relative gap-2">
      <p className="text text-white font-semibold">ADD FRIEND</p>
      <p className="text-accentDark text-xs">You can add friends with their Discord username and tag. Ex: Superman#1234</p>
      <div className="input-bar flex items-center justify-between">
        <input type="text" 
        value={targetUser}
        onChange={(e) => setTargetUser(e.target.value)}
        placeholder="You can add friends with thier Discord username and tag." 
        className="w-full h-full bg-transparent input-bar"/>
        <button onClick={handleSendFriendRequest} className="submit-btn text-xs w-48">Send Friend Request</button>
      </div>
    </div>
  )
}