import { useEffect, useState } from 'react'
import { DirectMessage, DMChannel, User } from '../../types/types';
import MessageComponent from '../MessageComponent';
import { IconPlus } from '@tabler/icons-react';
import { useWebSocket } from '../../context/WebSocketContext';
import { useQuery } from '@tanstack/react-query';

const DirectMessagesContainer = () => {

  const { data:currentDmChannel } = useQuery<DMChannel | null>({ queryKey: ['currentDmChannel'] });

  // Query Data
  const { data:authUser } = useQuery<User>({ queryKey: ['authUser'] });

  // States
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');

  // WebSocket
  const client = useWebSocket();

  useEffect(() => {

    if (currentDmChannel && client.connected)  {
      // Subscribe to DM Channel
      // Load previous messages in that channel on channel change and client load
      client.subscribe(`/topic/dm/messages/${currentDmChannel?.dmChannelID}/${authUser?.userID}`, (response) => {
        const data: DirectMessage[] = JSON.parse(response.body);
        console.log("Previous DMs received: " + data);
        setMessages(data);
      });

      client.publish({
        destination: '/app/dm/messages',
        body: JSON.stringify({
          dmChannelID: currentDmChannel.dmChannelID,
          userID: authUser?.userID
        })
      }); 

      // Receive new messages inside this channel
      client.subscribe(`/topic/dm/messages/new/inside/${currentDmChannel.dmChannelID}`, (response) => {
        const data = JSON.parse(response.body);
        console.log("New DM received: ", data);
        setMessages((prevMessages) => [...prevMessages, data]);

        // Scroll to bottom
        const messageContainer = document.querySelector('.direct-messages-container') as HTMLDivElement;
        snapScrollToBottom(messageContainer);
      });
    }

    // Cleanup
    return () => {
      if (currentDmChannel && client.connected) {
        client.unsubscribe(`/topic/dm/messages/${authUser?.userID}/${currentDmChannel.dmChannelID}`);
        client.unsubscribe(`/topic/dm/messages/new/inside/${currentDmChannel.dmChannelID}`);
      }
    }
  }, [currentDmChannel, client]);

  function handleSubmitMessage() {
    console.log("Submitting message: ", userInput);
    if (userInput.trim() === '') return;

    const dmRequest = {
      dmChannelID: currentDmChannel?.dmChannelID,
      senderID: authUser?.userID,
      content: userInput
    }

    client.publish({
      destination: '/app/dm/messages/send',
      body: JSON.stringify(dmRequest)
    });

    setUserInput('');

  }

  const snapScrollToBottom = (messageContainer: HTMLDivElement) => {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
  }

  return (
    <div className='w-full h-full flex flex-col gap-4 pt-4 px-4 relative'>
      {/* Map Messages */}
      <div className="direct-messages-container w-full max-h-[calc(100vh-9rem)] flex-1 overflow-y-auto">
        <div className=" flex flex-col gap-4 justify-end">
          {messages?.map((message) => (
            <MessageComponent key={message.dmID} message={message} />
          ))}
        </div>
      </div>
      

      {/* Input Bar */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitMessage();
        }}
        className="w-full bg-primaryLight p-2 rounded flex items-center gap-3"
      >
        <div className="flex items-center justify-center bg-accentDark text-primaryLight rounded-full cursor-pointer">
          <IconPlus />
        </div>
        <input type="text" 
          value={userInput}
          className="w-full h-full bg-transparent text-sm placeholder:text-accentDark focus:outline-none rounded" placeholder={`Message @${currentDmChannel?.channelName}`} onChange={(e) => setUserInput(e.target.value)}
        />
      </form>
    

    </div>
  )
}

export default DirectMessagesContainer