"use client";

import { motion } from "framer-motion";
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Send,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  Building2,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Banknote,
  Smartphone,
  Globe,
  Shield,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function PaymentProcessing() {
  const paymentStats = [
    { label: "Total Processed", value: "$125,430", change: "+15%", trend: "up", icon: DollarSign },
    { label: "Pending Payments", value: "12", change: "-8%", trend: "down", icon: Clock },
    { label: "Success Rate", value: "98.5%", change: "+2%", trend: "up", icon: CheckCircle },
    { label: "Failed Payments", value: "3", change: "-50%", trend: "down", icon: AlertCircle }
  ];

  const paymentMethods = [
    { name: "Credit Card", icon: CreditCard, count: 156, percentage: 65, color: "bg-blue-500" },
    { name: "Bank Transfer", icon: Banknote, count: 89, percentage: 25, color: "bg-green-500" },
    { name: "Digital Wallet", icon: Smartphone, count: 34, percentage: 8, color: "bg-purple-500" },
    { name: "Online Banking", icon: Globe, count: 12, percentage: 2, color: "bg-orange-500" }
  ];

  const recentTransactions = [
    {
      id: "TXN-2024-001",
      tenant: "Ahmed Al-Rashid",
      property: "Marina Heights - Unit 1205",
      amount: "$2,500.00",
      method: "Credit Card",
      status: "completed",
      date: "2024-01-15",
      time: "14:30",
      type: "incoming"
    },
    {
      id: "TXN-2024-002",
      tenant: "Sarah Johnson",
      property: "Downtown Plaza - Unit 304",
      amount: "$450.00",
      method: "Bank Transfer",
      status: "processing",
      date: "2024-01-15",
      time: "13:45",
      type: "incoming"
    },
    {
      id: "TXN-2024-003",
      tenant: "Mohammed Hassan",
      property: "Business Bay Tower - Unit 1501",
      amount: "$3,200.00",
      method: "Digital Wallet",
      status: "completed",
      date: "2024-01-15",
      time: "12:20",
      type: "incoming"
    },
    {
      id: "TXN-2024-004",
      tenant: "Lisa Chen",
      property: "Jumeirah Residence - Unit 802",
      amount: "$180.00",
      method: "Credit Card",
      status: "failed",
      date: "2024-01-15",
      time: "11:15",
      type: "incoming"
    },
    {
      id: "TXN-2024-005",
      tenant: "Maintenance Co.",
      property: "Various Properties",
      amount: "$1,250.00",
      method: "Bank Transfer",
      status: "completed",
      date: "2024-01-15",
      time: "10:30",
      type: "outgoing"
    }
  ];

  const pendingPayments = [
    {
      id: "PAY-2024-001",
      tenant: "Omar Abdullah",
      property: "Palm Residences - Unit 601",
      amount: "$2,800.00",
      dueDate: "2024-01-20",
      type: "Rent",
      priority: "high"
    },
    {
      id: "PAY-2024-002",
      tenant: "Emma Wilson",
      property: "City Center - Unit 1102",
      amount: "$320.00",
      dueDate: "2024-01-22",
      type: "Maintenance",
      priority: "medium"
    },
    {
      id: "PAY-2024-003",
      tenant: "Hassan Ali",
      property: "Marina Walk - Unit 405",
      amount: "$2,200.00",
      dueDate: "2024-01-25",
      type: "Rent",
      priority: "low"
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === "incoming" ? ArrowDownLeft : ArrowUpRight;
  };

  const getTransactionColor = (type: string) => {
    return type === "incoming" ? "text-green-600" : "text-blue-600";
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
                    <CreditCard className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Payment Processing</h1>
                    <p className="text-sm text-muted-foreground">Manage and process property payments</p>
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
                  <Download className="w-4 h-4 mr-2" />
                  Export
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
            {paymentStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div key={index} variants={fadeInUp} className="hover-lift">
                  <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <motion.div
                        className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-muted-foreground">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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
                    {paymentMethods.map((method, index) => {
                      const IconComponent = method.icon;
                      return (
                        <motion.div 
                          key={index}
                          className="glass-card p-4 rounded-xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 ${method.color} rounded-lg flex items-center justify-center`}>
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-semibold text-foreground">{method.name}</span>
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">{method.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div 
                              className={`h-2 rounded-full ${method.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${method.percentage}%` }}
                              transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">{method.percentage}% of total</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending Payments */}
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
                      <Clock className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Pending Payments</CardTitle>
                      <CardDescription>
                        Awaiting processing
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPayments.map((payment, index) => (
                      <motion.div 
                        key={payment.id}
                        className="glass-card p-4 rounded-xl hover-lift group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-foreground">{payment.id}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(payment.priority)}`}
                          >
                            {payment.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{payment.tenant}</p>
                        <p className="text-xs text-muted-foreground mb-3">{payment.property}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gradient">{payment.amount}</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{payment.dueDate}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" className="flex-1 btn-premium">
                            Process
                          </Button>
                          <Button size="sm" variant="outline" className="glass-card border-0">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
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
                      <Shield className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>
                        Common payment tasks
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full btn-premium justify-start">
                      <Plus className="w-4 h-4 mr-3" />
                      Process New Payment
                    </Button>
                    <Button variant="outline" className="w-full glass-card border-0 hover-glow justify-start">
                      <Send className="w-4 h-4 mr-3" />
                      Send Payment Reminder
                    </Button>
                    <Button variant="outline" className="w-full glass-card border-0 hover-glow justify-start">
                      <Download className="w-4 h-4 mr-3" />
                      Generate Report
                    </Button>
                    <Button variant="outline" className="w-full glass-card border-0 hover-glow justify-start">
                      <Eye className="w-4 h-4 mr-3" />
                      View Failed Payments
                    </Button>
                    <Button variant="outline" className="w-full glass-card border-0 hover-glow justify-start">
                      <Shield className="w-4 h-4 mr-3" />
                      Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Transactions */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 1.0 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Recent Transactions</CardTitle>
                    <CardDescription>
                      Latest payment activities
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Select>
                      <SelectTrigger className="w-40 glass-card border-0">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="incoming">Incoming</SelectItem>
                        <SelectItem value="outgoing">Outgoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="glass-card border-0 hover-glow">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => {
                    const TransactionIcon = getTransactionIcon(transaction.type);
                    return (
                      <motion.div 
                        key={transaction.id}
                        className="glass-card p-6 rounded-2xl hover-lift group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTransactionColor(transaction.type) === 'text-green-600' ? 'bg-green-100' : 'bg-blue-100'}`}>
                              <TransactionIcon className={`w-6 h-6 ${getTransactionColor(transaction.type)}`} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-foreground">{transaction.id}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusBg(transaction.status)}`}
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{transaction.tenant}</p>
                              <p className="text-xs text-muted-foreground">{transaction.property}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gradient mb-1">{transaction.amount}</div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{transaction.method}</span>
                              <span>•</span>
                              <span>{transaction.date} {transaction.time}</span>
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