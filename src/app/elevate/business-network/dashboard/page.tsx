"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Network, 
  Users, 
  Building, 
  TrendingUp,
  Activity,
  Contact,
  MessageSquare,
  Calendar,
  Star,
  ArrowUpRight,
  Plus,
  Loader2,
  Trophy,
  Clock,
  Target,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Award,
  BarChart3,
  PieChart,
  Filter,
  Search,
  SortDesc,
  Eye,
  Crown,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employer?: string;
  category?: string;
  rating: number;
  country?: string;
  city?: string;
  createdAt: string;
  updatedAt: string;
}

interface Business {
  id: string;
  name: string;
  industry?: string;
  status: string;
  partnership?: string;
  rating?: number;
  location?: string;
  dealValue?: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  title: string;
  type: string;
  points: number;
  date: string;
  createdAt: string;
}

interface DashboardData {
  contacts: Contact[];
  businesses: Business[];
  activities: ActivityItem[];
  stats: {
  contacts: {
    total: number;
    vip: number;
      newThisWeek: number;
      topCategories: { category: string; count: number }[];
  };
  businesses: {
    total: number;
    active: number;
      partners: number;
      totalValue: string;
  };
    activities: {
    total: number;
      today: number;
      week: number;
      month: number;
      totalPoints: number;
      monthPoints: number;
    };
  };
}

export default function BusinessNetworkDashboard() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "rating" | "name">("recent");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [contactsRes, businessesRes, activitiesRes, statsRes] = await Promise.all([
        apiClient.getContacts({ limit: 50 }),
        apiClient.getBusinesses({ limit: 50 }),
        apiClient.getActivities({ limit: 20 }),
        apiClient.getStats()
      ]);

      // Process and sort data
      const contacts = contactsRes.contacts || [];
      const businesses = businessesRes.businesses || [];
      const activities = activitiesRes.activities || [];

      // Calculate additional stats
      const vipContacts = contacts.filter(c => c.rating >= 3).length;
      const newThisWeek = contacts.filter(c => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(c.createdAt) > weekAgo;
      }).length;

      const categoryStats = contacts.reduce((acc, contact) => {
        const category = contact.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCategories = Object.entries(categoryStats)
        .map(([category, count]) => ({ category, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const activeBusinesses = businesses.filter(b => b.status === 'PARTNER').length;
      const totalValue = businesses
        .filter(b => b.dealValue)
        .reduce((sum, b) => {
          const value = parseFloat(b.dealValue?.replace(/[^0-9.]/g, '') || '0');
          return sum + value;
        }, 0);

      const todayActivities = activities.filter(a => {
        const today = new Date().toDateString();
        return new Date(a.createdAt).toDateString() === today;
      }).length;

      const weekActivities = activities.filter(a => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(a.createdAt) > weekAgo;
      }).length;

      const monthActivities = activities.filter(a => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(a.createdAt) > monthAgo;
      }).length;

      const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);
      const monthPoints = activities
        .filter(a => {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return new Date(a.createdAt) > monthAgo;
        })
        .reduce((sum, a) => sum + a.points, 0);

      setData({
        contacts,
        businesses,
        activities,
        stats: {
          contacts: {
            total: contacts.length,
            vip: vipContacts,
            newThisWeek,
            topCategories
          },
          businesses: {
            total: businesses.length,
            active: activeBusinesses,
            partners: activeBusinesses,
            totalValue: `$${(totalValue / 1000000).toFixed(1)}M`
          },
          activities: {
            total: activities.length,
            today: todayActivities,
            week: weekActivities,
            month: monthActivities,
            totalPoints,
            monthPoints
          }
        }
      });
      } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

  // Sort and filter contacts
  const getSortedContacts = () => {
    if (!data?.contacts) return [];
    
    let filtered = data.contacts;
    
    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(c => c.category === filterCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.employer && c.employer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  // Get top supporters (highest rated contacts)
  const getTopSupporters = () => {
    if (!data?.contacts) return [];
    return [...data.contacts]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  };

  // Get recent activities
  const getRecentActivities = () => {
    if (!data?.activities) return [];
    return [...data.activities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  };

  // Get top businesses by rating
  const getTopBusinesses = () => {
    if (!data?.businesses) return [];
    return [...data.businesses]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 3) return 'text-yellow-500';
    if (rating >= 2) return 'text-blue-500';
    return 'text-gray-400';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'partner': return 'bg-green-100 text-green-800';
      case 'negotiating': return 'bg-yellow-100 text-yellow-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading dashboard...</span>
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

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Page Header */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <h2 className="text-2xl font-prestigious text-gradient mb-2">
              Business Network Dashboard
            </h2>
            <p className="text-refined text-muted-foreground">
              Manage your professional connections and business relationships.
            </p>
          </motion.div>

          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              {...fadeInUp}
            >
              <p className="text-red-600">Error: {error}</p>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Total Contacts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {data?.stats.contacts.total || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {data?.stats.contacts.vip || 0} VIP • {data?.stats.contacts.newThisWeek || 0} new this week
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Building className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Businesses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {data?.stats.businesses.total || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {data?.stats.businesses.partners || 0} partners • {data?.stats.businesses.totalValue || '$0'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Activities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {data?.stats.activities.total || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {data?.stats.activities.today || 0} today • {data?.stats.activities.week || 0} this week
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span>Network Points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {data?.stats.activities.totalPoints || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {data?.stats.activities.monthPoints || 0} this month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Tabs */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.5 }}
            >
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="businesses">Businesses</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Supporters */}
              <Card className="card-premium border-refined">
                <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-primary" />
                        <span>Top Supporters</span>
                      </CardTitle>
                      <CardDescription>Highest rated connections</CardDescription>
                </CardHeader>
                <CardContent>
                      {getTopSupporters().length > 0 ? (
                        <div className="space-y-3">
                          {getTopSupporters().map((contact, index) => (
                        <motion.div
                          key={contact.id}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                              <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {contact.firstName[0]}{contact.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                                {index === 0 && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <Crown className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                              {contact.firstName} {contact.lastName}
                            </h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {contact.employer || contact.category || 'No company'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                                {Array.from({ length: contact.rating }).map((_, i) => (
                                  <Star key={i} className={cn("w-4 h-4 fill-current", getRatingColor(contact.rating))} />
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                          <p className="text-muted-foreground">No contacts yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

                  {/* Recent Activities */}
              <Card className="card-premium border-refined">
                <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <span>Recent Activities</span>
                      </CardTitle>
                      <CardDescription>Latest network activities</CardDescription>
                </CardHeader>
                <CardContent>
                      {getRecentActivities().length > 0 ? (
                        <div className="space-y-3">
                          {getRecentActivities().map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-primary" />
                          </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{activity.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {activity.type.toLowerCase().replace('_', ' ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="text-xs">
                              +{activity.points} pts
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(activity.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                          <p className="text-muted-foreground">No activities yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Top Businesses */}
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-primary" />
                      <span>Top Business Partners</span>
                    </CardTitle>
                    <CardDescription>Highest rated business relationships</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getTopBusinesses().length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getTopBusinesses().map((business, index) => (
                          <motion.div
                            key={business.id}
                            className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Building className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">{business.name}</h4>
                                  {business.industry && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {business.industry}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Badge className={getStatusColor(business.status)}>
                                {business.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              {business.location && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  {business.location}
                                </div>
                              )}
                              {business.dealValue && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  {business.dealValue}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              {business.rating && (
                                <div className="flex items-center space-x-1">
                                  {Array.from({ length: business.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              )}
                              <Button size="sm" variant="outline" className="border-refined">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-muted-foreground">No business partners yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contacts Tab */}
              <TabsContent value="contacts" className="space-y-6">
                {/* Search and Filter Controls */}
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle>Contact Directory</CardTitle>
                    <CardDescription>Manage and search your professional contacts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search contacts..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-refined"
                        />
                      </div>
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="w-full sm:w-40 border-refined">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="name">Name A-Z</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-full sm:w-40 border-refined">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {data?.stats.contacts.topCategories.map(cat => (
                            <SelectItem key={cat.category} value={cat.category}>
                              {cat.category} ({cat.count})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Contacts Grid */}
                    {getSortedContacts().length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getSortedContacts().map((contact, index) => (
                          <motion.div
                            key={contact.id}
                            className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                          >
                            <div className="flex items-start space-x-3 mb-3">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {contact.firstName[0]}{contact.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                                  {contact.firstName} {contact.lastName}
                                </h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {contact.employer || 'No company'}
                                </p>
                                <div className="flex items-center space-x-1 mt-1">
                                  {Array.from({ length: contact.rating }).map((_, i) => (
                                    <Star key={i} className={cn("w-3 h-3 fill-current", getRatingColor(contact.rating))} />
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Mail className="w-4 h-4 mr-2" />
                                <span className="truncate">{contact.email}</span>
                              </div>
                              {contact.phone && (
                                <div className="flex items-center text-muted-foreground">
                                  <Phone className="w-4 h-4 mr-2" />
                                  <span>{contact.phone}</span>
                                </div>
                              )}
                              {(contact.city || contact.country) && (
                                <div className="flex items-center text-muted-foreground">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  <span>{[contact.city, contact.country].filter(Boolean).join(', ')}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              {contact.category && (
                                <Badge variant="outline" className="text-xs">
                                  {contact.category}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(contact.createdAt)}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">
                          {searchTerm || filterCategory !== "all" ? 'No contacts found' : 'No contacts yet'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchTerm || filterCategory !== "all"
                            ? 'Try adjusting your search or filters.'
                            : 'Start building your professional network.'
                          }
                      </p>
                      <Button className="btn-premium">
                        <Plus className="w-4 h-4 mr-2" />
                          Add Contact
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              </TabsContent>

              {/* Businesses Tab */}
              <TabsContent value="businesses" className="space-y-6">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle>Business Partners</CardTitle>
                    <CardDescription>Your business relationships and partnerships</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data?.businesses && data.businesses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.businesses.map((business, index) => (
                          <motion.div
                            key={business.id}
                            className="p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Building className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-lg truncate">{business.name}</h4>
                                  {business.industry && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {business.industry}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Badge className={getStatusColor(business.status)}>
                                {business.status}
                              </Badge>
                            </div>

                            <div className="space-y-2 mb-4">
                              {business.location && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  {business.location}
                                </div>
                              )}
                              {business.partnership && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Briefcase className="w-4 h-4 mr-2" />
                                  {business.partnership.replace('_', ' ')}
                                </div>
                              )}
                              {business.dealValue && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  {business.dealValue}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                {business.rating && Array.from({ length: business.rating }).map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(business.createdAt)}
                              </span>
                            </div>
            </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Building className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No business partners yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Start building your business network by adding partnerships.
                        </p>
                        <Button className="btn-premium">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Business Partner
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Categories */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <PieChart className="w-5 h-5 text-primary" />
                        <span>Contact Categories</span>
                      </CardTitle>
                      <CardDescription>Distribution of contacts by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data?.stats.contacts.topCategories && data.stats.contacts.topCategories.length > 0 ? (
                        <div className="space-y-3">
                          {data.stats.contacts.topCategories.map((category, index) => (
                            <div key={category.category} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{category.category}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${(category.count / (data?.stats.contacts.total || 1)) * 100}%` 
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground w-8 text-right">
                                  {category.count}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <PieChart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                          <p className="text-muted-foreground">No category data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Activity Metrics */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <span>Activity Metrics</span>
                      </CardTitle>
                      <CardDescription>Network activity performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Today</span>
                          <span className="text-2xl font-bold text-primary">
                            {data?.stats.activities.today || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">This Week</span>
                          <span className="text-2xl font-bold text-primary">
                            {data?.stats.activities.week || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">This Month</span>
                          <span className="text-2xl font-bold text-primary">
                            {data?.stats.activities.month || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <span className="text-sm font-medium">Total Points</span>
                          <span className="text-2xl font-bold text-gradient">
                            {data?.stats.activities.totalPoints || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
          </div>

                {/* Network Growth */}
            <Card className="card-premium border-refined">
              <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span>Network Growth</span>
                    </CardTitle>
                    <CardDescription>Your network expansion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                          {data?.stats.contacts.newThisWeek || 0}
                    </div>
                        <p className="text-sm text-muted-foreground">New Contacts This Week</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                          {data?.stats.contacts.vip || 0}
                    </div>
                        <p className="text-sm text-muted-foreground">VIP Contacts</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                          {data?.stats.businesses.partners || 0}
                    </div>
                        <p className="text-sm text-muted-foreground">Active Partners</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                          {data?.stats.businesses.totalValue || '$0'}
                    </div>
                        <p className="text-sm text-muted-foreground">Partnership Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 