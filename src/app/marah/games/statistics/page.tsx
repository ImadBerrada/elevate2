"use client";

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
  Target
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

export default function GameStatistics() {
  const gameStats = [
    {
      id: "GAME-001",
      name: "Speed Delivery Challenge",
      category: "Racing",
      totalPlayers: 12450,
      activeToday: 2340,
      avgSessionTime: "8.5 min",
      revenue: "$4,250",
      rating: 4.7,
      completionRate: "78%",
      status: "active"
    },
    {
      id: "GAME-002",
      name: "Route Master Pro",
      category: "Strategy",
      totalPlayers: 8920,
      activeToday: 1680,
      avgSessionTime: "12.3 min",
      revenue: "$3,180",
      rating: 4.5,
      completionRate: "65%",
      status: "active"
    },
    {
      id: "GAME-003",
      name: "Delivery Hero",
      category: "Action",
      totalPlayers: 15680,
      activeToday: 3240,
      avgSessionTime: "6.8 min",
      revenue: "$5,890",
      rating: 4.8,
      completionRate: "82%",
      status: "active"
    },
    {
      id: "GAME-004",
      name: "City Navigator",
      category: "Puzzle",
      totalPlayers: 6750,
      activeToday: 890,
      avgSessionTime: "15.2 min",
      revenue: "$2,340",
      rating: 4.3,
      completionRate: "58%",
      status: "maintenance"
    },
    {
      id: "GAME-005",
      name: "Traffic Rush",
      category: "Arcade",
      totalPlayers: 9840,
      activeToday: 1950,
      avgSessionTime: "5.4 min",
      revenue: "$3,670",
      rating: 4.6,
      completionRate: "71%",
      status: "active"
    }
  ];

  const playerDemographics = [
    { age: "18-25", percentage: 35, count: "15.8K", color: "bg-blue-500" },
    { age: "26-35", percentage: 28, count: "12.6K", color: "bg-green-500" },
    { age: "36-45", percentage: 22, count: "9.9K", color: "bg-purple-500" },
    { age: "46+", percentage: 15, count: "6.8K", color: "bg-orange-500" }
  ];

  const topPerformers = [
    { rank: 1, player: "Ahmed_Speed", score: 98450, games: 156, winRate: "89%" },
    { rank: 2, player: "FastDelivery", score: 94230, games: 142, winRate: "85%" },
    { rank: 3, player: "RouteKing", score: 91680, games: 138, winRate: "82%" },
    { rank: 4, player: "CityRacer", score: 89340, games: 134, winRate: "79%" },
    { rank: 5, player: "DeliveryPro", score: 87920, games: 129, winRate: "76%" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600";
      case "maintenance": return "text-yellow-600";
      case "inactive": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
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
                    <BarChart3 className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Game Statistics</h1>
                    <p className="text-sm text-muted-foreground">Player analytics and game performance metrics</p>
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
                  Generate Report
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
                    Total Players
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">45.5K</div>
                  <p className="text-sm text-green-600 font-medium">+12.3% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Daily Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$24.8K</div>
                  <p className="text-sm text-green-600 font-medium">+8.7% vs yesterday</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Games
                  </CardTitle>
                  <GamepadIcon className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">47</div>
                  <p className="text-sm text-blue-600 font-medium">3 new this week</p>
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
                  <p className="text-sm text-green-600 font-medium">+0.2 vs last month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Player Demographics */}
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
                      <CardTitle>Player Demographics</CardTitle>
                      <CardDescription>
                        Age distribution of active players
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {playerDemographics.map((demo, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${demo.color}`} />
                          <span className="font-medium text-foreground">{demo.age}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{demo.percentage}%</p>
                          <p className="text-sm text-muted-foreground">{demo.count}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Performers */}
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
                      <Target className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Top Performers</CardTitle>
                      <CardDescription>
                        Leaderboard of highest scoring players
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topPerformers.map((player, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold">
                              {player.rank}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">{player.player}</h4>
                              <p className="text-sm text-muted-foreground">{player.games} games played</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gradient">{player.score.toLocaleString()}</p>
                            <p className="text-sm text-green-600 font-medium">{player.winRate} win rate</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Game Performance */}
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
                    <GamepadIcon className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Game Performance Analytics</CardTitle>
                    <CardDescription>
                      Detailed metrics for each game
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gameStats.map((game, index) => (
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
                            <GamepadIcon className="w-6 h-6 text-white" />
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
                            <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground mb-2">
                              <span>Total Players: {game.totalPlayers.toLocaleString()}</span>
                              <span>Active Today: {game.activeToday.toLocaleString()}</span>
                              <span>Avg Session: {game.avgSessionTime}</span>
                              <span>Completion: {game.completionRate}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className={`font-medium ${getRatingColor(game.rating)}`}>
                                ★ {game.rating} Rating
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground">Daily Revenue</p>
                            <p className="text-2xl font-bold text-gradient">{game.revenue}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="btn-premium">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Analytics
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 