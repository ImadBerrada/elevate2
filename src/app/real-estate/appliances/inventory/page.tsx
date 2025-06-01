"use client";

import { motion } from "framer-motion";
import { 
  Settings, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Building,
  Wrench,
  Package
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

export default function ApplianceInventory() {
  const appliances = [
    {
      id: "APL-001",
      name: "Central Air Conditioning Unit",
      brand: "Carrier",
      model: "24ABC636A003",
      property: "Marina Tower Complex",
      location: "Rooftop - Unit A",
      category: "HVAC",
      status: "operational",
      condition: "excellent",
      purchaseDate: "2022-03-15",
      warrantyExpiry: "2025-03-15",
      lastMaintenance: "2024-01-10",
      nextMaintenance: "2024-04-10",
      value: "$15,500"
    },
    {
      id: "APL-002",
      name: "Elevator System",
      brand: "Otis",
      model: "Gen2-MRL",
      property: "Business Bay Office Center",
      location: "Main Elevator Bank",
      category: "Elevator",
      status: "operational",
      condition: "good",
      purchaseDate: "2021-08-20",
      warrantyExpiry: "2024-08-20",
      lastMaintenance: "2024-01-05",
      nextMaintenance: "2024-02-05",
      value: "$85,000"
    },
    {
      id: "APL-003",
      name: "Commercial Dishwasher",
      brand: "Hobart",
      model: "CXi-6",
      property: "Downtown Retail Plaza",
      location: "Restaurant Kitchen",
      category: "Kitchen",
      status: "maintenance",
      condition: "fair",
      purchaseDate: "2020-11-12",
      warrantyExpiry: "2023-11-12",
      lastMaintenance: "2024-01-18",
      nextMaintenance: "2024-01-25",
      value: "$8,200"
    },
    {
      id: "APL-004",
      name: "Pool Filtration System",
      brand: "Pentair",
      model: "IntelliFlo VSF",
      property: "Jumeirah Villa Estate",
      location: "Pool Equipment Room",
      category: "Pool",
      status: "operational",
      condition: "excellent",
      purchaseDate: "2023-05-08",
      warrantyExpiry: "2026-05-08",
      lastMaintenance: "2024-01-12",
      nextMaintenance: "2024-03-12",
      value: "$3,800"
    },
    {
      id: "APL-005",
      name: "Fire Safety System",
      brand: "Honeywell",
      model: "NOTIFIER-3030",
      property: "Marina Tower Complex",
      location: "Central Control Room",
      category: "Safety",
      status: "operational",
      condition: "good",
      purchaseDate: "2022-01-30",
      warrantyExpiry: "2025-01-30",
      lastMaintenance: "2024-01-08",
      nextMaintenance: "2024-07-08",
      value: "$12,500"
    }
  ];

  const categories = [
    { name: "HVAC", count: 45, value: "$680K", color: "bg-blue-500" },
    { name: "Elevator", count: 12, value: "$920K", color: "bg-green-500" },
    { name: "Kitchen", count: 28, value: "$240K", color: "bg-purple-500" },
    { name: "Pool", count: 8, value: "$85K", color: "bg-orange-500" },
    { name: "Safety", count: 35, value: "$420K", color: "bg-red-500" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-green-600";
      case "maintenance": return "text-yellow-600";
      case "repair": return "text-red-600";
      case "retired": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-100 text-green-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      case "repair": return "bg-red-100 text-red-800";
      case "retired": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "fair": return "text-yellow-600";
      case "poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getConditionBg = (condition: string) => {
    switch (condition) {
      case "excellent": return "bg-green-100 text-green-800";
      case "good": return "bg-blue-100 text-blue-800";
      case "fair": return "bg-yellow-100 text-yellow-800";
      case "poor": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return CheckCircle;
      case "maintenance": return Wrench;
      case "repair": return AlertTriangle;
      case "retired": return Clock;
      default: return Clock;
    }
  };

  const isWarrantyExpiring = (warrantyDate: string) => {
    const expiry = new Date(warrantyDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90;
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
                    <Package className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Appliance Inventory</h1>
                    <p className="text-sm text-muted-foreground">Asset tracking and maintenance management</p>
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
                    placeholder="Search appliances..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Appliance
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
                    Total Assets
                  </CardTitle>
                  <Package className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">1,247</div>
                  <p className="text-sm text-green-600 font-medium">+23 this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Operational
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">1,156</div>
                  <p className="text-sm text-green-600 font-medium">92.7% uptime</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-yellow-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Maintenance Due
                  </CardTitle>
                  <Wrench className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">34</div>
                  <p className="text-sm text-yellow-600 font-medium">Next 30 days</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$2.34M</div>
                  <p className="text-sm text-green-600 font-medium">Asset portfolio</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Categories */}
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
                      <CardTitle>Asset Categories</CardTitle>
                      <CardDescription>
                        Distribution by appliance type
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map((category, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${category.color}`} />
                          <span className="font-medium text-foreground">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{category.count}</p>
                          <p className="text-sm text-muted-foreground">{category.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Maintenance Schedule */}
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
                      <Calendar className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Maintenance Overview</CardTitle>
                      <CardDescription>
                        Upcoming maintenance and warranty status
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Maintenance Schedule</h4>
                      {[
                        { period: "This Week", count: 8, status: "urgent" },
                        { period: "Next Week", count: 12, status: "scheduled" },
                        { period: "This Month", count: 34, status: "planned" },
                        { period: "Next Month", count: 28, status: "upcoming" }
                      ].map((item, index) => (
                        <motion.div 
                          key={index}
                          className="glass-card p-3 rounded-lg"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{item.period}</span>
                            <Badge 
                              variant={item.status === "urgent" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {item.count} items
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Warranty Status</h4>
                      <div className="space-y-3">
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Active Warranties</p>
                          <p className="text-lg font-bold text-gradient">892</p>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Expiring Soon</p>
                          <p className="text-lg font-bold text-orange-600">23</p>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Expired</p>
                          <p className="text-lg font-bold text-red-600">332</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Appliance List */}
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
                    <Package className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Appliance Inventory</CardTitle>
                    <CardDescription>
                      Detailed asset tracking and management
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appliances.map((appliance, index) => {
                    const StatusIcon = getStatusIcon(appliance.status);
                    const warrantyExpiring = isWarrantyExpiring(appliance.warrantyExpiry);
                    return (
                      <motion.div 
                        key={appliance.id}
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
                              <StatusIcon className="w-6 h-6 text-white" />
                            </motion.div>
                            
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{appliance.id}</h3>
                                <Badge 
                                  className={`text-xs ${getStatusBg(appliance.status)}`}
                                  variant="outline"
                                >
                                  {appliance.status}
                                </Badge>
                                <Badge 
                                  className={`text-xs ${getConditionBg(appliance.condition)}`}
                                  variant="outline"
                                >
                                  {appliance.condition}
                                </Badge>
                                {warrantyExpiring && (
                                  <Badge variant="destructive" className="text-xs">
                                    Warranty Expiring
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium text-foreground mb-1">
                                {appliance.name} • {appliance.brand} {appliance.model}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <span>{appliance.property}</span>
                                <span>•</span>
                                <span>{appliance.location}</span>
                                <span>•</span>
                                <span>{appliance.category}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Last Maintenance: {appliance.lastMaintenance}</span>
                                <span>•</span>
                                <span>Next Due: {appliance.nextMaintenance}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-2 gap-4 text-center mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Asset Value</p>
                                <p className="text-lg font-bold text-gradient">{appliance.value}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Warranty</p>
                                <p className={`font-bold ${warrantyExpiring ? 'text-red-600' : 'text-green-600'}`}>
                                  {appliance.warrantyExpiry}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button size="sm" className="btn-premium">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                <Wrench className="w-4 h-4 mr-2" />
                                Maintain
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 