"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Calendar, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Download,
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

export default function LeaseAgreements() {
  const leases = [
    {
      id: "LSE-001",
      tenant: "Ahmed Al-Mansouri",
      property: "Marina Tower Complex",
      unit: "Unit 15A",
      startDate: "2023-06-01",
      endDate: "2024-06-01",
      monthlyRent: "$4,500",
      securityDeposit: "$9,000",
      status: "active",
      renewalStatus: "pending",
      daysToExpiry: 152,
      leaseType: "Residential"
    },
    {
      id: "LSE-002",
      tenant: "Sarah Johnson",
      property: "Business Bay Office Center",
      unit: "Floor 8, Suite 801",
      startDate: "2023-03-15",
      endDate: "2025-03-15",
      monthlyRent: "$12,000",
      securityDeposit: "$24,000",
      status: "active",
      renewalStatus: "not-due",
      daysToExpiry: 420,
      leaseType: "Commercial"
    },
    {
      id: "LSE-003",
      tenant: "Maria Garcia",
      property: "Downtown Retail Plaza",
      unit: "Shop 5",
      startDate: "2023-09-01",
      endDate: "2024-09-01",
      monthlyRent: "$8,500",
      securityDeposit: "$17,000",
      status: "active",
      renewalStatus: "negotiating",
      daysToExpiry: 244,
      leaseType: "Retail"
    },
    {
      id: "LSE-004",
      tenant: "David Chen",
      property: "Jumeirah Villa Estate",
      unit: "Villa 12",
      startDate: "2022-12-01",
      endDate: "2024-12-01",
      monthlyRent: "$25,000",
      securityDeposit: "$50,000",
      status: "active",
      renewalStatus: "renewed",
      daysToExpiry: 336,
      leaseType: "Luxury Residential"
    },
    {
      id: "LSE-005",
      tenant: "Emily Rodriguez",
      property: "Marina Tower Complex",
      unit: "Unit 22B",
      startDate: "2023-01-15",
      endDate: "2024-01-15",
      monthlyRent: "$4,200",
      securityDeposit: "$8,400",
      status: "expired",
      renewalStatus: "expired",
      daysToExpiry: -6,
      leaseType: "Residential"
    }
  ];

  const renewalPipeline = [
    { period: "Next 30 Days", count: 3, value: "$42,000" },
    { period: "Next 60 Days", count: 7, value: "$89,500" },
    { period: "Next 90 Days", count: 12, value: "$156,800" },
    { period: "Next 6 Months", count: 28, value: "$324,200" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600";
      case "expired": return "text-red-600";
      case "terminated": return "text-gray-600";
      case "pending": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "expired": return "bg-red-100 text-red-800";
      case "terminated": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRenewalStatusColor = (status: string) => {
    switch (status) {
      case "renewed": return "text-green-600";
      case "negotiating": return "text-blue-600";
      case "pending": return "text-yellow-600";
      case "expired": return "text-red-600";
      case "not-due": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getRenewalStatusBg = (status: string) => {
    switch (status) {
      case "renewed": return "bg-green-100 text-green-800";
      case "negotiating": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "expired": return "bg-red-100 text-red-800";
      case "not-due": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getExpiryUrgency = (days: number) => {
    if (days < 0) return "text-red-600";
    if (days <= 30) return "text-orange-600";
    if (days <= 90) return "text-yellow-600";
    return "text-green-600";
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
                    <FileText className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Lease Agreements</h1>
                    <p className="text-sm text-muted-foreground">Contract management and renewal tracking</p>
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
                    placeholder="Search leases..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Lease
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
                    Active Leases
                  </CardTitle>
                  <FileText className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">298</div>
                  <p className="text-sm text-green-600 font-medium">+12 this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-yellow-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expiring Soon
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">24</div>
                  <p className="text-sm text-yellow-600 font-medium">Next 90 days</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Renewal Rate
                  </CardTitle>
                  <RefreshCw className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">87.3%</div>
                  <p className="text-sm text-green-600 font-medium">+5.2% vs last year</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$2.8M</div>
                  <p className="text-sm text-green-600 font-medium">Monthly revenue</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Renewal Pipeline */}
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
                      <Calendar className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Renewal Pipeline</CardTitle>
                      <CardDescription>
                        Upcoming lease renewals
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {renewalPipeline.map((item, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{item.period}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.count} leases
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-gradient">{item.value}</p>
                        <p className="text-sm text-muted-foreground">Total monthly value</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Lease Types Distribution */}
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
                      <Users className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Lease Portfolio Overview</CardTitle>
                      <CardDescription>
                        Distribution by property type and status
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">By Property Type</h4>
                      {[
                        { type: "Residential", count: 156, percentage: 52, color: "bg-blue-500" },
                        { type: "Commercial", count: 89, percentage: 30, color: "bg-green-500" },
                        { type: "Retail", count: 34, percentage: 11, color: "bg-purple-500" },
                        { type: "Luxury", count: 19, percentage: 7, color: "bg-orange-500" }
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
                            <span className="font-medium text-foreground">{item.type}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{item.count}</p>
                            <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Lease Performance</h4>
                      <div className="space-y-3">
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Avg Lease Duration</p>
                          <p className="text-lg font-bold text-gradient">18 months</p>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Avg Rent/SqFt</p>
                          <p className="text-lg font-bold text-gradient">$42.50</p>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                          <p className="text-lg font-bold text-gradient">94.8%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Lease Agreements List */}
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
                      <FileText className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Lease Agreements</CardTitle>
                      <CardDescription>
                        Manage lease contracts and renewals
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
                  {leases.map((lease, index) => (
                    <motion.div 
                      key={lease.id}
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
                            <FileText className="w-6 h-6 text-white" />
                          </motion.div>
                          
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-semibold text-lg text-foreground">{lease.id}</h3>
                              <Badge 
                                className={`text-xs ${getStatusBg(lease.status)}`}
                                variant="outline"
                              >
                                {lease.status}
                              </Badge>
                              <Badge 
                                className={`text-xs ${getRenewalStatusBg(lease.renewalStatus)}`}
                                variant="outline"
                              >
                                {lease.renewalStatus}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">
                              {lease.tenant} • {lease.leaseType}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <span>{lease.property} - {lease.unit}</span>
                              <span>•</span>
                              <span>{lease.startDate} to {lease.endDate}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-muted-foreground">
                                Expires in: 
                                <span className={`ml-1 font-medium ${getExpiryUrgency(lease.daysToExpiry)}`}>
                                  {lease.daysToExpiry > 0 ? `${lease.daysToExpiry} days` : 'Expired'}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="grid grid-cols-2 gap-4 text-center mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Monthly Rent</p>
                              <p className="text-lg font-bold text-gradient">{lease.monthlyRent}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Security Deposit</p>
                              <p className="font-bold text-foreground">{lease.securityDeposit}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="btn-premium">
                              <Eye className="w-4 h-4 mr-2" />
                              View Contract
                            </Button>
                            <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            {lease.renewalStatus === 'pending' && (
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Renew
                              </Button>
                            )}
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