import { IconX } from "@tabler/icons-react";
import { SetStateAction } from "react"


const CloseButton = ({setState, cn}: {setState: React.Dispatch<SetStateAction<boolean>>; cn?: string;}) => {
  return (
    <IconX className={`text-zinc-400 hover:text-accent cursor-pointer duration-300 ` + cn} 
      onClick={() => setState(false)}
    />
  )
}

export default CloseButton