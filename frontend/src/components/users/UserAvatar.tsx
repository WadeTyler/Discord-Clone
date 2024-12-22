

const UserAvatar = ({avatar, status, backgroundColor}: {
  avatar?: string;
  status?: string;
  backgroundColor?: string;
}) => {
  return (
    <div className={`bg-center bg-cover w-8 h-8 rounded-full relative`} 
    style={{ backgroundImage: avatar ? `url(${avatar})` : `url('./default-avatar.png')` }}
    >
      <div className={`w-4 h-4 absolute -bottom-1 -right-1  flex items-center justify-center rounded-full z-20 ${backgroundColor ? `bg-${backgroundColor}` : 'bg-primary'}`}>
        {status === 'Online' && 
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        }
        {status === 'Offline' && 
          <div className="w-3 h-3 bg-zinc-400 rounded-full flex items-center justify-center">
            <div className={`w-[.4rem] h-[.4rem] rounded-full ${backgroundColor ? 'bg-${backgroundColor}' : 'bg-primary'}`} />
          </div>
        }
      </div>
    </div>
  )
}

export default UserAvatar