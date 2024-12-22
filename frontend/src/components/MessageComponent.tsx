import { DirectMessage, Message } from "../types/types"

const MessageComponent = ({message}: {
  message: Message | DirectMessage;

}) => {
  return (
    <div className={`flex gap-3 relative`}>
      {/* Avatar */}
      <div className={`min-w-10 w-10 min-h-10 h-10 rounded-full bg-center bg-cover`} style={{ backgroundImage: `url(${message.senderAvatar ? message.senderAvatar : "./default-avatar.png"})`}}></div>

      {/* Content */}
      <section className="flex flex-col gap-1 text-base">
        <p className="text-white">{message.senderUsername} <span className="ml-1 text-zinc-400 text-xs">{new Date(message.timestamp).toDateString()}</span></p>
        <p className="text-sm">{message.content}</p>
      </section>


    </div>
  )
}

export default MessageComponent