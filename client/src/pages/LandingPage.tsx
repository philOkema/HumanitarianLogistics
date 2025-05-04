import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Globe, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage(): JSX.Element {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleAuthClick = (type: 'login' | 'register') => {
    setLocation(`/${type}`);
  };

  const handleAboutClick = () => {
    setLocation("/about");
  };

  const handleLogout = () => {
    logout();
  };

  const handleDashboardClick = () => {
    setLocation('/home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary text-white" />
            <span className="text-xl font-bold text-white">HumanitarianAid</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <Button variant="ghost" onClick={handleAboutClick} className="text-gray-300 hover:text-white">About Us</Button>
            {user ? (
              <>
                <Button variant="outline" onClick={handleDashboardClick} className="text-gray-300 hover:text-white">Dashboard</Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => handleAuthClick('login')} className="text-gray-900 text-white">Sign In</Button>
                <Button variant="default" onClick={() => handleAuthClick('register')} className="text-white">Create Account</Button>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-12 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
                Connecting Those Who Need Help with Those Who Want to Help
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
                HumanitarianAid is a platform that brings together beneficiaries, donors, and volunteers to create positive change in communities worldwide.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" onClick={() => handleAuthClick('register')} className="text-white w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={handleAboutClick} className="text-black w-full sm:w-auto">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-20 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-white">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-6 bg-gray-800 rounded-lg">
                <Users className="h-12 w-12 text-primary text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Connect</h3>
                <p className="text-gray-300">
                  Join our community of beneficiaries, donors, and volunteers.
                </p>
              </div>
              <div className="text-center p-6 bg-gray-800 rounded-lg">
                <Globe className="h-12 w-12 text-primary text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Collaborate</h3>
                <p className="text-gray-300">
                  Work together to address humanitarian needs in your community.
                </p>
              </div>
              <div className="text-center p-6 bg-gray-800 rounded-lg">
                <Shield className="h-12 w-12 text-primary text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Create Change</h3>
                <p className="text-gray-300">
                  Make a real difference in people's lives through coordinated efforts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center text-gray-300">
            © 2024 HumanitarianAid. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 