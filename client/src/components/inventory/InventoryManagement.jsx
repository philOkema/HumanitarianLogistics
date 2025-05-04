import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import ItemScanner from './ItemScanner';
import ItemHistory from './ItemHistory';

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
    locationId: '',
    expiryDate: '',
    threshold: 0
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchOperation, setBatchOperation] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

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
    if (!item.locationId.trim()) newErrors.locationId = 'Location is required';
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
        locationId: '',
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

  const handleScan = (decodedText) => {
    try {
      const itemData = JSON.parse(decodedText);
      setNewItem(prev => ({
        ...prev,
        ...itemData
      }));
      setIsFormOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid QR code format',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = (imageData) => {
    setNewItem(prev => ({
      ...prev,
      imageUrl: imageData
    }));
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleBatchOperation = async (operation) => {
    if (selectedItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select items first',
        variant: 'destructive'
      });
      return;
    }

    setBatchOperation(operation);
    setIsBatchMode(true);
  };

  const executeBatchOperation = async () => {
    try {
      switch (batchOperation) {
        case 'delete':
          await Promise.all(selectedItems.map(id => removeInventoryItem(id)));
          toast({
            title: 'Success',
            description: 'Selected items deleted successfully'
          });
          break;
        case 'export':
          const itemsToExport = inventory.filter(item => selectedItems.includes(item.id));
          const csv = convertToCSV(itemsToExport);
          downloadCSV(csv, 'inventory-export.csv');
          toast({
            title: 'Success',
            description: 'Items exported successfully'
          });
          break;
        default:
          break;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform batch operation',
        variant: 'destructive'
      });
    } finally {
      setSelectedItems([]);
      setIsBatchMode(false);
      setBatchOperation(null);
    }
  };

  const convertToCSV = (items) => {
    const headers = ['ID', 'Name', 'Category', 'Quantity', 'Unit', 'Location', 'Expiry Date', 'Threshold'];
    const rows = items.map(item => [
      item.id,
      item.name,
      item.category,
      item.quantity,
      item.unit,
      item.location,
      item.expiryDate || 'N/A',
      item.threshold
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewHistory = (item) => {
    setSelectedItemHistory(item);
    setShowHistory(true);
  };

  // Utility to convert Firestore timestamp to JS Date
  function toDate(ts) {
    if (!ts) return null;
    if (ts instanceof Date) return ts;
    if (typeof ts === 'object' && ts.seconds) {
      return new Date(ts.seconds * 1000);
    }
    return new Date(ts);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`px-4 py-2 rounded-lg ${
                showLowStock 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Low Stock Items
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {showScanner ? 'Hide Scanner' : 'Show Scanner'}
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Add New Item
            </button>
          </div>
        </div>

        {showScanner && (
          <div className="mt-4">
            <ItemScanner onScan={handleScan} onImageUpload={handleImageUpload} />
          </div>
        )}

        {isBatchMode && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">
                  {selectedItems.length} items selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBatchOperation('export')}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Export Selected
                </button>
                <button
                  onClick={() => handleBatchOperation('delete')}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedItems([]);
                    setIsBatchMode(false);
                    setBatchOperation(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isBatchMode && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredInventory.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredInventory.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                )}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSortOrder('name')}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSortOrder('category')}
                >
                  Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSortOrder('quantity')}
                >
                  Quantity {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSortOrder('locationId')}
                >
                  Location {sortBy === 'locationId' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSortOrder('expiryDate')}
                >
                  Expiry Date {sortBy === 'expiryDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {isBatchMode && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="h-10 w-10 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.quantity}</div>
                    {item.quantity <= item.threshold && (
                      <div className="text-xs text-red-600">Below threshold</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.expiryDate ? (
                      <div className={`text-sm ${
                        toDate(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}>
                        {toDate(item.expiryDate)?.toLocaleDateString() || 'N/A'}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">N/A</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewHistory(item)}
                      className="text-gray-600 hover:text-gray-800 mr-3"
                    >
                      History
                    </button>
                    <button
                      onClick={() => {
                        setEditItem(item);
                        setIsEditDialogOpen(true);
                      }}
                      className="text-primary hover:text-primary/80 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Operation Confirmation Dialog */}
      <Dialog open={isBatchMode && batchOperation !== null} onOpenChange={() => setIsBatchMode(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>
            Confirm {batchOperation === 'delete' ? 'Delete' : 'Export'} Operation
          </DialogTitle>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to {batchOperation} {selectedItems.length} selected items?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsBatchMode(false);
                setBatchOperation(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={executeBatchOperation}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                batchOperation === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              Confirm
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Add New Item</DialogTitle>
          <div className="grid gap-2 py-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <input
                  id="name"
                  name="name"
                  value={newItem.name}
                  onChange={handleNewItemChange}
                  className="w-full px-2 py-1 border rounded-md text-sm"
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <input
                  id="category"
                  name="category"
                  value={newItem.category}
                  onChange={handleNewItemChange}
                  className="w-full px-2 py-1 border rounded-md text-sm"
                />
                {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={handleNewItemChange}
                  className="w-full px-2 py-1 border rounded-md text-sm"
                />
                {errors.quantity && <p className="text-xs text-red-600">{errors.quantity}</p>}
              </div>
              <div>
                <label htmlFor="unit" className="text-sm font-medium">Unit</label>
                <input
                  id="unit"
                  name="unit"
                  value={newItem.unit}
                  onChange={handleNewItemChange}
                  className="w-full px-2 py-1 border rounded-md text-sm"
                />
                {errors.unit && <p className="text-xs text-red-600">{errors.unit}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="locationId" className="text-sm font-medium">Location</label>
                <input
                  id="locationId"
                  name="locationId"
                  value={newItem.locationId}
                  onChange={handleNewItemChange}
                  className="w-full px-2 py-1 border rounded-md text-sm"
                />
                {errors.locationId && <p className="text-xs text-red-600">{errors.locationId}</p>}
              </div>
              <div>
                <label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</label>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={newItem.expiryDate}
                  onChange={handleNewItemChange}
                  className="w-full px-2 py-1 border rounded-md text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="threshold" className="text-sm font-medium">Low Stock Threshold</label>
              <input
                id="threshold"
                name="threshold"
                type="number"
                value={newItem.threshold}
                onChange={handleNewItemChange}
                className="w-full px-2 py-1 border rounded-md text-sm"
              />
              {errors.threshold && <p className="text-xs text-red-600">{errors.threshold}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 border-t pt-4">
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddItem}
              style={{ backgroundColor: '#2563eb', color: 'white', border: '2px solid #1d4ed8' }}
              className="px-4 py-2 text-sm font-bold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Item
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogTitle className="text-lg">Edit Item</DialogTitle>
          {editItem && (
            <div className="grid gap-2 py-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <label htmlFor="edit-name" className="text-xs font-medium">Name</label>
                  <input
                    id="edit-name"
                    name="name"
                    value={editItem.name}
                    onChange={handleEditItemChange}
                    className="px-2 py-1 border rounded-md text-sm"
                  />
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>
                <div className="grid gap-1">
                  <label htmlFor="edit-category" className="text-xs font-medium">Category</label>
                  <input
                    id="edit-category"
                    name="category"
                    value={editItem.category}
                    onChange={handleEditItemChange}
                    className="px-2 py-1 border rounded-md text-sm"
                  />
                  {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <label htmlFor="edit-quantity" className="text-xs font-medium">Quantity</label>
                  <input
                    id="edit-quantity"
                    name="quantity"
                    type="number"
                    value={editItem.quantity}
                    onChange={handleEditItemChange}
                    className="px-2 py-1 border rounded-md text-sm"
                  />
                  {errors.quantity && <p className="text-xs text-red-600">{errors.quantity}</p>}
                </div>
                <div className="grid gap-1">
                  <label htmlFor="edit-unit" className="text-xs font-medium">Unit</label>
                  <input
                    id="edit-unit"
                    name="unit"
                    value={editItem.unit}
                    onChange={handleEditItemChange}
                    className="px-2 py-1 border rounded-md text-sm"
                  />
                  {errors.unit && <p className="text-xs text-red-600">{errors.unit}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <label htmlFor="edit-locationId" className="text-xs font-medium">Location</label>
                  <input
                    id="edit-locationId"
                    name="locationId"
                    value={editItem.locationId}
                    onChange={handleEditItemChange}
                    className="px-2 py-1 border rounded-md text-sm"
                  />
                  {errors.locationId && <p className="text-xs text-red-600">{errors.locationId}</p>}
                </div>
                <div className="grid gap-1">
                  <label htmlFor="edit-expiryDate" className="text-xs font-medium">Expiry Date</label>
                  <input
                    id="edit-expiryDate"
                    name="expiryDate"
                    type="date"
                    value={editItem.expiryDate}
                    onChange={handleEditItemChange}
                    className="px-2 py-1 border rounded-md text-sm"
                  />
                </div>
              </div>
              <div className="grid gap-1">
                <label htmlFor="edit-threshold" className="text-xs font-medium">Low Stock Threshold</label>
                <input
                  id="edit-threshold"
                  name="threshold"
                  type="number"
                  value={editItem.threshold}
                  onChange={handleEditItemChange}
                  className="px-2 py-1 border rounded-md text-sm"
                />
                {errors.threshold && <p className="text-xs text-red-600">{errors.threshold}</p>}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsEditDialogOpen(false)}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateItem}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Save Changes
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            Item History - {selectedItemHistory?.name}
          </DialogTitle>
          <div className="py-4">
            <ItemHistory history={selectedItemHistory?.history || []} />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowHistory(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;