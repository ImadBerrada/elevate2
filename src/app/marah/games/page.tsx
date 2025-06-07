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
  Grid,
  List,
  Star,
  DollarSign,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Languages,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Users,
  GamepadIcon,
  Zap
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
import Image from "next/image";
import { AddGameModal } from "@/components/modals/add-game-modal";
import { EditGameModal } from "@/components/modals/edit-game-modal";

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
  createdAt: string;
  updatedAt: string;
}

interface Category {
  name: string;
  count: number;
}

export default function GamesPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marahCompanyId, setMarahCompanyId] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [showEditGame, setShowEditGame] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const statusOptions = [
    { value: "all", label: "All Games" },
    { value: "available", label: "Available" },
    { value: "unavailable", label: "Unavailable" },
    { value: "discountable", label: "Discountable" },
  ];

  const priceRangeOptions = [
    { value: "all", label: "All Prices" },
    { value: "low", label: "Under 100 AED" },
    { value: "medium", label: "100-300 AED" },
    { value: "high", label: "300-500 AED" },
    { value: "premium", label: "Over 500 AED" },
  ];

  useEffect(() => {
    fetchMarahCompany();
  }, []);

  useEffect(() => {
    if (marahCompanyId) {
      fetchGames();
      
      // Set up real-time updates
      const interval = setInterval(() => {
        fetchGames();
      }, 60000); // Refresh every minute
      
      return () => clearInterval(interval);
    }
  }, [marahCompanyId]);

  useEffect(() => {
    if (marahCompanyId) {
      fetchGames();
    }
  }, [searchTerm, categoryFilter, statusFilter, priceRangeFilter]);

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

  const handleViewGame = (gameId: string) => {
    // Navigate to game detail page or open modal
    console.log('View game:', gameId);
  };

  const handleEditGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      setEditingGame(game);
      setShowEditGame(true);
    }
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

  const getGameInitials = (nameEn: string) => {
    return nameEn.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPriceRangeFilter("all");
  };

  const exportGames = () => {
    if (games.length === 0) return;
    
    const headers = ['Name (EN)', 'Name (AR)', 'Category', 'Price/Day', 'Status', 'Discountable', 'Created'];
    const csvContent = [
      headers.join(','),
      ...games.map(game => [
        game.nameEn,
        game.nameAr,
        game.category,
        game.pricePerDay,
        game.isAvailable ? 'Available' : 'Unavailable',
        game.isDiscountable ? 'Yes' : 'No',
        formatDate(game.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marah-games-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getGameStats = () => {
    const totalGames = games.length;
    const availableGames = games.filter(g => g.isAvailable).length;
    const unavailableGames = games.filter(g => !g.isAvailable).length;
    const discountableGames = games.filter(g => g.isDiscountable).length;
    const avgPricePerDay = games.length > 0 
      ? games.reduce((sum, g) => sum + g.pricePerDay, 0) / games.length
      : 0;

    return { 
      totalGames, 
      availableGames, 
      unavailableGames, 
      discountableGames, 
      avgPricePerDay,
      categoriesCount: categories.length
    };
  };

  // Filter games based on price range
  const filteredGames = games.filter(game => {
    if (priceRangeFilter === 'all') return true;
    
    const price = game.pricePerDay;
    switch (priceRangeFilter) {
      case 'low': return price < 100;
      case 'medium': return price >= 100 && price < 300;
      case 'high': return price >= 300 && price < 500;
      case 'premium': return price >= 500;
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
                  Games Management
                </h1>
                <p className="text-muted-foreground">
                  Manage inflatable games inventory with pricing and availability tracking
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

          {/* Game Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
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
                    {stats.categoriesCount} categories
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Available</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.availableGames}
                  </div>
                  <p className="text-xs text-green-600">
                    Ready for rental
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Unavailable</span>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.unavailableGames}
                  </div>
                  <p className="text-xs text-red-600">
                    Out of service
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Avg Price</span>
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {formatCurrency(stats.avgPricePerDay)}
                  </div>
                  <p className="text-xs text-purple-600">
                    Per day
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <span>Game Filtering</span>
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
                      <Label htmlFor="priceRange">Price Range</Label>
                      <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All prices" />
                        </SelectTrigger>
                        <SelectContent>
                          {priceRangeOptions.map((option) => (
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

          {/* Games Table */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span>Games List</span>
                </CardTitle>
                <CardDescription>
                  Manage your inflatable games inventory
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
                          <TableHead>Features</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGames.map((game) => {
                          const StatusIcon = getStatusIcon(game.isAvailable);
                          return (
                            <TableRow key={game.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <GameAvatar 
                                    game={game}
                                    size="md"
                                    className="shadow-md"
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
                                <div className="flex items-center space-x-2">
                                  {game.isDiscountable && (
                                    <Badge variant="outline" className="text-xs">
                                      <Tag className="w-3 h-3 mr-1" />
                                      Discountable
                                    </Badge>
                                  )}
                                  {game.capacity && (
                                    <Badge variant="outline" className="text-xs">
                                      <Users className="w-3 h-3 mr-1" />
                                      {game.capacity}
                                    </Badge>
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
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
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
        onGameCreated={fetchGames}
        companyId={marahCompanyId || ""}
      />

      {/* Edit Game Modal */}
      {showEditGame && editingGame && (
        <EditGameModal
          isOpen={showEditGame}
          onClose={() => {
            setShowEditGame(false);
            setEditingGame(null);
          }}
          onGameUpdated={fetchGames}
          game={editingGame}
        />
      )}
    </div>
  );
} 