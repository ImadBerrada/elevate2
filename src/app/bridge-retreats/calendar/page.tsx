"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Star,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  RefreshCw,
  Grid,
  List
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

interface CalendarRetreat {
  id: string;
  title: string;
  type: 'wellness' | 'corporate' | 'spiritual' | 'adventure' | 'educational';
  status: 'active' | 'draft' | 'archived' | 'full';
  startDate: string;
  endDate: string;
  duration: number;
  capacity: number;
  currentBookings: number;
  price: number;
  location: string;
  instructor: string;
  color: string;
}

interface Resource {
  id: string;
  name: string;
  type: 'room' | 'instructor' | 'equipment';
  availability: { [date: string]: boolean };
}

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  retreats: CalendarRetreat[];
  conflicts: string[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RetreatCalendar() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [selectedRetreat, setSelectedRetreat] = useState<CalendarRetreat | null>(null);
  const [retreats, setRetreats] = useState<CalendarRetreat[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showConflicts, setShowConflicts] = useState(false);
  const [draggedRetreat, setDraggedRetreat] = useState<CalendarRetreat | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, viewMode]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, retreats]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getRetreatCalendar({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        view: viewMode,
      });
      
      setRetreats(data.retreats || []);
      // Transform resource availability data
      const resourceData: Resource[] = [];
      if (data.resourceAvailability?.instructors) {
        data.resourceAvailability.instructors.forEach((instructor: any, index: number) => {
          resourceData.push({
            id: `instructor-${index}`,
            name: instructor.name,
            type: 'instructor',
            availability: instructor.availability || {},
          });
        });
      }
      if (data.resourceAvailability?.facilities) {
        data.resourceAvailability.facilities.forEach((facility: any, index: number) => {
          resourceData.push({
            id: `facility-${index}`,
            name: facility.name,
            type: 'room',
            availability: facility.availability || {},
          });
        });
      }
      setResources(resourceData);
    } catch (err) {
      console.error('Failed to fetch calendar data:', err);
      // For now, show empty state instead of error to avoid breaking the UI
      setRetreats([]);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const dayRetreats = retreats.filter(retreat => {
        const start = new Date(retreat.startDate);
        const end = new Date(retreat.endDate);
        return date >= start && date <= end;
      });
      
      // Check for conflicts (multiple retreats using same resources)
      const conflicts: string[] = [];
      const usedResources: { [key: string]: string[] } = {};
      
      dayRetreats.forEach(retreat => {
        // Check location conflicts
        if (!usedResources[retreat.location]) {
          usedResources[retreat.location] = [];
        }
        if (usedResources[retreat.location].length > 0) {
          conflicts.push(`Location conflict: ${retreat.location}`);
        }
        usedResources[retreat.location].push(retreat.title);
        
        // Check instructor conflicts
        if (!usedResources[retreat.instructor]) {
          usedResources[retreat.instructor] = [];
        }
        if (usedResources[retreat.instructor].length > 0) {
          conflicts.push(`Instructor conflict: ${retreat.instructor}`);
        }
        usedResources[retreat.instructor].push(retreat.title);
      });
      
      days.push({
        date: dateString,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        retreats: dayRetreats,
        conflicts: [...new Set(conflicts)] // Remove duplicates
      });
    }
    
    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
                         retreat.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         retreat.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || retreat.type === typeFilter;
    const matchesStatus = statusFilter === "all" || retreat.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDragStart = (e: React.DragEvent, retreat: CalendarRetreat) => {
    setDraggedRetreat(retreat);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    if (!draggedRetreat) return;
    
    console.log(`Moving ${draggedRetreat.title} to ${targetDate}`);
    // In production, this would update the retreat dates via API
    setDraggedRetreat(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading Calendar...</span>
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
                  Retreat Calendar
                </h1>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  Visual scheduling and resource management for all retreats.
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
                    New Retreat
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Conflicts Alert */}
          {showConflicts && calendarDays.some(day => day.conflicts.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-medium mb-2">Resource Conflicts Detected</div>
                  <p className="text-sm">Some retreats have overlapping resource requirements. Check the calendar for details.</p>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Controls */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-premium border-refined">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Calendar Navigation */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToToday}>
                        Today
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <h2 className="text-xl font-semibold">
                      {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-1 items-center space-x-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search retreats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-refined"
                      />
                    </div>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
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
                      <SelectTrigger className="w-32">
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

                    <Button
                      variant={showConflicts ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowConflicts(!showConflicts)}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Conflicts
                    </Button>
                  </div>

                  {/* View Mode */}
                  <div className="flex items-center border border-border rounded-lg p-1">
                    <Button
                      variant={viewMode === "month" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("month")}
                      className="h-8 px-3"
                    >
                      Month
                    </Button>
                    <Button
                      variant={viewMode === "week" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("week")}
                      className="h-8 px-3"
                    >
                      Week
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-8 px-3"
                    >
                      List
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Calendar Views */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              {/* Month View */}
              <TabsContent value="month">
                <Card className="card-premium border-refined">
                  <CardContent className="p-6">
                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {DAYS.map(day => (
                        <div key={day} className="p-3 text-center font-medium text-muted-foreground">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => (
                        <div
                          key={index}
                          className={cn(
                            "min-h-[120px] p-2 border border-gray-100 rounded-lg transition-all duration-200",
                            day.isCurrentMonth ? "bg-white" : "bg-gray-50",
                            day.isToday && "ring-2 ring-primary ring-opacity-50",
                            day.conflicts.length > 0 && showConflicts && "bg-red-50 border-red-200"
                          )}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day.date)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn(
                              "text-sm font-medium",
                              day.isCurrentMonth ? "text-gray-900" : "text-gray-400",
                              day.isToday && "text-primary font-bold"
                            )}>
                              {new Date(day.date).getDate()}
                            </span>
                            
                            {day.conflicts.length > 0 && showConflicts && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>

                          <div className="space-y-1">
                            {day.retreats.slice(0, 2).map(retreat => (
                              <div
                                key={retreat.id}
                                className="p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: retreat.color + '20', color: retreat.color }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, retreat)}
                                onClick={() => setSelectedRetreat(retreat)}
                              >
                                <div className="font-medium truncate">{retreat.title}</div>
                                <div className="text-xs opacity-75">{retreat.instructor}</div>
                              </div>
                            ))}
                            
                            {day.retreats.length > 2 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{day.retreats.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Week View */}
              <TabsContent value="week">
                <Card className="card-premium border-refined">
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Week View</h3>
                      <p className="text-muted-foreground">
                        Week view is coming soon. Use month view for now.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* List View */}
              <TabsContent value="list">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle>All Retreats</CardTitle>
                    <CardDescription>
                      {filteredRetreats.length} retreats found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredRetreats.map(retreat => (
                        <div key={retreat.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-medium text-gray-900">{retreat.title}</h4>
                                <Badge className={cn("text-xs", getTypeColor(retreat.type))}>
                                  {retreat.type}
                                </Badge>
                                <Badge className={cn("text-xs", getStatusColor(retreat.status))}>
                                  {retreat.status}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>
                                    {new Date(retreat.startDate).toLocaleDateString()} - {new Date(retreat.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{retreat.duration} days</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{retreat.currentBookings}/{retreat.capacity}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span>AED {retreat.price.toLocaleString()}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{retreat.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4" />
                                  <span>{retreat.instructor}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Retreat Detail Modal */}
          <Dialog open={!!selectedRetreat} onOpenChange={() => setSelectedRetreat(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedRetreat?.title}</DialogTitle>
                <DialogDescription>
                  Quick overview and actions for this retreat
                </DialogDescription>
              </DialogHeader>
              
              {selectedRetreat && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Badge className={cn("text-xs", getTypeColor(selectedRetreat.type))}>
                      {selectedRetreat.type}
                    </Badge>
                    <Badge className={cn("text-xs", getStatusColor(selectedRetreat.status))}>
                      {selectedRetreat.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-medium">{selectedRetreat.duration} days</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <div className="font-medium">{selectedRetreat.currentBookings}/{selectedRetreat.capacity}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <div className="font-medium">AED {selectedRetreat.price.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <div className="font-medium">{selectedRetreat.location}</div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Instructor:</span>
                    <div className="font-medium">{selectedRetreat.instructor}</div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Dates:</span>
                    <div className="font-medium">
                      {new Date(selectedRetreat.startDate).toLocaleDateString()} - {new Date(selectedRetreat.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Link href={`/bridge-retreats/retreats/${selectedRetreat.id}`}>
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/bridge-retreats/retreats/${selectedRetreat.id}/edit`}>
                      <Button>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Retreat
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
} 
 
 
 