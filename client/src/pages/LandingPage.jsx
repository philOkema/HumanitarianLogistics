import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, Package, MapPin } from 'lucide-react';
import { useUser } from '@/context/UserContext';

const LandingPage = () => {
  const { isAuthenticated } = useUser();
  const [, setLocation] = useLocation();
  
  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
              <h1 className="text-3xl font-bold mb-6 text-gray-900">HUMANITARIAN AID DISTRIBUTION SYSTEM</h1>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3 text-gray-900">Mission</h2>
                <p className="text-gray-700">
                  To efficiently and transparently distribute humanitarian aid to those in need by leveraging technology, ensuring equitable access, and minimizing logistical challenges.
                </p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3 text-gray-900">Vision</h2>
                <p className="text-gray-700">
                  To create a global, technology-driven aid distribution system that enhances transparency, promotes fairness, and ensures timely assistance to vulnerable communities worldwide.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <Link 
                  to="/login"
                  className="bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="border border-primary text-primary hover:bg-primary/10 py-2 px-6 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 p-8 bg-gray-50 flex flex-col items-center justify-center">
              <div className="w-full max-w-md">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Heart size={20} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">Aid Requests</h3>
                      <p className="text-sm text-gray-600">Submit and track aid distribution requests</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                      <Package size={20} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">Inventory Management</h3>
                      <p className="text-sm text-gray-600">Track aid supplies in real-time</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <MapPin size={20} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">Distribution Tracking</h3>
                      <p className="text-sm text-gray-600">Monitor aid deliveries across locations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
