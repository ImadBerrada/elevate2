"use client";

import { motion } from "framer-motion";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Eye
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

export default function AccountOverview() {
  const accounts = [
    {
      id: 1,
      name: "Primary Operating Account",
      type: "Checking",
      balance: "$2,847,500",
      currency: "USD",
      change: "+$125,000",
      changePercent: "+4.6%",
      status: "active"
    },
    {
      id: 2,
      name: "Investment Reserve Fund",
      type: "Savings",
      balance: "$8,450,000",
      currency: "USD",
      change: "+$380,000",
      changePercent: "+4.7%",
      status: "active"
    },
    {
      id: 3,
      name: "Emergency Fund",
      type: "Money Market",
      balance: "$1,200,000",
      currency: "USD",
      change: "+$15,000",
      changePercent: "+1.3%",
      status: "active"
    },
    {
      id: 4,
      name: "Foreign Exchange Account",
      type: "Multi-Currency",
      balance: "€850,000",
      currency: "EUR",
      change: "+€25,000",
      changePercent: "+3.0%",
      status: "active"
    }
  ];

  const cashFlowData = [
    {
      category: "Investment Returns",
      amount: "+$1,250,000",
      percentage: 45,
      type: "income",
      color: "bg-green-500"
    },
    {
      category: "Real Estate Revenue",
      amount: "+$850,000",
      percentage: 30,
      type: "income",
      color: "bg-blue-500"
    },
    {
      category: "Business Operations",
      amount: "+$420,000",
      percentage: 15,
      type: "income",
      color: "bg-purple-500"
    },
    {
      category: "Other Income",
      amount: "+$280,000",
      percentage: 10,
      type: "income",
      color: "bg-orange-500"
    }
  ];

  const expenses = [
    {
      category: "Operating Expenses",
      amount: "-$650,000",
      percentage: 40,
      type: "expense",
      color: "bg-red-500"
    },
    {
      category: "Investment Costs",
      amount: "-$420,000",
      percentage: 26,
      type: "expense",
      color: "bg-orange-500"
    },
    {
      category: "Administrative",
      amount: "-$325,000",
      percentage: 20,
      type: "expense",
      color: "bg-yellow-500"
    },
    {
      category: "Other Expenses",
      amount: "-$230,000",
      percentage: 14,
      type: "expense",
      color: "bg-gray-500"
    }
  ];

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
                    <Calculator className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Account Overview</h1>
                    <p className="text-sm text-muted-foreground">Comprehensive financial account management</p>
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
                  Period
                </Button>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
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
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Assets
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$13.5M</div>
                  <p className="text-sm text-green-600 font-medium">+$545K this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Net Cash Flow
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">+$1.2M</div>
                  <p className="text-sm text-green-600 font-medium">+18.5% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Accounts
                  </CardTitle>
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">4</div>
                  <p className="text-sm text-muted-foreground">Multi-currency portfolio</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Liquidity Ratio
                  </CardTitle>
                  <Wallet className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">2.8x</div>
                  <p className="text-sm text-green-600 font-medium">Excellent liquidity</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Account Balances */}
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
                      <CardTitle>Account Balances</CardTitle>
                      <CardDescription>
                        Current account positions and balances
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts.map((account, index) => (
                      <motion.div 
                        key={account.id}
                        className="glass-card p-4 rounded-xl hover-lift"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{account.name}</h4>
                            <p className="text-sm text-muted-foreground">{account.type}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {account.currency}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-gradient">{account.balance}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">{account.change}</span>
                              <span className="text-sm text-green-600">({account.changePercent})</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Cash Flow Analysis */}
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
                      <TrendingUp className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Cash Flow Analysis</CardTitle>
                      <CardDescription>
                        Income and expense breakdown
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center">
                        <ArrowUpRight className="w-4 h-4 text-green-600 mr-2" />
                        Income Sources
                      </h4>
                      <div className="space-y-3">
                        {cashFlowData.map((item, index) => (
                          <motion.div 
                            key={index}
                            className="flex items-center justify-between"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${item.color}`} />
                              <span className="text-sm font-medium text-foreground">{item.category}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">{item.amount}</p>
                              <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center">
                        <ArrowDownRight className="w-4 h-4 text-red-600 mr-2" />
                        Expense Categories
                      </h4>
                      <div className="space-y-3">
                        {expenses.map((item, index) => (
                          <motion.div 
                            key={index}
                            className="flex items-center justify-between"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${item.color}`} />
                              <span className="text-sm font-medium text-foreground">{item.category}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-red-600">{item.amount}</p>
                              <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Financial Health Metrics */}
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
                    <BarChart3 className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Financial Health Metrics</CardTitle>
                    <CardDescription>
                      Key financial performance indicators
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      metric: "Current Ratio",
                      value: "2.8",
                      description: "Current assets / Current liabilities",
                      status: "excellent",
                      trend: "+0.3"
                    },
                    {
                      metric: "Debt-to-Equity",
                      value: "0.35",
                      description: "Total debt / Total equity",
                      status: "good",
                      trend: "-0.05"
                    },
                    {
                      metric: "ROA (Return on Assets)",
                      value: "18.5%",
                      description: "Net income / Total assets",
                      status: "excellent",
                      trend: "+2.1%"
                    },
                    {
                      metric: "Cash Conversion Cycle",
                      value: "28 days",
                      description: "Time to convert investments to cash",
                      status: "good",
                      trend: "-3 days"
                    },
                    {
                      metric: "Interest Coverage",
                      value: "12.4x",
                      description: "EBIT / Interest expense",
                      status: "excellent",
                      trend: "+1.2x"
                    },
                    {
                      metric: "Working Capital",
                      value: "$4.2M",
                      description: "Current assets - Current liabilities",
                      status: "excellent",
                      trend: "+$380K"
                    }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="glass-card p-4 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{item.metric}</h4>
                        <Badge 
                          variant={item.status === "excellent" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-gradient mb-1">{item.value}</p>
                      <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      <p className="text-sm text-green-600 font-medium">{item.trend}</p>
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