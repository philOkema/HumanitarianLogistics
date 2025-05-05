import React, { useState, useEffect } from 'react';
import { useAidRequest, REQUEST_STATUS } from '../../context/AidRequestContext';
import { useUser } from '../../context/UserContext';
import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';

// Utility to convert Firestore timestamp to JS Date
function toDate(ts) {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts === 'object' && ts.seconds) {
    return new Date(ts.seconds * 1000);
  }
  return new Date(ts);
}

const AidRequestList = () => {
  const { aidRequests = [], loading, error, updateRequestStatus } = useAidRequest();
  const { user } = useUser();
  
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter, search and sort requests whenever related states change
  useEffect(() => {
    if (!Array.isArray(aidRequests)) {
      console.error('aidRequests is not an array:', aidRequests);
      setFilteredRequests([]);
      return;
    }

    let result = [...aidRequests];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(request => 
        request.location?.toLowerCase().includes(term) ||
        request.items?.some(item => item.name.toLowerCase().includes(term)) ||
        (request.notes && request.notes.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(a[sortBy] || 0).getTime();
        bValue = new Date(b[sortBy] || 0).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
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
    
    setFilteredRequests(result);
  }, [aidRequests, statusFilter, searchTerm, sortBy, sortOrder]);

  const handleStatusChange = async (requestId, newStatus) => {
    const result = await updateRequestStatus(requestId, newStatus);
    
    if (!result.success) {
      console.error('Failed to update request status:', result.error);
      // You might want to show a toast notification here
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case REQUEST_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case REQUEST_STATUS.APPROVED:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case REQUEST_STATUS.IN_PROGRESS:
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      
      case REQUEST_STATUS.IN_TRANSIT:
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case REQUEST_STATUS.DELIVERED:
        return 'bg-green-100 text-green-800 border-green-300';
      case REQUEST_STATUS.DENIED:
        return 'bg-red-100 text-red-800 border-red-300';
      case REQUEST_STATUS.CANCELLED:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const toggleSortOrder = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  if (!Array.isArray(aidRequests) || aidRequests.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">No Aid Requests</h2>
          {user?.role === 'beneficiary' && (
            <Link href="/request/new">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Create New Request
              </button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Aid Requests</h2>
        {user?.role === 'beneficiary' && (
          <Link href="/request/new">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              New Request
            </button>
          </Link>
        )}
      </div>

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
            {Object.values(REQUEST_STATUS).map((status) => (
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
              <option value="updatedAt">Updated Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
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
            placeholder="Search by location or items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No aid requests found matching your criteria.</p>
          {user?.role === 'beneficiary' && (
            <Link href="/request/new">
              <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Create New Request
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => toggleSortOrder('id')}>
                  ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                {isAdmin && (
                  <th className="py-3 px-4 font-semibold">Beneficiary</th>
                )}
                <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => toggleSortOrder('createdAt')}>
                  Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3 px-4 font-semibold">Items</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => toggleSortOrder('priority')}>
                  Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer" onClick={() => toggleSortOrder('status')}>
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">#{request.id}</td>
                  {isAdmin && (
                    <td className="py-3 px-4">{request.beneficiaryId}</td>
                  )}
                  <td className="py-3 px-4">{toDate(request.createdAt)?.toLocaleDateString() || ''}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col space-y-1">
                      {(request.items || []).map((item, idx) => (
                        <div key={idx} className="text-sm">
                          {item.quantity} {item.unit} {item.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">{request.location}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Link href={`/request/${request.id}`}>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs">
                          View
                        </button>
                      </Link>
                      
                      {isAdmin && request.status === REQUEST_STATUS.PENDING && (
                        <>
                          <button
                            onClick={() => handleStatusChange(request.id, REQUEST_STATUS.APPROVED)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(request.id, REQUEST_STATUS.DENIED)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                          >
                            Deny
                          </button>
                        </>
                      )}
                      
                      {isAdmin && request.status === REQUEST_STATUS.APPROVED && (
                        <button
                          onClick={() => handleStatusChange(request.id, REQUEST_STATUS.IN_PROGRESS)}
                          className="bg-purple-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Start
                        </button>
                      )}
                      
                      {user?.role === 'beneficiary' && request.status === REQUEST_STATUS.PENDING && (
                        <button
                          onClick={() => handleStatusChange(request.id, REQUEST_STATUS.CANCELLED)}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AidRequestList;