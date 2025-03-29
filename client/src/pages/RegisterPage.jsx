import React, { useState } from 'react';
import { Link } from 'wouter';
import { countries } from '@/data';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    accountType: '',
    name: '',
    contact: '',
    country: '',
    password: '',
    confirmPassword: ''
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">HUMANITARIAN AID DISTRIBUTION SYSTEM</h1>
        
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-900">REGISTER</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">SELECT TYPE:</label>
            <select 
              id="accountType" 
              name="accountType"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.accountType}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select account type</option>
              <option value="ngo">NGO / Organization</option>
              <option value="warehouse">Warehouse Manager</option>
              <option value="transport">Transport Team</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">NAME:</label>
            <input 
              type="text" 
              id="name" 
              name="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Enter name or organization"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">EMAIL/PHONE NUMBER:</label>
            <input 
              type="text" 
              id="contact" 
              name="contact"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Enter email or phone number"
              value={formData.contact}
              onChange={handleChange}
              required
            />
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
              <option value="" disabled>Select country</option>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">PASSWORD:</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">CONFIRM PASSWORD:</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Register
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-sm text-center text-gray-700">
          Already have an account? 
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium ml-1">
            SignIn
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
