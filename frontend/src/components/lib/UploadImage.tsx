import { IconCameraFilled, IconPlus } from '@tabler/icons-react'
import { html, label } from 'framer-motion/client'
import React from 'react'

const UploadImage = ({htmlFor}: {htmlFor: string}) => {
  return (
    <div className="w-20 h-20 flex items-center justify-center relative rounded-full">
      <svg className='absolute w-full h-full' viewBox='0 0 100 100'>
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="10 10"
        />
      </svg>
      <label htmlFor={htmlFor} className='w-full h-full flex flex-col items-center justify-center absolute cursor-pointer text-accentDark'>
        <IconCameraFilled />
        <p className='input-label text-xs font-bold'>UPLOAD</p>
      </label>
      <div className="absolute w-7 h-7 flex items-center justify-center bg-accentBlue top-0 right-0 p-1 rounded-full text-accent">
        <IconPlus />
      </div>
    </div>
  )
}

export default UploadImage