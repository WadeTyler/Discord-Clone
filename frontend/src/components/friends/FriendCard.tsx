import React, { useState } from 'react'
import { Friend, User } from '../../types/types'
import UserAvatar from '../users/UserAvatar';
import { IconDotsVertical, IconMessageCircleFilled } from '@tabler/icons-react';
import { useWebSocket } from '../../context/WebSocketContext';
import { useQuery } from '@tanstack/react-query';

const FriendCard = ({friend}: {
  friend: Friend;
}) => {

  const [viewingOptions, setViewingOptions] = useState<boolean>(false);
  const [removingFriend, setRemovingFriend] = useState<boolean>(false);

  return (
    <div className='w-full flex items-center justify-between gap-2 p-2 border-t-primaryLight border-t rounded-md cursor-pointer hover:bg-primaryLight'>
      {/* Left Side */}
      <section className="flex items-center gap-2">
        <UserAvatar avatar={friend.avatar} status={friend.status} />
        <div className="flex flex-col text-sm">
          <p className="text-white">{friend.username}</p>
          <p className="text-accentDark text-xs">{friend.status}</p>
        </div>
      </section>

      {/* Right Side */}
      <section className="flex gap-2 relative">
        <div className="w-10 h-10 flex items-center bg-secondary justify-center rounded-full hover:text-white hover:bg-tertiary">
          <IconMessageCircleFilled />
        </div>
        <div 
        onClick={() => setViewingOptions(!viewingOptions)}
        className="w-10 h-10 flex items-center bg-secondary justify-center rounded-full hover:text-white hover:bg-tertiary">
          <IconDotsVertical />
        </div>
        {viewingOptions && <FriendOptions friend={friend} setViewingOptions={setViewingOptions} setRemovingFriend={setRemovingFriend} />}
      </section>
      {removingFriend && <ConfirmRemoveFriend friend={friend} setRemovingFriend={setRemovingFriend} />}
    </div>
  )
}

export default FriendCard

const FriendOptions = ({setViewingOptions, setRemovingFriend}: {
  friend: Friend;
  setViewingOptions: React.Dispatch<React.SetStateAction<boolean>>;
  setRemovingFriend: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="bg-tertiary w-36 p-2 absolute -bottom-12 right-0 rounded-md shadow-md">
      <p onClick={() => {
        setRemovingFriend(true);
        setViewingOptions(false);
      }} className="text-red-500 text-sm hover:bg-red-600 hover:text-white cursor-pointer rounded p-2">Remove Friend</p>
    </div>
  )
}

const ConfirmRemoveFriend = ({friend, setRemovingFriend}: {
  friend: Friend;
  setRemovingFriend: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

  const client = useWebSocket();

  const {data:authUser} = useQuery<User>({ queryKey: ['authUser'] });



  const handleRemoveFriend = () => {
    client?.publish({
      destination: '/app/friends/remove',
      body: JSON.stringify({ 
        friend1: authUser?.userID,
        friend2: friend.userID
       })
    });
  }

  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-[rgba(0,0,0,.8)] flex items-center justify-center">
      <div className="bg-primary flex flex-col gap-4 rounded">

        <div className="p-4 flex flex-col gap-4">
          <p className="text-accent font-semibold">Remove '{friend.username}'</p>
          <p className='text-sm text-accentDark'>Are you sure you want to remove <strong className='text-accent font-boldinline-flex'>{friend.username}</strong> from your friends?</p>
        </div>

        <div className="bg-secondary flex items-center justify-end p-4 gap-4 text-sm rounded-b">
          <p onClick={() => setRemovingFriend(false)} className="text-accentDark hover:underline cursor-pointer hover:text-accent">Cancel</p>
          <button onClick={handleRemoveFriend} className="delete-btn">Remove Friend</button>
        </div>
      </div>
    </div>
  )
}