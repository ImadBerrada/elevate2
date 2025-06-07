"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  Home, 
  Users, 
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function RealEstateHome() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0" // Prevent content overflow
      )}>
        <motion.header 
          className={cn(
            "glass-header sticky top-0 z-50 transition-all duration-300",
            isOpen ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: isOpen ? 0 : 1, 
            y: isOpen ? -20 : 0 
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-2 sm:space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <BurgerMenu />
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <motion.div
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                  </motion.div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg sm:text-xl font-elegant text-gradient">Real Estate Portfolio</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground font-refined">Property Management Hub</p>
                  </div>
                  <div className="sm:hidden">
                    <h1 className="text-base font-elegant text-gradient">Real Estate</h1>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <motion.div 
            className="mb-4 sm:mb-6 lg:mb-8"
            {...fadeInUp}
          >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-prestigious text-gradient mb-2">
              Real Estate Management Center
            </h2>
            <p className="text-refined text-muted-foreground text-xs sm:text-sm lg:text-base">
              Comprehensive property portfolio management and analytics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Properties</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Total managed properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">23</div>
                  <p className="text-xs sm:text-sm text-green-600">+2 new acquisitions</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Tenants</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Active tenant accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">89</div>
                  <p className="text-xs sm:text-sm text-green-600">96% occupancy rate</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Revenue</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Monthly rental income</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">$2.8M</div>
                  <p className="text-xs sm:text-sm text-green-600">+12.3% growth</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Portfolio Value</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Total property value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">$45.2M</div>
                  <p className="text-xs sm:text-sm text-green-600">+8.7% appreciation</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
} 