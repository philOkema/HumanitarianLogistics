import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading: userLoading } = useUser();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userLoading && (!authUser || !user)) {
      console.log('DashboardPage: Redirecting to login', { authUser, user });
      setLocation("/auth?type=login");
    }
  }, [authUser, authLoading, user, userLoading, setLocation]);

  // Show loading state
  if (userLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Show error state if no user data
  if (!user || !authUser) {
    console.log('DashboardPage: No user data', { user, authUser });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/10 border-0">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <ShieldAlert className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-center text-white">Access Denied</CardTitle>
            <CardDescription className="text-center text-white/60">
              You must be logged in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setLocation("/auth?type=login")} className="bg-primary text-white hover:bg-primary/80">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white">Welcome, {user.name}!</h1>
          <p className="mt-2 text-white/80">Role: {user.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions Card */}
          <Card className="bg-white/10 border-0">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-white/60">Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/profile')}>
                View Profile
              </Button>
              <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/settings')}>
                Update Settings
              </Button>
              <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/notifications')}>
                View Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Role-specific Card */}
          <Card className="bg-white/10 border-0">
            <CardHeader>
              <CardTitle className="text-white">Role Dashboard</CardTitle>
              <CardDescription className="text-white/60">Features specific to your role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.role === "admin" && (
                <>
                  <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/admin-dashboard')}>
                    Manage Users
                  </Button>
                  <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/settings')}>
                    System Settings
                  </Button>
                </>
              )}
              {user.role === "beneficiary" && (
                <>
                  <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/request')}>
                    View My Aid Requests
                  </Button>
                  <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/delivery/:deliveryId/track')}>
                    Track My Shipments
                  </Button>
                </>
              )}
              {user.role === "donor" && (
                <>
                  <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/donations')}>
                    Manage My Donations
                  </Button>
                  <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/analytics')}>
                    View My Impact
                  </Button>
                </>
              )}
              {user.role === "volunteer" && (
                <>
                  <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/deliveries')}>
                    View My Assignments
                  </Button>
                  <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/volunteer-hours')}>
                    Report My Hours
                  </Button>
                </>
              )}
              {user.role === "staff" && (
                <>
                  <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/inventory')}>
                    Manage Inventory
                  </Button>
                  <Button className="w-full bg-transparent text-white border-white hover:bg-white/10" variant="outline" onClick={() => setLocation('/distribution')}>
                    Oversee Distributions
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="bg-white/10 border-0">
            <CardHeader>
              <CardTitle className="text-white">System Status</CardTitle>
              <CardDescription className="text-white/60">Current system information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Last Login</span>
                <span className="text-white">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Account Status</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Notifications</span>
                <span className="text-white">0 unread</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
