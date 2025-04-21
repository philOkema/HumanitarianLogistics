import React, { useState, useEffect, useCallback } from 'react';
import { useDistribution } from '../../context/DistributionContext';
import { useAidRequest } from '../../context/AidRequestContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useInventory } from '../../context/InventoryContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '@/hooks/use-toast';

// Define distribution status constants
export const DISTRIBUTION_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const DistributionManagement = () => {
  const { 
    distributions, 
    loading, 
    error,
    lastUpdate,
    createDistribution,
    updateDistributionStatus,
    cancelDistribution
  } = useDistribution();
  const [editingDistributionId, setEditingDistributionId] = useState(null);
  
  const { aidRequests, getAidRequestById } = useAidRequest();
  const { inventory, getInventoryItem } = useInventory();
  const { currentUser, canCreateDistribution, canUpdateDistribution } = useUser();
  const { toast } = useToast();
  
  const [filteredDistributions, setFilteredDistributions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [distributionDetails, setDistributionDetails] = useState({
    id: null,
    deliveryDetails: {
      method: 'pickup',
      assignedTo: '',
      estimatedDelivery: '',
      pickupLocation: '',
      notes: ''
    },
    items: []
  });
  const [errors, setErrors] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  
  // Load pending requests for distribution creation
  useEffect(() => {
    // Find approved requests that don't have distributions yet
    const approvedRequests = aidRequests.filter(request => 
      request.status === 'approved' && 
      !distributions.some(dist => dist.requestId === request.id)
    );
    
    setPendingRequests(approvedRequests);
  }, [aidRequests, distributions]);

  // Filter, search and sort distributions
  useEffect(() => {
    let result = [...distributions];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(dist => dist.status === statusFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(dist => {
        const request = getAidRequestById(dist.requestId);
        return (
          dist.id.toString().includes(term) ||
          dist.assignedTo.toLowerCase().includes(term) ||
          (request && request.location.toLowerCase().includes(term)) ||
          (dist.notes && dist.notes.toLowerCase().includes(term))
        );
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'createdAt' || sortBy === 'estimatedDelivery') {
        aValue = new Date(a[sortBy]).getTime();
        bValue = new Date(b[sortBy]).getTime();
      } else if (sortBy === 'status') {
        aValue = a.status;
        bValue = b.status;
      } else if (sortBy === 'requestId') {
        aValue = a.requestId;
        bValue = b.requestId;
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredDistributions(result);
  }, [distributions, statusFilter, searchTerm, sortBy, sortOrder, getAidRequestById]);

  const handleRequestSelect = (requestId) => {
    const request = aidRequests.find(req => req.id === parseInt(requestId));
    setSelectedRequest(request);
  };

  const handleDistributionDetailsChange = (e) => {
    const { name, value } = e.target;
    setDistributionDetails((prev) => ({...prev, deliveryDetails: {...prev.deliveryDetails, [name]: value}}));
  };

  const validateForm = () => {
    const newErrors = {};
    console.log(distributionDetails.deliveryDetails);
    if (!selectedRequest) {
      newErrors.request = 'Please select an aid request';
    }
    
    if (deliveryDetails.method === 'pickup' && !deliveryDetails.pickupLocation.trim()) {
      newErrors.pickupLocation = 'Pickup location is required';
    }
    const {deliveryDetails} = distributionDetails;
    if (deliveryDetails.method === 'delivery' && !deliveryDetails.assignedTo.trim() ) {
      newErrors.assignedTo = 'Delivery person is required';
    }

    if (deliveryDetails.method === 'delivery' && !deliveryDetails.estimatedDelivery) {
      newErrors.estimatedDelivery = 'Estimated delivery date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateDistribution = async () => {
    if (!validateForm()) return;
    
    const newDistribution = {
      requestId: selectedRequest.id,
      items: selectedRequest.items,
      status: DISTRIBUTION_STATUS.PENDING,
      ...distributionDetails.deliveryDetails
    };
    
    const result = await createDistribution(newDistribution);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Distribution created successfully.'
      });
      
      // Reset form
      setSelectedRequest(null);
      setDistributionDetails((prev) => {
        return {...prev, deliveryDetails: {
          method: 'pickup',
          assignedTo: '',
          estimatedDelivery: '',
          pickupLocation: '',
          notes: ''
        }};
      });
      setIsFormOpen(false);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to create distribution.',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStatus = async (distributionId, newStatus) => {
    const result = await updateDistributionStatus(distributionId, newStatus);
    
    if (result.success) {
      toast({
        title: 'Status Updated',
        description: `Distribution status updated to ${newStatus.replace('_', ' ')}.`
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update status.',
        variant: 'destructive'
      });
    }
  };

  const handleCancelDistribution = async (distributionId) => {
    if (!confirm('Are you sure you want to cancel this distribution?')) return;
    
    const result = await cancelDistribution(distributionId);
    
    if (result.success) {
      toast({
        title: 'Distribution Cancelled',
        description: 'Distribution has been cancelled successfully.'
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to cancel distribution.',
        variant: 'destructive'
      });
    }
  };

  const toggleSortOrder = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to descending for most fields
    }
  };
  const handleEditDistribution = (distribution) => {
    // Populate the form fields with the distribution data
    setDistributionDetails({
      id: distribution.id,
      deliveryDetails: {
        method: distribution.method,
        assignedTo: distribution.assignedTo || '',
        estimatedDelivery: distribution.estimatedDelivery ? distribution.estimatedDelivery : '',
        pickupLocation: distribution.pickupLocation || '',
        notes: distribution.notes || ''
      },
      items: distribution.items
    });
    setEditingDistributionId(distribution.id); // Set the editingDistributionId
    setIsEditFormOpen(true); // Open the edit form
    console.log(distribution);
  };
  const validateEditForm = () => {
    const newErrors = {};
    console.log(distributionDetails.deliveryDetails)
    if (distributionDetails.deliveryDetails.method === 'pickup' && !distributionDetails.deliveryDetails.pickupLocation.trim()) {
      newErrors.pickupLocation = 'Pickup location is required';
    }
    const {deliveryDetails} = distributionDetails;
    if (deliveryDetails.method === 'delivery' && !deliveryDetails.assignedTo.trim()) {
      newErrors.assignedTo = 'Delivery person is required';
    }

    if (deliveryDetails.method === 'delivery' && !deliveryDetails.estimatedDelivery) {
      newErrors.estimatedDelivery = 'Estimated delivery date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleUpdateDistribution = async () => {
    if (!validateEditForm()) return;
    
    const updatedDistribution = {
      id: distributionDetails.id,
      items: distributionDetails.items,
      ...distributionDetails.deliveryDetails
    };
    console.log(updatedDistribution);
    // const result = await updateDistribution(updatedDistribution);
    // if (result.success) {
    //   toast({
    //     title: 'Success',
    //     description: 'Distribution updated successfully.'
    //   });
      
    //   // Reset form
    //   setDistributionDetails({
    //     id: null,
    //     deliveryDetails: {
    //       method: 'pickup',
    //       assignedTo: '',
    //       estimatedDelivery: '',
    //       pickupLocation: '',
    //       notes: ''
    //     },
    //     items: []
    //   });
    //   setEditingDistributionId(null);
    //   setIsEditFormOpen(false);
    // } else {
    //   toast({
    //     title: 'Error',
    //     description: result.error || 'Failed to update distribution.',
    //     variant: 'destructive'
    //   });
    // }
  };
  const renderEditDistributionForm = () => {
    if (!editingDistributionId) return null;

    if(!canUpdateDistribution) return null;
    const { deliveryDetails } = distributionDetails;
    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
        <h3 className="text-lg font-semibold mb-4">Edit Distribution</h3>
        {/* Render form fields based on distributionDetails */}
        {/* ... */}
        {deliveryDetails.method === 'pickup' && (
          <Input type="text" name="pickupLocation" value={deliveryDetails.pickupLocation} onChange={handleDistributionDetailsChange} />
        )}
        {deliveryDetails.method === 'delivery' && (
          <>
            <Input type="text" name="assignedTo" value={deliveryDetails.assignedTo} onChange={handleDistributionDetailsChange} />
            <Input type="date" name="estimatedDelivery" value={deliveryDetails.estimatedDelivery} onChange={handleDistributionDetailsChange} />
          </>
        )}
         <div className="flex justify-end">
          <Button
            onClick={()=> handleUpdateDistribution()}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
          >
            Update Distribution
          </Button>
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case DISTRIBUTION_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case DISTRIBUTION_STATUS.PREPARING:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case DISTRIBUTION_STATUS.READY_FOR_PICKUP:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case DISTRIBUTION_STATUS.IN_TRANSIT:
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case DISTRIBUTION_STATUS.DELIVERED:
        return 'bg-green-100 text-green-800 border-green-300';
      case DISTRIBUTION_STATUS.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case DISTRIBUTION_STATUS.PENDING:
        return DISTRIBUTION_STATUS.PREPARING;
      case DISTRIBUTION_STATUS.PREPARING:
        return DISTRIBUTION_STATUS.READY_FOR_PICKUP;
      case DISTRIBUTION_STATUS.READY_FOR_PICKUP:
        return DISTRIBUTION_STATUS.IN_TRANSIT;
      case DISTRIBUTION_STATUS.IN_TRANSIT:
        return DISTRIBUTION_STATUS.DELIVERED;
      default:
        return null;
    }
  };

  const renderDistributionDetails = (distribution) => {
    const request = getAidRequestById(distribution.requestId);
    if (!request) return null;
    
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-md font-semibold mb-2">Request Details</h4>
            <p><span className="font-medium">Location:</span> {request.location}</p>
            <p><span className="font-medium">Priority:</span> {request.priority}</p>
            <p><span className="font-medium">Requested:</span> {new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-2">Distribution Details</h4>
            <p>
              <span className="font-medium">Method:</span> 
              {distribution.method === 'pickup' ? 'Pickup' : 'Delivery'}
            </p>
            {distribution.method === 'pickup' && (
              <p><span className="font-medium">Pickup Location:</span> {distribution.pickupLocation}</p>
            )}
            {distribution.method === 'delivery' && (
              <>
                <p><span className="font-medium">Assigned To:</span> {distribution.assignedTo}</p>
                <p>
                  <span className="font-medium">Estimated Delivery:</span> 
                  {new Date(distribution.estimatedDelivery).toLocaleDateString()}
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-md font-semibold mb-2">Items</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="py-2 px-3 font-semibold">Item</th>
                  <th className="py-2 px-3 font-semibold">Quantity</th>
                  <th className="py-2 px-3 font-semibold">Unit</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {distribution.items.map((item, index) => {
                  const inventoryItem = getInventoryItem(item.itemId);
                  const isAvailable = inventoryItem && inventoryItem.quantity >= item.quantity;
                  
                  return (
                    <tr key={index}>
                      <td className="py-2 px-3">{item.name}</td>
                      <td className="py-2 px-3">{item.quantity}</td>
                      <td className="py-2 px-3">{item.unit}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isAvailable ? 'Available' : 'Insufficient'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {distribution.notes && (
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Notes</h4>
            <p className="text-gray-700">{distribution.notes}</p>
          </div>
        )}
      </div>
    );
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
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Distribution Management</h2>
          {lastUpdate && (
            <p className="text-sm text-gray-500">
              Last updated: {new Date(lastUpdate).toLocaleString()}
            </p>
          )}
        </div>
        
        {currentUser && canCreateDistribution && (
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={pendingRequests.length === 0}
          >
            {isFormOpen ? 'Cancel' : '+ Create Distribution'}
          </button>
        )}
      </div>
      
      {/* Create Distribution Form */}
      {isFormOpen && currentUser && canCreateDistribution && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
          <h3 className="text-lg font-semibold mb-4">Create New Distribution</h3>
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No approved aid requests available for distribution.</p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requestId">
                  Select Aid Request *
                </label>
                <select
                  id="requestId"
                  value={selectedRequest ? selectedRequest.id : ''}
                  onChange={(e) => handleRequestSelect(e.target.value)}
                  className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors.request ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select a request</option>
                  {pendingRequests.map((request) => (
                    <option key={request.id} value={request.id}>
                      Request #{request.id} - {request.location} ({request.items.length} items)
                    </option>
                  ))}
                </select>
                {errors.request && <p className="text-red-500 text-xs italic">{errors.request}</p>}
              </div>
              
              {selectedRequest && (
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <h4 className="font-semibold text-blue-700 mb-2">Request Details</h4>
                  <p><span className="font-medium">Location:</span> {selectedRequest.location}</p>
                  <p><span className="font-medium">Priority:</span> {selectedRequest.priority}</p>
                  <p><span className="font-medium">Notes:</span> {selectedRequest.notes || 'None'}</p>
                  
                  <h5 className="font-semibold text-blue-700 mt-3 mb-2">Requested Items:</h5>
                  <ul className="list-disc pl-5">
                    {selectedRequest.items.map((item, index) => {
                      const inventoryItem = getInventoryItem(item.itemId);
                      const isAvailable = inventoryItem && inventoryItem.quantity >= item.quantity;
                      
                      return (
                        <li key={index} className={isAvailable ? 'text-green-700' : 'text-red-700'}>
                          {item.quantity} {item.unit} {item.name}
                          {!isAvailable && ' (Insufficient stock)'}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Distribution Method *
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="method-pickup"
                      name="method"
                      value="pickup"
                      checked={deliveryDetails.method === 'pickup'}
                      onChange={handleDistributionDetailsChange}
                      className="mr-2"
                    />
                    <label htmlFor="method-pickup">Pickup</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="method-delivery"
                      name="method"
                      value="delivery"
                      checked={deliveryDetails.method === 'delivery'}
                      onChange={handleDistributionDetailsChange}
                      className="mr-2"
                    />
                    <label htmlFor="method-delivery">Delivery</label>
                  </div>
                </div>
              </div>
              
              {deliveryDetails.method === 'pickup' ? (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pickupLocation">
                    Pickup Location *
                  </label>
                  <input
                    type="text"
                    id="pickupLocation"
                    name="pickupLocation"
                    value={deliveryDetails.pickupLocation}
                    onChange={handleDistributionDetailsChange}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors.pickupLocation ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter pickup location"
                  />
                  {errors.pickupLocation && (
                    <p className="text-red-500 text-xs italic">{errors.pickupLocation}</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assignedTo">
                      Assigned To *
                    </label>
                    <input
                      type="text"
                      id="assignedTo"
                      name="assignedTo"
                      value={deliveryDetails.assignedTo}
                      onChange={handleDistributionDetailsChange}
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.assignedTo ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter delivery person name"
                    />
                    {errors.assignedTo && (
                      <p className="text-red-500 text-xs italic">{errors.assignedTo}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="estimatedDelivery">
                      Estimated Delivery Date *
                    </label>
                    <input
                      type="date"
                      id="estimatedDelivery"
                      name="estimatedDelivery"
                      value={deliveryDetails.estimatedDelivery}
                      onChange={handleDistributionDetailsChange}
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        errors.estimatedDelivery ? 'border-red-500' : ''
                      }`}
                      min={new Date().toISOString().split('T')[0]} // Set min date to today
                    />
                    {errors.estimatedDelivery && (
                      <p className="text-red-500 text-xs italic">{errors.estimatedDelivery}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={deliveryDetails.notes}
                  onChange={handleDistributionDetailsChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  placeholder="Any additional notes about this distribution"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleCreateDistribution}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                  disabled={!selectedRequest}
                >
                  Create Distribution
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        {isEditFormOpen && renderEditDistributionForm()}
      {/* Filters Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="statusFilter">
            Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">All Statuses</option>
            {Object.values(DISTRIBUTION_STATUS).map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sortBy">
            Sort By
          </label>
          <div className="flex space-x-2">
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="createdAt">Created Date</option>
              <option value="estimatedDelivery">Estimated Delivery</option>
              <option value="requestId">Request ID</option>
              <option value="status">Status</option>
              <option value="method">Method</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-gray-200 hover:bg-gray-300 px-3 rounded"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search distributions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>
      
      {/* Distributions List */}
      {filteredDistributions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No distributions found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDistributions.map((distribution) => {
            const request = getAidRequestById(distribution.requestId);
            const nextStatus = getNextStatus(distribution.status);
            
            return (
              <div key={distribution.id} className="border rounded-lg overflow-hidden shadow">
                <div className="bg-gray-100 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Distribution #{distribution.id} - Request #{distribution.requestId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(distribution.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(distribution.status)}`}>
                      {distribution.status.replace('_', ' ')}
                    </span>
                    <span className={`text-sm ${distribution.method === 'pickup' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'} px-2 py-1 rounded-full`}>
                      {distribution.method === 'pickup' ? 'Pickup' : 'Delivery'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  {renderDistributionDetails(distribution)}
                  
                  {
                    distribution.status !== DISTRIBUTION_STATUS.DELIVERED && 
                    distribution.status !== DISTRIBUTION_STATUS.CANCELLED && 
                    currentUser && canUpdateDistribution &&
                    <Button onClick={() => handleEditDistribution(distribution)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Edit
                  </Button>}

                  <div className="mt-4 flex justify-end space-x-3">
                    {nextStatus && currentUser && canUpdateDistribution && (
                      <button
                        onClick={() => handleUpdateStatus(distribution.id, nextStatus)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Mark as {nextStatus.replace('_', ' ')}
                      </button>
                    )}
                    
                    {distribution.status !== DISTRIBUTION_STATUS.DELIVERED && 
                     distribution.status !== DISTRIBUTION_STATUS.CANCELLED && (
                      <button
                        onClick={() => handleCancelDistribution(distribution.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Real-time Update Note */}
      <div className="mt-6 text-right">
        <p className="text-xs text-gray-500">
          Data refreshes automatically. Last refresh: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default DistributionManagement;