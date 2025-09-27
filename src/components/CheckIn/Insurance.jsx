import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const Insurance = () => {
  const [startDate, setStartDate] = useState(null);
  const [formData, setFormData] = useState({
    provider: '',
    policyNumber: '',
    groupNumber: '',
    planType: '',
    insuredName: '',
    insuredDOB: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Insurance info submitted:', formData);
  };

  return (
    <div className="flex justify-center items-start px-4">
      <form className="w-full max-w-lg p-6 flex flex-col gap-6 font-inter" onSubmit={handleSubmit}>
        <h2 className="text-xl font-medium font-roboto text-gray-900">Insurance Information</h2>

       
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Insurance Provider</label>
          <input
            type="text"
            name="provider"
            placeholder="Blue Cross"
            value={formData.provider}
            onChange={handleChange}
            className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
            required
          />
        </div>

        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-gray-800 font-medium">Policy Number</label>
            <input
              type="text"
              name="policyNumber"
              placeholder="Policy #"
              value={formData.policyNumber}
              onChange={handleChange}
              className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-gray-800 font-medium">Group Number</label>
            <input
              type="text"
              name="groupNumber"
              placeholder="Group #"
              value={formData.groupNumber}
              onChange={handleChange}
              className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
              required
            />
          </div>
        </div>

       
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Plan Type</label>
          <select
            name="planType"
            value={formData.planType}
            onChange={handleChange}
            className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
            required
          >
            <option value="">Select plan</option>
            <option value="PPO">PPO</option>
            <option value="HMO">HMO</option>
            <option value="EPO">EPO</option>
            <option value="POS">POS</option>
          </select>
        </div>

        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-gray-800 font-medium">Insured Name</label>
            <input
              type="text"
              name="insuredName"
              placeholder="Full Name"
              value={formData.insuredName}
              onChange={handleChange}
              className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-gray-800 font-medium">Date of Birth</label>
            <input
              type="date"
              name="insuredDOB"
              value={formData.insuredDOB}
              onChange={handleChange}
              className="rounded-lg w-full py-1 px-2 cursor-pointer text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
              required
            />
          </div>
        </div>

        
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 rounded-full bg-black hover:bg-gray-900 cursor-pointer text-white font-inter font-medium transition-all duration-50"
        >
          Submit
        </button>
      </form>
    </div>
  );
};
