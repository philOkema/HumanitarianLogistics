import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useToast } from '../hooks/use-toast';
import { useLocation } from 'wouter';
import { countries } from '../data';
import { Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile, logout, loading } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    country: '',
    bio: ''
  });
  
  // Update form data when user data is loaded
  React.useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        country: user.country || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user && !loading) {
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
    <div className="bg-white/10 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6 text-white">PROFILE</h2>
      
      <div className="max-w-xl mx-auto">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <div className="h-24 w-24 bg-primary/40 rounded-full flex items-center justify-center text-white text-3xl mb-4 mx-auto">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-medium text-white mb-4 capitalize">{user.role}</h3>
              <p className="text-white/60 mb-2">User ID: {user.uid}</p>
            </div>
            
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-white mb-1">Name</label>
              <input 
                type="text" 
                id="displayName" 
                name="displayName"
                className="w-full px-3 py-2 bg-white/10 text-white border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                className="w-full px-3 py-2 bg-white/10 text-white border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.email}
                onChange={handleChange}
                required
                disabled
              />
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-white mb-1">Phone</label>
              <input 
                type="tel" 
                id="phoneNumber" 
                name="phoneNumber"
                className="w-full px-3 py-2 bg-white/10 text-white border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-white mb-1">Country</label>
              <select 
                id="country" 
                name="country"
                className="w-full px-3 py-2 bg-white/10 text-white border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select country</option>
                {countries.map((country) => (
                  <option key={country.value} value={country.value} className="text-black">
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-white mb-1">Bio</label>
              <textarea 
                id="bio" 
                name="bio"
                rows="4"
                className="w-full px-3 py-2 bg-white/10 text-white border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                type="button" 
                className="py-2 px-4 border border-white/20 text-white rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
              <div className="h-24 w-24 bg-primary/40 rounded-full flex items-center justify-center text-white text-3xl mb-4">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-medium text-white mb-1">{user.displayName || 'No name set'}</h3>
              <p className="text-white/60 mb-1 capitalize">{user.role}</p>
              <p className="text-white/60 mb-1">{user.email}</p>
              {user.phoneNumber && <p className="text-white/60 mb-1">{user.phoneNumber}</p>}
              {user.country && <p className="text-white/60 mb-1">{user.country}</p>}
              <p className="text-white/40 text-sm">ID: {user.uid}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white/60 mb-2">BIO</h4>
              <div className="bg-white/10 rounded-lg p-4 min-h-[100px]">
                {user.bio ? <span className="text-white/80">{user.bio}</span> : 
                  <p className="text-white/40 italic">No bio information provided</p>
                }
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
  );
};

export default ProfilePage;
