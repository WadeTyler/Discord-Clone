// Server Page. Used for sending messages in the server and joining voice channels.

import { SetStateAction, useState } from "react"
import { Channel, Message, Server, User } from "../types/types";
import { IconCrown, IconHash, IconPinFilled, IconPlus, IconSearch, IconUsers } from "@tabler/icons-react";
import { server1GeneralMessages, server1Users } from "../constants/testData";
import MessageComponent from "../components/MessageComponent";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ServerPage = () => {

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

export default ServerPage

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
        <p className="text-white font-semibold">{currentTextChannel?.channelName}</p>
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

  const { data:currentServer } = useQuery<Server | null>({ queryKey: ['currentServer'] });

  const [users, setUsers] = useState<User[]>(server1Users);

  return (
    <div className="flex flex-col gap-2 h-full bg-secondary min-w-64 max-w-64 p-4">
      {/* Online Users */}
      <p className="text-xs text-gray-400">Online - {users.filter((user) => user.status !== 'Offline').length}</p>
      {users.filter((user) => user.status === 'Online').map((user) => (
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

      {/* Offline Users */}
      <p className="text-xs text-gray-400">Offline - {users.filter((user) => user.status === 'Offline').length}</p>
      {users.filter((user) => user.status === 'Offline').map((user) => (
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
    </div>
  )
}

const Messages = () => {

  const { data: currentTextChannel }  = useQuery<Channel | null>({ queryKey: ['currentTextChannel'] });

  const [messages, setMessages] = useState<Message[]>(server1GeneralMessages);

  const [userInput, setUserInput] = useState<string>('');

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 overflow-y-auto justify-end relative">
      
      {/* Map Messages */}
      {messages.map((message) => (
       <MessageComponent key={message.messageID} message={message} /> 
      ))}

      {/* Input Bar */}
      <div className="w-full bg-primaryLight p-2 rounded flex items-center gap-3">
        <button className="flex items-center justify-center bg-accentDark text-primaryLight rounded-full"><IconPlus /></button>
        <input type="text" className="w-full h-full bg-transparent text-sm placeholder:text-accentDark focus:outline-none" placeholder={`Message #${currentTextChannel?.channelName}`} onChange={(e) => setUserInput(e.target.value)}/>
      </div>
      
    </div>
  );

}