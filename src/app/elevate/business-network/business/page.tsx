"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Building, 
  TrendingUp, 
  DollarSign, 
  Users,
  MapPin,
  Calendar,
  Star,
  ArrowUpRight,
  Plus,
  Filter,
  Search,
  Briefcase,
  Target,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export default function BusinessNetworkBusiness() {
  const { isOpen } = useSidebar();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchBusinesses();
    fetchStats();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchBusinesses();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchBusinesses = async () => {
    try {
      const data = await apiClient.getBusinesses({ 
        limit: 50,
        search: searchTerm || undefined
      });
      setBusinesses(data.businesses);
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PARTNER': return 'bg-green-100 text-green-800';
      case 'NEGOTIATING': return 'bg-yellow-100 text-yellow-800';
      case 'PROSPECT': return 'bg-blue-100 text-blue-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading && businesses.length === 0) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading businesses...</span>
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
                    <Building className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-elegant text-gradient">Business Partners</h1>
                    <p className="text-sm text-muted-foreground font-refined">Partnership & Opportunity Management</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-refined"
                  />
                </div>
                <Button variant="outline" className="border-refined">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Business
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
              Business Partnership Hub
            </h2>
            <p className="text-refined text-muted-foreground">
              Manage strategic partnerships, investment opportunities, and business relationships.
            </p>
          </motion.div>

          {/* Business Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.businesses.total || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.businesses.active || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Industries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {new Set(businesses.filter(b => b.industry).map(b => b.industry)).size}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {new Set(businesses.filter(b => b.location).map(b => b.location)).size}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Business Directory */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-xl font-elegant">Business Directory</CardTitle>
                <CardDescription className="text-refined">
                  Your business partnerships and opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {businesses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map((business, index) => (
                      <motion.div
                        key={business.id}
                        className="p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-lg">{business.name}</h4>
                              {business.industry && (
                                <p className="text-sm text-muted-foreground">
                                  {business.industry}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(business.status)}>
                            {formatStatus(business.status)}
                          </Badge>
                        </div>

                        {business.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {business.description}
                          </p>
                        )}

                        <div className="space-y-2 mb-4">
                          {business.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2" />
                              {business.location}
                            </div>
                          )}
                          {business.size && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="w-4 h-4 mr-2" />
                              {business.size}
                            </div>
                          )}
                          {business.founded && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-2" />
                              Founded {business.founded}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-1">
                            {business.partnership && (
                              <Badge variant="outline" className="text-xs">
                                {business.partnership.replace('_', ' ')}
                              </Badge>
                            )}
                            {business.rating && (
                              <div className="flex items-center space-x-1">
                                {Array.from({ length: business.rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            )}
                          </div>
                          <Button size="sm" variant="outline" className="border-refined">
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Building className="w-16 h-16 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {searchTerm ? 'No businesses found' : 'No businesses yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {searchTerm 
                        ? `No businesses match "${searchTerm}". Try a different search term.`
                        : 'Start building your business network by adding partnerships.'
                      }
                    </p>
                    {!searchTerm && (
                      <Button className="btn-premium">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Business
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 