"use client";

import { motion } from "framer-motion";
import { 
  Wrench, 
  Calendar, 
  Users, 
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
  Phone,
  Mail
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

export default function PropertyMaintenance() {
  const maintenanceRequests = [
    {
      id: "MNT-001",
      property: "Marina Tower Complex",
      unit: "Unit 15A",
      issue: "HVAC System Not Working",
      priority: "high",
      status: "in-progress",
      requestDate: "2024-01-20",
      scheduledDate: "2024-01-22",
      assignedTo: "CoolTech HVAC Services",
      estimatedCost: "$2,850",
      tenant: "Ahmed Al-Mansouri",
      description: "Air conditioning unit not cooling properly, making unusual noises"
    },
    {
      id: "MNT-002",
      property: "Business Bay Office Center",
      unit: "Floor 8",
      issue: "Elevator Maintenance",
      priority: "medium",
      status: "scheduled",
      requestDate: "2024-01-19",
      scheduledDate: "2024-01-25",
      assignedTo: "Elevator Solutions LLC",
      estimatedCost: "$1,200",
      tenant: "Building Management",
      description: "Routine elevator inspection and maintenance"
    },
    {
      id: "MNT-003",
      property: "Downtown Retail Plaza",
      unit: "Shop 5",
      issue: "Plumbing Leak",
      priority: "urgent",
      status: "pending",
      requestDate: "2024-01-21",
      scheduledDate: "2024-01-21",
      assignedTo: "Quick Fix Plumbing",
      estimatedCost: "$450",
      tenant: "Maria Garcia",
      description: "Water leak in bathroom ceiling, causing damage to inventory"
    },
    {
      id: "MNT-004",
      property: "Jumeirah Villa Estate",
      unit: "Villa 12",
      issue: "Pool Cleaning System",
      priority: "low",
      status: "completed",
      requestDate: "2024-01-15",
      scheduledDate: "2024-01-18",
      assignedTo: "AquaClear Pool Services",
      estimatedCost: "$300",
      tenant: "David Chen",
      description: "Pool filtration system cleaning and chemical balancing"
    },
    {
      id: "MNT-005",
      property: "Marina Tower Complex",
      unit: "Common Area",
      issue: "Lighting Replacement",
      priority: "medium",
      status: "in-progress",
      requestDate: "2024-01-17",
      scheduledDate: "2024-01-20",
      assignedTo: "Bright Lights Electric",
      estimatedCost: "$800",
      tenant: "Building Management",
      description: "Replace LED lighting in lobby and hallways"
    }
  ];

  const vendors = [
    {
      name: "CoolTech HVAC Services",
      specialty: "HVAC & Climate Control",
      phone: "+971 4 123 4567",
      email: "service@cooltech.ae",
      rating: 4.8,
      activeJobs: 3
    },
    {
      name: "Quick Fix Plumbing",
      specialty: "Plumbing & Water Systems",
      phone: "+971 4 234 5678",
      email: "info@quickfix.ae",
      rating: 4.6,
      activeJobs: 2
    },
    {
      name: "Elevator Solutions LLC",
      specialty: "Elevator Maintenance",
      phone: "+971 4 345 6789",
      email: "support@elevatorsolutions.ae",
      rating: 4.9,
      activeJobs: 1
    },
    {
      name: "AquaClear Pool Services",
      specialty: "Pool & Water Features",
      phone: "+971 4 456 7890",
      email: "service@aquaclear.ae",
      rating: 4.7,
      activeJobs: 1
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in-progress": return "text-blue-600";
      case "scheduled": return "text-purple-600";
      case "pending": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "scheduled": return "bg-purple-100 text-purple-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "in-progress": return Wrench;
      case "scheduled": return Calendar;
      case "pending": return Clock;
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
                    <Wrench className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Property Maintenance</h1>
                    <p className="text-sm text-muted-foreground">Maintenance requests and vendor management</p>
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
                    placeholder="Search maintenance..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
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
              <Card className="card-premium border-0 bg-gradient-to-br from-red-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Requests
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">23</div>
                  <p className="text-sm text-red-600 font-medium">5 urgent priority</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </CardTitle>
                  <Wrench className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">8</div>
                  <p className="text-sm text-blue-600 font-medium">Being worked on</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed Today
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">12</div>
                  <p className="text-sm text-green-600 font-medium">+3 vs yesterday</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Cost
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$45.2K</div>
                  <p className="text-sm text-green-600 font-medium">-8.3% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Vendor Management */}
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
                      <Users className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Active Vendors</CardTitle>
                      <CardDescription>
                        Maintenance service providers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vendors.map((vendor, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{vendor.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {vendor.activeJobs} active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{vendor.specialty}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{vendor.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium text-yellow-600">★ {vendor.rating}</span>
                          <Button size="sm" variant="outline" className="text-xs h-6">
                            Contact
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Priority Distribution */}
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
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Request Priority Distribution</CardTitle>
                      <CardDescription>
                        Breakdown by urgency level
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {[
                        { priority: "Urgent", count: 5, percentage: 22, color: "bg-red-500" },
                        { priority: "High", count: 8, percentage: 35, color: "bg-orange-500" },
                        { priority: "Medium", count: 7, percentage: 30, color: "bg-yellow-500" },
                        { priority: "Low", count: 3, percentage: 13, color: "bg-green-500" }
                      ].map((item, index) => (
                        <motion.div 
                          key={index}
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${item.color}`} />
                            <span className="font-medium text-foreground">{item.priority}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{item.count}</p>
                            <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Response Time</h4>
                      <div className="space-y-3">
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Avg Response</p>
                          <p className="text-lg font-bold text-gradient">2.4 hours</p>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Avg Resolution</p>
                          <p className="text-lg font-bold text-gradient">18.5 hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Maintenance Requests */}
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
                    <Wrench className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Maintenance Requests</CardTitle>
                    <CardDescription>
                      Active and recent maintenance requests
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRequests.map((request, index) => {
                    const StatusIcon = getStatusIcon(request.status);
                    return (
                      <motion.div 
                        key={request.id}
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
                                <h3 className="font-semibold text-lg text-foreground">{request.id}</h3>
                                <Badge 
                                  className={`text-xs ${getPriorityBg(request.priority)}`}
                                  variant="outline"
                                >
                                  {request.priority}
                                </Badge>
                                <Badge 
                                  className={`text-xs ${getStatusBg(request.status)}`}
                                  variant="outline"
                                >
                                  {request.status}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-foreground mb-1">{request.issue}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <span>{request.property} - {request.unit}</span>
                                <span>•</span>
                                <span>Tenant: {request.tenant}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{request.description}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-2 gap-4 text-center mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                                <p className="text-lg font-bold text-gradient">{request.estimatedCost}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Scheduled</p>
                                <p className="font-bold text-foreground">{request.scheduledDate}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">Assigned: {request.assignedTo}</p>
                            
                            <div className="flex items-center space-x-2">
                              <Button size="sm" className="btn-premium">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                <Edit className="w-4 h-4 mr-2" />
                                Update
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