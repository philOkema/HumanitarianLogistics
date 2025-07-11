import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_ROLES } from "@/context/UserContext";

export default function AuthPage() {
  const { user, loginMutation, registerMutation, loading, isInitialized } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  
  // Memoize the auth state to prevent unnecessary re-renders
  const authState = useMemo(() => ({
    isAuthenticated: !!user,
    isLoading: loading || !isInitialized
  }), [user, loading, isInitialized]);
  
  // Handle redirect after authentication
  useEffect(() => {
    if (!authState.isLoading && authState.isAuthenticated) {
      const storedPath = sessionStorage.getItem('redirectAfterLogin') || '/home';
      sessionStorage.removeItem('redirectAfterLogin');
      setRedirectPath(storedPath);
      setShouldRedirect(true);
    }
  }, [authState]);
  
  // Set active tab based on the current route
  useEffect(() => {
    const path = location.split('/')[1];
    if (path === 'login' || path === 'register') {
      setActiveTab(path);
    }
  }, [location]);
  
  // Handle tab change
  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
    setLocation(`/${value}`);
  }, [setLocation]);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: USER_ROLES.BENEFICIARY,
    organization: ""
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Handle login form submission
  const handleLoginSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await loginMutation.mutateAsync({
        email: loginData.email,
        password: loginData.password
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        login: error.message
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [loginData, loginMutation]);
  
  // Handle register form submission
  const handleRegisterSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    if (registerData.password !== registerData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: "Passwords do not match"
      }));
      setIsSubmitting(false);
      return;
    }
    
    try {
      await registerMutation.mutateAsync({
        email: registerData.email,
        password: registerData.password,
        name: registerData.username,
        role: registerData.role
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        register: error.message
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [registerData, registerMutation]);
  
  // Show loading state while checking authentication
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If authenticated, redirect to home or stored path
  if (shouldRedirect) {
    return <Redirect to={redirectPath} />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-primary text-white" />
          </div>
          <CardTitle className="text-2xl text-center text-white">Welcome to HumanitarianAid</CardTitle>
          <CardDescription className="text-center text-gray-300">
            {activeTab === "login" 
              ? "Sign in to your account to continue"
              : "Create a new account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="login" className="text-gray-300 data-[state=active]:text-black">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-gray-300 data-[state=active]:text-black">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                
                {errors.login && (
                  <div className="text-sm text-red-400">{errors.login}</div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-300">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-300">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Enter your password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-300">Role</Label>
                  <Select
                    value={registerData.role}
                    onValueChange={(value) => setRegisterData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={USER_ROLES.DONOR}>Donor</SelectItem>
                      <SelectItem value={USER_ROLES.BENEFICIARY}>Beneficiary</SelectItem>
                      <SelectItem value={USER_ROLES.VOLUNTEER}>Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {errors.register && (
                  <div className="text-sm text-red-400">{errors.register}</div>
                )}
                
                {errors.confirmPassword && (
                  <div className="text-sm text-red-400">{errors.confirmPassword}</div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}