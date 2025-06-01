"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  PieChart,
  Activity,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle
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

export default function InvestmentTracking() {
  const investments = [
    {
      id: 1,
      name: "Tech Growth Fund",
      symbol: "TGF",
      currentValue: "$9.8M",
      initialValue: "$7.2M",
      return: "+36.1%",
      dailyChange: "+2.4%",
      status: "outperforming",
      riskLevel: "High",
      allocation: "35%"
    },
    {
      id: 2,
      name: "Global Bonds",
      symbol: "GBP",
      currentValue: "$7.0M",
      initialValue: "$6.5M",
      return: "+7.7%",
      dailyChange: "+0.3%",
      status: "stable",
      riskLevel: "Low",
      allocation: "25%"
    },
    {
      id: 3,
      name: "Real Estate REIT",
      symbol: "RER",
      currentValue: "$5.6M",
      initialValue: "$4.8M",
      return: "+16.7%",
      dailyChange: "-0.8%",
      status: "performing",
      riskLevel: "Medium",
      allocation: "20%"
    },
    {
      id: 4,
      name: "Emerging Markets",
      symbol: "EMF",
      currentValue: "$4.2M",
      initialValue: "$3.4M",
      return: "+23.5%",
      dailyChange: "+1.2%",
      status: "outperforming",
      riskLevel: "High",
      allocation: "15%"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "outperforming": return "text-green-600";
      case "performing": return "text-blue-600";
      case "stable": return "text-gray-600";
      case "underperforming": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "outperforming": return CheckCircle;
      case "performing": return TrendingUp;
      case "stable": return Activity;
      case "underperforming": return AlertTriangle;
      default: return Activity;
    }
  };

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
                    <TrendingUp className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Investment Tracking</h1>
                    <p className="text-sm text-muted-foreground">Real-time investment performance monitoring</p>
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
                  Time Range
                </Button>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
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
                  <div className="text-3xl font-bold text-gradient mb-2">$26.6M</div>
                  <p className="text-sm text-green-600 font-medium">+18.2% overall return</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Daily P&L
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">+$284K</div>
                  <p className="text-sm text-green-600 font-medium">+1.07% today</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Positions
                  </CardTitle>
                  <Target className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">47</div>
                  <p className="text-sm text-muted-foreground">Across 4 portfolios</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Risk Score
                  </CardTitle>
                  <Activity className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">6.8</div>
                  <p className="text-sm text-green-600 font-medium">Moderate risk</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Performance Chart */}
            <motion.div 
              className="lg:col-span-2"
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
                      <BarChart3 className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Performance Tracking</CardTitle>
                      <CardDescription>
                        Real-time portfolio performance
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                      <p className="text-muted-foreground">Interactive performance chart</p>
                      <p className="text-sm text-muted-foreground">Real-time data visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
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
                      <PieChart className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Quick Stats</CardTitle>
                      <CardDescription>
                        Key performance indicators
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Best Performer", value: "Tech Growth Fund", change: "+36.1%" },
                      { label: "Worst Performer", value: "Global Bonds", change: "+7.7%" },
                      { label: "Most Volatile", value: "Emerging Markets", change: "±12.4%" },
                      { label: "Most Stable", value: "Real Estate REIT", change: "±3.2%" }
                    ].map((stat, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between p-3 glass-card rounded-xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="font-medium text-foreground">{stat.value}</p>
                        </div>
                        <p className="font-semibold text-green-600">{stat.change}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Investment Holdings */}
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
                    <Target className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Investment Holdings</CardTitle>
                    <CardDescription>
                      Real-time tracking of all investments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.map((investment, index) => {
                    const StatusIcon = getStatusIcon(investment.status);
                    return (
                      <motion.div 
                        key={investment.id}
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
                              <StatusIcon className={`w-6 h-6 ${getStatusColor(investment.status)}`} />
                            </motion.div>
                            
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{investment.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {investment.symbol}
                                </Badge>
                                <Badge 
                                  className={`text-xs ${getRiskColor(investment.riskLevel)}`}
                                  variant="outline"
                                >
                                  {investment.riskLevel} Risk
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">Allocation: {investment.allocation}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-3 gap-6 text-center">
                              <div>
                                <p className="text-sm text-muted-foreground">Current Value</p>
                                <p className="text-lg font-bold text-gradient">{investment.currentValue}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Total Return</p>
                                <p className="text-lg font-bold text-green-600">{investment.return}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Daily Change</p>
                                <p className={`text-lg font-bold ${
                                  investment.dailyChange.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {investment.dailyChange}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-4">
                              <Button size="sm" className="btn-premium">
                                <Eye className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                <Download className="w-4 h-4" />
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