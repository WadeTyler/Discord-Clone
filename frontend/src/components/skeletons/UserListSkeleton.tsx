

const UserListSkeleton = () => {
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

export default UserListSkeleton