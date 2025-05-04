import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './UserContext';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

// Create context
const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const { currentUser } = useUser();
  const { toast } = useToast();
  
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [aidItems, setAidItems] = useState([]);
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
        if (data.type === 'inventory_updated') {
          // When we receive a WebSocket notification about inventory updates,
          // refresh our data
          fetchInventory();
          fetchAidItems();
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

  // Function to fetch inventory from the API
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch inventory from the API
      const response = await fetch('/api/inventory');
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setInventory(data.items || []);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory. Please try again later.');
      
      // If API fails, fall back to any cached data
      const cachedInventory = JSON.parse(localStorage.getItem('inventory')) || [];
      if (cachedInventory.length > 0) {
        setInventory(cachedInventory);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch aid items (predefined aid items that can be requested)
  const fetchAidItems = useCallback(async () => {
    try {
      const response = await fetch('/api/aid-items');
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setAidItems(data.items || []);
    } catch (err) {
      console.error('Error fetching aid items:', err);
      // No need to show an error for this, as it's supplementary to the main inventory
    }
  }, []);

  // Initial data fetch and WebSocket setup
  useEffect(() => {
    fetchInventory();
    fetchAidItems();
    setupWebSocket();
  }, [fetchInventory, fetchAidItems, setupWebSocket]);

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

  // Function to get a specific inventory item by ID
  const getInventoryItem = useCallback(async (id) => {
    // First check if we have it in local state
    const cachedItem = inventory.find(item => item.id === parseInt(id));
    if (cachedItem) return cachedItem;
    
    // If not, fetch it from the API
    try {
      const response = await fetch(`/api/inventory/${id}`);
      if (!response.ok) throw new Error('Item not found');
      
      const data = await response.json();
      return data.item;
    } catch (err) {
      console.error('Error fetching inventory item:', err);
      return null;
    }
  }, [inventory]);

  // Function to add a new inventory item
  const addInventoryItem = useCallback(async (itemData) => {
    try {
      // Add history entry
      const historyEntry = {
        action: 'create',
        timestamp: new Date().toISOString(),
        change: itemData,
        user: currentUser
      };

      // Get Firebase ID token
      let token = null;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      // Make the API call to create a new inventory item
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...itemData,
          // Ensure locationId is included if it's not already in itemData
          locationId: itemData.locationId || itemData.location || '',
          history: [historyEntry]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create inventory item');
      }
      
      const data = await response.json();
      
      // Update the local state with the new item
      setInventory(prevInventory => [...prevInventory, data.item]);
      setLastUpdate(new Date());
      
      return {
        success: true,
        item: data.item
      };
    } catch (err) {
      console.error('Error adding inventory item:', err);
      return {
        success: false,
        error: err.message || 'Failed to add inventory item. Please try again.'
      };
    }
  }, [currentUser]);

  // Function to update an inventory item
  const updateInventoryItem = useCallback(async (itemId, updateData) => {
    try {
      // Get the current item
      const currentItem = inventory.find(item => String(item.id) === String(itemId));
      
      if (!currentItem) {
        throw new Error('Item not found');
      }

      // Create history entry for changes
      const changes = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== currentItem[key]) {
          changes[key] = {
            from: currentItem[key],
            to: updateData[key]
          };
        }
      });

      const historyEntry = {
        action: 'update',
        timestamp: new Date().toISOString(),
        change: changes,
        user: currentUser
      };

      // Get Firebase ID token
      let token = null;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      // Make the API call to update the inventory item
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...updateData,
          history: [...(currentItem.history || []), historyEntry]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update inventory item');
      }
      
      const data = await response.json();
      
      // Update the local state
      setInventory(prevInventory => 
        prevInventory.map(item => 
          String(item.id) === String(itemId) ? data.item : item
        )
      );
      setLastUpdate(new Date());
      
      return {
        success: true,
        item: data.item
      };
    } catch (err) {
      console.error('Error updating inventory item:', err);
      return {
        success: false,
        error: err.message || 'Failed to update inventory item. Please try again.'
      };
    }
  }, [inventory, currentUser]);

  // Function to remove an inventory item
  const removeInventoryItem = useCallback(async (itemId) => {
    try {
      console.log('removeInventoryItem called with itemId:', itemId);
      console.log('Current inventory:', inventory);
      // Get the current item
      const currentItem = inventory.find(item => String(item.id) === String(itemId));
      
      if (!currentItem) {
        throw new Error('Item not found');
      }

      // Create history entry for deletion
      const historyEntry = {
        action: 'delete',
        timestamp: new Date().toISOString(),
        change: 'Item deleted',
        user: currentUser
      };

      // Get Firebase ID token
      let token = null;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      // Make the API call to delete the inventory item
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          history: [...(currentItem.history || []), historyEntry]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete inventory item');
      }
      
      // Update the local state
      setInventory(prevInventory => 
        prevInventory.filter(item => String(item.id) !== String(itemId))
      );
      setLastUpdate(new Date());
      
      return {
        success: true
      };
    } catch (err) {
      console.error('Error removing inventory item:', err);
      return {
        success: false,
        error: err.message || 'Failed to remove inventory item. Please try again.'
      };
    }
  }, [inventory, currentUser]);

  // Function to adjust inventory quantity (for distributions, donations, etc.)
  const adjustQuantity = useCallback(async (itemId, quantityChange, reason) => {
    try {
      // Get the current item
      const currentItem = inventory.find(item => item.id === parseInt(itemId));
      
      if (!currentItem) {
        throw new Error('Item not found');
      }

      const newQuantity = currentItem.quantity + quantityChange;
      
      if (newQuantity < 0) {
        throw new Error('Insufficient quantity available');
      }

      // Create history entry for quantity adjustment
      const historyEntry = {
        action: 'adjust',
        timestamp: new Date().toISOString(),
        change: {
          quantity: {
            from: currentItem.quantity,
            to: newQuantity,
            change: quantityChange
          },
          reason
        },
        user: currentUser
      };

      // Update the item via the API
      return await updateInventoryItem(itemId, {
        quantity: newQuantity,
        history: [...(currentItem.history || []), historyEntry]
      });
    } catch (err) {
      console.error('Error adjusting inventory quantity:', err);
      return {
        success: false,
        error: err.message || 'Failed to adjust inventory quantity. Please try again.'
      };
    }
  }, [inventory, currentUser, updateInventoryItem]);

  // Function to get inventory items by category
  const getItemsByCategory = useCallback((category) => {
    return inventory.filter(item => item.category === category);
  }, [inventory]);

  // Function to get inventory items by location
  const getItemsByLocation = useCallback((location) => {
    return inventory.filter(item => item.locationId === location);
  }, [inventory]);

  // Function to get inventory items that are below their threshold
  const getItemsBelowThreshold = useCallback(() => {
    // Assuming we have a threshold field, if not, we'd implement another way
    return inventory.filter(item => item.quantity < 10); // default threshold
  }, [inventory]);

  // Function to get expiring items
  const getExpiringItems = useCallback((daysThreshold = 30) => {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    
    return inventory.filter(item => 
      item.expiryDate && new Date(item.expiryDate) <= thresholdDate
    );
  }, [inventory]);

  // Check if current user can manage inventory
  const canManageInventory = useCallback(() => {
    if (!currentUser) return false;
    return ['admin', 'staff'].includes(currentUser.role);
  }, [currentUser]);

  // Provide context value
  const contextValue = {
    inventory,
    aidItems,
    loading,
    error,
    lastUpdate,
    getInventoryItem,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    adjustQuantity,
    getItemsByCategory,
    getItemsByLocation,
    getItemsBelowThreshold,
    getExpiringItems,
    canManageInventory,
    refresh: fetchInventory,
    socket,
    isConnected
  };

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};

// Custom hook to use the Inventory context
export function useInventory() {
  const context = useContext(InventoryContext);
  
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  
  return context;
}