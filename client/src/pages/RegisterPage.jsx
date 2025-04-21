import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { countries } from '../data';
import { useUser } from '../context/UserContext';
import { useToast } from '../hooks/use-toast';

const RegisterPage = () => {
  const initialFormData = {
    role: 'beneficiary',
    name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
    bio: ''
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [, setLocation] = useLocation();
  const { register } = useUser();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register form submitted', formData);
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      console.log('Passwords do not match');
      toast({
        title: "Registration failed",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Attempting to register...');
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role
      });
      
      console.log('Registration successful');
      toast({
        title: "Registration successful",
        description: `Welcome, ${formData.name}!`,
      });
      
      // Check if there's a stored redirect URL, otherwise go to home
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      setLocation(redirectUrl || '/home');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive"
      });
    }
  };
    
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">HUMANITARIAN AID DISTRIBUTION SYSTEM</h1>
        
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-900">REGISTER</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">SELECT TYPE:</label>
            <select 
              id="role" 
              name="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="beneficiary">Beneficiary</option>
              <option value="staff">Staff</option>
              <option value="volunteer">Volunteer</option>
              <option value="donor">Donor</option>
              <option value="guest">Guest</option>
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">PHONE NUMBER:</label>
            <input 
              type="text" 
              id="phone" 
              name="phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
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
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">BRIEF DESCRIPTION:</label>
            <textarea 
              id="bio" 
              name="bio"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Tell us about yourself or your organization"
              value={formData.bio}
              onChange={handleChange}
            />
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
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
