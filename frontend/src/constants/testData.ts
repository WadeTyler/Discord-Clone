import { Channel, Message, Server, User } from "../types/types";


export const authUser: User = {
  userID: '1',
  username: 'Timinator',
  email: 'testemail@gmail.com',
  tag: '#1245',
  status: 'Online',
  avatar: ''
}

export const servers: Server[] = [
  {
    serverID: '1',
    serverName: 'Server 1',
    serverIcon: 'https://cdn.iconscout.com/icon/free/png-256/discord-3-569463.png',
    serverOwner: '2'
  },
  {
    serverID: '2',
    serverName: 'Server 2',
    serverIcon: 'https://cdn.iconscout.com/icon/free/png-256/discord-3-569463.png',
    serverOwner: '1'
  },
  {
    serverID: '3',
    serverName: 'Server 3',
    serverIcon: 'https://cdn.iconscout.com/icon/free/png-256/discord-3-569463.png',
    serverOwner: '3'
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
];

export const server1GeneralMessages: Message[] = [
  {
    messageID: 1,
    senderID: '2',
    senderUsername: 'Jimbo',
    timestamp: '2021-09-01T12:00:00',
    channelID: '1',
    content: 'Hello World!',
    senderAvatar: 'https://www.w3schools.com/howto/img_avatar.png'
  },
  {
    messageID: 2,
    senderID: '2',
    senderUsername: 'Jimbo',
    timestamp: '2021-09-01T12:30:00',
    channelID: '1',
    content: 'Hello?...',
    senderAvatar: 'https://www.w3schools.com/howto/img_avatar.png'
  },
  {
    messageID: 3,
    senderID: '1',
    senderUsername: 'Timinator',
    timestamp: '2021-09-01T12:35:00',
    channelID: '1',
    content: 'Anyone?',
    senderAvatar: ''
  },
  {
    messageID: 4,
    senderID: '2',
    senderUsername: 'Jimbo',
    timestamp: '2021-09-01T12:45:00',
    channelID: '1',
    content: 'Oh, it\'s just menubar..',
    senderAvatar: 'https://www.w3schools.com/howto/img_avatar.png'
  },
  {
    messageID: 5,
    senderID: '1',
    senderUsername: 'Timinator',
    timestamp: '2021-09-01T12:46:00',
    channelID: '1',
    content: 'falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl falksjfdklasdjfkl.',
    senderAvatar: 'https://www.w3schools.com/howto/img_avatar.png'
  },
]

export const server1Users: User[] = [
  {
    userID: '2',
    username: 'Jimbo',
    email: 'test@gmail.com',
    tag: '#1245',
    status: 'Offline',
    avatar: 'https://www.w3schools.com/howto/img_avatar.png'
  },
  {
    userID: '1',
    username: 'Timinator',
    email: 'testemail@gmail.com',
    tag: '#1245',
    status: 'Online',
    avatar: ''
  }
]