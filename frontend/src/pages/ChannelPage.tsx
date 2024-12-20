// Server Page. Used for sending messages in the server and joining voice channels.

import { SetStateAction, useEffect, useState } from "react"
import { Channel, Message, Server, User } from "../types/types";
import { IconCrown, IconHash, IconPinFilled, IconPlus, IconSearch, IconUsers } from "@tabler/icons-react";
import MessageComponent from "../components/MessageComponent";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "../context/WebSocketContext";
import toast from "react-hot-toast";
import { UserSkeleton } from "../components/skeletons/Skeletons";

const ChannelPage = () => {

  const [showUserList, setShowUserList] = useState<boolean>(true);

  return (
    <div className="flex flex-col w-full h-screen relative">
      <ChannelHeaderBar setShowUserList={setShowUserList} showUserList={showUserList} />
      <div className="flex h-full w-full">
        <Messages  />
        {showUserList && <UsersList />}
      </div>
    </div>
  )
}

export default ChannelPage

const ChannelHeaderBar = ({ setShowUserList, showUserList}: {
  setShowUserList: React.Dispatch<SetStateAction<boolean>>;
  showUserList: boolean;
}) => {

  const { data:currentTextChannel } = useQuery<Channel | null>({ queryKey: ['currentTextChannel'] });

  return (
    <div className="h-12 w-full flex py-2 px-4 shadow-md border-b-tertiary border-b items-center justify-between">
      {/* Channel Info */}
      <section className="flex gap-1 items-center">
        <IconHash />
        <p className="text-white font-semibold">
          <span className="pr-4">{currentTextChannel?.channelName}</span>
          <span className="border-l border-primaryLight pl-4 text-xs text-accentDark">
            {currentTextChannel?.channelDescription && currentTextChannel?.channelDescription?.length > 20 ? currentTextChannel?.channelDescription.slice(0, 20) + '...' : currentTextChannel?.channelDescription}
          </span>
        </p>
      </section>


      {/* Channel Options */}
      <div className="flex gap-2 items-center">
        {/* Pinned Messages */}
        <IconPinFilled className="hover:text-white cursor-pointer"/>

        {/* Users List */}
        <IconUsers 
        onClick={() => setShowUserList((prev: boolean) => !prev)}
        className={`hover:text-white cursor-pointer ${showUserList && 'text-white'}`}/>

        {/* Search Bar */}
        <div className="bg-tertiary rounded p-1 flex justify-between items-center">
          <input type="text" placeholder="Search" className="bg-transparent focus:outline-none w-24 h-full text-xs font-semibold focus:w-48 duration-300 border-none focus:border-none"/>
          <IconSearch />
        </div>
      </div>
    </div>
  );

}

const UsersList = () => {

  const API_URL = import.meta.env.VITE_API_URL;

  const queryClient = useQueryClient();

  const { data:currentServer } = useQuery<Server | null>({ queryKey: ['currentServer'] });

  // Users in Server
  const { data:users, isPending:isLoadingUsers } = useQuery<User[]>({
    queryKey: ['usersInServer'],
    queryFn: async () => {
      // Fetch Users in the current Server
      try {
        const response = await fetch(`${API_URL}/servers/${currentServer?.serverID}/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();

        console.log("Users: ", data);

        if (!response.ok) {
          throw new Error(data.error);
        }
        
        return data;

      } catch (error) {
        console.log((error as Error).message || "Something went wrong loading users list.");
      }
    },
    enabled: !!currentServer,
  })

  useEffect(() => {
    // Reload users on server change
    if (currentServer) {
      queryClient.invalidateQueries({ queryKey: ['usersInServer'] });
    }
  }, [currentServer]);

  return (
    <div className="flex flex-col gap-2 h-full bg-secondary min-w-64 max-w-64 p-4">
      {/* Online Users */}
      <p className="text-xs text-gray-400">Online - {users?.filter((user) => user.status !== 'Offline').length}</p>
      {!isLoadingUsers && users?.filter((user) => user.status === 'Online').map((user) => (
        <div className="flex gap-2 items-center w-full" key={user.userID}>
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full bg-center bg-cover`} style={{ backgroundImage: `url(${user.avatar ? user.avatar : "./default-avatar.png"})` }}></div>

          {/* User Info */}
          <section className="flex gap-1">
            <p className="text-gray-400 text-sm">{user.username}</p>
            {user.userID === currentServer?.serverOwner && <p className="text-xs text-orange-300"><IconCrown /></p>}
          </section>
        </div>
      ))}
      {isLoadingUsers && (
        <div className="flex flex-col gap-2">
          <UserSkeleton />
          <UserSkeleton />
          <UserSkeleton />
        </div>
      )}

      {/* Offline Users */}
      <p className="text-xs text-gray-400">Offline - {users?.filter((user) => user.status === 'Offline').length}</p>
      {!isLoadingUsers && users?.filter((user) => user.status === 'Offline').map((user) => (
        <div className="flex gap-2 items-center w-full" key={user.userID}>
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full bg-center bg-cover`} style={{ backgroundImage: `url(${user.avatar ? user.avatar : "./default-avatar.png"})`}}></div>
          {/* User Info */}
          <section className="flex gap-1 items-center">
            <p className="text-zinc-500 text-sm">{user.username}</p>
            {user.userID === currentServer?.serverOwner && <p className="text-xs text-orange-300"><IconCrown /></p>}
          </section>
        </div>
      ))}
      {isLoadingUsers && (
        <div className="flex flex-col gap-2">
          <UserSkeleton />
          <UserSkeleton />
          <UserSkeleton />
        </div>
      )}
    </div>
  )
}

const Messages = () => {

  // States
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoadingPrevMessages, setIsLoadingPrevMessages] = useState<boolean>(false);

  // Current Text Channel
  const { data: currentTextChannel }  = useQuery<Channel | null>({ queryKey: ['currentTextChannel'] });

  // AuthUser
  const { data: authUser } = useQuery<User | null>({ queryKey: ['authUser'] });

  // WebSocket Client
  const client = useWebSocket();

  // Load Messages on Channel Change
  useEffect(() => {
    // Must have client and a currentTextChannel
    if (client.connected && currentTextChannel && authUser) {
      
      // Set messages to empty
      setMessages([]);
      // Set Loading state before fetching messages
      setIsLoadingPrevMessages(true);

      // Request All previous Messages
      client.publish({
        destination: '/app/getMessages',
        body: JSON.stringify({
          channelID: currentTextChannel.channelID,
          userID: authUser.userID,
        })
      });

      // Reveive All previous Messages
      client.subscribe(`/topic/getMessages/${currentTextChannel.channelID}/${authUser.userID}`, (message) => {
        const prevMessages: Message[] = JSON.parse(message.body).body;
        setMessages(prevMessages);
        // Update Loading State
        setIsLoadingPrevMessages(false);
      });

      // Receive new messages to the current Channel
      client.subscribe(`/topic/newMessage/${currentTextChannel?.channelID}`, (response) => {

        const data = JSON.parse(response.body);
        if (data.error)
          throw new Error(data.error);

        const newMessage: Message = JSON.parse(response.body).body;
        console.log("New Message: ", newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        
      });
    }

    // Cleanup
    return () => {
      if (client.connected) {
        client.unsubscribe(`/topic/getMessages/${currentTextChannel?.channelID}/${authUser?.userID}`);
        client.unsubscribe(`/topic/newMessage/${currentTextChannel?.channelID}`);
      }
    }
  }, [currentTextChannel, client, authUser]);

  // Send Message
  const handleSubmitMessage = () => {
    try {

      if (!userInput || !currentTextChannel || !authUser)
        return;

      // Create Message Request Object
      const messageRequest = {
        senderID: authUser?.userID,
        channelID: currentTextChannel?.channelID,
        content: userInput,
      }

      // Send Message
      client.publish({
        destination: '/app/newMessage',
        body: JSON.stringify(messageRequest)
      });

      setUserInput('');

    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  const snapScrollToBottom = (messageContainer: HTMLDivElement) => {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
  }

  // Scroll To bottom on new message
  useEffect(() => {
    const messageContainer = document.querySelector('.messages-container');

    if (messageContainer)
      snapScrollToBottom(messageContainer as HTMLDivElement);
    
  }, [messages]);


  return (
    <div className="w-full h-full flex flex-col gap-4 pt-4 px-4 relative">
      
      {/* Map Messages */}
      <div className="messages-container w-full max-h-[calc(100vh-8rem)] flex-1 overflow-y-auto">
        <div className=" flex flex-col gap-4 justify-end">
          {!isLoadingPrevMessages && messages.map((message: Message) => (
            <MessageComponent key={message.messageID} message={message} /> 
          ))}
          {isLoadingPrevMessages && (
            Array.from({ length: 10 }).map((_, index) => (
              <UserSkeleton key={index} />
            )))
          }
        </div>
      </div>

      {/* Input Bar */}
      <form 
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitMessage();
      }}
      className="w-full bg-primaryLight p-2 rounded flex items-center gap-3">
        <div className="flex items-center justify-center bg-accentDark text-primaryLight rounded-full cursor-pointer"><IconPlus /></div>
        <input type="text" 
        value={userInput}
        className="w-full h-full bg-transparent text-sm placeholder:text-accentDark focus:outline-none" placeholder={`Message #${currentTextChannel?.channelName}`} onChange={(e) => setUserInput(e.target.value)}/>
      </form>
    
    </div>
  );

}