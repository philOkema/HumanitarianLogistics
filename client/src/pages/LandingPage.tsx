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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">HumanitarianAid</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleAboutClick}>About Us</Button>
            {user ? (
              <>
                <Button variant="outline" onClick={handleDashboardClick}>Dashboard</Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => handleAuthClick('login')}>Sign In</Button>
                <Button variant="default" onClick={() => handleAuthClick('register')}>Create Account</Button>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Connecting Those Who Need Help with Those Who Want to Help
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                HumanitarianAid is a platform that brings together beneficiaries, donors, and volunteers to create positive change in communities worldwide.
              </p>
              <div className="flex justify-center space-x-4">
                <Button size="lg" onClick={() => handleAuthClick('register')}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={handleAboutClick}>
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Connect</h3>
                <p className="text-muted-foreground">
                  Join our community of beneficiaries, donors, and volunteers.
                </p>
              </div>
              <div className="text-center p-6">
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
                <p className="text-muted-foreground">
                  Work together to address humanitarian needs in your community.
                </p>
              </div>
              <div className="text-center p-6">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Create Change</h3>
                <p className="text-muted-foreground">
                  Make a real difference in people's lives through coordinated efforts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            © 2024 HumanitarianAid. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 