import {DirectMessage, Message} from "../types/types"
import {useState} from "react";
import Invite from "./Invite.tsx";

const MessageComponent = ({message}: {
  message: Message | DirectMessage;

}) => {

  // Check if has invite link
  const inviteLink = "https://discord.tylerwade.net/invite/";
  const hasInvite = message.content.includes(inviteLink);

  return (
    <div className="flex flex-col gap-2">
      <div className={`flex gap-3 relative`}>
        {/* Avatar */}
        <div className={`min-w-10 w-10 min-h-10 h-10 rounded-full bg-center bg-cover`}
             style={{backgroundImage: `url(${message.senderAvatar ? message.senderAvatar : "./default-avatar.png"})`}}></div>

        {/* Content */}
        <section className="flex flex-col gap-1 text-base">
          <p className="text-white">{message.senderUsername} <span
            className="ml-1 text-zinc-400 text-xs">{new Date(message.timestamp).toDateString()}</span></p>
          <p className="text-sm">{message.content}</p>
        </section>
      </div>
      {hasInvite && (
        <Invite inviteLink={message.content.split(" ").filter((content) => content.includes(inviteLink))[0]}/>
      )}
    </div>
  )
}

export default MessageComponent