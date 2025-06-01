"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
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
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown
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

export default function InvoiceHistory() {
  const invoiceStats = [
    { label: "Total Invoices", value: "1,247", change: "+12%", trend: "up", icon: FileText },
    { label: "Paid Invoices", value: "1,089", change: "+8%", trend: "up", icon: CheckCircle },
    { label: "Pending Amount", value: "$45,230", change: "-5%", trend: "down", icon: Clock },
    { label: "Overdue", value: "23", change: "+3%", trend: "up", icon: AlertCircle }
  ];

  const invoices = [
    {
      id: "INV-2024-001",
      tenant: "Ahmed Al-Rashid",
      property: "Marina Heights - Unit 1205",
      amount: "$2,500.00",
      type: "Rent",
      status: "paid",
      issueDate: "2024-01-15",
      dueDate: "2024-02-01",
      paidDate: "2024-01-28"
    },
    {
      id: "INV-2024-002",
      tenant: "Sarah Johnson",
      property: "Downtown Plaza - Unit 304",
      amount: "$450.00",
      type: "Maintenance",
      status: "pending",
      issueDate: "2024-01-14",
      dueDate: "2024-01-30",
      paidDate: null
    },
    {
      id: "INV-2024-003",
      tenant: "Mohammed Hassan",
      property: "Business Bay Tower - Unit 1501",
      amount: "$3,200.00",
      type: "Rent",
      status: "paid",
      issueDate: "2024-01-13",
      dueDate: "2024-01-28",
      paidDate: "2024-01-25"
    },
    {
      id: "INV-2024-004",
      tenant: "Lisa Chen",
      property: "Jumeirah Residence - Unit 802",
      amount: "$180.00",
      type: "Utility",
      status: "overdue",
      issueDate: "2024-01-10",
      dueDate: "2024-01-25",
      paidDate: null
    },
    {
      id: "INV-2024-005",
      tenant: "Omar Abdullah",
      property: "Palm Residences - Unit 601",
      amount: "$2,800.00",
      type: "Rent",
      status: "sent",
      issueDate: "2024-01-12",
      dueDate: "2024-02-05",
      paidDate: null
    },
    {
      id: "INV-2024-006",
      tenant: "Emma Wilson",
      property: "City Center - Unit 1102",
      amount: "$320.00",
      type: "Service",
      status: "draft",
      issueDate: "2024-01-11",
      dueDate: "2024-01-27",
      paidDate: null
    },
    {
      id: "INV-2024-007",
      tenant: "Hassan Ali",
      property: "Marina Walk - Unit 405",
      amount: "$2,200.00",
      type: "Rent",
      status: "paid",
      issueDate: "2024-01-09",
      dueDate: "2024-01-24",
      paidDate: "2024-01-22"
    },
    {
      id: "INV-2024-008",
      tenant: "Jennifer Brown",
      property: "Skyline Tower - Unit 1801",
      amount: "$650.00",
      type: "Maintenance",
      status: "pending",
      issueDate: "2024-01-08",
      dueDate: "2024-01-23",
      paidDate: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "text-green-600";
      case "sent": return "text-blue-600";
      case "pending": return "text-yellow-600";
      case "draft": return "text-gray-600";
      case "overdue": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return CheckCircle;
      case "sent": return Send;
      case "pending": return Clock;
      case "draft": return Edit;
      case "overdue": return AlertCircle;
      default: return FileText;
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
                    <FileText className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Invoice History</h1>
                    <p className="text-sm text-muted-foreground">Track and manage all property invoices</p>
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
                  New Invoice
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
            {invoiceStats.map((stat, index) => {
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

          {/* Filters and Search */}
          <motion.div 
            className="glass-card p-6 rounded-2xl mb-8"
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search invoices by ID, tenant, or property..." 
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
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40 glass-card border-0">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Invoice Table */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.6 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Invoice Records</CardTitle>
                    <CardDescription>
                      Complete history of all property invoices
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {invoices.length} invoices
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/20">
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Invoice ID</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Tenant</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Property</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Due Date</th>
                        <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice, index) => {
                        const StatusIcon = getStatusIcon(invoice.status);
                        return (
                          <motion.tr 
                            key={invoice.id}
                            className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.05 }}
                          >
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <StatusIcon className={`w-4 h-4 ${getStatusColor(invoice.status)}`} />
                                <span className="font-medium text-foreground">{invoice.id}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-foreground">{invoice.tenant}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{invoice.property}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <Badge variant="outline" className="text-xs">
                                {invoice.type}
                              </Badge>
                            </td>
                            <td className="py-4 px-2">
                              <span className="font-semibold text-gradient">{invoice.amount}</span>
                            </td>
                            <td className="py-4 px-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusBg(invoice.status)}`}
                              >
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{invoice.dueDate}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover-glow">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover-glow">
                                  <Edit className="w-3 h-3" />
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
                    Showing 1-8 of {invoices.length} invoices
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