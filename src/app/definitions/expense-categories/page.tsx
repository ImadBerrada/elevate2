"use client";

import { motion } from "framer-motion";
import { 
  Receipt, 
  Tag, 
  DollarSign, 
  TrendingUp,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2
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

export default function ExpenseCategories() {
  const expenseCategories = [
    {
      id: 1,
      name: "Office Supplies",
      description: "Stationery, equipment, and office materials",
      division: "All Divisions",
      monthlyBudget: "$5,000",
      currentSpend: "$3,240",
      transactions: 47,
      status: "active"
    },
    {
      id: 2,
      name: "Marketing & Advertising",
      description: "Digital marketing, campaigns, and promotional materials",
      division: "ELEVATE",
      monthlyBudget: "$25,000",
      currentSpend: "$18,750",
      transactions: 23,
      status: "active"
    },
    {
      id: 3,
      name: "Vehicle Maintenance",
      description: "Fleet maintenance, fuel, and vehicle expenses",
      division: "MARAH",
      monthlyBudget: "$15,000",
      currentSpend: "$12,340",
      transactions: 89,
      status: "active"
    },
    {
      id: 4,
      name: "Property Maintenance",
      description: "Building repairs, utilities, and facility management",
      division: "Real Estate",
      monthlyBudget: "$35,000",
      currentSpend: "$28,900",
      transactions: 156,
      status: "active"
    },
    {
      id: 5,
      name: "Technology & Software",
      description: "Software licenses, hardware, and IT infrastructure",
      division: "ALBARQ",
      monthlyBudget: "$12,000",
      currentSpend: "$9,850",
      transactions: 34,
      status: "active"
    },
    {
      id: 6,
      name: "Professional Services",
      description: "Legal, accounting, and consulting services",
      division: "All Divisions",
      monthlyBudget: "$20,000",
      currentSpend: "$15,600",
      transactions: 18,
      status: "active"
    },
    {
      id: 7,
      name: "Training & Development",
      description: "Employee training, courses, and development programs",
      division: "Human Resources",
      monthlyBudget: "$8,000",
      currentSpend: "$4,200",
      transactions: 12,
      status: "active"
    },
    {
      id: 8,
      name: "Travel & Entertainment",
      description: "Business travel, meals, and client entertainment",
      division: "All Divisions",
      monthlyBudget: "$18,000",
      currentSpend: "$11,450",
      transactions: 67,
      status: "active"
    }
  ];

  const getUtilizationPercentage = (current: string, budget: string) => {
    const currentNum = parseFloat(current.replace('$', '').replace(',', ''));
    const budgetNum = parseFloat(budget.replace('$', '').replace(',', ''));
    return Math.round((currentNum / budgetNum) * 100);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
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
                    <h1 className="text-2xl font-bold text-gradient">Expense Categories</h1>
                    <p className="text-sm text-muted-foreground">Manage expense types and budgets</p>
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
                    placeholder="Search categories..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
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
                    Total Categories
                  </CardTitle>
                  <Tag className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">24</div>
                  <p className="text-sm text-green-600 font-medium">+3 this quarter</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Budget
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$143K</div>
                  <p className="text-sm text-muted-foreground">Allocated budget</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Current Spend
                  </CardTitle>
                  <Receipt className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$104K</div>
                  <p className="text-sm text-green-600 font-medium">73% utilized</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Transactions
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">446</div>
                  <p className="text-sm text-green-600 font-medium">This month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Categories List */}
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
                    <CardTitle className="text-xl">Expense Categories</CardTitle>
                    <CardDescription>
                      Manage expense types and budget allocations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {expenseCategories.map((category, index) => {
                    const utilization = getUtilizationPercentage(category.currentSpend, category.monthlyBudget);
                    return (
                      <motion.div 
                        key={category.id}
                        className="glass-card p-6 rounded-2xl hover-lift group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <motion.div 
                              className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                              whileHover={{ scale: 1.1, rotate: 10 }}
                            >
                              <Receipt className="w-6 h-6 text-white" />
                            </motion.div>
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="default"
                            className="text-xs"
                          >
                            {category.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Division:</span>
                            <span className="font-medium">{category.division}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Monthly Budget:</span>
                            <span className="font-medium">{category.monthlyBudget}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Current Spend:</span>
                            <span className="font-medium">{category.currentSpend}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Transactions:</span>
                            <span className="font-medium">{category.transactions}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Utilization:</span>
                            <span className={`font-medium ${getUtilizationColor(utilization)}`}>
                              {utilization}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                utilization >= 90 ? 'bg-red-500' : 
                                utilization >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-4 border-t border-border/30">
                          <Button size="sm" className="btn-premium flex-1">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                            <Trash2 className="w-4 h-4" />
                          </Button>
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