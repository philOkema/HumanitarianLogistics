import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const ProfilePage = () => {
  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">PROFILE</h2>
        
        <div className="max-w-xl mx-auto">
          <div className="flex flex-col items-center mb-6">
            <div className="h-24 w-24 bg-secondary rounded-full flex items-center justify-center text-white text-3xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-1">NAME/ORGANIZATION</h3>
            <p className="text-gray-600">EMAIL/PHONE NUMBER</p>
            <p className="text-gray-600">COUNTRY</p>
            <p className="text-gray-600">UNIQUEID</p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">BIO</h4>
            <div className="bg-gray-50 rounded-lg p-4 h-32">
              {/* Bio content would go here */}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              MODIFY PROFILE
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
