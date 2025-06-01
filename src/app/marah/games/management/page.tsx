"use client";

import { motion } from "framer-motion";
import { 
  Gamepad2, 
  Users, 
  TrendingUp, 
  BarChart3,
  Star,
  Play,
  Pause,
  Settings,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";

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

export default function GameManagement() {
  const games = [
    {
      id: 1,
      name: "Desert Racing Championship",
      category: "Racing",
      status: "active",
      players: 15420,
      dailyRevenue: "$2,850",
      rating: 4.8,
      lastUpdate: "2024-01-18",
      version: "v2.1.4"
    },
    {
      id: 2,
      name: "Arabian Nights Quest",
      category: "Adventure",
      status: "active",
      players: 8750,
      dailyRevenue: "$1,920",
      rating: 4.6,
      lastUpdate: "2024-01-15",
      version: "v1.8.2"
    },
    {
      id: 3,
      name: "Puzzle Palace",
      category: "Puzzle",
      status: "maintenance",
      players: 12300,
      dailyRevenue: "$1,450",
      rating: 4.4,
      lastUpdate: "2024-01-12",
      version: "v3.0.1"
    },
    {
      id: 4,
      name: "City Builder Deluxe",
      category: "Strategy",
      status: "active",
      players: 6890,
      dailyRevenue: "$3,200",
      rating: 4.9,
      lastUpdate: "2024-01-20",
      version: "v1.5.0"
    },
    {
      id: 5,
      name: "Sports Arena Pro",
      category: "Sports",
      status: "beta",
      players: 2150,
      dailyRevenue: "$680",
      rating: 4.2,
      lastUpdate: "2024-01-19",
      version: "v0.9.5"
    }
  ];

  const playerMetrics = [
    {
      metric: "Daily Active Users",
      value: "45,510",
      change: "+12.5%",
      trend: "up"
    },
    {
      metric: "Average Session Time",
      value: "28.4 min",
      change: "+3.2 min",
      trend: "up"
    },
    {
      metric: "Player Retention (7-day)",
      value: "68.3%",
      change: "+5.1%",
      trend: "up"
    },
    {
      metric: "In-App Purchase Rate",
      value: "15.7%",
      change: "+2.3%",
      trend: "up"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600";
      case "maintenance": return "text-yellow-600";
      case "beta": return "text-blue-600";
      case "inactive": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      case "beta": return "bg-blue-100 text-blue-800";
      case "inactive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return Play;
      case "maintenance": return Settings;
      case "beta": return Settings;
      case "inactive": return Pause;
      default: return Play;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <motion.header 
          className="glass-header sticky top-0 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-4"
                {...fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Game Management</h1>
                    <p className="text-sm text-muted-foreground">Gaming platform operations and analytics</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search games..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Game
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-8 py-8">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Games
                  </CardTitle>
                  <Gamepad2 className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">47</div>
                  <p className="text-sm text-green-600 font-medium">+3 this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Players
                  </CardTitle>
                  <Users className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">45.5K</div>
                  <p className="text-sm text-green-600 font-medium">+12.5% growth</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Daily Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$24.8K</div>
                  <p className="text-sm text-green-600 font-medium">+18.2% vs yesterday</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Rating
                  </CardTitle>
                  <Star className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">4.6</div>
                  <p className="text-sm text-green-600 font-medium">+0.2 this month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Player Metrics */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Users className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Player Metrics</CardTitle>
                      <CardDescription>
                        Key player engagement statistics
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {playerMetrics.map((metric, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{metric.metric}</h4>
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gradient mb-1">{metric.value}</p>
                        <p className="text-sm text-green-600 font-medium">{metric.change}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Chart */}
            <motion.div 
              className="lg:col-span-2"
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <BarChart3 className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Game Performance Analytics</CardTitle>
                      <CardDescription>
                        Revenue and player engagement trends
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                      <p className="text-muted-foreground">Game performance analytics</p>
                      <p className="text-sm text-muted-foreground">Interactive charts and metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Game Catalog */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.8 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Gamepad2 className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Game Catalog</CardTitle>
                    <CardDescription>
                      Manage and monitor all games in the platform
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {games.map((game, index) => {
                    const StatusIcon = getStatusIcon(game.status);
                    return (
                      <motion.div 
                        key={game.id}
                        className="glass-card p-6 rounded-2xl hover-lift group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <motion.div 
                              className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                              whileHover={{ scale: 1.1, rotate: 10 }}
                            >
                              <StatusIcon className={`w-6 h-6 ${getStatusColor(game.status)}`} />
                            </motion.div>
                            
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{game.name}</h3>
                                <Badge 
                                  className={`text-xs ${getStatusBg(game.status)}`}
                                  variant="outline"
                                >
                                  {game.status}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {game.category}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Version {game.version}</span>
                                <span>•</span>
                                <span>Updated {game.lastUpdate}</span>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span>{game.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-2 gap-6 text-center">
                              <div>
                                <p className="text-sm text-muted-foreground">Players</p>
                                <p className="text-lg font-bold text-gradient">{game.players.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Daily Revenue</p>
                                <p className="text-lg font-bold text-green-600">{game.dailyRevenue}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-4">
                              <Button size="sm" className="btn-premium">
                                <Eye className="w-4 h-4 mr-2" />
                                Analytics
                              </Button>
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                <Edit className="w-4 h-4 mr-2" />
                                Manage
                              </Button>
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 