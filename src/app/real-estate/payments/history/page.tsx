"use client";

import { motion } from "framer-motion";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  Building2,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  FileText,
  Banknote
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

export default function PaymentHistory() {
  const paymentStats = [
    { label: "Total Payments", value: "2,847", change: "+18%", trend: "up", icon: CreditCard },
    { label: "Total Amount", value: "$485,230", change: "+22%", trend: "up", icon: DollarSign },
    { label: "Success Rate", value: "97.8%", change: "+1.2%", trend: "up", icon: CheckCircle },
    { label: "Average Payment", value: "$1,705", change: "+5%", trend: "up", icon: TrendingUp }
  ];

  const paymentHistory = [
    {
      id: "PAY-2024-001",
      tenant: "Ahmed Al-Rashid",
      property: "Marina Heights - Unit 1205",
      amount: "$2,500.00",
      method: "Credit Card",
      status: "completed",
      type: "incoming",
      date: "2024-01-15",
      time: "14:30",
      reference: "REF-001-2024",
      description: "Monthly rent payment"
    },
    {
      id: "PAY-2024-002",
      tenant: "Sarah Johnson",
      property: "Downtown Plaza - Unit 304",
      amount: "$450.00",
      method: "Bank Transfer",
      status: "completed",
      type: "incoming",
      date: "2024-01-14",
      time: "13:45",
      reference: "REF-002-2024",
      description: "Maintenance fee"
    },
    {
      id: "PAY-2024-003",
      tenant: "Mohammed Hassan",
      property: "Business Bay Tower - Unit 1501",
      amount: "$3,200.00",
      method: "Digital Wallet",
      status: "completed",
      type: "incoming",
      date: "2024-01-13",
      time: "12:20",
      reference: "REF-003-2024",
      description: "Monthly rent payment"
    },
    {
      id: "PAY-2024-004",
      tenant: "Lisa Chen",
      property: "Jumeirah Residence - Unit 802",
      amount: "$180.00",
      method: "Credit Card",
      status: "failed",
      type: "incoming",
      date: "2024-01-12",
      time: "11:15",
      reference: "REF-004-2024",
      description: "Utility payment"
    },
    {
      id: "PAY-2024-005",
      tenant: "Maintenance Co.",
      property: "Various Properties",
      amount: "$1,250.00",
      method: "Bank Transfer",
      status: "completed",
      type: "outgoing",
      date: "2024-01-11",
      time: "10:30",
      reference: "REF-005-2024",
      description: "Property maintenance"
    },
    {
      id: "PAY-2024-006",
      tenant: "Omar Abdullah",
      property: "Palm Residences - Unit 601",
      amount: "$2,800.00",
      method: "Credit Card",
      status: "completed",
      type: "incoming",
      date: "2024-01-10",
      time: "16:45",
      reference: "REF-006-2024",
      description: "Monthly rent payment"
    },
    {
      id: "PAY-2024-007",
      tenant: "Emma Wilson",
      property: "City Center - Unit 1102",
      amount: "$320.00",
      method: "Bank Transfer",
      status: "pending",
      type: "incoming",
      date: "2024-01-09",
      time: "09:20",
      reference: "REF-007-2024",
      description: "Service charge"
    },
    {
      id: "PAY-2024-008",
      tenant: "Hassan Ali",
      property: "Marina Walk - Unit 405",
      amount: "$2,200.00",
      method: "Digital Wallet",
      status: "completed",
      type: "incoming",
      date: "2024-01-08",
      time: "15:10",
      reference: "REF-008-2024",
      description: "Monthly rent payment"
    }
  ];

  const monthlyData = [
    { month: "Jan", income: 45230, expenses: 12450 },
    { month: "Feb", income: 52100, expenses: 15200 },
    { month: "Mar", income: 48900, expenses: 13800 },
    { month: "Apr", income: 55600, expenses: 16100 },
    { month: "May", income: 51200, expenses: 14900 },
    { month: "Jun", income: 58300, expenses: 17200 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "pending": return "text-yellow-600";
      case "failed": return "text-red-600";
      case "cancelled": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "pending": return Clock;
      case "failed": return XCircle;
      case "cancelled": return AlertCircle;
      default: return Clock;
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === "incoming" ? ArrowDownLeft : ArrowUpRight;
  };

  const getTransactionColor = (type: string) => {
    return type === "incoming" ? "text-green-600" : "text-blue-600";
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Credit Card": return CreditCard;
      case "Bank Transfer": return Banknote;
      case "Digital Wallet": return DollarSign;
      default: return CreditCard;
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : "text-red-600";
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
                    <h1 className="text-2xl font-bold text-gradient">Payment History</h1>
                    <p className="text-sm text-muted-foreground">Complete record of all property payments</p>
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
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
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
              const TrendIcon = getTrendIcon(stat.trend);
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
                        <TrendIcon className={`w-4 h-4 ${getTrendColor(stat.trend)}`} />
                        <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
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

          {/* Monthly Overview */}
          <motion.div 
            className="mb-12"
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
                    <TrendingUp className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle>Monthly Payment Overview</CardTitle>
                    <CardDescription>
                      Income vs expenses trend over the last 6 months
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-4">
                  {monthlyData.map((data, index) => (
                    <motion.div 
                      key={data.month}
                      className="glass-card p-4 rounded-xl text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <h4 className="font-semibold text-foreground mb-2">{data.month}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-600">Income</span>
                          <span className="font-medium">${(data.income / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-red-600">Expenses</span>
                          <span className="font-medium">${(data.expenses / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                            style={{ width: `${(data.income / 60000) * 100}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Search */}
          <motion.div 
            className="glass-card p-6 rounded-2xl mb-8"
            {...fadeInUp}
            transition={{ delay: 0.6 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search payments by ID, tenant, or property..." 
                    className="pl-10 glass-card border-0"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select>
                  <SelectTrigger className="w-40 glass-card border-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40 glass-card border-0">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="incoming">Incoming</SelectItem>
                    <SelectItem value="outgoing">Outgoing</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40 glass-card border-0">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="digital-wallet">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Payment History Table */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.8 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Payment Records</CardTitle>
                    <CardDescription>
                      Complete history of all property payments
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {paymentHistory.length} payments
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/20">
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Payment ID</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Tenant/Vendor</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Property</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Method</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment, index) => {
                        const StatusIcon = getStatusIcon(payment.status);
                        const TransactionIcon = getTransactionIcon(payment.type);
                        const MethodIcon = getMethodIcon(payment.method);
                        return (
                          <motion.tr 
                            key={payment.id}
                            className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + index * 0.05 }}
                          >
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <TransactionIcon className={`w-4 h-4 ${getTransactionColor(payment.type)}`} />
                                <span className="font-medium text-foreground">{payment.id}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <span className="text-foreground font-medium">{payment.tenant}</span>
                                  <p className="text-xs text-muted-foreground">{payment.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{payment.property}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <span className={`font-semibold ${payment.type === 'incoming' ? 'text-green-600' : 'text-blue-600'}`}>
                                {payment.type === 'incoming' ? '+' : '-'}{payment.amount}
                              </span>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <MethodIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{payment.method}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <StatusIcon className={`w-4 h-4 ${getStatusColor(payment.status)}`} />
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusBg(payment.status)}`}
                                >
                                  {payment.status}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <span className="text-sm text-muted-foreground">{payment.date}</span>
                                  <p className="text-xs text-muted-foreground">{payment.time}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover-glow">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover-glow">
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover-glow">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary/20">
                  <div className="text-sm text-muted-foreground">
                    Showing 1-8 of {paymentHistory.length} payments
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="glass-card border-0 hover-glow">
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="glass-card border-0 hover-glow">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="glass-card border-0 hover-glow">
                      2
                    </Button>
                    <Button variant="outline" size="sm" className="glass-card border-0 hover-glow">
                      3
                    </Button>
                    <Button variant="outline" size="sm" className="glass-card border-0 hover-glow">
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 