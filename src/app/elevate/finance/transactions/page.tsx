"use client";

import { motion } from "framer-motion";
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  RefreshCw
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

export default function Transactions() {
  const transactions = [
    {
      id: "TXN-001",
      type: "credit",
      description: "Investment Return - Tech Growth Fund",
      amount: "+$125,000",
      account: "Primary Operating",
      date: "2024-01-20",
      time: "14:30",
      status: "completed",
      category: "Investment Income"
    },
    {
      id: "TXN-002",
      type: "debit",
      description: "Property Acquisition Payment",
      amount: "-$850,000",
      account: "Investment Reserve",
      date: "2024-01-19",
      time: "10:15",
      status: "completed",
      category: "Real Estate"
    },
    {
      id: "TXN-003",
      type: "credit",
      description: "Rental Income - Marina Tower",
      amount: "+$45,000",
      account: "Primary Operating",
      date: "2024-01-18",
      time: "09:00",
      status: "completed",
      category: "Rental Income"
    },
    {
      id: "TXN-004",
      type: "debit",
      description: "Operating Expenses - Q1",
      amount: "-$125,000",
      account: "Primary Operating",
      date: "2024-01-17",
      time: "16:45",
      status: "pending",
      category: "Operations"
    },
    {
      id: "TXN-005",
      type: "credit",
      description: "Bond Interest Payment",
      amount: "+$28,500",
      account: "Investment Reserve",
      date: "2024-01-16",
      time: "11:20",
      status: "completed",
      category: "Investment Income"
    }
  ];

  const getTransactionIcon = (type: string) => {
    return type === "credit" ? ArrowUpRight : ArrowDownRight;
  };

  const getTransactionColor = (type: string) => {
    return type === "credit" ? "text-green-600" : "text-red-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
                    <CreditCard className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Transactions</h1>
                    <p className="text-sm text-muted-foreground">Financial transaction history and management</p>
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
                    placeholder="Search transactions..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Download className="w-4 h-4 mr-2" />
                  Export
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
                    Total Inflow
                  </CardTitle>
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">+$2.8M</div>
                  <p className="text-sm text-green-600 font-medium">This month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-red-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Outflow
                  </CardTitle>
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">-$1.6M</div>
                  <p className="text-sm text-red-600 font-medium">This month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Net Flow
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">+$1.2M</div>
                  <p className="text-sm text-green-600 font-medium">+75% net positive</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Transactions
                  </CardTitle>
                  <RefreshCw className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">1,247</div>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Transaction Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
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
                      <DollarSign className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Transaction Categories</CardTitle>
                      <CardDescription>
                        Breakdown by category
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: "Investment Income", amount: "$1.2M", percentage: 43, color: "bg-green-500" },
                      { category: "Real Estate", amount: "$850K", percentage: 30, color: "bg-blue-500" },
                      { category: "Operations", amount: "$420K", percentage: 15, color: "bg-purple-500" },
                      { category: "Other", amount: "$330K", percentage: 12, color: "bg-orange-500" }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
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
                      <TrendingUp className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Transaction Flow</CardTitle>
                      <CardDescription>
                        Monthly transaction volume and trends
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                      <p className="text-muted-foreground">Transaction flow chart</p>
                      <p className="text-sm text-muted-foreground">Interactive visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Transactions */}
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
                      <CreditCard className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Recent Transactions</CardTitle>
                      <CardDescription>
                        Latest financial transactions
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" className="glass-card border-0 hover-glow">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date Range
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction, index) => {
                    const TransactionIcon = getTransactionIcon(transaction.type);
                    return (
                      <motion.div 
                        key={transaction.id}
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
                              <TransactionIcon className={`w-6 h-6 ${getTransactionColor(transaction.type)}`} />
                            </motion.div>
                            
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{transaction.id}</h3>
                                <Badge 
                                  className={`text-xs ${getStatusColor(transaction.status)}`}
                                  variant="outline"
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{transaction.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>{transaction.account}</span>
                                <span>•</span>
                                <span>{transaction.category}</span>
                                <span>•</span>
                                <span>{transaction.date} {transaction.time}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${getTransactionColor(transaction.type)} mb-2`}>
                              {transaction.amount}
                            </p>
                            
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