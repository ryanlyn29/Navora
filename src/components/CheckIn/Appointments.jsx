import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const Appointments = () => {
  const [startDate, setStartDate] = useState(null);
  const [time, setTime] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    reason: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Appointment submitted:', { ...formData, date: startDate, time });
  };

  return (
    <div className="flex justify-center items-start px-4">
      <form className="w-full max-w-lg p-6 flex flex-col gap-6 font-inter"
            onSubmit={handleSubmit}>
        <h2 className="text-xl font-medium font-roboto text-gray-900">Book Appointment</h2>

       
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            className=" rounded-lg w-full py-1 px-2  text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50  transition-all duration-50"
            required
          />
        </div>

     
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg py-1 px-2  text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 s transition-all duration-50"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Hospital Id</label>
          <input
            type="email"
            name="email"
            placeholder="#123456789"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg py-1 px-2  text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 s transition-all duration-50"
            required
          />
        </div>

        
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="MM/DD/YYYY"
            className="w-full rounded-lg py-1 px-2  text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
            calendarClassName="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-lg shadow-white/10"
          />
        </div>

       

       
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Reason for Visit</label>
          <textarea
            name="reason"
            placeholder="Describe your reason for the appointment"
            value={formData.reason}
            onChange={handleChange}
            className="w-full rounded-lg py-1 px-2  text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50transition-all duration-50"
            rows={4}
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
