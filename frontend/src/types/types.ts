
export type User = {
  userID: string;
  username: string;
  email: string;
  tag: string;
  status: string;
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
