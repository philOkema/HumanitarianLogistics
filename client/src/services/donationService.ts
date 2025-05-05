import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, orderBy, doc, updateDoc } from 'firebase/firestore';

export type DonationType = 'in-kind' | 'financial';

export interface InKindDonationItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface Donation {
  id?: string;
  userId: string;
  type: DonationType;
  date: Date;
  status: 'pending' | 'approved' | 'received' | 'rejected';
  items?: InKindDonationItem[];
  amount?: number;
  currency?: string;
  notes?: string;
}

export async function addDonation(donation: Omit<Donation, 'id'>) {
  const docRef = await addDoc(collection(db, 'donations'), {
    ...donation,
    date: Timestamp.fromDate(donation.date),
  });
  return docRef.id;
}

export async function getUserDonations(userId: string): Promise<Donation[]> {
  const q = query(
    collection(db, 'donations'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate() : new Date(),
    } as Donation;
  });
}

export async function getAllDonations(): Promise<Donation[]> {
  const q = query(collection(db, 'donations'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate() : new Date(),
    } as Donation;
  });
}

export async function updateDonationStatus(id: string, status: 'pending' | 'approved' | 'received' | 'rejected') {
  const docRef = doc(db, 'donations', id);
  await updateDoc(docRef, { status });
} 