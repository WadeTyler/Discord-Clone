
export type User = {
  userID: string;
  username: string;
  email: string;
  tag: string;
  status: string;
  avatar: string;
}

export type Server = {
  serverID: string;
  serverName: string;
  serverIcon: string;
  serverOwner: string;
}

export type Channel = {
  channelID: string;
  channelName: string;
  serverID: string;
  channelDescription?: string;
  channelOrder: number;
  type: 'text' | 'voice';
}


export type Message = {
  messageID: number;
  senderID: string;
  senderUsername: string;
  timestamp: string;
  channelID: string;
  content: string;
  senderAvatar: string;
}