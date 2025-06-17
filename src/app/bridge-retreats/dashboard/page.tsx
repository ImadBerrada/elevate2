"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Home,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Bed,
  Wifi,
  Car,
  Coffee,
  Star,
  Activity,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Edit,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface Booking {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'checked-in' | 'checked-out';
  amount: number;
  guests: number;
}

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignee: string;
  category: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface Activity {
  id: string;
  type: 'booking' | 'payment' | 'maintenance' | 'guest' | 'staff';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  avatar?: string;
}

export default function BridgeRetreatsDashboard() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Mock data - in production, this would come from APIs
  const metrics: MetricCard[] = [
    {
      title: "Occupancy Rate",
      value: "87%",
      change: "+5.2%",
      changeType: "increase",
      icon: Bed,
      description: "Current occupancy vs last period"
    },
    {
      title: "Total Revenue",
      value: "AED 245,680",
      change: "+12.3%",
      changeType: "increase",
      icon: DollarSign,
      description: "Revenue for selected period"
    },
    {
      title: "Active Bookings",
      value: "156",
      change: "+8",
      changeType: "increase",
      icon: Calendar,
      description: "Confirmed bookings this month"
    },
    {
      title: "Guest Satisfaction",
      value: "4.8/5",
      change: "+0.2",
      changeType: "increase",
      icon: Star,
      description: "Average rating from reviews"
    }
  ];

  const recentBookings: Booking[] = [
    {
      id: "BK001",
      guestName: "Ahmed Al-Mansoori",
      checkIn: "2025-01-17",
      checkOut: "2025-01-20",
      roomType: "Deluxe Suite",
      status: "confirmed",
      amount: 2400,
      guests: 2
    },
    {
      id: "BK002",
      guestName: "Sarah Johnson",
      checkIn: "2025-01-18",
      checkOut: "2025-01-22",
      roomType: "Standard Room",
      status: "checked-in",
      amount: 1800,
      guests: 1
    },
    {
      id: "BK003",
      guestName: "Omar Al-Rashid",
      checkIn: "2025-01-19",
      checkOut: "2025-01-21",
      roomType: "Family Suite",
      status: "pending",
      amount: 3200,
      guests: 4
    },
    {
      id: "BK004",
      guestName: "Maria Garcia",
      checkIn: "2025-01-20",
      checkOut: "2025-01-25",
      roomType: "Premium Room",
      status: "confirmed",
      amount: 2800,
      guests: 2
    }
  ];

  const urgentTasks: Task[] = [
    {
      id: "T001",
      title: "AC Maintenance - Room 205",
      priority: "high",
      dueDate: "2025-01-17",
      assignee: "Maintenance Team",
      category: "Maintenance",
      status: "pending"
    },
    {
      id: "T002",
      title: "Guest Complaint Follow-up",
      priority: "high",
      dueDate: "2025-01-17",
      assignee: "Guest Relations",
      category: "Guest Service",
      status: "in-progress"
    },
    {
      id: "T003",
      title: "Inventory Restock - Housekeeping",
      priority: "medium",
      dueDate: "2025-01-18",
      assignee: "Housekeeping",
      category: "Operations",
      status: "pending"
    },
    {
      id: "T004",
      title: "Staff Schedule Review",
      priority: "medium",
      dueDate: "2025-01-19",
      assignee: "HR Manager",
      category: "HR",
      status: "pending"
    }
  ];

  const recentActivity: Activity[] = [
    {
      id: "A001",
      type: "booking",
      title: "New Booking Confirmed",
      description: "Ahmed Al-Mansoori booked Deluxe Suite for 3 nights",
      timestamp: "2 hours ago",
      user: "Reservation System",
      avatar: "/avatars/system.png"
    },
    {
      id: "A002",
      type: "payment",
      title: "Payment Received",
      description: "AED 2,400 payment confirmed for booking BK001",
      timestamp: "3 hours ago",
      user: "Payment Gateway",
      avatar: "/avatars/payment.png"
    },
    {
      id: "A003",
      type: "guest",
      title: "Guest Check-in",
      description: "Sarah Johnson checked into Standard Room 102",
      timestamp: "4 hours ago",
      user: "Front Desk",
      avatar: "/avatars/frontdesk.png"
    },
    {
      id: "A004",
      type: "maintenance",
      title: "Maintenance Completed",
      description: "Pool cleaning and chemical balancing completed",
      timestamp: "6 hours ago",
      user: "Maintenance Team",
      avatar: "/avatars/maintenance.png"
    },
    {
      id: "A005",
      type: "staff",
      title: "Staff Schedule Updated",
      description: "Weekend shift assignments updated for housekeeping",
      timestamp: "8 hours ago",
      user: "HR Manager",
      avatar: "/avatars/hr.png"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'checked-in': return 'bg-blue-100 text-blue-800';
      case 'checked-out': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'payment': return DollarSign;
      case 'maintenance': return AlertTriangle;
      case 'guest': return Users;
      case 'staff': return Users;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading Bridge Retreats Dashboard...</span>
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
                  Bridge Retreats Dashboard
                </h1>
                <p className="text-sm sm:text-base text-refined text-muted-foreground">
                  Comprehensive overview of retreat operations, bookings, and performance metrics.
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {metrics.map((metric, index) => (
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
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-gradient">
                        {metric.value}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "flex items-center space-x-1 text-sm font-medium",
                          metric.changeType === 'increase' ? 'text-green-600' : 
                          metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                        )}>
                          {metric.changeType === 'increase' ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : metric.changeType === 'decrease' ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : null}
                          <span>{metric.change}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">vs last period</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Bookings */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-elegant">Recent Bookings</CardTitle>
                      <CardDescription className="text-refined">
                        Latest reservation activity and status updates
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {booking.guestName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900">{booking.guestName}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.roomType} • {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">AED {booking.amount.toLocaleString()}</div>
                          <Badge className={cn("text-xs", getStatusColor(booking.status))}>
                            {booking.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Urgent Tasks */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-elegant flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                        Urgent Tasks
                      </CardTitle>
                      <CardDescription className="text-refined">
                        High priority items requiring attention
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      {urgentTasks.filter(t => t.priority === 'high').length} High
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {urgentTasks.map((task) => (
                      <div key={task.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {task.assignee} • {task.category}
                            </div>
                          </div>
                          <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View All Tasks
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="text-xl font-elegant flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-refined">
                    Latest system events and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const ActivityIcon = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <ActivityIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm">{activity.title}</div>
                            <div className="text-sm text-muted-foreground">{activity.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {activity.timestamp} • {activity.user}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Financial Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="text-xl font-elegant flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Financial Summary
                  </CardTitle>
                  <CardDescription className="text-refined">
                    Revenue breakdown and financial metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-green-900">Total Revenue</div>
                        <div className="text-sm text-green-700">This month</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-900">AED 245,680</div>
                        <div className="text-sm text-green-600">+12.3%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Room Revenue</span>
                        <span className="font-medium">AED 198,450</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Food & Beverage</span>
                        <span className="font-medium">AED 32,180</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Activities & Services</span>
                        <span className="font-medium">AED 15,050</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average Daily Rate</span>
                        <span className="font-bold text-primary">AED 850</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium">Revenue per Room</span>
                        <span className="font-bold text-primary">AED 740</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
} 