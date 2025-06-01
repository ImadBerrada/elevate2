"use client";

import { motion } from "framer-motion";
import { 
  Car, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fuel,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Users,
  Receipt
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

export default function DriverExpenses() {
  const driverExpenses = [
    {
      id: "DRV-001",
      driverName: "Ahmed Hassan",
      driverId: "DRV-12450",
      category: "Fuel",
      description: "Fuel refill - ADNOC Station",
      amount: "$45.50",
      date: "2024-01-20",
      status: "approved",
      receiptStatus: "submitted",
      vehicle: "Toyota Camry - ABC123"
    },
    {
      id: "DRV-002",
      driverName: "Omar Al-Rashid",
      driverId: "DRV-12451",
      category: "Maintenance",
      description: "Oil change and tire rotation",
      amount: "$120.00",
      date: "2024-01-19",
      status: "pending",
      receiptStatus: "submitted",
      vehicle: "Honda Civic - XYZ789"
    },
    {
      id: "DRV-003",
      driverName: "Sarah Johnson",
      driverId: "DRV-12452",
      category: "Parking",
      description: "Mall parking fees - 3 hours",
      amount: "$15.00",
      date: "2024-01-18",
      status: "approved",
      receiptStatus: "submitted",
      vehicle: "Nissan Altima - DEF456"
    },
    {
      id: "DRV-004",
      driverName: "Maria Garcia",
      driverId: "DRV-12453",
      category: "Tolls",
      description: "Salik toll charges - Dubai routes",
      amount: "$8.50",
      date: "2024-01-17",
      status: "reimbursed",
      receiptStatus: "verified",
      vehicle: "Hyundai Elantra - GHI789"
    },
    {
      id: "DRV-005",
      driverName: "David Chen",
      driverId: "DRV-12454",
      category: "Repairs",
      description: "Brake pad replacement",
      amount: "$180.00",
      date: "2024-01-16",
      status: "pending",
      receiptStatus: "missing",
      vehicle: "Toyota Corolla - JKL012"
    }
  ];

  const expenseCategories = [
    { category: "Fuel", amount: "$8,450", percentage: 45, color: "bg-blue-500" },
    { category: "Maintenance", amount: "$4,200", percentage: 22, color: "bg-green-500" },
    { category: "Repairs", amount: "$3,800", percentage: 20, color: "bg-red-500" },
    { category: "Parking", amount: "$1,500", percentage: 8, color: "bg-purple-500" },
    { category: "Tolls", amount: "$950", percentage: 5, color: "bg-orange-500" }
  ];

  const topDrivers = [
    { driver: "Ahmed Hassan", expenses: "$1,245", trips: 156, avgPerTrip: "$7.98" },
    { driver: "Omar Al-Rashid", expenses: "$1,180", trips: 142, avgPerTrip: "$8.31" },
    { driver: "Sarah Johnson", expenses: "$1,050", trips: 138, avgPerTrip: "$7.61" },
    { driver: "Maria Garcia", expenses: "$980", trips: 134, avgPerTrip: "$7.31" },
    { driver: "David Chen", expenses: "$920", trips: 129, avgPerTrip: "$7.13" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reimbursed": return "text-green-600";
      case "approved": return "text-blue-600";
      case "pending": return "text-yellow-600";
      case "rejected": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "reimbursed": return "bg-green-100 text-green-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getReceiptStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "text-green-600";
      case "submitted": return "text-blue-600";
      case "missing": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getReceiptStatusBg = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800";
      case "submitted": return "bg-blue-100 text-blue-800";
      case "missing": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reimbursed": return CheckCircle;
      case "approved": return CheckCircle;
      case "pending": return Clock;
      case "rejected": return AlertTriangle;
      default: return Clock;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Fuel": return Fuel;
      case "Maintenance": return Car;
      case "Repairs": return AlertTriangle;
      case "Parking": return Car;
      case "Tolls": return Car;
      default: return Receipt;
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
                    <h1 className="text-2xl font-bold text-gradient">Driver Expenses</h1>
                    <p className="text-sm text-muted-foreground">Driver expense tracking and reimbursement</p>
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
                    placeholder="Search expenses..." 
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
                    Monthly Expenses
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$18.9K</div>
                  <p className="text-sm text-green-600 font-medium">-5.2% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-yellow-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Approval
                  </CardTitle>
                  <Clock className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$2.4K</div>
                  <p className="text-sm text-yellow-600 font-medium">18 items pending</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Reimbursed
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$16.5K</div>
                  <p className="text-sm text-green-600 font-medium">87.3% processed</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Per Driver
                  </CardTitle>
                  <Users className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$1,075</div>
                  <p className="text-sm text-green-600 font-medium">Monthly average</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Expense Categories */}
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
                      <Receipt className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Expense Categories</CardTitle>
                      <CardDescription>
                        Breakdown by expense type
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenseCategories.map((category, index) => (
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

            {/* Top Drivers */}
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
                      <CardTitle>Top Drivers by Expenses</CardTitle>
                      <CardDescription>
                        Highest expense drivers this month
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topDrivers.map((driver, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{driver.driver}</h4>
                          <Badge variant="outline" className="text-xs">
                            {driver.trips} trips
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Expenses</p>
                            <p className="font-semibold text-foreground">{driver.expenses}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Per Trip</p>
                            <p className="font-semibold text-foreground">{driver.avgPerTrip}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Efficiency</p>
                            <p className="font-semibold text-green-600">Good</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Driver Expenses List */}
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
                    <Car className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Recent Driver Expenses</CardTitle>
                    <CardDescription>
                      Latest expense submissions and reimbursements
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {driverExpenses.map((expense, index) => {
                    const StatusIcon = getStatusIcon(expense.status);
                    const CategoryIcon = getCategoryIcon(expense.category);
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
                              <CategoryIcon className="w-6 h-6 text-white" />
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
                                  className={`text-xs ${getReceiptStatusBg(expense.receiptStatus)}`}
                                  variant="outline"
                                >
                                  {expense.receiptStatus}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {expense.category}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-foreground mb-1">
                                {expense.driverName} ({expense.driverId})
                              </p>
                              <p className="text-sm font-medium text-foreground mb-1">{expense.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <span>Vehicle: {expense.vehicle}</span>
                                <span>•</span>
                                <span>Date: {expense.date}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground">Amount</p>
                              <p className="text-2xl font-bold text-gradient">{expense.amount}</p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button size="sm" className="btn-premium">
                                <Eye className="w-4 h-4 mr-2" />
                                View Receipt
                              </Button>
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                <Edit className="w-4 h-4 mr-2" />
                                {expense.status === 'pending' ? 'Approve' : 'Edit'}
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