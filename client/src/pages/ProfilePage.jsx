import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { countries } from '@/data';

const ProfilePage = () => {
  const { currentUser, updateProfile, logout } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    country: currentUser?.country || '',
    bio: currentUser?.bio || ''
  });
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    setLocation('/login');
    return null;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const result = updateProfile(formData);
    
    if (result.success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      setIsEditing(false);
    } else {
      toast({
        title: "Update failed",
        description: result.message,
        variant: "destructive"
      });
    }
  };
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    setLocation('/login');
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">PROFILE</h2>
        
        <div className="max-w-xl mx-auto">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <div className="h-24 w-24 bg-secondary rounded-full flex items-center justify-center text-white text-3xl mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">{currentUser.role}</h3>
                <p className="text-gray-600 mb-2">User ID: {currentUser.uniqueId}</p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="text" 
                  id="phone" 
                  name="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
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
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea 
                  id="bio" 
                  name="bio"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 bg-secondary rounded-full flex items-center justify-center text-white text-3xl mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-1">{currentUser.name}</h3>
                <p className="text-gray-600 mb-1">{currentUser.role}</p>
                <p className="text-gray-600 mb-1">{currentUser.email}</p>
                {currentUser.phone && <p className="text-gray-600 mb-1">{currentUser.phone}</p>}
                <p className="text-gray-600 mb-1">{currentUser.country}</p>
                <p className="text-gray-600">ID: {currentUser.uniqueId}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">BIO</h4>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                  {currentUser.bio ? currentUser.bio : 
                    <p className="text-gray-400 italic">No bio information provided</p>
                  }
                </div>
              </div>
              
              <div className="flex justify-between">
                <button 
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Logout
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Modify Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
