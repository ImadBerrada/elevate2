"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  Building,
  Users,
  Target
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

export default function RealEstateReports() {
  const reports = [
    {
      id: "RPT-001",
      title: "Monthly Financial Summary",
      description: "Comprehensive financial overview for January 2024",
      type: "Financial",
      period: "Monthly",
      generatedDate: "2024-01-31",
      status: "completed",
      size: "2.4 MB",
      pages: 24
    },
    {
      id: "RPT-002",
      title: "Property Performance Analysis",
      description: "Occupancy rates and revenue analysis by property",
      type: "Performance",
      period: "Quarterly",
      generatedDate: "2024-01-28",
      status: "completed",
      size: "1.8 MB",
      pages: 18
    },
    {
      id: "RPT-003",
      title: "Maintenance Cost Report",
      description: "Detailed breakdown of maintenance expenses",
      type: "Operational",
      period: "Monthly",
      generatedDate: "2024-01-25",
      status: "completed",
      size: "1.2 MB",
      pages: 12
    },
    {
      id: "RPT-004",
      title: "Tenant Satisfaction Survey",
      description: "Annual tenant feedback and satisfaction metrics",
      type: "Survey",
      period: "Annual",
      generatedDate: "2024-01-20",
      status: "in-progress",
      size: "3.1 MB",
      pages: 32
    },
    {
      id: "RPT-005",
      title: "Market Analysis Report",
      description: "Competitive analysis and market trends",
      type: "Market",
      period: "Quarterly",
      generatedDate: "2024-01-15",
      status: "scheduled",
      size: "2.7 MB",
      pages: 28
    }
  ];

  const reportCategories = [
    { category: "Financial", count: 8, percentage: 32, color: "bg-blue-500" },
    { category: "Performance", count: 6, percentage: 24, color: "bg-green-500" },
    { category: "Operational", count: 5, percentage: 20, color: "bg-purple-500" },
    { category: "Market", count: 4, percentage: 16, color: "bg-orange-500" },
    { category: "Survey", count: 2, percentage: 8, color: "bg-red-500" }
  ];

  const keyMetrics = [
    { metric: "Total Revenue", value: "$2.8M", change: "+12.5%", trend: "up" },
    { metric: "Occupancy Rate", value: "94.2%", change: "+2.1%", trend: "up" },
    { metric: "Operating Expenses", value: "$890K", change: "-5.3%", trend: "down" },
    { metric: "Net Operating Income", value: "$1.91M", change: "+18.7%", trend: "up" },
    { metric: "Maintenance Costs", value: "$156K", change: "-8.2%", trend: "down" },
    { metric: "Tenant Satisfaction", value: "4.6/5", change: "+0.3", trend: "up" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in-progress": return "text-blue-600";
      case "scheduled": return "text-purple-600";
      case "draft": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "scheduled": return "bg-purple-100 text-purple-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Financial": return "text-blue-600";
      case "Performance": return "text-green-600";
      case "Operational": return "text-purple-600";
      case "Market": return "text-orange-600";
      case "Survey": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? TrendingUp : TrendingUp;
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
                    <h1 className="text-2xl font-bold text-gradient">Real Estate Reports</h1>
                    <p className="text-sm text-muted-foreground">Analytics and reporting dashboard</p>
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
                    placeholder="Search reports..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
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
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Reports
                  </CardTitle>
                  <FileText className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">156</div>
                  <p className="text-sm text-green-600 font-medium">+12 this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Automated Reports
                  </CardTitle>
                  <Target className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">89</div>
                  <p className="text-sm text-green-600 font-medium">57% automation rate</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Data Sources
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">24</div>
                  <p className="text-sm text-blue-600 font-medium">Integrated systems</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Report Views
                  </CardTitle>
                  <Eye className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">2.4K</div>
                  <p className="text-sm text-green-600 font-medium">This month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Report Categories */}
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
                      <CardTitle>Report Categories</CardTitle>
                      <CardDescription>
                        Distribution by report type
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportCategories.map((category, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${category.color}`} />
                          <span className="font-medium text-foreground">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{category.count}</p>
                          <p className="text-sm text-muted-foreground">{category.percentage}%</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Metrics */}
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
                      <CardTitle>Key Performance Metrics</CardTitle>
                      <CardDescription>
                        Latest business performance indicators
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {keyMetrics.map((metric, index) => {
                      const TrendIcon = getTrendIcon(metric.trend);
                      return (
                        <motion.div 
                          key={index}
                          className="glass-card p-4 rounded-xl"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground text-sm">{metric.metric}</h4>
                            <TrendIcon className={`w-4 h-4 ${getTrendColor(metric.trend)}`} />
                          </div>
                          <p className="text-2xl font-bold text-gradient mb-1">{metric.value}</p>
                          <p className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                            {metric.change}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Reports List */}
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
                      <CardTitle className="text-xl">Recent Reports</CardTitle>
                      <CardDescription>
                        Latest generated reports and analytics
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" className="glass-card border-0 hover-glow">
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report, index) => (
                    <motion.div 
                      key={report.id}
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
                              <h3 className="font-semibold text-lg text-foreground">{report.title}</h3>
                              <Badge 
                                className={`text-xs ${getStatusBg(report.status)}`}
                                variant="outline"
                              >
                                {report.status}
                              </Badge>
                              <Badge 
                                className={`text-xs ${getTypeColor(report.type) === 'text-blue-600' ? 'bg-blue-100 text-blue-800' : 
                                  getTypeColor(report.type) === 'text-green-600' ? 'bg-green-100 text-green-800' : 
                                  getTypeColor(report.type) === 'text-purple-600' ? 'bg-purple-100 text-purple-800' : 
                                  getTypeColor(report.type) === 'text-orange-600' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}
                                variant="outline"
                              >
                                {report.type}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">{report.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <span>Period: {report.period}</span>
                              <span>•</span>
                              <span>Generated: {report.generatedDate}</span>
                              <span>•</span>
                              <span>Size: {report.size}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{report.pages} pages</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="btn-premium">
                              <Eye className="w-4 h-4 mr-2" />
                              View Report
                            </Button>
                            <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                              <Download className="w-4 h-4 mr-2" />
                              Download
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