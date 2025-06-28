'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Wrench,
  Search,
  Plus,
  Settings,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Edit,
  MoreHorizontal,
  FileText,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  AlertCircle,
  User,
  Building2,
  Star,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  type: 'routine' | 'preventive' | 'repair' | 'emergency' | 'upgrade';
  facility: string;
  location: string;
  requestedBy: string;
  assignedTo: string;
  vendor?: string;
  estimatedCost: number;
  actualCost?: number;
  createdAt: string;
  scheduledDate: string;
  completedDate?: string;
  images: string[];
  notes: string[];
}

interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  specialties: string[];
  rating: number;
  totalJobs: number;
  averageCost: number;
  responseTime: number;
  avatar: string;
}

const MaintenanceTrackingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const facilityFilter = searchParams.get('facility');
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('requests');

  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalCost: 0,
    averageCost: 0,
    averageResponseTime: 0,
  });

  useEffect(() => {
    loadMaintenanceData();
  }, [facilityFilter]);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch maintenance data from API
      const response = await fetch('/api/bridge-retreats/facilities/maintenance');
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance data');
      }
      
      const data = await response.json();
      setRequests(data.requests || []);
      setVendors(data.vendors || []);
      
      // Set stats from API response
      if (data.stats) {
        setStats(data.stats);
      } else {
        // Calculate stats if not provided
        const requests = data.requests || [];
        const totalRequests = requests.length;
        const pending = requests.filter((r: any) => r.status === 'pending').length;
        const inProgress = requests.filter((r: any) => r.status === 'in_progress').length;
        const completed = requests.filter((r: any) => r.status === 'completed').length;
        const totalCost = requests.reduce((sum: number, r: any) => sum + (r.actualCost || r.estimatedCost), 0);
        const averageCost = totalRequests > 0 ? Math.round(totalCost / totalRequests) : 0;
        const averageResponseTime = 0; // Calculate from vendor data

        setStats({
          totalRequests,
          pending,
          inProgress,
          completed,
          totalCost,
          averageCost,
          averageResponseTime,
        });
      }
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      // Set empty state on error
      setRequests([]);
      setVendors([]);
      setStats({
        totalRequests: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        totalCost: 0,
        averageCost: 0,
        averageResponseTime: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'routine':
        return 'bg-green-100 text-green-800';
      case 'preventive':
        return 'bg-blue-100 text-blue-800';
      case 'repair':
        return 'bg-yellow-100 text-yellow-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'upgrade':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    const matchesType = filterType === 'all' || request.type === filterType;
    const matchesFacility = !facilityFilter || request.facility.toLowerCase().includes(facilityFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesFacility;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          "min-w-0"
        )}>
          <Header />
          
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
                <h2 className="text-2xl sm:text-3xl font-prestigious text-gradient mb-2">
                  Maintenance Tracking
                </h2>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  Track maintenance requests, schedules, vendor management, and cost analysis.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Reports</span>
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Wrench className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Total Requests</span>
                    <span className="sm:hidden">Total</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-gradient">
                    {stats.totalRequests}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                    <span className="hidden sm:inline">Pending</span>
                    <span className="sm:hidden">Pend.</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">In Progress</span>
                    <span className="sm:hidden">Active</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {stats.inProgress}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    <span className="hidden sm:inline">Completed</span>
                    <span className="sm:hidden">Done</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {stats.completed}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    <span className="hidden sm:inline">Total Cost</span>
                    <span className="sm:hidden">Cost</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    ${stats.totalCost.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="hidden sm:inline">Avg Cost</span>
                    <span className="sm:hidden">Avg</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    ${stats.averageCost.toFixed(0)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                    <span className="hidden sm:inline">Avg Time</span>
                    <span className="sm:hidden">Time</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                    {stats.averageResponseTime.toFixed(1)}h
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div 
            className="flex flex-col gap-4 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by title, facility, or assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-refined h-11"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-32 border-refined h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full sm:w-32 border-refined h-11">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-32 border-refined h-11">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="upgrade">Upgrade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="requests">Maintenance Requests</TabsTrigger>
              <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
              <TabsTrigger value="preventive">Preventive Schedule</TabsTrigger>
            </TabsList>

            {/* Requests Tab */}
            <TabsContent value="requests">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="card-premium border-refined hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <CardTitle className="text-lg font-semibold">
                                {request.title}
                              </CardTitle>
                              <Badge className={getPriorityColor(request.priority)}>
                                {request.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getStatusColor(request.status)}>
                                {request.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getTypeColor(request.type)}>
                                {request.type}
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <User className="h-4 w-4 mr-2" />
                                Assign Vendor
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {request.description}
                          </p>

                          {/* Location and Facility */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Facility</p>
                              <p className="font-medium flex items-center">
                                <Building2 className="h-3 w-3 mr-1" />
                                {request.facility}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Location</p>
                              <p className="font-medium flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {request.location}
                              </p>
                            </div>
                          </div>

                          {/* Assignment and Vendor */}
                          <div className="grid grid-cols-1 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Assigned To</p>
                              <p className="font-medium">{request.assignedTo}</p>
                            </div>
                            {request.vendor && (
                              <div>
                                <p className="text-muted-foreground">Vendor</p>
                                <p className="font-medium">{request.vendor}</p>
                              </div>
                            )}
                          </div>

                          {/* Cost Information */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Estimated Cost</p>
                              <p className="font-medium text-blue-600">
                                ${request.estimatedCost.toLocaleString()}
                              </p>
                            </div>
                            {request.actualCost && (
                              <div>
                                <p className="text-muted-foreground">Actual Cost</p>
                                <p className="font-medium text-green-600">
                                  ${request.actualCost.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Timeline */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Scheduled</p>
                              <p className="font-medium">
                                {new Date(request.scheduledDate).toLocaleDateString()}
                              </p>
                            </div>
                            {request.completedDate && (
                              <div>
                                <p className="text-muted-foreground">Completed</p>
                                <p className="font-medium">
                                  {new Date(request.completedDate).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {request.notes.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Latest Notes</p>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm">{request.notes[request.notes.length - 1]}</p>
                                {request.notes.length > 1 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    +{request.notes.length - 1} more notes
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Vendors Tab */}
            <TabsContent value="vendors">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor, index) => (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="card-premium border-refined hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={vendor.avatar} />
                            <AvatarFallback>
                              {vendor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold mb-1">
                              {vendor.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {vendor.contact}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="h-4 w-4 mr-2" />
                                Call Vendor
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Contact Information */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{vendor.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{vendor.phone}</span>
                            </div>
                          </div>

                          {/* Specialties */}
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Specialties</p>
                            <div className="flex flex-wrap gap-1">
                              {vendor.specialties.map((specialty, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Performance Metrics */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total Jobs</p>
                              <p className="font-medium">{vendor.totalJobs}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avg Cost</p>
                              <p className="font-medium">${vendor.averageCost}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Response Time</p>
                              <p className="font-medium">{vendor.responseTime}h</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Rating</p>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">{vendor.rating}</span>
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Preventive Schedule Tab */}
            <TabsContent value="preventive">
              <div className="space-y-6">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle>Preventive Maintenance Schedule</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Upcoming preventive maintenance tasks to avoid equipment failures
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {requests
                        .filter(r => r.type === 'preventive' || r.type === 'routine')
                        .map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium">{request.title}</h4>
                              <p className="text-sm text-muted-foreground">{request.facility} - {request.location}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{new Date(request.scheduledDate).toLocaleDateString()}</p>
                              <Badge className={getStatusColor(request.status)}>
                                {request.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {filteredRequests.length === 0 && activeTab === 'requests' && (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Maintenance Requests Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const MaintenanceTrackingPageWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MaintenanceTrackingPage />
    </Suspense>
  );
};

export default MaintenanceTrackingPageWrapper; 