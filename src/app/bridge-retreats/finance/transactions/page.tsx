"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Building2,
  Users,
  CreditCard,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  retreat?: {
    id: string;
    title: string;
    type: string;
  };
  guest?: {
    id: string;
    name: string;
    email: string;
  };
  facility?: {
    id: string;
    name: string;
    type: string;
  };
  bookingId?: string;
  reference: string;
}

interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
}

interface CategoryBreakdown {
  category: string;
  income: number;
  expenses: number;
  count: number;
}

interface TransactionsData {
  transactions: Transaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  summary: TransactionSummary;
  categoryBreakdown: CategoryBreakdown[];
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function TransactionsPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const [data, setData] = useState<TransactionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState("30d");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    category: '',
    amount: '',
    description: '',
    reference: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [periodFilter, typeFilter, categoryFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        period: periodFilter,
        limit: '50',
        offset: '0'
      });
      
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      
      const response = await fetch(`/api/bridge-retreats/finance/transactions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const transactionsData = await response.json();
      setData(transactionsData);
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      
      // Set empty data structure
      setData({
        transactions: [],
        pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
        summary: { totalIncome: 0, totalExpenses: 0, netAmount: 0, transactionCount: 0 },
        categoryBreakdown: [],
        period: periodFilter,
        dateRange: { start: '', end: '' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      setCreating(true);
      setError(null);
      
      // Validate form
      if (!newTransaction.category || !newTransaction.amount) {
        setError('Category and amount are required');
        return;
      }
      
      const amount = parseFloat(newTransaction.amount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      
      const response = await fetch('/api/bridge-retreats/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newTransaction.type,
          category: newTransaction.category,
          amount: amount,
          description: newTransaction.description,
          reference: newTransaction.reference
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }
      
      // Reset form and close dialog
      setNewTransaction({
        type: 'EXPENSE',
        category: '',
        amount: '',
        description: '',
        reference: ''
      });
      setCreateDialogOpen(false);
      
      // Refresh data
      fetchTransactions();
      
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setCreating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    return type === 'INCOME' ? ArrowUpRight : ArrowDownRight;
  };

  const getTransactionColor = (type: string) => {
    return type === 'INCOME' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = data?.transactions.filter(transaction =>
    searchTerm === '' || 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-elegant">Loading Transactions...</span>
          </div>
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
          {/* Page Header */}
          <motion.div 
            className="mb-6 sm:mb-8"
            {...fadeInUp}
          >
            <div className="flex items-center gap-4 mb-4">
              <Link href="/bridge-retreats/finance/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-prestigious text-gradient mb-2">
                  Financial Transactions
                </h1>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  View and manage all financial transactions across retreats and facilities.
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Transaction</DialogTitle>
                      <DialogDescription>
                        Add a new financial transaction to the system.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="type">Transaction Type</Label>
                        <Select value={newTransaction.type} onValueChange={(value: 'INCOME' | 'EXPENSE') => 
                          setNewTransaction(prev => ({ ...prev, type: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newTransaction.category} onValueChange={(value) => 
                          setNewTransaction(prev => ({ ...prev, category: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BOOKING_PAYMENT">Booking Payment</SelectItem>
                            <SelectItem value="FACILITY_RENTAL">Facility Rental</SelectItem>
                            <SelectItem value="STAFF_SALARY">Staff Salary</SelectItem>
                            <SelectItem value="UTILITIES">Utilities</SelectItem>
                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                            <SelectItem value="SUPPLIES">Supplies</SelectItem>
                            <SelectItem value="MARKETING">Marketing</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="amount">Amount (AED)</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Transaction description..."
                          value={newTransaction.description}
                          onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="reference">Reference</Label>
                        <Input
                          id="reference"
                          placeholder="Transaction reference"
                          value={newTransaction.reference}
                          onChange={(e) => setNewTransaction(prev => ({ ...prev, reference: e.target.value }))}
                        />
                      </div>
                      
                      {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                          {error}
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateTransaction} disabled={creating}>
                          {creating ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Transaction'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>

          {/* Summary Cards */}
          {data && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
              {...fadeInUp}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(data.summary.totalIncome)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(data.summary.totalExpenses)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    data.summary.netAmount >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(data.summary.netAmount)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.summary.transactionCount}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            className="mb-6"
            {...fadeInUp}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Period</Label>
                    <Select value={periodFilter} onValueChange={setPeriodFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Category</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="BOOKING_PAYMENT">Booking Payment</SelectItem>
                        <SelectItem value="FACILITY_RENTAL">Facility Rental</SelectItem>
                        <SelectItem value="STAFF_SALARY">Staff Salary</SelectItem>
                        <SelectItem value="UTILITIES">Utilities</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="SUPPLIES">Supplies</SelectItem>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transactions Table */}
          <motion.div
            {...fadeInUp}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transactions</CardTitle>
                <CardDescription>
                  {filteredTransactions.length} transactions found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => {
                        const Icon = getTransactionIcon(transaction.type);
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {format(new Date(transaction.date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Icon className={cn("w-4 h-4", getTransactionColor(transaction.type))} />
                                <span className={getTransactionColor(transaction.type)}>
                                  {transaction.type}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {transaction.category.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{transaction.description}</div>
                                {transaction.retreat && (
                                  <div className="text-sm text-muted-foreground">
                                    Retreat: {transaction.retreat.title}
                                  </div>
                                )}
                                {transaction.guest && (
                                  <div className="text-sm text-muted-foreground">
                                    Guest: {transaction.guest.name}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={cn(
                                "font-bold",
                                getTransactionColor(transaction.type)
                              )}>
                                {transaction.type === 'INCOME' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(transaction.status)}>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {transaction.reference}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No transactions found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 