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
import { Header } from "@/components/header";
import { ProtectedRoute } from "@/components/protected-route";
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

export default function DashboardPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isDesktop && isOpen ? "ml-0" : "ml-0",
          "min-w-0"
        )}>
          <Header />

          <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
            {/* Welcome Section */}
            <motion.div 
              className="mb-6"
              {...fadeInUp}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-prestigious text-gradient mb-2">
                Welcome to ELEVATE Investment Group
              </h1>
              <p className="text-refined text-muted-foreground text-sm sm:text-base">
                Your comprehensive investment management platform with real-time analytics and insights.
              </p>
            </motion.div>

            {/* Key Metrics */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeInUp}>
                <Card className="card-premium border-refined">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      Total Portfolio Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gradient">$12.4M</div>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +15.2% from last month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="card-premium border-refined">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                      Monthly Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gradient">$6.2M</div>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +8.7% from last month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="card-premium border-refined">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                      Active Investments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gradient">247</div>
                    <p className="text-xs text-purple-600 flex items-center mt-1">
                      <Plus className="w-3 h-3 mr-1" />
                      12 new this month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="card-premium border-refined">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Users className="w-4 h-4 mr-2 text-orange-600" />
                      Active Clients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gradient">1,847</div>
                    <p className="text-xs text-orange-600 flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +5.3% growth rate
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Chart */}
              <motion.div {...scaleIn} transition={{ delay: 0.2 }}>
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="text-xl font-elegant">Revenue Overview</CardTitle>
                    <CardDescription className="text-refined">
                      Monthly revenue, profit, and expenses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="month" stroke="#6B7280" />
                          <YAxis stroke="#6B7280" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#3B82F6" 
                            fillOpacity={1} 
                            fill="url(#revenueGradient)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Portfolio Distribution */}
              <motion.div {...scaleIn} transition={{ delay: 0.3 }}>
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="text-xl font-elegant">Portfolio Distribution</CardTitle>
                    <CardDescription className="text-refined">
                      Investment allocation by sector
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={portfolioData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {portfolioData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Performance Metrics */}
            <motion.div {...scaleIn} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="text-xl font-elegant">Division Performance</CardTitle>
                  <CardDescription className="text-refined">
                    Performance vs targets across all business divisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar dataKey="performance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="target" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 