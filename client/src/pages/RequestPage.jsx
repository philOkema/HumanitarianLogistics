import React from 'react';
import { Link, useLocation } from 'wouter';
import AidRequestForm from '@/components/aid-request/AidRequestForm';
import AidRequestList from '@/components/aid-request/AidRequestList';
import AidRequestTracker from '@/components/aid-request/AidRequestTracker';
import { useAidRequest } from '../context/AidRequestContext';
import { useUser } from '../context/UserContext';
import { Loader2 } from 'lucide-react';

const RequestPage = () => {
  const { loading: aidRequestLoading, error } = useAidRequest();
  const { user, hasPermission, loading: userLoading } = useUser();
  const [location, setLocation] = useLocation();
  
  const getRequestId = () => {
    const matches = location.match(/\/request\/([^/]+)/);
    return matches ? matches[1] : null;
  };
  
  const requestId = getRequestId();

  if (userLoading || aidRequestLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    if (location === '/request/new') {
      return hasPermission("create_aid_request") ? (
        <AidRequestForm 
          onRequestSubmitted={() => {
            setLocation('/request');
          }}
        />
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">You don't have permission to create aid requests.</p>
        </div>
      );
    } else if (requestId) {
      return hasPermission('view_aid_requests') ? (
        <AidRequestTracker requestId={requestId} />
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">You don't have permission to view this aid request.</p>
        </div>
      );
    } else {
      return hasPermission('view_aid_requests') ? (
        <AidRequestList />
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">You don't have permission to view aid requests.</p>
        </div>
      );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl text-white font-bold">Aid Requests</h1>
          <p className="text-sm text-gray-500">
            {requestId ? 'View details of an aid request' : 
             location === '/request/new' ? 'Submit a new aid request' : 
             'Manage and track aid requests'}
          </p>
        </div>
        
        {!requestId && location !== '/request/new' && hasPermission('create_aid_request') && (
          <Link href="/request/new">
            <button className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              New Request
            </button>
          </Link>
        )}
      </div>
      
      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default RequestPage;
