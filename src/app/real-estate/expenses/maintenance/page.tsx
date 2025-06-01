"use client";

import { motion } from "framer-motion";
import { 
  Wrench, 
  TrendingUp, 
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
  Users,
  Calendar
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

export default function MaintenanceCosts() {
  const maintenanceExpenses = [
    {
      id: "MTC-001",
      type: "Emergency Repair",
      description: "HVAC System Replacement - Marina Tower",
      amount: "$8,500",
      date: "2024-01-20",
      property: "Marina Tower Complex",
      vendor: "CoolTech HVAC Services",
      status: "completed",
      category: "HVAC",
      urgency: "high"
    },
    {
      id: "MTC-002",
      type: "Preventive Maintenance",
      description: "Elevator Annual Inspection - Business Bay",
      amount: "$2,200",
      date: "2024-01-19",
      property: "Business Bay Office Center",
      vendor: "Elevator Solutions LLC",
      status: "in-progress",
      category: "Elevator",
      urgency: "medium"
    },
    {
      id: "MTC-003",
      type: "Corrective Repair",
      description: "Plumbing Leak Repair - Downtown Plaza",
      amount: "$1,450",
      date: "2024-01-18",
      property: "Downtown Retail Plaza",
      vendor: "Quick Fix Plumbing",
      status: "completed",
      category: "Plumbing",
      urgency: "urgent"
    },
    {
      id: "MTC-004",
      type: "Preventive Maintenance",
      description: "Pool System Cleaning - Jumeirah Villas",
      amount: "$650",
      date: "2024-01-17",
      property: "Jumeirah Villa Estate",
      vendor: "AquaClear Pool Services",
      status: "scheduled",
      category: "Pool",
      urgency: "low"
    },
    {
      id: "MTC-005",
      type: "Emergency Repair",
      description: "Fire Safety System Repair - Marina Tower",
      amount: "$3,200",
      date: "2024-01-16",
      property: "Marina Tower Complex",
      vendor: "SafeGuard Systems",
      status: "pending",
      category: "Safety",
      urgency: "high"
    }
  ];

  const costCategories = [
    { category: "HVAC", amount: "$28,450", percentage: 35, color: "bg-blue-500" },
    { category: "Plumbing", amount: "$18,200", percentage: 22, color: "bg-green-500" },
    { category: "Electrical", amount: "$15,800", percentage: 19, color: "bg-purple-500" },
    { category: "Elevator", amount: "$12,900", percentage: 16, color: "bg-orange-500" },
    { category: "Safety", amount: "$6,650", percentage: 8, color: "bg-red-500" }
  ];

  const vendorPerformance = [
    { vendor: "CoolTech HVAC Services", jobs: 12, cost: "$28,450", rating: 4.8, avgTime: "4.2 hours" },
    { vendor: "Quick Fix Plumbing", jobs: 8, cost: "$18,200", rating: 4.6, avgTime: "3.5 hours" },
    { vendor: "Elevator Solutions LLC", jobs: 6, cost: "$15,800", rating: 4.9, avgTime: "6.1 hours" },
    { vendor: "SafeGuard Systems", jobs: 4, cost: "$12,900", rating: 4.7, avgTime: "5.3 hours" }
  ];

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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getUrgencyBg = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
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
                    <h1 className="text-2xl font-bold text-gradient">Maintenance Costs</h1>
                    <p className="text-sm text-muted-foreground">Maintenance expense tracking and analysis</p>
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
                  Add Expense
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
                    Monthly Costs
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$82.0K</div>
                  <p className="text-sm text-green-600 font-medium">-12.3% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-yellow-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Emergency Repairs
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$18.5K</div>
                  <p className="text-sm text-red-600 font-medium">+8.7% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Preventive Maintenance
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$45.2K</div>
                  <p className="text-sm text-green-600 font-medium">55% of total costs</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Cost/SqFt
                  </CardTitle>
                  <Building className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$2.45</div>
                  <p className="text-sm text-green-600 font-medium">Industry benchmark</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Cost Categories */}
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
                      <Wrench className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Cost Categories</CardTitle>
                      <CardDescription>
                        Breakdown by maintenance type
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costCategories.map((category, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${category.color}`} />
                          <span className="font-medium text-foreground">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{category.amount}</p>
                          <p className="text-sm text-muted-foreground">{category.percentage}%</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vendor Performance */}
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
                      <Users className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Vendor Performance</CardTitle>
                      <CardDescription>
                        Top maintenance service providers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vendorPerformance.map((vendor, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{vendor.vendor}</h4>
                          <Badge variant="outline" className="text-xs">
                            {vendor.jobs} jobs
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Cost</p>
                            <p className="font-semibold text-foreground">{vendor.cost}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rating</p>
                            <p className="font-semibold text-yellow-600">★ {vendor.rating}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Time</p>
                            <p className="font-semibold text-foreground">{vendor.avgTime}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Maintenance Expenses */}
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
                    <CardTitle className="text-xl">Recent Maintenance Expenses</CardTitle>
                    <CardDescription>
                      Latest maintenance costs and vendor payments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceExpenses.map((expense, index) => {
                    const StatusIcon = getStatusIcon(expense.status);
                    return (
                      <motion.div 
                        key={expense.id}
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
                                <h3 className="font-semibold text-lg text-foreground">{expense.id}</h3>
                                <Badge 
                                  className={`text-xs ${getStatusBg(expense.status)}`}
                                  variant="outline"
                                >
                                  {expense.status}
                                </Badge>
                                <Badge 
                                  className={`text-xs ${getUrgencyBg(expense.urgency)}`}
                                  variant="outline"
                                >
                                  {expense.urgency}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {expense.category}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-foreground mb-1">
                                {expense.type}: {expense.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <span>Property: {expense.property}</span>
                                <span>•</span>
                                <span>Vendor: {expense.vendor}</span>
                                <span>•</span>
                                <span>Date: {expense.date}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground">Cost</p>
                              <p className="text-2xl font-bold text-gradient">{expense.amount}</p>
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