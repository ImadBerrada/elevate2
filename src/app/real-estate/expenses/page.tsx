"use client";

import { motion } from "framer-motion";
import { 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  PieChart,
  Calendar,
  Filter,
  Download,
  Search,
  Plus,
  Eye,
  Edit,
  Building,
  Wrench,
  Users,
  FileText
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

export default function ExpensesManagement() {
  const expenses = [
    {
      id: "EXP-001",
      description: "HVAC System Maintenance",
      property: "Marina Tower Complex",
      category: "Maintenance",
      amount: "$2,850",
      date: "2024-01-20",
      vendor: "CoolTech HVAC Services",
      status: "approved",
      receipt: true
    },
    {
      id: "EXP-002",
      description: "Property Insurance Premium",
      property: "Business Bay Office Center",
      category: "Insurance",
      amount: "$8,500",
      date: "2024-01-19",
      vendor: "Emirates Insurance Co.",
      status: "paid",
      receipt: true
    },
    {
      id: "EXP-003",
      description: "Landscaping Services",
      property: "Jumeirah Villa Estate",
      category: "Maintenance",
      amount: "$1,200",
      date: "2024-01-18",
      vendor: "Green Gardens LLC",
      status: "pending",
      receipt: false
    },
    {
      id: "EXP-004",
      description: "Security System Upgrade",
      property: "Downtown Retail Plaza",
      category: "Security",
      amount: "$4,750",
      date: "2024-01-17",
      vendor: "SecureGuard Systems",
      status: "approved",
      receipt: true
    },
    {
      id: "EXP-005",
      description: "Cleaning Services",
      property: "Marina Tower Complex",
      category: "Utilities",
      amount: "$950",
      date: "2024-01-16",
      vendor: "Sparkle Clean Co.",
      status: "paid",
      receipt: true
    }
  ];

  const expenseCategories = [
    { category: "Maintenance", amount: "$45,200", percentage: 35, color: "bg-blue-500" },
    { category: "Utilities", amount: "$28,800", percentage: 22, color: "bg-green-500" },
    { category: "Insurance", amount: "$25,600", percentage: 20, color: "bg-purple-500" },
    { category: "Security", amount: "$18,400", percentage: 14, color: "bg-orange-500" },
    { category: "Other", amount: "$12,000", percentage: 9, color: "bg-gray-500" }
  ];

  const monthlyExpenses = [
    { month: "Jan", amount: 128500, budget: 135000 },
    { month: "Feb", amount: 142300, budget: 135000 },
    { month: "Mar", amount: 119800, budget: 135000 },
    { month: "Apr", amount: 156200, budget: 135000 },
    { month: "May", amount: 134700, budget: 135000 },
    { month: "Jun", amount: 148900, budget: 135000 }
  ];

  const propertyExpenses = [
    {
      property: "Marina Tower Complex",
      totalExpenses: "$38,450",
      monthlyAvg: "$6,408",
      categories: 8,
      lastExpense: "2024-01-20"
    },
    {
      property: "Business Bay Office Center",
      totalExpenses: "$52,300",
      monthlyAvg: "$8,717",
      categories: 6,
      lastExpense: "2024-01-19"
    },
    {
      property: "Downtown Retail Plaza",
      totalExpenses: "$29,750",
      monthlyAvg: "$4,958",
      categories: 7,
      lastExpense: "2024-01-17"
    },
    {
      property: "Jumeirah Villa Estate",
      totalExpenses: "$41,200",
      monthlyAvg: "$6,867",
      categories: 5,
      lastExpense: "2024-01-18"
    }
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Maintenance": return Wrench;
      case "Utilities": return Building;
      case "Insurance": return FileText;
      case "Security": return Users;
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
                    <Receipt className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Expenses Management</h1>
                    <p className="text-sm text-muted-foreground">Property expense tracking and financial control</p>
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
              <Card className="card-premium border-0 bg-gradient-to-br from-red-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Expenses
                  </CardTitle>
                  <Receipt className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$130.0K</div>
                  <p className="text-sm text-red-600 font-medium">+8.5% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Budget Remaining
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$5.0K</div>
                  <p className="text-sm text-blue-600 font-medium">96.3% utilized</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Approved Expenses
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
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
                    Avg per Property
                  </CardTitle>
                  <Building className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$6,488</div>
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
                      <PieChart className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Expense Categories</CardTitle>
                      <CardDescription>
                        Monthly spending by category
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
                          <p className="font-semibold text-foreground">{category.percentage}%</p>
                          <p className="text-sm text-muted-foreground">{category.amount}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Property Expenses */}
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
                      <CardTitle>Property Expenses</CardTitle>
                      <CardDescription>
                        Expense breakdown by property
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {propertyExpenses.map((property, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <h4 className="font-semibold text-foreground mb-3">{property.property}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Expenses</span>
                            <span className="font-bold text-gradient">{property.totalExpenses}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Monthly Avg</span>
                            <span className="font-semibold text-foreground">{property.monthlyAvg}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Categories</span>
                            <span className="font-semibold text-foreground">{property.categories}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Last Expense</span>
                            <span className="text-sm text-muted-foreground">{property.lastExpense}</span>
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
                <div className="flex items-center justify-between">
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
                        Latest expense transactions and approvals
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" className="glass-card border-0 hover-glow">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((expense, index) => {
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
                                {expense.receipt && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    Receipt
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium text-foreground mb-1">{expense.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{expense.property}</span>
                                <span>•</span>
                                <span>{expense.category}</span>
                                <span>•</span>
                                <span>{expense.vendor}</span>
                                <span>•</span>
                                <span>{expense.date}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gradient mb-2">{expense.amount}</p>
                            
                            <div className="flex items-center space-x-2">
                              <Button size="sm" className="btn-premium">
                                <Eye className="w-4 h-4 mr-2" />
                                View
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