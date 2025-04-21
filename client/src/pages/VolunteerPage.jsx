import React, { useState } from 'react';
import { Link } from 'wouter';
import { countries, organizations, roles } from '@/data';

const VolunteerPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    country: '',
    bio: ''
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
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">Want to Volunteer? Apply</h2>
      
      <form className="max-w-2xl mx-auto space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">NAME:</label>
          <input 
            type="text" 
            id="name" 
            name="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">EMAIL:</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">SELECT ORG:</label>
          <select 
            id="organization" 
            name="organization"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={formData.organization}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select an organization</option>
            {organizations.map((org) => (
              <option key={org.value} value={org.value}>
                {org.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">SELECT ROLE:</label>
          <select 
            id="role" 
            name="role"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select a role</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">COUNTRY:</label>
          <select 
            id="country" 
            name="country"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={formData.country}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select your country</option>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">BIO:</label>
          <textarea 
            id="bio" 
            name="bio"
            rows="4" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
            placeholder="Tell us about your experience and why you want to volunteer"
            value={formData.bio}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        
        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white py-2.5 px-6 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  );
};

export default VolunteerPage;
