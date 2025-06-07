"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  Eye,
  ArrowUpRight,
  Target,
  Building2,
  Users,
  Activity,
  Globe
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
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
  Legend,
  ComposedChart
} from 'recharts';
import { cn } from "@/lib/utils";

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

// Enhanced chart data
const quarterlyFinancials = [
  { quarter: 'Q1 2023', revenue: 10200000, expenses: 6800000, profit: 3400000, margin: 33.3 },
  { quarter: 'Q2 2023', revenue: 11500000, expenses: 7200000, profit: 4300000, margin: 37.4 },
  { quarter: 'Q3 2023', revenue: 12100000, expenses: 7800000, profit: 4300000, margin: 35.5 },
  { quarter: 'Q4 2023', revenue: 12800000, expenses: 8400000, profit: 4400000, margin: 34.4 }
];

const monthlyTrends = [
  { month: 'Jan', revenue: 3200000, expenses: 2100000, profit: 1100000, cashFlow: 950000 },
  { month: 'Feb', revenue: 3800000, expenses: 2300000, profit: 1500000, cashFlow: 1350000 },
  { month: 'Mar', revenue: 4100000, expenses: 2500000, profit: 1600000, cashFlow: 1450000 },
  { month: 'Apr', revenue: 3900000, expenses: 2400000, profit: 1500000, cashFlow: 1300000 },
  { month: 'May', revenue: 4300000, expenses: 2600000, profit: 1700000, cashFlow: 1550000 },
  { month: 'Jun', revenue: 4600000, expenses: 2800000, profit: 1800000, cashFlow: 1650000 },
  { month: 'Jul', revenue: 4800000, expenses: 2850000, profit: 1950000, cashFlow: 1750000 },
  { month: 'Aug', revenue: 5100000, expenses: 3000000, profit: 2100000, cashFlow: 1900000 },
  { month: 'Sep', revenue: 5300000, expenses: 3100000, profit: 2200000, cashFlow: 2000000 },
  { month: 'Oct', revenue: 5600000, expenses: 3200000, profit: 2400000, cashFlow: 2200000 },
  { month: 'Nov', revenue: 5800000, expenses: 3300000, profit: 2500000, cashFlow: 2300000 },
  { month: 'Dec', revenue: 6200000, expenses: 3500000, profit: 2700000, cashFlow: 2500000 }
];

const expenseBreakdown = [
  { category: 'Operations', amount: 3200000, percentage: 38, color: '#3B82F6' },
  { category: 'Investment Costs', amount: 2800000, percentage: 33, color: '#10B981' },
  { category: 'Administrative', amount: 1600000, percentage: 19, color: '#8B5CF6' },
  { category: 'Marketing', amount: 800000, percentage: 10, color: '#F59E0B' }
];

const revenueStreams = [
  { source: 'Investment Returns', amount: 5200000, percentage: 45, growth: 18.5, color: '#3B82F6' },
  { source: 'Real Estate', amount: 3600000, percentage: 30, growth: 12.3, color: '#10B981' },
  { source: 'Business Operations', amount: 2000000, percentage: 18, growth: 25.7, color: '#8B5CF6' },
  { source: 'Other Income', amount: 800000, percentage: 7, growth: 8.9, color: '#F59E0B' }
];

const kpiMetrics = [
  { name: 'ROA', current: 18.5, target: 15.0, trend: 'up' },
  { name: 'ROE', current: 24.8, target: 20.0, trend: 'up' },
  { name: 'Debt Ratio', current: 0.35, target: 0.40, trend: 'down' },
  { name: 'Current Ratio', current: 2.8, target: 2.0, trend: 'up' },
  { name: 'Quick Ratio', current: 2.1, target: 1.5, trend: 'up' },
  { name: 'Gross Margin', current: 65.2, target: 60.0, trend: 'up' }
];

export default function FinancialReports() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();

  const reportCategories = [
    {
      id: 1,
      title: "Profit & Loss Statement",
      period: "Q4 2023",
      revenue: "$12.8M",
      expenses: "$8.4M",
      netIncome: "$4.4M",
      margin: "34.4%",
      status: "completed"
    },
    {
      id: 2,
      title: "Balance Sheet",
      period: "Q4 2023",
      assets: "$45.2M",
      liabilities: "$12.8M",
      equity: "$32.4M",
      ratio: "3.5:1",
      status: "completed"
    },
    {
      id: 3,
      title: "Cash Flow Statement",
      period: "Q4 2023",
      operating: "$5.2M",
      investing: "-$2.8M",
      financing: "$1.4M",
      netCash: "$3.8M",
      status: "completed"
    },
    {
      id: 4,
      title: "Investment Performance",
      period: "Q4 2023",
      totalReturn: "$8.6M",
      roi: "18.5%",
      benchmark: "15.2%",
      alpha: "+3.3%",
      status: "completed"
    }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0" // Prevent content overflow
      )}>
        <motion.header 
          className={cn(
            "glass-header sticky top-0 z-50 transition-all duration-300",
            isOpen ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: isOpen ? 0 : 1, 
            y: isOpen ? -20 : 0 
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <motion.div 
                className="flex items-center space-x-2 sm:space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <BurgerMenu />
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <motion.div
                    className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
                  </motion.div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-elegant text-gradient">Financial Intelligence Center</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground font-refined">Advanced financial analysis and strategic reporting</p>
                  </div>
                  <div className="sm:hidden">
                    <h1 className="text-base font-elegant text-gradient">Financial Reports</h1>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-wrap items-center gap-2 sm:gap-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button variant="outline" className="glass-card border-refined hover-glow text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Period</span>
                  <span className="sm:hidden">Period</span>
                </Button>
                <Button variant="outline" className="glass-card border-refined hover-glow text-xs sm:text-sm">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filter</span>
                  <span className="sm:hidden">Filter</span>
                </Button>
                <Button className="btn-premium text-xs sm:text-sm">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Export Reports</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Enhanced Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <ArrowUpRight className="h-5 w-5 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$46.6M</div>
                  <p className="text-sm text-green-600 font-medium">+25.8% vs last year</p>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "89%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Net Profit
                  </CardTitle>
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <DollarSign className="h-5 w-5 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$16.1M</div>
                  <p className="text-sm text-green-600 font-medium">34.5% margin</p>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "92%" }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    ROI
                  </CardTitle>
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Target className="h-5 w-5 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">24.8%</div>
                  <p className="text-sm text-green-600 font-medium">+4.8% vs benchmark</p>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 1.5, delay: 0.9 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Assets
                  </CardTitle>
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <TrendingUp className="h-5 w-5 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$78.4M</div>
                  <p className="text-sm text-green-600 font-medium">+18.7% growth</p>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1.5, delay: 1.1 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Advanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Revenue & Profit Trend */}
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
                      <CardTitle>Financial Performance Trend</CardTitle>
                      <CardDescription>
                        12-month revenue, expenses, and profit analysis
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyTrends}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            `$${(value / 1000000).toFixed(2)}M`, 
                            name.charAt(0).toUpperCase() + name.slice(1)
                          ]}
                          labelStyle={{ color: '#374151' }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Bar dataKey="expenses" fill="#EF4444" radius={[2, 2, 0, 0]} />
                        <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Revenue Sources */}
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
                      <CardTitle>Revenue Stream Analysis</CardTitle>
                      <CardDescription>
                        Income distribution and growth rates
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={revenueStreams}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="percentage"
                        >
                          {revenueStreams.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => [
                            `${value}% ($${(props.payload.amount / 1000000).toFixed(1)}M)`, 
                            'Revenue Share'
                          ]}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
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

          {/* KPI Dashboard & Quarterly Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* KPI Metrics */}
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
                      <Activity className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Key Performance Indicators</CardTitle>
                      <CardDescription>
                        Critical financial metrics and targets
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {kpiMetrics.map((kpi, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{kpi.name}</h4>
                          <Badge 
                            variant={kpi.trend === 'up' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {kpi.trend === 'up' ? '↗' : '↘'} {kpi.trend === 'up' ? 'Above' : 'Below'} Target
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-gradient">
                            {kpi.name.includes('Ratio') ? kpi.current.toFixed(1) : `${kpi.current}%`}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Target: {kpi.name.includes('Ratio') ? kpi.target.toFixed(1) : `${kpi.target}%`}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full rounded-full ${
                              kpi.trend === 'up' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                              'bg-gradient-to-r from-orange-500 to-orange-600'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min((kpi.current / (kpi.target * 1.2)) * 100, 100)}%` 
                            }}
                            transition={{ duration: 1.5, delay: 1.0 + index * 0.1 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quarterly Performance */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 1.0 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Globe className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Quarterly Financial Summary</CardTitle>
                      <CardDescription>
                        Year-over-year quarterly performance
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={quarterlyFinancials}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="quarter" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            `$${(value / 1000000).toFixed(1)}M`,
                            name.charAt(0).toUpperCase() + name.slice(1)
                          ]}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Enhanced Financial Reports */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 1.2 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <FileText className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Executive Financial Statements</CardTitle>
                      <CardDescription>
                        Comprehensive financial reports and strategic analysis
                      </CardDescription>
                    </div>
                  </div>
                  <Button className="btn-premium">
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reportCategories.map((report, index) => (
                    <motion.div 
                      key={report.id}
                      className="glass-card p-6 rounded-2xl hover-lift group relative overflow-hidden"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <motion.div 
                            className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-refined"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                          >
                            <FileText className="w-6 h-6 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{report.title}</h3>
                            <p className="text-sm text-muted-foreground">{report.period}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800" variant="outline">
                          {report.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {report.title === "Profit & Loss Statement" && (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">Revenue</p>
                              <p className="text-lg font-bold text-green-600">{report.revenue}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Net Income</p>
                              <p className="text-lg font-bold text-gradient">{report.netIncome}</p>
                            </div>
                          </>
                        )}
                        {report.title === "Balance Sheet" && (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">Assets</p>
                              <p className="text-lg font-bold text-blue-600">{report.assets}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Equity</p>
                              <p className="text-lg font-bold text-gradient">{report.equity}</p>
                            </div>
                          </>
                        )}
                        {report.title === "Cash Flow Statement" && (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">Operating</p>
                              <p className="text-lg font-bold text-green-600">{report.operating}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Net Cash</p>
                              <p className="text-lg font-bold text-gradient">{report.netCash}</p>
                            </div>
                          </>
                        )}
                        {report.title === "Investment Performance" && (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Return</p>
                              <p className="text-lg font-bold text-green-600">{report.totalReturn}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ROI</p>
                              <p className="text-lg font-bold text-gradient">{report.roi}</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" className="btn-premium">
                          <Eye className="w-4 h-4 mr-2" />
                          View Report
                        </Button>
                        <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                          <Download className="w-4 h-4" />
                        </Button>
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