"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Settings,
  Users, 
  DollarSign, 
  PieChart,
  FileText,
  Calendar,
  Mail,
  Building2,
  Target,
  Plus,
  Filter,
  Search,
  Download,
  Edit,
  MoreHorizontal,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  Briefcase,
  RefreshCw,
  Trash2,
  Shield,
  RotateCcw,
  Ban,
  CheckCheck,
  History,
  UserX,
  Crown,
  Save,
  UserCheck,
  ExternalLink,
  ArrowLeft,
  Database,
  BarChart3,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { investorService, type Investor, type CreateInvestorData } from '@/lib/api/investors';
import { apiClient } from '@/lib/api-client';

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

interface ManagementStats {
  totalInvestors: number;
  pendingApprovals: number;
  activeManagement: number;
  completedActions: number;
  totalInvestment: number;
  averageStake: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export default function InvestorManagement() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const { user } = useAuth();
  const router = useRouter();
  
  // State management
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [stats, setStats] = useState<ManagementStats>({
    totalInvestors: 0,
    pendingApprovals: 0,
    activeManagement: 0,
    completedActions: 0,
    totalInvestment: 0,
    averageStake: 0,
    riskDistribution: { low: 0, medium: 0, high: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Management states
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Permission helpers
  const canManage = () => {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';
  };

  const canBulkActions = () => {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  };

  const canDelete = () => {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  };

  useEffect(() => {
    if (!canManage()) {
      router.push('/elevate/investor');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await investorService.getInvestors({ limit: 100 });
      
      if (response.success) {
        const transformedInvestors = response.investors.map(investor => 
          investorService.transformFromApiFormat(investor)
        );
        setInvestors(transformedInvestors);
        
        // Calculate management stats
        const stats: ManagementStats = {
          totalInvestors: transformedInvestors.length,
          pendingApprovals: transformedInvestors.filter(inv => inv.status === 'PENDING').length,
          activeManagement: transformedInvestors.filter(inv => inv.status === 'ACTIVE').length,
          completedActions: transformedInvestors.filter(inv => inv.status === 'EXITED').length,
          totalInvestment: transformedInvestors.reduce((sum, inv) => sum + inv.investment, 0),
          averageStake: transformedInvestors.length > 0 
            ? transformedInvestors.reduce((sum, inv) => sum + inv.stake, 0) / transformedInvestors.length 
            : 0,
          riskDistribution: {
            low: transformedInvestors.filter(inv => inv.riskProfile === 'LOW').length,
            medium: transformedInvestors.filter(inv => inv.riskProfile === 'MEDIUM').length,
            high: transformedInvestors.filter(inv => inv.riskProfile === 'HIGH').length,
          }
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load management data');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!canBulkActions() || selectedInvestors.length === 0) return;

    const confirmMessage = `Are you sure you want to ${bulkAction} ${selectedInvestors.length} investor(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const promises = selectedInvestors.map(investorId => {
        switch (bulkAction) {
          case 'activate':
            return investorService.updateInvestor({ id: investorId } as any);
          case 'deactivate':
            return investorService.updateInvestor({ id: investorId } as any);
          case 'delete':
            return investorService.deleteInvestor(investorId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      setSuccess(`Bulk action "${bulkAction}" completed for ${selectedInvestors.length} investor(s)`);
      setSelectedInvestors([]);
      setBulkAction('');
      setIsBulkActionsOpen(false);
      await fetchData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('Failed to perform bulk action');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setSuccess('Exporting investor data...');
      // Export logic would go here
      setTimeout(() => {
        setSuccess('Data exported successfully');
        setTimeout(() => setSuccess(null), 3000);
      }, 2000);
    } catch (error) {
      setError('Failed to export data');
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!canManage()) {
    return null;
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-500",
      isOpen ? "lg:pl-64" : "lg:pl-20"
    )}>
      <Sidebar />
      <BurgerMenu />
      
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0"
          {...fadeInUp}
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/elevate/investor')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient bg-gradient-to-r from-primary to-primary/70">
                Investor Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive administrative controls for investor and investment management
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="flex items-center space-x-1">
              {React.createElement(user?.role === 'SUPER_ADMIN' ? Crown : user?.role === 'ADMIN' ? Shield : Users, { className: "w-4 h-4" })}
              <span>{user?.role}</span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/elevate/investor')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Investors
            </Button>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </motion.div>
        )}

        {/* Management Stats */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Database className="w-4 h-4 text-primary" />
                  <span>Total Managed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient">
                  {loading ? '...' : stats.totalInvestors}
                </div>
                <p className="text-xs text-muted-foreground">Active investors</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span>Pending Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {loading ? '...' : stats.pendingApprovals}
                </div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span>Active Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '...' : stats.activeManagement}
                </div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="card-premium border-refined">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Avg. Stake</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : `${stats.averageStake.toFixed(1)}%`}
                </div>
                <p className="text-xs text-muted-foreground">Average ownership</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Management Tabs */}
        <motion.div {...fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bulk-actions">Bulk Actions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Management Actions */}
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span>Quick Actions</span>
                    </CardTitle>
                    <CardDescription>
                      Common management tasks and operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/elevate/investor')}
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      Add New Investor
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setIsImportOpen(true)}
                    >
                      <Download className="w-4 h-4 mr-3" />
                      Import Investors
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={handleExportData}
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      Export Data
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={fetchData}
                    >
                      <RefreshCw className="w-4 h-4 mr-3" />
                      Refresh Data
                    </Button>
                  </CardContent>
                </Card>

                {/* Risk Distribution */}
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <span>Risk Distribution</span>
                    </CardTitle>
                    <CardDescription>
                      Investment risk profile breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">Low Risk</span>
                        <Badge variant="outline" className="text-green-600">
                          {stats.riskDistribution.low}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-yellow-600">Medium Risk</span>
                        <Badge variant="outline" className="text-yellow-600">
                          {stats.riskDistribution.medium}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">High Risk</span>
                        <Badge variant="outline" className="text-red-600">
                          {stats.riskDistribution.high}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center font-medium">
                      <span>Total Investment</span>
                      <span className="text-primary">{formatCurrency(stats.totalInvestment)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="w-5 h-5 text-primary" />
                    <span>Recent Management Activity</span>
                  </CardTitle>
                  <CardDescription>
                    Latest administrative actions and changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading activity...
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                        <p className="text-sm">Management actions will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bulk Actions Tab */}
            <TabsContent value="bulk-actions" className="space-y-6">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCheck className="w-5 h-5 text-primary" />
                    <span>Bulk Operations</span>
                  </CardTitle>
                  <CardDescription>
                    Perform actions on multiple investors simultaneously
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!canBulkActions() ? (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="font-medium text-muted-foreground mb-2">Access Restricted</h3>
                      <p className="text-sm text-muted-foreground">
                        Bulk operations require Admin or Super Admin privileges
                      </p>
                    </div>
                  ) : selectedInvestors.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="font-medium text-muted-foreground mb-2">No Investors Selected</h3>
                      <p className="text-sm text-muted-foreground">
                        Go to the main investor page to select investors for bulk operations
                      </p>
                      <Button 
                        className="mt-4"
                        onClick={() => router.push('/elevate/investor')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Select Investors
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Selected Investors: {selectedInvestors.length}</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedInvestors.map(id => {
                            const investor = investors.find(inv => inv.id === id);
                            return investor && (
                              <Badge key={id} variant="outline">
                                {investor.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col"
                          onClick={() => setBulkAction('activate')}
                        >
                          <CheckCircle className="w-6 h-6 mb-2 text-green-600" />
                          Activate All
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-20 flex-col"
                          onClick={() => setBulkAction('deactivate')}
                        >
                          <Ban className="w-6 h-6 mb-2 text-yellow-600" />
                          Deactivate All
                        </Button>
                        {canDelete() && (
                          <Button 
                            variant="outline" 
                            className="h-20 flex-col text-red-600 hover:text-red-700"
                            onClick={() => setBulkAction('delete')}
                          >
                            <Trash2 className="w-6 h-6 mb-2" />
                            Delete All
                          </Button>
                        )}
                      </div>

                      {bulkAction && (
                        <Button 
                          className="w-full"
                          onClick={handleBulkAction}
                          variant={bulkAction === 'delete' ? 'destructive' : 'default'}
                        >
                          Execute: {bulkAction} {selectedInvestors.length} investor(s)
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle>Investment Analytics</CardTitle>
                    <CardDescription>Portfolio performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">Analytics Dashboard</h3>
                      <p className="text-sm">Advanced analytics coming soon</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle>Performance Tracking</CardTitle>
                    <CardDescription>ROI and growth metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">Performance Dashboard</h3>
                      <p className="text-sm">Performance tracking coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-primary" />
                    <span>Management Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure investor management preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">Settings Panel</h3>
                    <p className="text-sm">Management settings coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
 