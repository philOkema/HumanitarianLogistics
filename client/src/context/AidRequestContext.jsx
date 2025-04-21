import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './UserContext';
import { useToast } from '@/hooks/use-toast';

// Define aid request status constants
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  READY_FOR_PICKUP: 'ready_for_pickup',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  DENIED: 'denied',
  CANCELLED: 'cancelled'
};

// Create context
const AidRequestContext = createContext();

export function AidRequestProvider({ children }) {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [aidRequests, setAidRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Function to set up WebSocket connection for real-time updates
  const setupWebSocket = useCallback(() => {
    // Close any existing connection
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }

    // Create a new WebSocket connection
    const ws = new WebSocket('ws://localhost:3000/ws');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'aid_request_updated') {
          // When we receive a WebSocket notification about aid requests updates,
          // refresh our data
          fetchAidRequests();
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          setupWebSocket();
        }
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Don't try to reconnect immediately on error, let the onclose handler do it
    };

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Function to fetch aid requests from the API
  const fetchAidRequests = useCallback(async () => {
    if (!user) {
      setAidRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch aid requests from the API
      const response = await fetch('/api/aid-requests', {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setAidRequests(data.requests || []);
      setLastUpdate(new Date());
      
      // Cache the requests
      localStorage.setItem('aidRequests', JSON.stringify(data.requests || []));
    } catch (err) {
      console.error('Error fetching aid requests:', err);
      setError('Failed to load aid requests. Please try again later.');
      
      // If API fails, fall back to any cached data
      try {
        const cachedRequests = JSON.parse(localStorage.getItem('aidRequests'));
        if (cachedRequests && Array.isArray(cachedRequests)) {
          setAidRequests(cachedRequests);
        }
      } catch (cacheErr) {
        console.error('Error reading cached requests:', cacheErr);
        setAidRequests([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial data fetch and WebSocket setup
  useEffect(() => {
    fetchAidRequests();
    if (user) {
      setupWebSocket();
    }
  }, [fetchAidRequests, user]);

  // Reconnect WebSocket when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          (!socket || socket.readyState !== WebSocket.OPEN)) {
        setupWebSocket();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setupWebSocket]);

  // Function to get a specific aid request by ID
  const getAidRequestById = useCallback(async (id) => {
    // First check if we have it in local state
    const cachedRequest = aidRequests.find(request => request.id === parseInt(id));
    if (cachedRequest) return cachedRequest;
    
    // If not, fetch it from the API
    try {
      const response = await fetch(`/api/aid-requests/${id}`);
      if (!response.ok) throw new Error('Request not found');
      
      const data = await response.json();
      return data.request;
    } catch (err) {
      console.error('Error fetching aid request:', err);
      return null;
    }
  }, [aidRequests]);

  // Function to create a new aid request
  const createAidRequest = useCallback(async (requestData) => {
    try {
      // Make the API call to create a new request
      const response = await fetch('/api/aid-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create aid request');
      }
      
      const data = await response.json();
      
      // Update the local state with the new request
      setAidRequests(prevRequests => [...prevRequests, data.request]);
      setLastUpdate(new Date());
      
      return {
        success: true,
        request: data.request
      };
    } catch (err) {
      console.error('Error creating aid request:', err);
      return {
        success: false,
        error: err.message || 'Failed to create aid request. Please try again.'
      };
    }
  }, []);

  // Function to update an aid request
  const updateAidRequest = useCallback(async (requestId, updateData) => {
    try {
      // Currently, the API doesn't support full updates, just status updates
      // This is a placeholder for future implementation
      console.warn('Full aid request updates not implemented in API yet');
      
      // Update the request status if that's what we're updating
      if (updateData.status) {
        return await updateRequestStatus(requestId, updateData.status);
      }
      
      return {
        success: false,
        error: 'Full request updates not implemented'
      };
    } catch (err) {
      console.error('Error updating aid request:', err);
      return {
        success: false,
        error: err.message || 'Failed to update aid request. Please try again.'
      };
    }
  }, []);

  // Function specifically for updating the status of a request
  const updateRequestStatus = useCallback(async (requestId, newStatus) => {
    try {
      // Make the API call to update the request status
      const response = await fetch(`/api/aid-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update request status');
      }
      
      const data = await response.json();
      
      // Update the local state
      setAidRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === parseInt(requestId) ? data.request : request
        )
      );
      setLastUpdate(new Date());
      
      return {
        success: true,
        request: data.request
      };
    } catch (err) {
      console.error('Error updating request status:', err);
      return {
        success: false,
        error: err.message || 'Failed to update request status. Please try again.'
      };
    }
  }, []);

  // Function to delete an aid request (typically only for admin users)
  const deleteAidRequest = useCallback(async (requestId) => {
    // Currently, the API doesn't support deleting requests
    // This is a placeholder for future implementation
    console.warn('Delete aid request not implemented in API yet');
    
    return {
      success: false,
      error: 'Delete requests not implemented'
    };
  }, []);

  // Function to get requests by beneficiary ID
  const getRequestsByBeneficiary = useCallback((beneficiaryId) => {
    return aidRequests.filter(request => request.userId === beneficiaryId);
  }, [aidRequests]);

  // Function to get requests by status
  const getRequestsByStatus = useCallback((status) => {
    return aidRequests.filter(request => request.status === status);
  }, [aidRequests]);

  // Check if current user can manage aid requests
  const canManageRequests = useCallback(() => {
    if (!user) return false;
    return ['admin', 'staff'].includes(user.role);
  }, [user]);

  // Provide context value
  const contextValue = {
    aidRequests,
    loading,
    error,
    lastUpdate,
    getAidRequestById,
    createAidRequest,
    updateAidRequest,
    updateRequestStatus,
    deleteAidRequest,
    getRequestsByBeneficiary,
    getRequestsByStatus,
    canManageRequests,
    refresh: fetchAidRequests,
    socket,
    isConnected
  };

  return (
    <AidRequestContext.Provider value={contextValue}>
      {children}
    </AidRequestContext.Provider>
  );
}

// Custom hook to use the AidRequest context
export function useAidRequest() {
  const context = useContext(AidRequestContext);
  
  if (!context) {
    throw new Error('useAidRequest must be used within an AidRequestProvider');
  }
  
  return context;
}