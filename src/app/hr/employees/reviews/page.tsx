"use client";

import { motion } from "framer-motion";
import { 
  ClipboardCheck, 
  Users, 
  TrendingUp, 
  Star,
  Calendar,
  Target,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle
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

export default function PerformanceReviews() {
  const reviews = [
    {
      id: 1,
      employeeName: "Sarah Johnson",
      position: "Senior Investment Analyst",
      department: "ELEVATE",
      reviewPeriod: "Q4 2023",
      status: "completed",
      overallRating: 4.8,
      reviewDate: "2024-01-15",
      reviewer: "Michael Chen",
      nextReview: "2024-04-15"
    },
    {
      id: 2,
      employeeName: "Ahmed Al-Rashid",
      position: "Property Manager",
      department: "Real Estate",
      reviewPeriod: "Q4 2023",
      status: "in-progress",
      overallRating: 4.5,
      reviewDate: "2024-01-20",
      reviewer: "Lisa Rodriguez",
      nextReview: "2024-04-20"
    },
    {
      id: 3,
      employeeName: "Maria Garcia",
      position: "Operations Coordinator",
      department: "MARAH",
      reviewPeriod: "Q4 2023",
      status: "pending",
      overallRating: null,
      reviewDate: "2024-01-25",
      reviewer: "David Kim",
      nextReview: "2024-04-25"
    },
    {
      id: 4,
      employeeName: "David Chen",
      position: "Financial Analyst",
      department: "ELEVATE",
      reviewPeriod: "Q4 2023",
      status: "completed",
      overallRating: 4.6,
      reviewDate: "2024-01-12",
      reviewer: "Sarah Johnson",
      nextReview: "2024-04-12"
    },
    {
      id: 5,
      employeeName: "Emily Rodriguez",
      position: "HR Specialist",
      department: "Human Resources",
      reviewPeriod: "Q4 2023",
      status: "overdue",
      overallRating: null,
      reviewDate: "2024-01-08",
      reviewer: "Michael Chen",
      nextReview: "2024-04-08"
    }
  ];

  const performanceMetrics = [
    {
      category: "Goal Achievement",
      score: 4.6,
      description: "Meeting and exceeding set objectives",
      trend: "+0.3"
    },
    {
      category: "Quality of Work",
      score: 4.7,
      description: "Accuracy and excellence in deliverables",
      trend: "+0.2"
    },
    {
      category: "Team Collaboration",
      score: 4.4,
      description: "Working effectively with colleagues",
      trend: "+0.1"
    },
    {
      category: "Innovation & Initiative",
      score: 4.3,
      description: "Proactive problem-solving and creativity",
      trend: "+0.4"
    },
    {
      category: "Professional Development",
      score: 4.5,
      description: "Continuous learning and skill improvement",
      trend: "+0.2"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in-progress": return "text-blue-600";
      case "pending": return "text-yellow-600";
      case "overdue": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "in-progress": return Clock;
      case "pending": return Calendar;
      case "overdue": return AlertTriangle;
      default: return Clock;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
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
                    <ClipboardCheck className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Performance Reviews</h1>
                    <p className="text-sm text-muted-foreground">Employee performance evaluation and management</p>
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
                    placeholder="Search employees..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Review
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
                    Total Reviews
                  </CardTitle>
                  <ClipboardCheck className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">247</div>
                  <p className="text-sm text-green-600 font-medium">This quarter</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">189</div>
                  <p className="text-sm text-green-600 font-medium">76.5% completion rate</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Rating
                  </CardTitle>
                  <Star className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">4.5</div>
                  <p className="text-sm text-green-600 font-medium">+0.2 vs last quarter</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overdue Reviews
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">12</div>
                  <p className="text-sm text-red-600 font-medium">Requires attention</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Performance Metrics */}
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
                      <Target className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>
                        Average scores across all categories
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.map((metric, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{metric.category}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-bold text-gradient">{metric.score}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{metric.description}</p>
                        <p className="text-sm text-green-600 font-medium">{metric.trend}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Review Status Chart */}
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
                      <CardTitle>Review Progress Analytics</CardTitle>
                      <CardDescription>
                        Performance trends and completion rates
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Review Status</h4>
                      {[
                        { status: "Completed", count: 189, percentage: 76.5, color: "bg-green-500" },
                        { status: "In Progress", count: 34, percentage: 13.8, color: "bg-blue-500" },
                        { status: "Pending", count: 12, percentage: 4.9, color: "bg-yellow-500" },
                        { status: "Overdue", count: 12, percentage: 4.9, color: "bg-red-500" }
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
                      <h4 className="font-semibold text-foreground mb-4">Performance Trends</h4>
                      <div className="h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <TrendingUp className="w-12 h-12 text-primary/40 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Performance chart</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Reviews */}
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
                    <CardTitle className="text-xl">Employee Reviews</CardTitle>
                    <CardDescription>
                      Recent performance evaluations and assessments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review, index) => {
                    const StatusIcon = getStatusIcon(review.status);
                    return (
                      <motion.div 
                        key={review.id}
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
                              <StatusIcon className={`w-6 h-6 ${getStatusColor(review.status)}`} />
                            </motion.div>
                            
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{review.employeeName}</h3>
                                <Badge 
                                  className={`text-xs ${getStatusBg(review.status)}`}
                                  variant="outline"
                                >
                                  {review.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{review.position} • {review.department}</p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>Period: {review.reviewPeriod}</span>
                                <span>•</span>
                                <span>Reviewer: {review.reviewer}</span>
                                <span>•</span>
                                <span>Due: {review.reviewDate}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-1 gap-4 text-center mb-4">
                              {review.overallRating ? (
                                <div>
                                  <p className="text-sm text-muted-foreground">Overall Rating</p>
                                  <div className="flex items-center justify-center space-x-1">
                                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                    <span className={`text-xl font-bold ${getRatingColor(review.overallRating)}`}>
                                      {review.overallRating}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm text-muted-foreground">Overall Rating</p>
                                  <p className="text-lg font-bold text-gray-400">Pending</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button size="sm" className="btn-premium">
                                <Eye className="w-4 h-4 mr-2" />
                                View
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