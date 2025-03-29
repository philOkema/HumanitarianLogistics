import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would make an API call
    // For now, we'll simulate login and redirect
    if (email && password) {
      setLocation('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">HUMANITARIAN AID DISTRIBUTION SYSTEM</h1>
        
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-900">Welcome</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">EMAIL</label>
            <input 
              type="email" 
              id="email" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">PASSWORD</label>
            <input 
              type="password" 
              id="password" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input 
                id="remember-me" 
                type="checkbox" 
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember Me</label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="text-primary hover:text-primary/80">Forgot password?</a>
            </div>
          </div>
          
          <div>
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Sign In
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-sm text-center text-gray-700">
          Don't have an account? 
          <Link to="/register" className="text-primary hover:text-primary/80 font-medium ml-1">
            SignUp
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
