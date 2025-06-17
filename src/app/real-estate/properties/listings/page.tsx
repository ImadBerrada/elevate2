"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  Building2, 
  MapPin, 
  DollarSign,
  FileText,
  Upload,
  Camera, 
  Square,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Users,
  TrendingUp,
  AlertCircle,
  Loader2,
  MoreVertical,
  Trash2,
  Download,
  Grid3X3,
  List,
  X,
  Trash
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  description?: string;
  address: string;
  city: string;
  area?: string;
  floorArea?: number;
  lotArea?: number;
  purchaseValue?: number;
  status: string;
  occupancyRate?: number;
  image?: string;
  propertyType: {
    id: string;
    name: string;
  };
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
  totalMonthlyRent: number;
  totalYearlyExpenses: number;
  occupiedUnits: number;
  totalUnits: number;
  rentalUnits: any[];
}

interface PropertyOwner {
  id: string;
  firstName: string;
  lastName: string;
}

interface PropertyType {
  id: string;
  name: string;
}

export default function PropertyListings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyOwners, setPropertyOwners] = useState<PropertyOwner[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  
  // View and sorting
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showEditProperty, setShowEditProperty] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  
  // New property form
  const [newPropertyForm, setNewPropertyForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    area: '',
    country: 'UAE',
    floorArea: '',
    lotArea: '',
    purchaseValue: '',
    purchaseDate: '',
    propertyTypeId: '',
    ownerId: '',
    notes: '',
    status: 'ACTIVE',
    // Financial and occupancy fields
    expectedMonthlyRent: '',
    expectedAnnualExpenses: '',
    totalUnits: '',
    occupiedUnits: '',
    occupancyRate: '',
    // Property image
    image: ''
  });

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentFormStep, setCurrentFormStep] = useState(1);
  
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProperties();
    fetchPropertyOwners();
    fetchPropertyTypes();
  }, [currentPage, searchTerm, selectedOwner, selectedType, selectedStatus]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedOwner !== "all" && { ownerId: selectedOwner }),
        ...(selectedType !== "all" && { propertyTypeId: selectedType }),
        ...(selectedStatus !== "all" && { status: selectedStatus }),
      });

      const response = await fetch(`/api/real-estate/properties?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const data = await response.json();
      setProperties(data.properties);
      setTotalPages(data.pagination.pages);
      setTotalProperties(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyOwners = async () => {
    try {
      const response = await fetch('/api/real-estate/property-owners');
      if (response.ok) {
        const owners = await response.json();
        setPropertyOwners(owners);
      }
    } catch (err) {
      console.error('Failed to fetch property owners:', err);
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const response = await fetch('/api/real-estate/property-types');
      if (response.ok) {
        const types = await response.json();
        setPropertyTypes(types);
      }
    } catch (err) {
      console.error('Failed to fetch property types:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "under_renovation": return "bg-yellow-100 text-yellow-800";
      case "for_sale": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "Active";
      case "inactive": return "Inactive";
      case "under_renovation": return "Under Renovation";
      case "for_sale": return "For Sale";
      default: return status;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedOwner("all");
    setSelectedType("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  // Image upload handlers
  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setNewPropertyForm(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setNewPropertyForm(prev => ({ ...prev, image: '' }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Required field validation
    if (!newPropertyForm.name.trim()) {
      errors.name = "Property name is required";
    }
    if (!newPropertyForm.address.trim()) {
      errors.address = "Address is required";
    }
    if (!newPropertyForm.city.trim()) {
      errors.city = "City is required";
    }
    if (!newPropertyForm.propertyTypeId) {
      errors.propertyTypeId = "Property type is required";
    }
    if (!newPropertyForm.ownerId) {
      errors.ownerId = "Property owner is required";
    }
    
    // Numeric validation
    if (newPropertyForm.floorArea && isNaN(parseFloat(newPropertyForm.floorArea))) {
      errors.floorArea = "Invalid floor area";
    }
    if (newPropertyForm.lotArea && isNaN(parseFloat(newPropertyForm.lotArea))) {
      errors.lotArea = "Invalid lot area";
    }
    if (newPropertyForm.purchaseValue && isNaN(parseFloat(newPropertyForm.purchaseValue))) {
      errors.purchaseValue = "Invalid purchase value";
    }
    
    // Financial field validation
    if (newPropertyForm.expectedMonthlyRent && isNaN(parseFloat(newPropertyForm.expectedMonthlyRent))) {
      errors.expectedMonthlyRent = "Invalid monthly rent amount";
    }
    if (newPropertyForm.expectedAnnualExpenses && isNaN(parseFloat(newPropertyForm.expectedAnnualExpenses))) {
      errors.expectedAnnualExpenses = "Invalid annual expenses amount";
    }
    if (newPropertyForm.totalUnits && (isNaN(parseInt(newPropertyForm.totalUnits)) || parseInt(newPropertyForm.totalUnits) < 0)) {
      errors.totalUnits = "Invalid number of units";
    }
    if (newPropertyForm.occupiedUnits && (isNaN(parseInt(newPropertyForm.occupiedUnits)) || parseInt(newPropertyForm.occupiedUnits) < 0)) {
      errors.occupiedUnits = "Invalid number of occupied units";
    }
    if (newPropertyForm.occupancyRate && (isNaN(parseFloat(newPropertyForm.occupancyRate)) || parseFloat(newPropertyForm.occupancyRate) < 0 || parseFloat(newPropertyForm.occupancyRate) > 100)) {
      errors.occupancyRate = "Occupancy rate must be between 0 and 100";
    }
    
    // Cross-validation for units
    if (newPropertyForm.totalUnits && newPropertyForm.occupiedUnits) {
      const total = parseInt(newPropertyForm.totalUnits);
      const occupied = parseInt(newPropertyForm.occupiedUnits);
      if (occupied > total) {
        errors.occupiedUnits = "Occupied units cannot exceed total units";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setNewPropertyForm({
      name: '', description: '', address: '', city: '', area: '', country: 'UAE',
      floorArea: '', lotArea: '', purchaseValue: '', purchaseDate: '', propertyTypeId: '',
      ownerId: '', notes: '', status: 'ACTIVE',
      expectedMonthlyRent: '', expectedAnnualExpenses: '', totalUnits: '',
      occupiedUnits: '', occupancyRate: '', image: ''
    });
    setFormErrors({});
    setCurrentFormStep(1);
    // Reset image state
    setImageFile(null);
    setImagePreview('');
    setUploadingImage(false);
  };

  const handleAddProperty = async () => {
    if (!validateForm()) {
      // If validation fails and we're not on step 1, go back to the first step with errors
      if (currentFormStep !== 1) {
        setCurrentFormStep(1);
      }
      return;
    }

    try {
      const payload = {
        ...newPropertyForm,
        floorArea: newPropertyForm.floorArea ? parseFloat(newPropertyForm.floorArea) : null,
        lotArea: newPropertyForm.lotArea ? parseFloat(newPropertyForm.lotArea) : null,
        purchaseValue: newPropertyForm.purchaseValue ? parseFloat(newPropertyForm.purchaseValue) : null,
        purchaseDate: newPropertyForm.purchaseDate ? newPropertyForm.purchaseDate : null,
        // Financial and occupancy fields
        expectedMonthlyRent: newPropertyForm.expectedMonthlyRent ? parseFloat(newPropertyForm.expectedMonthlyRent) : null,
        expectedAnnualExpenses: newPropertyForm.expectedAnnualExpenses ? parseFloat(newPropertyForm.expectedAnnualExpenses) : null,
        totalUnits: newPropertyForm.totalUnits ? parseInt(newPropertyForm.totalUnits) : null,
        occupiedUnits: newPropertyForm.occupiedUnits ? parseInt(newPropertyForm.occupiedUnits) : null,
        occupancyRate: newPropertyForm.occupancyRate ? parseFloat(newPropertyForm.occupancyRate) : null,
      };

      const response = await fetch('/api/real-estate/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setShowAddProperty(false);
        resetForm();
        await fetchProperties();
      } else {
        const errorData = await response.json();
        console.error('Failed to add property:', errorData);
        // Handle specific API errors if needed
        if (errorData.details) {
          // Map API validation errors to form errors
          const apiErrors: Record<string, string> = {};
          errorData.details.forEach((detail: any) => {
            if (detail.path && detail.path.length > 0) {
              apiErrors[detail.path[0]] = detail.message;
            }
          });
          setFormErrors(apiErrors);
        }
      }
    } catch (error) {
      console.error('Failed to add property:', error);
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    try {
      const response = await fetch(`/api/real-estate/properties/${property.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setShowDeleteConfirm(false);
        setPropertyToDelete(null);
        await fetchProperties();
      }
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  const handleEditProperty = async () => {
    if (!propertyToEdit) return;

    try {
      if (!validateForm()) {
        // If validation fails and we're not on step 1, go back to the first step with errors
        if (currentFormStep !== 1) {
          setCurrentFormStep(1);
        }
        return;
      }

      setLoading(true);

      // Only include fields that have actual values to avoid validation issues
      const propertyData: any = {};
      
      // Required fields that should always be included
      if (newPropertyForm.name) propertyData.name = newPropertyForm.name;
      if (newPropertyForm.address) propertyData.address = newPropertyForm.address;
      if (newPropertyForm.city) propertyData.city = newPropertyForm.city;
      if (newPropertyForm.propertyTypeId) propertyData.propertyTypeId = newPropertyForm.propertyTypeId;
      if (newPropertyForm.ownerId) propertyData.ownerId = newPropertyForm.ownerId;
      if (newPropertyForm.status) propertyData.status = newPropertyForm.status;
      
      // Optional fields - only include if they have values
      if (newPropertyForm.description) propertyData.description = newPropertyForm.description;
      if (newPropertyForm.area) propertyData.area = newPropertyForm.area;
      if (newPropertyForm.country) propertyData.country = newPropertyForm.country;
      if (newPropertyForm.notes) propertyData.notes = newPropertyForm.notes;
      if (newPropertyForm.image) propertyData.image = newPropertyForm.image;
      
      // Numeric fields - only include if they have valid values
      if (newPropertyForm.floorArea && !isNaN(parseFloat(newPropertyForm.floorArea))) {
        propertyData.floorArea = parseFloat(newPropertyForm.floorArea);
      }
      if (newPropertyForm.lotArea && !isNaN(parseFloat(newPropertyForm.lotArea))) {
        propertyData.lotArea = parseFloat(newPropertyForm.lotArea);
      }
      if (newPropertyForm.purchaseValue && !isNaN(parseFloat(newPropertyForm.purchaseValue))) {
        propertyData.purchaseValue = parseFloat(newPropertyForm.purchaseValue);
      }
      if (newPropertyForm.expectedMonthlyRent && !isNaN(parseFloat(newPropertyForm.expectedMonthlyRent))) {
        propertyData.expectedMonthlyRent = parseFloat(newPropertyForm.expectedMonthlyRent);
      }
      if (newPropertyForm.expectedAnnualExpenses && !isNaN(parseFloat(newPropertyForm.expectedAnnualExpenses))) {
        propertyData.expectedAnnualExpenses = parseFloat(newPropertyForm.expectedAnnualExpenses);
      }
      if (newPropertyForm.totalUnits && !isNaN(parseInt(newPropertyForm.totalUnits))) {
        propertyData.totalUnits = parseInt(newPropertyForm.totalUnits);
      }
      if (newPropertyForm.occupiedUnits && !isNaN(parseInt(newPropertyForm.occupiedUnits))) {
        propertyData.occupiedUnits = parseInt(newPropertyForm.occupiedUnits);
      }
      
      // Date field
      if (newPropertyForm.purchaseDate) {
        propertyData.purchaseDate = newPropertyForm.purchaseDate;
      }

      console.log('Sending property data to API:', propertyData);
      console.log('Property ID to edit:', propertyToEdit.id);

      const response = await fetch(`/api/real-estate/properties/${propertyToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (response.ok) {
        await fetchProperties();
        setShowEditProperty(false);
        setPropertyToEdit(null);
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        console.error('Response status:', response.status);
        if (errorData.details) {
          console.error('Validation details:', errorData.details);
        }
        throw new Error(errorData.error || `Failed to update property (${response.status})`);
      }
    } catch (error) {
      console.error('Error updating property:', error);
    } finally {
      setLoading(false);
    }
  };

  const populateEditForm = (property: Property) => {
    setNewPropertyForm({
      name: property.name,
      description: property.description || '',
      address: property.address,
      city: property.city,
      area: property.area || '',
      country: 'UAE',
      floorArea: property.floorArea?.toString() || '',
      lotArea: property.lotArea?.toString() || '',
      purchaseValue: property.purchaseValue?.toString() || '',
      purchaseDate: '', // Would need to get from API if stored
      propertyTypeId: property.propertyType.id,
      ownerId: property.owner.id,
      notes: '',
      status: property.status,
      expectedMonthlyRent: property.totalMonthlyRent?.toString() || '',
      expectedAnnualExpenses: property.totalYearlyExpenses?.toString() || '',
      totalUnits: property.totalUnits?.toString() || '',
      occupiedUnits: property.occupiedUnits?.toString() || '',
      occupancyRate: property.totalUnits > 0 ? ((property.occupiedUnits / property.totalUnits) * 100).toString() : '',
      image: property.image || ''
    });
    
    if (property.image) {
      setImagePreview(property.image);
    } else {
      setImagePreview('');
    }
    setImageFile(null);
  };

  const handleExportProperties = () => {
    const csvContent = [
      ['Name', 'Address', 'Type', 'Owner', 'Status', 'Units', 'Monthly Rent'].join(','),
      ...properties.map(p => [
        p.name,
        `"${p.address}, ${p.city}"`,
        p.propertyType.name,
        `${p.owner.firstName} ${p.owner.lastName}`,
        p.status,
        p.totalUnits,
        p.totalMonthlyRent
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate stats
  const activeProperties = properties.filter(p => p.status === 'ACTIVE').length;
  const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0);
  const occupiedUnits = properties.reduce((sum, p) => sum + p.occupiedUnits, 0);
  const totalMonthlyRent = properties.reduce((sum, p) => sum + p.totalMonthlyRent, 0);

  const handleDeleteAllProperties = async () => {
    try {
      for (const property of properties) {
        await fetch(`/api/real-estate/properties/${property.id}?force=true`, {
          method: 'DELETE'
        });
      }
      setShowDeleteAllConfirm(false);
      await fetchProperties();
    } catch (error) {
      console.error('Failed to delete all properties:', error);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchProperties}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

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
                    <Building2 className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Property Listings</h1>
                    <p className="text-sm text-muted-foreground">Manage real estate property portfolio</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="glass-card border-0"
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleExportProperties}
                    className="glass-card border-0"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteAllConfirm(true)}
                    className="glass-card border-0 text-red-600 hover:text-red-700"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                  <Dialog open={showAddProperty} onOpenChange={(open) => {
                    setShowAddProperty(open);
                    if (!open) resetForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="btn-premium">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Property
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <Building2 className="w-5 h-5" />
                          <span>Add New Property</span>
                        </DialogTitle>
                        <DialogDescription>
                          Create a comprehensive property listing in your portfolio
                        </DialogDescription>
                      </DialogHeader>

                      <Tabs value={`step-${currentFormStep}`} onValueChange={(value) => setCurrentFormStep(parseInt(value.replace('step-', '')))}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="step-1">Basic Info</TabsTrigger>
                          <TabsTrigger value="step-2">Details</TabsTrigger>
                          <TabsTrigger value="step-3">Financial</TabsTrigger>
                        </TabsList>

                        <TabsContent value="step-1" className="space-y-4 mt-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Property Name *</Label>
                              <Input
                                id="name"
                                value={newPropertyForm.name}
                                onChange={(e) => setNewPropertyForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter property name"
                                className={formErrors.name ? "border-red-500" : ""}
                              />
                              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                            </div>
                            <div>
                              <Label htmlFor="propertyType">Property Type *</Label>
                              <Select 
                                value={newPropertyForm.propertyTypeId} 
                                onValueChange={(value) => setNewPropertyForm(prev => ({ ...prev, propertyTypeId: value }))}
                              >
                                <SelectTrigger className={formErrors.propertyTypeId ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {propertyTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                      {type.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {formErrors.propertyTypeId && <p className="text-red-500 text-xs mt-1">{formErrors.propertyTypeId}</p>}
                            </div>
                            <div>
                              <Label htmlFor="owner">Property Owner *</Label>
                              <Select 
                                value={newPropertyForm.ownerId} 
                                onValueChange={(value) => setNewPropertyForm(prev => ({ ...prev, ownerId: value }))}
                              >
                                <SelectTrigger className={formErrors.ownerId ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Select owner" />
                                </SelectTrigger>
                                <SelectContent>
                                  {propertyOwners.map((owner) => (
                                    <SelectItem key={owner.id} value={owner.id}>
                                      {owner.firstName} {owner.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {formErrors.ownerId && <p className="text-red-500 text-xs mt-1">{formErrors.ownerId}</p>}
                            </div>
                            <div>
                              <Label htmlFor="status">Property Status</Label>
                              <Select 
                                value={newPropertyForm.status} 
                                onValueChange={(value) => setNewPropertyForm(prev => ({ ...prev, status: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ACTIVE">Active</SelectItem>
                                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                                  <SelectItem value="UNDER_RENOVATION">Under Renovation</SelectItem>
                                  <SelectItem value="FOR_SALE">For Sale</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <Label className="flex items-center space-x-2 mb-3">
                                <Camera className="w-4 h-4" />
                                <span>Property Image</span>
                              </Label>
                              
                              {!imagePreview && !newPropertyForm.image ? (
                                <div
                                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                                  onDragOver={handleDragOver}
                                  onDrop={handleDrop}
                                  onClick={() => document.getElementById('image-upload')?.click()}
                                >
                                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                                  <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF up to 10MB
                                  </p>
                                  <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleImageUpload(file);
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="relative">
                                  <div className="rounded-lg overflow-hidden border">
                                    <img 
                                      src={imagePreview || newPropertyForm.image} 
                                      alt="Property preview" 
                                      className="w-full h-40 object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = '/placeholder-property.jpg';
                                        e.currentTarget.alt = 'Failed to load image';
                                      }}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <div className="mt-2 flex space-x-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => document.getElementById('image-upload')?.click()}
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Change Image
                                    </Button>
                                  </div>
                                  <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleImageUpload(file);
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* Alternative URL input */}
                              <div className="mt-4">
                                <Label className="text-sm text-muted-foreground">Or paste image URL:</Label>
                                <Input
                                  value={newPropertyForm.image.startsWith('data:') ? '' : newPropertyForm.image}
                                  onChange={(e) => {
                                    const url = e.target.value;
                                    setNewPropertyForm(prev => ({ ...prev, image: url }));
                                    if (url && !url.startsWith('data:')) {
                                      setImagePreview('');
                                      setImageFile(null);
                                    }
                                  }}
                                  placeholder="https://example.com/property.jpg"
                                  type="url"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                value={newPropertyForm.description}
                                onChange={(e) => setNewPropertyForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter property description..."
                                className="min-h-[80px]"
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="step-2" className="space-y-4 mt-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <Label htmlFor="address">Full Address *</Label>
                              <Input
                                id="address"
                                value={newPropertyForm.address}
                                onChange={(e) => setNewPropertyForm(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Enter complete address"
                                className={formErrors.address ? "border-red-500" : ""}
                              />
                              {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                            </div>
                            <div>
                              <Label htmlFor="city">City *</Label>
                              <Input
                                id="city"
                                value={newPropertyForm.city}
                                onChange={(e) => setNewPropertyForm(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="Enter city"
                                className={formErrors.city ? "border-red-500" : ""}
                              />
                              {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                            </div>
                            <div>
                              <Label htmlFor="area">Area/District</Label>
                              <Input
                                id="area"
                                value={newPropertyForm.area}
                                onChange={(e) => setNewPropertyForm(prev => ({ ...prev, area: e.target.value }))}
                                placeholder="Enter area or district"
                              />
                            </div>
                            <div>
                              <Label htmlFor="country">Country</Label>
                              <Select 
                                value={newPropertyForm.country} 
                                onValueChange={(value) => setNewPropertyForm(prev => ({ ...prev, country: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="UAE">United Arab Emirates</SelectItem>
                                  <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                                  <SelectItem value="Qatar">Qatar</SelectItem>
                                  <SelectItem value="Kuwait">Kuwait</SelectItem>
                                  <SelectItem value="Bahrain">Bahrain</SelectItem>
                                  <SelectItem value="Oman">Oman</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="floorArea">Floor Area (sq ft)</Label>
                              <Input
                                id="floorArea"
                                type="number"
                                value={newPropertyForm.floorArea}
                                onChange={(e) => setNewPropertyForm(prev => ({ ...prev, floorArea: e.target.value }))}
                                placeholder="Enter floor area"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <Label htmlFor="lotArea">Lot Area (sq ft)</Label>
                              <Input
                                id="lotArea"
                                type="number"
                                value={newPropertyForm.lotArea}
                                onChange={(e) => setNewPropertyForm(prev => ({ ...prev, lotArea: e.target.value }))}
                                placeholder="Enter lot area"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="step-3" className="space-y-6 mt-6">
                          {/* Financial Information */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 pb-2 border-b">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold text-lg">Financial Information</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="expectedMonthlyRent">Expected Monthly Rent (AED)</Label>
                                <Input
                                  id="expectedMonthlyRent"
                                  type="number"
                                  value={newPropertyForm.expectedMonthlyRent}
                                  onChange={(e) => setNewPropertyForm(prev => ({ ...prev, expectedMonthlyRent: e.target.value }))}
                                  placeholder="Enter expected monthly rent"
                                  min="0"
                                  step="0.01"
                                  className={formErrors.expectedMonthlyRent ? "border-red-500" : ""}
                                />
                                {formErrors.expectedMonthlyRent && <p className="text-red-500 text-xs mt-1">{formErrors.expectedMonthlyRent}</p>}
                              </div>
                              <div>
                                <Label htmlFor="expectedAnnualExpenses">Expected Annual Expenses (AED)</Label>
                                <Input
                                  id="expectedAnnualExpenses"
                                  type="number"
                                  value={newPropertyForm.expectedAnnualExpenses}
                                  onChange={(e) => setNewPropertyForm(prev => ({ ...prev, expectedAnnualExpenses: e.target.value }))}
                                  placeholder="Enter expected annual expenses"
                                  min="0"
                                  step="0.01"
                                  className={formErrors.expectedAnnualExpenses ? "border-red-500" : ""}
                                />
                                {formErrors.expectedAnnualExpenses && <p className="text-red-500 text-xs mt-1">{formErrors.expectedAnnualExpenses}</p>}
                              </div>
                              <div>
                                <Label htmlFor="purchaseValue">Purchase Value (AED)</Label>
                                <Input
                                  id="purchaseValue"
                                  type="number"
                                  value={newPropertyForm.purchaseValue}
                                  onChange={(e) => setNewPropertyForm(prev => ({ ...prev, purchaseValue: e.target.value }))}
                                  placeholder="Enter purchase value"
                                  min="0"
                                  step="0.01"
                                  className={formErrors.purchaseValue ? "border-red-500" : ""}
                                />
                                {formErrors.purchaseValue && <p className="text-red-500 text-xs mt-1">{formErrors.purchaseValue}</p>}
                              </div>
                              <div>
                                <Label htmlFor="purchaseDate">Purchase Date</Label>
                                <Input
                                  id="purchaseDate"
                                  type="date"
                                  value={newPropertyForm.purchaseDate}
                                  onChange={(e) => setNewPropertyForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                                />
                              </div>
                              {/* Net Monthly Calculation Display */}
                              {newPropertyForm.expectedMonthlyRent && newPropertyForm.expectedAnnualExpenses && (
                                <div className="col-span-2 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                                  <Label className="text-sm font-medium text-muted-foreground">Net Monthly Income (Calculated)</Label>
                                  <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(
                                      parseFloat(newPropertyForm.expectedMonthlyRent) - 
                                      (parseFloat(newPropertyForm.expectedAnnualExpenses) / 12)
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Monthly rent minus monthly expenses</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Occupancy Information */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 pb-2 border-b">
                              <Users className="w-5 h-5 text-blue-600" />
                              <h4 className="font-semibold text-lg">Occupancy Information</h4>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="totalUnits">Total Units</Label>
                                <Input
                                  id="totalUnits"
                                  type="number"
                                  value={newPropertyForm.totalUnits}
                                  onChange={(e) => setNewPropertyForm(prev => ({ ...prev, totalUnits: e.target.value }))}
                                  placeholder="Enter total units"
                                  min="0"
                                  step="1"
                                  className={formErrors.totalUnits ? "border-red-500" : ""}
                                />
                                {formErrors.totalUnits && <p className="text-red-500 text-xs mt-1">{formErrors.totalUnits}</p>}
                              </div>
                              <div>
                                <Label htmlFor="occupiedUnits">Occupied Units</Label>
                                <Input
                                  id="occupiedUnits"
                                  type="number"
                                  value={newPropertyForm.occupiedUnits}
                                  onChange={(e) => setNewPropertyForm(prev => ({ ...prev, occupiedUnits: e.target.value }))}
                                  placeholder="Enter occupied units"
                                  min="0"
                                  step="1"
                                  className={formErrors.occupiedUnits ? "border-red-500" : ""}
                                />
                                {formErrors.occupiedUnits && <p className="text-red-500 text-xs mt-1">{formErrors.occupiedUnits}</p>}
                              </div>
                              <div>
                                <Label htmlFor="occupancyRate">Occupancy Rate (%)</Label>
                                <Input
                                  id="occupancyRate"
                                  type="number"
                                  value={newPropertyForm.occupancyRate}
                                  onChange={(e) => setNewPropertyForm(prev => ({ ...prev, occupancyRate: e.target.value }))}
                                  placeholder="Enter occupancy rate"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  className={formErrors.occupancyRate ? "border-red-500" : ""}
                                />
                                {formErrors.occupancyRate && <p className="text-red-500 text-xs mt-1">{formErrors.occupancyRate}</p>}
                              </div>
                              {/* Auto-calculate occupancy rate */}
                              {newPropertyForm.totalUnits && newPropertyForm.occupiedUnits && (
                                <div className="col-span-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                                  <Label className="text-sm font-medium text-muted-foreground">Calculated Occupancy Rate</Label>
                                  <p className="text-2xl font-bold text-blue-600">
                                    {Math.round((parseInt(newPropertyForm.occupiedUnits) / parseInt(newPropertyForm.totalUnits)) * 100)}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {newPropertyForm.occupiedUnits} out of {newPropertyForm.totalUnits} units occupied
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Additional Notes */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 pb-2 border-b">
                              <FileText className="w-5 h-5 text-gray-600" />
                              <h4 className="font-semibold text-lg">Additional Information</h4>
                            </div>
                            <div>
                              <Label htmlFor="notes">Additional Notes</Label>
                              <Textarea
                                id="notes"
                                value={newPropertyForm.notes}
                                onChange={(e) => setNewPropertyForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Enter any additional notes about the property..."
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <DialogFooter className="flex justify-between">
                        <div>
                          {currentFormStep > 1 && (
                            <Button 
                              variant="outline" 
                              onClick={() => setCurrentFormStep(prev => prev - 1)}
                            >
                              Previous
                            </Button>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => { setShowAddProperty(false); resetForm(); }}>
                            Cancel
                          </Button>
                          {currentFormStep < 3 ? (
                            <Button 
                              onClick={() => setCurrentFormStep(prev => prev + 1)}
                              className="btn-premium"
                            >
                              Next
                            </Button>
                          ) : (
                            <Button onClick={handleAddProperty} className="btn-premium">
                              Create Property
                            </Button>
                          )}
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
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
                    Total Properties
                  </CardTitle>
                  <Building2 className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{totalProperties}</div>
                  <p className="text-sm text-green-600 font-medium">{activeProperties} active</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Occupancy Rate
                  </CardTitle>
                  <Users className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">
                    {totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0}%
                  </div>
                  <p className="text-sm text-green-600 font-medium">{occupiedUnits}/{totalUnits} units</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Revenue
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{formatCurrency(totalMonthlyRent)}</div>
                  <p className="text-sm text-purple-600 font-medium">from active leases</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Units
                  </CardTitle>
                  <Square className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{totalUnits}</div>
                  <p className="text-sm text-orange-600 font-medium">rental units</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="mb-8 p-6 glass-card rounded-2xl border-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search properties..." 
                    className="pl-10 glass-card border-0 focus-premium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Owner</label>
                <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                  <SelectTrigger className="glass-card border-0">
                    <SelectValue placeholder="All owners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All owners</SelectItem>
                    {propertyOwners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.firstName} {owner.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="glass-card border-0">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="glass-card border-0">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="UNDER_RENOVATION">Under Renovation</SelectItem>
                    <SelectItem value="FOR_SALE">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={clearFilters} className="glass-card border-0">
                  Clear
                </Button>
                <Button onClick={fetchProperties} className="btn-premium">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Properties Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading properties...</span>
            </div>
          ) : (
            <motion.div 
              className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {properties.map((property) => (
                <motion.div key={property.id} variants={fadeInUp} className="hover-lift">
                  <Card className="card-premium border-0 overflow-hidden group">
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                      {property.image ? (
                        <>
                          <img 
                            src={property.image} 
                            alt={property.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100">
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className={cn("text-xs font-medium", getStatusColor(property.status))}>
                          {getStatusLabel(property.status)}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedProperty(property);
                              setShowPropertyDetails(true);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setPropertyToEdit(property);
                              populateEditForm(property);
                              setShowEditProperty(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Property
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setPropertyToDelete(property);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg mb-1">{property.name}</h3>
                        <p className="text-white/80 text-sm flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {property.address}, {property.city}
                        </p>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Owner</p>
                            <p className="font-medium">{property.owner.firstName} {property.owner.lastName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Monthly Rent</p>
                            <p className="font-bold text-green-600">{formatCurrency(property.totalMonthlyRent)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Units</p>
                            <p className="font-semibold">{property.totalUnits}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Occupied</p>
                            <p className="font-semibold">{property.occupiedUnits}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Occupancy</p>
                            <p className="font-semibold">
                              {property.totalUnits > 0 ? Math.round((property.occupiedUnits / property.totalUnits) * 100) : 0}%
                            </p>
                          </div>
                        </div>

                        {property.floorArea && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Square className="w-4 h-4 mr-2" />
                            {property.floorArea.toLocaleString()} sq ft
                          </div>
                        )}

                        <div className="flex space-x-2 pt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedProperty(property);
                              setShowPropertyDetails(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setPropertyToEdit(property);
                              populateEditForm(property);
                              setShowEditProperty(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div 
              className="flex justify-center items-center space-x-2 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="glass-card border-0"
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-10 h-10 p-0",
                        currentPage === page ? "btn-premium" : "glass-card border-0"
                      )}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="glass-card border-0"
              >
                Next
              </Button>
            </motion.div>
          )}
        </main>

        {/* Property Details Modal */}
        <Dialog open={showPropertyDetails} onOpenChange={setShowPropertyDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProperty && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>{selectedProperty.name}</span>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedProperty.address}, {selectedProperty.city}
                  </DialogDescription>
                </DialogHeader>
                
                {selectedProperty.image && (
                  <div className="mb-6">
                    <img 
                      src={selectedProperty.image} 
                      alt={selectedProperty.name}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Property Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{selectedProperty.propertyType.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={cn("text-xs", getStatusColor(selectedProperty.status))}>
                            {getStatusLabel(selectedProperty.status)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Owner:</span>
                          <span>{selectedProperty.owner.firstName} {selectedProperty.owner.lastName}</span>
                        </div>
                        {selectedProperty.floorArea && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Floor Area:</span>
                            <span>{selectedProperty.floorArea.toLocaleString()} sq ft</span>
                          </div>
                        )}
                        {selectedProperty.purchaseValue && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Purchase Value:</span>
                            <span>{formatCurrency(selectedProperty.purchaseValue)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Financial Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Rent:</span>
                          <span className="font-semibold text-green-600">{formatCurrency(selectedProperty.totalMonthlyRent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annual Expenses:</span>
                          <span className="font-semibold text-red-600">{formatCurrency(selectedProperty.totalYearlyExpenses)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Net Monthly:</span>
                          <span className="font-semibold">
                            {formatCurrency(selectedProperty.totalMonthlyRent - (selectedProperty.totalYearlyExpenses / 12))}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Occupancy</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Units:</span>
                          <span>{selectedProperty.totalUnits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Occupied Units:</span>
                          <span>{selectedProperty.occupiedUnits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Occupancy Rate:</span>
                          <span className="font-semibold">
                            {selectedProperty.totalUnits > 0 ? Math.round((selectedProperty.occupiedUnits / selectedProperty.totalUnits) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Property</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{propertyToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => propertyToDelete && handleDeleteProperty(propertyToDelete)}
              >
                Delete Property
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Property Modal */}
        <Dialog open={showEditProperty} onOpenChange={(open) => {
          setShowEditProperty(open);
          if (!open) {
            setPropertyToEdit(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5" />
                <span>Edit Property</span>
              </DialogTitle>
              <DialogDescription>
                Update property information and details
              </DialogDescription>
            </DialogHeader>

            <Tabs value={`step-${currentFormStep}`} onValueChange={(value) => setCurrentFormStep(parseInt(value.replace('step-', '')))}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="step-1">Basic Info</TabsTrigger>
                <TabsTrigger value="step-2">Details</TabsTrigger>
                <TabsTrigger value="step-3">Financial</TabsTrigger>
              </TabsList>

              <TabsContent value="step-1" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Property Name *</Label>
                    <Input
                      id="edit-name"
                      value={newPropertyForm.name}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter property name"
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-propertyType">Property Type *</Label>
                    <Select 
                      value={newPropertyForm.propertyTypeId} 
                      onValueChange={(value) => setNewPropertyForm(prev => ({ ...prev, propertyTypeId: value }))}
                    >
                      <SelectTrigger className={formErrors.propertyTypeId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.propertyTypeId && <p className="text-red-500 text-xs mt-1">{formErrors.propertyTypeId}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-owner">Property Owner *</Label>
                    <Select 
                      value={newPropertyForm.ownerId} 
                      onValueChange={(value) => setNewPropertyForm(prev => ({ ...prev, ownerId: value }))}
                    >
                      <SelectTrigger className={formErrors.ownerId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyOwners.map((owner) => (
                          <SelectItem key={owner.id} value={owner.id}>
                            {owner.firstName} {owner.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.ownerId && <p className="text-red-500 text-xs mt-1">{formErrors.ownerId}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Property Status</Label>
                    <Select 
                      value={newPropertyForm.status} 
                      onValueChange={(value) => setNewPropertyForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="UNDER_RENOVATION">Under Renovation</SelectItem>
                        <SelectItem value="FOR_SALE">For Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="flex items-center space-x-2 mb-3">
                      <Camera className="w-4 h-4" />
                      <span>Property Image</span>
                    </Label>
                    
                    {!imagePreview && !newPropertyForm.image ? (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('edit-image-upload')?.click()}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                        <input
                          id="edit-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="rounded-lg overflow-hidden border">
                          <img 
                            src={imagePreview || newPropertyForm.image} 
                            alt="Property preview" 
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-property.jpg';
                              e.currentTarget.alt = 'Failed to load image';
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="mt-2 flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('edit-image-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Change Image
                          </Button>
                        </div>
                        <input
                          id="edit-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Alternative URL input */}
                    <div className="mt-4">
                      <Label className="text-sm text-muted-foreground">Or paste image URL:</Label>
                      <Input
                        value={newPropertyForm.image.startsWith('data:') ? '' : newPropertyForm.image}
                        onChange={(e) => {
                          const url = e.target.value;
                          setNewPropertyForm(prev => ({ ...prev, image: url }));
                          if (url && !url.startsWith('data:')) {
                            setImagePreview('');
                            setImageFile(null);
                          }
                        }}
                        placeholder="https://example.com/property.jpg"
                        type="url"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={newPropertyForm.description}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter property description..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="step-2" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="edit-address">Full Address *</Label>
                    <Input
                      id="edit-address"
                      value={newPropertyForm.address}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter full address"
                      className={formErrors.address ? "border-red-500" : ""}
                    />
                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-city">City *</Label>
                    <Input
                      id="edit-city"
                      value={newPropertyForm.city}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Enter city"
                      className={formErrors.city ? "border-red-500" : ""}
                    />
                    {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-area">Area/District</Label>
                    <Input
                      id="edit-area"
                      value={newPropertyForm.area}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, area: e.target.value }))}
                      placeholder="Enter area or district"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-floorArea">Floor Area (sq ft)</Label>
                    <Input
                      id="edit-floorArea"
                      type="number"
                      value={newPropertyForm.floorArea}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, floorArea: e.target.value }))}
                      placeholder="Enter floor area"
                      className={formErrors.floorArea ? "border-red-500" : ""}
                    />
                    {formErrors.floorArea && <p className="text-red-500 text-xs mt-1">{formErrors.floorArea}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-lotArea">Lot Area (sq ft)</Label>
                    <Input
                      id="edit-lotArea"
                      type="number"
                      value={newPropertyForm.lotArea}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, lotArea: e.target.value }))}
                      placeholder="Enter lot area"
                      className={formErrors.lotArea ? "border-red-500" : ""}
                    />
                    {formErrors.lotArea && <p className="text-red-500 text-xs mt-1">{formErrors.lotArea}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-purchaseValue">Purchase Value (AED)</Label>
                    <Input
                      id="edit-purchaseValue"
                      type="number"
                      value={newPropertyForm.purchaseValue}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, purchaseValue: e.target.value }))}
                      placeholder="Enter purchase value"
                      className={formErrors.purchaseValue ? "border-red-500" : ""}
                    />
                    {formErrors.purchaseValue && <p className="text-red-500 text-xs mt-1">{formErrors.purchaseValue}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-purchaseDate">Purchase Date</Label>
                    <Input
                      id="edit-purchaseDate"
                      type="date"
                      value={newPropertyForm.purchaseDate}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea
                      id="edit-notes"
                      value={newPropertyForm.notes}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about the property..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="step-3" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-expectedMonthlyRent">Expected Monthly Rent (AED)</Label>
                    <Input
                      id="edit-expectedMonthlyRent"
                      type="number"
                      value={newPropertyForm.expectedMonthlyRent}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, expectedMonthlyRent: e.target.value }))}
                      placeholder="Enter expected monthly rent"
                      className={formErrors.expectedMonthlyRent ? "border-red-500" : ""}
                    />
                    {formErrors.expectedMonthlyRent && <p className="text-red-500 text-xs mt-1">{formErrors.expectedMonthlyRent}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-expectedAnnualExpenses">Expected Annual Expenses (AED)</Label>
                    <Input
                      id="edit-expectedAnnualExpenses"
                      type="number"
                      value={newPropertyForm.expectedAnnualExpenses}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, expectedAnnualExpenses: e.target.value }))}
                      placeholder="Enter expected annual expenses"
                      className={formErrors.expectedAnnualExpenses ? "border-red-500" : ""}
                    />
                    {formErrors.expectedAnnualExpenses && <p className="text-red-500 text-xs mt-1">{formErrors.expectedAnnualExpenses}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-totalUnits">Total Units</Label>
                    <Input
                      id="edit-totalUnits"
                      type="number"
                      value={newPropertyForm.totalUnits}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, totalUnits: e.target.value }))}
                      placeholder="Enter total number of units"
                      className={formErrors.totalUnits ? "border-red-500" : ""}
                    />
                    {formErrors.totalUnits && <p className="text-red-500 text-xs mt-1">{formErrors.totalUnits}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit-occupiedUnits">Occupied Units</Label>
                    <Input
                      id="edit-occupiedUnits"
                      type="number"
                      value={newPropertyForm.occupiedUnits}
                      onChange={(e) => setNewPropertyForm(prev => ({ ...prev, occupiedUnits: e.target.value }))}
                      placeholder="Enter number of occupied units"
                      className={formErrors.occupiedUnits ? "border-red-500" : ""}
                    />
                    {formErrors.occupiedUnits && <p className="text-red-500 text-xs mt-1">{formErrors.occupiedUnits}</p>}
                  </div>
                  {newPropertyForm.totalUnits && newPropertyForm.occupiedUnits && (
                    <div className="col-span-2">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Calculated Metrics</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Occupancy Rate</p>
                            <p className="font-semibold">
                              {Math.round((parseInt(newPropertyForm.occupiedUnits) / parseInt(newPropertyForm.totalUnits)) * 100)}%
                            </p>
                          </div>
                          {newPropertyForm.expectedMonthlyRent && newPropertyForm.expectedAnnualExpenses && (
                            <>
                              <div>
                                <p className="text-muted-foreground">Net Monthly Income</p>
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(parseFloat(newPropertyForm.expectedMonthlyRent) - (parseFloat(newPropertyForm.expectedAnnualExpenses) / 12))}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Annual ROI</p>
                                <p className="font-semibold">
                                  {newPropertyForm.purchaseValue ? 
                                    Math.round(((parseFloat(newPropertyForm.expectedMonthlyRent) * 12 - parseFloat(newPropertyForm.expectedAnnualExpenses)) / parseFloat(newPropertyForm.purchaseValue)) * 100) + '%'
                                    : 'N/A'
                                  }
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <DialogFooter className="mt-6">
                <div className="flex justify-between w-full">
                  <div className="flex space-x-2">
                    {currentFormStep > 1 && (
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentFormStep(prev => prev - 1)}
                      >
                        Previous
                      </Button>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => { setShowEditProperty(false); resetForm(); }}>
                      Cancel
                    </Button>
                    {currentFormStep < 3 ? (
                      <Button 
                        onClick={() => setCurrentFormStep(prev => prev + 1)}
                        className="btn-premium"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button onClick={handleEditProperty} className="btn-premium" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Update Property
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </DialogFooter>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Delete All Confirmation Modal */}
        <Dialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete All Properties</DialogTitle>
              <DialogDescription>
                This will permanently delete every property in your portfolio. This action cannot be undone. Are you sure?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAllConfirm(false)}>
                      Cancel
                    </Button>
              <Button variant="destructive" onClick={handleDeleteAllProperties}>
                Delete All
                      </Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 