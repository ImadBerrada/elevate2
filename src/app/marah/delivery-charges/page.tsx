"use client";

import { motion } from "framer-motion";
import { 
  Truck, 
  MapPin, 
  DollarSign,
  TrendingUp,
  Clock,
  Calculator,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Settings,
  BarChart3
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

export default function DeliveryCharges() {
  const deliveryZones = [
    {
      id: "ZONE-001",
      name: "Downtown Dubai",
      baseRate: "$5.00",
      perKmRate: "$0.80",
      avgDeliveryTime: "25 min",
      totalDeliveries: 1240,
      revenue: "$8,450",
      status: "active"
    },
    {
      id: "ZONE-002",
      name: "Dubai Marina",
      baseRate: "$6.00",
      perKmRate: "$0.90",
      avgDeliveryTime: "30 min",
      totalDeliveries: 890,
      revenue: "$6,780",
      status: "active"
    },
    {
      id: "ZONE-003",
      name: "Business Bay",
      baseRate: "$5.50",
      perKmRate: "$0.85",
      avgDeliveryTime: "28 min",
      totalDeliveries: 1050,
      revenue: "$7,200",
      status: "active"
    },
    {
      id: "ZONE-004",
      name: "Jumeirah",
      baseRate: "$7.00",
      perKmRate: "$1.00",
      avgDeliveryTime: "35 min",
      totalDeliveries: 650,
      revenue: "$5,890",
      status: "active"
    },
    {
      id: "ZONE-005",
      name: "Dubai Hills",
      baseRate: "$8.00",
      perKmRate: "$1.20",
      avgDeliveryTime: "40 min",
      totalDeliveries: 420,
      revenue: "$4,320",
      status: "limited"
    }
  ];

  const pricingModels = [
    {
      name: "Standard Delivery",
      description: "Regular delivery service",
      baseRate: "$5.00",
      timeMultiplier: "1.0x",
      distanceRate: "$0.80/km",
      popularity: 65
    },
    {
      name: "Express Delivery",
      description: "Fast delivery within 20 minutes",
      baseRate: "$8.00",
      timeMultiplier: "1.5x",
      distanceRate: "$1.20/km",
      popularity: 25
    },
    {
      name: "Scheduled Delivery",
      description: "Delivery at specific time",
      baseRate: "$6.00",
      timeMultiplier: "1.2x",
      distanceRate: "$0.90/km",
      popularity: 10
    }
  ];

  const recentCharges = [
    {
      id: "CHG-001",
      orderId: "ORD-12450",
      customer: "Ahmed Al-Mansouri",
      zone: "Downtown Dubai",
      distance: "3.2 km",
      deliveryType: "Express",
      baseCharge: "$8.00",
      distanceCharge: "$3.84",
      totalCharge: "$11.84",
      status: "completed"
    },
    {
      id: "CHG-002",
      orderId: "ORD-12451",
      customer: "Sarah Johnson",
      zone: "Dubai Marina",
      distance: "2.8 km",
      deliveryType: "Standard",
      baseCharge: "$6.00",
      distanceCharge: "$2.52",
      totalCharge: "$8.52",
      status: "completed"
    },
    {
      id: "CHG-003",
      orderId: "ORD-12452",
      customer: "Maria Garcia",
      zone: "Business Bay",
      distance: "4.1 km",
      deliveryType: "Scheduled",
      baseCharge: "$6.00",
      distanceCharge: "$3.49",
      totalCharge: "$9.49",
      status: "pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600";
      case "limited": return "text-yellow-600";
      case "inactive": return "text-red-600";
      case "completed": return "text-green-600";
      case "pending": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "limited": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
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
                    <Calculator className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Delivery Charges</h1>
                    <p className="text-sm text-muted-foreground">Pricing models and zone-based rates</p>
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
                    placeholder="Search zones..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Zone
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
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$32.6K</div>
                  <p className="text-sm text-green-600 font-medium">+15.2% vs last month</p>
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
                  <div className="text-3xl font-bold text-gradient mb-2">12</div>
                  <p className="text-sm text-green-600 font-medium">2 new this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Charge
                  </CardTitle>
                  <Calculator className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$8.45</div>
                  <p className="text-sm text-green-600 font-medium">+$0.32 vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Delivery Time
                  </CardTitle>
                  <Clock className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">28 min</div>
                  <p className="text-sm text-green-600 font-medium">-2 min vs last month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Pricing Models */}
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
                      <Settings className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Pricing Models</CardTitle>
                      <CardDescription>
                        Delivery service types
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pricingModels.map((model, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{model.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {model.popularity}% usage
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Base Rate</p>
                            <p className="font-semibold text-foreground">{model.baseRate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Distance Rate</p>
                            <p className="font-semibold text-foreground">{model.distanceRate}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Zone Performance */}
            <motion.div 
              className="lg:col-span-2"
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <BarChart3 className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Zone Performance</CardTitle>
                      <CardDescription>
                        Revenue and delivery metrics by zone
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deliveryZones.map((zone, index) => (
                      <motion.div 
                        key={zone.id}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-foreground">{zone.name}</h4>
                            <Badge 
                              className={`text-xs ${getStatusBg(zone.status)}`}
                              variant="outline"
                            >
                              {zone.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gradient">{zone.revenue}</p>
                            <p className="text-sm text-muted-foreground">{zone.totalDeliveries} deliveries</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Base Rate</p>
                            <p className="font-semibold text-foreground">{zone.baseRate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Per KM</p>
                            <p className="font-semibold text-foreground">{zone.perKmRate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Time</p>
                            <p className="font-semibold text-foreground">{zone.avgDeliveryTime}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Charges */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.8 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <DollarSign className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Recent Delivery Charges</CardTitle>
                    <CardDescription>
                      Latest charge calculations and breakdowns
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCharges.map((charge, index) => (
                    <motion.div 
                      key={charge.id}
                      className="glass-card p-6 rounded-2xl hover-lift group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <motion.div 
                            className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                          >
                            <Truck className="w-6 h-6 text-white" />
                          </motion.div>
                          
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-semibold text-lg text-foreground">{charge.orderId}</h3>
                              <Badge 
                                className={`text-xs ${getStatusBg(charge.status)}`}
                                variant="outline"
                              >
                                {charge.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {charge.deliveryType}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">Customer: {charge.customer}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <span>Zone: {charge.zone}</span>
                              <span>•</span>
                              <span>Distance: {charge.distance}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Base: {charge.baseCharge}</span>
                              <span>•</span>
                              <span>Distance: {charge.distanceCharge}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground">Total Charge</p>
                            <p className="text-2xl font-bold text-gradient">{charge.totalCharge}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="btn-premium">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                              <Edit className="w-4 h-4 mr-2" />
                              Adjust
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