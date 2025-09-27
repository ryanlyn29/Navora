import React, { useState, useRef, useEffect } from "react";

export const Records = () => {
  const [formData, setFormData] = useState({
    recordType: "",
    provider: "",
    dateOfVisit: "",
    diagnosis: "",
    medications: "",
    notes: "",
  });
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (value) => {
    setFormData((prev) => ({ ...prev, recordType: value }));
    setOpenDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Medical Record Submitted:", formData);
  };

  return (
    <div className="flex justify-center items-start px-4">
      <form className="w-full max-w-lg p-6 flex flex-col gap-6 font-inter" onSubmit={handleSubmit}>
        <h2 className="text-xl font-medium font-roboto text-gray-900">Medical Records</h2>
        <p className="text-sm text-gray-500">Please complete all required fields.</p>

       
        <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
          <label className="text-gray-800 font-medium">Record Type</label>
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => !prev)}
            className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 flex justify-between items-center transition-all duration-50"
          >
            <span className={formData.recordType ? "text-gray-900" : "text-gray-400"}>
              {formData.recordType || "Select type"}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-gray-500 transform transition-transform ${
                openDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openDropdown && (
            <ul className="absolute top-full w-full mt-4 rounded-lg border border-gray-300 bg-white shadow-md z-20 overflow-hidden transition-all duration-50">
              {["Visit", "Lab Results", "Imaging", "Other"].map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="px-2 py-1 text-gray-900 hover:bg-gray-200 cursor-pointer transition-all duration-50"
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>

        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-gray-800 font-medium">Provider</label>
            <input
              type="text"
              name="provider"
              placeholder="Dr. Smith"
              value={formData.provider}
              onChange={handleChange}
              className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-gray-800 font-medium">Date of Visit</label>
            <input
              type="date"
              name="dateOfVisit"
              value={formData.dateOfVisit}
              onChange={handleChange}
              className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
              required
            />
          </div>
        </div>

       
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Diagnosis</label>
          <input
            type="text"
            name="diagnosis"
            placeholder="E.g. Hypertension"
            value={formData.diagnosis}
            onChange={handleChange}
            className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
          />
        </div>

        
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Medications</label>
          <textarea
            name="medications"
            placeholder="List prescribed medications"
            value={formData.medications}
            onChange={handleChange}
            rows={2}
            className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50 resize-none"
          />
        </div>

       
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Notes</label>
          <textarea
            name="notes"
            placeholder="Additional notes or comments"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50 resize-none"
          />
        </div>

       
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-full bg-black hover:bg-gray-900 cursor-pointer text-white font-inter font-medium transition-all duration-50"
        >
          Save Record
        </button>
      </form>
    </div>
  );
};
