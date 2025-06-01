"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Download,
  CreditCard
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

export default function RentCollection() {
  const rentPayments = [
    {
      id: "RNT-001",
      tenant: "Ahmed Al-Mansouri",
      property: "Marina Tower Complex",
      unit: "Unit 15A",
      amount: "$4,500",
      dueDate: "2024-01-01",
      paidDate: "2024-01-01",
      status: "paid",
      method: "Bank Transfer",
      lateFee: "$0",
      daysOverdue: 0
    },
    {
      id: "RNT-002",
      tenant: "Sarah Johnson",
      property: "Business Bay Office Center",
      unit: "Floor 8, Suite 801",
      amount: "$12,000",
      dueDate: "2024-01-01",
      paidDate: "2023-12-28",
      status: "paid",
      method: "Check",
      lateFee: "$0",
      daysOverdue: 0
    },
    {
      id: "RNT-003",
      tenant: "Maria Garcia",
      property: "Downtown Retail Plaza",
      unit: "Shop 5",
      amount: "$8,500",
      dueDate: "2024-01-01",
      paidDate: null,
      status: "overdue",
      method: null,
      lateFee: "$425",
      daysOverdue: 20
    },
    {
      id: "RNT-004",
      tenant: "David Chen",
      property: "Jumeirah Villa Estate",
      unit: "Villa 12",
      amount: "$25,000",
      dueDate: "2024-01-01",
      paidDate: "2024-01-02",
      status: "paid",
      method: "Wire Transfer",
      lateFee: "$0",
      daysOverdue: 0
    },
    {
      id: "RNT-005",
      tenant: "Emily Rodriguez",
      property: "Marina Tower Complex",
      unit: "Unit 22B",
      amount: "$4,200",
      dueDate: "2024-01-15",
      paidDate: null,
      status: "pending",
      method: null,
      lateFee: "$0",
      daysOverdue: 0
    }
  ];

  const collectionMetrics = [
    {
      metric: "Collection Rate",
      value: "94.2%",
      trend: "+2.1%",
      status: "excellent"
    },
    {
      metric: "Avg Collection Time",
      value: "2.3 days",
      trend: "-0.5 days",
      status: "good"
    },
    {
      metric: "Late Payment Rate",
      value: "5.8%",
      trend: "-1.2%",
      status: "good"
    },
    {
      metric: "Outstanding Amount",
      value: "$42,500",
      trend: "-$8,200",
      status: "improving"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "text-green-600";
      case "overdue": return "text-red-600";
      case "pending": return "text-yellow-600";
      case "partial": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "partial": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return CheckCircle;
      case "overdue": return AlertTriangle;
      case "pending": return Clock;
      case "partial": return Clock;
      default: return Clock;
    }
  };

  const getOverdueUrgency = (days: number) => {
    if (days === 0) return "text-green-600";
    if (days <= 7) return "text-yellow-600";
    if (days <= 30) return "text-orange-600";
    return "text-red-600";
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
                    <h1 className="text-2xl font-bold text-gradient">Rent Collection</h1>
                    <p className="text-sm text-muted-foreground">Payment tracking and collection management</p>
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
                  Record Payment
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
                    Monthly Collected
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$2.64M</div>
                  <p className="text-sm text-green-600 font-medium">94.2% collection rate</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-red-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overdue Amount
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$42.5K</div>
                  <p className="text-sm text-red-600 font-medium">18 overdue payments</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Payments
                  </CardTitle>
                  <Clock className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">12</div>
                  <p className="text-sm text-blue-600 font-medium">Due this week</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Late Fees
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$3.2K</div>
                  <p className="text-sm text-green-600 font-medium">-15% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Collection Metrics */}
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
                      <TrendingUp className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Collection Metrics</CardTitle>
                      <CardDescription>
                        Key performance indicators
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {collectionMetrics.map((metric, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{metric.metric}</h4>
                          <Badge 
                            variant={metric.status === "excellent" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {metric.status}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-gradient mb-1">{metric.value}</p>
                        <p className="text-sm text-green-600 font-medium">{metric.trend}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Methods */}
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
                      <CreditCard className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Payment Methods & Trends</CardTitle>
                      <CardDescription>
                        Collection methods and monthly trends
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Payment Methods</h4>
                      {[
                        { method: "Bank Transfer", percentage: 45, amount: "$1.19M", color: "bg-blue-500" },
                        { method: "Check", percentage: 30, amount: "$792K", color: "bg-green-500" },
                        { method: "Wire Transfer", percentage: 20, amount: "$528K", color: "bg-purple-500" },
                        { method: "Cash", percentage: 5, amount: "$132K", color: "bg-orange-500" }
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
                            <span className="font-medium text-foreground">{item.method}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{item.percentage}%</p>
                            <p className="text-sm text-muted-foreground">{item.amount}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Monthly Trends</h4>
                      <div className="h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <TrendingUp className="w-12 h-12 text-primary/40 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Collection trend chart</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Rent Payments List */}
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
                      <CardTitle className="text-xl">Rent Payments</CardTitle>
                      <CardDescription>
                        Payment status and collection tracking
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
                  {rentPayments.map((payment, index) => {
                    const StatusIcon = getStatusIcon(payment.status);
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
                              <StatusIcon className="w-6 h-6 text-white" />
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
                                {payment.daysOverdue > 0 && (
                                  <Badge 
                                    className={`text-xs ${getOverdueUrgency(payment.daysOverdue) === 'text-red-600' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}
                                    variant="outline"
                                  >
                                    {payment.daysOverdue} days overdue
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium text-foreground mb-1">{payment.tenant}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <span>{payment.property} - {payment.unit}</span>
                                <span>•</span>
                                <span>Due: {payment.dueDate}</span>
                                {payment.paidDate && (
                                  <>
                                    <span>•</span>
                                    <span>Paid: {payment.paidDate}</span>
                                  </>
                                )}
                              </div>
                              {payment.method && (
                                <p className="text-sm text-muted-foreground">Payment Method: {payment.method}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-2 gap-4 text-center mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Rent Amount</p>
                                <p className="text-lg font-bold text-gradient">{payment.amount}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Late Fee</p>
                                <p className={`font-bold ${payment.lateFee === '$0' ? 'text-green-600' : 'text-red-600'}`}>
                                  {payment.lateFee}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button size="sm" className="btn-premium">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                <Edit className="w-4 h-4 mr-2" />
                                {payment.status === 'overdue' ? 'Collect' : 'Edit'}
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