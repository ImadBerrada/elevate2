"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Target,
  PieChart,
  Calendar,
  ArrowUpRight,
  BarChart3,
  Activity,
  Globe
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { cn } from "@/lib/utils";

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

// Chart data for ELEVATE
const performanceData = [
  { month: 'Jan', value: 3200000, target: 3000000, roi: 18.5 },
  { month: 'Feb', value: 3800000, target: 3200000, roi: 19.2 },
  { month: 'Mar', value: 4100000, target: 3500000, roi: 20.1 },
  { month: 'Apr', value: 3900000, target: 3400000, roi: 19.8 },
  { month: 'May', value: 4300000, target: 3800000, roi: 21.2 },
  { month: 'Jun', value: 4600000, target: 4000000, roi: 22.5 }
];

const sectorAllocation = [
  { name: 'Technology', value: 35, amount: 4340000, color: '#3B82F6' },
  { name: 'Healthcare', value: 20, amount: 2480000, color: '#10B981' },
  { name: 'Financial Services', value: 18, amount: 2232000, color: '#8B5CF6' },
  { name: 'Energy & Utilities', value: 15, amount: 1860000, color: '#F59E0B' },
  { name: 'Consumer Goods', value: 12, amount: 1488000, color: '#EF4444' }
];

const riskMetrics = [
  { category: 'Low Risk', value: 25, color: '#10B981' },
  { category: 'Medium Risk', value: 45, color: '#F59E0B' },
  { category: 'High Risk', value: 30, color: '#EF4444' }
];

const monthlyReturns = [
  { month: 'Jan', returns: 8.2, benchmark: 6.5 },
  { month: 'Feb', returns: 9.1, benchmark: 7.2 },
  { month: 'Mar', returns: 11.5, benchmark: 8.1 },
  { month: 'Apr', returns: 10.8, benchmark: 7.8 },
  { month: 'May', returns: 12.3, benchmark: 8.9 },
  { month: 'Jun', returns: 15.2, benchmark: 9.5 }
];

export default function ElevateHome() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0" // Prevent content overflow
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Enhanced Portfolio Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-refined bg-gradient-to-br from-blue-50/60 to-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-refined text-muted-foreground">
                    Total Portfolio Value
                  </CardTitle>
                  <motion.div
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-prestigious text-gradient mb-1 sm:mb-2">$24.8M</div>
                  <div className="flex items-center text-xs sm:text-sm text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span className="font-refined">+22.5% this quarter</span>
                  </div>
                  <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "88%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-refined bg-gradient-to-br from-green-50/60 to-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-refined text-muted-foreground">
                    Active Investments
                  </CardTitle>
                  <motion.div
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Briefcase className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-prestigious text-gradient mb-1 sm:mb-2">127</div>
                  <div className="flex items-center text-xs sm:text-sm text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span className="font-refined">+15 new this month</span>
                  </div>
                  <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-refined bg-gradient-to-br from-purple-50/60 to-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-refined text-muted-foreground">
                    Monthly Returns
                  </CardTitle>
                  <motion.div
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-prestigious text-gradient mb-1 sm:mb-2">$2.1M</div>
                  <div className="flex items-center text-xs sm:text-sm text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span className="font-refined">+15.2% from last month</span>
                  </div>
                  <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "82%" }}
                      transition={{ duration: 1.5, delay: 0.9 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-refined bg-gradient-to-br from-orange-50/60 to-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-refined text-muted-foreground">
                    ROI Average
                  </CardTitle>
                  <motion.div
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-prestigious text-gradient mb-1 sm:mb-2">22.5%</div>
                  <div className="flex items-center text-xs sm:text-sm text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span className="font-refined">+4.8% above target</span>
                  </div>
                  <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "91%" }}
                      transition={{ duration: 1.5, delay: 1.1 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {/* Performance Trend Chart */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <motion.div
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <BarChart3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-sm sm:text-base lg:text-lg font-elegant">Investment Performance</CardTitle>
                      <CardDescription className="text-refined text-xs sm:text-sm">
                        Portfolio value vs targets over 6 months
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" fontSize={isMobile ? 10 : isTablet ? 11 : 12} />
                        <YAxis stroke="#6B7280" fontSize={isMobile ? 10 : isTablet ? 11 : 12} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                        <Tooltip 
                          formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, '']}
                          labelStyle={{ color: '#374151' }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                            fontSize: isMobile ? '11px' : isTablet ? '12px' : '14px'
                          }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={isMobile ? 1.5 : isTablet ? 2 : 3} fillOpacity={1} fill="url(#colorValue)" />
                        <Area type="monotone" dataKey="target" stroke="#10B981" strokeWidth={isMobile ? 1.5 : isTablet ? 2 : 2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorTarget)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sector Allocation */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <motion.div
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <PieChart className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-sm sm:text-base lg:text-lg font-elegant">Sector Allocation</CardTitle>
                      <CardDescription className="text-refined text-xs sm:text-sm">
                        Investment distribution by industry
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={sectorAllocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 30 : isTablet ? 50 : 60}
                          outerRadius={isMobile ? 60 : isTablet ? 100 : 120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sectorAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => [
                            `${value}% ($${(props.payload.amount / 1000000).toFixed(1)}M)`, 
                            'Allocation'
                          ]}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                            fontSize: isMobile ? '11px' : isTablet ? '12px' : '14px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={isMobile ? 20 : isTablet ? 28 : 36}
                          wrapperStyle={{ fontSize: isMobile ? '10px' : isTablet ? '11px' : '14px' }}
                          formatter={(value, entry) => (
                            <span style={{ color: entry.color, fontWeight: 500 }}>{value}</span>
                          )}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Risk Analysis & Returns Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {/* Risk Distribution */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <motion.div
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-sm sm:text-base lg:text-lg font-elegant">Risk Distribution</CardTitle>
                      <CardDescription className="text-refined text-xs sm:text-sm">
                        Portfolio risk assessment breakdown
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={riskMetrics}>
                        <RadialBar dataKey="value" cornerRadius={10} fill="#3B82F6" />
                        <Tooltip 
                          formatter={(value: number) => [`${value}%`, 'Portfolio Share']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                            fontSize: isMobile ? '11px' : isTablet ? '12px' : '14px'
                          }}
                        />
                        <Legend />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Returns vs Benchmark */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <motion.div
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-sm sm:text-base lg:text-lg font-elegant">Returns vs Benchmark</CardTitle>
                      <CardDescription className="text-refined text-xs sm:text-sm">
                        Performance comparison with market indices
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyReturns}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" fontSize={isMobile ? 10 : isTablet ? 11 : 12} />
                        <YAxis stroke="#6B7280" fontSize={isMobile ? 10 : isTablet ? 11 : 12} tickFormatter={(value) => `${value}%`} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            `${value}%`,
                            name === 'returns' ? 'ELEVATE Returns' : 'Market Benchmark'
                          ]}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                            fontSize: isMobile ? '11px' : isTablet ? '12px' : '14px'
                          }}
                        />
                        <Bar dataKey="returns" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="benchmark" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Enhanced Investment Portfolio */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.7 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <motion.div
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-base sm:text-lg lg:text-xl font-elegant">Strategic Investment Portfolio</CardTitle>
                      <CardDescription className="text-refined text-xs sm:text-sm">
                        Top performing investments and market opportunities
                      </CardDescription>
                    </div>
                  </div>
                  <Button className="btn-premium w-full sm:w-auto text-xs sm:text-sm">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    New Investment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  {[
                    { 
                      name: "Technology Growth Fund", 
                      allocation: "35%", 
                      value: "$8.68M", 
                      performance: "+28.5%", 
                      status: "Outperforming",
                      risk: "Medium-High",
                      trend: [85, 88, 92, 89, 95, 98]
                    },
                    { 
                      name: "Healthcare Innovation", 
                      allocation: "20%", 
                      value: "$4.96M", 
                      performance: "+22.8%", 
                      status: "Strong Growth",
                      risk: "Medium",
                      trend: [78, 82, 85, 88, 91, 94]
                    },
                    { 
                      name: "Financial Services ETF", 
                      allocation: "18%", 
                      value: "$4.46M", 
                      performance: "+18.2%", 
                      status: "Stable Growth",
                      risk: "Low-Medium",
                      trend: [82, 84, 86, 85, 87, 89]
                    },
                    { 
                      name: "Renewable Energy", 
                      allocation: "15%", 
                      value: "$3.72M", 
                      performance: "+35.7%", 
                      status: "High Growth",
                      risk: "High",
                      trend: [70, 75, 82, 88, 92, 96]
                    }
                  ].map((investment, index) => (
                    <motion.div 
                      key={index}
                      className="glass-card p-3 sm:p-4 lg:p-6 rounded-2xl hover-lift group border-refined relative overflow-hidden"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <motion.div 
                            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 gradient-primary rounded-xl flex items-center justify-center shadow-refined"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                          >
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="font-elegant text-sm sm:text-base lg:text-lg text-foreground">{investment.name}</h3>
                            <Badge 
                              variant="secondary"
                              className="border-refined text-xs"
                            >
                              {investment.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-lg sm:text-xl lg:text-2xl font-prestigious text-gradient">{investment.value}</p>
                          <p className="text-xs sm:text-sm text-green-600 font-refined">{investment.performance}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Allocation</p>
                          <p className="font-bold text-foreground text-xs sm:text-sm lg:text-base">{investment.allocation}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Risk Level</p>
                          <p className="font-bold text-foreground text-xs sm:text-sm lg:text-base">{investment.risk}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Performance</p>
                          <p className="font-bold text-green-600 text-xs sm:text-sm lg:text-base">{investment.performance}</p>
                        </div>
                      </div>

                      <div className="h-10 sm:h-12 lg:h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={investment.trend.map((value, i) => ({ value, month: i }))}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#3B82F6" 
                              strokeWidth={isMobile ? 1.5 : isTablet ? 2 : 2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
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