import React, { useState } from 'react';
import { Link } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import { aidTypes, urgencyLevels } from '@/data';

const RequestPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    aidType: '',
    urgency: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would make an API call
    // For now, we'll just log the data
    console.log(formData);
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-center mb-6">Request Aid</h2>
        
        <form className="max-w-md mx-auto space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              id="name" 
              name="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Enter your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input 
              type="text" 
              id="location" 
              name="location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Enter your Location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="aidType" className="block text-sm font-medium text-gray-700 mb-1">Type of Aid Needed</label>
            <select 
              id="aidType" 
              name="aidType"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.aidType}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Type of Aid</option>
              {aidTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
            <select 
              id="urgency" 
              name="urgency"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.urgency}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Urgency Level</option>
              {urgencyLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-6 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              SUBMIT AID REQUEST
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Want to Volunteer? 
            <Link to="/volunteer" className="text-primary font-medium ml-1">
              Apply
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default RequestPage;
