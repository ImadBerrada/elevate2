"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Network, 
  Users, 
  Building, 
  TrendingUp,
  Activity,
  Contact,
  MessageSquare,
  Calendar,
  Star,
  ArrowUpRight,
  Plus,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface DashboardStats {
  activities: {
    total: number;
    today: number;
    week: number;
    month: number;
    growth: number;
    recent: any[];
  };
  contacts: {
    total: number;
    vip: number;
    top: any[];
  };
  businesses: {
    total: number;
    active: number;
  };
  employers: {
    total: number;
    active: number;
  };
  points: {
    total: number;
    month: number;
  };
}

export default function BusinessNetworkDashboard() {
  const { isOpen } = useSidebar();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

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
                    <Network className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-elegant text-gradient">Business Network</h1>
                    <p className="text-sm text-muted-foreground font-refined">Professional Networking Hub</p>
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
                  <Plus className="w-4 h-4 mr-2" />
                  New Connection
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
              Business Network Dashboard
            </h2>
            <p className="text-refined text-muted-foreground">
              Manage your professional connections and business relationships.
            </p>
          </motion.div>

          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              {...fadeInUp}
            >
              <p className="text-red-600">Error: {error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Total Connections</span>
                  </CardTitle>
                  <CardDescription>Professional network size</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.contacts.total || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats?.contacts.vip || 0} VIP contacts
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-primary" />
                    <span>Partner Companies</span>
                  </CardTitle>
                  <CardDescription>Business partnerships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.businesses.total || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats?.businesses.active || 0} active partnerships
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <span>Total Activities</span>
                  </CardTitle>
                  <CardDescription>Network activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.activities.total || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats?.activities.today || 0} today
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span>Network Points</span>
                  </CardTitle>
                  <CardDescription>Activity points earned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.points.total || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats?.points.month || 0} this month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="text-xl font-elegant">Top Contacts</CardTitle>
                  <CardDescription className="text-refined">
                    Your highest-rated connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.contacts.top && stats.contacts.top.length > 0 ? (
                    <div className="space-y-4">
                      {stats.contacts.top.map((contact: any, index: number) => (
                        <motion.div
                          key={contact.id}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {contact.firstName[0]}{contact.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {contact.firstName} {contact.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {contact.employer || 'No employer'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: contact.rating || 1 }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Users className="w-16 h-16 text-muted-foreground/40 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No contacts yet</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Start building your professional network by adding connections.
                      </p>
                      <Button className="btn-premium">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contact
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="text-xl font-elegant">Recent Activities</CardTitle>
                  <CardDescription className="text-refined">
                    Latest network activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.activities.recent && stats.activities.recent.length > 0 ? (
                    <div className="space-y-4">
                      {stats.activities.recent.map((activity: any, index: number) => (
                        <motion.div
                          key={activity.id}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{activity.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {activity.type.toLowerCase().replace('_', ' ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="text-xs">
                              +{activity.points} pts
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Activity className="w-16 h-16 text-muted-foreground/40 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No activities yet</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Start tracking your business activities to see them here.
                      </p>
                      <Button className="btn-premium">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Activity
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.7 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-xl font-elegant">Network Analytics</CardTitle>
                <CardDescription className="text-refined">
                  Performance metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {stats?.activities.growth || 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">Activity Growth</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {stats?.activities.week || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {stats?.employers.total || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Employers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {stats?.employers.active || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Active Employers</p>
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