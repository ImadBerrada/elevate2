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
  Settings,
  TrendingUp
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

export default function ApplianceMaintenance() {
  const maintenanceSchedule = [
    {
      id: "MNT-APL-001",
      appliance: "Central AC Unit - Carrier 24ABC636A003",
      property: "Marina Tower Complex",
      type: "Preventive",
      priority: "medium",
      status: "scheduled",
      scheduledDate: "2024-01-25",
      technician: "Ahmed Hassan",
      estimatedDuration: "4 hours",
      cost: "$450",
      description: "Quarterly filter replacement and system inspection"
    },
    {
      id: "MNT-APL-002",
      appliance: "Elevator System - Otis Gen2-MRL",
      property: "Business Bay Office Center",
      type: "Corrective",
      priority: "high",
      status: "in-progress",
      scheduledDate: "2024-01-22",
      technician: "Omar Al-Rashid",
      estimatedDuration: "6 hours",
      cost: "$1,200",
      description: "Door sensor malfunction repair"
    },
    {
      id: "MNT-APL-003",
      appliance: "Commercial Dishwasher - Hobart CXi-6",
      property: "Downtown Retail Plaza",
      type: "Emergency",
      priority: "urgent",
      status: "pending",
      scheduledDate: "2024-01-21",
      technician: "Sarah Johnson",
      estimatedDuration: "3 hours",
      cost: "$650",
      description: "Water leak and heating element replacement"
    },
    {
      id: "MNT-APL-004",
      appliance: "Pool Filtration - Pentair IntelliFlo VSF",
      property: "Jumeirah Villa Estate",
      type: "Preventive",
      priority: "low",
      status: "completed",
      scheduledDate: "2024-01-18",
      technician: "David Chen",
      estimatedDuration: "2 hours",
      cost: "$200",
      description: "Monthly cleaning and chemical balance check"
    },
    {
      id: "MNT-APL-005",
      appliance: "Fire Safety System - Honeywell NOTIFIER-3030",
      property: "Marina Tower Complex",
      type: "Preventive",
      priority: "high",
      status: "scheduled",
      scheduledDate: "2024-01-28",
      technician: "Maria Garcia",
      estimatedDuration: "5 hours",
      cost: "$800",
      description: "Semi-annual system testing and sensor calibration"
    }
  ];

  const technicians = [
    {
      name: "Ahmed Hassan",
      specialty: "HVAC Systems",
      activeJobs: 3,
      rating: 4.8,
      completedJobs: 156
    },
    {
      name: "Omar Al-Rashid",
      specialty: "Elevator Maintenance",
      activeJobs: 2,
      rating: 4.9,
      completedJobs: 89
    },
    {
      name: "Sarah Johnson",
      specialty: "Kitchen Equipment",
      activeJobs: 4,
      rating: 4.7,
      completedJobs: 203
    },
    {
      name: "David Chen",
      specialty: "Pool & Water Systems",
      activeJobs: 1,
      rating: 4.6,
      completedJobs: 78
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Preventive": return "text-blue-600";
      case "Corrective": return "text-orange-600";
      case "Emergency": return "text-red-600";
      default: return "text-gray-600";
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
                    <h1 className="text-2xl font-bold text-gradient">Appliance Maintenance</h1>
                    <p className="text-sm text-muted-foreground">Preventive maintenance and service scheduling</p>
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
                  Schedule Maintenance
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
                    Scheduled Tasks
                  </CardTitle>
                  <Calendar className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">47</div>
                  <p className="text-sm text-blue-600 font-medium">Next 30 days</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-yellow-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </CardTitle>
                  <Wrench className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">12</div>
                  <p className="text-sm text-yellow-600 font-medium">Active maintenance</p>
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
                  <div className="text-3xl font-bold text-gradient mb-2">8</div>
                  <p className="text-sm text-green-600 font-medium">+2 vs yesterday</p>
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
                  <div className="text-3xl font-bold text-gradient mb-2">$28.5K</div>
                  <p className="text-sm text-green-600 font-medium">-12% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Technician Team */}
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
                      <CardTitle>Technician Team</CardTitle>
                      <CardDescription>
                        Active maintenance specialists
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {technicians.map((tech, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{tech.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {tech.activeJobs} active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{tech.specialty}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-yellow-600">★ {tech.rating}</span>
                          <span className="text-sm text-muted-foreground">{tech.completedJobs} completed</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Maintenance Types */}
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
                      <Settings className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Maintenance Analytics</CardTitle>
                      <CardDescription>
                        Performance metrics and trends
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">By Type</h4>
                      {[
                        { type: "Preventive", count: 28, percentage: 60, color: "bg-blue-500" },
                        { type: "Corrective", count: 12, percentage: 25, color: "bg-orange-500" },
                        { type: "Emergency", count: 7, percentage: 15, color: "bg-red-500" }
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
                            <span className="font-medium text-foreground">{item.type}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{item.count}</p>
                            <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Performance</h4>
                      <div className="space-y-3">
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Avg Response Time</p>
                          <p className="text-lg font-bold text-gradient">2.4 hours</p>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Completion Rate</p>
                          <p className="text-lg font-bold text-gradient">96.8%</p>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                          <p className="text-lg font-bold text-gradient">4.7/5</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Maintenance Schedule */}
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
                    <Calendar className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Maintenance Schedule</CardTitle>
                    <CardDescription>
                      Upcoming and active maintenance tasks
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceSchedule.map((task, index) => {
                    const StatusIcon = getStatusIcon(task.status);
                    return (
                      <motion.div 
                        key={task.id}
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
                                <h3 className="font-semibold text-lg text-foreground">{task.id}</h3>
                                <Badge 
                                  className={`text-xs ${getPriorityBg(task.priority)}`}
                                  variant="outline"
                                >
                                  {task.priority}
                                </Badge>
                                <Badge 
                                  className={`text-xs ${getStatusBg(task.status)}`}
                                  variant="outline"
                                >
                                  {task.status}
                                </Badge>
                                <Badge 
                                  className={`text-xs ${getTypeColor(task.type) === 'text-red-600' ? 'bg-red-100 text-red-800' : 
                                    getTypeColor(task.type) === 'text-orange-600' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}
                                  variant="outline"
                                >
                                  {task.type}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-foreground mb-1">{task.appliance}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <span>{task.property}</span>
                                <span>•</span>
                                <span>Technician: {task.technician}</span>
                                <span>•</span>
                                <span>Duration: {task.estimatedDuration}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-2 gap-4 text-center mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                                <p className="font-bold text-foreground">{task.scheduledDate}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                                <p className="text-lg font-bold text-gradient">{task.cost}</p>
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