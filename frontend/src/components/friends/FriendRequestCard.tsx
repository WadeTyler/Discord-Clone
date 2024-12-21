
import { Friend, User } from '../../types/types'
import UserAvatar from '../users/UserAvatar';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useWebSocket } from '../../context/WebSocketContext';
import { useQuery } from '@tanstack/react-query';

const FriendRequestCard = ({friend}: {
  friend: Friend;
}) => {

  const client = useWebSocket();

  const { data:authUser } = useQuery<User>({ queryKey: ['authUser'] });

  const acceptFriendRequest = () => {
    client?.publish({
      destination: '/app/friends/requests/accept',
      body: JSON.stringify({ friend1: friend.userID, friend2: authUser?.userID })
    });
  }
  const declineFriendRequest = () => {
    client?.publish({
      destination: '/app/friends/requests/decline',
      body: JSON.stringify({ friend1: friend.userID, friend2: authUser?.userID })
    });
  }

  return (
    <div className='w-full flex items-center justify-between gap-2 p-2 border-t-primaryLight border-t rounded-md cursor-pointer hover:bg-primaryLight'>
      {/* Left Side */}
      <section className="flex items-center gap-2">
        <UserAvatar avatar={friend.avatar} status={friend.status} />
        <div className="flex flex-col text-sm">
          <p className="text-white">{friend.username}</p>
          <p className="text-accentDark text-xs">Incoming Friend Request</p>
        </div>
      </section>

      {/* Right Side */}
      <section className="flex gap-2">
        <div 
        onClick={acceptFriendRequest}
        className="w-10 h-10 flex items-center bg-secondary justify-center rounded-full hover:text-white hover:bg-tertiary">
          <IconCheck />
        </div>
        <div 
        onClick={declineFriendRequest}
        className="w-10 h-10 flex items-center bg-secondary justify-center rounded-full hover:text-white hover:bg-tertiary">
          <IconX />
        </div>
      </section>
    </div>
  )
}

export default FriendRequestCard