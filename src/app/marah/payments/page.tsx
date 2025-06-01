"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Search,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle
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

export default function PaymentsManagement() {
  const payments = [
    {
      id: "PAY-001",
      customerName: "Ahmed Al-Rashid",
      orderId: "ORD-2024-001",
      amount: "$45.50",
      method: "Credit Card",
      status: "completed",
      date: "2024-01-20",
      time: "14:30",
      driverName: "Hassan Ali"
    },
    {
      id: "PAY-002",
      customerName: "Sarah Johnson",
      orderId: "ORD-2024-002",
      amount: "$32.75",
      method: "Cash",
      status: "completed",
      date: "2024-01-20",
      time: "13:45",
      driverName: "Omar Khalil"
    },
    {
      id: "PAY-003",
      customerName: "Maria Garcia",
      orderId: "ORD-2024-003",
      amount: "$67.20",
      method: "Digital Wallet",
      status: "pending",
      date: "2024-01-20",
      time: "12:15",
      driverName: "Khalid Ahmed"
    },
    {
      id: "PAY-004",
      customerName: "David Chen",
      orderId: "ORD-2024-004",
      amount: "$28.90",
      method: "Credit Card",
      status: "failed",
      date: "2024-01-20",
      time: "11:30",
      driverName: "Mahmoud Said"
    },
    {
      id: "PAY-005",
      customerName: "Emily Rodriguez",
      orderId: "ORD-2024-005",
      amount: "$54.80",
      method: "Bank Transfer",
      status: "processing",
      date: "2024-01-20",
      time: "10:45",
      driverName: "Ali Hassan"
    }
  ];

  const paymentMethods = [
    { method: "Credit Card", percentage: 45, amount: "$18.2K", color: "bg-blue-500" },
    { method: "Cash", percentage: 30, amount: "$12.1K", color: "bg-green-500" },
    { method: "Digital Wallet", percentage: 20, amount: "$8.1K", color: "bg-purple-500" },
    { method: "Bank Transfer", percentage: 5, amount: "$2.0K", color: "bg-orange-500" }
  ];

  const revenueMetrics = [
    {
      period: "Today",
      revenue: "$2,847",
      transactions: 156,
      avgOrder: "$18.25",
      growth: "+12.5%"
    },
    {
      period: "This Week",
      revenue: "$18,420",
      transactions: 1089,
      avgOrder: "$16.90",
      growth: "+8.7%"
    },
    {
      period: "This Month",
      revenue: "$78,650",
      transactions: 4523,
      avgOrder: "$17.40",
      growth: "+15.3%"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "processing": return "text-blue-600";
      case "pending": return "text-yellow-600";
      case "failed": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "processing": return Clock;
      case "pending": return Clock;
      case "failed": return AlertTriangle;
      default: return Clock;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Credit Card": return CreditCard;
      case "Cash": return DollarSign;
      case "Digital Wallet": return DollarSign;
      case "Bank Transfer": return ArrowUpRight;
      default: return DollarSign;
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
                    <DollarSign className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Payments Management</h1>
                    <p className="text-sm text-muted-foreground">Payment processing and financial analytics</p>
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
                    placeholder="Search payments..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Process Payment
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
                    Daily Revenue
                  </CardTitle>
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$2,847</div>
                  <p className="text-sm text-green-600 font-medium">+12.5% vs yesterday</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Transactions
                  </CardTitle>
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">156</div>
                  <p className="text-sm text-green-600 font-medium">Today</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Success Rate
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">94.8%</div>
                  <p className="text-sm text-green-600 font-medium">+2.1% improvement</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Order Value
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$18.25</div>
                  <p className="text-sm text-green-600 font-medium">+$1.50 vs last week</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Payment Methods */}
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
                      <CreditCard className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Payment Methods</CardTitle>
                      <CardDescription>
                        Distribution by payment type
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethods.map((method, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${method.color}`} />
                          <span className="font-medium text-foreground">{method.method}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{method.percentage}%</p>
                          <p className="text-sm text-muted-foreground">{method.amount}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Revenue Analytics */}
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
                      <CardTitle>Revenue Analytics</CardTitle>
                      <CardDescription>
                        Financial performance metrics
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    {revenueMetrics.map((metric, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <h4 className="font-semibold text-foreground mb-3">{metric.period}</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Revenue</p>
                            <p className="text-xl font-bold text-gradient">{metric.revenue}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Transactions</p>
                            <p className="font-semibold text-foreground">{metric.transactions}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Order</p>
                            <p className="font-semibold text-foreground">{metric.avgOrder}</p>
                          </div>
                          <p className="text-sm text-green-600 font-medium">{metric.growth}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Payments */}
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
                      <DollarSign className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Recent Payments</CardTitle>
                      <CardDescription>
                        Latest payment transactions and status
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" className="glass-card border-0 hover-glow">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment, index) => {
                    const StatusIcon = getStatusIcon(payment.status);
                    const MethodIcon = getMethodIcon(payment.method);
                    return (
                      <motion.div 
                        key={payment.id}
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
                              <StatusIcon className={`w-6 h-6 ${getStatusColor(payment.status)}`} />
                            </motion.div>
                            
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{payment.id}</h3>
                                <Badge 
                                  className={`text-xs ${getStatusBg(payment.status)}`}
                                  variant="outline"
                                >
                                  {payment.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Customer: {payment.customerName} • Order: {payment.orderId}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Driver: {payment.driverName}</span>
                                <span>•</span>
                                <span>{payment.date} {payment.time}</span>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <MethodIcon className="w-4 h-4" />
                                  <span>{payment.method}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gradient mb-2">{payment.amount}</p>
                            
                            <div className="flex items-center space-x-2">
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