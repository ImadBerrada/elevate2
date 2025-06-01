"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Target, 
  TrendingUp, 
  BarChart3,
  PieChart,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function BudgetPlanning() {
  const budgetCategories = [
    {
      id: 1,
      category: "Investment Operations",
      budgeted: "$2,500,000",
      actual: "$2,380,000",
      variance: "-$120,000",
      variancePercent: "-4.8%",
      status: "on-track",
      progress: 95
    },
    {
      id: 2,
      category: "Real Estate Management",
      budgeted: "$1,800,000",
      actual: "$1,650,000",
      variance: "-$150,000",
      variancePercent: "-8.3%",
      status: "under-budget",
      progress: 92
    },
    {
      id: 3,
      category: "Administrative Expenses",
      budgeted: "$850,000",
      actual: "$920,000",
      variance: "+$70,000",
      variancePercent: "+8.2%",
      status: "over-budget",
      progress: 108
    },
    {
      id: 4,
      category: "Technology & Infrastructure",
      budgeted: "$650,000",
      actual: "$580,000",
      variance: "-$70,000",
      variancePercent: "-10.8%",
      status: "under-budget",
      progress: 89
    },
    {
      id: 5,
      category: "Marketing & Business Development",
      budgeted: "$420,000",
      actual: "$445,000",
      variance: "+$25,000",
      variancePercent: "+6.0%",
      status: "on-track",
      progress: 106
    }
  ];

  const quarterlyForecast = [
    {
      quarter: "Q1 2024",
      revenue: "$8,500,000",
      expenses: "$6,200,000",
      netIncome: "$2,300,000",
      margin: "27.1%",
      status: "actual"
    },
    {
      quarter: "Q2 2024",
      revenue: "$9,200,000",
      expenses: "$6,800,000",
      netIncome: "$2,400,000",
      margin: "26.1%",
      status: "forecast"
    },
    {
      quarter: "Q3 2024",
      revenue: "$9,800,000",
      expenses: "$7,100,000",
      netIncome: "$2,700,000",
      margin: "27.6%",
      status: "forecast"
    },
    {
      quarter: "Q4 2024",
      revenue: "$10,500,000",
      expenses: "$7,500,000",
      netIncome: "$3,000,000",
      margin: "28.6%",
      status: "forecast"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track": return "text-green-600";
      case "under-budget": return "text-blue-600";
      case "over-budget": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "on-track": return "bg-green-100 text-green-800";
      case "under-budget": return "bg-blue-100 text-blue-800";
      case "over-budget": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on-track": return CheckCircle;
      case "under-budget": return CheckCircle;
      case "over-budget": return AlertTriangle;
      default: return Target;
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
                    <FileText className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Budget Planning</h1>
                    <p className="text-sm text-muted-foreground">Financial budget management and forecasting</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fiscal Year
                </Button>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Categories
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Budget
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
                    Total Budget
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$6.2M</div>
                  <p className="text-sm text-green-600 font-medium">Annual allocation</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Spent to Date
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$6.0M</div>
                  <p className="text-sm text-green-600 font-medium">96.8% utilized</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Variance
                  </CardTitle>
                  <Target className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">-$245K</div>
                  <p className="text-sm text-green-600 font-medium">3.9% under budget</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Budget Categories
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">5</div>
                  <p className="text-sm text-muted-foreground">Active categories</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Budget Categories */}
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
                      <CardTitle>Budget Categories</CardTitle>
                      <CardDescription>
                        Budget vs actual spending by category
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {budgetCategories.map((category, index) => {
                      const StatusIcon = getStatusIcon(category.status);
                      return (
                        <motion.div 
                          key={category.id}
                          className="glass-card p-4 rounded-xl hover-lift"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <StatusIcon className={`w-5 h-5 ${getStatusColor(category.status)}`} />
                              <h4 className="font-semibold text-foreground">{category.category}</h4>
                            </div>
                            <Badge 
                              className={`text-xs ${getStatusBg(category.status)}`}
                              variant="outline"
                            >
                              {category.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Budgeted</p>
                              <p className="font-semibold text-foreground">{category.budgeted}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Actual</p>
                              <p className="font-semibold text-gradient">{category.actual}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Variance</p>
                              <p className={`font-semibold ${getStatusColor(category.status)}`}>
                                {category.variance}
                              </p>
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                category.status === 'over-budget' 
                                  ? 'bg-gradient-to-r from-red-500 to-red-400' 
                                  : 'bg-gradient-to-r from-primary to-primary/80'
                              }`}
                              style={{ width: `${Math.min(category.progress, 100)}%` }}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{category.progress}% utilized</span>
                            <span className={`font-medium ${getStatusColor(category.status)}`}>
                              {category.variancePercent}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quarterly Forecast */}
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
                      <TrendingUp className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Quarterly Forecast</CardTitle>
                      <CardDescription>
                        Revenue and expense projections
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quarterlyForecast.map((quarter, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-foreground">{quarter.quarter}</h4>
                          <Badge 
                            variant={quarter.status === "actual" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {quarter.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Revenue</p>
                            <p className="font-bold text-green-600">{quarter.revenue}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Expenses</p>
                            <p className="font-bold text-red-600">{quarter.expenses}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Net Income</p>
                            <p className="font-bold text-gradient">{quarter.netIncome}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Margin</p>
                            <p className="font-bold text-foreground">{quarter.margin}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Budget Allocation Chart */}
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
                      <BarChart3 className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Budget Allocation Overview</CardTitle>
                      <CardDescription>
                        Visual breakdown of budget distribution
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Budget
                    </Button>
                    <Button size="sm" className="btn-premium">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Budget Distribution</h4>
                    <div className="space-y-3">
                      {[
                        { category: "Investment Operations", amount: "$2.5M", percentage: 40, color: "bg-blue-500" },
                        { category: "Real Estate Management", amount: "$1.8M", percentage: 29, color: "bg-green-500" },
                        { category: "Administrative", amount: "$850K", percentage: 14, color: "bg-purple-500" },
                        { category: "Technology", amount: "$650K", percentage: 10, color: "bg-orange-500" },
                        { category: "Marketing", amount: "$420K", percentage: 7, color: "bg-red-500" }
                      ].map((item, index) => (
                        <motion.div 
                          key={index}
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${item.color}`} />
                            <span className="font-medium text-foreground">{item.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{item.percentage}%</p>
                            <p className="text-sm text-muted-foreground">{item.amount}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Budget Performance</h4>
                    <div className="h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                        <p className="text-muted-foreground">Budget performance chart</p>
                        <p className="text-sm text-muted-foreground">Interactive visualization</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 