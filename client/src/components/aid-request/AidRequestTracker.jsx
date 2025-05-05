import React, { useEffect, useState } from 'react';
import { useAidRequest, REQUEST_STATUS } from '../../context/AidRequestContext';
import { useToast } from '@/hooks/use-toast';

// Utility to convert Firestore timestamp to JS Date
function toDate(ts) {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts === 'object' && ts.seconds) {
    return new Date(ts.seconds * 1000);
  }
  return new Date(ts);
}

const AidRequestTracker = ({ requestId }) => {
  const { getAidRequestById, updateAidRequest } = useAidRequest();
  const { toast } = useToast();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load request data when component mounts or requestId changes
  useEffect(() => {
    if (!requestId) {
      setError('No request ID provided');
      setLoading(false);
      return;
    }

    const loadRequest = async () => {
      try {
        const requestData = await getAidRequestById(requestId);
        
        if (!requestData) {
          setError('Request not found');
        } else {
          setRequest(requestData);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load request:', err);
        setError('Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    loadRequest();

    // Set up periodic refresh for "real-time" updates
    const refreshInterval = setInterval(loadRequest, 30000); // refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [requestId, getAidRequestById]);

  const getStatusColor = (status) => {
    switch (status) {
      case REQUEST_STATUS.PENDING:
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case REQUEST_STATUS.APPROVED:
        return 'bg-blue-100 border-blue-500 text-blue-700';
      case REQUEST_STATUS.IN_PROGRESS:
        return 'bg-purple-100 border-purple-500 text-purple-700';
      case REQUEST_STATUS.IN_TRANSIT:
        return 'bg-indigo-100 border-indigo-500 text-indigo-700';
      case REQUEST_STATUS.DELIVERED:
        return 'bg-green-100 border-green-500 text-green-700';
      case REQUEST_STATUS.DENIED:
        return 'bg-red-100 border-red-500 text-red-700';
      case REQUEST_STATUS.CANCELLED:
        return 'bg-gray-100 border-gray-500 text-gray-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case REQUEST_STATUS.PENDING:
        return '⏳';
      case REQUEST_STATUS.APPROVED:
        return '✅';
      case REQUEST_STATUS.IN_PROGRESS:
        return '🔄';
      
      case REQUEST_STATUS.IN_TRANSIT:
        return '🚚';
      case REQUEST_STATUS.DELIVERED:
        return '🎉';
      case REQUEST_STATUS.DENIED:
        return '❌';
      case REQUEST_STATUS.CANCELLED:
        return '⛔';
      default:
        return '❓';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case REQUEST_STATUS.PENDING:
        return 'Your request is pending review by our staff.';
      case REQUEST_STATUS.APPROVED:
        return 'Your request has been approved! We are preparing your items.';
      case REQUEST_STATUS.IN_PROGRESS:
        return 'Your request is being processed and items are being prepared.';
      case REQUEST_STATUS.IN_TRANSIT:
        return 'Your items are on the way to your location.';
      case REQUEST_STATUS.DELIVERED:
        return 'Your aid has been delivered.';
      case REQUEST_STATUS.DENIED:
        return 'We regret to inform you that your request could not be fulfilled at this time.';
      case REQUEST_STATUS.CANCELLED:
        return 'This request has been cancelled.';
      default:
        return 'Status information unavailable.';
    }
  };

  // Function to cancel a request
  const cancelRequest = async () => {
    if (!request) return;
    
    // Only allow cancellation if request is still pending
    if (request.status !== REQUEST_STATUS.PENDING) {
      toast({
        title: 'Cannot Cancel',
        description: 'You can only cancel pending requests.',
        variant: 'destructive'
      });
      return;
    }
    
    const result = await updateAidRequest(request.id, { status: REQUEST_STATUS.CANCELLED });
    
    if (result.success) {
      // Update the local state
      setRequest({ ...request, status: REQUEST_STATUS.CANCELLED });
      
      toast({
        title: 'Request Cancelled',
        description: 'Your request has been successfully cancelled.'
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to cancel request. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
        <h2 className="text-xl font-semibold text-red-700 mb-4">Error</h2>
        <p className="text-gray-700">{error}</p>
        <p className="mt-4 text-sm text-gray-500">
          If you believe this is an error, please contact support.
        </p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
        <h2 className="text-xl font-semibold text-yellow-700 mb-4">Request Not Found</h2>
        <p className="text-gray-700">
          The requested aid request could not be found. It may have been removed or you might not have permission to view it.
        </p>
      </div>
    );
  }

  // Normalize status: treat 'fulfilled' as 'delivered'
  let normalizedStatus = request.status;
  if (normalizedStatus === 'fulfilled') normalizedStatus = 'delivered';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="border-b pb-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Request #{request.id}</h2>
          <div className={`px-4 py-2 rounded-full border ${getStatusColor(normalizedStatus)}`}>
            <span className="mr-2">{getStatusIcon(normalizedStatus)}</span>
            <span className="font-medium capitalize">{normalizedStatus ? normalizedStatus.replace('_', ' ') : ''}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mt-2">
          {getStatusMessage(normalizedStatus)}
        </p>
        
        <div className="mt-4 text-sm text-gray-500">
          Created: {toDate(request.createdAt)?.toLocaleString() || ''}
          {request.updatedAt !== request.createdAt && (
            <span className="ml-3">
              Last Updated: {toDate(request.updatedAt)?.toLocaleString() || ''}
            </span>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Requested Items</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 font-semibold text-gray-600 pb-2 border-b mb-2">
            <div>Item</div>
            <div>Quantity</div>
            <div>Unit</div>
          </div>
          
          {(request.items || []).map((item, index) => (
            <div key={index} className="grid grid-cols-3 py-2 border-b border-gray-200 text-gray-700">
              <div>{item.name}</div>
              <div>{item.quantity}</div>
              <div>{item.unit}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Location</h3>
          <p className="text-gray-700">{request.location}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Priority</h3>
          <p className="capitalize text-gray-700">{request.priority}</p>
        </div>
      </div>
      
      {request.notes && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
          <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.notes}</p>
        </div>
      )}
      
      {/* Status Timeline */}
      <div className="mt-8 mb-6">
        <h3 className="text-lg font-semibold mb-4">Status Updates</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
          
          {Object.values(REQUEST_STATUS).map((status, index) => {
            const isActive = Object.values(REQUEST_STATUS).indexOf(normalizedStatus) >= index;
            const isPassed = Object.values(REQUEST_STATUS).indexOf(normalizedStatus) > index;
            
            return (
              <div key={status} className={`relative flex items-start mb-6 ${isActive ? '' : 'opacity-40'}`}>
                <div className={`absolute left-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center z-10 
                  ${isPassed ? 'bg-green-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  {isPassed ? '✓' : index + 1}
                </div>
                <div className="ml-12">
                  <h4 className={`text-md font-semibold capitalize ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {status ? status.replace('_', ' ') : ''}
                  </h4>
                  <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                    {getStatusMessage(status)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-8 border-t pt-6 flex justify-end">
        {request.status === REQUEST_STATUS.PENDING && (
          <button
            onClick={cancelRequest}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
};

export default AidRequestTracker;