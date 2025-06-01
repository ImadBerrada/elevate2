"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Target,
  Activity,
  Zap,
  Calendar,
  Filter,
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

export default function PerformanceAnalytics() {
  const performanceMetrics = [
    {
      id: 1,
      metric: "Portfolio Growth Rate",
      current: "24.8%",
      target: "20.0%",
      trend: "up",
      change: "+4.8%",
      period: "YTD"
    },
    {
      id: 2,
      metric: "Risk-Adjusted Returns",
      current: "18.5%",
      target: "15.0%",
      trend: "up",
      change: "+3.5%",
      period: "Annual"
    },
    {
      id: 3,
      metric: "Asset Allocation Efficiency",
      current: "92.3%",
      target: "85.0%",
      trend: "up",
      change: "+7.3%",
      period: "Current"
    },
    {
      id: 4,
      metric: "Diversification Index",
      current: "0.87",
      target: "0.80",
      trend: "up",
      change: "+0.07",
      period: "Current"
    }
  ];

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
                    <h1 className="text-2xl font-bold text-gradient">Performance Analytics</h1>
                    <p className="text-sm text-muted-foreground">Investment performance tracking and analysis</p>
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
                  Time Period
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
                    Overall Performance
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">94.2%</div>
                  <p className="text-sm text-green-600 font-medium">Excellent rating</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Benchmark Outperformance
                  </CardTitle>
                  <Target className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">+6.8%</div>
                  <p className="text-sm text-green-600 font-medium">Above S&P 500</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Volatility Score
                  </CardTitle>
                  <Activity className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">12.4%</div>
                  <p className="text-sm text-green-600 font-medium">Low risk profile</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sharpe Ratio
                  </CardTitle>
                  <Zap className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">1.85</div>
                  <p className="text-sm text-green-600 font-medium">Strong efficiency</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Metrics */}
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
                      <BarChart3 className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Key Performance Metrics</CardTitle>
                      <CardDescription>
                        Track performance against targets
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {performanceMetrics.map((metric, index) => (
                      <motion.div 
                        key={metric.id}
                        className="glass-card p-4 rounded-xl hover-lift"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-foreground">{metric.metric}</h4>
                          <Badge variant="outline" className="text-xs">
                            {metric.period}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Current</p>
                              <p className="text-lg font-bold text-gradient">{metric.current}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Target</p>
                              <p className="text-lg font-semibold text-foreground">{metric.target}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Change</p>
                            <p className="text-lg font-semibold text-green-600">{metric.change}</p>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                            style={{ width: "85%" }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Analytics Summary */}
            <motion.div 
              className="space-y-8"
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              {/* Portfolio Composition */}
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
                      <CardTitle>Portfolio Composition</CardTitle>
                      <CardDescription>
                        Asset allocation breakdown
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { asset: "Equities", percentage: 65, amount: "$18.2M", color: "bg-blue-500" },
                      { asset: "Fixed Income", percentage: 25, amount: "$7.0M", color: "bg-green-500" },
                      { asset: "Real Estate", percentage: 8, amount: "$2.2M", color: "bg-purple-500" },
                      { asset: "Cash & Equivalents", percentage: 2, amount: "$0.6M", color: "bg-orange-500" }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${item.color}`} />
                          <span className="font-medium text-foreground">{item.asset}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{item.percentage}%</p>
                          <p className="text-sm text-muted-foreground">{item.amount}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Analysis */}
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Activity className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Risk Analysis</CardTitle>
                      <CardDescription>
                        Portfolio risk assessment
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: "Value at Risk (VaR)", value: "2.8%", status: "low" },
                      { metric: "Beta Coefficient", value: "0.92", status: "moderate" },
                      { metric: "Maximum Drawdown", value: "8.4%", status: "low" },
                      { metric: "Correlation Risk", value: "0.65", status: "moderate" }
                    ].map((risk, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between p-3 glass-card rounded-xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        <span className="font-medium text-foreground">{risk.metric}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-foreground">{risk.value}</span>
                          <Badge 
                            variant={risk.status === "low" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {risk.status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
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