"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  Settings, 
  Users, 
  Wrench,
  DollarSign,
  Calendar,
  MapPin,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock
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

export default function PropertyManagement() {
  const properties = [
    {
      id: 1,
      name: "Marina Tower Complex",
      address: "Dubai Marina, Tower A",
      type: "Residential",
      units: 45,
      occupancy: 42,
      occupancyRate: "93%",
      monthlyRevenue: "$180,000",
      maintenanceStatus: "good",
      lastInspection: "2024-01-15",
      manager: "Sarah Johnson"
    },
    {
      id: 2,
      name: "Business Bay Office Center",
      address: "Business Bay, Building B",
      type: "Commercial",
      units: 28,
      occupancy: 25,
      occupancyRate: "89%",
      monthlyRevenue: "$420,000",
      maintenanceStatus: "excellent",
      lastInspection: "2024-01-10",
      manager: "Ahmed Al-Rashid"
    },
    {
      id: 3,
      name: "Downtown Retail Plaza",
      address: "Downtown Dubai, Plaza C",
      type: "Retail",
      units: 18,
      occupancy: 16,
      occupancyRate: "89%",
      monthlyRevenue: "$280,000",
      maintenanceStatus: "needs-attention",
      lastInspection: "2024-01-08",
      manager: "Maria Garcia"
    },
    {
      id: 4,
      name: "Jumeirah Villa Estate",
      address: "Jumeirah, Villa District",
      type: "Luxury Residential",
      units: 12,
      occupancy: 11,
      occupancyRate: "92%",
      monthlyRevenue: "$350,000",
      maintenanceStatus: "good",
      lastInspection: "2024-01-12",
      manager: "David Chen"
    }
  ];

  const maintenanceRequests = [
    {
      id: "MR-001",
      property: "Marina Tower Complex",
      unit: "Unit 15A",
      issue: "Air conditioning repair",
      priority: "high",
      status: "in-progress",
      assignedTo: "Tech Team Alpha",
      requestDate: "2024-01-18",
      estimatedCost: "$850"
    },
    {
      id: "MR-002",
      property: "Business Bay Office Center",
      unit: "Floor 8",
      issue: "Elevator maintenance",
      priority: "medium",
      status: "scheduled",
      assignedTo: "Elevator Services Inc",
      requestDate: "2024-01-17",
      estimatedCost: "$1,200"
    },
    {
      id: "MR-003",
      property: "Downtown Retail Plaza",
      unit: "Shop 5",
      issue: "Plumbing leak",
      priority: "urgent",
      status: "pending",
      assignedTo: "Emergency Plumbing",
      requestDate: "2024-01-19",
      estimatedCost: "$450"
    }
  ];

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "needs-attention": return "text-yellow-600";
      case "poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getMaintenanceStatusBg = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-100 text-green-800";
      case "good": return "bg-blue-100 text-blue-800";
      case "needs-attention": return "bg-yellow-100 text-yellow-800";
      case "poor": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "in-progress": return Clock;
      case "scheduled": return Calendar;
      case "pending": return AlertTriangle;
      default: return Clock;
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
                    <Building2 className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Property Management</h1>
                    <p className="text-sm text-muted-foreground">Comprehensive property oversight and operations</p>
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
                    placeholder="Search properties..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
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
                    Total Properties
                  </CardTitle>
                  <Building2 className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">247</div>
                  <p className="text-sm text-green-600 font-medium">+12 this quarter</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Occupancy Rate
                  </CardTitle>
                  <Users className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">91.2%</div>
                  <p className="text-sm text-green-600 font-medium">Above target (90%)</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$2.4M</div>
                  <p className="text-sm text-green-600 font-medium">+8.5% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Maintenance Requests
                  </CardTitle>
                  <Wrench className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">23</div>
                  <p className="text-sm text-yellow-600 font-medium">3 urgent pending</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Property Overview */}
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
                      <Building2 className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Property Portfolio</CardTitle>
                      <CardDescription>
                        Overview of managed properties
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {properties.map((property, index) => (
                      <motion.div 
                        key={property.id}
                        className="glass-card p-4 rounded-xl hover-lift"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{property.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{property.address}</span>
                            </div>
                          </div>
                          <Badge 
                            className={`text-xs ${getMaintenanceStatusBg(property.maintenanceStatus)}`}
                            variant="outline"
                          >
                            {property.maintenanceStatus}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Occupancy</p>
                            <p className="font-semibold text-gradient">{property.occupancyRate}</p>
                            <p className="text-xs text-muted-foreground">{property.occupancy}/{property.units} units</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Revenue</p>
                            <p className="font-semibold text-foreground">{property.monthlyRevenue}</p>
                            <p className="text-xs text-muted-foreground">Monthly</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Manager</p>
                            <p className="font-semibold text-foreground">{property.manager}</p>
                            <p className="text-xs text-muted-foreground">Property Manager</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Last inspection: {property.lastInspection}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" className="btn-premium">
                              <Edit className="w-4 h-4 mr-2" />
                              Manage
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Maintenance Requests */}
            <motion.div 
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
                      <Wrench className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Maintenance Requests</CardTitle>
                      <CardDescription>
                        Active maintenance and repair requests
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceRequests.map((request, index) => {
                      const StatusIcon = getRequestStatusIcon(request.status);
                      return (
                        <motion.div 
                          key={request.id}
                          className="glass-card p-4 rounded-xl hover-lift"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <StatusIcon className="w-5 h-5 text-primary" />
                              <div>
                                <h4 className="font-semibold text-foreground">{request.id}</h4>
                                <p className="text-sm text-muted-foreground">{request.property}</p>
                              </div>
                            </div>
                            <Badge 
                              className={`text-xs ${getPriorityColor(request.priority)}`}
                              variant="outline"
                            >
                              {request.priority}
                            </Badge>
                          </div>
                          
                          <div className="mb-3">
                            <p className="font-medium text-foreground">{request.issue}</p>
                            <p className="text-sm text-muted-foreground">{request.unit}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Assigned To</p>
                              <p className="font-semibold text-foreground">{request.assignedTo}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Est. Cost</p>
                              <p className="font-semibold text-gradient">{request.estimatedCost}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              Requested: {request.requestDate}
                            </p>
                            <Button size="sm" className="btn-premium">
                              <Settings className="w-4 h-4 mr-2" />
                              Update
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Property Performance Metrics */}
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
                    <Settings className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Property Performance Metrics</CardTitle>
                    <CardDescription>
                      Key performance indicators across the portfolio
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      metric: "Average Occupancy Rate",
                      value: "91.2%",
                      description: "Across all properties",
                      trend: "+2.3%",
                      status: "excellent"
                    },
                    {
                      metric: "Maintenance Response Time",
                      value: "4.2 hours",
                      description: "Average response time",
                      trend: "-0.8 hours",
                      status: "good"
                    },
                    {
                      metric: "Tenant Satisfaction",
                      value: "4.6/5.0",
                      description: "Based on surveys",
                      trend: "+0.2",
                      status: "excellent"
                    },
                    {
                      metric: "Revenue per Unit",
                      value: "$2,847",
                      description: "Monthly average",
                      trend: "+$185",
                      status: "good"
                    },
                    {
                      metric: "Maintenance Cost Ratio",
                      value: "8.4%",
                      description: "Of total revenue",
                      trend: "-1.2%",
                      status: "excellent"
                    },
                    {
                      metric: "Lease Renewal Rate",
                      value: "87.3%",
                      description: "Annual renewal rate",
                      trend: "+3.1%",
                      status: "good"
                    }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="glass-card p-4 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{item.metric}</h4>
                        <Badge 
                          variant={item.status === "excellent" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-gradient mb-1">{item.value}</p>
                      <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      <p className="text-sm text-green-600 font-medium">{item.trend}</p>
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