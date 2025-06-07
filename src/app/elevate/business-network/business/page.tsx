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
  Loader2,
  Camera,
  Upload
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export default function BusinessNetworkBusiness() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState({
    name: "",
    industry: "",
    description: "",
    location: "",
    size: "",
    founded: "",
    status: "PROSPECT",
    partnership: "",
    rating: 1,
    picture: ""
  });

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

  const handleBusinessSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiClient.createBusiness({
        name: businessData.name,
        industry: businessData.industry || undefined,
        description: businessData.description || undefined,
        location: businessData.location || undefined,
        size: businessData.size || undefined,
        founded: businessData.founded || undefined,
        status: businessData.status as any,
        partnership: businessData.partnership ? businessData.partnership as any : undefined,
        rating: businessData.rating,
        picture: businessData.picture || undefined
      });

      setIsAddBusinessOpen(false);
      // Reset form
      setBusinessData({
        name: "",
        industry: "",
        description: "",
        location: "",
        size: "",
        founded: "",
        status: "PROSPECT",
        partnership: "",
        rating: 1,
        picture: ""
      });
      
      // Refresh businesses and stats
      await fetchBusinesses();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business');
    } finally {
      setSubmitting(false);
    }
  };

  const updateBusinessData = (field: string, value: string | number) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
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
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0" // Prevent content overflow
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Action Bar */}
              <motion.div 
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                  <Input
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 border-refined text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="outline" className="border-refined text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">Filter</span>
              </Button>
              <Dialog open={isAddBusinessOpen} onOpenChange={setIsAddBusinessOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-premium text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add Business</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] glass-card border-refined max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-elegant text-gradient">Add New Business Partner</DialogTitle>
                    <DialogDescription className="text-refined">
                      Add a new business partner to your network for potential collaborations and partnerships.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                    <form onSubmit={handleBusinessSubmit} className="space-y-6">
                      {/* Company Logo Upload */}
                      <ImageUpload
                        id="business-picture"
                        label="Company Logo"
                        value={businessData.picture}
                        onChange={(value) => updateBusinessData("picture", value || "")}
                        placeholder="Upload company logo"
                        size="lg"
                        shape="square"
                      />

                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Business Name *</Label>
                          <Input
                            id="name"
                            placeholder="Enter business name..."
                            value={businessData.name}
                            onChange={(e) => updateBusinessData("name", e.target.value)}
                            className="border-refined"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                          <Select value={businessData.industry} onValueChange={(value) => updateBusinessData("industry", value)}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                              <SelectItem value="FINANCE">Finance</SelectItem>
                              <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                              <SelectItem value="EDUCATION">Education</SelectItem>
                              <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                              <SelectItem value="RETAIL">Retail</SelectItem>
                              <SelectItem value="CONSULTING">Consulting</SelectItem>
                              <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                              <SelectItem value="ENERGY">Energy</SelectItem>
                              <SelectItem value="TELECOMMUNICATIONS">Telecommunications</SelectItem>
                              <SelectItem value="AUTOMOTIVE">Automotive</SelectItem>
                              <SelectItem value="MEDIA">Media & Entertainment</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Business Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the business and potential partnership opportunities..."
                          value={businessData.description}
                          onChange={(e) => updateBusinessData("description", e.target.value)}
                          className="border-refined min-h-[100px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                          <Input
                            id="location"
                            placeholder="City, Country"
                            value={businessData.location}
                            onChange={(e) => updateBusinessData("location", e.target.value)}
                            className="border-refined"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="size" className="text-sm font-medium">Company Size</Label>
                          <Select value={businessData.size} onValueChange={(value) => updateBusinessData("size", value)}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STARTUP">Startup (1-10 employees)</SelectItem>
                              <SelectItem value="SMALL">Small (11-50 employees)</SelectItem>
                              <SelectItem value="MEDIUM">Medium (51-200 employees)</SelectItem>
                              <SelectItem value="LARGE">Large (201-1000 employees)</SelectItem>
                              <SelectItem value="ENTERPRISE">Enterprise (1000+ employees)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="founded" className="text-sm font-medium">Founded Year</Label>
                          <Input
                            id="founded"
                            type="number"
                            placeholder="e.g., 2020"
                            value={businessData.founded}
                            onChange={(e) => updateBusinessData("founded", e.target.value)}
                            className="border-refined"
                            min="1800"
                            max={new Date().getFullYear()}
                  />
                </div>

                        <div className="space-y-2">
                          <Label htmlFor="status" className="text-sm font-medium">Partnership Status</Label>
                          <Select value={businessData.status} onValueChange={(value) => updateBusinessData("status", value)}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PROSPECT">Prospect</SelectItem>
                              <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                              <SelectItem value="PARTNER">Active Partner</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="partnership" className="text-sm font-medium">Partnership Type</Label>
                          <Select value={businessData.partnership} onValueChange={(value) => updateBusinessData("partnership", value)}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select partnership type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STRATEGIC">Strategic Partnership</SelectItem>
                              <SelectItem value="INVESTMENT">Investment Opportunity</SelectItem>
                              <SelectItem value="JOINT_VENTURE">Joint Venture</SelectItem>
                              <SelectItem value="SUPPLIER">Supplier/Vendor</SelectItem>
                              <SelectItem value="CLIENT">Client/Customer</SelectItem>
                              <SelectItem value="REFERRAL">Referral Partner</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rating" className="text-sm font-medium">Partnership Rating</Label>
                          <Select value={businessData.rating.toString()} onValueChange={(value) => updateBusinessData("rating", parseInt(value))}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">⭐ 1 Star - Low Priority</SelectItem>
                              <SelectItem value="2">⭐⭐ 2 Stars - Medium Priority</SelectItem>
                              <SelectItem value="3">⭐⭐⭐ 3 Stars - High Priority</SelectItem>
                              <SelectItem value="4">⭐⭐⭐⭐ 4 Stars - Very High Priority</SelectItem>
                              <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars - Strategic Partner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 text-sm">{error}</p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddBusinessOpen(false)}
                          disabled={submitting}
                        >
                          Cancel
                </Button>
                        <Button 
                          type="submit" 
                          className="btn-premium"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                  <Plus className="w-4 h-4 mr-2" />
                              Add Business Partner
                            </>
                          )}
                </Button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

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
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                              {business.picture ? (
                                <img 
                                  src={business.picture} 
                                  alt={`${business.name} logo`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                              <Building className="w-6 h-6 text-primary" />
                              )}
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