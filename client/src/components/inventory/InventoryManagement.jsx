import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const InventoryManagement = () => {
  const { user } = useAuth();
  const { 
    inventory, 
    loading,
    error,
    lastUpdate, 
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    getItemsBelowThreshold,
    canManageInventory
  } = useInventory();
  
  const isAdminOrWorker = user && ['admin', 'worker'].includes(user.role);
  const { toast } = useToast();
  
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showLowStock, setShowLowStock] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    location: '',
    expiryDate: '',
    threshold: 0
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});

  // Extract unique categories and locations from inventory
  useEffect(() => {
    if (inventory.length > 0) {
      const uniqueCategories = [...new Set(inventory.map(item => item.category))];
      const uniqueLocations = [...new Set(inventory.map(item => item.location))];
      
      setCategories(uniqueCategories);
      setLocations(uniqueLocations);
    }
  }, [inventory]);

  // Filter, search and sort inventory items
  useEffect(() => {
    let result = [...inventory];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term)
      );
    }
    
    // Apply low stock filter
    if (showLowStock) {    
      result = result.filter(item => item.quantity <= item.threshold);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle date sorting
      if (sortBy === 'lastUpdated' || sortBy === 'expiryDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredInventory(result);
  }, [inventory, categoryFilter, searchTerm, showLowStock, sortBy, sortOrder]);

  const toggleSortOrder = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'quantity' || name === 'threshold' ? parseInt(value) : value
    });
  };

  const handleEditItemChange = (e) => {
    const { name, value } = e.target;
    setEditItem({
      ...editItem,
      [name]: name === 'quantity' || name === 'threshold' ? parseInt(value) : value
    });
  };

  const validateForm = (item) => {
    const newErrors = {};
    
    if (!item.name.trim()) newErrors.name = 'Name is required';
    if (!item.category.trim()) newErrors.category = 'Category is required';
    if (!item.unit.trim()) newErrors.unit = 'Unit is required';
    if (!item.location.trim()) newErrors.location = 'Location is required';
    if (item.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (item.threshold < 0) newErrors.threshold = 'Threshold cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = async () => {
    if (!validateForm(newItem)) return;
    
    const result = await addInventoryItem(newItem);    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Item added successfully',
      });
      setIsFormOpen(false);
      setNewItem({
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        location: '',
        expiryDate: '',
        threshold: 0
      });
    } else {      
      toast({
        title: 'Error',
        description: result.error || 'Failed to add item',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!validateForm(editItem)) return;
    
    const result = await updateInventoryItem(editItem.id, editItem);    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
      setIsEditDialogOpen(false);
      setEditItem(null);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update item',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await removeInventoryItem(itemId);
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete item',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Your existing JSX */}
    </div>
  );
};

export default InventoryManagement;