"use client";

import React from "react";
import { motion } from "framer-motion";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  FileText,
  ExternalLink,
  Home,
  CreditCard,
  BarChart3,
  AlertCircle,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

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

interface Expense {
  id: string;
  description: string;
  property: string;
  category: string;
  amount: string;
  date: string;
  vendor: string;
  status: string;
  receipt: boolean;
}

interface ExpenseCategory {
  category: string;
  amount: string;
  percentage: number;
  color: string;
}

interface MonthlyExpense {
  month: string;
  amount: number;
  budget: number;
}

interface PropertyExpense {
  property: string;
  totalExpenses: string;
  monthlyAvg: string;
  categories: number;
  lastExpense: string;
}

function ExpensesManagementContent() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");

  useEffect(() => {
    // Handle URL parameters for navigation context
    const fromParam = searchParams.get('from');
    const successParam = searchParams.get('success');
    const propertyParam = searchParams.get('property');
    
    if (successParam) {
      setSuccess(successParam);
      setTimeout(() => setSuccess(null), 5000);
    }
    
    if (fromParam) {
      setSuccess(`Navigated from ${fromParam} module`);
      setTimeout(() => setSuccess(null), 4000);
    }

    if (propertyParam) {
      setPropertyFilter(propertyParam);
      setSuccess(`Viewing expenses for ${propertyParam}`);
      setTimeout(() => setSuccess(null), 4000);
    }
  }, [searchParams]);

  const navigateToModule = (module: string, params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    queryParams.set('from', 'expenses');
    router.push(`/real-estate/${module}?${queryParams}`);
  };

  const expenses: Expense[] = [
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

  const expenseCategories: ExpenseCategory[] = [
    { category: "Maintenance", amount: "$45,200", percentage: 35, color: "bg-blue-500" },
    { category: "Utilities", amount: "$28,800", percentage: 22, color: "bg-green-500" },
    { category: "Insurance", amount: "$25,600", percentage: 20, color: "bg-purple-500" },
    { category: "Security", amount: "$18,400", percentage: 14, color: "bg-orange-500" },
    { category: "Other", amount: "$12,000", percentage: 9, color: "bg-gray-500" }
  ];

  const monthlyExpenses: MonthlyExpense[] = [
    { month: "Jan", amount: 128500, budget: 135000 },
    { month: "Feb", amount: 142300, budget: 135000 },
    { month: "Mar", amount: 119800, budget: 135000 },
    { month: "Apr", amount: 156200, budget: 135000 },
    { month: "May", amount: 134700, budget: 135000 },
    { month: "Jun", amount: 148900, budget: 135000 }
  ];

  const propertyExpenses: PropertyExpense[] = [
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

  const handleViewProperty = (propertyName: string) => {
    navigateToModule('properties/management', { 
      success: 'Viewing property details from expenses',
      property: propertyName 
    });
  };

  const handleViewMaintenance = (expense: Expense) => {
    if (expense.category === "Maintenance") {
      navigateToModule('appliances/maintenance', { 
        success: 'Viewing maintenance details',
        property: expense.property,
        expense: expense.id
      });
    }
  };

  const handleViewReports = () => {
    navigateToModule('reports', { 
      success: 'Viewing expense reports',
      type: 'expense'
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0"
      )}>
        <motion.header 
          className={cn(
            "glass-header sticky top-0 z-50 transition-all duration-300",
            isOpen ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
          )}
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: isOpen ? 0 : 1, 
            y: isOpen ? -20 : 0 
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-2 sm:space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <BurgerMenu />
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <motion.div
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Receipt className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                  </motion.div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg sm:text-xl font-elegant text-gradient">Expense Management</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground font-refined">Track and manage property expenses</p>
                  </div>
                  <div className="sm:hidden">
                    <h1 className="text-base font-elegant text-gradient">Expenses</h1>
                  </div>
                </div>
              </motion.div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => navigateToModule('home', { success: 'Navigated to dashboard' })}
                  variant="outline" 
                  size="sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  onClick={handleViewReports}
                  size="sm"
                  className="btn-premium"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-6">
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </motion.div>
          )}

          {/* Quick Navigation */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift group"
                onClick={() => navigateToModule('properties/management', { success: 'Viewing properties from expenses' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Properties</h3>
                      <p className="text-xs text-muted-foreground">View properties</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift group"
                onClick={() => navigateToModule('appliances/maintenance', { success: 'Viewing maintenance from expenses' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Wrench className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Maintenance</h3>
                      <p className="text-xs text-muted-foreground">Maintenance costs</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift group"
                onClick={() => navigateToModule('invoices/history', { success: 'Viewing invoices from expenses' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Invoices</h3>
                      <p className="text-xs text-muted-foreground">Related invoices</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift group"
                onClick={() => navigateToModule('payments/history', { success: 'Viewing payments from expenses' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Payments</h3>
                      <p className="text-xs text-muted-foreground">Payment history</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Expense Overview Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Total Expenses</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">This month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">$148,900</div>
                  <p className="text-xs sm:text-sm text-red-600">+10.2% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Budget Variance</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">vs planned budget</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">+$13,900</div>
                  <p className="text-xs sm:text-sm text-red-600">10.3% over budget</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Pending Approvals</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Awaiting approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">12</div>
                  <p className="text-xs sm:text-sm text-yellow-600">$24,750 total value</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Top Category</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Highest expense category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">Maintenance</div>
                  <p className="text-xs sm:text-sm text-blue-600">35% of total expenses</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            {...fadeInUp}
          >
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="btn-premium">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </motion.div>

          {/* Expense Categories */}
          <motion.div variants={fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm sm:text-base">Expense Categories</CardTitle>
                    <CardDescription>Breakdown by category this month</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewReports}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {expenseCategories.map((category, index) => {
                    const IconComponent = getCategoryIcon(category.category);
                    return (
                      <motion.div
                        key={category.category}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setCategoryFilter(category.category.toLowerCase())}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{category.category}</h3>
                            <p className="text-xs text-muted-foreground">{category.percentage}% of total</p>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gradient">{category.amount}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Expenses */}
          <motion.div variants={fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Recent Expenses</CardTitle>
                <CardDescription>Latest expense transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((expense, index) => (
                    <motion.div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleViewProperty(expense.property)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                          {React.createElement(getCategoryIcon(expense.category), { className: "w-5 h-5 text-primary" })}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{expense.description}</h3>
                          <p className="text-xs text-muted-foreground">{expense.property} • {expense.vendor}</p>
                          <p className="text-xs text-muted-foreground">{expense.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusBg(expense.status)}>
                          {expense.status}
                        </Badge>
                        <div className="text-right">
                          <div className="font-semibold">{expense.amount}</div>
                          <div className="text-xs text-muted-foreground">{expense.category}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Property Expenses */}
          <motion.div variants={fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm sm:text-base">Expenses by Property</CardTitle>
                    <CardDescription>Property-wise expense breakdown</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToModule('properties/management', { success: 'Viewing property details from expenses' })}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Properties
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {propertyExpenses.map((property, index) => (
                    <motion.div
                      key={property.property}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleViewProperty(property.property)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-sm">{property.property}</h3>
                        <Badge variant="outline" className="text-xs">{property.categories} categories</Badge>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Total Expenses:</span>
                          <span className="font-medium text-red-600">{property.totalExpenses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Average:</span>
                          <span className="font-medium">{property.monthlyAvg}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Expense:</span>
                          <span className="text-muted-foreground">{property.lastExpense}</span>
                        </div>
                      </div>
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

export default function ExpensesManagement() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading expenses...</p>
          </div>
        </div>
      </div>
    }>
      <ExpensesManagementContent />
    </Suspense>
  );
} 