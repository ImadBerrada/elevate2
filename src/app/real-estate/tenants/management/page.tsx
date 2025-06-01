"use client";

import { motion } from "framer-motion";
import { 
  UserCheck, 
  Users, 
  Home, 
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock
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

export default function TenantManagement() {
  const tenants = [
    {
      id: 1,
      name: "Ahmed Al-Mansouri",
      email: "ahmed.mansouri@email.com",
      phone: "+971 50 123 4567",
      property: "Marina Tower Complex",
      unit: "Unit 15A",
      leaseStart: "2023-06-01",
      leaseEnd: "2024-06-01",
      monthlyRent: "$4,500",
      status: "active",
      paymentStatus: "current",
      lastPayment: "2024-01-01"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+971 55 987 6543",
      property: "Business Bay Office Center",
      unit: "Floor 8, Suite 801",
      leaseStart: "2023-03-15",
      leaseEnd: "2025-03-15",
      monthlyRent: "$12,000",
      status: "active",
      paymentStatus: "current",
      lastPayment: "2024-01-01"
    },
    {
      id: 3,
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      phone: "+971 52 456 7890",
      property: "Downtown Retail Plaza",
      unit: "Shop 5",
      leaseStart: "2023-09-01",
      leaseEnd: "2024-09-01",
      monthlyRent: "$8,500",
      status: "active",
      paymentStatus: "overdue",
      lastPayment: "2023-12-01"
    },
    {
      id: 4,
      name: "David Chen",
      email: "david.chen@email.com",
      phone: "+971 56 234 5678",
      property: "Jumeirah Villa Estate",
      unit: "Villa 12",
      leaseStart: "2022-12-01",
      leaseEnd: "2024-12-01",
      monthlyRent: "$25,000",
      status: "active",
      paymentStatus: "current",
      lastPayment: "2024-01-01"
    },
    {
      id: 5,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "+971 58 345 6789",
      property: "Marina Tower Complex",
      unit: "Unit 22B",
      leaseStart: "2023-01-15",
      leaseEnd: "2024-01-15",
      monthlyRent: "$4,200",
      status: "expiring",
      paymentStatus: "current",
      lastPayment: "2024-01-01"
    }
  ];

  const leaseMetrics = [
    {
      metric: "Average Lease Duration",
      value: "18 months",
      trend: "+2 months",
      status: "good"
    },
    {
      metric: "Renewal Rate",
      value: "87.3%",
      trend: "+5.2%",
      status: "excellent"
    },
    {
      metric: "Occupancy Rate",
      value: "94.8%",
      trend: "+2.1%",
      status: "excellent"
    },
    {
      metric: "Average Rent/SqFt",
      value: "$42.50",
      trend: "+$3.20",
      status: "good"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600";
      case "expiring": return "text-yellow-600";
      case "expired": return "text-red-600";
      case "pending": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "expiring": return "bg-yellow-100 text-yellow-800";
      case "expired": return "bg-red-100 text-red-800";
      case "pending": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "current": return "text-green-600";
      case "overdue": return "text-red-600";
      case "pending": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getPaymentStatusBg = (status: string) => {
    switch (status) {
      case "current": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "current": return CheckCircle;
      case "overdue": return AlertTriangle;
      case "pending": return Clock;
      default: return Clock;
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
                    <UserCheck className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Tenant Management</h1>
                    <p className="text-sm text-muted-foreground">Comprehensive tenant relationship management</p>
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
                    placeholder="Search tenants..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tenant
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
                    Total Tenants
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">342</div>
                  <p className="text-sm text-green-600 font-medium">+18 this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Leases
                  </CardTitle>
                  <Home className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">298</div>
                  <p className="text-sm text-green-600 font-medium">87.1% occupancy</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$2.8M</div>
                  <p className="text-sm text-green-600 font-medium">+12.5% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expiring Leases
                  </CardTitle>
                  <Calendar className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">24</div>
                  <p className="text-sm text-yellow-600 font-medium">Next 90 days</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Lease Metrics */}
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
                      <Home className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Lease Metrics</CardTitle>
                      <CardDescription>
                        Key leasing performance indicators
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaseMetrics.map((metric, index) => (
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

            {/* Payment Status Overview */}
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
                      <DollarSign className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Payment Status Overview</CardTitle>
                      <CardDescription>
                        Rent collection and payment tracking
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Payment Status</h4>
                      {[
                        { status: "Current", count: 285, percentage: 83.3, color: "bg-green-500" },
                        { status: "Overdue", count: 42, percentage: 12.3, color: "bg-red-500" },
                        { status: "Pending", count: 15, percentage: 4.4, color: "bg-yellow-500" }
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
                            <span className="font-medium text-foreground">{item.status}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{item.count}</p>
                            <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Collection Rate</h4>
                      <div className="h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <DollarSign className="w-12 h-12 text-primary/40 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Collection chart</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tenant List */}
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
                    <Users className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Tenant Directory</CardTitle>
                    <CardDescription>
                      Manage tenant information and lease details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenants.map((tenant, index) => {
                    const PaymentIcon = getPaymentStatusIcon(tenant.paymentStatus);
                    return (
                      <motion.div 
                        key={tenant.id}
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
                              <UserCheck className="w-6 h-6 text-white" />
                            </motion.div>
                            
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{tenant.name}</h3>
                                <Badge 
                                  className={`text-xs ${getStatusBg(tenant.status)}`}
                                  variant="outline"
                                >
                                  {tenant.status}
                                </Badge>
                                <Badge 
                                  className={`text-xs ${getPaymentStatusBg(tenant.paymentStatus)}`}
                                  variant="outline"
                                >
                                  {tenant.paymentStatus}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4" />
                                  <span>{tenant.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{tenant.phone}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{tenant.property} - {tenant.unit}</span>
                                </div>
                                <span>•</span>
                                <span>Lease: {tenant.leaseStart} to {tenant.leaseEnd}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-2 gap-6 text-center mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                                <p className="text-lg font-bold text-gradient">{tenant.monthlyRent}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Last Payment</p>
                                <p className="text-lg font-bold text-foreground">{tenant.lastPayment}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button size="sm" className="btn-premium">
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </Button>
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
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