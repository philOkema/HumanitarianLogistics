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
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row gap-6 container mx-auto px-4 py-6">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <div className="mt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
