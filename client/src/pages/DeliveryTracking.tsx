import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import MapboxTracker from '../components/MapboxTracker';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '../lib/firebase';

interface Delivery {
  id: string;
  status: string;
  assignedTo: string;
  beneficiaryId: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface FirestoreDelivery {
  status: string;
  assignedTo: string;
  beneficiaryId: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  createdAt: {
    toDate: () => Date;
  };
  updatedAt: {
    toDate: () => Date;
  };
}

const DeliveryTracking: React.FC = () => {
  const params = useParams();
  const deliveryId = params.deliveryId;
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deliveryId) {
      setError('No delivery ID provided');
      setLoading(false);
      return;
    }

    const fetchDelivery = async () => {
      try {
        const db = getFirestore(firebaseApp);
        const deliveryRef = doc(db, 'distributions', deliveryId);
        const deliveryDoc = await getDoc(deliveryRef);

        if (deliveryDoc.exists()) {
          const data = deliveryDoc.data() as FirestoreDelivery;
          setDelivery({
            id: deliveryId,
            status: data.status,
            assignedTo: data.assignedTo,
            beneficiaryId: data.beneficiaryId,
            items: data.items || [],
            createdAt: data.createdAt.toDate().toISOString(),
            updatedAt: data.updatedAt.toDate().toISOString()
          });
          setError(null);
        } else {
          setError('Delivery not found');
        }
      } catch (err) {
        console.error('Error fetching delivery:', err);
        setError('Failed to load delivery details');
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [deliveryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery Not Found</h2>
          <p className="text-gray-600">The requested delivery could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Delivery Tracking</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
            delivery.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {delivery.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Delivery ID</p>
                <p className="font-medium">{delivery.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="font-medium">{delivery.assignedTo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{new Date(delivery.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{new Date(delivery.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold mt-6 mb-4">Items</h2>
            <div className="space-y-2">
              {delivery.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Live Location</h2>
            {delivery.assignedTo && (
              <MapboxTracker userId={delivery.assignedTo} isAdmin={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking; 