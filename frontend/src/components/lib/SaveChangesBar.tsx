
import { motion } from "framer-motion"
import { LoadingSpinnerMD } from "./util/LoadingSpinner";


const SaveChangesBar = ({resetChanges, saveChanges, isPending}: {
  resetChanges: () => void;
  saveChanges: () => void;
  isPending?: boolean;
}) => {
  return (
    <motion.div 
    initial={{opacity: 0, y: 200}}
    animate={{opacity: 1, y: 0}}
    transition={{ duration: 0.2 }}
    className="w-[30rem] bg-tertiary text-accent p-2 flex items-center justify-between rounded fixed z-40 bottom-5 text-xs">
      <p className="text-sm">Careful - you have unsaved changes!</p>

      <div className="flex gap-4 items-center">
        {!isPending && <p className="hover:underline cursor-pointer" onClick={resetChanges}>Reset</p>}
        {!isPending && <button className="bg-green-700 hover:bg-green-800 px-4 py-2 text-white rounded" onClick={saveChanges}>Save Changes</button>}
        {isPending && <LoadingSpinnerMD />}
      </div>

    </motion.div>
  )
}

export default SaveChangesBar