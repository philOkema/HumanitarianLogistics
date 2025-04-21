import React, { useState, useEffect, useMemo } from 'react';
import { useAidRequest } from '../../context/AidRequestContext';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '@/hooks/use-toast';

const AidRequestForm = ({ onRequestSubmitted, request = null }) => {
  const { createAidRequest, updateAidRequest } = useAidRequest();
  const { inventory, aidItems } = useInventory();
  const { toast } = useToast();

  const initialFormData = useMemo(() => {
    if (request) {
      const requestItems = request.items || [];
      const requestNotes = request.notes || '';
      const extractedItems = [];

      if (requestNotes.includes('Requested Items:')) {
        const itemsSection = requestNotes.split('Requested Items:')[1].trim();
        const itemLines = itemsSection.split('\n').filter(line => line.trim() !== '');
        itemLines.forEach(line => {
          const parts = line.split(':');
          if (parts.length === 2) {
            const itemName = parts[0].trim().replace('-', '').trim();
            const quantityAndUnit = parts[1].trim().split(' ');
            const quantity = parseInt(quantityAndUnit[0]);
            const unit = quantityAndUnit.slice(1).join(' ') || 'unit';
            const matchingItem = aidItems.find(item => item.name.toLowerCase() === itemName.toLowerCase());
            extractedItems.push({
              itemId: matchingItem ? matchingItem.id : '',
              name: itemName,
              quantity: quantity,
              unit: unit,
            });
          }
        });
      }

      return {
        name: request.name || '',
        location: request.location || '',
        aidType: request.aidType || '',
        urgency: request.urgency || 'medium',
        items: extractedItems.length > 0 ? extractedItems : [{ itemId: '', name: '', quantity: 1, unit: '' }],
        notes: requestNotes.split('Requested Items:')[0].trim(),
      };
    }
    return { name: '', location: '', aidType: '', urgency: 'medium', items: [{ itemId: '', name: '', quantity: 1, unit: '' }], notes: '' };
  }, [request, aidItems]);

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});
  const [availableItems, setAvailableItems] = useState([]);

  // Get available items from inventory and predefined aid items
  useEffect(() => {
    // Use aidItems (predefined items) if available, otherwise fall back to inventory
    if (aidItems && aidItems.length > 0) {
      setAvailableItems(aidItems);
    } else if (inventory.length > 0) {
      // Filter inventory items with quantity > 0
      const items = inventory.filter(item => item.quantity > 0);
      setAvailableItems(items);
    }
  }, [inventory, aidItems]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Request name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.aidType.trim()) {
      newErrors.aidType = 'Aid type is required';
    }

    if (!formData.urgency) {
      newErrors.urgency = 'Urgency level is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.itemId) {
          newErrors[`items.${index}.itemId`] = 'Item is required';
        }

        if (!item.quantity || item.quantity <= 0) {
          newErrors[`items.${index}.quantity`] = 'Quantity must be greater than 0';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    if (field === 'itemId') {
      const selectedItem = availableItems.find(item => item.id === parseInt(value));
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          itemId: parseInt(value),
          name: selectedItem.name,
          unit: selectedItem.unit || 'unit'
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'quantity' ? parseInt(value) : value
      };
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: '', name: '', quantity: 1, unit: '' }]
    });
  };

  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData({ ...formData, items: updatedItems.length ? updatedItems : [{ itemId: '', name: '', quantity: 1, unit: '' }] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isEditMode = !!request;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Form Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }
    const formattedItems = formData.items.map(item => ({
      itemId: item.itemId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit
    }));
  
    const notesWithItems = `${formData.notes}\n\nRequested Items:\n${formattedItems
      .map(item => `- ${item.name}: ${item.quantity} ${item.unit}`)
      .join('\n')}`;
  
    const requestData = {
      name: formData.name,
      location: formData.location,
      aidType: formData.aidType,
      urgency: formData.urgency,
      notes: notesWithItems,
    };
  
    let result;
  
    if (isEditMode) {
      result = await updateAidRequest(request.id, requestData);
    } else {
      result = await createAidRequest(requestData);
    }
  
    if (!result) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return;
    }
  
    if (result.success && onRequestSubmitted) {
      toast({
        title: isEditMode ? 'Success' : 'Success',
        description: isEditMode ? 'Your aid request has been updated successfully.' : 'Your aid request has been submitted successfully.',
      });
      
      // Reset form only if it's not in edit mode
      setFormData({
        name: '',
        location: '',
        aidType: '',
        urgency: 'medium',
        items: [{ itemId: '', name: '', quantity: 1, unit: '' }],
        notes: ''
      });
      if(isEditMode){
        onRequestSubmitted(result.data);
      }else{
        onRequestSubmitted(result.request);
      }
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to submit aid request. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-200 border-red-400';
      case 'medium':
        return 'bg-yellow-200 border-yellow-400 ';
      case 'low':
        return 'bg-green-200 border-green-400';
      default:
        return 'bg-gray-200 border-gray-400';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">{isEditMode ? 'Edit Aid Request' : 'Submit Aid Request'}</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Request Name */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Request Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.name ? 'border-red-500' : ''
            }`}
            placeholder="Give your request a descriptive name"
          />
          {errors.name && (
            <p className="text-red-500 text-xs italic">{errors.name}</p>
          )}
        </div>
        
        {/* Location Section */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
            Location / Address *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.location ? 'border-red-500' : ''
            }`}
            placeholder="Enter your current location"
          />
          {errors.location && (
            <p className="text-red-500 text-xs italic">{errors.location}</p>
          )}
        </div>

        {/* Aid Type Section */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aidType">
            Aid Type *
          </label>
          <select
            id="aidType"
            name="aidType"
            value={formData.aidType}
            onChange={handleChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.aidType ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select Aid Type</option>
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="medical">Medical Supplies</option>
            <option value="shelter">Shelter</option>
            <option value="clothing">Clothing</option>
            <option value="hygiene">Hygiene Products</option>
            <option value="other">Other</option>
          </select>
          {errors.aidType && (
            <p className="text-red-500 text-xs italic">{errors.aidType}</p>
          )}
        </div>

        {/* Urgency Section */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Urgency Level *
          </label>
          <div className="flex space-x-4">
            {['low', 'medium', 'high'].map((urgency) => (
              <div key={urgency} className="flex items-center">
                <input
                  type="radio"
                  id={`urgency-${urgency}`}
                  name="urgency"
                  value={urgency}
                  checked={formData.urgency === urgency}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label
                  htmlFor={`urgency-${urgency}`}
                  className={`py-1 px-3 rounded-full text-sm capitalize ${getUrgencyClass(urgency)}`}
                >
                  {urgency}
                </label>
              </div>
            ))}
          </div>
          {errors.urgency && (
            <p className="text-red-500 text-xs italic">{errors.urgency}</p>
          )}
        </div>

        {/* Items Section */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Requested Items *
          </label>
          
          {formData.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <select
                  value={item.itemId}
                  onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                  className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors[`items.${index}.itemId`] ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select an item</option>
                  {availableItems.map((invItem) => (
                    <option key={invItem.id} value={invItem.id}>
                      {invItem.name} ({invItem.quantity} {invItem.unit || 'unit'} available)
                    </option>
                  ))}
                </select>
                {errors[`items.${index}.itemId`] && (
                  <p className="text-red-500 text-xs italic">{errors[`items.${index}.itemId`]}</p>
                )}
              </div>
              
              <div className="w-24">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors[`items.${index}.quantity`] ? 'border-red-500' : ''
                  }`}
                />
                {errors[`items.${index}.quantity`] && (
                  <p className="text-red-500 text-xs italic">{errors[`items.${index}.quantity`]}</p>
                )}
              </div>
              
              <div className="w-20 text-gray-600 text-sm flex items-center">
                {item.unit || 'unit'}
              </div>
              
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                disabled={formData.items.length === 1}
              >
                X
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addItem}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
            + Add Item
          </button>
          
          {errors.items && (
            <p className="text-red-500 text-xs italic mt-2">{errors.items}</p>
          )}
        </div>

        {/* Notes Section */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
            placeholder="Any additional information about your request"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
          >
            {isEditMode ? 'Update Request' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AidRequestForm;