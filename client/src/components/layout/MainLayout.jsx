import React from 'react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  const [location] = useLocation();
  const isAuthPage = ['/login', '/register', '/'].includes(location);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto w-full">
              <div className="px-2 sm:px-4 md:px-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
