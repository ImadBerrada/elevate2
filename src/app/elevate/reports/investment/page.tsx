"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Target,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Eye,
  Plus
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

export default function InvestmentAnalysis() {
  const investments = [
    {
      id: 1,
      name: "Technology Growth Fund",
      type: "Equity Fund",
      allocation: "35%",
      value: "$9.8M",
      return: "+28.4%",
      risk: "High",
      status: "outperforming"
    },
    {
      id: 2,
      name: "Global Bond Portfolio",
      type: "Fixed Income",
      allocation: "25%",
      value: "$7.0M",
      return: "+8.2%",
      risk: "Low",
      status: "stable"
    },
    {
      id: 3,
      name: "Real Estate Investment Trust",
      type: "REIT",
      allocation: "20%",
      value: "$5.6M",
      return: "+15.7%",
      risk: "Medium",
      status: "performing"
    },
    {
      id: 4,
      name: "Emerging Markets Fund",
      type: "International Equity",
      allocation: "15%",
      value: "$4.2M",
      return: "+22.1%",
      risk: "High",
      status: "outperforming"
    },
    {
      id: 5,
      name: "Cash & Money Market",
      type: "Cash Equivalent",
      allocation: "5%",
      value: "$1.4M",
      return: "+2.8%",
      risk: "Very Low",
      status: "stable"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "outperforming": return "text-green-600";
      case "performing": return "text-blue-600";
      case "stable": return "text-gray-600";
      case "underperforming": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Very Low": return "bg-green-100 text-green-800";
      case "Low": return "bg-blue-100 text-blue-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
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
                    <PieChart className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Investment Analysis</h1>
                    <p className="text-sm text-muted-foreground">Detailed portfolio and investment performance analysis</p>
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
                  <Plus className="w-4 h-4 mr-2" />
                  New Analysis
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
                    Total Portfolio Value
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$28.0M</div>
                  <p className="text-sm text-green-600 font-medium">+18.5% YTD</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Return
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">19.2%</div>
                  <p className="text-sm text-green-600 font-medium">Above benchmark</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Asset Classes
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">5</div>
                  <p className="text-sm text-muted-foreground">Diversified portfolio</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Risk Score
                  </CardTitle>
                  <Target className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">7.2</div>
                  <p className="text-sm text-green-600 font-medium">Moderate risk</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Investment Holdings */}
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
                    <PieChart className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Investment Holdings</CardTitle>
                    <CardDescription>
                      Detailed breakdown of portfolio investments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.map((investment, index) => (
                    <motion.div 
                      key={investment.id}
                      className="glass-card p-6 rounded-2xl hover-lift group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <motion.div 
                            className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                          >
                            <TrendingUp className="w-6 h-6 text-white" />
                          </motion.div>
                          
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{investment.name}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-sm text-muted-foreground">{investment.type}</p>
                              <Badge 
                                className={`text-xs ${getRiskColor(investment.risk)}`}
                                variant="outline"
                              >
                                {investment.risk} Risk
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Allocation</p>
                              <p className="text-lg font-bold text-gradient">{investment.allocation}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Value</p>
                              <p className="text-lg font-bold text-foreground">{investment.value}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Return</p>
                              <p className={`text-lg font-bold ${getStatusColor(investment.status)}`}>
                                {investment.return}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-4">
                            <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                              <Eye className="w-4 h-4 mr-2" />
                              Details
                            </Button>
                            <Button size="sm" className="btn-premium">
                              <Download className="w-4 h-4 mr-2" />
                              Report
                            </Button>
                          </div>
                        </div>
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