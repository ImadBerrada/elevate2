"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Copy,
  Archive,
  Eye,
  Users,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Download,
  RefreshCw,
  Grid,
  List,
  SortAsc,
  SortDesc,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
  Trash2,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Retreat {
  id: string;
  title: string;
  description: string;
  type: 'WELLNESS' | 'CORPORATE' | 'SPIRITUAL' | 'ADVENTURE' | 'EDUCATIONAL' | 'CUSTOM';
  customTypeName?: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'FULL';
  duration: number; // days
  capacity: number;
  currentBookings: number;
  price: number;
  startDate: string;
  endDate: string;
  location: string;
  instructor: string;
  rating: number;
  totalReviews: number;
  amenities: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    totalGuests: number;
    totalRevenue: number;
    averageRating: number;
    occupancyRate: number;
  };
}

export default function RetreatList() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [retreatToDelete, setRetreatToDelete] = useState<Retreat | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRetreats();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm || typeFilter !== 'all' || statusFilter !== 'all') {
        fetchRetreats();
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, typeFilter, statusFilter]);

  const fetchRetreats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 50,
        offset: 0,
      };

      const data = await apiClient.getRetreats(params);
      setRetreats(data.retreats || []);
    } catch (err) {
      console.error('Failed to fetch retreats:', err);
      setError('Failed to load retreats. Please try again.');
      setRetreats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRetreats();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'FULL': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return CheckCircle;
      case 'DRAFT': return AlertCircle;
      case 'ARCHIVED': return Archive;
      case 'FULL': return Pause;
      default: return XCircle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'WELLNESS': return 'bg-green-50 text-green-700 border-green-200';
      case 'CORPORATE': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SPIRITUAL': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ADVENTURE': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'EDUCATIONAL': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CUSTOM': return 'bg-pink-50 text-pink-700 border-pink-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (retreat: Retreat) => {
    // If it's a custom type, use the custom type name
    if (retreat.type === 'CUSTOM' && retreat.customTypeName) {
      return retreat.customTypeName;
    }
    
    // Otherwise use predefined labels
    switch (retreat.type) {
      case 'WELLNESS': return 'Wellness';
      case 'CORPORATE': return 'Corporate';
      case 'SPIRITUAL': return 'Spiritual';
      case 'ADVENTURE': return 'Adventure';
      case 'EDUCATIONAL': return 'Educational';
      default: return retreat.type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'DRAFT': return 'Draft';
      case 'ARCHIVED': return 'Archived';
      case 'FULL': return 'Full';
      default: return status;
    }
  };

  const filteredRetreats = retreats.filter(retreat => {
    const matchesSearch = retreat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         retreat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         retreat.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || retreat.type === typeFilter;
    const matchesStatus = statusFilter === "all" || retreat.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedRetreats = [...filteredRetreats].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Retreat];
    let bValue: any = b[sortBy as keyof Retreat];
    
    if (sortBy === 'price' || sortBy === 'capacity' || sortBy === 'currentBookings' || sortBy === 'duration') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleDuplicate = async (retreat: Retreat) => {
    try {
      setSuccess(null);
      setError(null);
      
      // In production, this would duplicate the retreat
      console.log('Duplicating retreat:', retreat.title);
      setSuccess(`Retreat "${retreat.title}" duplicated successfully.`);
      
      // Refresh the list
      await fetchRetreats();
    } catch (err) {
      console.error('Failed to duplicate retreat:', err);
      setError('Failed to duplicate retreat. Please try again.');
    }
  };

  const handleArchive = async (retreat: Retreat) => {
    try {
      setSuccess(null);
      setError(null);
      
      // In production, this would archive the retreat
      console.log('Archiving retreat:', retreat.title);
      setSuccess(`Retreat "${retreat.title}" archived successfully.`);
      
      // Refresh the list
      await fetchRetreats();
    } catch (err) {
      console.error('Failed to archive retreat:', err);
      setError('Failed to archive retreat. Please try again.');
    }
  };

  const handleDeleteClick = (retreat: Retreat) => {
    setRetreatToDelete(retreat);
    setDeleteDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleDeleteConfirm = async () => {
    if (!retreatToDelete) return;

    try {
      setDeleting(true);
      setError(null);
      
      await apiClient.deleteRetreat(retreatToDelete.id);
      
      setSuccess(`Retreat "${retreatToDelete.title}" deleted successfully.`);
      setDeleteDialogOpen(false);
      setRetreatToDelete(null);
      
      // Refresh the list
      await fetchRetreats();
    } catch (err) {
      console.error('Failed to delete retreat:', err);
      setError('Failed to delete retreat. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRetreatToDelete(null);
    setDeleting(false);
    setError(null);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-elegant">Loading Retreats...</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-prestigious text-gradient mb-2">
                  Retreat Programs
                </h1>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  Manage all retreat programs, packages, and schedules.
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="border-refined"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
                  Refresh
                </Button>
                
                <Button variant="outline" size="sm" className="border-refined">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                <Link href="/bridge-retreats/retreats/create">
                  <Button className="btn-premium">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Retreat
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Error/Success Messages */}
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 fixed top-20 right-4 z-50 max-w-md"
            >
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearMessages}
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearMessages}
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Alert>
              )}
            </motion.div>
          )}

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Total Retreats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient">{retreats.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {retreats.filter(r => r.status === 'ACTIVE').length} active
                </p>
              </CardContent>
            </Card>

            <Card className="card-premium border-refined">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="w-4 h-4 mr-2 text-green-600" />
                  Total Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {retreats.reduce((sum, r) => sum + r.capacity, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {retreats.reduce((sum, r) => sum + r.currentBookings, 0)} booked
                </p>
              </CardContent>
            </Card>

            <Card className="card-premium border-refined">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-purple-600" />
                  Avg Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  AED {Math.round(retreats.reduce((sum, r) => sum + r.price, 0) / retreats.length).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per retreat program
                </p>
              </CardContent>
            </Card>

            <Card className="card-premium border-refined">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-600" />
                  Avg Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {(retreats.filter(r => r.rating > 0).reduce((sum, r) => sum + r.rating, 0) / 
                    retreats.filter(r => r.rating > 0).length).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {retreats.reduce((sum, r) => sum + r.totalReviews, 0)} reviews
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Controls */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-premium border-refined">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search retreats..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-refined"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="WELLNESS">Wellness</SelectItem>
                        <SelectItem value="CORPORATE">Corporate</SelectItem>
                        <SelectItem value="SPIRITUAL">Spiritual</SelectItem>
                        <SelectItem value="ADVENTURE">Adventure</SelectItem>
                        <SelectItem value="EDUCATIONAL">Educational</SelectItem>
                        <SelectItem value="CUSTOM">Custom Types</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="FULL">Full</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="capacity">Capacity</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                        <SelectItem value="startDate">Start Date</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-full sm:w-auto"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* View Mode */}
                  <div className="flex items-center border border-border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-8 px-3"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="h-8 px-3"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Retreats Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedRetreats.map((retreat, index) => {
                  const StatusIcon = getStatusIcon(retreat.status);
                  const occupancyRate = (retreat.currentBookings / retreat.capacity) * 100;
                  
                  return (
                    <motion.div
                      key={retreat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card className="card-premium border-refined hover:shadow-lg transition-all duration-300 group">
                        <div className="relative">
                          {retreat.images && retreat.images.length > 0 ? (
                            <div className="h-48 rounded-t-lg overflow-hidden">
                              <img
                                src={retreat.images[0]}
                                alt={retreat.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          ) : (
                            <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-t-lg flex items-center justify-center">
                              <div className="text-center">
                                <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                                <p className="text-sm text-blue-600 font-medium">{retreat.title}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="absolute top-3 right-3 flex space-x-2">
                            <Badge className={cn("text-xs", getTypeColor(retreat.type))}>
                              {getTypeLabel(retreat)}
                            </Badge>
                            <Badge className={cn("text-xs", getStatusColor(retreat.status))}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {getStatusLabel(retreat.status)}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                                {retreat.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {retreat.description}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{retreat.duration} days</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{retreat.currentBookings}/{retreat.capacity}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span>AED {retreat.price.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="truncate">{retreat.location}</span>
                              </div>
                            </div>

                            {retreat.rating > 0 && (
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "w-4 h-4",
                                        i < Math.floor(retreat.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {retreat.rating} ({retreat.totalReviews} reviews)
                                </span>
                              </div>
                            )}

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Occupancy</span>
                                <span className="font-medium">{occupancyRate.toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    occupancyRate >= 90 ? "bg-red-500" :
                                    occupancyRate >= 70 ? "bg-yellow-500" : "bg-green-500"
                                  )}
                                  style={{ width: `${occupancyRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        <div className="px-6 pb-6">
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              <Link href={`/bridge-retreats/retreats/${retreat.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Link href={`/bridge-retreats/retreats/${retreat.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDuplicate(retreat)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Link href={`/bridge-retreats/retreats/${retreat.id}/schedule`} className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Schedule
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClick(retreat)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="card-premium border-refined">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Retreat</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedRetreats.map((retreat) => {
                          const StatusIcon = getStatusIcon(retreat.status);
                          const occupancyRate = (retreat.currentBookings / retreat.capacity) * 100;
                          
                          return (
                            <TableRow key={retreat.id} className="hover:bg-gray-50/50">
                              <TableCell>
                                <div>
                                  <div className="font-medium text-gray-900">{retreat.title}</div>
                                  <div className="text-sm text-muted-foreground">{retreat.instructor}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("text-xs", getTypeColor(retreat.type))}>
                                  {getTypeLabel(retreat)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("text-xs", getStatusColor(retreat.status))}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {getStatusLabel(retreat.status)}
                                </Badge>
                              </TableCell>
                              <TableCell>{retreat.duration} days</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm">{retreat.currentBookings}/{retreat.capacity}</div>
                                  <div className="w-16 bg-gray-200 rounded-full h-1">
                                    <div
                                      className={cn(
                                        "h-1 rounded-full",
                                        occupancyRate >= 90 ? "bg-red-500" :
                                        occupancyRate >= 70 ? "bg-yellow-500" : "bg-green-500"
                                      )}
                                      style={{ width: `${occupancyRate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>AED {retreat.price.toLocaleString()}</TableCell>
                              <TableCell>
                                {retreat.rating > 0 ? (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm">{retreat.rating}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">No reviews</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Link href={`/bridge-retreats/retreats/${retreat.id}`}>
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <Link href={`/bridge-retreats/retreats/${retreat.id}/edit`}>
                                    <Button variant="ghost" size="sm">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleDuplicate(retreat)}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Duplicate
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Link href={`/bridge-retreats/retreats/${retreat.id}/schedule`} className="flex items-center">
                                          <Calendar className="w-4 h-4 mr-2" />
                                          Schedule
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteClick(retreat)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {sortedRetreats.length === 0 && (
              <Card className="card-premium border-refined">
                <CardContent className="py-16">
                  <div className="text-center">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No retreats found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your search criteria or filters."
                        : "Get started by creating your first retreat program."
                      }
                    </p>
                    {!(searchTerm || typeFilter !== "all" || statusFilter !== "all") && (
                      <Link href="/bridge-retreats/retreats/create">
                        <Button className="btn-premium">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Retreat
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </main>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Retreat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{retreatToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {retreatToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{retreatToDelete.title}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Type: {getTypeLabel(retreatToDelete)}</div>
                  <div>Instructor: {retreatToDelete.instructor}</div>
                  <div>Current Bookings: {retreatToDelete.currentBookings}</div>
                </div>
              </div>
              
              {retreatToDelete.currentBookings > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ Warning: This retreat has {retreatToDelete.currentBookings} active booking(s). 
                    Deleting it may affect existing customers.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Retreat
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 