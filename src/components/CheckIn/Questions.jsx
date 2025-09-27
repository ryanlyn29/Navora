import React, { useState } from 'react';

export const Questions = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    question: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', question: '' });
  };

  return (
    <div className="flex justify-center items-start px-4">
      <form className="w-full max-w-lg p-6 flex flex-col gap-6 font-inter"
            onSubmit={handleSubmit}>
        <h2 className="text-xl font-medium font-roboto text-gray-900">Have a Question?</h2>
        <p className="text-gray-700">Your privacy is important to us. Please submit any non-sensitive questions below.</p>

        {submitted && <p className="text-green-600">Thank you! Your question has been submitted.</p>}

       
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Name</label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
            className="rounded-lg w-full py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
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
            required
            className="w-full rounded-lg py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
          />
        </div>

        
        <div className="flex flex-col gap-1">
          <label className="text-gray-800 font-medium">Your Question</label>
          <textarea
            name="question"
            placeholder="Type your question here"
            value={formData.question}
            onChange={handleChange}
            required
            rows={5}
            className="w-full rounded-lg py-1 px-2 text-gray-900 bg-white/30 border border-gray-300 hover:border-gray-700/50 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-50"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 rounded-full bg-black hover:bg-gray-900 cursor-pointer text-white font-inter font-medium transition-all duration-50"
        >
          Submit
        </button>

        
        <section className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h3>
          <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
            <li>How do I schedule an appointment?</li>
            <li>What insurance plans do you accept?</li>
            <li>How do you protect my health information?</li>
          </ul>
        </section>
      </form>
    </div>
  );
};
