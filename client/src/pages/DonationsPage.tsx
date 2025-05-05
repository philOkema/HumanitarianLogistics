import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useRoleFeatures } from '../hooks/useRoleFeatures';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addDonation, getUserDonations, getAllDonations, updateDonationStatus, Donation as FirestoreDonation, DonationType } from '../services/donationService';

const DonationsPage: React.FC = () => {
  const { user } = useUser();
  const { canManageDonations } = useRoleFeatures();
  const { toast } = useToast();
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donations, setDonations] = useState<FirestoreDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [formType, setFormType] = useState<DonationType>('in-kind');
  const [newDonation, setNewDonation] = useState<any>({
    items: [{ name: '', quantity: '', unit: '' }],
    amount: '',
    currency: 'USD',
    notes: ''
  });
  const [allDonations, setAllDonations] = useState<FirestoreDonation[]>([]);
  const [allLoading, setAllLoading] = useState(true);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'collected', label: 'Collected' },
    { value: 'delivered', label: 'Delivered' }
  ];

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getUserDonations(user.uid)
      .then(setDonations)
      .finally(() => setLoading(false));
    if (canManageDonations) {
      setAllLoading(true);
      getAllDonations()
        .then(setAllDonations)
        .finally(() => setAllLoading(false));
    }
  }, [user?.uid, canManageDonations]);

  const handleAddItem = () => {
    setNewDonation((prev: any) => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: '', unit: '' }]
    }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...newDonation.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewDonation((prev: any) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    let donation: Omit<FirestoreDonation, 'id'>;
    if (formType === 'in-kind') {
      donation = {
        userId: user.uid,
        type: 'in-kind',
        date: new Date(),
        status: 'pending',
        items: newDonation.items.map((item: any) => ({
          name: item.name,
          quantity: Number(item.quantity),
          unit: item.unit
        })),
        notes: newDonation.notes
      };
    } else {
      donation = {
        userId: user.uid,
        type: 'financial',
        date: new Date(),
        status: 'pending',
        amount: Number(newDonation.amount),
        currency: newDonation.currency,
        notes: newDonation.notes
      };
    }
    try {
      await addDonation(donation);
      toast({
        title: "Donation Submitted",
        description: "Your donation has been submitted for review.",
      });
      setShowDonationForm(false);
      setNewDonation({ items: [{ name: '', quantity: '', unit: '' }], amount: '', currency: 'USD', notes: '' });
      setFormType('in-kind');
      // Refresh donations
      if (user?.uid) {
        setLoading(true);
        getUserDonations(user.uid)
          .then(setDonations)
          .finally(() => setLoading(false));
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit donation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async (id: string) => {
    await updateDonationStatus(id, 'approved');
    toast({ title: 'Donation Approved' });
    setAllLoading(true);
    getAllDonations().then(setAllDonations).finally(() => setAllLoading(false));
  };

  const handleReject = async (id: string) => {
    await updateDonationStatus(id, 'rejected');
    toast({ title: 'Donation Rejected', variant: 'destructive' });
    setAllLoading(true);
    getAllDonations().then(setAllDonations).finally(() => setAllLoading(false));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'received':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Donations</h1>
        {user?.role === 'donor' && (
          <Button onClick={() => setShowDonationForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Donation
          </Button>
        )}
      </div>

      {/* Donation Form Modal */}
      {showDonationForm && (
        <Card className="bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">New Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitDonation} className="space-y-4">
              <div>
                <Label className="text-gray-200">Donation Type</Label>
                <Select value={formType} onValueChange={(value) => setFormType(value as DonationType)}>
                  <SelectTrigger className="bg-gray-900 text-white border-gray-700">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-white">
                    <SelectItem value="in-kind">In-Kind (Items)</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formType === 'in-kind' ? (
                <>
                  {newDonation.items.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-200">Item Name</Label>
                        <Input
                          className="text-white bg-gray-900 border-gray-700"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          placeholder="e.g., Rice"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-gray-200">Quantity</Label>
                        <Input
                          className="text-white bg-gray-900 border-gray-700"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          placeholder="e.g., 10"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-gray-200">Unit</Label>
                        <Select
                          value={item.unit}
                          onValueChange={(value) => handleItemChange(index, 'unit', value)}
                        >
                          <SelectTrigger className="bg-gray-900 text-white border-gray-700">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 text-white">
                            <SelectItem value="kg">Kilograms</SelectItem>
                            <SelectItem value="g">Grams</SelectItem>
                            <SelectItem value="l">Liters</SelectItem>
                            <SelectItem value="pcs">Pieces</SelectItem>
                            <SelectItem value="box">Boxes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleAddItem} className="border-white text-white hover:bg-white/10">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Item
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-200">Amount</Label>
                    <Input
                      className="text-white bg-gray-900 border-gray-700"
                      type="number"
                      min="1"
                      value={newDonation.amount}
                      onChange={e => setNewDonation((prev: any) => ({ ...prev, amount: e.target.value }))}
                      placeholder="e.g., 100"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-gray-200">Currency</Label>
                    <Select
                      value={newDonation.currency}
                      onValueChange={value => setNewDonation((prev: any) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="bg-gray-900 text-white border-gray-700">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white">
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="NGN">NGN</SelectItem>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="GHS">GHS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <div>
                <Label className="text-gray-200">Additional Notes</Label>
                <Textarea
                  className="text-white bg-gray-900 border-gray-700"
                  value={newDonation.notes}
                  onChange={e => setNewDonation((prev: any) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information about your donation..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowDonationForm(false)} className="border-white text-white hover:bg-white/10">
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Submit Donation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Donor's Donation History */}
      {user?.role === 'donor' && (
        <Card className="bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">My Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-400 text-center py-4">Loading...</p>
            ) : donations.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No donations yet. Submit your first donation above!</p>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation.id} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">Donation #{donation.id?.slice(-6)}</h3>
                        <p className="text-sm text-gray-400">
                          {new Date(donation.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(donation.status)}
                        <span className="capitalize text-gray-200">{donation.status}</span>
                      </div>
                    </div>
                    {donation.type === 'in-kind' && donation.items && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2 text-gray-200">Items:</h4>
                        <ul className="space-y-2">
                          {donation.items.map((item, index) => (
                            <li key={index} className="flex justify-between text-gray-200">
                              <span>{item.name}</span>
                              <span>{item.quantity} {item.unit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {donation.type === 'financial' && (
                      <div className="mt-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        <span className="text-lg text-green-300 font-bold">
                          {donation.amount} {donation.currency}
                        </span>
                      </div>
                    )}
                    {donation.notes && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2 text-gray-200">Notes:</h4>
                        <p className="text-gray-300">{donation.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin/Staff Features */}
      {canManageDonations && (
        <div className="grid gap-6">
          <Card className="bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Donation Management</CardTitle>
            </CardHeader>
            <CardContent>
              {allLoading ? (
                <p className="text-gray-400 text-center py-4">Loading...</p>
              ) : allDonations.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No donations found.</p>
              ) : (
                <div className="space-y-4">
                  {allDonations.map((donation) => (
                    <div key={donation.id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-white">Donation #{donation.id?.slice(-6)}</h3>
                          <p className="text-sm text-gray-400">
                            {new Date(donation.date).toLocaleDateString()} by {donation.userId}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(donation.status)}
                          <span className="capitalize text-gray-200">{donation.status}</span>
                        </div>
                      </div>
                      {donation.type === 'in-kind' && donation.items && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2 text-gray-200">Items:</h4>
                          <ul className="space-y-2">
                            {donation.items.map((item, index) => (
                              <li key={index} className="flex justify-between text-gray-200">
                                <span>{item.name}</span>
                                <span>{item.quantity} {item.unit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {donation.type === 'financial' && (
                        <div className="mt-4 flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-400" />
                          <span className="text-lg text-green-300 font-bold">
                            {donation.amount} {donation.currency}
                          </span>
                        </div>
                      )}
                      {donation.notes && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2 text-gray-200">Notes:</h4>
                          <p className="text-gray-300">{donation.notes}</p>
                        </div>
                      )}
                      {donation.status === 'pending' && (
                        <div className="mt-4 flex gap-2">
                          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(donation.id!)}>
                            Approve
                          </Button>
                          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleReject(donation.id!)}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Donation Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-700 rounded p-4">
                  <h3 className="font-medium mb-2 text-white">Total Donations</h3>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="border border-gray-700 rounded p-4">
                  <h3 className="font-medium mb-2 text-white">This Month</h3>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="border border-gray-700 rounded p-4">
                  <h3 className="font-medium mb-2 text-white">Pending</h3>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DonationsPage; 