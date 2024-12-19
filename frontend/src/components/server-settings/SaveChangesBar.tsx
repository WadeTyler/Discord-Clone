
const SaveChangesBar = ({resetChanges, saveChanges}: {
  resetChanges: () => void,
  saveChanges: () => void
}) => {
  return (
    <div className="w-[30rem] bg-tertiary text-accent p-2 flex items-center justify-between rounded fixed z-40 bottom-0 text-xs">
      <p className="text-sm">Careful - you have unsaved changes!</p>

      <div className="flex gap-4 items-center">
        <p className="hover:underline cursor-pointer" onClick={resetChanges}>Reset</p>
        <button className="bg-green-700 hover:bg-green-800 px-4 py-2 text-white rounded" onClick={saveChanges}>Save Changes</button>
      </div>

    </div>
  )
}

export default SaveChangesBar