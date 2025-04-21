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
    if (!authLoading && !authUser) {
      setLocation("/auth?type=login");
    }
  }, [authUser, authLoading, setLocation]);

  // Show loading state
  if (userLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state if no user data
  if (!user || !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <ShieldAlert className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You must be logged in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setLocation("/auth?type=login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
          <p className="mt-2 text-gray-600">Role: {user.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                View Profile
              </Button>
              <Button className="w-full" variant="outline">
                Update Settings
              </Button>
              <Button className="w-full" variant="outline">
                View Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Role-specific Card */}
          <Card>
            <CardHeader>
              <CardTitle>Role Dashboard</CardTitle>
              <CardDescription>Features specific to your role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.role === "admin" && (
                <>
                  <Button className="w-full" variant="outline">
                    Manage Users
                  </Button>
                  <Button className="w-full" variant="outline">
                    System Settings
                  </Button>
                </>
              )}
              {user.role === "beneficiary" && (
                <>
                  <Button className="w-full" variant="outline">
                    View Aid Requests
                  </Button>
                  <Button className="w-full" variant="outline">
                    Track Shipments
                  </Button>
                </>
              )}
              {user.role === "donor" && (
                <>
                  <Button className="w-full" variant="outline">
                    Manage Donations
                  </Button>
                  <Button className="w-full" variant="outline">
                    View Impact
                  </Button>
                </>
              )}
              {user.role === "volunteer" && (
                <>
                  <Button className="w-full" variant="outline">
                    View Assignments
                  </Button>
                  <Button className="w-full" variant="outline">
                    Report Hours
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Login</span>
                <span className="text-gray-900">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Notifications</span>
                <span className="text-gray-900">0 unread</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
