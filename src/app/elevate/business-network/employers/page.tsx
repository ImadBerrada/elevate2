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
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Building2,
  Globe,
  Phone,
  Mail,
  Grid3X3,
  List,
  DollarSign,
  UserCheck,
  Package
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
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

interface Employer {
  id: string;
  nameEnglish: string;
  nameArabic?: string;
  category: string;
  picture?: string;
  description?: string;
  industry?: string;
  size?: string;
  location?: string;
  founded?: string;
  status: 'NEW' | 'ACTIVE' | 'PREMIUM' | 'INACTIVE' | 'PARTNERSHIP';
  partnership?: string;
  openPositions?: number;
  placementRate?: number;
  avgSalary?: string;
  lastPlacement?: string;
  rating?: number;
  benefits?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface EmployerFormData {
  nameEnglish: string;
  nameArabic: string;
  category: string;
  picture: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  founded: string;
  status: 'NEW' | 'ACTIVE' | 'PREMIUM' | 'INACTIVE' | 'PARTNERSHIP';
  partnership: string;
  openPositions: string;
  placementRate: string;
  avgSalary: string;
  rating: string;
  benefits: string;
  tags: string;
}

interface CompanyOption {
  id: string;
  name: string;
  type: 'business' | 'company';
  industry?: string;
  logo?: string;
  picture?: string;
}

const employerCategories = [
  { value: "TECHNOLOGY", label: "Technology & IT" },
  { value: "FINANCE", label: "Finance & Banking" },
  { value: "HEALTHCARE", label: "Healthcare & Medical" },
  { value: "EDUCATION", label: "Education & Training" },
  { value: "MANUFACTURING", label: "Manufacturing & Industrial" },
  { value: "RETAIL", label: "Retail & E-commerce" },
  { value: "CONSULTING", label: "Consulting & Professional Services" },
  { value: "REAL_ESTATE", label: "Real Estate & Construction" },
  { value: "ENERGY", label: "Energy & Utilities" },
  { value: "TELECOMMUNICATIONS", label: "Telecommunications" },
  { value: "AUTOMOTIVE", label: "Automotive" },
  { value: "MEDIA", label: "Media & Entertainment" },
  { value: "GOVERNMENT", label: "Government & Public Sector" },
  { value: "NON_PROFIT", label: "Non-Profit & NGO" },
  { value: "OTHER", label: "Other" }
];

const companySizes = [
  { value: "STARTUP", label: "Startup (1-10)" },
  { value: "SMALL", label: "Small (11-50)" },
  { value: "MEDIUM", label: "Medium (51-200)" },
  { value: "LARGE", label: "Large (201-1000)" },
  { value: "ENTERPRISE", label: "Enterprise (1000+)" }
];

const employerStatuses = [
  { value: "NEW", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "ACTIVE", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "PREMIUM", label: "Premium", color: "bg-purple-100 text-purple-800" },
  { value: "PARTNERSHIP", label: "Partnership", color: "bg-orange-100 text-orange-800" },
  { value: "INACTIVE", label: "Inactive", color: "bg-gray-100 text-gray-800" }
];

export default function BusinessNetworkEmployers() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [isEmployerDetailOpen, setIsEmployerDetailOpen] = useState(false);
  const [isAddEmployerOpen, setIsAddEmployerOpen] = useState(false);
  const [isEditEmployerOpen, setIsEditEmployerOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [employerData, setEmployerData] = useState<EmployerFormData>({
    nameEnglish: "",
    nameArabic: "",
    category: "",
    picture: "",
    description: "",
    industry: "",
    size: "",
    location: "",
    founded: "",
    status: "NEW",
    partnership: "",
    openPositions: "",
    placementRate: "",
    avgSalary: "",
    rating: "",
    benefits: "",
    tags: ""
  });

  useEffect(() => {
    fetchEmployers();
    fetchStats();
    fetchCompanies();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchEmployers();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, categoryFilter, statusFilter]);

  const fetchEmployers = async () => {
    try {
      const params = {
        limit: 100,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'ALL' && { category: categoryFilter }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      };

      const data = await apiClient.getEmployers(params);
      setEmployers(data.employers || []);
    } catch (err) {
      console.error('Failed to fetch employers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employers');
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

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      
      // Fetch both businesses and companies in parallel
      const [businessesData, companiesData] = await Promise.all([
        apiClient.getBusinesses({ limit: 100 }),
        apiClient.getCompaniesList()
      ]);

      const companyOptions: CompanyOption[] = [
        // Add businesses
        ...(businessesData.businesses || []).map((business: any) => ({
          id: business.id,
          name: business.name,
          type: 'business' as const,
          industry: business.industry,
          picture: business.picture
        })),
        // Add companies
        ...(companiesData.companies || []).map((company: any) => ({
          id: company.id,
          name: company.name,
          type: 'company' as const,
          industry: company.industry,
          logo: company.logo
        }))
      ];

      // Sort by name
      companyOptions.sort((a, b) => a.name.localeCompare(b.name));
      
      setCompanies(companyOptions);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleEmployerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const createData = {
        nameEnglish: employerData.nameEnglish,
        nameArabic: employerData.nameArabic || undefined,
        category: employerData.category,
        picture: employerData.picture || undefined,
        description: employerData.description || undefined,
        industry: employerData.industry || undefined,
        size: employerData.size || undefined,
        location: employerData.location || undefined,
        founded: employerData.founded || undefined,
        status: employerData.status,
        partnership: employerData.partnership || undefined,
        openPositions: employerData.openPositions ? parseInt(employerData.openPositions) : undefined,
        placementRate: employerData.placementRate ? parseFloat(employerData.placementRate) : undefined,
        avgSalary: employerData.avgSalary || undefined,
        rating: employerData.rating ? parseInt(employerData.rating) : undefined,
        benefits: employerData.benefits ? employerData.benefits.split(",").map(b => b.trim()).filter(Boolean) : undefined,
        tags: employerData.tags ? employerData.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined
      };

      await apiClient.createEmployer(createData);

      setIsAddEmployerOpen(false);
      resetForm();
      
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
      setEmployerData(prev => ({ ...prev, picture: URL.createObjectURL(file) }));
    }
  };

  const updateEmployerData = (field: string, value: string) => {
    setEmployerData(prev => ({ ...prev, [field]: value }));
  };

  const formatCategory = (category: string) => {
    return category.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    const statusConfig = employerStatuses.find(s => s.value === status);
    return statusConfig?.color || "bg-gray-100 text-gray-800";
  };

  const handleEmployerClick = (employer: Employer) => {
    setSelectedEmployer(employer);
    setIsEmployerDetailOpen(true);
  };

  const handleEditEmployer = (employer: Employer) => {
    setSelectedEmployer(employer);
    setEmployerData({
      nameEnglish: employer.nameEnglish,
      nameArabic: employer.nameArabic || "",
      category: employer.category,
      picture: employer.picture || "",
      description: employer.description || "",
      industry: employer.industry || "",
      size: employer.size || "",
      location: employer.location || "",
      founded: employer.founded || "",
      status: employer.status,
      partnership: employer.partnership || "",
      openPositions: employer.openPositions?.toString() || "",
      placementRate: employer.placementRate?.toString() || "",
      avgSalary: employer.avgSalary || "",
      rating: employer.rating?.toString() || "",
      benefits: employer.benefits?.join(", ") || "",
      tags: employer.tags?.join(", ") || ""
    });
    setIsEditEmployerOpen(true);
  };

  const handleUpdateEmployer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployer) return;

    setSubmitting(true);
    setError(null);

    try {
      const updateData = {
        nameEnglish: employerData.nameEnglish,
        nameArabic: employerData.nameArabic || undefined,
        category: employerData.category,
        picture: employerData.picture || undefined,
        description: employerData.description || undefined,
        industry: employerData.industry || undefined,
        size: employerData.size || undefined,
        location: employerData.location || undefined,
        founded: employerData.founded || undefined,
        status: employerData.status,
        partnership: employerData.partnership || undefined,
        openPositions: employerData.openPositions ? parseInt(employerData.openPositions) : undefined,
        placementRate: employerData.placementRate ? parseFloat(employerData.placementRate) : undefined,
        avgSalary: employerData.avgSalary || undefined,
        rating: employerData.rating ? parseInt(employerData.rating) : undefined,
        benefits: employerData.benefits ? employerData.benefits.split(",").map(b => b.trim()).filter(Boolean) : undefined,
        tags: employerData.tags ? employerData.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined
      };

      await apiClient.updateEmployer(selectedEmployer.id, updateData);

      setIsEditEmployerOpen(false);
      setSelectedEmployer(null);
      resetForm();
      
      // Refresh employers and stats
      await fetchEmployers();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployer = async (employerId: string) => {
    if (!confirm('Are you sure you want to delete this employer? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteEmployer(employerId);
      await fetchEmployers();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete employer');
    }
  };

  const resetForm = () => {
    setEmployerData({
      nameEnglish: "",
      nameArabic: "",
      category: "",
      picture: "",
      description: "",
      industry: "",
      size: "",
      location: "",
      founded: "",
      status: "NEW",
      partnership: "",
      openPositions: "",
      placementRate: "",
      avgSalary: "",
      rating: "",
      benefits: "",
      tags: ""
    });
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
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0" // Prevent content overflow
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-6 py-6">
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
                    placeholder="Search employers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 border-refined text-xs sm:text-sm h-9 sm:h-10"
                  />
                </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px] border-refined text-xs sm:text-sm h-9 sm:h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {employerCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] border-refined text-xs sm:text-sm h-9 sm:h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {employerStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none border-0 h-9 sm:h-10"
                >
                  <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-l-none border-0 h-9 sm:h-10"
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
                <Dialog open={isAddEmployerOpen} onOpenChange={setIsAddEmployerOpen}>
                  <DialogTrigger asChild>
                  <Button className="btn-premium text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add Employer</span>
                    <span className="sm:hidden">Add</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] glass-card border-refined flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle className="text-xl font-elegant text-gradient">Add New Employer</DialogTitle>
                      <DialogDescription className="text-refined">
                      Add a new employer to your recruitment network.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                      <form onSubmit={handleEmployerSubmit} className="space-y-6 pb-6">
                      <ImageUpload
                            id="employer-picture"
                        label="Company Logo"
                        value={employerData.picture}
                        onChange={(value) => updateEmployerData("picture", value || "")}
                        placeholder="Upload company logo"
                        size="lg"
                        shape="square"
                      />

                      <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium">Industry Category *</Label>
                        <Select value={employerData.category} onValueChange={(value) => updateEmployerData("category", value)}>
                          <SelectTrigger className="border-refined">
                          <SelectValue placeholder="Select industry category" />
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

                      <div className="space-y-2">
                      <Label htmlFor="nameEnglish" className="text-sm font-medium">Company Name (English) *</Label>
                        <Input
                          id="nameEnglish"
                        placeholder="Enter company name in English..."
                          value={employerData.nameEnglish}
                          onChange={(e) => updateEmployerData("nameEnglish", e.target.value)}
                          className="border-refined"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                      <Label htmlFor="nameArabic" className="text-sm font-medium">Company Name (Arabic)</Label>
                        <Input
                          id="nameArabic"
                        placeholder="اسم الشركة بالعربية (اختياري)"
                          value={employerData.nameArabic}
                          onChange={(e) => updateEmployerData("nameArabic", e.target.value)}
                          className="border-refined text-right"
                          dir="rtl"
                        />
                      <p className="text-xs text-muted-foreground">Optional - Arabic name for the company</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="size" className="text-sm font-medium">Company Size</Label>
                        <Select value={employerData.size} onValueChange={(value) => updateEmployerData("size", value)}>
                          <SelectTrigger className="border-refined">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            {companySizes.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">Partnership Status</Label>
                        <Select value={employerData.status} onValueChange={(value) => updateEmployerData("status", value)}>
                          <SelectTrigger className="border-refined">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {employerStatuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Company Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of the company and services..."
                          value={employerData.description}
                          onChange={(e) => updateEmployerData("description", e.target.value)}
                          className="border-refined min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                          <Input
                            id="location"
                            placeholder="City, Country"
                            value={employerData.location}
                            onChange={(e) => updateEmployerData("location", e.target.value)}
                            className="border-refined"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="founded" className="text-sm font-medium">Founded Year</Label>
                          <Input
                            id="founded"
                            placeholder="e.g., 2020"
                            value={employerData.founded}
                            onChange={(e) => updateEmployerData("founded", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="openPositions" className="text-sm font-medium">Open Positions</Label>
                          <Input
                            id="openPositions"
                            type="number"
                            placeholder="Number of open positions"
                            value={employerData.openPositions}
                            onChange={(e) => updateEmployerData("openPositions", e.target.value)}
                            className="border-refined"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="avgSalary" className="text-sm font-medium">Average Salary Range</Label>
                          <Input
                            id="avgSalary"
                            placeholder="e.g., 5000-8000 AED"
                            value={employerData.avgSalary}
                            onChange={(e) => updateEmployerData("avgSalary", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="benefits" className="text-sm font-medium">Benefits & Perks</Label>
                        <Input
                          id="benefits"
                          placeholder="Health insurance, visa sponsorship, housing allowance (comma separated)"
                          value={employerData.benefits}
                          onChange={(e) => updateEmployerData("benefits", e.target.value)}
                          className="border-refined"
                        />
                        <p className="text-xs text-muted-foreground">Separate multiple benefits with commas</p>
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
                    </div>
                  </DialogContent>
                </Dialog>
            </div>
          </motion.div>

          {/* Employer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
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

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
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

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Industries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {new Set(employers.filter(e => e.category).map(e => e.category)).size}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
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
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {employers.map((employer, index) => (
                        <motion.div
                          key={employer.id}
                          className="p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30 cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          onClick={() => handleEmployerClick(employer)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                                {employer.picture ? (
                                  <img 
                                    src={employer.picture} 
                                    alt={`${employer.nameEnglish} logo`}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <Building className="w-6 h-6 text-primary" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-lg">{employer.nameEnglish}</h4>
                                {employer.nameArabic && (
                                  <p className="text-sm text-muted-foreground text-right" dir="rtl">
                                    {employer.nameArabic}
                                  </p>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEmployerClick(employer); }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditEmployer(employer); }}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteEmployer(employer.id); }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {formatCategory(employer.category)}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(employer.status)}`}>
                                {employer.status}
                              </Badge>
                            </div>
                            
                            {employer.location && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-2" />
                                {employer.location}
                              </div>
                            )}
                            
                            {employer.openPositions && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Briefcase className="w-4 h-4 mr-2" />
                                {employer.openPositions} open positions
                              </div>
                            )}
                            
                            {employer.avgSalary && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <DollarSign className="w-4 h-4 mr-2" />
                                {employer.avgSalary}
                              </div>
                            )}
                            
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-2" />
                              Added {new Date(employer.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              {employer.rating && (
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                  <span className="text-sm">{employer.rating}/5</span>
                                </div>
                              )}
                            </div>
                            <Button size="sm" className="btn-premium" onClick={(e) => { e.stopPropagation(); handleEmployerClick(employer); }}>
                              View Details
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Open Positions</TableHead>
                            <TableHead>Avg Salary</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Added</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employers.map((employer) => (
                            <TableRow key={employer.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEmployerClick(employer)}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                                    {employer.picture ? (
                                      <img 
                                        src={employer.picture} 
                                        alt={`${employer.nameEnglish} logo`}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    ) : (
                                      <Building className="w-4 h-4 text-primary" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium">{employer.nameEnglish}</div>
                                    {employer.nameArabic && (
                                      <div className="text-sm text-muted-foreground" dir="rtl">
                                        {employer.nameArabic}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {formatCategory(employer.category)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-xs ${getStatusColor(employer.status)}`}>
                                  {employer.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{employer.location || '-'}</TableCell>
                              <TableCell>{employer.openPositions || '-'}</TableCell>
                              <TableCell>{employer.avgSalary || '-'}</TableCell>
                              <TableCell>
                                {employer.rating ? (
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                    <span>{employer.rating}/5</span>
                                  </div>
                                ) : '-'}
                              </TableCell>
                              <TableCell>{new Date(employer.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEmployerClick(employer); }}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditEmployer(employer); }}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteEmployer(employer.id); }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
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

        {/* Employer Detail Modal */}
        <Dialog open={isEmployerDetailOpen} onOpenChange={setIsEmployerDetailOpen}>
          <DialogContent className="sm:max-w-[700px] glass-card border-refined">
            <DialogHeader>
              <DialogTitle className="text-xl font-elegant text-gradient">
                {selectedEmployer?.nameEnglish}
              </DialogTitle>
              <DialogDescription className="text-refined">
                Employer details and partnership information
              </DialogDescription>
            </DialogHeader>
            {selectedEmployer && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                    {selectedEmployer.picture ? (
                      <img 
                        src={selectedEmployer.picture} 
                        alt={`${selectedEmployer.nameEnglish} logo`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedEmployer.nameEnglish}</h3>
                    {selectedEmployer.nameArabic && (
                      <p className="text-muted-foreground text-right" dir="rtl">
                        {selectedEmployer.nameArabic}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{formatCategory(selectedEmployer.category)}</Badge>
                      <Badge className={getStatusColor(selectedEmployer.status)}>
                        {selectedEmployer.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedEmployer.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedEmployer.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedEmployer.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedEmployer.location}</span>
                    </div>
                  )}
                  {selectedEmployer.founded && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Founded {selectedEmployer.founded}</span>
                    </div>
                  )}
                  {selectedEmployer.size && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{companySizes.find(s => s.value === selectedEmployer.size)?.label}</span>
                    </div>
                  )}
                  {selectedEmployer.openPositions && (
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedEmployer.openPositions} open positions</span>
                    </div>
                  )}
                  {selectedEmployer.avgSalary && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedEmployer.avgSalary}</span>
                    </div>
                  )}
                  {selectedEmployer.rating && (
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{selectedEmployer.rating}/5 rating</span>
                    </div>
                  )}
                </div>

                {selectedEmployer.benefits && selectedEmployer.benefits.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Benefits & Perks</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployer.benefits.map((benefit, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsEmployerDetailOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => { setIsEmployerDetailOpen(false); handleEditEmployer(selectedEmployer); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Employer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Employer Modal */}
        <Dialog open={isEditEmployerOpen} onOpenChange={setIsEditEmployerOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] glass-card border-refined flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-xl font-elegant text-gradient">Edit Employer</DialogTitle>
              <DialogDescription className="text-refined">
                Update employer information and partnership details.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              <form onSubmit={handleUpdateEmployer} className="space-y-4 pb-6">
              <ImageUpload
                id="edit-employer-picture"
                label="Company Logo"
                value={employerData.picture}
                onChange={(value) => updateEmployerData("picture", value || "")}
                placeholder="Upload company logo"
                size="lg"
                shape="square"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category" className="text-sm font-medium">Industry Category *</Label>
                  <Select value={employerData.category} onValueChange={(value) => updateEmployerData("category", value)}>
                    <SelectTrigger className="border-refined">
                      <SelectValue placeholder="Select industry category" />
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

                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-medium">Partnership Status</Label>
                  <Select value={employerData.status} onValueChange={(value) => updateEmployerData("status", value)}>
                    <SelectTrigger className="border-refined">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {employerStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nameEnglish" className="text-sm font-medium">Company Name (English) *</Label>
                <Input
                  id="edit-nameEnglish"
                  placeholder="Enter company name in English..."
                  value={employerData.nameEnglish}
                  onChange={(e) => updateEmployerData("nameEnglish", e.target.value)}
                  className="border-refined"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nameArabic" className="text-sm font-medium">Company Name (Arabic)</Label>
                <Input
                  id="edit-nameArabic"
                  placeholder="اسم الشركة بالعربية (اختياري)"
                  value={employerData.nameArabic}
                  onChange={(e) => updateEmployerData("nameArabic", e.target.value)}
                  className="border-refined text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-size" className="text-sm font-medium">Company Size</Label>
                <Select value={employerData.size} onValueChange={(value) => updateEmployerData("size", value)}>
                  <SelectTrigger className="border-refined">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Brief description of the company..."
                  value={employerData.description}
                  onChange={(e) => updateEmployerData("description", e.target.value)}
                  className="border-refined min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location" className="text-sm font-medium">Location</Label>
                  <Input
                    id="edit-location"
                    placeholder="City, Country"
                    value={employerData.location}
                    onChange={(e) => updateEmployerData("location", e.target.value)}
                    className="border-refined"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-founded" className="text-sm font-medium">Founded Year</Label>
                  <Input
                    id="edit-founded"
                    placeholder="e.g., 2020"
                    value={employerData.founded}
                    onChange={(e) => updateEmployerData("founded", e.target.value)}
                    className="border-refined"
                  />
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
                  onClick={() => setIsEditEmployerOpen(false)}
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Employer
                    </>
                  )}
                </Button>
              </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 