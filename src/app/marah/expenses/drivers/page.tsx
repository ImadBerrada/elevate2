"use client";

import { useState, useEffect } from "react";
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
  Receipt,
  Trash2,
  Download,
  ChevronDown,
  X,
  Calendar,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { AddExpenseModal } from "@/components/modals/add-expense-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toNumber } from "@/lib/utils";

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
  amount: number;
  category: string;
  date: string;
  receipt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleInfo?: string;
  status: string;
}

interface CategoryTotal {
  category: string;
  total: number;
  count: number;
}

interface ExpenseStats {
  totalExpenses: number;
  monthlyExpenses: number;
  driverRelatedExpenses: number;
  avgExpenseAmount: number;
}

export default function DriverExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({
    totalExpenses: 0,
    monthlyExpenses: 0,
    driverRelatedExpenses: 0,
    avgExpenseAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Driver-related expense categories
  const driverExpenseCategories = [
    { value: "FUEL", label: "Fuel" },
    { value: "MAINTENANCE", label: "Vehicle Maintenance" },
    { value: "INSURANCE", label: "Vehicle Insurance" },
    { value: "OTHER", label: "Other Driver Expenses" }
  ];

  const allExpenseCategories = [
    { value: "FUEL", label: "Fuel" },
    { value: "MAINTENANCE", label: "Maintenance" },
    { value: "MARKETING", label: "Marketing" },
    { value: "SUPPLIES", label: "Supplies" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "SALARIES", label: "Salaries" },
    { value: "RENT", label: "Rent" },
    { value: "INSURANCE", label: "Insurance" },
    { value: "OTHER", label: "Other" }
  ];

  const dateFilters = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  // Initialize company
  useEffect(() => {
    const initializeCompany = async () => {
      try {
        const response = await fetch('/api/companies', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const marahCompany = data.companies.find((company: any) => 
            company.name === 'MARAH Inflatable Games Rental'
          );
          
          if (marahCompany) {
            setCompanyId(marahCompany.id);
          } else {
            // If MARAH company doesn't exist, create it
            await createMarahCompany();
          }
        } else {
          throw new Error('Failed to get companies');
        }
      } catch (error) {
        console.error('Error initializing company:', error);
        setError('Failed to initialize company');
      }
    };

    const createMarahCompany = async () => {
      try {
        const response = await fetch('/api/companies/marah', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCompanyId(data.company.id);
        } else {
          throw new Error('Failed to create MARAH company');
        }
      } catch (error) {
        console.error('Error creating MARAH company:', error);
        setError('Failed to create MARAH company');
      }
    };

    initializeCompany();
  }, []);

  // Fetch expenses and drivers data
  const fetchData = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      
      // Fetch expenses with driver-related categories focus
      const expenseParams = new URLSearchParams({
        companyId,
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(dateFilter !== "all" && { dateFilter }),
        ...(searchTerm && { search: searchTerm }),
        limit: "100"
      });

      const [expensesResponse, driversResponse] = await Promise.all([
        fetch(`/api/marah/expenses?${expenseParams}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
        fetch(`/api/marah/drivers?companyId=${companyId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        })
      ]);

      if (expensesResponse.ok && driversResponse.ok) {
        const expensesData = await expensesResponse.json();
        const driversData = await driversResponse.json();
        
        setExpenses(expensesData.expenses || []);
        setDrivers(driversData.drivers || []);
        setCategoryTotals(expensesData.categoryTotals || []);
        
        // Calculate stats
        const allExpenses = expensesData.expenses || [];
        const totalExpenses = allExpenses.length;
        const totalAmount = allExpenses.reduce((sum: number, expense: Expense) => sum + toNumber(expense.amount), 0);
        const avgAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;
        
        // Calculate monthly expenses (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = allExpenses.filter((expense: Expense) => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        }).reduce((sum: number, expense: Expense) => sum + toNumber(expense.amount), 0);

        // Calculate driver-related expenses
        const driverRelatedCategories = ['FUEL', 'MAINTENANCE', 'INSURANCE'];
        const driverRelatedExpenses = allExpenses.filter((expense: Expense) => 
          driverRelatedCategories.includes(expense.category)
        ).reduce((sum: number, expense: Expense) => sum + toNumber(expense.amount), 0);

        setStats({
          totalExpenses,
          monthlyExpenses,
          driverRelatedExpenses,
          avgExpenseAmount: avgAmount
        });
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when companyId or filters change
  useEffect(() => {
    fetchData();
  }, [companyId, selectedCategory, dateFilter, searchTerm]);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [companyId, selectedCategory, dateFilter, searchTerm]);

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`/api/marah/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const handleExport = () => {
    if (expenses.length === 0) return;

    const csvContent = [
      ['ID', 'Description', 'Amount (AED)', 'Category', 'Date', 'Notes'].join(','),
      ...expenses.map(expense => [
        expense.id,
        `"${expense.description}"`,
        expense.amount.toFixed(2),
        expense.category,
        new Date(expense.date).toLocaleDateString(),
        `"${expense.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marah-driver-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setDateFilter("all");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory !== "all") count++;
    if (dateFilter !== "all") count++;
    return count;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FUEL': return '⛽';
      case 'MAINTENANCE': return '🔧';
      case 'INSURANCE': return '🛡️';
      case 'MARKETING': return '📢';
      case 'SUPPLIES': return '📦';
      case 'UTILITIES': return '💡';
      case 'SALARIES': return '💰';
      case 'RENT': return '🏢';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FUEL': return 'bg-red-100 text-red-800';
      case 'MAINTENANCE': return 'bg-blue-100 text-blue-800';
      case 'INSURANCE': return 'bg-purple-100 text-purple-800';
      case 'MARKETING': return 'bg-green-100 text-green-800';
      case 'SUPPLIES': return 'bg-orange-100 text-orange-800';
      case 'UTILITIES': return 'bg-yellow-100 text-yellow-800';
      case 'SALARIES': return 'bg-indigo-100 text-indigo-800';
      case 'RENT': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isDriverRelatedCategory = (category: string) => {
    return ['FUEL', 'MAINTENANCE', 'INSURANCE'].includes(category);
  };

  const getDriverRelatedExpenses = () => {
    return expenses.filter(expense => isDriverRelatedCategory(expense.category));
  };

  const getDriverStats = () => {
    const driverRelatedExpenses = getDriverRelatedExpenses();
    const driverExpensesByCategory = driverRelatedExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(driverExpensesByCategory).map(([category, total]) => ({
      category,
      total,
      count: driverRelatedExpenses.filter(e => e.category === category).length
    }));
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading driver expenses...</p>
          </div>
        </div>
      </div>
    );
  }

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
                    <p className="text-sm text-muted-foreground">Track driver-related expenses and vehicle costs</p>
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="glass-card border-0 hover-glow relative"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="glass-card border-0 hover-glow"
                  onClick={handleExport}
                  disabled={expenses.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button 
                  className="btn-premium"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </motion.div>
            </div>

            {/* Collapsible Filters */}
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent>
                <motion.div 
                  className="mt-6 p-6 glass-card rounded-2xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Filter Driver Expenses</h3>
                    {getActiveFiltersCount() > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Category
                      </label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="glass-card border-0">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {allExpenseCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                              {isDriverRelatedCategory(category.value) && " 🚗"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Time Period
                      </label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="glass-card border-0">
                          <SelectValue placeholder="All Time" />
                        </SelectTrigger>
                        <SelectContent>
                          {dateFilters.map((filter) => (
                            <SelectItem key={filter.value} value={filter.value}>
                              {filter.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
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
                    Total Expenses
                  </CardTitle>
                  <Receipt className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.totalExpenses}</div>
                  <p className="text-sm text-muted-foreground">All expense records</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Total
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">
                    {stats.monthlyExpenses.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}
                  </div>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Driver Related
                  </CardTitle>
                  <Car className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">
                    {stats.driverRelatedExpenses.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}
                  </div>
                  <p className="text-sm text-muted-foreground">Vehicle & driver costs</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Drivers
                  </CardTitle>
                  <Users className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">
                    {drivers.filter(d => d.status === 'ACTIVE').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Available drivers</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Driver-Related Categories */}
          {getDriverStats().length > 0 && (
            <motion.div 
              className="mb-12"
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
                      <Car className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Driver-Related Expenses</CardTitle>
                      <CardDescription>
                        Vehicle and driver operational costs
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getDriverStats().map((category, index) => (
                      <motion.div 
                        key={category.category}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getCategoryIcon(category.category)}</span>
                            <span className="font-medium text-foreground">
                              {allExpenseCategories.find(c => c.value === category.category)?.label || category.category}
                            </span>
                          </div>
                          <Badge className={getCategoryColor(category.category)} variant="outline">
                            {category.count}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-gradient">
                          {category.total.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Expenses List */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.6 }}
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
                      <CardTitle className="text-xl">Expense Records</CardTitle>
                      <CardDescription>
                        {expenses.length} expense{expenses.length !== 1 ? 's' : ''} found
                        {getDriverRelatedExpenses().length > 0 && 
                          ` (${getDriverRelatedExpenses().length} driver-related)`
                        }
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      {getActiveFiltersCount() > 0 ? 'No expenses match your filters' : 'No expenses recorded yet'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {getActiveFiltersCount() > 0 
                        ? 'Try adjusting your search criteria or clear the filters.'
                        : 'Start by recording your first driver expense.'
                      }
                    </p>
                    {getActiveFiltersCount() > 0 ? (
                      <Button variant="outline" onClick={clearFilters}>
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => setShowAddModal(true)} className="btn-premium">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Expense
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenses.map((expense, index) => (
                      <motion.div 
                        key={expense.id}
                        className={`glass-card p-6 rounded-2xl hover-lift group ${
                          isDriverRelatedCategory(expense.category) ? 'ring-2 ring-blue-100' : ''
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="gradient-primary text-white font-semibold">
                                {getCategoryIcon(expense.category)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{expense.description}</h3>
                                <Badge 
                                  className={getCategoryColor(expense.category)}
                                  variant="outline"
                                >
                                  {allExpenseCategories.find(c => c.value === expense.category)?.label || expense.category}
                                </Badge>
                                {isDriverRelatedCategory(expense.category) && (
                                  <Badge className="bg-blue-100 text-blue-800" variant="outline">
                                    🚗 Driver Related
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                                </div>
                                <span>•</span>
                                <span>ID: {expense.id.slice(-8)}</span>
                              </div>
                              {expense.notes && (
                                <p className="text-sm text-muted-foreground">{expense.notes}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground">Amount</p>
                              <p className="text-2xl font-bold text-gradient">
                                {expense.amount.toLocaleString('en-AE', { style: 'currency', currency: 'AED' })}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {expense.receipt && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="glass-card border-0 hover-glow"
                                  onClick={() => window.open(expense.receipt, '_blank')}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Receipt
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="glass-card border-0 hover-glow text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteExpense(expense.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onExpenseCreated={fetchData}
        companyId={companyId}
      />
    </div>
  );
} 