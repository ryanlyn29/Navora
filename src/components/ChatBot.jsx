import React, { useState, useRef, useEffect, useContext } from 'react';
import { ScreenContext } from '../Layouts/RootLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export const ChatBot = () => {
  const { isMobile } = useContext(ScreenContext);
  const [messages, setMessages] = useState([
    { id: 1, from: 'ai', text: 'Hello! How can I assist you today?' },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: prev.length + 1, from: 'user', text: input.trim() },
    ]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: prev.length + 1, from: 'ai', text: 'Got it! Thanks for sharing.' },
      ]);
    }, 700);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed top-15 inset-x-0 bottom-0 z-50 flex w-screen font-inter">
      <div className="flex flex-col w-screen bg-gray-100/25 backdrop-blur-sm shadow-lg transition-all duration-150">
        
       
        <div className="flex items-center justify-between px-6 py-4 border-gray-300">
          <span className="font-medium pl-2 text-gray-800 text-lg">AI Chat</span>
        </div>

      
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`px-4 py-2 rounded-2xl max-w-[70%] break-all whitespace-pre-wrap sm:leading-6 transition-all duration-150 ${
                msg.from === 'ai'
                  ? 'flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-150 hover:bg-gray-300/20 text-sm bg-neutral-100/70 backdrop-blur-xl border border-black/25 text-black self-start'
                  : 'flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-150 hover:bg-gray-700 text-sm bg-gray-800/60 text-white self-end'
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        
        <div className="flex justify-center px-6 py-4">
          <div className="flex items-center gap-3 w-full max-w-xl mb-25">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 font-inter max-h-25 resize-none bg-white/90 rounded-2xl px-4 py-2 border border-slate-400 shadow-md outline-none focus:ring-gray-500/25 text-sm transition-all duration-150"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            />
            <button
              onClick={handleSend}
              className="ml-2 px-2 py-1.5 cursor-pointer rounded-full bg-gray-700 hover:bg-sky-700 text-white shadow-md transition-all duration-150"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
