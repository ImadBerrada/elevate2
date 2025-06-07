"use client";

import { motion } from "framer-motion";
import { 
  Search,
  Filter,
  Package,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  DollarSign,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  GamepadIcon,
  Star,
  TrendingUp,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GameAvatar } from "@/components/ui/profile-avatar";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AddGameModal } from "@/components/modals/add-game-modal";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Game {
  id: string;
  nameEn: string;
  nameAr: string;
  category: string;
  description?: string;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  isAvailable: boolean;
  isDiscountable: boolean;
  discountPercentage?: number;
  imageUrl?: string;
  dimensions?: string;
  capacity?: number;
  ageGroup?: string;
  setupTime?: number;
  totalOrders?: number;
  totalRevenue?: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  name: string;
  count: number;
}

interface GameAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  popularityScore: number;
}

export default function GameManagementPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, GameAnalytics>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marahCompanyId, setMarahCompanyId] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [performanceFilter, setPerformanceFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Games" },
    { value: "available", label: "Available" },
    { value: "unavailable", label: "Unavailable" },
    { value: "discountable", label: "Discountable" },
  ];

  const performanceOptions = [
    { value: "all", label: "All Performance" },
    { value: "high", label: "High Performers" },
    { value: "medium", label: "Medium Performers" },
    { value: "low", label: "Low Performers" },
    { value: "new", label: "New Games" },
  ];

  useEffect(() => {
    fetchMarahCompany();
  }, []);

  useEffect(() => {
    if (marahCompanyId) {
      fetchGames();
      fetchGameAnalytics();
      
      // Set up real-time updates
      const interval = setInterval(() => {
        fetchGames();
        fetchGameAnalytics();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(interval);
    }
  }, [marahCompanyId]);

  useEffect(() => {
    if (marahCompanyId) {
      fetchGames();
    }
  }, [searchTerm, categoryFilter, statusFilter, performanceFilter]);

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

  const fetchGames = async () => {
    if (!marahCompanyId) return;
    
    try {
      const params = new URLSearchParams({
        companyId: marahCompanyId,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/marah/games?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setGames(data.games || []);
        setCategories(data.categories || []);
        setError(null);
      } else {
        setError('Failed to fetch games');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  const fetchGameAnalytics = async () => {
    if (!marahCompanyId) return;
    
    try {
      const response = await fetch(`/api/marah/games/analytics?companyId=${marahCompanyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics || {});
      }
    } catch (error) {
      console.error('Error fetching game analytics:', error);
    }
  };

  const handleViewGame = (gameId: string) => {
    // Navigate to game analytics page or open modal
    console.log('View game analytics:', gameId);
  };

  const handleEditGame = (gameId: string) => {
    // Navigate to game edit page or open modal
    console.log('Edit game:', gameId);
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/marah/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        fetchGames(); // Refresh the games list
        fetchGameAnalytics(); // Refresh analytics
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete game');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game');
    }
  };

  const handleToggleAvailability = async (gameId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/marah/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          isAvailable: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchGames(); // Refresh the games list
      } else {
        alert('Failed to update game availability');
      }
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Failed to update game availability');
    }
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

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (isAvailable: boolean) => {
    return isAvailable ? CheckCircle : XCircle;
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-green-100 text-green-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    const index = category.length % colors.length;
    return colors[index];
  };

  const getPerformanceColor = (gameId: string) => {
    const gameAnalytics = analytics[gameId];
    if (!gameAnalytics) return 'bg-gray-100 text-gray-800';
    
    const score = gameAnalytics.popularityScore || 0;
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceLabel = (gameId: string) => {
    const gameAnalytics = analytics[gameId];
    if (!gameAnalytics) return 'New';
    
    const score = gameAnalytics.popularityScore || 0;
    if (score >= 80) return 'High Performer';
    if (score >= 60) return 'Good Performer';
    if (score >= 40) return 'Average';
    return 'Low Performer';
  };

  const getGameInitials = (nameEn: string) => {
    return nameEn.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPerformanceFilter("all");
  };

  const exportGames = () => {
    if (filteredGames.length === 0) return;
    
    const headers = ['Name (EN)', 'Name (AR)', 'Category', 'Price/Day', 'Status', 'Total Orders', 'Revenue', 'Rating'];
    const csvContent = [
      headers.join(','),
      ...filteredGames.map(game => {
        const gameAnalytics = analytics[game.id];
        return [
          game.nameEn,
          game.nameAr,
          game.category,
          game.pricePerDay,
          game.isAvailable ? 'Available' : 'Unavailable',
          gameAnalytics?.totalOrders || 0,
          gameAnalytics?.totalRevenue || 0,
          gameAnalytics?.averageRating || 0
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marah-games-management-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getGameStats = () => {
    const totalGames = games.length;
    const availableGames = games.filter(g => g.isAvailable).length;
    const totalRevenue = Object.values(analytics).reduce((sum, a) => sum + (a.totalRevenue || 0), 0);
    const totalOrders = Object.values(analytics).reduce((sum, a) => sum + (a.totalOrders || 0), 0);
    const avgRating = Object.values(analytics).length > 0 
      ? Object.values(analytics).reduce((sum, a) => sum + (a.averageRating || 0), 0) / Object.values(analytics).length
      : 0;

    return { 
      totalGames, 
      availableGames, 
      totalRevenue,
      totalOrders,
      avgRating,
      categoriesCount: categories.length
    };
  };

  // Filter games based on performance
  const filteredGames = games.filter(game => {
    if (performanceFilter === 'all') return true;
    
    const gameAnalytics = analytics[game.id];
    if (!gameAnalytics && performanceFilter === 'new') return true;
    if (!gameAnalytics) return false;
    
    const score = gameAnalytics.popularityScore || 0;
    switch (performanceFilter) {
      case 'high': return score >= 80;
      case 'medium': return score >= 40 && score < 80;
      case 'low': return score < 40;
      default: return true;
    }
  });

  const stats = getGameStats();

  if (loading) {
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                <h3 className="text-lg font-semibold mb-2">Error</h3>
                <p className="text-muted-foreground">{error}</p>
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

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Page Header */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">
                  Game Management & Analytics
                </h1>
                <p className="text-muted-foreground">
                  Advanced game performance tracking and inventory management
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button onClick={exportGames} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={fetchGames} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setShowAddGame(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Game
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Total Games</span>
                    <GamepadIcon className="h-4 w-4 text-blue-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats.totalGames}
                  </div>
                  <p className="text-xs text-blue-600">
                    {stats.availableGames} available
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Total Orders</span>
                    <Package className="h-4 w-4 text-green-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalOrders.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600">
                    All time orders
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Total Revenue</span>
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <p className="text-xs text-purple-600">
                    From all games
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Avg Rating</span>
                    <Star className="h-4 w-4 text-yellow-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats.avgRating.toFixed(1)}
                  </div>
                  <p className="text-xs text-yellow-600">
                    Customer rating
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Categories</span>
                    <Tag className="h-4 w-4 text-indigo-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats.categoriesCount}
                  </div>
                  <p className="text-xs text-indigo-600">
                    Game categories
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Advanced Filters */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <span>Advanced Game Filtering</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </div>
              </CardHeader>
              
              {showFilters && (
                <CardContent className="space-y-4">
                  {/* Search and Filters Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="search">Search Games</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Game name, category..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {categories.length > 0 && (
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.name} value={category.name}>
                                {category.name} ({category.count})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="performance">Performance</Label>
                      <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All performance" />
                        </SelectTrigger>
                        <SelectContent>
                          {performanceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredGames.length} games
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                      <Button size="sm" onClick={exportGames}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Enhanced Games Table */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>Game Performance Dashboard</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive game analytics and management
                </CardDescription>
              </CardHeader>

              <CardContent>
                {filteredGames.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Game</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Pricing</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Analytics</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGames.map((game) => {
                          const StatusIcon = getStatusIcon(game.isAvailable);
                          const gameAnalytics = analytics[game.id];
                          return (
                            <TableRow key={game.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <GameAvatar
                                    game={game}
                                    size="xl"
                                    className="shadow-lg ring-2 ring-white/10"
                                  />
                                  <div>
                                    <div className="font-medium">{game.nameEn}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {game.nameAr}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={cn("text-xs", getCategoryColor(game.category))}
                                >
                                  {game.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-semibold text-green-600">
                                    {formatCurrency(game.pricePerDay)}/day
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatCurrency(game.pricePerWeek)}/week
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={cn("text-xs cursor-pointer", getStatusColor(game.isAvailable))}
                                  onClick={() => handleToggleAvailability(game.id, game.isAvailable)}
                                >
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {game.isAvailable ? 'Available' : 'Unavailable'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={cn("text-xs", getPerformanceColor(game.id))}
                                >
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  {getPerformanceLabel(game.id)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    {gameAnalytics?.totalOrders || 0} orders
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatCurrency(gameAnalytics?.totalRevenue || 0)} revenue
                                  </div>
                                  {gameAnalytics?.averageRating && (
                                    <div className="flex items-center text-xs">
                                      <Star className="w-3 h-3 text-yellow-500 mr-1" />
                                      {gameAnalytics.averageRating.toFixed(1)}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewGame(game.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditGame(game.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteGame(game.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Games Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                        ? "No games match your current filters."
                        : "No games have been added yet."
                      }
                    </p>
                    {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => setShowAddGame(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Game
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Add Game Modal */}
      <AddGameModal
        isOpen={showAddGame}
        onClose={() => setShowAddGame(false)}
        onGameCreated={() => {
          fetchGames();
          fetchGameAnalytics();
        }}
        companyId={marahCompanyId || ""}
      />
    </div>
  );
} 