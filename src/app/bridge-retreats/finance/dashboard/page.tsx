"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Wallet,
  RefreshCw,
  Calculator,
  Activity,
  Eye,
  FileText,
  Filter,
  Calendar,
  Users,
  Building2,
  Plus,
  X,
  Save
} from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: number;
  accountsReceivable: number;
  accountsPayable: number;
  operatingExpenses: number;
  revenueGrowth: number;
  expenseGrowth: number;
}

interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: 'OVER' | 'UNDER' | 'ON_TRACK';
  description?: string;
  period?: string;
  id: string;
}

interface CashFlowData {
  month: string;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  runningBalance: number;
}

interface ProfitLossData {
  category: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

interface FinancialAlert {
  id: string;
  type: 'WARNING' | 'CRITICAL' | 'INFO';
  title: string;
  description: string;
  amount?: number;
  date: string;
}

interface FinancialData {
  metrics: FinancialMetrics;
  budgetComparison: BudgetComparison[];
  cashFlowData: CashFlowData[];
  profitLossData: ProfitLossData[];
  alerts: FinancialAlert[];
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  progress?: number;
  target?: string;
}

interface FilterState {
  category: string;
  minAmount: string;
  maxAmount: string;
  dateFrom: string;
  dateTo: string;
}

export default function FinancialDashboardPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState("30d");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: "",
  });

  // Budget creation state
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    customCategory: "",
    amount: "",
    description: "",
    period: "monthly" as "monthly" | "quarterly" | "yearly"
  });
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [creatingBudget, setCreatingBudget] = useState(false);
  const [updatingBudget, setUpdatingBudget] = useState<string | null>(null);
  const [updateActualDialogOpen, setUpdateActualDialogOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [actualAmountForm, setActualAmountForm] = useState({
    actual: '',
    notes: ''
  });

  useEffect(() => {
    fetchFinancialData();
  }, [periodFilter]);

    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
      // Fetch financial dashboard data
      const dashboardResponse = await fetch(`/api/bridge-retreats/finance/dashboard?period=${periodFilter}&companyId=default`);
        
      if (!dashboardResponse.ok) {
          throw new Error('Failed to fetch financial data');
        }
        
      const dashboardData = await dashboardResponse.json();
      
      // Fetch budget data from the new budgets API
      const budgetResponse = await fetch(`/api/bridge-retreats/finance/budgets?companyId=default`);
      
      let budgetData = { budgetComparison: [] };
      if (budgetResponse.ok) {
        try {
          const parsedBudgetData = await budgetResponse.json();
          if (parsedBudgetData.success && parsedBudgetData.budgetComparison) {
            budgetData = { budgetComparison: parsedBudgetData.budgetComparison };
          } else {
            console.warn('Budget API returned unsuccessful response:', parsedBudgetData);
          }
        } catch (parseError) {
          console.warn('Failed to parse budget response:', parseError);
        }
      } else {
        console.warn('Budget API request failed:', budgetResponse.status, budgetResponse.statusText);
      }
      
      // Combine the data
      const financialData = {
        ...dashboardData,
        budgetComparison: budgetData.budgetComparison || dashboardData.budgetComparison || []
      };
      
        setData(financialData);
      } catch (err) {
        console.error('Error fetching financial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch financial data');
        
      // Set empty data structure instead of mock data
        setData({
          metrics: {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            profitMargin: 0,
            cashFlow: 0,
            accountsReceivable: 0,
            accountsPayable: 0,
            operatingExpenses: 0,
            revenueGrowth: 0,
            expenseGrowth: 0,
          },
          budgetComparison: [],
          cashFlowData: [],
          profitLossData: [],
          alerts: [],
          period: periodFilter,
          dateRange: {
            start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            end: format(new Date(), 'yyyy-MM-dd'),
          },
        });
      } finally {
        setLoading(false);
      }
    };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const formatCategoryName = (category: string) => {
    // Convert snake_case to Title Case
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'OVER':
        return 'bg-red-100 text-red-800';
      case 'UNDER':
        return 'bg-green-100 text-green-800';
      case 'ON_TRACK':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return AlertTriangle;
      case 'WARNING':
        return Clock;
      case 'INFO':
        return CheckCircle;
      default:
        return CheckCircle;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return 'border-red-200 bg-red-50';
      case 'WARNING':
        return 'border-yellow-200 bg-yellow-50';
      case 'INFO':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create CSV data
      const csvData = [
        ['Metric', 'Value', 'Period'],
        ['Total Revenue', data?.metrics.totalRevenue || 0, periodFilter],
        ['Total Expenses', data?.metrics.totalExpenses || 0, periodFilter],
        ['Net Profit', data?.metrics.netProfit || 0, periodFilter],
        ['Cash Flow', data?.metrics.cashFlow || 0, periodFilter],
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-dashboard-${periodFilter}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('Financial data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleApplyFilters = () => {
    console.log('Applying filters:', filters);
    // In a real app, this would refetch data with filters
    setFilterDialogOpen(false);
    // Show success message or update UI
  };

  const handleClearFilters = () => {
    setFilters({
      category: "all",
      minAmount: "",
      maxAmount: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const handleCreateBudget = async () => {
    try {
      setCreatingBudget(true);
      // Clear previous messages
      setError(null);
      setSuccessMessage(null);
      
      // Comprehensive form validation
      if (!budgetForm.category) {
        setError('Please select a budget category');
        return;
      }
      
      if (budgetForm.category === 'custom' && !budgetForm.customCategory.trim()) {
        setError('Please enter a custom category name');
        return;
      }
      
      if (!budgetForm.amount || budgetForm.amount.trim() === '') {
        setError('Please enter a budget amount');
        return;
      }
      
      const budgetAmount = parseFloat(budgetForm.amount);
      if (isNaN(budgetAmount) || budgetAmount <= 0) {
        setError('Please enter a valid amount greater than 0');
        return;
      }
      
      if (!budgetForm.period) {
        setError('Please select a budget period');
        return;
      }
      
      // Prepare budget data
      const finalCategory = budgetForm.category === 'custom' ? budgetForm.customCategory.trim() : budgetForm.category;
      
      const requestData = {
        category: finalCategory,
        amount: budgetAmount,
        description: budgetForm.description.trim() || '',
        period: budgetForm.period,
        companyId: 'default'
      };

      console.log('Creating budget with data:', requestData);
      
      // Save to database via API
      const response = await fetch('/api/bridge-retreats/finance/budgets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('Budget API response status:', response.status, response.statusText);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Budget API response data:', responseData);
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        throw new Error('Server returned invalid response');
      }
      
      if (!response.ok) {
        throw new Error(responseData?.error || `Server error: ${response.status} ${response.statusText}`);
      }
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Budget creation was not successful');
      }
      
      // Add the new budget to the current data to show immediate feedback
      if (data && responseData.budgetComparison) {
        setData(prevData => ({
          ...prevData!,
          budgetComparison: [...prevData!.budgetComparison, responseData.budgetComparison]
        }));
      }
      
      // Reset form and close dialog
      setBudgetForm({
        category: "",
        customCategory: "",
        amount: "",
        description: "",
        period: "monthly" as "monthly" | "quarterly" | "yearly"
      });
      setShowCustomCategory(false);
      setBudgetDialogOpen(false);
      
      // Clear any previous errors
      setError(null);
      
      // Show success message
      setSuccessMessage(`Budget created successfully for ${finalCategory}!`);
      
      // Refresh data to ensure consistency
      setTimeout(() => {
        fetchFinancialData();
      }, 1000);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      console.log('Budget created successfully:', {
        id: responseData.budget?.id,
        category: finalCategory,
        amount: budgetAmount
      });
      
    } catch (error) {
      console.error('Error creating budget:', error);
      setError(error instanceof Error ? error.message : 'Failed to create budget. Please try again.');
    } finally {
      setCreatingBudget(false);
    }
  };

  const navigateToTransactions = () => {
    router.push('/bridge-retreats/finance/transactions');
  };

  const navigateToBookings = () => {
    router.push('/bridge-retreats/bookings');
  };

  const navigateToExpenses = () => {
    router.push('/bridge-retreats/expenses');
  };

  const navigateToReports = () => {
    router.push('/bridge-retreats/reports/revenue');
  };

  const handleUpdateActual = async () => {
    try {
      setUpdatingBudget(selectedBudgetId);
      setError(null);
      setSuccessMessage(null);

      // Validate form
      if (!actualAmountForm.actual || actualAmountForm.actual.trim() === '') {
        setError('Please enter an actual amount');
        return;
      }

      const actualAmount = parseFloat(actualAmountForm.actual);
      if (isNaN(actualAmount) || actualAmount < 0) {
        setError('Please enter a valid amount (0 or greater)');
        return;
      }

      console.log('Updating actual amount for budget:', {
        id: selectedBudgetId,
        actual: actualAmount,
        notes: actualAmountForm.notes
      });

      // Update actual amount via API
      const response = await fetch('/api/bridge-retreats/finance/budgets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          budgetId: selectedBudgetId,
          actualAmount: actualAmount,
          notes: actualAmountForm.notes
        })
      });

      console.log('Update actual API response status:', response.status, response.statusText);

      let responseData;
      try {
        responseData = await response.json();
        console.log('Update actual API response data:', responseData);
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        throw new Error('Server returned invalid response');
      }

      if (!response.ok) {
        throw new Error(responseData?.error || `Server error: ${response.status} ${response.statusText}`);
      }

      if (!responseData.success) {
        throw new Error(responseData.error || 'Budget update was not successful');
      }

      // Update the budget in current data
      if (data && responseData.budget) {
        setData(prevData => ({
          ...prevData!,
          budgetComparison: prevData!.budgetComparison.map(budget => 
            budget.id === selectedBudgetId 
              ? {
                  ...budget,
                  actual: actualAmount,
                  variance: actualAmount - budget.budgeted,
                  variancePercent: budget.budgeted > 0 ? ((actualAmount - budget.budgeted) / budget.budgeted) * 100 : 0,
                  status: (() => {
                    const variancePercent = budget.budgeted > 0 ? ((actualAmount - budget.budgeted) / budget.budgeted) * 100 : 0;
                    if (variancePercent > 10) return 'OVER' as const;
                    else if (variancePercent < -10) return 'UNDER' as const;
                    else return 'ON_TRACK' as const;
                  })()
                }
              : budget
          )
        }));
      }

      // Reset form and close dialog
      setActualAmountForm({
        actual: '',
        notes: ''
      });
      setSelectedBudgetId('');
      setUpdateActualDialogOpen(false);

      // Show success message
      setSuccessMessage('Actual amount updated successfully!');

      // Refresh data to ensure consistency
      setTimeout(() => {
        fetchFinancialData();
      }, 1000);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      console.log('Actual amount updated successfully for budget:', selectedBudgetId);

    } catch (error) {
      console.error('Error updating actual amount:', error);
      setError(error instanceof Error ? error.message : 'Failed to update actual amount. Please try again.');
    } finally {
      setUpdatingBudget(null);
    }
  };

  const openUpdateActualDialog = (budgetId: string, currentActual: number) => {
    setSelectedBudgetId(budgetId);
    setActualAmountForm({
      actual: currentActual.toString(),
      notes: ''
    });
    setUpdateActualDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-elegant">Loading Financial Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
            <h2 className="text-2xl font-elegant text-gradient mb-2">No Data Available</h2>
            <p className="text-refined mb-4">Unable to load financial data at this time.</p>
            <Button onClick={fetchFinancialData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, budgetComparison, cashFlowData, profitLossData, alerts } = data;

  // Create metric cards data
  const metricCards: MetricCard[] = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.totalRevenue),
      change: `${metrics.revenueGrowth >= 0 ? '+' : ''}${metrics.revenueGrowth.toFixed(1)}%`,
      changeType: metrics.revenueGrowth >= 0 ? 'increase' : 'decrease',
      icon: DollarSign,
      description: "Revenue growth from last period",
      progress: 85,
      target: formatCurrency(150000)
    },
    {
      title: "Net Profit",
      value: formatCurrency(metrics.netProfit),
      change: `${metrics.profitMargin.toFixed(1)}%`,
      changeType: metrics.netProfit >= 0 ? 'increase' : 'decrease',
      icon: TrendingUp,
      description: "Profit margin this period",
      progress: Math.min(metrics.profitMargin * 2, 100),
      target: "45% margin"
    },
    {
      title: "Cash Flow",
      value: formatCurrency(metrics.cashFlow),
      change: metrics.cashFlow >= 0 ? "Positive" : "Negative",
      changeType: metrics.cashFlow >= 0 ? 'increase' : 'decrease',
      icon: Wallet,
      description: "Net cash flow this period",
      progress: Math.min((metrics.cashFlow / 50000) * 100, 100)
    },
    {
      title: "Accounts Receivable",
      value: formatCurrency(metrics.accountsReceivable),
      change: "Outstanding",
      changeType: 'neutral',
      icon: CreditCard,
      description: "Pending customer payments",
      progress: Math.min((metrics.accountsReceivable / 25000) * 100, 100)
    }
  ];

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-prestigious text-gradient mb-2">
                  Financial Dashboard
                </h1>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  Real-time financial metrics, budget tracking, and performance analytics.
                </p>
                  </div>
              
              <div className="flex items-center space-x-3">
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="12m">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
                
                <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Filter Financial Data</DialogTitle>
                      <DialogDescription>
                        Apply filters to customize your financial view
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="revenue">Revenue</SelectItem>
                            <SelectItem value="expenses">Expenses</SelectItem>
                            <SelectItem value="profit">Profit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minAmount">Min Amount</Label>
                          <Input
                            id="minAmount"
                            placeholder="0"
                            value={filters.minAmount}
                            onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxAmount">Max Amount</Label>
                          <Input
                            id="maxAmount"
                            placeholder="1000000"
                            value={filters.maxAmount}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dateFrom">Date From</Label>
                          <Input
                            id="dateFrom"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateTo">Date To</Label>
                          <Input
                            id="dateTo"
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={handleClearFilters}>
                          Clear Filters
                        </Button>
                        <Button onClick={handleApplyFilters}>
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportData}
                  disabled={exporting}
                >
                  {exporting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                  <Download className="w-4 h-4 mr-2" />
                  )}
                  Export
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-4 right-4 z-50 max-w-md"
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                  <p className="text-sm text-green-800 font-medium">{successMessage}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-4 right-4 z-50 max-w-md"
            >
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Key Metrics Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {metricCards.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card className="card-premium border-refined hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span className="text-muted-foreground">{metric.title}</span>
                      <metric.icon className="w-4 h-4 text-primary" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gradient mb-1">{metric.value}</div>
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      {metric.changeType === 'increase' ? (
                        <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                      ) : metric.changeType === 'decrease' ? (
                        <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                      ) : null}
                      <span className={cn(
                        metric.changeType === 'increase' ? 'text-green-600' : 
                        metric.changeType === 'decrease' ? 'text-red-600' : 
                        'text-gray-600'
                      )}>
                        {metric.change}
                      </span>
                      <span className="ml-1 text-refined">{metric.description}</span>
                    </div>
                    {metric.progress !== undefined && (
                      <div className="space-y-1">
                        <Progress value={metric.progress} className="h-1.5" />
                        {metric.target && (
                          <div className="text-xs text-refined">
                            Target: {metric.target}
                          </div>
                        )}
                      </div>
                    )}
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </motion.div>

            {/* Financial Alerts */}
            {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 sm:mb-8"
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="text-xl font-elegant flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-orange-500" />
                    Financial Alerts
                  </CardTitle>
                  <CardDescription className="text-refined">
                    Important financial notifications and warnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.map((alert) => {
                      const AlertIcon = getAlertIcon(alert.type);
                      return (
                        <div 
                          key={alert.id} 
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-lg border border-refined transition-all duration-200 hover:shadow-md",
                            getAlertColor(alert.type)
                          )}
                        >
                          <AlertIcon className={cn(
                            "w-5 h-5 mt-0.5",
                            alert.type === 'CRITICAL' ? 'text-red-500' :
                            alert.type === 'WARNING' ? 'text-yellow-500' : 'text-green-500'
                          )} />
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          {alert.amount && (
                              <p className="text-sm font-medium mt-2 text-gray-900">
                                Amount: {formatCurrency(alert.amount)}
                              </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(alert.date), 'MMM dd')}
                        </Badge>
                      </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Financial Analysis Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="budget" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="budget" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Budget vs Actual
                </TabsTrigger>
                <TabsTrigger value="cashflow" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Cash Flow
                </TabsTrigger>
                <TabsTrigger value="profitloss" className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Profit & Loss
                </TabsTrigger>
              </TabsList>

              <TabsContent value="budget">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-elegant">Budget vs Actual Performance</CardTitle>
                        <CardDescription className="text-refined">
                          Compare actual spending against budgeted amounts by category
                        </CardDescription>
                      </div>
                      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="btn-premium">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Budget
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Create New Budget</DialogTitle>
                            <DialogDescription>
                              Set up a budget category to track spending
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="budget-category">Category</Label>
                              <Select 
                                                                  value={budgetForm.category} 
                                  onValueChange={(value) => {
                                    setBudgetForm(prev => ({ 
                                      ...prev, 
                                      category: value,
                                      customCategory: value === "custom" ? prev.customCategory : ""
                                    }));
                                    setShowCustomCategory(value === "custom");
                                  }}
                              >
                                <SelectTrigger className="border-refined">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="staff_salaries">Staff Salaries</SelectItem>
                                  <SelectItem value="marketing">Marketing</SelectItem>
                                  <SelectItem value="utilities">Utilities</SelectItem>
                                  <SelectItem value="supplies">Supplies</SelectItem>
                                  <SelectItem value="maintenance">Maintenance</SelectItem>
                                  <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                                  <SelectItem value="equipment">Equipment</SelectItem>
                                  <SelectItem value="insurance">Insurance</SelectItem>
                                  <SelectItem value="training">Training & Development</SelectItem>
                                  <SelectItem value="travel">Travel & Transportation</SelectItem>
                                  <SelectItem value="custom">+ Add Custom Category</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {showCustomCategory && (
                              <div>
                                <Label htmlFor="custom-category">Custom Category Name</Label>
                                <Input
                                  id="custom-category"
                                  placeholder="Enter custom category name..."
                                  value={budgetForm.customCategory}
                                  onChange={(e) => setBudgetForm(prev => ({ ...prev, customCategory: e.target.value }))}
                                  className="border-refined"
                                />
                                <p className="text-xs text-refined mt-1">
                                  This will create a new budget category for future use
                                </p>
                              </div>
                            )}
                                                          <div>
                                <Label htmlFor="budget-amount">Budget Amount (AED) *</Label>
                                <Input
                                  id="budget-amount"
                                  type="number"
                                  placeholder="10000"
                                  min="0.01"
                                  step="0.01"
                                  value={budgetForm.amount}
                                  onChange={(e) => setBudgetForm(prev => ({ ...prev, amount: e.target.value }))}
                                  className={cn(
                                    "border-refined",
                                    budgetForm.amount && (isNaN(parseFloat(budgetForm.amount)) || parseFloat(budgetForm.amount) <= 0) 
                                      ? "border-red-300 focus:border-red-500" 
                                      : ""
                                  )}
                                />
                                {budgetForm.amount && (isNaN(parseFloat(budgetForm.amount)) || parseFloat(budgetForm.amount) <= 0) && (
                                  <p className="text-xs text-red-600 mt-1">Please enter a valid amount greater than 0</p>
                                )}
                              </div>
                            <div>
                              <Label htmlFor="budget-period">Period</Label>
                              <Select value={budgetForm.period} onValueChange={(value: "monthly" | "quarterly" | "yearly") => setBudgetForm(prev => ({ ...prev, period: value }))}>
                                <SelectTrigger className="border-refined">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="quarterly">Quarterly</SelectItem>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="budget-description">Description</Label>
                              <Textarea
                                id="budget-description"
                                placeholder="Budget description..."
                                value={budgetForm.description}
                                onChange={(e) => setBudgetForm(prev => ({ ...prev, description: e.target.value }))}
                                className="border-refined"
                              />
                            </div>
                            <div className="flex justify-between pt-4">
                              <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleCreateBudget}
                                                                  disabled={
                                    creatingBudget ||
                                    !budgetForm.category ||
                                    !budgetForm.amount?.trim() || 
                                    !budgetForm.period || 
                                    (budgetForm.category === 'custom' && !budgetForm.customCategory.trim()) ||
                                    isNaN(parseFloat(budgetForm.amount)) ||
                                    parseFloat(budgetForm.amount) <= 0
                                  }
                                className="btn-premium"
                              >
                                {creatingBudget ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Create Budget
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {budgetComparison.length > 0 ? (
                      <div className="space-y-4">
                        {budgetComparison.map((item, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border border-refined rounded-lg hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">{formatCategoryName(item.category)}</h4>
                              <div className="flex items-center gap-2">
                                <Badge className={cn("text-xs", getBudgetStatusColor(item.status))}>
                                  {item.status.replace('_', ' ')}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openUpdateActualDialog(item.id, item.actual)}
                                  className="text-xs px-2 py-1 h-6"
                                >
                                  Update Actual
                                </Button>
                              </div>
                              </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-muted-foreground">Budgeted:</span>
                                <p className="font-medium">{formatCurrency(item.budgeted)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Actual:</span>
                                <p className="font-medium">{formatCurrency(item.actual)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Variance:</span>
                                <p className={cn(
                                  "font-medium",
                                  item.variance >= 0 ? 'text-red-600' : 'text-green-600'
                                )}>
                                  {formatCurrency(Math.abs(item.variance))}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Percentage:</span>
                                <p className={cn(
                                  "font-medium",
                                  item.variancePercent >= 0 ? 'text-red-600' : 'text-green-600'
                                )}>
                                  {item.variancePercent.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                                <Progress 
                                  value={Math.min((item.actual / item.budgeted) * 100, 100)} 
                                  className="h-2"
                                />
                          </motion.div>
                        ))}
                              </div>
                    ) : (
                                              <div className="text-center py-12">
                          <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-elegant text-gray-900 mb-2">No Budget Data</h3>
                          <p className="text-refined mb-4">Set up budgets to track performance against targets</p>
                        
                        <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="btn-premium">
                              <Target className="w-4 h-4 mr-2" />
                              Create Budget
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Create New Budget</DialogTitle>
                              <DialogDescription>
                                Set up a budget category to track spending
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="budget-category">Category</Label>
                                <Select 
                                  value={budgetForm.category} 
                                  onValueChange={(value) => {
                                    setBudgetForm(prev => ({ 
                                      ...prev, 
                                      category: value,
                                      customCategory: value === "custom" ? prev.customCategory : ""
                                    }));
                                    setShowCustomCategory(value === "custom");
                                  }}
                                >
                                  <SelectTrigger className="border-refined">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="staff_salaries">Staff Salaries</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="utilities">Utilities</SelectItem>
                                    <SelectItem value="supplies">Supplies</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                                    <SelectItem value="equipment">Equipment</SelectItem>
                                    <SelectItem value="insurance">Insurance</SelectItem>
                                    <SelectItem value="training">Training & Development</SelectItem>
                                    <SelectItem value="travel">Travel & Transportation</SelectItem>
                                    <SelectItem value="custom">+ Add Custom Category</SelectItem>
                                  </SelectContent>
                                </Select>
                            </div>
                              
                              {showCustomCategory && (
                                <div>
                                  <Label htmlFor="custom-category">Custom Category Name</Label>
                                  <Input
                                    id="custom-category"
                                    placeholder="Enter custom category name..."
                                    value={budgetForm.customCategory}
                                    onChange={(e) => setBudgetForm(prev => ({ ...prev, customCategory: e.target.value }))}
                                    className="border-refined"
                                  />
                                  <p className="text-xs text-refined mt-1">
                                    This will create a new budget category for future use
                                  </p>
                          </div>
                              )}
                              <div>
                                <Label htmlFor="budget-amount">Budget Amount (AED) *</Label>
                                <Input
                                  id="budget-amount"
                                  type="number"
                                  placeholder="10000"
                                  min="0.01"
                                  step="0.01"
                                  value={budgetForm.amount}
                                  onChange={(e) => setBudgetForm(prev => ({ ...prev, amount: e.target.value }))}
                                  className={cn(
                                    "border-refined",
                                    budgetForm.amount && (isNaN(parseFloat(budgetForm.amount)) || parseFloat(budgetForm.amount) <= 0) 
                                      ? "border-red-300 focus:border-red-500" 
                                      : ""
                                  )}
                                />
                                {budgetForm.amount && (isNaN(parseFloat(budgetForm.amount)) || parseFloat(budgetForm.amount) <= 0) && (
                                  <p className="text-xs text-red-600 mt-1">Please enter a valid amount greater than 0</p>
                                )}
                      </div>
                              <div>
                                <Label htmlFor="budget-period">Period</Label>
                                <Select value={budgetForm.period} onValueChange={(value: "monthly" | "quarterly" | "yearly") => setBudgetForm(prev => ({ ...prev, period: value }))}>
                                  <SelectTrigger className="border-refined">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="budget-description">Description</Label>
                                <Textarea
                                  id="budget-description"
                                  placeholder="Budget description..."
                                  value={budgetForm.description}
                                  onChange={(e) => setBudgetForm(prev => ({ ...prev, description: e.target.value }))}
                                  className="border-refined"
                                />
                              </div>
                              <div className="flex justify-between pt-4">
                                <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleCreateBudget}
                                  disabled={
                                    creatingBudget ||
                                    !budgetForm.category ||
                                    !budgetForm.amount?.trim() || 
                                    !budgetForm.period || 
                                    (budgetForm.category === 'custom' && !budgetForm.customCategory.trim()) ||
                                    isNaN(parseFloat(budgetForm.amount)) ||
                                    parseFloat(budgetForm.amount) <= 0
                                  }
                                  className="btn-premium"
                                >
                                  {creatingBudget ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                      Creating...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-4 h-4 mr-2" />
                                      Create Budget
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cashflow">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="text-xl font-elegant">Cash Flow Analysis</CardTitle>
                    <CardDescription className="text-refined">
                      Monthly cash inflow and outflow trends with running balance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cashFlowData.length > 0 ? (
                      <div className="space-y-4">
                        {cashFlowData.map((item, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border border-refined rounded-lg hover:shadow-md transition-all duration-200"
                          >
                            <h4 className="font-medium text-gray-900 mb-3">{item.month} 2024</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <span className="text-muted-foreground block mb-1">Cash In</span>
                                <p className="font-bold text-green-600 text-lg">{formatCurrency(item.cashIn)}</p>
                                </div>
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <span className="text-muted-foreground block mb-1">Cash Out</span>
                                <p className="font-bold text-red-600 text-lg">{formatCurrency(item.cashOut)}</p>
                                </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-muted-foreground block mb-1">Net Flow</span>
                                <p className={cn(
                                  "font-bold text-lg",
                                  item.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {formatCurrency(item.netCashFlow)}
                                  </p>
                                </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-muted-foreground block mb-1">Balance</span>
                                <p className="font-bold text-gray-900 text-lg">{formatCurrency(item.runningBalance)}</p>
                                </div>
                              </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-elegant text-gray-900 mb-2">No Cash Flow Data</h3>
                        <p className="text-refined mb-4">Financial transactions will appear here as they occur</p>
                        <Button variant="outline" onClick={navigateToTransactions}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Transactions
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profitloss">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="text-xl font-elegant">Profit & Loss by Category</CardTitle>
                    <CardDescription className="text-refined">
                      Revenue and expense breakdown by retreat type with profit margins
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profitLossData.length > 0 ? (
                      <div className="space-y-4">
                        {profitLossData.map((item, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border border-refined rounded-lg hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">{item.category}</h4>
                              <Badge variant="outline" className="text-xs">
                                {item.margin.toFixed(1)}% margin
                              </Badge>
                                </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <span className="text-muted-foreground block mb-1">Revenue</span>
                                <p className="font-bold text-green-600">{formatCurrency(item.revenue)}</p>
                                </div>
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <span className="text-muted-foreground block mb-1">Expenses</span>
                                <p className="font-bold text-red-600">{formatCurrency(item.expenses)}</p>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-muted-foreground block mb-1">Profit</span>
                                <p className={cn(
                                  "font-bold",
                                  item.profit >= 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {formatCurrency(item.profit)}
                                  </p>
                                </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-muted-foreground block mb-1">Margin</span>
                                <p className="font-bold text-gray-900">{item.margin.toFixed(1)}%</p>
                                </div>
                              </div>
                                <Progress 
                                  value={Math.max(0, Math.min(item.margin + 50, 100))} 
                                  className="h-2"
                                />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-elegant text-gray-900 mb-2">No Profit & Loss Data</h3>
                        <p className="text-refined mb-4">Data will appear as bookings and expenses are recorded</p>
                        <div className="flex justify-center gap-3">
                          <Button variant="outline" onClick={navigateToBookings}>
                            <Building2 className="w-4 h-4 mr-2" />
                            View Bookings
                          </Button>
                          <Button variant="outline" onClick={navigateToExpenses}>
                            <FileText className="w-4 h-4 mr-2" />
                            View Expenses
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Update Actual Amount Dialog */}
          <Dialog open={updateActualDialogOpen} onOpenChange={setUpdateActualDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Actual Amount</DialogTitle>
                <DialogDescription>
                  Enter the actual amount spent for this budget category
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="actual-amount">Actual Amount (AED) *</Label>
                  <Input
                    id="actual-amount"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={actualAmountForm.actual}
                    onChange={(e) => setActualAmountForm(prev => ({ ...prev, actual: e.target.value }))}
                    className={cn(
                      "border-refined",
                      actualAmountForm.actual && (isNaN(parseFloat(actualAmountForm.actual)) || parseFloat(actualAmountForm.actual) < 0) 
                        ? "border-red-300 focus:border-red-500" 
                        : ""
                    )}
                  />
                  {actualAmountForm.actual && (isNaN(parseFloat(actualAmountForm.actual)) || parseFloat(actualAmountForm.actual) < 0) && (
                    <p className="text-xs text-red-600 mt-1">Please enter a valid amount (0 or greater)</p>
                  )}
          </div>
                <div>
                  <Label htmlFor="actual-notes">Notes (Optional)</Label>
                  <Textarea
                    id="actual-notes"
                    placeholder="Add any notes about this actual amount..."
                    value={actualAmountForm.notes}
                    onChange={(e) => setActualAmountForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="border-refined"
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setUpdateActualDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateActual}
                    disabled={
                      updatingBudget === selectedBudgetId ||
                      !actualAmountForm.actual?.trim() || 
                      isNaN(parseFloat(actualAmountForm.actual)) ||
                      parseFloat(actualAmountForm.actual) < 0
                    }
                    className="btn-premium"
                  >
                    {updatingBudget === selectedBudgetId ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Amount
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
} 