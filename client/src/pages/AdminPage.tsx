import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, Activity, BarChart3, Package, Handshake, Loader2, Plus, Cog } from "lucide-react";
import { getDashboardStats, getRecentActivities } from '@/services/adminService';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

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

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, activitiesData] = await Promise.all([
          getDashboardStats(),
          getRecentActivities()
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'addUser':
        setLocation('/users/new');
        break;
      case 'manageInventory':
        setLocation('/inventory');
        break;
      case 'viewAnalytics':
        setLocation('/analytics');
        break;
      case 'systemConfig':
        setLocation('/settings');
        break;
      default:
        toast({
          title: "Action not implemented",
          description: "This action is not yet available.",
          variant: "destructive",
        });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="text-black"
            onClick={() => handleQuickAction('systemConfig')}
          >
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
          <Button 
            variant="outline" 
            className="text-black"
            onClick={() => handleQuickAction('addUser')}
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Active Donations
            </CardTitle>
            <Package className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.activeDonations || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Pending Requests
            </CardTitle>
            <Handshake className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.pendingRequests || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="text-black"
                onClick={() => handleQuickAction('addUser')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <Button 
                variant="outline" 
                className="text-black"
                onClick={() => handleQuickAction('manageInventory')}
              >
                <Package className="w-4 h-4 mr-2" />
                Manage Inventory
              </Button>
              <Button 
                variant="outline" 
                className="text-black"
                onClick={() => handleQuickAction('viewAnalytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button 
                variant="outline" 
                className="text-black"
                onClick={() => handleQuickAction('systemConfig')}
              >
                <Cog className="w-4 h-4 mr-2" />
                System Config
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-0">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <Activity className="h-4 w-4 text-white" />
                  <div>
                    <p className="text-sm text-white">{activity.description}</p>
                    <p className="text-xs text-white/60">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage; 