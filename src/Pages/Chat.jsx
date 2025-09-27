import React from 'react'
import { ChatBot } from '../components/ChatBot'

export const Chat = () => {
  return (
    <div>
        <div className={`absolute hidden sm:block transition-all z-15`}>
              <div className="relative -top-2 md:-top-2 -left-10 w-80 h-60 md:-right-20 md:-bottom-0.5 bg-radial from-blue-500/50 to-blue-500/25 rounded-full blur-3xl"></div>
              <div className="fixed -bottom-20 -right-40 w-80 h-80 bg-radial from-red-600/75 to-red-600/50 rounded-full blur-3xl"></div>
              <div className="fixed -bottom-10 -left-10 w-40 h-40 bg-radial from-red-500/60 to-red-500/50 rounded-full blur-2xl"></div>
      </div>
        <ChatBot/>
    </div>
  )
}
