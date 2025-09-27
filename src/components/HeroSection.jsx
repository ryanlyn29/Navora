import React, { useEffect, useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';

const HeroSection = () => {
  const [showArrow, setShowArrow] = useState(false);
  const [blobs, setBlobs] = useState([
    { id: 1, color: "from-blue-600 to-blue-500/80" },
    { id: 2, color: "from-red-700 to-red-600/90" },
    { id: 3, color: "from-green-600 to-green-500/80" },
    { id: 4, color: "from-purple-600 to-purple-500/80" },
    { id: 5, color: "from-pink-600 to-pink-500/80" },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShowArrow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const triggerExit = () => {
    setTimeout(() => navigate('/SignIn'), 600);
  };

  useEffect(() => {
    const handleScroll = () => showArrow && triggerExit();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showArrow]);


  const generateRandomStyle = () => {
    const baseWidth = 80 + Math.random() * 150; 
    const baseHeight = 80 + Math.random() * 120;
    return {
      top: `${Math.random() * 80}vh`,
      left: `${Math.random() * 90}vw`,
      width: `${baseWidth}px`,
      height: `${baseHeight}px`,
      opacity: 1.0, 
    };
  };


  useEffect(() => {
    setBlobs(prev => prev.map(blob => ({ ...blob, style: generateRandomStyle() })));
    const interval = setInterval(() => {
      setBlobs(prev => prev.map(blob => ({ ...blob, style: generateRandomStyle() })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    
      <div className="absolute w-full h-auto pointer-events-none -z-10">
        {blobs.map(blob => (
          <div
            key={blob.id}
            className={`rounded-full blur-3xl fixed transition-all duration-3000 ease-in-out bg-gradient-to-r ${blob.color}`}
            style={blob.style}
          ></div>
        ))}
      </div>

      <section className="min-h-[90vh] xl:h-vh flex flex-col items-center justify-center text-center px-5 gap-5 w-auto h-auto ">
        <h1 className="text-2xl md:text-6xl sm:text-5xl font-montserrat font-medium mb-2 flex flex-col gap-2 tracking-[0.02em] ">
          <span>Clinix: Seamless Care </span>
          <span>Starts Here.</span>
        </h1>
        <p className="text-xs sm:text-xs md:text-base font-inter text-gray-700 max-w-md w-full sm:w-sm lg:w-md mb-6 leading-relaxed">
          Appointments made fast. Records made simple. Care made awesome.
        </p>
        <div className="flex flex-row gap-5 font-inter">
          <Link
            to="/SignIn"
            className="flex items-center px-6 py-2 bg-black text-white rounded-full hover:bg-zinc-700 transition-colors whitespace-nowrap"
          >
            Get Started
          </Link>
          <Link
            to="/Login"
            className="flex items-center px-6 py-2 bg-transparent text-black rounded-full border-2 border-black hover:bg-zinc-300/50 transition-colors whitespace-nowrap"
          >
            Learn More
          </Link>
        </div>
        {showArrow && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-5 cursor-pointer">
            <button onClick={() => navigate('/SignIn')} className="cursor-pointer">
              <FontAwesomeIcon icon={faArrowDown} className="animate-bounce hover:scale-120 transition-all" />
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default HeroSection;
