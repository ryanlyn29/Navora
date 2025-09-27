import { useState } from "react";
import { Link } from "react-router-dom";

const LoginInPage = () => {

  const [emailActive, setEmailActive] = useState(false);
  const [passwordActive, setPasswordActive] = useState(false);

  const submission = (e) =>{
    e.preventDefault();
  }
    
  return (
    <>
        <div className="absolute hidden sm:block">
          <div className="absolute -top-2 left-30 w-80 h-60 md:-right-20 md:-bottom-0.5 bg-radial from-blue-500/50 to-blue-500/25 rounded-full blur-3xl sm:block"></div>
          <div className="fixed -bottom-20 -right-40 w-80 h-80 bg-radial from-red-600/75 to-red-600/50 rounded-full blur-3xl hidden sm:block"></div>
          <div className="fixed -bottom-10 -left-10 w-40 h-40 bg-radial from-red-500/60 to-red-500/50  rounded-full blur-2xl hidden sm:block"></div>
        </div>
            <div className='text-center my-auto'>
                <div className='flex flex-col text-center'>
                    <div className='font-semibold font-inter text-2xl mt-45 flex flex-col justify-center w-auto'>
                        <div className="flex flex-col  m-auto items-center justify-cente">                        
                          <span>Welcome Back</span>
                          <span className="block text-gray-600 text-base font-normal mt-2">Enter your email and password to Sign In</span>
                        </div>
                        <form action="sumbit" onSubmit={submission} className='mt-10 flex flex-col gap-2 justify-center mx-auto w-auto'>
                            <label htmlFor="email" className='text-base text-left'>Email</label>
                            <input type="email" 
                            placeholder='Enter your email' 
                            onFocus={() => setEmailActive(true)}
                            onBlur={() => setEmailActive(false)}
                            className={`font-normal mx-auto w-xs py-0.5 text-lg text-inter  border-2 rounded-lg mb-5  px-3 hover:border-gray-700/50  focus:outline-none focus:ring-4 ${emailActive ? " ring-gray-500/25 border-neutral-500 " : 'hover:border-gray-700 border-gray-200'} transition-all duration-200`} />
                            
                            <label htmlFor="password" className='text-base text-left'>Password</label>
                            <input type="password" 
                                placeholder='Enter your password' 
                                onFocus={() => setPasswordActive(true)}
                                onBlur={() => setPasswordActive(false)}
                                className={`font-normal mx-auto w-xs py-0.5 text-lg text-inter  border-2 rounded-lg mb-5  px-3 hover:border-gray-700/50  focus:outline-none focus:ring-4 ${passwordActive ? " ring-gray-500/25 border-neutral-500" : 'hover:border-gray-700 border-gray-200'} transition-all duration-200`} />
                    
                            <button className='text-white border border-black bg-black w-xs mx-auto hover:cursor-pointer hover:bg-zinc-700 rounded-full p-2 text-base font-normal active:bg-black transition-colors'>Log In</button>
                             <div className='flex gap-3 justify-center text-center items-center text-gray-300'>
                                <div className='flex gap-3 justify-center text-center items-center text-gray-300'>
                        <div className="h-px size-28 border-1"></div>
                          <Link to="/SignIn" className='text-base text-gray-500 text-sm font-normal hover:text-sky-600'>Sign Up</Link>
                          <div className="h-px size-28 border-1"></div>
                      </div>
                             </div>
                             
                        </form>
                    </div>
                </div>    
            </div>

    </>
  )
}

export default LoginInPage