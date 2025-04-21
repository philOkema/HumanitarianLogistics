import React, { Suspense, lazy } from 'react';
import { Link } from 'wouter';
import { useUser } from '../context/UserContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Users, Calendar, BarChart3, Heart, FileText, Settings } from 'lucide-react';

// Lazy load components
const AidRequests = lazy(() => import('@/components/AidRequests'));
const Distributions = lazy(() => import('@/components/Distributions'));
const Inventory = lazy(() => import('@/components/Inventory'));
const Analytics = lazy(() => import('@/components/Analytics'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const HomePage: React.FC = () => {
  const { user, hasPermission } = useUser();

  const getQuickActions = () => {
    const actions = [];

    if (hasPermission('view_aid_requests')) {
      actions.push({
        title: "Aid Requests",
        icon: <FileText className="h-6 w-6 text-primary" />,
        description: "View and manage aid requests",
        path: "/request",
        component: <Suspense fallback={<LoadingFallback />}><AidRequests /></Suspense>
      });
    }

    if (hasPermission('view_distributions')) {
      actions.push({
        title: "Distributions",
        icon: <Package className="h-6 w-6 text-primary" />,
        description: "Track aid distributions",
        path: "/distribution",
        component: <Suspense fallback={<LoadingFallback />}><Distributions /></Suspense>
      });
    }

    if (hasPermission('manage_inventory')) {
      actions.push({
        title: "Inventory",
        icon: <Package className="h-6 w-6 text-primary" />,
        description: "Manage aid inventory",
        path: "/inventory",
        component: <Suspense fallback={<LoadingFallback />}><Inventory /></Suspense>
      });
    }

    if (user?.role === 'admin' || user?.role === 'staff') {
      actions.push({
        title: "Analytics",
        icon: <BarChart3 className="h-6 w-6 text-primary" />,
        description: "View system analytics",
        path: "/analytics",
        component: <Suspense fallback={<LoadingFallback />}><Analytics /></Suspense>
      });
    }

    return actions;
  };

  const getStatistics = () => {
    // These would typically come from an API
    return [
      {
        label: "Aid Requests",
        value: "150+",
        description: "Active requests"
      },
      {
        label: "Beneficiaries",
        value: "2,000+",
        description: "People helped"
      },
      {
        label: "Volunteers",
        value: "500+",
        description: "Active volunteers"
      },
      {
        label: "Aid Distributed",
        value: "$1.2M",
        description: "Total value"
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to HumanitarianAid
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {user ? `Welcome back, ${user.displayName || 'User'}!` : 'Connecting those who need help with those who can help'}
          </p>
        </div>

        {user ? (
          <>
            {/* Quick Actions Grid */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getQuickActions().map((action, index) => (
                  <Link key={index} href={action.path}>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {action.icon}
                          </div>
                          <div>
                            <CardTitle>{action.title}</CardTitle>
                            <CardDescription>{action.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Statistics Grid */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getStatistics().map((stat, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-3xl font-bold text-primary">
                        {stat.value}
                      </CardTitle>
                      <CardDescription className="text-lg font-medium">
                        {stat.label}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">{stat.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <p className="text-lg text-gray-600 max-w-2xl text-center">
              Join our platform to make a difference in your community.
            </p>
            <div className="flex gap-4">
              <Link href="/auth?type=login">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link href="/auth?type=register">
                <Button size="lg" variant="outline">Register</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 