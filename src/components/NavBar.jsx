import React, { useState, useEffect, useContext } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChartSimple, faCommentDots,  faUser,  faUserCheck, } from '@fortawesome/free-solid-svg-icons'
import { MobileNav } from './MobileNav';
import { ScreenContext } from '../Layouts/RootLayout';

const NavBar = () => {
  const navItems =[
    
    {icon:faUserCheck, label:'Check-In', path:'/checkin'},
    
    {icon:faCommentDots, label:'Chat', path:'/chat'},
    
  ];

  const [isMobileOpen, setIsMobileOpen]= useState(false);
  const {isMobile} = useContext(ScreenContext)
 
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
   
   <>
    <nav className='sticky z-50 border-b border-white' >
        <div className='sticky flex flex-row   w-screen px-5 py-3 font-inter items-center justify-between bg-white/60'>
          <div><Link to="/" className=' hidden lg:block font-semibold font-inter text-xl sm:text-center px-3 py-1'>Clinix</Link></div>
          
          <div className=' lg:flex flex-row gap-10 hidden '>
              { navItems.map(({label, path}) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3 py-1 transition-colors ${
                      isActive
                        ? "text-black"
                        : "text-zinc-500 lg:hover:text-black"
                    } ${
                      "hover:bg-zinc-300/50 active:bg-zinc-300/50 lg:hover:bg-transparent"
                    }`
                  }
                >                  
                    <span className='font-normal'>{label}</span>
                </NavLink>
              ))}
            
          </div>
            
        <div className='hidden lg:flex gap-5  items-center font-inter'>
            <Link to="/Login" className='hover:text-zinc-500 active:text-black transition-colors'>Login</Link>
            <Link to="/SignIn" className='text-white border-black rounded-full bg-black px-6 w-auto py-2 hover:cursor-pointer hover:bg-zinc-700 active:bg-black transition-colors'>Sign Up</Link>
        </div>
          <div className='lg:hidden flex justify-between items-center  w-screen'>
            <FontAwesomeIcon icon={faBars} onClick={() => setIsMobileOpen(prev => !prev) } className='hidden cursor-pointer lg:hidden  rounded-full px-2 py-2.25 hover:bg-zinc-300/50 active:bg-zinc-300/75'/> 
            <div><Link to="/" className='font-semibold text-xl sm:text-center font-inter'>Clinix</Link></div>
            <Link to={"/SignIn"}><FontAwesomeIcon icon={faUser} className='hidden cursor-pointer  rounded-full px-2 py-2.25 hover:bg-zinc-200/75 active:bg-zinc-300/75'/> </Link>
          </div>
        </div>
      </nav>
      
      
      {isMobile && isMobileOpen && <MobileNav navItems={navItems} onClose={() => setIsMobileOpen(false)}/>}

    </>
  )
}

export default NavBar