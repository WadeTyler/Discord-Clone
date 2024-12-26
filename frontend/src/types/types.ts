
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

export type Friend = {
  userID: string;
  username: string;
  tag: string;
  avatar: string;
  status: string;
}

export type DirectMessage = {
  dmID: number;
  dmChannelID: string;
  senderID: string;
  senderUsername: string;
  senderAvatar?: string;
  timestamp: string;
  content: string;
}

export type DMChannel = {
  dmChannelID: string;
  avatar?: string;
  createdAt: string;
  channelName: string;
  lastModified: string;
}

export type Invite = {
  id: string;
  serverID: string;
  creatorID: string;
  expires_at: string;
}