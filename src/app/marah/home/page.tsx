"use client";

import { motion } from "framer-motion";
import { Car, Users, TrendingUp, Gamepad2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export default function MarahHome() {
  const { isOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? 'ml-0' : 'ml-0'}`}>
        <motion.header 
          className="glass-header sticky top-0 z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <BurgerMenu />
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Car className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-elegant text-gradient">MARAH Delivery Hub</h1>
                    <p className="text-sm text-muted-foreground font-refined">Gaming & Delivery Operations</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-6 py-6">
          <motion.div 
            className="mb-8"
            {...fadeInUp}
          >
            <h2 className="text-2xl font-prestigious text-gradient mb-2">
              MARAH Operations Center
            </h2>
            <p className="text-refined text-muted-foreground">
              Gaming platform and delivery service management dashboard.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="w-5 h-5 text-primary" />
                    <span>Active Drivers</span>
                  </CardTitle>
                  <CardDescription>Currently online drivers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">47</div>
                  <p className="text-sm text-green-600">+8 new this week</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Customers</span>
                  </CardTitle>
                  <CardDescription>Active user base</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">2,847</div>
                  <p className="text-sm text-green-600">+15.2% growth</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span>Revenue</span>
                  </CardTitle>
                  <CardDescription>Monthly earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">$1.5M</div>
                  <p className="text-sm text-green-600">+25.7% increase</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                    <span>Games Played</span>
                  </CardTitle>
                  <CardDescription>Total gaming sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">12,456</div>
                  <p className="text-sm text-green-600">+32% engagement</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
} 