import { Channel, Server, User } from "../types/types";


export const authUser: User = {
  userID: '1',
  username: 'User 1',
  email: 'testemail@gmail.com',
  tag: '#1245',
  status: 'Online'
}

export const servers: Server[] = [
  {
    serverID: '1',
    serverName: 'Server 1',
    serverIcon: 'https://cdn.iconscout.com/icon/free/png-256/discord-3-569463.png',
    serverOwner: 'User 1'
  },
  {
    serverID: '2',
    serverName: 'Server 2',
    serverIcon: 'https://cdn.iconscout.com/icon/free/png-256/discord-3-569463.png',
    serverOwner: 'User 2'
  },
  {
    serverID: '3',
    serverName: 'Server 3',
    serverIcon: 'https://cdn.iconscout.com/icon/free/png-256/discord-3-569463.png',
    serverOwner: 'User 3'
  }
];

export const server1Channels: Channel[] = [
  {
    channelID: '1',
    channelName: 'general',
    serverID: '1',
    channelOrder: 1,
    type: 'text'
  },
  {
    channelID: '2',
    channelName: 'announcements',
    serverID: '1',
    channelOrder: 2,
    type: "text"
  },
  {
    channelID: '3',
    channelName: 'chat',
    serverID: '1',
    channelOrder: 3,
    type: "text"
  },
  {
    channelID: '4',
    channelName: 'music',
    serverID: '1',
    channelOrder: 4,
    type: "text"
  },
  {
    channelID: '5',
    channelName: 'voice 1',
    serverID: '1',
    channelOrder: 5,
    type: "voice"
  },
  {
    channelID: '6',
    channelName: 'voice 2',
    serverID: '1',
    channelOrder: 6,
    type: "voice"
  }
]