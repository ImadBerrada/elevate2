"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  PieChart,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Calendar,
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

export default function OperationalExpenses() {
  const expenses = [
    {
      id: "EXP-001",
      category: "Server Infrastructure",
      description: "AWS Cloud Services - Monthly Subscription",
      amount: "$2,450",
      date: "2024-01-20",
      vendor: "Amazon Web Services",
      status: "approved",
      department: "Technology",
      budgetCategory: "Infrastructure"
    },
    {
      id: "EXP-002",
      category: "Marketing",
      description: "Social Media Advertising Campaign",
      amount: "$1,800",
      date: "2024-01-19",
      vendor: "Meta Platforms",
      status: "pending",
      department: "Marketing",
      budgetCategory: "Advertising"
    },
    {
      id: "EXP-003",
      category: "Office Supplies",
      description: "Gaming Equipment and Accessories",
      amount: "$650",
      date: "2024-01-18",
      vendor: "TechGear Solutions",
      status: "approved",
      department: "Operations",
      budgetCategory: "Equipment"
    },
    {
      id: "EXP-004",
      category: "Software Licenses",
      description: "Game Development Tools - Annual License",
      amount: "$3,200",
      date: "2024-01-17",
      vendor: "Unity Technologies",
      status: "approved",
      department: "Development",
      budgetCategory: "Software"
    },
    {
      id: "EXP-005",
      category: "Utilities",
      description: "Office Electricity and Internet",
      amount: "$890",
      date: "2024-01-16",
      vendor: "DEWA & Etisalat",
      status: "paid",
      department: "Operations",
      budgetCategory: "Utilities"
    }
  ];

  const expenseCategories = [
    { category: "Infrastructure", amount: "$8,450", percentage: 35, color: "bg-blue-500" },
    { category: "Marketing", amount: "$5,200", percentage: 22, color: "bg-green-500" },
    { category: "Software", amount: "$4,800", percentage: 20, color: "bg-purple-500" },
    { category: "Equipment", percentage: 12, amount: "$2,900", color: "bg-orange-500" },
    { category: "Utilities", percentage: 11, amount: "$2,650", color: "bg-red-500" }
  ];

  const budgetOverview = [
    { department: "Technology", allocated: "$15,000", spent: "$12,450", remaining: "$2,550", utilization: 83 },
    { department: "Marketing", allocated: "$8,000", spent: "$6,200", remaining: "$1,800", utilization: 78 },
    { department: "Operations", allocated: "$5,000", spent: "$3,540", remaining: "$1,460", utilization: 71 },
    { department: "Development", allocated: "$12,000", spent: "$9,800", remaining: "$2,200", utilization: 82 }
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
    if (utilization >= 90) return "text-red-600";
    if (utilization >= 75) return "text-yellow-600";
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
                    <h1 className="text-2xl font-bold text-gradient">Operational Expenses</h1>
                    <p className="text-sm text-muted-foreground">Cost tracking and budget management</p>
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
                  <div className="text-3xl font-bold text-gradient mb-2">$24.0K</div>
                  <p className="text-sm text-green-600 font-medium">-8.2% vs last month</p>
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
                  <div className="text-3xl font-bold text-gradient mb-2">$3.2K</div>
                  <p className="text-sm text-yellow-600 font-medium">5 items pending</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Budget Utilization
                  </CardTitle>
                  <PieChart className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">78.5%</div>
                  <p className="text-sm text-green-600 font-medium">Within budget</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cost Savings
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$2.1K</div>
                  <p className="text-sm text-green-600 font-medium">This month</p>
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
                        Breakdown by category
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

            {/* Budget Overview */}
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
                      <DollarSign className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Budget Overview</CardTitle>
                      <CardDescription>
                        Department budget utilization
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {budgetOverview.map((budget, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{budget.department}</h4>
                          <Badge 
                            className={`text-xs ${getUtilizationColor(budget.utilization) === 'text-red-600' ? 'bg-red-100 text-red-800' : 
                              getUtilizationColor(budget.utilization) === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                            variant="outline"
                          >
                            {budget.utilization}% used
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Allocated</p>
                            <p className="font-semibold text-foreground">{budget.allocated}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Spent</p>
                            <p className="font-semibold text-foreground">{budget.spent}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Remaining</p>
                            <p className="font-semibold text-green-600">{budget.remaining}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${budget.utilization >= 90 ? 'bg-red-500' : 
                                budget.utilization >= 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${budget.utilization}%` }}
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

          {/* Expense List */}
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
                    <CardTitle className="text-xl">Recent Expenses</CardTitle>
                    <CardDescription>
                      Latest operational expense records
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
                                <span>Vendor: {expense.vendor}</span>
                                <span>•</span>
                                <span>Department: {expense.department}</span>
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