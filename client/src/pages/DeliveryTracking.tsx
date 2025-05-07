import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import MapboxTracker from '../components/MapboxTracker';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../lib/firebase';
import { useUser } from '../context/UserContext';

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
  volunteerId: string;
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
  volunteerId: string;
}

function sanitizeKey(key: string) {
  return key.replace(/[.#$\[\]]/g, '_');
}

const DeliveryTracking: React.FC = () => {
  const params = useParams();
  const { user } = useUser();
  const [userDeliveries, setUserDeliveries] = useState<Delivery[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aidRequestIds, setAidRequestIds] = useState<string[]>([]);

  // Fetch aid request IDs for beneficiaries
  useEffect(() => {
    if (!user || user.role !== 'beneficiary') return;
    const fetchAidRequests = async () => {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, 'aidRequests'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const ids: string[] = [];
      querySnapshot.forEach(doc => ids.push(doc.id));
      setAidRequestIds(ids);
      console.log('Current user:', user.uid, user.role);
      console.log('Fetched aid request IDs for beneficiary:', ids);
    };
    fetchAidRequests();
  }, [user]);

  // Fetch in-transit deliveries for beneficiaries
  useEffect(() => {
    if (!user) return;
    if (user.role === 'beneficiary') {
      if (aidRequestIds.length === 0) {
        setUserDeliveries([]);
        console.log('No aid requests found for beneficiary:', user.uid);
        return;
      }
      const fetchDeliveries = async () => {
        const db = getFirestore(firebaseApp);
        const batches = [];
        for (let i = 0; i < aidRequestIds.length; i += 10) {
          const batch = aidRequestIds.slice(i, i + 10);
          const q = query(
            collection(db, 'distributions'),
            where('status', '==', 'in-transit'),
            where('requestId', 'in', batch)
          );
          batches.push(getDocs(q));
        }
        const results = await Promise.all(batches);
        const deliveries: Delivery[] = [];
        results.forEach(querySnapshot => {
          querySnapshot.forEach(docSnap => {
            const data = docSnap.data() as FirestoreDelivery;
            deliveries.push({
              id: docSnap.id,
              status: data.status,
              assignedTo: data.assignedTo,
              beneficiaryId: data.beneficiaryId,
              items: data.items || [],
              createdAt: data.createdAt.toDate().toISOString(),
              updatedAt: data.updatedAt.toDate().toISOString(),
              volunteerId: data.volunteerId
            });
          });
        });
        setUserDeliveries(deliveries);
        console.log('Fetched in-transit deliveries for beneficiary:', deliveries);
        if (deliveries.length > 0 && !selectedDeliveryId) {
          setSelectedDeliveryId(deliveries[0].id);
        }
      };
      fetchDeliveries();
    }
  }, [user, aidRequestIds]);

  // Fetch all in-transit deliveries for admins
  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      const fetchAdminDeliveries = async () => {
        const db = getFirestore(firebaseApp);
        const q = query(
          collection(db, 'distributions'),
          where('status', '==', 'in-transit')
        );
        const querySnapshot = await getDocs(q);
        const deliveries: Delivery[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as FirestoreDelivery;
          deliveries.push({
            id: docSnap.id,
            status: data.status,
            assignedTo: data.assignedTo,
            beneficiaryId: data.beneficiaryId,
            items: data.items || [],
            createdAt: data.createdAt.toDate().toISOString(),
            updatedAt: data.updatedAt.toDate().toISOString(),
            volunteerId: data.volunteerId
          });
        });
        setUserDeliveries(deliveries);
        if (deliveries.length > 0 && !selectedDeliveryId) {
          setSelectedDeliveryId(deliveries[0].id);
        }
      };
      fetchAdminDeliveries();
    }
  }, [user]);

  // Fetch the selected delivery's details
  useEffect(() => {
    if (!selectedDeliveryId) {
      setDelivery(null);
      setError('No delivery selected');
      setLoading(false);
      return;
    }
    const fetchDelivery = async () => {
      try {
        setLoading(true);
        const db = getFirestore(firebaseApp);
        const deliveryRef = doc(db, 'distributions', selectedDeliveryId);
        const deliveryDoc = await getDoc(deliveryRef);
        if (deliveryDoc.exists()) {
          const data = deliveryDoc.data() as FirestoreDelivery;
          setDelivery({
            id: selectedDeliveryId,
            status: data.status,
            assignedTo: data.assignedTo,
            beneficiaryId: data.beneficiaryId,
            items: data.items || [],
            createdAt: data.createdAt.toDate().toISOString(),
            updatedAt: data.updatedAt.toDate().toISOString(),
            volunteerId: data.volunteerId
          });
          setError(null);
        } else {
          setDelivery(null);
          setError('Delivery not found');
        }
      } catch (err) {
        setDelivery(null);
        setError('Failed to load delivery details');
      } finally {
        setLoading(false);
      }
    };
    fetchDelivery();
  }, [selectedDeliveryId]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {userDeliveries.length > 1 && (
        <div className="mb-4">
          <label htmlFor="delivery-select" className="block mb-1 text-white font-medium">Select Delivery:</label>
          <select
            id="delivery-select"
            value={selectedDeliveryId || ''}
            onChange={e => setSelectedDeliveryId(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {userDeliveries.map(d => (
              <option key={d.id} value={d.id}>
                {d.id} - {d.status}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Delivery Tracking</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            delivery!.status === 'delivered' ? 'bg-green-100 text-green-800' :
            delivery!.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {delivery!.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Delivery ID</p>
                <p className="font-medium">{delivery!.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="font-medium">{delivery!.assignedTo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{new Date(delivery!.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{new Date(delivery!.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold mt-6 mb-4">Items</h2>
            <div className="space-y-2">
              {delivery!.items?.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Live Location</h2>
            {delivery!.volunteerId && (
              <MapboxTracker userId={delivery!.volunteerId} isAdmin={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking; 