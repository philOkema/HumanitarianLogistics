import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';
import { useInventory } from './InventoryContext';
import { useAidRequest, REQUEST_STATUS } from './AidRequestContext';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

// Define distribution status constants (unified with aid request statuses)
export const DISTRIBUTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  DENIED: 'denied',
  CANCELLED: 'cancelled'
};

// Create context
const DistributionContext = createContext();

export const DistributionProvider = ({ children }) => {
  const { currentUser } = useUser();
  const { inventory, adjustQuantity } = useInventory();
  const { updateRequestStatus } = useAidRequest();
  const { toast } = useToast();
  
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Function to fetch distributions from the backend API
  const fetchDistributions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/distributions');
      if (!response.ok) throw new Error('Failed to fetch distributions');
      const data = await response.json();
      setDistributions(data.distributions || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching distributions:', err);
      setError('Failed to load distributions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch (no polling)
  useEffect(() => {
    fetchDistributions();
  }, [fetchDistributions]);

  // Function to get a specific distribution by ID (string)
  const getDistributionById = useCallback((id) => {
    return distributions.find(dist => dist.id === id);
  }, [distributions]);

  // Function to get distributions by request ID (string)
  const getDistributionsByRequestId = useCallback((requestId) => {
    return distributions.filter(dist => dist.requestId === requestId);
  }, [distributions]);

  // Function to create a new distribution using the API
  const createDistribution = useCallback(async (distributionData) => {
    try {
      // Get the authentication token
      let token = null;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
      // Validate that there's enough inventory
      const insufficientItems = distributionData.items.filter(item => {
        const inventoryItem = inventory.find(invItem => invItem.id === item.itemId);
        return !inventoryItem || inventoryItem.quantity < item.quantity;
      });
      if (insufficientItems.length > 0) {
        const itemNames = insufficientItems.map(item => item.name).join(', ');
        return {
          success: false,
          error: `Insufficient inventory for: ${itemNames}`
        };
      }
      const response = await fetch('/api/distributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(distributionData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create distribution');
      }
      const data = await response.json();
      setDistributions(prev => [...prev, data.distribution]);
      setLastUpdate(new Date());
      // Update the request status to IN_PROGRESS
      await updateRequestStatus(distributionData.requestId, REQUEST_STATUS.IN_PROGRESS);
      // Adjust inventory quantities (reserve the items)
      distributionData.items.forEach(item => {
        adjustQuantity(
          item.itemId,
          -item.quantity,
          `Reserved for distribution #${data.distribution.id}`
        );
      });
      return {
        success: true,
        distribution: data.distribution
      };
    } catch (err) {
      console.error('Error creating distribution:', err);
      return {
        success: false,
        error: err.message || 'Failed to create distribution. Please try again.'
      };
    }
  }, [inventory, updateRequestStatus, adjustQuantity]);

  // Function to update distribution status using the API
  const updateDistributionStatus = useCallback(async (distributionId, newStatus) => {
    try {
      const response = await fetch(`/api/distributions/${distributionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update distribution status');
      }
      const data = await response.json();
      setDistributions(prev => prev.map(dist => dist.id === distributionId ? data.distribution : dist));
      setLastUpdate(new Date());
      // Update the request status based on distribution status
      let requestStatus;
      switch (newStatus) {
        case DISTRIBUTION_STATUS.APPROVED:
          requestStatus = REQUEST_STATUS.APPROVED;
          break;
        case DISTRIBUTION_STATUS.IN_PROGRESS:
          requestStatus = REQUEST_STATUS.IN_PROGRESS;
          break;
        case DISTRIBUTION_STATUS.IN_TRANSIT:
          requestStatus = REQUEST_STATUS.IN_TRANSIT;
          break;
        case DISTRIBUTION_STATUS.DELIVERED:
          requestStatus = REQUEST_STATUS.DELIVERED;
          break;
        case DISTRIBUTION_STATUS.DENIED:
          requestStatus = REQUEST_STATUS.DENIED;
          break;
        case DISTRIBUTION_STATUS.CANCELLED:
          requestStatus = REQUEST_STATUS.CANCELLED;
          break;
        default:
          requestStatus = null;
      }
      if (requestStatus) {
        await updateRequestStatus(data.distribution.requestId, requestStatus);
      }
      return {
        success: true,
        distribution: data.distribution
      };
    } catch (err) {
      console.error('Error updating distribution status:', err);
      return {
        success: false,
        error: err.message || 'Failed to update distribution status. Please try again.'
      };
    }
  }, [updateRequestStatus]);

  // Function to cancel a distribution using the API
  const cancelDistribution = useCallback(async (distributionId) => {
    try {
      // Set status to CANCELLED using the update API
      const result = await updateDistributionStatus(distributionId, DISTRIBUTION_STATUS.CANCELLED);
      if (result.success) {
        // Optionally, adjust inventory if needed (if not delivered)
        const cancelledDist = result.distribution;
        if (cancelledDist.status !== DISTRIBUTION_STATUS.DELIVERED && cancelledDist.items) {
          cancelledDist.items.forEach(item => {
            adjustQuantity(
              item.itemId,
              item.quantity,
              `Returned from cancelled distribution #${distributionId}`
            );
          });
        }
      }
      return result;
    } catch (err) {
      console.error('Error cancelling distribution:', err);
      return {
        success: false,
        error: err.message || 'Failed to cancel distribution. Please try again.'
      };
    }
  }, [updateDistributionStatus, adjustQuantity]);

  // Function to get distributions by status
  const getDistributionsByStatus = useCallback((status) => {
    return distributions.filter(dist => dist.status === status);
  }, [distributions]);

  // Check if user can create distributions
  const canCreateDistribution = useCallback(() => {
    if (!currentUser) return false;
    return ['admin', 'staff'].includes(currentUser.role);
  }, [currentUser]);

  // Provide context value
  const contextValue = {
    distributions,
    loading,
    error,
    lastUpdate,
    getDistributionById,
    getDistributionsByRequestId,
    getDistributionsByStatus,
    createDistribution,
    updateDistributionStatus,
    cancelDistribution,
    canCreateDistribution,
    refresh: fetchDistributions
  };

  return (
    <DistributionContext.Provider value={contextValue}>
      {children}
    </DistributionContext.Provider>
  );
};

// Custom hook to use the Distribution context
export const useDistribution = () => {
  const context = useContext(DistributionContext);
  
  if (!context) {
    throw new Error('useDistribution must be used within a DistributionProvider');
  }
  
  return context;
};