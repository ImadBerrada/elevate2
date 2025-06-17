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
  Pause
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Retreat {
  id: string;
  title: string;
  description: string;
  type: 'wellness' | 'corporate' | 'spiritual' | 'adventure' | 'educational';
  status: 'active' | 'draft' | 'archived' | 'full';
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
  image: string;
  createdAt: string;
  updatedAt: string;
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

  useEffect(() => {
    fetchRetreats();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchRetreats();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, typeFilter, statusFilter]);

  const fetchRetreats = async () => {
    try {
      setLoading(true);
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
      // For now, show empty state instead of error to avoid breaking the UI
      setRetreats([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'full': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'draft': return AlertCircle;
      case 'archived': return Archive;
      case 'full': return Pause;
      default: return XCircle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wellness': return 'bg-green-50 text-green-700 border-green-200';
      case 'corporate': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'spiritual': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'adventure': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'educational': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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

  const handleDuplicate = (retreat: Retreat) => {
    console.log('Duplicating retreat:', retreat.title);
    // In production, this would create a copy of the retreat
  };

  const handleArchive = (retreat: Retreat) => {
    console.log('Archiving retreat:', retreat.title);
    // In production, this would archive the retreat
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading Retreats...</span>
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
                <Button variant="outline" size="sm">
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
                  {retreats.filter(r => r.status === 'active').length} active
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
                        <SelectItem value="wellness">Wellness</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="spiritual">Spiritual</SelectItem>
                        <SelectItem value="adventure">Adventure</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
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
                          <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-t-lg flex items-center justify-center">
                            <div className="text-center">
                              <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                              <p className="text-sm text-blue-600 font-medium">{retreat.title}</p>
                            </div>
                          </div>
                          
                          <div className="absolute top-3 right-3 flex space-x-2">
                            <Badge className={cn("text-xs", getTypeColor(retreat.type))}>
                              {retreat.type}
                            </Badge>
                            <Badge className={cn("text-xs", getStatusColor(retreat.status))}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {retreat.status}
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
                                  onClick={() => handleArchive(retreat)}
                                  className="text-red-600"
                                >
                                  <Archive className="w-4 h-4 mr-2" />
                                  Archive
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
                                  {retreat.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("text-xs", getStatusColor(retreat.status))}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {retreat.status}
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
                                        onClick={() => handleArchive(retreat)}
                                        className="text-red-600"
                                      >
                                        <Archive className="w-4 h-4 mr-2" />
                                        Archive
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
    </div>
  );
} 