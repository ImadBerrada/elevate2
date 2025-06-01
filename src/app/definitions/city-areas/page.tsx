"use client";

import { motion } from "framer-motion";
import { 
  MapPin, 
  Map, 
  Building2, 
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function CityAreas() {
  const cityAreas = [
    {
      id: 1,
      name: "Downtown",
      city: "Dubai",
      country: "UAE",
      population: "125K",
      properties: 45,
      businesses: 234,
      status: "active",
      zone: "Commercial"
    },
    {
      id: 2,
      name: "Business Bay",
      city: "Dubai",
      country: "UAE",
      population: "89K",
      properties: 67,
      businesses: 189,
      status: "active",
      zone: "Mixed-Use"
    },
    {
      id: 3,
      name: "Marina",
      city: "Dubai",
      country: "UAE",
      population: "156K",
      properties: 78,
      businesses: 145,
      status: "active",
      zone: "Residential"
    },
    {
      id: 4,
      name: "Manhattan",
      city: "New York",
      country: "USA",
      population: "1.6M",
      properties: 234,
      businesses: 567,
      status: "active",
      zone: "Commercial"
    },
    {
      id: 5,
      name: "Brooklyn Heights",
      city: "New York",
      country: "USA",
      population: "89K",
      properties: 123,
      businesses: 78,
      status: "active",
      zone: "Residential"
    },
    {
      id: 6,
      name: "Canary Wharf",
      city: "London",
      country: "UK",
      population: "45K",
      properties: 89,
      businesses: 345,
      status: "expanding",
      zone: "Financial"
    }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <motion.header 
          className="glass-header sticky top-0 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-4"
                {...fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Map className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">City Areas</h1>
                    <p className="text-sm text-muted-foreground">Manage districts and areas within cities</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search areas..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Area
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-8 py-8">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Areas
                  </CardTitle>
                  <Map className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">156</div>
                  <p className="text-sm text-green-600 font-medium">+12 this quarter</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Zones
                  </CardTitle>
                  <MapPin className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">142</div>
                  <p className="text-sm text-green-600 font-medium">91% operational</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Properties
                  </CardTitle>
                  <Building2 className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">1,247</div>
                  <p className="text-sm text-muted-foreground">Across all areas</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Population
                  </CardTitle>
                  <Users className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">2.8M</div>
                  <p className="text-sm text-green-600 font-medium">Total residents</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Areas List */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Map className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">City Areas Directory</CardTitle>
                    <CardDescription>
                      Manage districts and zones across all cities
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cityAreas.map((area, index) => (
                    <motion.div 
                      key={area.id}
                      className="glass-card p-6 rounded-2xl hover-lift group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <motion.div 
                            className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                          >
                            <MapPin className="w-6 h-6 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{area.name}</h3>
                            <p className="text-sm text-muted-foreground">{area.city}, {area.country}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={area.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {area.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Zone Type:</span>
                          <span className="font-medium">{area.zone}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Population:</span>
                          <span className="font-medium">{area.population}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Properties:</span>
                          <span className="font-medium">{area.properties}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Businesses:</span>
                          <span className="font-medium">{area.businesses}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-4 border-t border-border/30">
                        <Button size="sm" className="btn-premium flex-1">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                          <Trash2 className="w-4 h-4" />
                        </Button>
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