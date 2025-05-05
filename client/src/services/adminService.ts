import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const functions = getFunctions();

interface DashboardStats {
  totalUsers: number;
  activeDonations: number;
  pendingRequests: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get total users
    const usersCol = collection(db, "users");
    const usersSnapshot = await getDocs(usersCol);
    const totalUsers = usersSnapshot.size;

    // Get active donations
    const donationsCol = collection(db, "donations");
    const activeDonationsQuery = query(donationsCol, where("status", "==", "active"));
    const activeDonationsSnapshot = await getDocs(activeDonationsQuery);
    const activeDonations = activeDonationsSnapshot.size;

    // Get pending requests
    const requestsCol = collection(db, "requests");
    const pendingRequestsQuery = query(requestsCol, where("status", "==", "pending"));
    const pendingRequestsSnapshot = await getDocs(pendingRequestsQuery);
    const pendingRequests = pendingRequestsSnapshot.size;

    return {
      totalUsers,
      activeDonations,
      pendingRequests
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getRecentActivities = async (limit: number = 5): Promise<RecentActivity[]> => {
  try {
    const activitiesCol = collection(db, "activities");
    const activitiesQuery = query(activitiesCol);
    const activitiesSnapshot = await getDocs(activitiesQuery);
    
    return activitiesSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          description: data.description,
          timestamp: data.timestamp.toDate()
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
}; 