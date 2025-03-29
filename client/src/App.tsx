import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Pages
// @ts-ignore - JSX imports
import LandingPage from "@/pages/LandingPage";
// @ts-ignore - JSX imports
import LoginPage from "@/pages/LoginPage";
// @ts-ignore - JSX imports
import RegisterPage from "@/pages/RegisterPage";
// @ts-ignore - JSX imports
import VolunteerPage from "@/pages/VolunteerPage";
// @ts-ignore - JSX imports
import DashboardPage from "@/pages/DashboardPage";
// @ts-ignore - JSX imports
import DistributionPage from "@/pages/DistributionPage";
// @ts-ignore - JSX imports
import InventoryPage from "@/pages/InventoryPage";
// @ts-ignore - JSX imports
import RequestPage from "@/pages/RequestPage";
// @ts-ignore - JSX imports
import BeneficiariesPage from "@/pages/BeneficiariesPage";
// @ts-ignore - JSX imports
import AnalyticsPage from "@/pages/AnalyticsPage";
// @ts-ignore - JSX imports
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/volunteer" component={VolunteerPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/distribution" component={DistributionPage} />
        <Route path="/inventory" component={InventoryPage} />
        <Route path="/request" component={RequestPage} />
        <Route path="/beneficiaries" component={BeneficiariesPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
