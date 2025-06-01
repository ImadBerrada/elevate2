"use client";

import { motion } from "framer-motion";
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function CashRequests() {
  const { isOpen } = useSidebar();

  const requests = [
    {
      id: "CR-001",
      requester: "John Smith",
      amount: "$50,000",
      purpose: "Technology Infrastructure",
      status: "pending",
      priority: "high",
      date: "2024-01-15",
      department: "IT"
    },
    {
      id: "CR-002",
      requester: "Sarah Johnson",
      amount: "$25,000",
      purpose: "Marketing Campaign",
      status: "approved",
      priority: "medium",
      date: "2024-01-14",
      department: "Marketing"
    },
    {
      id: "CR-003",
      requester: "Mike Davis",
      amount: "$75,000",
      purpose: "Equipment Purchase",
      status: "pending",
      priority: "high",
      date: "2024-01-13",
      department: "Operations"
    },
    {
      id: "CR-004",
      requester: "Emily Chen",
      amount: "$15,000",
      purpose: "Training Programs",
      status: "rejected",
      priority: "low",
      date: "2024-01-12",
      department: "HR"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-green-600";
      case "rejected": return "text-red-600";
      case "pending": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return CheckCircle;
      case "rejected": return XCircle;
      case "pending": return Clock;
      default: return AlertCircle;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? 'ml-0' : 'ml-0'}`}>
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
                {...fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <BurgerMenu />
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <CreditCard className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-elegant text-gradient">Cash Requests</h1>
                    <p className="text-sm text-muted-foreground font-refined">Funding Request Management</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button className="btn-premium">
                  <CreditCard className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-6 py-6">
          <motion.div 
            className="mb-8"
            {...fadeInUp}
          >
            <h2 className="text-2xl font-prestigious text-gradient mb-2">
              Cash Request Management
            </h2>
            <p className="text-refined text-muted-foreground">
              Track and manage funding requests across all investment portfolios.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span>Pending</span>
                  </CardTitle>
                  <CardDescription>Awaiting approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">8</div>
                  <p className="text-sm text-orange-600">$2.4M total</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Approved</span>
                  </CardTitle>
                  <CardDescription>Ready for disbursement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">15</div>
                  <p className="text-sm text-green-600">$5.8M total</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span>This Month</span>
                  </CardTitle>
                  <CardDescription>Total requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">23</div>
                  <p className="text-sm text-blue-600">+18% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    <span>Total Value</span>
                  </CardTitle>
                  <CardDescription>All active requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">$8.2M</div>
                  <p className="text-sm text-purple-600">Across 23 requests</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-elegant">Recent Cash Requests</CardTitle>
                    <CardDescription className="text-refined">
                      Latest funding requests and their status
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="border-refined">
                    1 New
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((request, index) => {
                    const StatusIcon = getStatusIcon(request.status);
                    return (
                      <motion.div 
                        key={request.id}
                        className="glass-card p-6 rounded-2xl hover-lift group border-refined"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <motion.div 
                              className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-refined"
                              whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                              <StatusIcon className={`w-6 h-6 ${getStatusColor(request.status)}`} />
                            </motion.div>
                            <div>
                              <h3 className="font-elegant text-lg text-foreground">{request.id}</h3>
                              <p className="text-muted-foreground">{request.purpose}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-prestigious text-gradient">{request.amount}</p>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={request.status === "approved" ? "default" : "secondary"}
                                className="border-refined"
                              >
                                {request.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{request.date}</span>
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