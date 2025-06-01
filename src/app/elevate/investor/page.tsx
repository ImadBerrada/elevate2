"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  PieChart,
  FileText,
  Calendar,
  Mail,
  Building2,
  Target,
  MapPin,
  ArrowUpRight,
  Plus,
  Filter
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export default function ElevateInvestor() {
  const investors = [
    {
      id: 1,
      name: "Goldman Sachs",
      type: "Institutional",
      investment: "$5.2M",
      stake: "18.5%",
      joinDate: "2022-01-15",
      status: "active",
      contact: "sarah.goldman@gs.com"
    },
    {
      id: 2,
      name: "BlackRock Inc.",
      type: "Institutional",
      investment: "$3.8M",
      stake: "13.2%",
      joinDate: "2022-03-22",
      status: "active",
      contact: "investments@blackrock.com"
    },
    {
      id: 3,
      name: "Vanguard Group",
      type: "Institutional",
      investment: "$2.9M",
      stake: "10.1%",
      joinDate: "2022-06-10",
      status: "active",
      contact: "relations@vanguard.com"
    },
    {
      id: 4,
      name: "Private Equity Partners",
      type: "Private Equity",
      investment: "$2.1M",
      stake: "7.3%",
      joinDate: "2023-01-08",
      status: "active",
      contact: "partners@pep.com"
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
                    <TrendingUp className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Investor Relations</h1>
                    <p className="text-sm text-muted-foreground">Manage investor relationships and communications</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-8 py-8">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Investors
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">47</div>
                  <p className="text-sm text-green-600 font-medium">+3 this quarter</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Investment
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$28.7M</div>
                  <p className="text-sm text-green-600 font-medium">+15.2% growth</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average ROI
                  </CardTitle>
                  <Target className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">22.4%</div>
                  <p className="text-sm text-green-600 font-medium">Above target</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Funds
                  </CardTitle>
                  <PieChart className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">12</div>
                  <p className="text-sm text-muted-foreground">Investment vehicles</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Investor List */}
            <motion.div 
              className="lg:col-span-2"
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
                      <Users className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Key Investors</CardTitle>
                      <CardDescription>
                        Major stakeholders and investment partners
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investors.map((investor, index) => (
                      <motion.div 
                        key={investor.id}
                        className="glass-card p-6 rounded-2xl hover-lift group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                              <AvatarImage src={`/api/placeholder/64/64?text=${investor.name.split(' ').map(n => n[0]).join('')}`} />
                              <AvatarFallback className="gradient-primary text-white text-lg">
                                {investor.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">{investor.name}</h3>
                              <p className="text-muted-foreground">{investor.type}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium">{investor.investment}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <PieChart className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium">{investor.stake}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="default" className="mb-2">
                              {investor.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground">Since {investor.joinDate}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-border/30">
                          <Button size="sm" className="btn-premium">
                            <Mail className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                          <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                            <FileText className="w-4 h-4 mr-2" />
                            Reports
                          </Button>
                          <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions & Updates */}
            <motion.div 
              className="space-y-8"
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              {/* Quick Actions */}
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Building2 className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>
                        Investor management tools
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: FileText, label: "Generate Report" },
                    { icon: Mail, label: "Send Update" },
                    { icon: Calendar, label: "Schedule Meeting" },
                    { icon: TrendingUp, label: "Performance Review" }
                  ].map((action, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="w-full justify-start glass-card border-0 hover-glow py-6" 
                        variant="outline"
                      >
                        <action.icon className="w-4 h-4 mr-3" />
                        {action.label}
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Communications */}
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Mail className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Recent Communications</CardTitle>
                      <CardDescription>
                        Latest investor interactions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Quarterly report sent", investor: "Goldman Sachs", time: "2 hours ago" },
                      { action: "Meeting scheduled", investor: "BlackRock Inc.", time: "1 day ago" },
                      { action: "Performance update", investor: "Vanguard Group", time: "2 days ago" },
                      { action: "Investment proposal", investor: "Private Equity", time: "3 days ago" }
                    ].map((comm, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-primary/5 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <motion.div 
                          className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                          whileHover={{ scale: 1.1, rotate: 10 }}
                        >
                          <Mail className="w-5 h-5 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{comm.action}</p>
                          <p className="text-sm text-muted-foreground">{comm.investor} • {comm.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
} 