"use client";

import { motion } from "framer-motion";
import { 
  Receipt, 
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
  PieChart
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

export default function OperatingExpenses() {
  const expenses = [
    {
      id: "OPX-001",
      category: "Utilities",
      description: "Electricity and Water - Marina Tower Complex",
      amount: "$4,250",
      date: "2024-01-20",
      property: "Marina Tower Complex",
      vendor: "DEWA",
      status: "paid",
      budgetCategory: "Utilities"
    },
    {
      id: "OPX-002",
      category: "Property Management",
      description: "Monthly Management Fee - Business Bay",
      amount: "$3,800",
      date: "2024-01-19",
      property: "Business Bay Office Center",
      vendor: "Elite Property Management",
      status: "approved",
      budgetCategory: "Management"
    },
    {
      id: "OPX-003",
      category: "Insurance",
      description: "Property Insurance Premium - Q1 2024",
      amount: "$8,500",
      date: "2024-01-18",
      property: "All Properties",
      vendor: "AXA Insurance",
      status: "pending",
      budgetCategory: "Insurance"
    },
    {
      id: "OPX-004",
      category: "Security",
      description: "Security Services - Downtown Plaza",
      amount: "$2,200",
      date: "2024-01-17",
      property: "Downtown Retail Plaza",
      vendor: "SecureGuard Services",
      status: "paid",
      budgetCategory: "Security"
    },
    {
      id: "OPX-005",
      category: "Cleaning",
      description: "Janitorial Services - Jumeirah Villas",
      amount: "$1,850",
      date: "2024-01-16",
      property: "Jumeirah Villa Estate",
      vendor: "CleanPro Services",
      status: "approved",
      budgetCategory: "Cleaning"
    }
  ];

  const expenseCategories = [
    { category: "Utilities", amount: "$18,450", percentage: 28, color: "bg-blue-500" },
    { category: "Management", amount: "$15,200", percentage: 23, color: "bg-green-500" },
    { category: "Insurance", amount: "$12,800", percentage: 19, color: "bg-purple-500" },
    { category: "Security", amount: "$8,900", percentage: 14, color: "bg-orange-500" },
    { category: "Cleaning", amount: "$6,650", percentage: 10, color: "bg-red-500" },
    { category: "Other", amount: "$4,000", percentage: 6, color: "bg-gray-500" }
  ];

  const propertyExpenses = [
    { property: "Marina Tower Complex", monthly: "$12,450", ytd: "$149,400", budget: "$150,000", utilization: 99.6 },
    { property: "Business Bay Office Center", monthly: "$8,200", ytd: "$98,400", budget: "$100,000", utilization: 98.4 },
    { property: "Downtown Retail Plaza", monthly: "$6,800", ytd: "$81,600", budget: "$85,000", utilization: 96.0 },
    { property: "Jumeirah Villa Estate", monthly: "$4,550", ytd: "$54,600", budget: "$60,000", utilization: 91.0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "text-green-600";
      case "approved": return "text-blue-600";
      case "pending": return "text-yellow-600";
      case "rejected": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return CheckCircle;
      case "approved": return CheckCircle;
      case "pending": return Clock;
      case "rejected": return AlertTriangle;
      default: return Clock;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 95) return "text-red-600";
    if (utilization >= 85) return "text-yellow-600";
    return "text-green-600";
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
                    <Receipt className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Operating Expenses</h1>
                    <p className="text-sm text-muted-foreground">Property operational cost management</p>
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
                  <div className="text-3xl font-bold text-gradient mb-2">$130.0K</div>
                  <p className="text-sm text-green-600 font-medium">-5.2% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-yellow-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Budget Remaining
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$5.0K</div>
                  <p className="text-sm text-yellow-600 font-medium">96.3% utilized</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Approved Expenses
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">47</div>
                  <p className="text-sm text-green-600 font-medium">This month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cost Per SqFt
                  </CardTitle>
                  <Building className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$6,488</div>
                  <p className="text-sm text-green-600 font-medium">Avg per property</p>
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
                      <PieChart className="w-4 h-4 text-white" />
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

            {/* Property-wise Expenses */}
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
                      <Building className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Property-wise Breakdown</CardTitle>
                      <CardDescription>
                        Operating expenses by property
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyExpenses.map((property, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{property.property}</h4>
                          <Badge 
                            className={`text-xs ${getUtilizationColor(property.utilization) === 'text-red-600' ? 'bg-red-100 text-red-800' : 
                              getUtilizationColor(property.utilization) === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                            variant="outline"
                          >
                            {property.utilization}% budget used
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Monthly</p>
                            <p className="font-semibold text-foreground">{property.monthly}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">YTD</p>
                            <p className="font-semibold text-foreground">{property.ytd}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Budget</p>
                            <p className="font-semibold text-foreground">{property.budget}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${property.utilization >= 95 ? 'bg-red-500' : 
                                property.utilization >= 85 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${property.utilization}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Expenses */}
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
                    <Receipt className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Recent Operating Expenses</CardTitle>
                    <CardDescription>
                      Latest expense records and approvals
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((expense, index) => {
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
                                <Badge variant="outline" className="text-xs">
                                  {expense.category}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-foreground mb-1">{expense.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <span>Property: {expense.property}</span>
                                <span>•</span>
                                <span>Vendor: {expense.vendor}</span>
                                <span>•</span>
                                <span>Date: {expense.date}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Budget: {expense.budgetCategory}</p>
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