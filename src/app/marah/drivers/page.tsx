"use client";

import { motion } from "framer-motion";
import { 
  Car, 
  User, 
  MapPin, 
  Clock,
  Star,
  Phone,
  Mail,
  TrendingUp,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export default function MarahDrivers() {
  const drivers = [
    {
      id: 1,
      name: "Ahmed Al-Rashid",
      phone: "+971 50 123 4567",
      email: "ahmed.rashid@marah.com",
      vehicle: "Toyota Camry 2023",
      license: "DXB-2023-001",
      rating: 4.8,
      deliveries: 247,
      status: "online",
      location: "Downtown Dubai"
    },
    {
      id: 2,
      name: "Omar Hassan",
      phone: "+971 55 234 5678",
      email: "omar.hassan@marah.com",
      vehicle: "Honda Civic 2022",
      license: "DXB-2022-089",
      rating: 4.6,
      deliveries: 189,
      status: "busy",
      location: "Business Bay"
    },
    {
      id: 3,
      name: "Khalid Mohammed",
      phone: "+971 52 345 6789",
      email: "khalid.mohammed@marah.com",
      vehicle: "Nissan Altima 2023",
      license: "DXB-2023-045",
      rating: 4.9,
      deliveries: 312,
      status: "online",
      location: "Marina"
    },
    {
      id: 4,
      name: "Saeed Abdullah",
      phone: "+971 56 456 7890",
      email: "saeed.abdullah@marah.com",
      vehicle: "Hyundai Elantra 2022",
      license: "DXB-2022-156",
      rating: 4.5,
      deliveries: 156,
      status: "offline",
      location: "Jumeirah"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "busy": return "bg-yellow-500";
      case "offline": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

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
                    <Car className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Drivers</h1>
                    <p className="text-sm text-muted-foreground">Manage delivery drivers and fleet</p>
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
                    placeholder="Search drivers..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Driver
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
                    Total Drivers
                  </CardTitle>
                  <Car className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">89</div>
                  <p className="text-sm text-green-600 font-medium">+12 this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Online Now
                  </CardTitle>
                  <User className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">67</div>
                  <p className="text-sm text-green-600 font-medium">75% availability</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Rating
                  </CardTitle>
                  <Star className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">4.7</div>
                  <p className="text-sm text-green-600 font-medium">Excellent service</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Daily Deliveries
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">1,247</div>
                  <p className="text-sm text-green-600 font-medium">+18% from yesterday</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Drivers List */}
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
                    <Car className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Driver Fleet</CardTitle>
                    <CardDescription>
                      Manage and monitor all delivery drivers
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {drivers.map((driver, index) => (
                    <motion.div 
                      key={driver.id}
                      className="glass-card p-6 rounded-2xl hover-lift group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                            <AvatarImage src={`/api/placeholder/64/64?text=${driver.name.split(' ').map(n => n[0]).join('')}`} />
                            <AvatarFallback className="gradient-primary text-white text-lg">
                              {driver.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(driver.status)} rounded-full border-2 border-white`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg text-foreground">{driver.name}</h3>
                            <Badge 
                              variant={driver.status === "online" ? "default" : driver.status === "busy" ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {driver.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{driver.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Car className="w-4 h-4" />
                              <span>{driver.vehicle}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{driver.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{driver.rating}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {driver.deliveries} deliveries
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-4 border-t border-border/30">
                            <Button size="sm" className="btn-premium flex-1">
                              <Phone className="w-4 h-4 mr-2" />
                              Call
                            </Button>
                            <Button size="sm" variant="outline" className="glass-card border-0 hover-glow flex-1">
                              <MapPin className="w-4 h-4 mr-2" />
                              Track
                            </Button>
                          </div>
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