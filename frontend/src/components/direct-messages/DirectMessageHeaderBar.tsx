import { IconPhoneFilled, IconVideoFilled, IconUsersPlus } from "@tabler/icons-react";
import { DMChannel } from "../../types/types";


const DirectMessageHeaderBar = ({currentDmChannel}: {
  currentDmChannel: DMChannel | null;
}) => {


  return (
    <div className="h-12 w-full flex p-[.5rem] shadow-md border-b-tertiary border-b items-center justify-between">

      {/* Left Side */}
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div className="w-8 h-8 min-w-8 min-h-8 rounded-full bg-center bg-cover"
          style={{ backgroundImage: currentDmChannel?.avatar ? `url(${currentDmChannel.avatar})` : `url('./default-avatar.png')` }}>
        </div>
        {/* User Name */}
        <p className="text-accentDark w-full text-sm">{currentDmChannel?.channelName}</p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 text-accentDark">
        <IconPhoneFilled className="hover:text-white cursor-pointer"/>
        <IconVideoFilled className="hover:text-white cursor-pointer"/>
        <IconUsersPlus className="hover:text-white cursor-pointer"/>
      </div>

    </div>
  )
}

export default DirectMessageHeaderBar