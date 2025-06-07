"use client";

import { motion } from "framer-motion";
import { 
  Search,
  Filter,
  Receipt,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  Tag,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  Fuel,
  Wrench,
  Truck,
  Users,
  Building,
  ShoppingCart
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AddExpenseModal } from "@/components/modals/add-expense-modal";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn, toNumber } from "@/lib/utils";
import { useEffect, useState } from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ExpensesPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marahCompanyId, setMarahCompanyId] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const expenseCategories = [
    "Fuel",
    "Vehicle Maintenance",
    "Equipment Maintenance",
    "Staff Salaries",
    "Office Rent",
    "Utilities",
    "Insurance",
    "Marketing",
    "Supplies",
    "Other"
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...expenseCategories.map(cat => ({ value: cat, label: cat }))
  ];

  const dateOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
  ];

  useEffect(() => {
    fetchMarahCompany();
  }, []);

  useEffect(() => {
    if (marahCompanyId) {
      fetchExpenses();
      
      // Set up real-time updates
      const interval = setInterval(() => {
        fetchExpenses();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(interval);
    }
  }, [marahCompanyId]);

  useEffect(() => {
    if (marahCompanyId) {
      fetchExpenses();
    }
  }, [searchTerm, categoryFilter, dateFilter]);

  const fetchMarahCompany = async () => {
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
          setMarahCompanyId(marahCompany.id);
        } else {
          setError('MARAH company not found. Please create it first from the Companies page.');
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch company information');
    }
  };

  const fetchExpenses = async () => {
    if (!marahCompanyId) return;
    
    try {
      const params = new URLSearchParams({
        companyId: marahCompanyId,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
      if (dateFilter && dateFilter !== 'all') params.append('dateFilter', dateFilter);

      const response = await fetch(`/api/marah/expenses?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      } else {
        setError('Failed to fetch expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleViewExpense = (expenseId: string) => {
    console.log('View expense:', expenseId);
  };

  const handleEditExpense = (expenseId: string) => {
    // For now, show a message that editing is not implemented
    alert('Expense editing is not yet implemented. This feature will be available soon.');
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/marah/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        fetchExpenses();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fuel': return Fuel;
      case 'Vehicle Maintenance': return Truck;
      case 'Equipment Maintenance': return Wrench;
      case 'Staff Salaries': return Users;
      case 'Office Rent': return Building;
      case 'Supplies': return ShoppingCart;
      default: return Receipt;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fuel': return 'bg-red-100 text-red-800';
      case 'Vehicle Maintenance': return 'bg-blue-100 text-blue-800';
      case 'Equipment Maintenance': return 'bg-purple-100 text-purple-800';
      case 'Staff Salaries': return 'bg-green-100 text-green-800';
      case 'Office Rent': return 'bg-orange-100 text-orange-800';
      case 'Supplies': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setDateFilter("all");
  };

  const exportExpenses = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        formatDate(expense.date),
        expense.category,
        expense.description,
        expense.amount,
        expense.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marah-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getExpenseStats = () => {
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
    
    // Calculate this month's expenses
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    const thisMonthAmount = thisMonthExpenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
    
    // Calculate last month's expenses for comparison
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
    });
    const lastMonthAmount = lastMonthExpenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
    
    const monthlyChange = lastMonthAmount > 0 ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;
    
    // Category breakdown
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + toNumber(expense.amount);
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];

    return { 
      totalExpenses, 
      totalAmount, 
      thisMonthAmount, 
      monthlyChange,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null
    };
  };

  const stats = getExpenseStats();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isDesktop && isOpen ? "ml-0" : "ml-0",
          "min-w-0"
        )}>
          <Header />
          <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isDesktop && isOpen ? "ml-0" : "ml-0",
          "min-w-0"
        )}>
          <Header />
          <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0"
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Page Header */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">
                  Expenses Management
                </h1>
                <p className="text-muted-foreground">
                  Track and manage business expenses with detailed categorization
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button onClick={exportExpenses} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={fetchExpenses} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setShowAddExpense(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Expense
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Expense Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Total Expenses</span>
                    <Receipt className="h-4 w-4 text-blue-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats.totalExpenses}
                  </div>
                  <p className="text-xs text-blue-600">
                    All time
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Total Amount</span>
                    <DollarSign className="h-4 w-4 text-red-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.totalAmount)}
                  </div>
                  <p className="text-xs text-red-600">
                    All expenses
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>This Month</span>
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.thisMonthAmount)}
                  </div>
                  <p className="text-xs text-purple-600">
                    Current month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Monthly Change</span>
                    {stats.monthlyChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    stats.monthlyChange >= 0 ? "text-red-600" : "text-green-600"
                  )}>
                    {stats.monthlyChange >= 0 ? '+' : ''}{stats.monthlyChange.toFixed(1)}%
                  </div>
                  <p className={cn(
                    "text-xs",
                    stats.monthlyChange >= 0 ? "text-red-600" : "text-green-600"
                  )}>
                    vs last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Top Category</span>
                    <Tag className="h-4 w-4 text-orange-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-orange-600">
                    {stats.topCategory?.name || 'N/A'}
                  </div>
                  <p className="text-xs text-orange-600">
                    {stats.topCategory ? formatCurrency(stats.topCategory.amount) : 'No expenses'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <span>Expense Filtering</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </div>
              </CardHeader>
              
              {showFilters && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="search">Search Expenses</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Description, category..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date">Date Range</Label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All time" />
                        </SelectTrigger>
                        <SelectContent>
                          {dateOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {expenses.length} expenses found
                    </div>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Expenses Table */}
          <motion.div 
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  <span>Expenses List</span>
                </CardTitle>
                <CardDescription>
                  Business expenses with detailed categorization and tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Receipt</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.map((expense) => {
                          const CategoryIcon = getCategoryIcon(expense.category);
                          return (
                            <TableRow key={expense.id}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <div className="font-medium text-sm">
                                    {formatDate(expense.date)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("text-xs", getCategoryColor(expense.category))}>
                                  <CategoryIcon className="w-3 h-3 mr-1" />
                                  {expense.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{expense.description}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold text-red-600">
                                  {formatCurrency(toNumber(expense.amount))}
                                </div>
                              </TableCell>
                              <TableCell>
                                {expense.receiptUrl ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(expense.receiptUrl, '_blank')}
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                ) : (
                                  <div className="text-xs text-muted-foreground">
                                    No receipt
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {expense.notes ? (
                                  <div className="text-sm text-muted-foreground max-w-32 truncate" title={expense.notes}>
                                    {expense.notes}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">
                                    No notes
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    title="View Details"
                                    onClick={() => handleViewExpense(expense.id)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    title="Edit Expense"
                                    onClick={() => handleEditExpense(expense.id)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteExpense(expense.id)}
                                    title="Delete Expense"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Expenses Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || categoryFilter !== 'all' || dateFilter !== 'all'
                        ? "No expenses match your current filters."
                        : "No expenses have been recorded yet."
                      }
                    </p>
                    {(searchTerm || categoryFilter !== 'all' || dateFilter !== 'all') ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => setShowAddExpense(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Record First Expense
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onExpenseCreated={fetchExpenses}
        companyId={marahCompanyId || ""}
      />
    </div>
  );
} 