"use client";

import { motion } from "framer-motion";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  PieChart,
  Home,
  ChevronRight,
  ExternalLink,
  ArrowLeft
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

function OperatingExpensesContent() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");

  useEffect(() => {
    // Handle URL parameters for navigation context
    const fromParam = searchParams.get('from');
    const successParam = searchParams.get('success');
    const propertyParam = searchParams.get('property');
    const expenseParam = searchParams.get('expense');
    
    if (successParam) {
      setSuccess(successParam);
      setTimeout(() => setSuccess(null), 5000);
    }
    
    if (fromParam) {
      setSuccess(`Navigated from ${fromParam} module`);
      setTimeout(() => setSuccess(null), 4000);
    }

    if (propertyParam) {
      setSuccess(`Viewing operating expenses for ${propertyParam}`);
      setTimeout(() => setSuccess(null), 4000);
    }

    if (expenseParam) {
      setSuccess(`Viewing operating expense ${expenseParam}`);
      setTimeout(() => setSuccess(null), 4000);
    }
  }, [searchParams]);

  const navigateToModule = (module: string, params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    queryParams.set('from', 'expenses-operating');
    router.push(`/real-estate/${module}?${queryParams}`);
  };

  const handleViewProperty = (propertyName: string) => {
    navigateToModule('properties/management', { 
      success: 'Viewing property details from operating expenses',
      property: propertyName 
    });
  };

  const handleBackToExpenses = () => {
    navigateToModule('expenses', { 
      success: 'Returned from operating expenses'
    });
  };

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
                    <h1 className="text-lg sm:text-xl font-elegant text-gradient">Operating Expenses</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground font-refined">Property operational cost management</p>
                  </div>
                  <div className="sm:hidden">
                    <h1 className="text-base font-elegant text-gradient">Operating</h1>
                  </div>
                </div>
              </motion.div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleBackToExpenses}
                  variant="outline" 
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Expenses
                </Button>
                <Button 
                  onClick={() => navigateToModule('home', { success: 'Navigated to dashboard' })}
                  variant="outline" 
                  size="sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
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
                onClick={() => navigateToModule('properties/management', { success: 'Viewing properties from operating expenses' })}
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
                onClick={() => navigateToModule('expenses', { success: 'Viewing all expenses' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">All Expenses</h3>
                      <p className="text-xs text-muted-foreground">View all costs</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift group"
                onClick={() => navigateToModule('expenses/maintenance', { success: 'Viewing maintenance costs' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Maintenance</h3>
                      <p className="text-xs text-muted-foreground">View costs</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card 
                className="card-premium border-refined cursor-pointer hover-lift group"
                onClick={() => navigateToModule('reports', { success: 'Viewing reports from operating expenses' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Reports</h3>
                      <p className="text-xs text-muted-foreground">View analytics</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Overview Cards */}
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
                    <span>Monthly Expenses</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Current month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">$130,000</div>
                  <p className="text-xs sm:text-sm text-green-600">-5.2% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Budget Remaining</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">This month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">$20,000</div>
                  <p className="text-xs sm:text-sm text-yellow-600">13.3% remaining</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Pending Approvals</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Awaiting approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">5</div>
                  <p className="text-xs sm:text-sm text-yellow-600">$12,300 total value</p>
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
                  <CardDescription className="text-xs sm:text-sm">Highest expense</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-gradient">Utilities</div>
                  <p className="text-xs sm:text-sm text-blue-600">28% of total expenses</p>
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
                  placeholder="Search operating expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
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
                    onClick={() => navigateToModule('reports', { success: 'Viewing reports from operating expenses' })}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  {expenseCategories.map((category, index) => (
                    <motion.div
                      key={category.category}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setCategoryFilter(category.category.toLowerCase())}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                          <Receipt className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{category.category}</h3>
                          <p className="text-xs text-muted-foreground">{category.percentage}% of total</p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gradient">{category.amount}</div>
                    </motion.div>
                  ))}
                    </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Expenses */}
          <motion.div variants={fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Recent Operating Expenses</CardTitle>
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
                          <Receipt className="w-5 h-5 text-primary" />
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
                    onClick={() => navigateToModule('properties/management', { success: 'Viewing property details from operating expenses' })}
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
                          <Badge 
                            className={`text-xs ${getUtilizationColor(property.utilization) === 'text-red-600' ? 'bg-red-100 text-red-800' : 
                              getUtilizationColor(property.utilization) === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                            variant="outline"
                          >
                            {property.utilization}% budget used
                          </Badge>
                        </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Monthly:</span>
                          <span className="font-medium">{property.monthly}</span>
                          </div>
                        <div className="flex justify-between">
                          <span>YTD:</span>
                          <span className="font-medium">{property.ytd}</span>
                          </div>
                        <div className="flex justify-between">
                          <span>Budget:</span>
                          <span className="font-medium">{property.budget}</span>
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
        </main>
      </div>
    </div>
  );
}

export default function OperatingExpenses() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <OperatingExpensesContent />
    </Suspense>
  );
} 