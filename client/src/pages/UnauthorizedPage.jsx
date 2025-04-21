import React from 'react';
import { Link, useLocation } from 'wouter';
import { useUser } from '../context/UserContext';
import AuthLinks from '../components/navigation/AuthLinks';

const UnauthorizedPage = () => {
  const { currentUser, logout } = useUser();
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            Please select a page you have permission to access from the options below.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <p className="text-center text-md text-gray-700 my-4">
              {currentUser ? (
                <>
                  You are currently logged in as <span className="font-semibold">{currentUser.name || currentUser.username || currentUser.email}</span> with the role <span className="font-semibold">{currentUser.role}</span>.
                </>
              ) : (
                'You are currently not logged in.'
              )}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Available Pages</h3>
            
            {/* Display links to pages the user has access to */}
            <AuthLinks />
            
            <div className="mt-4 w-full">
              <Link to="/">
                <button className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Return to Home
                </button>
              </Link>
            </div>
            
            {currentUser && (
              <div className="w-full">
                <button 
                  onClick={() => {
                    logout();
                    setLocation('/auth');
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;