// Skeletons for Users


// User List Skeleton
export const UserSkeleton = () => {
  return (
    <div className="flex items-center gap-4">
      <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
      <div className="flex flex-col gap-4">
        <div className="skeleton h-2 w-20"></div>
        <div className="skeleton h-2 w-28"></div>
      </div>
    </div>
  )
}

// Channel Skeleton
export const ChannelSkeleton = () => {
  return (
    <div className="skeleton h-5 w-full my-2"></div>
  )
}

// Server Icon Skeleton
export const ServerIconSkeleton = () => {
  return (
    <div className="skeleton h-12 w-12 rounded-full"></div>
  )
}