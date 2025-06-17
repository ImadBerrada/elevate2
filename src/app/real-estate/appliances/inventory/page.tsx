"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Settings, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Building,
  Wrench,
  Package,
  Menu,
  MoreHorizontal,
  FileText,
  Trash2,
  Home,
  ChevronRight,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

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

interface Property {
  id: string;
  name: string;
  address: string;
  propertyType: {
    name: string;
  };
}

interface Appliance {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber?: string;
  property: Property;
  location: string;
  category: string;
  status: string;
  condition: string;
  purchaseDate: string;
  warrantyExpiry: string;
  lastMaintenance: string;
  nextMaintenance: string;
  value: number;
  purchasePrice?: number;
  notes?: string;
}

function ApplianceInventoryContent() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  
  // Modal states
  const [isNewApplianceOpen, setIsNewApplianceOpen] = useState(false);
  const [isEditApplianceOpen, setIsEditApplianceOpen] = useState(false);
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null);
  
  // Form data
  const [newApplianceData, setNewApplianceData] = useState({
    name: "",
    brand: "",
    model: "",
    serialNumber: "",
    propertyId: "",
    category: "",
    location: "",
    condition: "GOOD",
    purchaseDate: "",
    purchasePrice: "",
    warrantyExpiry: "",
    notes: ""
  });

  useEffect(() => {
    // Handle URL parameters for navigation context
    const fromParam = searchParams.get('from');
    const successParam = searchParams.get('success');
    const propertyParam = searchParams.get('property');
    const unitParam = searchParams.get('unit');
    const highlightParam = searchParams.get('highlight');
      
    if (successParam) {
      setSuccess(successParam);
      setTimeout(() => setSuccess(null), 5000);
    }
    
    if (fromParam) {
      setSuccess(`Navigated from ${fromParam} module`);
        setTimeout(() => setSuccess(null), 4000);
      }
      
    if (propertyParam) {
      setPropertyFilter(propertyParam);
      setSuccess(`Viewing appliances for ${propertyParam}${unitParam ? ` - Unit ${unitParam}` : ''}`);
      setTimeout(() => setSuccess(null), 4000);
    }
    
    if (highlightParam) {
        setSuccess(`Highlighting appliances for selected property`);
        setTimeout(() => setSuccess(null), 3000);
    }
    
    fetchData();
  }, [searchParams]);

  const navigateToModule = (module: string, params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    queryParams.set('from', 'appliances/inventory');
    router.push(`/real-estate/${module}?${queryParams}`);
  };

  const fetchData = async () => {
    await Promise.all([
      fetchAppliances(),
      fetchProperties()
    ]);
    setLoading(false);
  };

  const fetchAppliances = async () => {
    try {
      const response = await fetch('/api/real-estate/appliances');
      const data = await response.json();
      
      if (data.success) {
        setAppliances(data.appliances);
      } else {
        setError('Failed to fetch appliances');
      }
    } catch (error) {
      setError('Failed to fetch appliances');
      console.error('Error fetching appliances:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/real-estate/properties');
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.properties);
      } else {
        setError('Failed to fetch properties');
      }
    } catch (error) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', error);
    }
  };

  const handleCreateAppliance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/real-estate/appliances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newApplianceData,
          purchasePrice: newApplianceData.purchasePrice ? parseFloat(newApplianceData.purchasePrice) : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchAppliances();
        setIsNewApplianceOpen(false);
        setNewApplianceData({
          name: "",
          brand: "",
          model: "",
          serialNumber: "",
          propertyId: "",
          category: "",
          location: "",
          condition: "GOOD",
          purchaseDate: "",
          purchasePrice: "",
          warrantyExpiry: "",
          notes: ""
        });
        setSuccess('Appliance created successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to create appliance');
      }
    } catch (error) {
      setError('Failed to create appliance');
      console.error('Error creating appliance:', error);
    }
  };

  const handleScheduleMaintenance = (appliance: Appliance) => {
    navigateToModule('appliances/maintenance', { 
      success: 'Scheduling maintenance for appliance',
      appliance: appliance.id,
      property: appliance.property.id,
      createFor: appliance.id
    });
  };

  const handleViewProperty = (appliance: Appliance) => {
    navigateToModule('properties/management', { 
      success: 'Viewing property details from appliances',
      highlight: appliance.property.id,
      appliance: appliance.id
    });
  };

  const handleViewMaintenanceHistory = (appliance: Appliance) => {
    navigateToModule('appliances/maintenance', { 
      success: 'Viewing maintenance history',
      appliance: encodeURIComponent(appliance.name),
      property: encodeURIComponent(appliance.property.name)
    });
  };

  const handleDeleteAppliance = async (applianceId: string) => {
    if (!confirm('Are you sure you want to delete this appliance?')) return;
    
    try {
      const response = await fetch(`/api/real-estate/appliances/${applianceId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchAppliances();
        setSuccess('Appliance deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to delete appliance');
      }
    } catch (error) {
      setError('Failed to delete appliance');
      console.error('Error deleting appliance:', error);
    }
  };

  // Calculate dynamic categories
  const calculateCategories = () => {
    const categoryStats: { [key: string]: { count: number; value: number } } = {
      HVAC: { count: 0, value: 0 },
      Elevator: { count: 0, value: 0 },
      Kitchen: { count: 0, value: 0 },
      Pool: { count: 0, value: 0 },
      Safety: { count: 0, value: 0 },
      General: { count: 0, value: 0 }
    };

    appliances.forEach(appliance => {
      const category = appliance.category || 'General';
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, value: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].value += appliance.value || 0;
    });

    return [
      { name: "HVAC", count: categoryStats.HVAC.count, value: `$${(categoryStats.HVAC.value / 1000).toFixed(0)}K`, color: "bg-blue-500" },
      { name: "Elevator", count: categoryStats.Elevator.count, value: `$${(categoryStats.Elevator.value / 1000).toFixed(0)}K`, color: "bg-green-500" },
      { name: "Kitchen", count: categoryStats.Kitchen.count, value: `$${(categoryStats.Kitchen.value / 1000).toFixed(0)}K`, color: "bg-purple-500" },
      { name: "Pool", count: categoryStats.Pool.count, value: `$${(categoryStats.Pool.value / 1000).toFixed(0)}K`, color: "bg-orange-500" },
      { name: "Safety", count: categoryStats.Safety.count, value: `$${(categoryStats.Safety.value / 1000).toFixed(0)}K`, color: "bg-red-500" }
    ];
  };

  const categories = calculateCategories();

  // Filtering logic
  const filteredAppliances = appliances.filter(appliance => {
    const matchesSearch = !searchTerm || 
      appliance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appliance.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appliance.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appliance.property.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCondition = conditionFilter === 'all' || 
      appliance.condition.toLowerCase() === conditionFilter.toLowerCase();
    
    const matchesCategory = categoryFilter === 'all' || 
      appliance.category.toLowerCase() === categoryFilter.toLowerCase();
    
    const matchesProperty = propertyFilter === 'all' || 
      appliance.property.id === propertyFilter;
    
    return matchesSearch && matchesCondition && matchesCategory && matchesProperty;
  });

  // Calculate stats
  const totalAssets = appliances.length;
  const operationalCount = appliances.filter(a => a.status === 'operational').length;
  const maintenanceDue = appliances.filter(a => a.status === 'maintenance' || a.condition === 'POOR').length;
  const totalValue = appliances.reduce((sum, a) => sum + (a.value || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-green-600";
      case "maintenance": return "text-yellow-600";
      case "repair": return "text-red-600";
      case "retired": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-100 text-green-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      case "repair": return "bg-red-100 text-red-800";
      case "retired": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "fair": return "text-yellow-600";
      case "poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getConditionBg = (condition: string) => {
    switch (condition) {
      case "excellent": return "bg-green-100 text-green-800";
      case "good": return "bg-blue-100 text-blue-800";
      case "fair": return "bg-yellow-100 text-yellow-800";
      case "poor": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return CheckCircle;
      case "maintenance": return Wrench;
      case "repair": return AlertTriangle;
      case "retired": return Clock;
      default: return Clock;
    }
  };

  const isWarrantyExpiring = (warrantyDate: string) => {
    const expiry = new Date(warrantyDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90;
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
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <BurgerMenu />
                <motion.div
                  className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Package className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">Appliance Inventory</h1>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Dialog open={isNewApplianceOpen} onOpenChange={(open) => {
                  setIsNewApplianceOpen(open);
                  if (open) {
                    setError(null);
                    setSuccess(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="btn-premium">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Appliance
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="glass-card border-0 hover-glow">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Search Appliances</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input 
                            placeholder="Search appliances..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Condition</label>
                          <Select value={conditionFilter} onValueChange={setConditionFilter}>
                            <SelectTrigger>
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Conditions</SelectItem>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Category</label>
                          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                              <Building className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              <SelectItem value="hvac">HVAC</SelectItem>
                              <SelectItem value="elevator">Elevator</SelectItem>
                              <SelectItem value="kitchen">Kitchen</SelectItem>
                              <SelectItem value="pool">Pool</SelectItem>
                              <SelectItem value="safety">Safety</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Property</label>
                        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                          <SelectTrigger>
                            <Building className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Property" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            {properties.map(property => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <DropdownMenuSeparator />
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = '/real-estate/appliances/maintenance'}
                        className="w-full"
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        Maintenance Schedule
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                    Total Assets
                  </CardTitle>
                  <Package className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{totalAssets}</div>
                  <p className="text-sm text-green-600 font-medium">Total appliances</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Operational
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{operationalCount}</div>
                  <p className="text-sm text-green-600 font-medium">
                    {totalAssets > 0 ? ((operationalCount / totalAssets) * 100).toFixed(1) : '0'}% uptime
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-yellow-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Maintenance Due
                  </CardTitle>
                  <Wrench className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{maintenanceDue}</div>
                  <p className="text-sm text-yellow-600 font-medium">Needs attention</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{formatCurrency(totalValue)}</div>
                  <p className="text-sm text-green-600 font-medium">Asset portfolio</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Categories */}
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
                      <Settings className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Asset Categories</CardTitle>
                      <CardDescription>
                        Distribution by appliance type
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map((category, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${category.color}`} />
                          <span className="font-medium text-foreground">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{category.count}</p>
                          <p className="text-sm text-muted-foreground">{category.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Maintenance Schedule */}
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
                      <Calendar className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Maintenance Overview</CardTitle>
                      <CardDescription>
                        Upcoming maintenance and warranty status
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Maintenance Schedule</h4>
                      {[
                        { period: "This Week", count: 8, status: "urgent" },
                        { period: "Next Week", count: 12, status: "scheduled" },
                        { period: "This Month", count: 34, status: "planned" },
                        { period: "Next Month", count: 28, status: "upcoming" }
                      ].map((item, index) => (
                        <motion.div 
                          key={index}
                          className="glass-card p-3 rounded-lg"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{item.period}</span>
                            <Badge 
                              variant={item.status === "urgent" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {item.count} items
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Warranty Status</h4>
                      <div className="space-y-3">
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Active Warranties</p>
                          <p className="text-lg font-bold text-gradient">892</p>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Expiring Soon</p>
                          <p className="text-lg font-bold text-orange-600">23</p>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Expired</p>
                          <p className="text-lg font-bold text-red-600">332</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Appliance List */}
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
                    <Package className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Appliance Inventory</CardTitle>
                    <CardDescription>
                      Detailed asset tracking and management
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredAppliances.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No appliances found</h3>
                    <p className="text-muted-foreground mb-4">
                      {appliances.length === 0 
                        ? "Start by adding your first appliance to track your assets."
                        : "Try adjusting your search or filter criteria."
                      }
                    </p>
                    <Button onClick={() => setIsNewApplianceOpen(true)} className="btn-premium">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Appliance
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppliances.map((appliance, index) => {
                      const StatusIcon = getStatusIcon(appliance.status);
                      const warrantyExpiring = isWarrantyExpiring(appliance.warrantyExpiry);
                      return (
                        <motion.div 
                          key={appliance.id}
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
                                <StatusIcon className="w-6 h-6 text-white" />
                              </motion.div>
                              
                              <div>
                                <div className="flex items-center space-x-3 mb-1">
                                  <h3 className="font-semibold text-lg text-foreground">{appliance.name}</h3>
                                  <Badge 
                                    className={`text-xs ${getStatusBg(appliance.status)}`}
                                    variant="outline"
                                  >
                                    {appliance.status}
                                  </Badge>
                                  <Badge 
                                    className={`text-xs ${getConditionBg(appliance.condition)}`}
                                    variant="outline"
                                  >
                                    {appliance.condition}
                                  </Badge>
                                  {warrantyExpiring && (
                                    <Badge variant="destructive" className="text-xs">
                                      Warranty Expiring
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">
                                  {appliance.brand} {appliance.model}
                                  {appliance.serialNumber && ` • S/N: ${appliance.serialNumber}`}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                  <span>{appliance.property.name}</span>
                                  <span>•</span>
                                  <span>{appliance.location}</span>
                                  <span>•</span>
                                  <span>{appliance.category}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>Last Maintenance: {appliance.lastMaintenance || 'N/A'}</span>
                                  <span>•</span>
                                  <span>Next Due: {appliance.nextMaintenance || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Asset Value</p>
                                  <p className="text-lg font-bold text-gradient">
                                    {formatCurrency(appliance.value)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Warranty</p>
                                  <p className={`font-bold ${warrantyExpiring ? 'text-red-600' : 'text-green-600'}`}>
                                    {appliance.warrantyExpiry || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  className="btn-premium"
                                  onClick={() => {
                                    setSelectedAppliance(appliance);
                                    // Could open details modal here
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="glass-card border-0 hover-glow"
                                  onClick={() => handleScheduleMaintenance(appliance)}
                                >
                                  <Wrench className="w-4 h-4 mr-2" />
                                  Maintain
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedAppliance(appliance);
                                      setIsEditApplianceOpen(true);
                                    }}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteAppliance(appliance.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
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

export default function ApplianceInventory() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ApplianceInventoryContent />
    </Suspense>
  );
} 