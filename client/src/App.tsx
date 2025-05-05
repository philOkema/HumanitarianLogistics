import React from 'react';
import { Route, Switch, Redirect } from 'wouter';
import { UserProvider } from './context/UserContext';
import { InventoryProvider } from './context/InventoryContext';
import { DistributionProvider } from './context/DistributionContext';
import { AidRequestProvider } from './context/AidRequestContext';
import { AuthProvider } from './hooks/use-auth';
import { RoleBasedRoute, UnauthenticatedRoute } from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import AuthPage from './pages/auth-page';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import DonationsPage from './pages/DonationsPage';
import BeneficiaryPage from './pages/BeneficiaryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DistributionPage from './pages/DistributionPage';
import FeedbackPage from './pages/FeedbackPage';
import RequestPage from './pages/RequestPage';
import AdminPage from './pages/AdminPage';
import DeliveriesPage from './pages/DeliveriesPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserProvider>
            <AidRequestProvider>
              <InventoryProvider>
                <DistributionProvider>
                  <Toaster />
                  <MainLayout>
                    <Switch>
                      {/* Public routes */}
                      <Route path="/">
                        <LandingPage />
                      </Route>
                      <Route path="/about">
                        <AboutPage />
                      </Route>
                      
                      {/* Auth routes - only accessible when not logged in */}
                      <Route path="/auth">
                        <Redirect to="/login" />
                      </Route>
                      <Route path="/login">
                        <UnauthenticatedRoute component={AuthPage} />
                      </Route>
                      <Route path="/register">
                        <UnauthenticatedRoute component={AuthPage} />
                      </Route>
                      
                      {/* Protected routes with role-based access */}
                      <Route path="/home">
                        <RoleBasedRoute component={HomePage} requiredRoles={['admin', 'staff', 'donor', 'beneficiary', 'volunteer']} />
                      </Route>
                      
                      <Route path="/dashboard">
                        <RoleBasedRoute component={DashboardPage} requiredRoles={['admin', 'staff', 'volunteer', 'beneficiary', 'donor']} />
                      </Route>
                      
                      <Route path="/admin-dashboard">
                        <RoleBasedRoute component={AdminPage} requiredRoles={['admin']} />
                      </Route>
                      
                      <Route path="/inventory">
                        <RoleBasedRoute component={InventoryPage} requiredRoles={['admin', 'staff', 'volunteer']} />
                      </Route>
                      
                      <Route path="/donations">
                        <RoleBasedRoute component={DonationsPage} requiredRoles={['admin', 'staff', 'donor']} />
                      </Route>
                      
                      <Route path="/distribution">
                        <RoleBasedRoute component={DistributionPage} requiredRoles={['admin', 'staff', 'volunteer']} />
                      </Route>
                      
                      <Route path="/deliveries">
                        <RoleBasedRoute component={DeliveriesPage} requiredRoles={['volunteer']} />
                      </Route>
                      
                      <Route path="/beneficiaries">
                        <RoleBasedRoute component={BeneficiaryPage} requiredRoles={['admin', 'staff', 'beneficiary']} />
                      </Route>
                      
                      <Route path="/analytics">
                        <RoleBasedRoute component={AnalyticsPage} requiredRoles={['admin', 'staff']} />
                      </Route>
                      
                      <Route path="/feedback">
                        <RoleBasedRoute component={FeedbackPage} requiredRoles={['admin', 'staff', 'donor', 'beneficiary', 'volunteer']} />
                      </Route>
                      
                      <Route path="/profile">
                        <RoleBasedRoute component={ProfilePage} requiredRoles={['admin', 'staff', 'donor', 'beneficiary', 'volunteer']} />
                      </Route>
                      
                      <Route path="/request/new">
                        <RoleBasedRoute component={RequestPage} requiredRoles={['admin', 'staff', 'beneficiary']} />
                      </Route>

                      <Route path="/request/:id">
                        <RoleBasedRoute component={RequestPage} requiredRoles={['admin', 'staff', 'beneficiary']} />
                      </Route>

                      <Route path="/request">
                        <RoleBasedRoute component={RequestPage} requiredRoles={['admin', 'staff', 'beneficiary']} />
                      </Route>
                      
                      <Route path="/settings">
                        <RoleBasedRoute component={SettingsPage} requiredRoles={['admin']} />
                      </Route>
                      
                      {/* Catch all route - redirect to home */}
                      <Route>
                        <Redirect to="/home" />
                      </Route>
                    </Switch>
                  </MainLayout>
                </DistributionProvider>
              </InventoryProvider>
            </AidRequestProvider>
          </UserProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
