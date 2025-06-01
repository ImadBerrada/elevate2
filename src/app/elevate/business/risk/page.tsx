"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  BarChart3,
  Activity,
  Target,
  Calendar,
  Filter,
  Download,
  Eye,
  Settings,
  CheckCircle,
  XCircle
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

export default function RiskAssessment() {
  const riskMetrics = [
    {
      id: 1,
      metric: "Value at Risk (VaR)",
      current: "2.8%",
      threshold: "5.0%",
      status: "low",
      description: "Maximum expected loss over 1 day at 95% confidence",
      trend: "stable"
    },
    {
      id: 2,
      metric: "Beta Coefficient",
      current: "0.92",
      threshold: "1.20",
      status: "moderate",
      description: "Portfolio sensitivity to market movements",
      trend: "decreasing"
    },
    {
      id: 3,
      metric: "Maximum Drawdown",
      current: "8.4%",
      threshold: "15.0%",
      status: "low",
      description: "Largest peak-to-trough decline",
      trend: "stable"
    },
    {
      id: 4,
      metric: "Sharpe Ratio",
      current: "1.85",
      threshold: "1.00",
      status: "excellent",
      description: "Risk-adjusted return measure",
      trend: "increasing"
    }
  ];

  const stressTests = [
    {
      id: 1,
      scenario: "Market Crash (-30%)",
      portfolioImpact: "-$8.4M",
      impactPercent: "-30.0%",
      recoveryTime: "18 months",
      probability: "2%",
      status: "prepared"
    },
    {
      id: 2,
      scenario: "Interest Rate Spike (+3%)",
      portfolioImpact: "-$2.8M",
      impactPercent: "-10.0%",
      recoveryTime: "8 months",
      probability: "15%",
      status: "prepared"
    },
    {
      id: 3,
      scenario: "Currency Devaluation (-20%)",
      portfolioImpact: "-$1.4M",
      impactPercent: "-5.0%",
      recoveryTime: "6 months",
      probability: "8%",
      status: "prepared"
    },
    {
      id: 4,
      scenario: "Sector Rotation",
      portfolioImpact: "-$840K",
      impactPercent: "-3.0%",
      recoveryTime: "3 months",
      probability: "25%",
      status: "monitoring"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low": return "text-green-600";
      case "moderate": return "text-yellow-600";
      case "high": return "text-red-600";
      case "excellent": return "text-blue-600";
      case "prepared": return "text-green-600";
      case "monitoring": return "text-yellow-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "low": return "bg-green-100 text-green-800";
      case "moderate": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      case "excellent": return "bg-blue-100 text-blue-800";
      case "prepared": return "bg-green-100 text-green-800";
      case "monitoring": return "bg-yellow-100 text-yellow-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "low":
      case "excellent":
      case "prepared": return CheckCircle;
      case "moderate":
      case "monitoring": return AlertTriangle;
      case "high":
      case "critical": return XCircle;
      default: return AlertTriangle;
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
                    <Shield className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Risk Assessment</h1>
                    <p className="text-sm text-muted-foreground">Comprehensive portfolio risk analysis and management</p>
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
                  Risk Filters
                </Button>
                <Button className="btn-premium">
                  <Settings className="w-4 h-4 mr-2" />
                  Risk Settings
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
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overall Risk Score
                  </CardTitle>
                  <Shield className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">6.2/10</div>
                  <p className="text-sm text-green-600 font-medium">Moderate risk level</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Portfolio Volatility
                  </CardTitle>
                  <Activity className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">12.4%</div>
                  <p className="text-sm text-green-600 font-medium">Below target (15%)</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Correlation Risk
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">0.65</div>
                  <p className="text-sm text-yellow-600 font-medium">Moderate correlation</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Risk Alerts
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">2</div>
                  <p className="text-sm text-yellow-600 font-medium">Active monitoring</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Risk Metrics */}
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
                      <Target className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Risk Metrics</CardTitle>
                      <CardDescription>
                        Key risk indicators and thresholds
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {riskMetrics.map((metric, index) => {
                      const StatusIcon = getStatusIcon(metric.status);
                      return (
                        <motion.div 
                          key={metric.id}
                          className="glass-card p-4 rounded-xl hover-lift"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <StatusIcon className={`w-5 h-5 ${getStatusColor(metric.status)}`} />
                              <h4 className="font-semibold text-foreground">{metric.metric}</h4>
                            </div>
                            <Badge 
                              className={`text-xs ${getStatusBg(metric.status)}`}
                              variant="outline"
                            >
                              {metric.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Current</p>
                              <p className="text-lg font-bold text-gradient">{metric.current}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Threshold</p>
                              <p className="text-lg font-semibold text-foreground">{metric.threshold}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">{metric.description}</p>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                metric.status === 'low' || metric.status === 'excellent' 
                                  ? 'bg-gradient-to-r from-green-500 to-green-400' 
                                  : metric.status === 'moderate' 
                                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                                  : 'bg-gradient-to-r from-red-500 to-red-400'
                              }`}
                              style={{ 
                                width: metric.status === 'excellent' ? '90%' : 
                                       metric.status === 'low' ? '70%' : 
                                       metric.status === 'moderate' ? '50%' : '30%' 
                              }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Risk Distribution */}
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
                      <CardTitle>Risk Distribution</CardTitle>
                      <CardDescription>
                        Portfolio risk breakdown by category
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: "Market Risk", percentage: 35, amount: "$9.8M", color: "bg-red-500" },
                      { category: "Credit Risk", percentage: 25, amount: "$7.0M", color: "bg-orange-500" },
                      { category: "Liquidity Risk", percentage: 20, amount: "$5.6M", color: "bg-yellow-500" },
                      { category: "Operational Risk", percentage: 15, amount: "$4.2M", color: "bg-blue-500" },
                      { category: "Currency Risk", percentage: 5, amount: "$1.4M", color: "bg-purple-500" }
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
                          <span className="font-medium text-foreground">{item.category}</span>
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
            </motion.div>
          </div>

          {/* Stress Testing */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.8 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <TrendingDown className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Stress Testing Scenarios</CardTitle>
                      <CardDescription>
                        Portfolio resilience under adverse conditions
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" className="glass-card border-0 hover-glow">
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stressTests.map((test, index) => {
                    const StatusIcon = getStatusIcon(test.status);
                    return (
                      <motion.div 
                        key={test.id}
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
                              <StatusIcon className={`w-6 h-6 ${getStatusColor(test.status)}`} />
                            </motion.div>
                            
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{test.scenario}</h3>
                                <Badge 
                                  className={`text-xs ${getStatusBg(test.status)}`}
                                  variant="outline"
                                >
                                  {test.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">Probability: {test.probability} • Recovery: {test.recoveryTime}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-2 gap-6 text-center">
                              <div>
                                <p className="text-sm text-muted-foreground">Portfolio Impact</p>
                                <p className="text-lg font-bold text-red-600">{test.portfolioImpact}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Impact %</p>
                                <p className="text-lg font-bold text-red-600">{test.impactPercent}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-4">
                              <Button size="sm" className="btn-premium">
                                <Eye className="w-4 h-4 mr-2" />
                                Details
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