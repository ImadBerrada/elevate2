"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  DollarSign,
  TrendingUp,
  GamepadIcon,
  Clock,
  Star,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Calendar,
  Target,
  RefreshCw,
  Download,
  Activity,
  PieChart,
  TrendingDown,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn, toNumber } from "@/lib/utils";

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

interface GameStatistics {
  overview: {
    totalGames: number;
    availableGames: number;
    totalOrders: number;
    totalRevenue: number;
    avgRevenuePerGame: number;
    mostPopularCategory: string;
    utilizationRate: number;
    avgRating: number;
  };
  games: Array<{
    id: string;
    nameEn: string;
    nameAr: string;
    category: string;
    pricePerDay: number;
    isAvailable: boolean;
    totalBookings: number;
    totalRevenue: number;
    totalQuantity: number;
    avgDays: number;
    uniqueCustomers: number;
    utilizationRate: number;
    avgRating: number;
    status: string;
  }>;
  categories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topPerformers: Array<{
    id: string;
    nameEn: string;
    nameAr: string;
    category: string;
    pricePerDay: number;
    totalRevenue: number;
    totalBookings: number;
  }>;
  recentActivity: Array<{
    id: string;
    gameId: string;
    gameName: string;
    gameCategory: string;
    orderNumber: string;
    customerName: string;
    quantity: number;
    days: number;
    totalPrice: number;
    orderDate: string;
    status: string;
  }>;
  period: number;
}

export default function GameStatistics() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [statistics, setStatistics] = useState<GameStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marahCompanyId, setMarahCompanyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchMarahCompany();
  }, []);

  useEffect(() => {
    if (marahCompanyId) {
      fetchStatistics();
      
      // Set up auto-refresh every 5 minutes
      const interval = setInterval(() => {
        fetchStatistics();
      }, 300000);
      
      return () => clearInterval(interval);
    }
  }, [marahCompanyId, selectedPeriod]);

  const fetchMarahCompany = async () => {
    try {
      const response = await fetch('/api/companies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const marahCompany = data.companies.find((company: any) => 
          company.name === 'MARAH Inflatable Games Rental'
        );
        
        if (marahCompany) {
          setMarahCompanyId(marahCompany.id);
        } else {
          setError('MARAH company not found. Please create it first from the Companies page.');
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch company information');
    }
  };

  const fetchStatistics = async () => {
    if (!marahCompanyId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/marah/games/statistics?companyId=${marahCompanyId}&period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStatistics();
  };

  const handleExport = () => {
    if (!statistics) return;
    
    const csvContent = [
      ['Game Name', 'Category', 'Total Bookings', 'Revenue', 'Utilization Rate', 'Avg Rating', 'Status'].join(','),
      ...statistics.games.map(game => [
        game.nameEn,
        game.category,
        game.totalBookings,
        game.totalRevenue,
        `${game.utilizationRate}%`,
        game.avgRating,
        game.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-statistics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  // Dynamic color generation based on category name hash
  const getCategoryColor = (categoryName: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-teal-500",
      "bg-cyan-500"
    ];
    // Generate consistent color based on category name
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Dynamic metric card colors based on performance
  const getMetricCardColor = (type: string, value: number, total?: number) => {
    switch (type) {
      case 'games':
        return value > 0 ? "from-blue-50/80 to-white/80" : "from-gray-50/80 to-white/80";
      case 'revenue':
        return value > 0 ? "from-green-50/80 to-white/80" : "from-gray-50/80 to-white/80";
      case 'orders':
        return value > 0 ? "from-purple-50/80 to-white/80" : "from-gray-50/80 to-white/80";
      case 'rating':
        if (value >= 4.5) return "from-green-50/80 to-white/80";
        if (value >= 4.0) return "from-orange-50/80 to-white/80";
        if (value >= 3.5) return "from-yellow-50/80 to-white/80";
        return "from-red-50/80 to-white/80";
      default:
        return "from-gray-50/80 to-white/80";
    }
  };

  // Dynamic icon color based on performance
  const getMetricIconColor = (type: string, value: number) => {
    switch (type) {
      case 'games':
        return value > 0 ? "text-blue-600" : "text-gray-400";
      case 'revenue':
        return value > 0 ? "text-green-600" : "text-gray-400";
      case 'orders':
        return value > 0 ? "text-purple-600" : "text-gray-400";
      case 'rating':
        if (value >= 4.5) return "text-green-600";
        if (value >= 4.0) return "text-orange-600";
        if (value >= 3.5) return "text-yellow-600";
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  // Filter games based on search and category
  const filteredGames = statistics?.games.filter(game => {
    const matchesSearch = game.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Dynamic period options based on data availability
  const getPeriodOptions = () => {
    return [
      { value: "7", label: "Last 7 days" },
      { value: "30", label: "Last 30 days" },
      { value: "90", label: "Last 90 days" },
      { value: "365", label: "Last year" }
    ];
  };

  if (loading && !statistics) {
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
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading game statistics...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
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
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Statistics</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!statistics || (statistics.games.length === 0 && statistics.overview.totalGames === 0)) {
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
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <GamepadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Game Data Available</h3>
                <p className="text-muted-foreground mb-4">
                  No games or orders found for the selected period. Add some games and create orders to see statistics.
                </p>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
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
        
        <motion.header 
          className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <motion.div 
                className="flex items-center space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <BarChart3 className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">Game Statistics</h1>
                  <p className="text-sm text-muted-foreground">
                    Analytics for the last {selectedPeriod} days • Updated {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-wrap items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getPeriodOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                  Refresh
                </Button>
                
                {statistics.games.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {/* Overview Stats */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card className={`border-0 shadow-sm bg-gradient-to-br ${getMetricCardColor('games', statistics.overview.totalGames)}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Games
                  </CardTitle>
                  <GamepadIcon className={`h-4 w-4 ${getMetricIconColor('games', statistics.overview.totalGames)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.overview.totalGames}</div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.overview.availableGames} available
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className={`border-0 shadow-sm bg-gradient-to-br ${getMetricCardColor('revenue', statistics.overview.totalRevenue)}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className={`h-4 w-4 ${getMetricIconColor('revenue', statistics.overview.totalRevenue)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(toNumber(statistics.overview.totalRevenue))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                                          {formatCurrency(toNumber(statistics.overview.avgRevenuePerGame))} avg per game
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className={`border-0 shadow-sm bg-gradient-to-br ${getMetricCardColor('orders', statistics.overview.totalOrders)}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Orders
                  </CardTitle>
                  <Activity className={`h-4 w-4 ${getMetricIconColor('orders', statistics.overview.totalOrders)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.overview.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(statistics.overview.utilizationRate)}% utilization
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className={`border-0 shadow-sm bg-gradient-to-br ${getMetricCardColor('rating', statistics.overview.avgRating)}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Rating
                  </CardTitle>
                  <Star className={`h-4 w-4 ${getMetricIconColor('rating', statistics.overview.avgRating)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.overview.avgRating.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.overview.mostPopularCategory} most popular
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {statistics.categories.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Game Categories */}
              <motion.div 
                {...fadeInUp}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        <PieChart className="w-4 h-4 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle>Game Categories</CardTitle>
                        <CardDescription>
                          Distribution by category
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statistics.categories.map((category, index) => (
                        <motion.div 
                          key={category.name}
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getCategoryColor(category.name)}`} />
                            <span className="font-medium text-sm">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">{Math.round(category.percentage)}%</p>
                            <p className="text-xs text-muted-foreground">{category.count} games</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Performers */}
              {statistics.topPerformers.length > 0 && (
                <motion.div 
                  className="lg:col-span-2"
                  {...fadeInUp}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <motion.div
                          className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 10 }}
                        >
                          <Target className="w-4 h-4 text-white" />
                        </motion.div>
                        <div>
                          <CardTitle>Top Performing Games</CardTitle>
                          <CardDescription>
                            Highest revenue generators
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {statistics.topPerformers.slice(0, 5).map((game, index) => (
                          <motion.div 
                            key={game.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{game.nameEn}</h4>
                                <p className="text-xs text-muted-foreground">{game.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">{formatCurrency(game.totalRevenue)}</p>
                              <p className="text-xs text-muted-foreground">{game.totalBookings} bookings</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {/* Filters - Only show if there are games */}
          {statistics.games.length > 0 && (
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-6"
              {...fadeInUp}
              transition={{ delay: 0.8 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search games..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {statistics.categories.length > 0 && (
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {statistics.categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </motion.div>
          )}

          {/* Games List */}
          {statistics.games.length > 0 && (
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 1.0 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        <GamepadIcon className="w-4 h-4 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle>Game Performance Details</CardTitle>
                        <CardDescription>
                          Showing {filteredGames.length} of {statistics.games.length} games
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredGames.map((game, index) => (
                      <motion.div 
                        key={game.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 + index * 0.05 }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <motion.div 
                              className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                              whileHover={{ scale: 1.1, rotate: 10 }}
                            >
                              <GamepadIcon className="w-6 h-6 text-white" />
                            </motion.div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{game.nameEn}</h3>
                                <Badge 
                                  className={`text-xs ${getStatusColor(game.status)}`}
                                  variant="outline"
                                >
                                  {game.status}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {game.category}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-muted-foreground mb-2">
                                <span>Bookings: {game.totalBookings}</span>
                                <span>Customers: {game.uniqueCustomers}</span>
                                <span>Avg Days: {game.avgDays}</span>
                                <span>Utilization: {game.utilizationRate}%</span>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm">
                                <span className={`font-medium ${getRatingColor(game.avgRating)}`}>
                                  ★ {game.avgRating} Rating
                                </span>
                                <span className="text-muted-foreground">
                                  {formatCurrency(game.pricePerDay)}/day
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right lg:min-w-[200px]">
                            <div className="mb-3">
                              <p className="text-sm text-muted-foreground">Total Revenue</p>
                              <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(game.totalRevenue)}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                              <Button size="sm" variant="outline">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {filteredGames.length === 0 && (
                      <div className="text-center py-8">
                        <GamepadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No games found</h3>
                        <p className="text-muted-foreground">
                          {searchTerm || selectedCategory !== "all" 
                            ? "Try adjusting your search or filter criteria"
                            : "No games available for the selected period"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
} 