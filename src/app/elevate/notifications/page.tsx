"use client";

import { motion } from "framer-motion";
import { 
  Bell, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Info,
  X,
  CheckCheck,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      staggerChildren: 0.1
    }
  }
};

export default function ElevateNotifications() {
  const { isOpen } = useSidebar();

  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Investment Performance Alert",
      message: "Your Technology Sector portfolio has gained 5.2% today",
      time: "2 minutes ago",
      isRead: false,
      icon: TrendingUp
    },
    {
      id: 2,
      type: "warning",
      title: "Market Volatility Warning",
      message: "Increased volatility detected in Energy sector investments",
      time: "15 minutes ago",
      isRead: false,
      icon: AlertTriangle
    },
    {
      id: 3,
      type: "info",
      title: "Cash Request Approved",
      message: "Your cash request of $50,000 has been approved and processed",
      time: "1 hour ago",
      isRead: true,
      icon: CheckCircle
    },
    {
      id: 4,
      type: "info",
      title: "Monthly Report Available",
      message: "Your January investment report is ready for review",
      time: "2 hours ago",
      isRead: true,
      icon: Info
    },
    {
      id: 5,
      type: "success",
      title: "New Investment Opportunity",
      message: "Healthcare sector showing strong growth potential",
      time: "4 hours ago",
      isRead: false,
      icon: TrendingUp
    }
  ];

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "error": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "success": return "from-green-50/80 to-white/80";
      case "warning": return "from-yellow-50/80 to-white/80";
      case "error": return "from-red-50/80 to-white/80";
      default: return "from-blue-50/80 to-white/80";
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
                    <Bell className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-elegant text-gradient">Notifications</h1>
                    <p className="text-sm text-muted-foreground font-refined">Investment Alerts & Updates</p>
                  </div>
                </div>
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
              Notification Center
            </h2>
            <p className="text-refined text-muted-foreground">
              Stay updated with important investment alerts and system notifications.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>Critical</span>
                  </CardTitle>
                  <CardDescription>Urgent notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">3</div>
                  <p className="text-sm text-red-600">Require immediate attention</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    <span>Updates</span>
                  </CardTitle>
                  <CardDescription>System updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">7</div>
                  <p className="text-sm text-blue-600">New information available</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Completed</span>
                  </CardTitle>
                  <CardDescription>Resolved notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">24</div>
                  <p className="text-sm text-green-600">This week</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-purple-500" />
                    <span>Total</span>
                  </CardTitle>
                  <CardDescription>All notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">34</div>
                  <p className="text-sm text-purple-600">Active notifications</p>
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
                    <CardTitle className="text-xl font-elegant">Recent Notifications</CardTitle>
                    <CardDescription className="text-refined">
                      Latest alerts and system updates
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="border-refined">
                    10 Unread
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "critical", title: "Portfolio Risk Alert", message: "High volatility detected in Technology sector", time: "5 min ago", icon: AlertTriangle },
                    { type: "info", title: "Investment Opportunity", message: "New real estate acquisition available", time: "1 hour ago", icon: Info },
                    { type: "success", title: "Transaction Completed", message: "Cash request CR-001 has been approved", time: "2 hours ago", icon: CheckCircle },
                    { type: "info", title: "Market Update", message: "Q4 performance report is now available", time: "4 hours ago", icon: Info },
                    { type: "critical", title: "Compliance Alert", message: "Regulatory filing deadline approaching", time: "6 hours ago", icon: AlertTriangle }
                  ].map((notification, index) => (
                    <motion.div 
                      key={index}
                      className="glass-card p-6 rounded-2xl hover-lift group border-refined"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-refined ${
                            notification.type === 'critical' ? 'bg-red-100 text-red-600' :
                            notification.type === 'success' ? 'bg-green-100 text-green-600' :
                            'bg-blue-100 text-blue-600'
                          }`}
                          whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                          <notification.icon className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-elegant text-lg text-foreground">{notification.title}</h3>
                          <p className="text-muted-foreground">{notification.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                        <Badge 
                          variant={notification.type === 'critical' ? 'destructive' : notification.type === 'success' ? 'default' : 'secondary'}
                          className="border-refined"
                        >
                          {notification.type}
                        </Badge>
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