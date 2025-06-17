"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  Search, 
  Filter, 
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Building,
  Loader2,
  Globe,
  DollarSign,
  TrendingUp,
  UserCheck,
  Briefcase,
  Package,
  Gamepad2,
  Sparkles
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { AssetManager } from "@/components/ui/asset-manager";
import { CompanyAvatar } from "@/components/ui/profile-avatar";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Company {
  id: string;
  name: string;
  description?: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  foundedYear?: number;
  revenue?: string;
  employeeCount: number;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  tradeLicenseNumber?: string;
  tradeLicenseExpiry?: string;
  tradeLicenseDocument?: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  companyId: string;
  companyName: string;
}

interface CompanyFormData {
  name: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  foundedYear: string;
  revenue: string;
  logo: string;
  tradeLicenseNumber: string;
  tradeLicenseExpiry: string;
  tradeLicenseDocument: string;
}

export default function CompaniesPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const { user } = useAuth();
  const [managerPermissions, setManagerPermissions] = useState({
    canManageAssets: false,
    canModifyCompanies: false,
    canCreateCompanies: false,
    canDeleteCompanies: false,
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCompanyDetailOpen, setIsCompanyDetailOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);
  const [selectedCompanyForAssets, setSelectedCompanyForAssets] = useState<Company | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [industrySearchTerm, setIndustrySearchTerm] = useState("");
  const [isAddIndustryOpen, setIsAddIndustryOpen] = useState(false);
  const [newIndustryName, setNewIndustryName] = useState("");
  const [customIndustries, setCustomIndustries] = useState<string[]>([]);
  const [companyData, setCompanyData] = useState<CompanyFormData>({
    name: "",
    description: "",
    industry: "",
    size: "",
    location: "",
    website: "",
    email: "",
    phone: "",
    status: "ACTIVE",
    foundedYear: "",
    revenue: "",
    logo: "",
    tradeLicenseNumber: "",
    tradeLicenseExpiry: "",
    tradeLicenseDocument: ""
  });

  // Default industries list
  const defaultIndustries = [
    "Technology",
    "Finance", 
    "Healthcare",
    "Energy",
    "Manufacturing",
    "Retail",
    "Education",
    "Real Estate",
    "Entertainment & Events",
    "Hospitality",
    "Construction",
    "Transportation",
    "Agriculture",
    "Media & Communications",
    "Professional Services",
    "Non-Profit",
    "Government",
    "Food & Beverage"
  ];

  // Combined industries list (default + custom)
  const allIndustries = [...defaultIndustries, ...customIndustries];

  // Filtered industries based on search
  const filteredIndustries = allIndustries.filter(industry =>
    industry.toLowerCase().includes(industrySearchTerm.toLowerCase())
  );

  // For managers, companies are already filtered in fetchManagerCompanies
  // For admins/super admins, apply filters here
  const filteredCompanies = user?.role === 'MANAGER' 
    ? companies 
    : companies.filter(company => {
        const matchesSearch = !searchTerm || 
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesIndustry = industryFilter === 'ALL' || company.industry === industryFilter;
        const matchesStatus = statusFilter === 'ALL' || company.status === statusFilter;
        
        return matchesSearch && matchesIndustry && matchesStatus;
      });

  useEffect(() => {
    fetchCompanies();
    fetchEmployees();
    if (user?.role === 'MANAGER') {
      fetchManagerPermissions();
    }
  }, [user]);

  const fetchManagerPermissions = async () => {
    try {
      if (!user?.id) return;
      
      const data = await apiClient.getManagerAssignments({
        userId: user.id
      });
      
      if (data.assignments && data.assignments.length > 0) {
        const permissions = data.assignments[0].permissions || {};
        setManagerPermissions({
          canManageAssets: permissions.canManageAssets || false,
          canModifyCompanies: permissions.canModifyCompanies || false,
          canCreateCompanies: permissions.canCreateCompanies || false,
          canDeleteCompanies: permissions.canDeleteCompanies || false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch manager permissions:', error);
    }
  };

  // Helper function to check if user can perform action
  const canPerformAction = (action: 'create' | 'modify' | 'delete' | 'manageAssets'): boolean => {
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      return true;
    }
    
    if (user?.role === 'MANAGER') {
      switch (action) {
        case 'create':
          return managerPermissions.canCreateCompanies;
        case 'modify':
          return managerPermissions.canModifyCompanies;
        case 'delete':
          return managerPermissions.canDeleteCompanies;
        case 'manageAssets':
          return managerPermissions.canManageAssets;
        default:
          return false;
      }
    }
    
    return false;
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchCompanies();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, industryFilter, statusFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      // For managers, fetch only their assigned companies
      if (user?.role === 'MANAGER') {
        await fetchManagerCompanies();
      } else {
        // For admins and super admins, fetch all companies
        const params = {
          limit: 100,
          ...(searchTerm && { search: searchTerm }),
          ...(industryFilter !== 'ALL' && { industry: industryFilter }),
          ...(statusFilter !== 'ALL' && { status: statusFilter }),
        };

        const data = await apiClient.getCompanies(params);
        setCompanies(data.companies || []);
        
        // Auto-create MARAH company if it doesn't exist
        await ensureMarahCompanyExists(data.companies || []);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagerCompanies = async () => {
    try {
      if (!user?.id) return;
      
      // Use API client to get manager assignments
      const data = await apiClient.getManagerAssignments({
        userId: user.id
      });
      
      const assignedCompanyIds = data.assignments?.map((assignment: any) => assignment.companyId) || [];
      
      if (assignedCompanyIds.length > 0) {
        // Fetch details for assigned companies using the main companies endpoint
        // This will automatically filter to only show assigned companies for managers
        const companiesData = await apiClient.getCompanies({ limit: 1000 });
        
        // Apply additional filters if needed
        let filteredCompanies = companiesData.companies;
        
        if (searchTerm) {
          filteredCompanies = filteredCompanies.filter(company => 
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (industryFilter !== 'ALL') {
          filteredCompanies = filteredCompanies.filter(company => 
            company.industry === industryFilter
          );
        }
        
        if (statusFilter !== 'ALL') {
          filteredCompanies = filteredCompanies.filter(company => 
            company.status === statusFilter
          );
        }
        
        setCompanies(filteredCompanies);
        
        // Fetch employees for assigned companies
        await fetchManagerEmployees(assignedCompanyIds);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching manager companies:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch companies');
      setCompanies([]);
    }
  };

  const fetchManagerEmployees = async (companyIds: string[]) => {
    try {
      const employeePromises = companyIds.map(companyId => 
        apiClient.getEmployees({ companyId, limit: 1000 }).catch(err => {
          console.error(`Failed to fetch employees for company ${companyId}:`, err);
          return { employees: [] };
        })
      );
      
      const employeeResults = await Promise.all(employeePromises);
      const allEmployees = employeeResults.flatMap(result => result.employees || []);
      setEmployees(allEmployees);
    } catch (error) {
      console.error('Error fetching manager employees:', error);
      setEmployees([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      if (user?.role === 'MANAGER') {
        // For managers, only fetch employees from their assigned companies
        // We'll fetch this after we have the company data
        setEmployees([]);
      } else {
        // For admins and super admins, fetch all employees
        const data = await apiClient.getEmployees({ limit: 1000 });
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const ensureMarahCompanyExists = async (companies: Company[]) => {
    // Only auto-create MARAH for super admins and admins, not for managers
    const userRole = user?.role;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      return; // Managers should only see their assigned companies
    }
    
    const marahExists = companies.some(company => company.name === 'MARAH Inflatable Games Rental');
    
    if (!marahExists) {
      try {
        const response = await fetch('/api/companies/marah', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Add the new company to the list
          setCompanies(prev => [data.company, ...prev]);
        }
      } catch (err) {
        console.error('Failed to auto-create Marah company:', err);
        // Don't show error to user for auto-creation failure
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCompanyClick = async (company: Company) => {
    try {
      const detailedCompany = await apiClient.getCompanyById(company.id);
      setSelectedCompany(detailedCompany);
      setIsCompanyDetailOpen(true);
    } catch (err) {
      console.error('Failed to fetch company details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch company details');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...companyData,
        foundedYear: companyData.foundedYear ? parseInt(companyData.foundedYear) : undefined,
        logo: companyData.logo || undefined,
        tradeLicenseExpiry: companyData.tradeLicenseExpiry ? new Date(companyData.tradeLicenseExpiry).toISOString() : undefined,
        tradeLicenseDocument: companyData.tradeLicenseDocument || undefined,
      };

      const newCompany = await apiClient.createCompany(payload);
      setCompanies(prev => [...prev, newCompany]);
      setIsAddCompanyOpen(false);
      
      // Reset form
      setCompanyData({
        name: "",
        description: "",
        industry: "",
        size: "",
        location: "",
        website: "",
        email: "",
        phone: "",
        status: "ACTIVE",
        foundedYear: "",
        revenue: "",
        logo: "",
        tradeLicenseNumber: "",
        tradeLicenseExpiry: "",
        tradeLicenseDocument: ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setCompanyData({
      name: company.name,
      description: company.description || "",
      industry: company.industry,
      size: company.size,
      location: company.location,
      website: company.website || "",
      email: company.email,
      phone: company.phone,
      status: company.status,
      foundedYear: company.foundedYear?.toString() || "",
      revenue: company.revenue || "",
      logo: company.logo || "",
      tradeLicenseNumber: "",
      tradeLicenseExpiry: "",
      tradeLicenseDocument: ""
    });
    setIsEditCompanyOpen(true);
  };

  const handleUpdateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompany) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...companyData,
        foundedYear: companyData.foundedYear ? parseInt(companyData.foundedYear) : undefined,
        logo: companyData.logo || undefined,
        tradeLicenseExpiry: companyData.tradeLicenseExpiry ? new Date(companyData.tradeLicenseExpiry).toISOString() : undefined,
        tradeLicenseDocument: companyData.tradeLicenseDocument || undefined,
      };

      const updatedCompany = await apiClient.updateCompany(selectedCompany.id, payload);
      setCompanies(prev => prev.map(c => c.id === selectedCompany.id ? updatedCompany : c));
      setIsEditCompanyOpen(false);
      setSelectedCompany(null);
      
      // Reset form
      setCompanyData({
        name: "",
        description: "",
        industry: "",
        size: "",
        location: "",
        website: "",
        email: "",
        phone: "",
        status: "ACTIVE",
        foundedYear: "",
        revenue: "",
        logo: "",
        tradeLicenseNumber: "",
        tradeLicenseExpiry: "",
        tradeLicenseDocument: ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteCompany(companyId);
      setCompanies(prev => prev.filter(c => c.id !== companyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company');
    }
  };

  const updateCompanyData = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleManageAssets = (company: Company) => {
    setSelectedCompanyForAssets(company);
    setIsAssetManagerOpen(true);
  };

  const getCompanyEmployees = (companyId: string) => {
    return employees.filter(emp => emp.companyId === companyId);
  };

  const isMarahCompany = (company: Company) => {
    return company.name === 'MARAH Inflatable Games Rental';
  };

  const getMarahCompany = () => {
    return companies.find(company => isMarahCompany(company));
  };

  const handleAddIndustry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newIndustryName.trim()) {
      setError("Industry name is required");
      return;
    }

    // Check if industry already exists
    if (allIndustries.some(industry => 
      industry.toLowerCase() === newIndustryName.trim().toLowerCase()
    )) {
      setError("This industry already exists");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Add to custom industries
      setCustomIndustries(prev => [...prev, newIndustryName.trim()]);
      
      // Set as selected industry
      setCompanyData(prev => ({ ...prev, industry: newIndustryName.trim() }));
      
      // Save to localStorage for persistence
      const savedIndustries = JSON.parse(localStorage.getItem('customIndustries') || '[]');
      savedIndustries.push(newIndustryName.trim());
      localStorage.setItem('customIndustries', JSON.stringify(savedIndustries));
      
      // Reset and close
      setNewIndustryName("");
      setIsAddIndustryOpen(false);
      
    } catch (err) {
      console.error('Failed to add industry:', err);
      setError(err instanceof Error ? err.message : 'Failed to add industry');
    } finally {
      setSubmitting(false);
    }
  };

  // Load custom industries from localStorage on component mount
  useEffect(() => {
    const savedIndustries = JSON.parse(localStorage.getItem('customIndustries') || '[]');
    setCustomIndustries(savedIndustries);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading companies...</span>
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
        "min-w-0"
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Page Header */}
          <motion.div 
            className="mb-6 sm:mb-8"
            {...fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl font-prestigious text-gradient mb-2">
              Company Management
            </h2>
            <p className="text-sm sm:text-base text-refined text-muted-foreground">
              Manage companies and their organizational structure.
            </p>
          </motion.div>

          {/* Action Bar */}
          <motion.div 
            className="flex flex-col gap-4 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search and Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-refined h-11"
                />
              </div>
              
              {/* Filters - Stack on mobile, inline on larger screens */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="w-full sm:w-40 border-refined h-11">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Industries</SelectItem>
                    <div className="border-t border-border/50 my-2"></div>
                    <div className="flex items-center px-3 pb-2">
                      <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                      <Input
                        placeholder="Search industries..."
                        value={industrySearchTerm}
                        onChange={(e) => setIndustrySearchTerm(e.target.value)}
                        className="h-8 border-none focus:ring-0 focus:ring-offset-0"
                      />
                    </div>
                    <div className="border-t border-border/50 mb-2"></div>
                    <div className="px-2 pb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left border-dashed border-primary/50 text-primary hover:bg-primary/5"
                        onClick={() => setIsAddIndustryOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Industry
                      </Button>
                    </div>
                    {filteredIndustries.length > 0 ? (
                      filteredIndustries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-2" />
                            <span>{industry}</span>
                            {customIndustries.includes(industry) && (
                              <Badge variant="secondary" className="ml-2 text-xs">Custom</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : industrySearchTerm ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No industries found matching "{industrySearchTerm}"
                      </div>
                    ) : null}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32 border-refined h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Mode and Add Button Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center border border-border rounded-lg p-1 w-fit">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-9 px-4"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-9 px-4"
                >
                  Table
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {canPerformAction('create') && (
                  <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-premium h-11 w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Company
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] glass-card border-refined max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-elegant text-gradient">Add New Company</DialogTitle>
                      <DialogDescription className="text-refined">
                        Create a new company profile with organizational details.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                      <form onSubmit={handleCreateCompany} className="space-y-6">
                        <ImageUpload
                          id="company-logo"
                          label="Company Logo"
                          value={companyData.logo}
                          onChange={(value) => updateCompanyData("logo", value || "")}
                          placeholder="Upload company logo"
                          size="lg"
                          shape="square"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">Company Name *</Label>
                            <Input
                              id="name"
                              placeholder="Enter company name..."
                              value={companyData.name}
                              onChange={(e) => updateCompanyData("name", e.target.value)}
                              className="border-refined"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="industry" className="text-sm font-medium">Industry *</Label>
                            <Select value={companyData.industry} onValueChange={(value) => updateCompanyData("industry", value)}>
                              <SelectTrigger className="border-refined">
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                              <SelectContent>
                                <div className="flex items-center px-3 pb-2">
                                  <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                                  <Input
                                    placeholder="Search industries..."
                                    value={industrySearchTerm}
                                    onChange={(e) => setIndustrySearchTerm(e.target.value)}
                                    className="h-8 border-none focus:ring-0 focus:ring-offset-0"
                                  />
                                </div>
                                <div className="border-t border-border/50 mb-2"></div>
                                <div className="px-2 pb-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-left border-dashed border-primary/50 text-primary hover:bg-primary/5"
                                    onClick={() => setIsAddIndustryOpen(true)}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Industry
                                  </Button>
                                </div>
                                {filteredIndustries.length > 0 ? (
                                  filteredIndustries.map((industry) => (
                                    <SelectItem key={industry} value={industry}>
                                      <div className="flex items-center">
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        <span>{industry}</span>
                                        {customIndustries.includes(industry) && (
                                          <Badge variant="secondary" className="ml-2 text-xs">Custom</Badge>
                                        )}
                                      </div>
                                    </SelectItem>
                                  ))
                                ) : industrySearchTerm ? (
                                  <div className="px-3 py-2 text-sm text-muted-foreground">
                                    No industries found matching "{industrySearchTerm}"
                                  </div>
                                ) : null}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe the company..."
                            value={companyData.description}
                            onChange={(e) => updateCompanyData("description", e.target.value)}
                            className="border-refined min-h-[100px]"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="company@example.com"
                              value={companyData.email}
                              onChange={(e) => updateCompanyData("email", e.target.value)}
                              className="border-refined"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">Phone *</Label>
                            <Input
                              id="phone"
                              placeholder="+1-555-0123"
                              value={companyData.phone}
                              onChange={(e) => updateCompanyData("phone", e.target.value)}
                              className="border-refined"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
                            <Input
                              id="location"
                              placeholder="City, State/Country"
                              value={companyData.location}
                              onChange={(e) => updateCompanyData("location", e.target.value)}
                              className="border-refined"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                            <Input
                              id="website"
                              placeholder="https://company.com"
                              value={companyData.website}
                              onChange={(e) => updateCompanyData("website", e.target.value)}
                              className="border-refined"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="size" className="text-sm font-medium">Company Size</Label>
                            <Select value={companyData.size} onValueChange={(value) => updateCompanyData("size", value)}>
                              <SelectTrigger className="border-refined">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-10">1-10 employees</SelectItem>
                                <SelectItem value="11-50">11-50 employees</SelectItem>
                                <SelectItem value="51-200">51-200 employees</SelectItem>
                                <SelectItem value="201-500">201-500 employees</SelectItem>
                                <SelectItem value="501-1000">501-1000 employees</SelectItem>
                                <SelectItem value="1000+">1000+ employees</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="foundedYear" className="text-sm font-medium">Founded Year</Label>
                            <Input
                              id="foundedYear"
                              type="number"
                              placeholder="2020"
                              value={companyData.foundedYear}
                              onChange={(e) => updateCompanyData("foundedYear", e.target.value)}
                              className="border-refined"
                              min="1800"
                              max={new Date().getFullYear()}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                            <Select value={companyData.status} onValueChange={(value) => updateCompanyData("status", value)}>
                              <SelectTrigger className="border-refined">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="revenue" className="text-sm font-medium">Annual Revenue</Label>
                          <Select value={companyData.revenue} onValueChange={(value) => updateCompanyData("revenue", value)}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select revenue range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Under AED 3.7M">Under AED 3.7M</SelectItem>
                              <SelectItem value="AED 3.7M - AED 18.4M">AED 3.7M - AED 18.4M</SelectItem>
                              <SelectItem value="AED 18.4M - AED 36.7M">AED 18.4M - AED 36.7M</SelectItem>
                              <SelectItem value="AED 36.7M - AED 183.7M">AED 36.7M - AED 183.7M</SelectItem>
                              <SelectItem value="AED 183.7M - AED 367M">AED 183.7M - AED 367M</SelectItem>
                              <SelectItem value="AED 367M+">AED 367M+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Trade License Section */}
                        <div className="space-y-4">
                          <Label className="text-base font-medium">Trade License Information</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="tradeLicenseNumber" className="text-sm font-medium">Trade License Number</Label>
                              <Input
                                id="tradeLicenseNumber"
                                placeholder="Enter license number..."
                                value={companyData.tradeLicenseNumber}
                                onChange={(e) => updateCompanyData("tradeLicenseNumber", e.target.value)}
                                className="border-refined"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="tradeLicenseExpiry" className="text-sm font-medium">License Expiry Date</Label>
                              <Input
                                id="tradeLicenseExpiry"
                                type="date"
                                value={companyData.tradeLicenseExpiry}
                                onChange={(e) => updateCompanyData("tradeLicenseExpiry", e.target.value)}
                                className="border-refined"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tradeLicenseDocument" className="text-sm font-medium">Trade License Document</Label>
                            <ImageUpload
                              id="trade-license-document"
                              label=""
                              value={companyData.tradeLicenseDocument}
                              onChange={(value) => updateCompanyData("tradeLicenseDocument", value || "")}
                              placeholder="Upload trade license document"
                              size="md"
                              shape="square"
                            />
                          </div>
                        </div>

                        {/* Asset Management Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Asset Management</Label>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                // Create a temporary company object for asset management
                                const tempCompany: Company = {
                                  id: 'temp',
                                  name: companyData.name || 'New Company',
                                  description: companyData.description,
                                  industry: companyData.industry || 'Technology',
                                  size: companyData.size || 'Small',
                                  location: companyData.location || 'UAE',
                                  website: companyData.website,
                                  email: companyData.email || 'temp@example.com',
                                  phone: companyData.phone || '+971000000000',
                                  status: companyData.status || 'ACTIVE',
                                  foundedYear: companyData.foundedYear ? parseInt(companyData.foundedYear) : undefined,
                                  revenue: companyData.revenue,
                                  logo: companyData.logo,
                                  employeeCount: 0,
                                  createdAt: new Date().toISOString(),
                                  updatedAt: new Date().toISOString(),
                                };
                                handleManageAssets(tempCompany);
                              }}
                              className="text-sm"
                              disabled={!companyData.name}
                            >
                              Manage Assets
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Add and manage company assets with automatic depreciation tracking after creating the company.
                          </p>
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
                            onClick={() => setIsAddCompanyOpen(false)}
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
                                Creating...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Company
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </DialogContent>
                </Dialog>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Total Companies</span>
                    <span className="sm:hidden">Total</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-gradient">
                    {companies.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Companies registered
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    <span className="hidden sm:inline">Active Companies</span>
                    <span className="sm:hidden">Active</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {companies.filter(c => c.status === 'ACTIVE').length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Currently active
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Total Employees</span>
                    <span className="sm:hidden">Employees</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {companies.reduce((sum, c) => sum + c.employeeCount, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Across all companies
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="hidden sm:inline">Industries</span>
                    <span className="sm:hidden">Industries</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {new Set(companies.map(c => c.industry)).size}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Different sectors
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Companies Display */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-xl font-elegant">Companies Directory</CardTitle>
                <CardDescription className="text-refined">
                  {filteredCompanies.length} companies found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredCompanies.map((company, index) => (
                      <motion.div
                        key={company.id}
                        className="group p-4 sm:p-6 rounded-xl bg-gradient-to-br from-white to-gray-50/50 hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 border border-border/30 hover:border-blue-200 cursor-pointer shadow-sm hover:shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => handleCompanyClick(company)}
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                          <div className="relative group-hover:scale-105 transition-transform duration-300">
                            <CompanyAvatar
                              company={company}
                              size="xl"
                              className="shadow-lg ring-2 ring-white/10"
                            />
                            {isMarahCompany(company) && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <Sparkles className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base sm:text-lg text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                              {company.name}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">{company.industry}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={cn("text-xs", getStatusColor(company.status))}>
                                {company.status}
                              </Badge>
                              {isMarahCompany(company) && (
                                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  MARAH
                                </Badge>
                              )}
                              {company.size && (
                                <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                                  {company.size}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{company.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{company.employeeCount} employees</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{company.email}</span>
                          </div>
                          {company.website && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{company.website}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompanyClick(company);
                              }}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {canPerformAction('modify') && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCompany(company);
                                }}
                                title="Edit Company"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {canPerformAction('manageAssets') && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleManageAssets(company);
                                }}
                                title="Manage Assets"
                              >
                                <Briefcase className="w-4 h-4" />
                              </Button>
                            )}
                            {isMarahCompany(company) && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 hover:text-purple-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = '/marah/home';
                                }}
                                title="Open MARAH Dashboard"
                              >
                                <Gamepad2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          {canPerformAction('delete') && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCompany(company.id);
                              }}
                              title="Delete Company"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-full inline-block align-middle">
                      <div className="overflow-hidden border border-border/30 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/50">
                              <TableHead className="font-semibold text-gray-900 min-w-[200px]">Company</TableHead>
                              <TableHead className="font-semibold text-gray-900 min-w-[120px]">Industry</TableHead>
                              <TableHead className="font-semibold text-gray-900 min-w-[100px]">Status</TableHead>
                              <TableHead className="font-semibold text-gray-900 min-w-[150px]">Location</TableHead>
                              <TableHead className="font-semibold text-gray-900 min-w-[100px]">Employees</TableHead>
                              <TableHead className="font-semibold text-gray-900 min-w-[120px] text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCompanies.map((company) => (
                              <TableRow 
                                key={company.id} 
                                className="cursor-pointer hover:bg-blue-50/50 transition-colors border-b border-border/20" 
                                onClick={() => handleCompanyClick(company)}
                              >
                                <TableCell className="py-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="relative">
                                      <CompanyAvatar
                                        company={company}
                                        size="lg"
                                        className="shadow-md ring-1 ring-white/10"
                                      />
                                      {isMarahCompany(company) && (
                                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                          <Sparkles className="w-2 h-2 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-semibold text-gray-900 truncate">{company.name}</div>
                                      <div className="text-sm text-muted-foreground truncate">{company.email}</div>
                                      {isMarahCompany(company) && (
                                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs mt-1">
                                          <Sparkles className="w-3 h-3 mr-1" />
                                          MARAH
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="text-sm font-medium">{company.industry}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <Badge className={cn("text-xs", getStatusColor(company.status))}>
                                    {company.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="text-sm text-gray-600 truncate">{company.location}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="text-sm font-medium">{company.employeeCount}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="flex items-center justify-end space-x-1">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCompanyClick(company);
                                      }}
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {canPerformAction('modify') && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditCompany(company);
                                        }}
                                        title="Edit Company"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {canPerformAction('manageAssets') && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleManageAssets(company);
                                        }}
                                        title="Manage Assets"
                                      >
                                        <Briefcase className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {isMarahCompany(company) && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-8 w-8 p-0 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 hover:text-purple-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.location.href = '/marah/home';
                                        }}
                                        title="Open MARAH Dashboard"
                                      >
                                        <Gamepad2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {canPerformAction('delete') && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCompany(company.id);
                                        }}
                                        title="Delete Company"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                )}

                {filteredCompanies.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        {searchTerm || industryFilter !== "ALL" || statusFilter !== "ALL" ? 'No companies found' : 'No companies yet'}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 max-w-md mx-auto">
                        {searchTerm || industryFilter !== "ALL" || statusFilter !== "ALL"
                          ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                          : 'Start building your business network by adding your first company to the platform.'
                        }
                      </p>
                      {!(searchTerm || industryFilter !== "ALL" || statusFilter !== "ALL") && (
                        <Button 
                          onClick={() => setIsAddCompanyOpen(true)}
                          className="btn-premium"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Company
                        </Button>
                      )}
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Company Detail Dialog */}
          <Dialog open={isCompanyDetailOpen} onOpenChange={setIsCompanyDetailOpen}>
            <DialogContent className="sm:max-w-[800px] glass-card border-refined max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-elegant text-gradient">Company Details</DialogTitle>
                <DialogDescription className="text-refined">
                  Complete company information and profile
                </DialogDescription>
              </DialogHeader>
              {selectedCompany && (
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <CompanyAvatar
                        company={selectedCompany}
                        size="3xl"
                        className="shadow-2xl ring-4 ring-white/20"
                      />
                      {isMarahCompany(selectedCompany) && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{selectedCompany.name}</h3>
                      <p className="text-muted-foreground">{selectedCompany.industry}</p>
                      <p className="text-sm text-muted-foreground">{selectedCompany.location}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStatusColor(selectedCompany.status)}>
                          {selectedCompany.status}
                        </Badge>
                        <Badge variant="outline">{selectedCompany.size}</Badge>
                        <Badge variant="outline">{selectedCompany.employeeCount} employees</Badge>
                      </div>
                    </div>
                  </div>

                  {selectedCompany.description && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedCompany.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          {selectedCompany.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                          {selectedCompany.phone}
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          {selectedCompany.location}
                        </div>
                        {selectedCompany.website && (
                          <div className="flex items-center text-sm">
                            <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                            <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {selectedCompany.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Company Details</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Industry:</span> {selectedCompany.industry}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Size:</span> {selectedCompany.size}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Status:</span> {selectedCompany.status}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Employees:</span> {selectedCompany.employeeCount}
                        </div>
                        {selectedCompany.foundedYear && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Founded:</span> {selectedCompany.foundedYear}
                          </div>
                        )}
                        {selectedCompany.revenue && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Revenue:</span> {selectedCompany.revenue}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Trade License Information */}
                  {(selectedCompany.tradeLicenseNumber || selectedCompany.tradeLicenseExpiry) && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Trade License Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCompany.tradeLicenseNumber && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-sm font-medium text-blue-800">License Number</div>
                            <div className="text-base font-semibold text-blue-900">{selectedCompany.tradeLicenseNumber}</div>
                          </div>
                        )}
                        {selectedCompany.tradeLicenseExpiry && (
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="text-sm font-medium text-orange-800">License Expiry</div>
                            <div className="text-base font-semibold text-orange-900">{formatDate(selectedCompany.tradeLicenseExpiry)}</div>
                          </div>
                        )}
                      </div>
                      {selectedCompany.tradeLicenseDocument && (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">License Document</div>
                          <div className="text-sm text-gray-600 mt-1">Document uploaded and stored</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financial Information */}
                  {selectedCompany.revenue && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Financial Information</h4>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-800">Annual Revenue</div>
                        <div className="text-xl font-bold text-green-900">{selectedCompany.revenue}</div>
                      </div>
                    </div>
                  )}

                  {/* Timeline Information */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Timeline</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Created:</span> {formatDate(selectedCompany.createdAt)}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Last Updated:</span> {formatDate(selectedCompany.updatedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setIsCompanyDetailOpen(false)}>
                      Close
                    </Button>
                    <Button variant="outline" onClick={() => handleManageAssets(selectedCompany)}>
                      <Package className="w-4 h-4 mr-2" />
                      Manage Assets
                    </Button>
                    <Button className="btn-premium" onClick={() => handleEditCompany(selectedCompany)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Company
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Company Dialog */}
          <Dialog open={isEditCompanyOpen} onOpenChange={setIsEditCompanyOpen}>
            <DialogContent className="sm:max-w-[600px] glass-card border-refined max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-elegant text-gradient">Edit Company</DialogTitle>
                <DialogDescription className="text-refined">
                  Update company information and details.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                <form onSubmit={handleUpdateCompany} className="space-y-6">
                  <ImageUpload
                    id="edit-company-logo"
                    label="Company Logo"
                    value={companyData.logo}
                    onChange={(value) => updateCompanyData("logo", value || "")}
                    placeholder="Upload company logo"
                    size="lg"
                    shape="square"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Company Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter company name..."
                        value={companyData.name}
                        onChange={(e) => updateCompanyData("name", e.target.value)}
                        className="border-refined"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-sm font-medium">Industry *</Label>
                      <Select value={companyData.industry} onValueChange={(value) => updateCompanyData("industry", value)}>
                        <SelectTrigger className="border-refined">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="flex items-center px-3 pb-2">
                            <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                            <Input
                              placeholder="Search industries..."
                              value={industrySearchTerm}
                              onChange={(e) => setIndustrySearchTerm(e.target.value)}
                              className="h-8 border-none focus:ring-0 focus:ring-offset-0"
                            />
                          </div>
                          <div className="border-t border-border/50 mb-2"></div>
                          <div className="px-2 pb-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-left border-dashed border-primary/50 text-primary hover:bg-primary/5"
                              onClick={() => setIsAddIndustryOpen(true)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add New Industry
                            </Button>
                          </div>
                          {filteredIndustries.length > 0 ? (
                            filteredIndustries.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                <div className="flex items-center">
                                  <Briefcase className="w-4 h-4 mr-2" />
                                  <span>{industry}</span>
                                  {customIndustries.includes(industry) && (
                                    <Badge variant="secondary" className="ml-2 text-xs">Custom</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          ) : industrySearchTerm ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              No industries found matching "{industrySearchTerm}"
                            </div>
                          ) : null}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the company..."
                      value={companyData.description}
                      onChange={(e) => updateCompanyData("description", e.target.value)}
                      className="border-refined min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="company@example.com"
                        value={companyData.email}
                        onChange={(e) => updateCompanyData("email", e.target.value)}
                        className="border-refined"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone *</Label>
                      <Input
                        id="phone"
                        placeholder="+1-555-0123"
                        value={companyData.phone}
                        onChange={(e) => updateCompanyData("phone", e.target.value)}
                        className="border-refined"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
                      <Input
                        id="location"
                        placeholder="City, State/Country"
                        value={companyData.location}
                        onChange={(e) => updateCompanyData("location", e.target.value)}
                        className="border-refined"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://company.com"
                        value={companyData.website}
                        onChange={(e) => updateCompanyData("website", e.target.value)}
                        className="border-refined"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="size" className="text-sm font-medium">Company Size</Label>
                      <Select value={companyData.size} onValueChange={(value) => updateCompanyData("size", value)}>
                        <SelectTrigger className="border-refined">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501-1000">501-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="foundedYear" className="text-sm font-medium">Founded Year</Label>
                      <Input
                        id="foundedYear"
                        type="number"
                        placeholder="2020"
                        value={companyData.foundedYear}
                        onChange={(e) => updateCompanyData("foundedYear", e.target.value)}
                        className="border-refined"
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select value={companyData.status} onValueChange={(value) => updateCompanyData("status", value)}>
                        <SelectTrigger className="border-refined">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="revenue" className="text-sm font-medium">Annual Revenue</Label>
                    <Select value={companyData.revenue} onValueChange={(value) => updateCompanyData("revenue", value)}>
                      <SelectTrigger className="border-refined">
                        <SelectValue placeholder="Select revenue range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Under AED 3.7M">Under AED 3.7M</SelectItem>
                        <SelectItem value="AED 3.7M - AED 18.4M">AED 3.7M - AED 18.4M</SelectItem>
                        <SelectItem value="AED 18.4M - AED 36.7M">AED 18.4M - AED 36.7M</SelectItem>
                        <SelectItem value="AED 36.7M - AED 183.7M">AED 36.7M - AED 183.7M</SelectItem>
                        <SelectItem value="AED 183.7M - AED 367M">AED 183.7M - AED 367M</SelectItem>
                        <SelectItem value="AED 367M+">AED 367M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trade License Section */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Trade License Information</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tradeLicenseNumber" className="text-sm font-medium">Trade License Number</Label>
                        <Input
                          id="tradeLicenseNumber"
                          placeholder="Enter license number..."
                          value={companyData.tradeLicenseNumber}
                          onChange={(e) => updateCompanyData("tradeLicenseNumber", e.target.value)}
                          className="border-refined"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tradeLicenseExpiry" className="text-sm font-medium">License Expiry Date</Label>
                        <Input
                          id="tradeLicenseExpiry"
                          type="date"
                          value={companyData.tradeLicenseExpiry}
                          onChange={(e) => updateCompanyData("tradeLicenseExpiry", e.target.value)}
                          className="border-refined"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tradeLicenseDocument" className="text-sm font-medium">Trade License Document</Label>
                      <ImageUpload
                        id="trade-license-document"
                        label=""
                        value={companyData.tradeLicenseDocument}
                        onChange={(value) => updateCompanyData("tradeLicenseDocument", value || "")}
                        placeholder="Upload trade license document"
                        size="md"
                        shape="square"
                      />
                    </div>
                  </div>

                  {/* Asset Management Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Asset Management</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // Create a temporary company object for asset management
                          const tempCompany: Company = {
                            id: 'temp',
                            name: companyData.name || 'New Company',
                            description: companyData.description,
                            industry: companyData.industry || 'Technology',
                            size: companyData.size || 'Small',
                            location: companyData.location || 'UAE',
                            website: companyData.website,
                            email: companyData.email || 'temp@example.com',
                            phone: companyData.phone || '+971000000000',
                            status: companyData.status || 'ACTIVE',
                            foundedYear: companyData.foundedYear ? parseInt(companyData.foundedYear) : undefined,
                            revenue: companyData.revenue,
                            logo: companyData.logo,
                            employeeCount: 0,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          };
                          handleManageAssets(tempCompany);
                        }}
                        className="text-sm"
                        disabled={!companyData.name}
                      >
                        Manage Assets
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add and manage company assets with automatic depreciation tracking after creating the company.
                    </p>
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
                      onClick={() => setIsEditCompanyOpen(false)}
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
                          Update Company
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>

          {/* Asset Manager Dialog */}
          <Dialog open={isAssetManagerOpen} onOpenChange={setIsAssetManagerOpen}>
            <DialogContent className="sm:max-w-[1200px] glass-card border-refined max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-elegant text-gradient">Asset Management</DialogTitle>
                <DialogDescription className="text-refined">
                  Manage assets for {selectedCompanyForAssets?.name} with automatic depreciation tracking
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                {selectedCompanyForAssets && (
                  <AssetManager
                    companyId={selectedCompanyForAssets.id}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Industry Dialog */}
          <Dialog open={isAddIndustryOpen} onOpenChange={setIsAddIndustryOpen}>
            <DialogContent className="sm:max-w-[400px] glass-card border-refined">
              <DialogHeader>
                <DialogTitle className="text-xl font-elegant text-gradient">Add New Industry</DialogTitle>
                <DialogDescription className="text-refined">
                  Create a new industry category for your companies.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddIndustry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="industry-name" className="text-sm font-medium">Industry Name *</Label>
                  <Input
                    id="industry-name"
                    placeholder="e.g., Artificial Intelligence, Blockchain, Renewable Energy..."
                    value={newIndustryName}
                    onChange={(e) => setNewIndustryName(e.target.value)}
                    className="border-refined"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a unique industry name that will be available for all future companies.
                  </p>
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
                    onClick={() => {
                      setIsAddIndustryOpen(false);
                      setNewIndustryName("");
                      setError(null);
                    }}
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
                        Add Industry
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
} 