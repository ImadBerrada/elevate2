"use client";

import { motion } from "framer-motion";
import { MapPin, Building2, Users, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export default function Cities() {
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
                    <MapPin className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-elegant text-gradient">Cities Management</h1>
                    <p className="text-sm text-muted-foreground font-refined">Geographic Definitions</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add City
                </Button>
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
              Cities & Locations
            </h2>
            <p className="text-refined text-muted-foreground">
              Manage geographic definitions and location data across all business units.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>Total Cities</span>
                  </CardTitle>
                  <CardDescription>Registered locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">47</div>
                  <p className="text-sm text-green-600">+3 new this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span>Active Areas</span>
                  </CardTitle>
                  <CardDescription>Service coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">156</div>
                  <p className="text-sm text-blue-600">Across all cities</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Population</span>
                  </CardTitle>
                  <CardDescription>Total coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">2.4M</div>
                  <p className="text-sm text-purple-600">People served</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>Coverage</span>
                  </CardTitle>
                  <CardDescription>Geographic reach</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">89%</div>
                  <p className="text-sm text-green-600">Market penetration</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <div>
                  <CardTitle className="text-xl font-elegant">City Directory</CardTitle>
                  <CardDescription className="text-refined">
                    Manage cities and their operational status
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: "Dubai", country: "UAE", areas: 24, population: "3.5M", status: "active" },
                    { name: "Abu Dhabi", country: "UAE", areas: 18, population: "1.8M", status: "active" },
                    { name: "Sharjah", country: "UAE", areas: 12, population: "1.2M", status: "active" },
                    { name: "Ajman", country: "UAE", areas: 8, population: "540K", status: "active" },
                    { name: "Ras Al Khaimah", country: "UAE", areas: 6, population: "420K", status: "pending" },
                    { name: "Fujairah", country: "UAE", areas: 4, population: "280K", status: "active" }
                  ].map((city, index) => (
                    <motion.div 
                      key={index}
                      className="glass-card p-6 rounded-2xl hover-lift group border-refined"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <motion.div 
                          className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-refined"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                          <MapPin className="w-6 h-6 text-white" />
                        </motion.div>
                        <Badge 
                          variant={city.status === "active" ? "default" : "secondary"}
                          className="border-refined"
                        >
                          {city.status}
                        </Badge>
                      </div>
                      
                      <h3 className="font-elegant text-lg text-foreground mb-1">{city.name}</h3>
                      <p className="text-muted-foreground mb-4">{city.country}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Areas:</span>
                          <span className="font-medium">{city.areas}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Population:</span>
                          <span className="font-medium">{city.population}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 