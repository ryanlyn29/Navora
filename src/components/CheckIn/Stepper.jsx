import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScreenContext } from '../../Layouts/RootLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNotesMedical, faCalendarCheck, faMoneyCheck, faCircleQuestion, faCaretRight } from '@fortawesome/free-solid-svg-icons';

const Stepper = () => {
  const stepItems = [
    { name: "Appointments", path: "appointments", icon: faCalendarCheck },
    { name: "Insurance", path: "insurance", icon: faMoneyCheck },
    { name: "Records", path: "records", icon: faNotesMedical },
    { name: "Questions", path: "questions", icon: faCircleQuestion },
  ];

  const { isMobile } = useContext(ScreenContext);
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const stepperRef = useRef(null);

  const currentStep = stepItems.find(step =>
    location.pathname.includes(step.path)
  ) || stepItems[0];

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isMobile && stepperRef.current && !stepperRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

 
  useEffect(() => {
    if (isMobile) setIsExpanded(false); 
  }, [isMobile]);

  return (
    <div
      ref={stepperRef}
      className={`fixed top-20 left-5 z-40 flex flex-col gap-2 py-3 px-2
        ${isExpanded ? 'w-60 bg-white/60 rounded-4xl border border-white ' : 'w-16 bg-white/60 border border-white rounded-full'}
        backdrop-blur-sm shadow-lg transition-all duration-80`}
    >
     
      <div
        onClick={() => setIsExpanded(!isExpanded)} 
        className="flex items-center justify-between px-4 py-2 cursor-pointer  hover:bg-gray-300/40 rounded-full transition-all duration-50"
      >
        <span className={`${isExpanded ? 'font-medium text-gray-800' : 'sr-only'}`}>
          {currentStep.name}
        </span>

      
        <FontAwesomeIcon
          icon={faCaretRight}
          className={`text-gray-800 transform transition-transform text-md ${isExpanded ? "rotate-180" : ""}`}
        />
      </div>

     
      <div className="flex flex-col gap-5 mt-2">
        {stepItems.map(step => (
          <Link
            key={step.path}
            to={step.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-150 hover:bg-gray-400/20 text-sm h-10
              ${step.path === currentStep.path ? '  text-gray-900 font-semibold ' : 'text-gray-700 hover:bg-gr/20 hover:text-gray-900'}
              ${!isExpanded ? 'justify-center p-3 w-12 h-1' : ''}`}
          >
            <FontAwesomeIcon icon={step.icon} className="w-5 h-5" />
            {isExpanded && <span>{step.name}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
