import React from 'react'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NavLink } from 'react-router-dom'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

export const MobileNav = ({navItems, onClose}) => {

      const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }
  return (
    <>
        <div className='fixed inset-0 z-60 flex transition-colors lg:z-0'>
            <div className="absolute inset-0 bg-black/10 lg:hidden cursor-pointer" onClick={handleClose}></div>
            
            <div className={ `relative lg:hidden z-50 bg-white/80  rounded-r-4xl backdrop-blur-sm pt-6 pr-6 pb-6 pl-0 transition-all duration-300  flex flex-col gap-10 w-64  ${isVisible ? 'opacity-100 translate-0' : "opacity-0 -translate-x-6"}`}>
                <div className='self-end'>
                    <FontAwesomeIcon icon={faXmark} onClick={handleClose} className='cursor-pointer rounded-full px-2 py-2.25 mb-10 hover:bg-zinc-200  active:bg-zinc-300/75'/>
                </div>
                { navItems.map(({icon, label, path}) => (
                    <NavLink  key={path} to={path} onClick={handleClose} className= {({isActive}) => (`flex items-center gap-2 hover:cursor-pointer rounded-r-3xl px-8 py-2  transition-all duration-300 ${isActive ? " text-black hover:bg-zinc-200 "  : "text-zinc-500 hover:text-black hover:bg-zinc-200"} ${isVisible ? 'opacity-100' : 'opacity-0'}`)}>
                    <FontAwesomeIcon icon={icon} /> 
                    <span className='font-normal'>{label}</span>
                    </NavLink>
                ))}
                
            </div>
            
        </div>
      </>
  )
}
