"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Calendar,
  Bell,
  Search,
  Settings,
  Plus,
  ArrowUpRight,
  Sparkles,
  Zap,
  PieChart,
  Activity,
  Target,
  Globe,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Legend
} from 'recharts';

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

const scaleIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
};

// Chart data
const revenueData = [
  { month: 'Jan', revenue: 3200000, profit: 1100000, expenses: 2100000 },
  { month: 'Feb', revenue: 3800000, profit: 1500000, expenses: 2300000 },
  { month: 'Mar', revenue: 4100000, profit: 1600000, expenses: 2500000 },
  { month: 'Apr', revenue: 3900000, profit: 1500000, expenses: 2400000 },
  { month: 'May', revenue: 4300000, profit: 1700000, expenses: 2600000 },
  { month: 'Jun', revenue: 4600000, profit: 1800000, expenses: 2800000 },
  { month: 'Jul', revenue: 4800000, profit: 1950000, expenses: 2850000 },
  { month: 'Aug', revenue: 5100000, profit: 2100000, expenses: 3000000 },
  { month: 'Sep', revenue: 5300000, profit: 2200000, expenses: 3100000 },
  { month: 'Oct', revenue: 5600000, profit: 2400000, expenses: 3200000 },
  { month: 'Nov', revenue: 5800000, profit: 2500000, expenses: 3300000 },
  { month: 'Dec', revenue: 6200000, profit: 2700000, expenses: 3500000 }
];

const portfolioData = [
  { name: 'Technology', value: 35, amount: 4340000, color: '#3B82F6' },
  { name: 'Real Estate', value: 25, amount: 3100000, color: '#10B981' },
  { name: 'Healthcare', value: 20, amount: 2480000, color: '#8B5CF6' },
  { name: 'Energy', value: 12, amount: 1490000, color: '#F59E0B' },
  { name: 'Emerging Markets', value: 8, amount: 990000, color: '#EF4444' }
];

const performanceData = [
  { name: 'ELEVATE', performance: 94, target: 90, color: '#3B82F6' },
  { name: 'Real Estate', performance: 87, target: 85, color: '#10B981' },
  { name: 'MARAH', performance: 92, target: 88, color: '#8B5CF6' },
  { name: 'ALBARQ', performance: 78, target: 75, color: '#F59E0B' }
];

const globalMetrics = [
  { region: 'North America', revenue: 45, growth: 15.2 },
  { region: 'Europe', revenue: 30, growth: 12.8 },
  { region: 'Asia Pacific', revenue: 20, growth: 22.5 },
  { region: 'Middle East', revenue: 5, growth: 18.7 }
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const { isOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? 'ml-0' : 'ml-0'}`}>
        {/* Header */}
        <motion.header 
          className="glass-header sticky top-0 z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                {...scaleIn}
                transition={{ delay: 0.1 }}
              >
                <BurgerMenu />
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-elegant text-gradient">Executive Dashboard</h1>
                    <p className="text-sm text-muted-foreground font-refined">Real-time business intelligence</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search insights..." 
                    className="pl-10 w-64 glass-card border-refined focus-premium text-refined"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="icon" className="glass-card border-refined hover-glow">
                    <Bell className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="icon" className="glass-card border-refined hover-glow">
                    <Settings className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Avatar className="ring-1 ring-primary/20 ring-offset-1">
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback className="gradient-primary text-white text-refined">AD</AvatarFallback>
                  </Avatar>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Dashboard Content */}
        <main className="flex-1 container mx-auto px-6 py-6">
          {/* Welcome Section */}
          <motion.div 
            className="mb-8"
            {...fadeInUp}
          >
            <div className="flex items-center space-x-2 mb-3">
              <motion.div
                className="w-6 h-6 gradient-primary rounded-md flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-3 h-3 text-white" />
              </motion.div>
              <h2 className="text-2xl font-prestigious text-gradient">
                ELEVATE Investment Group - Strategic Overview
              </h2>
            </div>
            <p className="text-refined text-muted-foreground">
              Comprehensive business intelligence and performance analytics across all investment portfolios.
            </p>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-refined bg-gradient-to-br from-blue-50/60 to-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-refined text-muted-foreground">
                    Total Portfolio Value
                  </CardTitle>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                  >
                    <TrendingUp className="h-4 w-4 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-prestigious text-gradient mb-2">$62.4M</div>
                  <div className="flex items-center text-sm text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span className="font-refined">+15.2% YTD</span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-refined bg-gradient-to-br from-green-50/60 to-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-refined text-muted-foreground">
                    Active Investments
                  </CardTitle>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                  >
                    <Building2 className="h-4 w-4 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-prestigious text-gradient mb-2">247</div>
                  <div className="flex items-center text-sm text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span className="font-refined">+23 new this quarter</span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "92%" }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-refined bg-gradient-to-br from-purple-50/60 to-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-refined text-muted-foreground">
                    Monthly Revenue
                  </CardTitle>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                  >
                    <DollarSign className="h-4 w-4 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-prestigious text-gradient mb-2">$6.2M</div>
                  <div className="flex items-center text-sm text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span className="font-refined">+18.7% from last month</span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ duration: 1.5, delay: 0.9 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-refined bg-gradient-to-br from-orange-50/60 to-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-refined text-muted-foreground">
                    Performance Index
                  </CardTitle>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                  >
                    <Target className="h-4 w-4 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-prestigious text-gradient mb-2">94.2%</div>
                  <div className="flex items-center text-sm text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span className="font-refined">+5.8% above target</span>
                  </div>
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend Chart */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <BarChart3 className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg font-elegant">Revenue & Profit Trend</CardTitle>
                      <CardDescription className="text-refined">
                        12-month financial performance overview
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                        <Tooltip 
                          formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, '']}
                          labelStyle={{ color: '#374151' }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Portfolio Distribution */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <PieChart className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg font-elegant">Portfolio Distribution</CardTitle>
                      <CardDescription className="text-refined">
                        Investment allocation by sector
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={portfolioData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {portfolioData.map((entry, index) => (
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

          {/* Performance Metrics & Global Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Performance Metrics */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Activity className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg font-elegant">Business Unit Performance</CardTitle>
                      <CardDescription className="text-refined">
                        Performance vs targets across divisions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={performanceData}>
                        <RadialBar dataKey="performance" cornerRadius={10} fill="#3B82F6" />
                        <Tooltip 
                          formatter={(value: number) => [`${value}%`, 'Performance']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Global Revenue Distribution */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Globe className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg font-elegant">Global Revenue Distribution</CardTitle>
                      <CardDescription className="text-refined">
                        Regional performance and growth rates
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={globalMetrics} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" stroke="#6B7280" fontSize={12} />
                        <YAxis dataKey="region" type="category" stroke="#6B7280" fontSize={12} width={100} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === 'revenue' ? `${value}%` : `+${value}%`,
                            name === 'revenue' ? 'Revenue Share' : 'Growth Rate'
                          ]}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="growth" fill="#10B981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Enhanced Business Units Overview */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.7 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Briefcase className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl font-elegant">Strategic Business Units</CardTitle>
                      <CardDescription className="text-refined">
                        Comprehensive performance analysis across all divisions
                      </CardDescription>
                    </div>
                  </div>
                  <Button className="btn-premium">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Unit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { 
                      name: "ELEVATE Investment", 
                      revenue: "$4.2M", 
                      growth: "+18.5%", 
                      status: "Excellent", 
                      color: "blue",
                      metrics: { roi: "24.8%", assets: "47", risk: "Medium" },
                      trend: [3.2, 3.8, 4.1, 3.9, 4.3, 4.2]
                    },
                    { 
                      name: "Real Estate Portfolio", 
                      revenue: "$2.8M", 
                      growth: "+12.3%", 
                      status: "Strong", 
                      color: "green",
                      metrics: { roi: "15.7%", assets: "23", risk: "Low" },
                      trend: [2.1, 2.4, 2.6, 2.5, 2.7, 2.8]
                    },
                    { 
                      name: "MARAH Delivery", 
                      revenue: "$1.5M", 
                      growth: "+25.7%", 
                      status: "Growing", 
                      color: "purple",
                      metrics: { roi: "28.9%", assets: "12", risk: "High" },
                      trend: [0.8, 1.0, 1.2, 1.3, 1.4, 1.5]
                    },
                    { 
                      name: "ALBARQ Operations", 
                      revenue: "$890K", 
                      growth: "+8.9%", 
                      status: "Stable", 
                      color: "orange",
                      metrics: { roi: "12.4%", assets: "8", risk: "Low" },
                      trend: [0.7, 0.75, 0.8, 0.82, 0.85, 0.89]
                    }
                  ].map((unit, index) => (
                    <motion.div 
                      key={index}
                      className="glass-card p-6 rounded-2xl hover-lift group border-refined relative overflow-hidden"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <motion.div 
                            className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-refined"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                          >
                            <Building2 className="w-6 h-6 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="font-elegant text-lg text-foreground">{unit.name}</h3>
                            <Badge 
                              variant="secondary"
                              className="border-refined"
                            >
                              {unit.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-prestigious text-gradient">{unit.revenue}</p>
                          <p className="text-sm text-green-600 font-refined">{unit.growth}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p className="font-bold text-foreground">{unit.metrics.roi}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Assets</p>
                          <p className="font-bold text-foreground">{unit.metrics.assets}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Risk</p>
                          <p className="font-bold text-foreground">{unit.metrics.risk}</p>
                        </div>
                      </div>

                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={unit.trend.map((value, i) => ({ value, month: i }))}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#3B82F6" 
                              strokeWidth={2}
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