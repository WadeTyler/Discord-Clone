import {useQuery, useQueryClient} from "@tanstack/react-query"
import DirectMessageLabelComponent from "../direct-messages/DirectMessageLabelComponent";
import {DMChannel} from "../../types/types";
import {IconFriends} from "@tabler/icons-react";

const HomeSidebar = () => {
    const queryClient = useQueryClient();

    const {data: dmChannels} = useQuery<DMChannel[]>({queryKey: ['dmChannels']});
    const {data: currentDmChannel} = useQuery<DMChannel | null>({queryKey: ['currentDmChannel']});

    const goToFriendsTab = () => {
        queryClient.setQueryData<DMChannel | null>(['currentDmChannel'], null);
    }

    return (
        <div className='w-full h-full flex flex-col gap-4'>
            {/* Search Bar */}
            <div
                className="h-12 w-full flex p-[.5rem] shadow-md border-b-tertiary border-b items-center justify-center">
                <input type="text" placeholder='Find or start a conversation' className="input-bar h-6 text-xs w-full"/>
            </div>

            <div className="py-2 px-4">
                <button
                    className={`flex items-center gap-2 w-full hover:bg-primary p-2 rounded pl-0 ${!currentDmChannel ? 'bg-primaryLight' : ''}`}
                    onClick={goToFriendsTab}
                >
                    <IconFriends/>
                    Friends
                </button>
            </div>

            {/* Direct Messages */}
            <div className="w-full h-full flex flex-col p-4 gap-1">
                {/* Label */}
                <p className="input-label mb-4">DIRECT MESSAGES</p>
                {/* Direct Message Labels */}
                {dmChannels?.map((dmChannel) => (
                    <DirectMessageLabelComponent key={dmChannel.dmChannelID} dmChannel={dmChannel}/>
                ))}
            </div>

        </div>
    )
}

export default HomeSidebar
