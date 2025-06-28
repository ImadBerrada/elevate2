"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  Plus, 
  Receipt, 
  Download, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  AlertCircle,
  Building2,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Loader2,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Expense {
  id: string;
  category: string;
  department: string | null;
  amount: number;
  description: string;
  vendor: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  reference: string | null;
  paymentMethod: string | null;
  taxAmount: number;
  approvedBy: string | null;
  approvedAt: string | null;
  retreat: {
    id: string;
    title: string;
    type: string;
    location: string;
  } | null;
  facility: {
    id: string;
    name: string;
    type: string;
    location: string;
  } | null;
  booking: {
    id: string;
    guestName: string;
  } | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ExpenseMetrics {
  totalExpenses: number;
  approvedExpenses: number;
  pendingExpenses: number;
  totalCount: number;
  averageExpense: number;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  approved: number;
  pending: number;
  rejected: number;
  percentage: number;
}

interface ExpenseApiResponse {
  metrics: ExpenseMetrics;
  expenses: Expense[];
  categoryBreakdown: CategoryBreakdown[];
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

const expenseCategories = [
  'STAFF_SALARIES',
  'FACILITY_MAINTENANCE', 
  'UTILITIES',
  'MARKETING',
  'SUPPLIES',
  'FOOD_BEVERAGE',
  'EQUIPMENT',
  'INSURANCE',
  'PROFESSIONAL_SERVICES',
  'TRAVEL_TRANSPORT',
  'OTHER_EXPENSE'
];

const departments = [
  'OPERATIONS',
  'HOUSEKEEPING',
  'FOOD_SERVICE',
  'WELLNESS',
  'ADMINISTRATION',
  'MARKETING',
  'MAINTENANCE'
];

export default function ExpensesPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const [data, setData] = useState<ExpenseApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Dialog states
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isExpenseDetailOpen, setIsExpenseDetailOpen] = useState(false);
  
  // Filters
  const [periodFilter, setPeriodFilter] = useState("30d");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Form data
  const [expenseForm, setExpenseForm] = useState({
    category: "",
    department: "",
    amount: "",
    description: "",
    vendorName: "",
    paymentMethod: "",
    reference: "",
    retreatId: "",
    facilityId: ""
  });

  useEffect(() => {
    fetchExpensesData();
  }, [periodFilter, categoryFilter, statusFilter, departmentFilter]);

  const fetchExpensesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        period: periodFilter,
        category: categoryFilter,
        status: statusFilter,
        department: departmentFilter
      });

      const response = await fetch(`/api/bridge-retreats/expenses?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses data');
      }
      
      const responseData = await response.json();
      setData(responseData);
      
    } catch (err) {
      console.error('Error fetching expenses data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      setSuccess(null);
      await fetchExpensesData();
      setSuccess('Expenses data refreshed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/bridge-retreats/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseForm),
      });

      if (!response.ok) {
        throw new Error('Failed to create expense');
      }

      setSuccess('Expense created successfully');
      setIsAddExpenseOpen(false);
      
      // Reset form
      setExpenseForm({
        category: "",
        department: "",
        amount: "",
        description: "",
        vendorName: "",
        paymentMethod: "",
        reference: "",
        retreatId: "",
        facilityId: ""
      });

      // Refresh data
      await fetchExpensesData();
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Error creating expense:', err);
      setError('Failed to create expense. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateExpenseStatus = async (expenseId: string, status: string) => {
    try {
      setUpdating(expenseId);
      setError(null);

      const response = await fetch('/api/bridge-retreats/expenses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: expenseId,
          status,
          approvedBy: status === 'APPROVED' ? 'Current User' : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update expense status');
      }

      setSuccess(`Expense ${status.toLowerCase()} successfully`);
      await fetchExpensesData();
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Error updating expense status:', err);
      setError('Failed to update expense status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PROCESSED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PROCESSED': return <Activity className="w-4 h-4 text-blue-600" />;
      default: return <Receipt className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCategoryName = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter expenses based on search query
  const filteredExpenses = data?.expenses.filter(expense => {
    const matchesSearch = searchQuery === "" || 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.retreat?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.facility?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];

  // Define table columns
  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => formatDate(row.getValue("date"))
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => (
        <Badge variant="outline" className="font-normal">
          {formatCategoryName(row.getValue("category"))}
        </Badge>
      )
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => (
        <div className="max-w-[300px] truncate" title={row.getValue("description")}>
          {row.getValue("description")}
        </div>
      )
    },
    {
      accessorKey: "vendor",
      header: "Vendor"
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => (
        <div className="font-semibold">{formatCurrency(row.getValue("amount"))}</div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Badge className={getStatusColor(status)}>
              {status}
            </Badge>
          </div>
        );
      }
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }: any) => {
        const dept = row.getValue("department");
        return dept ? (
          <Badge variant="secondary" className="text-xs">
            {formatCategoryName(dept)}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedExpense(row.original);
              setIsExpenseDetailOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.original.status === 'PENDING' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateExpenseStatus(row.original.id, 'APPROVED')}
                disabled={updating === row.original.id}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateExpenseStatus(row.original.id, 'REJECTED')}
                disabled={updating === row.original.id}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

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
          <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading expenses data...</span>
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

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0"
            {...fadeInUp}
          >
            <div>
              <h1 className="text-3xl font-prestigious text-gradient">Expense Management</h1>
              <p className="text-refined text-muted-foreground mt-1">
                Track, approve, and manage all business expenses
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                Refresh
              </Button>
              
              <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>
                      Record a new business expense for tracking and approval
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateExpense} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select 
                          value={expenseForm.category} 
                          onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {formatCategoryName(category)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select 
                          value={expenseForm.department} 
                          onValueChange={(value) => setExpenseForm(prev => ({ ...prev, department: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {formatCategoryName(dept)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the expense..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (AED) *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vendorName">Vendor</Label>
                        <Input
                          id="vendorName"
                          value={expenseForm.vendorName}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, vendorName: e.target.value }))}
                          placeholder="Vendor name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select 
                          value={expenseForm.paymentMethod} 
                          onValueChange={(value) => setExpenseForm(prev => ({ ...prev, paymentMethod: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="CARD">Credit Card</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="CHECK">Check</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reference">Reference/Invoice #</Label>
                        <Input
                          id="reference"
                          value={expenseForm.reference}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, reference: e.target.value }))}
                          placeholder="Invoice or reference number"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddExpenseOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={creating}>
                        {creating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Expense'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Status Messages */}
          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700">{success}</span>
            </motion.div>
          )}

          {data && (
            <>
              {/* Key Metrics */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                {...fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <Card className="card-premium border-refined">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-refined">Total Expenses</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-prestigious text-gradient">
                      {formatCurrency(data.metrics.totalExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.metrics.totalCount} transactions
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-premium border-refined">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-refined">Approved</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-prestigious text-green-600">
                      {formatCurrency(data.metrics.approvedExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Approved expenses
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-premium border-refined">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-refined">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-prestigious text-yellow-600">
                      {formatCurrency(data.metrics.pendingExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Awaiting approval
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-premium border-refined">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-refined">Average</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-prestigious">
                      {formatCurrency(data.metrics.averageExpense)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per expense
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Category Breakdown */}
              <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                <Card className="card-premium mb-8">
                  <CardHeader>
                    <CardTitle className="font-elegant">Expense Breakdown by Category</CardTitle>
                    <CardDescription>Spending analysis across different expense categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.categoryBreakdown.slice(0, 6).map((category) => (
                        <div key={category.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-refined">
                                {formatCategoryName(category.category)}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {category.count} expenses
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(category.amount)}</div>
                              <div className="text-sm text-muted-foreground">
                                {category.percentage.toFixed(1)}% of total
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Approved: {formatCurrency(category.approved)}</span>
                            <span>Pending: {formatCurrency(category.pending)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Filters */}
              <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center font-elegant">
                      <Filter className="h-5 w-5 mr-2" />
                      Filters & Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Category</Label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Categories</SelectItem>
                            {expenseCategories.map(category => (
                              <SelectItem key={category} value={category}>
                                {formatCategoryName(category)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="PROCESSED">Processed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Department</Label>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Departments</SelectItem>
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept}>
                                {formatCategoryName(dept)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Search</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search expenses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCategoryFilter("ALL");
                          setStatusFilter("ALL");
                          setDepartmentFilter("ALL");
                          setSearchQuery("");
                        }}
                      >
                        Clear Filters
                      </Button>
                      <div className="flex space-x-2">
                        <Link href="/bridge-retreats/finance/dashboard">
                          <Button variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Finance Dashboard
                          </Button>
                        </Link>
                        <Link href="/bridge-retreats/finance/budgets">
                          <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            View Budgets
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Expenses Data Table */}
              <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="font-elegant">Expense Details</CardTitle>
                    <CardDescription>
                      Showing {filteredExpenses.length} of {data.expenses.length} expenses for {data.period}
                      {data.dateRange && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({formatDate(data.dateRange.start)} - {formatDate(data.dateRange.end)})
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={columns}
                      data={filteredExpenses}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                className="mt-8 flex flex-wrap gap-4 justify-center"
                {...fadeInUp}
                transition={{ delay: 0.5 }}
              >
                <Link href="/bridge-retreats/finance/transactions">
                  <Button variant="outline">
                    <Receipt className="h-4 w-4 mr-2" />
                    View All Transactions
                  </Button>
                </Link>
                <Link href="/bridge-retreats/bookings">
                  <Button variant="outline">
                    <Building2 className="h-4 w-4 mr-2" />
                    View Bookings
                  </Button>
                </Link>
                <Link href="/bridge-retreats/revenue">
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Revenue Analytics
                  </Button>
                </Link>
              </motion.div>
            </>
          )}

          {/* Expense Detail Dialog */}
          <Dialog open={isExpenseDetailOpen} onOpenChange={setIsExpenseDetailOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Expense Details</DialogTitle>
                <DialogDescription>
                  Complete information about this expense
                </DialogDescription>
              </DialogHeader>
              {selectedExpense && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Category</Label>
                      <p className="font-medium">{formatCategoryName(selectedExpense.category)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Amount</Label>
                      <p className="font-semibold text-lg">{formatCurrency(selectedExpense.amount)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="mt-1">{selectedExpense.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Vendor</Label>
                      <p>{selectedExpense.vendor}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date</Label>
                      <p>{formatDate(selectedExpense.date)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedExpense.status)}
                        <Badge className={getStatusColor(selectedExpense.status)}>
                          {selectedExpense.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Reference</Label>
                      <p>{selectedExpense.reference || 'N/A'}</p>
                    </div>
                  </div>

                  {selectedExpense.retreat && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Related Retreat</Label>
                      <p>{selectedExpense.retreat.title} ({selectedExpense.retreat.type})</p>
                    </div>
                  )}

                  {selectedExpense.facility && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Related Facility</Label>
                      <p>{selectedExpense.facility.name} ({selectedExpense.facility.type})</p>
                    </div>
                  )}

                  {selectedExpense.approvedBy && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Approved By</Label>
                      <p>{selectedExpense.approvedBy} on {selectedExpense.approvedAt ? formatDate(selectedExpense.approvedAt) : 'N/A'}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
} 