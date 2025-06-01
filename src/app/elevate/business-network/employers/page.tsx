"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Building,
  MapPin,
  Calendar,
  Star,
  UserPlus,
  Plus,
  Filter,
  Search,
  Award,
  Target,
  Clock,
  Upload,
  Camera,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const employerCategories = [
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "FINANCE", label: "Finance" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "EDUCATION", label: "Education" },
  { value: "MANUFACTURING", label: "Manufacturing" },
  { value: "RETAIL", label: "Retail" },
  { value: "CONSULTING", label: "Consulting" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "ENERGY", label: "Energy" },
  { value: "TELECOMMUNICATIONS", label: "Telecommunications" },
  { value: "AUTOMOTIVE", label: "Automotive" },
  { value: "MEDIA", label: "Media & Entertainment" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "NON_PROFIT", label: "Non-Profit" },
  { value: "OTHER", label: "Other" }
];

export default function BusinessNetworkEmployers() {
  const { isOpen } = useSidebar();
  const [isAddEmployerOpen, setIsAddEmployerOpen] = useState(false);
  const [employerData, setEmployerData] = useState({
    picture: null as File | null,
    category: "",
    nameArabic: "",
    nameEnglish: ""
  });
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchEmployers();
    fetchStats();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchEmployers();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchEmployers = async () => {
    try {
      const data = await apiClient.getEmployers({ 
        limit: 50,
        search: searchTerm || undefined
      });
      setEmployers(data.employers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employers');
      console.error('Failed to fetch employers:', err);
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

  const handleEmployerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const employerPayload: any = {
        nameEnglish: employerData.nameEnglish,
        category: employerData.category as any,
        picture: undefined // File upload will be implemented later
      };

      // Only include nameArabic if it has a value
      if (employerData.nameArabic && employerData.nameArabic.trim()) {
        employerPayload.nameArabic = employerData.nameArabic;
      }

      await apiClient.createEmployer(employerPayload);

      setIsAddEmployerOpen(false);
      // Reset form
      setEmployerData({
        picture: null,
        category: "",
        nameArabic: "",
        nameEnglish: ""
      });
      
      // Refresh employers and stats
      await fetchEmployers();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employer');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEmployerData(prev => ({ ...prev, picture: file }));
    }
  };

  const updateEmployerData = (field: string, value: string) => {
    setEmployerData(prev => ({ ...prev, [field]: value }));
  };

  const formatCategory = (category: string) => {
    return category.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading && employers.length === 0) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading employers...</span>
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
                    <Users className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-elegant text-gradient">Employer Network</h1>
                    <p className="text-sm text-muted-foreground font-refined">Recruitment & Employer Relations</p>
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
                    placeholder="Search employers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-refined"
                  />
                </div>
                <Button variant="outline" className="border-refined">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Dialog open={isAddEmployerOpen} onOpenChange={setIsAddEmployerOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-premium">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Employer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] glass-card border-refined">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-elegant text-gradient">Add New Employer</DialogTitle>
                      <DialogDescription className="text-refined">
                        Add a new employer partner to your recruitment network.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEmployerSubmit} className="space-y-6">
                      {/* Picture Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="employer-picture" className="text-sm font-medium">Employer Picture/Logo (Optional)</Label>
                        <div className="flex items-center space-x-4">
                          <Input
                            id="employer-picture"
                            type="file"
                            accept="image/*"
                            onChange={handlePictureUpload}
                            className="border-refined"
                          />
                          <Button type="button" variant="outline" className="border-refined">
                            <Camera className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                        {employerData.picture && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {employerData.picture.name}
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                        <Select value={employerData.category} onValueChange={(value) => updateEmployerData("category", value)}>
                          <SelectTrigger className="border-refined">
                            <SelectValue placeholder="Select employer category" />
                          </SelectTrigger>
                          <SelectContent>
                            {employerCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* English Name */}
                      <div className="space-y-2">
                        <Label htmlFor="nameEnglish" className="text-sm font-medium">Name in English *</Label>
                        <Input
                          id="nameEnglish"
                          placeholder="Enter employer name in English..."
                          value={employerData.nameEnglish}
                          onChange={(e) => updateEmployerData("nameEnglish", e.target.value)}
                          className="border-refined"
                          required
                        />
                      </div>

                      {/* Arabic Name */}
                      <div className="space-y-2">
                        <Label htmlFor="nameArabic" className="text-sm font-medium">Name in Arabic</Label>
                        <Input
                          id="nameArabic"
                          placeholder="أدخل اسم صاحب العمل بالعربية..."
                          value={employerData.nameArabic}
                          onChange={(e) => updateEmployerData("nameArabic", e.target.value)}
                          className="border-refined text-right"
                          dir="rtl"
                        />
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
                          onClick={() => setIsAddEmployerOpen(false)}
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
                              Add Employer
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
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
              Employer Partnership Hub
            </h2>
            <p className="text-refined text-muted-foreground">
              Manage recruitment partnerships and employer relationships for talent placement.
            </p>
          </motion.div>

          {/* Employer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Employers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.employers.total || 0}
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
                    {stats?.employers.active || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {new Set(employers.filter(e => e.category).map(e => e.category)).size}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Recent Additions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {employers.filter(e => {
                      const createdAt = new Date(e.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return createdAt > weekAgo;
                    }).length}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Employers Directory */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-xl font-elegant">Employer Directory</CardTitle>
                <CardDescription className="text-refined">
                  Your recruitment and employer partnership network
                </CardDescription>
              </CardHeader>
              <CardContent>
                {employers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employers.map((employer, index) => (
                      <motion.div
                        key={employer.id}
                        className="p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-lg">{employer.nameEnglish}</h4>
                            {employer.nameArabic && (
                              <p className="text-sm text-muted-foreground text-right" dir="rtl">
                                {employer.nameArabic}
                              </p>
                            )}
                            {employer.category && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {formatCategory(employer.category)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            Added {new Date(employer.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="border-refined">
                              <UserPlus className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-refined">
                              <Briefcase className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button size="sm" className="btn-premium">
                            View Details
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {searchTerm ? 'No employers found' : 'No employers yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {searchTerm 
                        ? `No employers match "${searchTerm}". Try a different search term.`
                        : 'Start building your employer network by adding recruitment partners.'
                      }
                    </p>
                    {!searchTerm && (
                      <Button 
                        className="btn-premium"
                        onClick={() => setIsAddEmployerOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Employer
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