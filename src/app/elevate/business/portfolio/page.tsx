"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Target,
  PieChart,
  Building2,
  Users,
  Calendar,
  BarChart3,
  Filter,
  Plus,
  Eye,
  Edit,
  Download
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function PortfolioManagement() {
  const portfolios = [
    {
      id: 1,
      name: "Growth Portfolio",
      totalValue: "$18.5M",
      allocation: "65%",
      return: "+24.8%",
      risk: "High",
      assets: 28,
      lastRebalanced: "2024-01-15",
      manager: "Sarah Johnson"
    },
    {
      id: 2,
      name: "Conservative Portfolio",
      totalValue: "$12.3M",
      allocation: "25%",
      return: "+8.4%",
      risk: "Low",
      assets: 15,
      lastRebalanced: "2024-01-10",
      manager: "Michael Chen"
    },
    {
      id: 3,
      name: "Balanced Portfolio",
      totalValue: "$8.7M",
      allocation: "10%",
      return: "+15.2%",
      risk: "Medium",
      assets: 22,
      lastRebalanced: "2024-01-12",
      manager: "David Kim"
    }
  ];

  const assetAllocation = [
    { category: "Equities", percentage: 45, value: "$17.8M", color: "bg-blue-500" },
    { category: "Fixed Income", percentage: 25, value: "$9.9M", color: "bg-green-500" },
    { category: "Real Estate", percentage: 15, value: "$5.9M", color: "bg-purple-500" },
    { category: "Commodities", percentage: 10, value: "$3.9M", color: "bg-orange-500" },
    { category: "Cash & Equivalents", percentage: 5, value: "$2.0M", color: "bg-gray-500" }
  ];

  const topHoldings = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      value: "$2.8M",
      weight: "7.1%",
      return: "+18.5%",
      sector: "Technology"
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      value: "$2.4M",
      weight: "6.1%",
      return: "+22.3%",
      sector: "Technology"
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      value: "$2.1M",
      weight: "5.3%",
      return: "+15.7%",
      sector: "Technology"
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      value: "$1.9M",
      weight: "4.8%",
      return: "+28.9%",
      sector: "Automotive"
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      value: "$1.7M",
      weight: "4.3%",
      return: "+45.2%",
      sector: "Technology"
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
                    <Briefcase className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Portfolio Management</h1>
                    <p className="text-sm text-muted-foreground">Strategic asset allocation and portfolio optimization</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Calendar className="w-4 h-4 mr-2" />
                  Rebalance
                </Button>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Portfolio
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
                    Total Portfolio Value
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$39.5M</div>
                  <p className="text-sm text-green-600 font-medium">+16.8% YTD</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Return
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">+18.2%</div>
                  <p className="text-sm text-green-600 font-medium">Outperforming benchmark</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Portfolios
                  </CardTitle>
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">3</div>
                  <p className="text-sm text-muted-foreground">65 total assets</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Risk Score
                  </CardTitle>
                  <Target className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">7.2</div>
                  <p className="text-sm text-green-600 font-medium">Moderate-High</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Asset Allocation */}
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
                      <PieChart className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Asset Allocation</CardTitle>
                      <CardDescription>
                        Portfolio distribution by asset class
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assetAllocation.map((asset, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${asset.color}`} />
                          <span className="font-medium text-foreground">{asset.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{asset.percentage}%</p>
                          <p className="text-sm text-muted-foreground">{asset.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Chart */}
            <motion.div 
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
                      <CardTitle>Performance Overview</CardTitle>
                      <CardDescription>
                        Portfolio performance vs benchmark
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                      <p className="text-muted-foreground">Performance chart</p>
                      <p className="text-sm text-muted-foreground">Interactive portfolio analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Portfolio List */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.8 }}
            className="mb-12"
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Briefcase className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Portfolio Overview</CardTitle>
                    <CardDescription>
                      Manage and monitor individual portfolios
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolios.map((portfolio, index) => (
                    <motion.div 
                      key={portfolio.id}
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
                            <Briefcase className="w-6 h-6 text-white" />
                          </motion.div>
                          
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-semibold text-lg text-foreground">{portfolio.name}</h3>
                              <Badge 
                                className={`text-xs ${getRiskColor(portfolio.risk)}`}
                                variant="outline"
                              >
                                {portfolio.risk} Risk
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Manager: {portfolio.manager}</span>
                              <span>•</span>
                              <span>{portfolio.assets} assets</span>
                              <span>•</span>
                              <span>Last rebalanced: {portfolio.lastRebalanced}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Value</p>
                              <p className="text-lg font-bold text-gradient">{portfolio.totalValue}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Allocation</p>
                              <p className="text-lg font-bold text-foreground">{portfolio.allocation}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Return</p>
                              <p className="text-lg font-bold text-green-600">{portfolio.return}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-4">
                            <Button size="sm" className="btn-premium">
                              <Eye className="w-4 h-4 mr-2" />
                              Analyze
                            </Button>
                            <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                              <Edit className="w-4 h-4 mr-2" />
                              Rebalance
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

          {/* Top Holdings */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 1.0 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <TrendingUp className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Top Holdings</CardTitle>
                      <CardDescription>
                        Largest positions across all portfolios
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" className="glass-card border-0 hover-glow">
                    <Download className="w-4 h-4 mr-2" />
                    Export Holdings
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topHoldings.map((holding, index) => (
                    <motion.div 
                      key={index}
                      className="glass-card p-4 rounded-xl hover-lift"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-primary text-sm">{holding.symbol}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{holding.name}</h4>
                            <p className="text-sm text-muted-foreground">{holding.sector}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Value</p>
                            <p className="font-bold text-gradient">{holding.value}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Weight</p>
                            <p className="font-bold text-foreground">{holding.weight}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Return</p>
                            <p className="font-bold text-green-600">{holding.return}</p>
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