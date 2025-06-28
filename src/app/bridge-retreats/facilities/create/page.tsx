'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Save,
  X,
  MapPin,
  User,
  Clock,
  Wifi,
  Car,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  Upload,
  Image as ImageIcon,
  Thermometer,
  Star,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface FacilityFormData {
  name: string;
  type: string;
  capacity: number;
  location: string;
  description: string;
  manager: string;
  operatingHours: string;
  hasWifi: boolean;
  hasParking: boolean;
  parkingSpots: number;
  image: File | null;
  imagePreview: string;
  // Additional fields for retreat integration
  temperature: number;
  rating: number;
  totalReviews: number;
  issueCount: number;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceNotes: string;
  // Retreat linking
  linkedRetreats: string[];
}

interface Retreat {
  id: string;
  title: string;
  type: string;
  status: string;
  location: string;
  capacity: number;
}

const CreateFacilityPage = () => {
  const router = useRouter();
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [retreatsLoading, setRetreatsLoading] = useState(false);

  const [formData, setFormData] = useState<FacilityFormData>({
    name: '',
    type: '',
    capacity: 0,
    location: '',
    description: '',
    manager: '',
    operatingHours: '9:00 AM - 6:00 PM',
    hasWifi: false,
    hasParking: false,
    parkingSpots: 0,
    image: null,
    imagePreview: '',
    // Additional fields for retreat integration
    temperature: 22,
    rating: 0,
    totalReviews: 0,
    issueCount: 0,
    lastMaintenance: '',
    nextMaintenance: '',
    maintenanceNotes: '',
    // Retreat linking
    linkedRetreats: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load retreats on component mount
  useEffect(() => {
    loadRetreats();
  }, []);

  // Cleanup image preview URL on component unmount
  useEffect(() => {
    return () => {
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  const loadRetreats = async () => {
    try {
      setRetreatsLoading(true);
      const response = await fetch('/api/bridge-retreats/retreats');
      if (response.ok) {
        const data = await response.json();
        setRetreats(data.retreats || []);
      }
    } catch (error) {
      console.error('Error loading retreats:', error);
    } finally {
      setRetreatsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Facility name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Facility type is required';
    }

    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.manager.trim()) {
      newErrors.manager = 'Manager name is required';
    }

    if (formData.hasParking && (!formData.parkingSpots || formData.parkingSpots <= 0)) {
      newErrors.parkingSpots = 'Parking spots must be greater than 0 when parking is enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('capacity', formData.capacity.toString());
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('manager', formData.manager);
      formDataToSend.append('operatingHours', formData.operatingHours);
      formDataToSend.append('hasWifi', formData.hasWifi.toString());
      formDataToSend.append('hasParking', formData.hasParking.toString());
      formDataToSend.append('parkingSpots', (formData.hasParking ? formData.parkingSpots : 0).toString());
      formDataToSend.append('temperature', formData.temperature.toString());
      formDataToSend.append('rating', formData.rating.toString());
      formDataToSend.append('totalReviews', formData.totalReviews.toString());
      formDataToSend.append('issueCount', formData.issueCount.toString());
      formDataToSend.append('maintenanceNotes', formData.maintenanceNotes);
      formDataToSend.append('linkedRetreats', JSON.stringify(formData.linkedRetreats));
      
      if (formData.lastMaintenance) {
        formDataToSend.append('lastMaintenance', new Date(formData.lastMaintenance).toISOString());
      }
      if (formData.nextMaintenance) {
        formDataToSend.append('nextMaintenance', new Date(formData.nextMaintenance).toISOString());
      }
      
      // Add image file if present
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch('/api/bridge-retreats/facilities', {
        method: 'POST',
        body: formDataToSend, // No Content-Type header needed for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create facility');
      }

      const data = await response.json();
      const facilityId = data.facility.id;
      
      // Update linked retreats to include this facility
      if (formData.linkedRetreats.length > 0) {
        await updateRetreatsWithFacility(facilityId, formData.linkedRetreats);
      }
      
      setSuccess('Facility created successfully!');
      
      // Redirect to the facilities list after a short delay
      setTimeout(() => {
        router.push('/bridge-retreats/facilities');
      }, 2000);

    } catch (err) {
      console.error('Error creating facility:', err);
      setError(err instanceof Error ? err.message : 'Failed to create facility');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FacilityFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: previewUrl
      }));
      
      clearMessages();
    }
  };

  const handleRemoveImage = () => {
    // Revoke the preview URL to free memory
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const updateRetreatsWithFacility = async (facilityId: string, retreatIds: string[]) => {
    try {
      for (const retreatId of retreatIds) {
        await fetch(`/api/bridge-retreats/retreats/${retreatId}/facilities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ facilityId }),
        });
      }
    } catch (error) {
      console.error('Error linking facility to retreats:', error);
      // Don't throw error as facility creation was successful
    }
  };

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
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between mb-8"
            {...fadeInUp}
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/bridge-retreats/facilities')}
                className="btn-premium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Facilities
              </Button>
              <div>
                <h1 className="text-3xl font-prestigious text-gradient">Create New Facility</h1>
                <p className="text-refined text-muted-foreground mt-1">
                  Add a new facility to your retreat center
                </p>
              </div>
            </div>
          </motion.div>

          {/* Error/Success Messages */}
          {(error || success) && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearMessages}
                      className="ml-2 h-auto p-0 text-red-600 hover:text-red-800"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearMessages}
                      className="ml-2 h-auto p-0 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </motion.div>
          )}

          {/* Form */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-premium border-refined max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl font-prestigious text-gradient flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Facility Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-elegant">
                        Facility Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter facility name"
                        className={cn(
                          "border-refined",
                          errors.name && "border-red-300 focus:border-red-500"
                        )}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="font-elegant">
                        Facility Type *
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleInputChange('type', value)}
                      >
                        <SelectTrigger className={cn(
                          "border-refined",
                          errors.type && "border-red-300 focus:border-red-500"
                        )}>
                          <SelectValue placeholder="Select facility type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACCOMMODATION">Accommodation</SelectItem>
                          <SelectItem value="DINING">Dining</SelectItem>
                          <SelectItem value="WELLNESS">Wellness</SelectItem>
                          <SelectItem value="RECREATION">Recreation</SelectItem>
                          <SelectItem value="UTILITY">Utility</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <p className="text-sm text-red-600">{errors.type}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="font-elegant">
                        Capacity *
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        value={formData.capacity || ''}
                        onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                        placeholder="Enter capacity"
                        className={cn(
                          "border-refined",
                          errors.capacity && "border-red-300 focus:border-red-500"
                        )}
                      />
                      {errors.capacity && (
                        <p className="text-sm text-red-600">{errors.capacity}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="font-elegant">
                        Location *
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Enter location"
                          className={cn(
                            "pl-10 border-refined",
                            errors.location && "border-red-300 focus:border-red-500"
                          )}
                        />
                      </div>
                      {errors.location && (
                        <p className="text-sm text-red-600">{errors.location}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manager" className="font-elegant">
                        Manager *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="manager"
                          value={formData.manager}
                          onChange={(e) => handleInputChange('manager', e.target.value)}
                          placeholder="Enter manager name"
                          className={cn(
                            "pl-10 border-refined",
                            errors.manager && "border-red-300 focus:border-red-500"
                          )}
                        />
                      </div>
                      {errors.manager && (
                        <p className="text-sm text-red-600">{errors.manager}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatingHours" className="font-elegant">
                        Operating Hours
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="operatingHours"
                          value={formData.operatingHours}
                          onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                          placeholder="e.g., 9:00 AM - 6:00 PM"
                          className="pl-10 border-refined"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-elegant">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter facility description"
                      rows={4}
                      className="border-refined"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="image" className="font-elegant">
                      Facility Image
                    </Label>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border/20 rounded-lg p-6 text-center hover:border-border/40 transition-colors">
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="image"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Choose an image</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </label>
                      </div>
                      {formData.imagePreview && (
                        <div className="relative">
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-elegant">Amenities</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* WiFi */}
                      <div className="flex items-center justify-between p-4 border border-border/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Wifi className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-elegant">WiFi Available</p>
                            <p className="text-sm text-refined text-muted-foreground">
                              Provide wireless internet access
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.hasWifi}
                          onCheckedChange={(checked) => handleInputChange('hasWifi', checked)}
                        />
                      </div>

                      {/* Parking */}
                      <div className="flex items-center justify-between p-4 border border-border/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Car className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-elegant">Parking Available</p>
                            <p className="text-sm text-refined text-muted-foreground">
                              Provide parking spaces
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.hasParking}
                          onCheckedChange={(checked) => handleInputChange('hasParking', checked)}
                        />
                      </div>
                    </div>

                    {/* Parking Spots */}
                    {formData.hasParking && (
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Label htmlFor="parkingSpots" className="font-elegant">
                          Number of Parking Spots *
                        </Label>
                        <Input
                          id="parkingSpots"
                          type="number"
                          min="1"
                          value={formData.parkingSpots || ''}
                          onChange={(e) => handleInputChange('parkingSpots', parseInt(e.target.value) || 0)}
                          placeholder="Enter number of parking spots"
                          className={cn(
                            "border-refined",
                            errors.parkingSpots && "border-red-300 focus:border-red-500"
                          )}
                        />
                        {errors.parkingSpots && (
                          <p className="text-sm text-red-600">{errors.parkingSpots}</p>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Advanced Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-elegant">Advanced Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Temperature */}
                      <div className="space-y-2">
                        <Label htmlFor="temperature" className="font-elegant">
                          Temperature (°C)
                        </Label>
                        <div className="relative">
                          <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="temperature"
                            type="number"
                            min="0"
                            max="50"
                            step="0.5"
                            value={formData.temperature || ''}
                            onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value) || 22)}
                            placeholder="22"
                            className="pl-10 border-refined"
                          />
                        </div>
                        <p className="text-xs text-refined text-muted-foreground">
                          For climate-controlled facilities
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="space-y-2">
                        <Label htmlFor="rating" className="font-elegant">
                          Initial Rating
                        </Label>
                        <div className="relative">
                          <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="rating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={formData.rating || ''}
                            onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                            placeholder="0.0"
                            className="pl-10 border-refined"
                          />
                        </div>
                        <p className="text-xs text-refined text-muted-foreground">
                          0-5 rating scale
                        </p>
                      </div>
                    </div>

                    {/* Maintenance Schedule */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="lastMaintenance" className="font-elegant">
                          Last Maintenance
                        </Label>
                        <Input
                          id="lastMaintenance"
                          type="date"
                          value={formData.lastMaintenance}
                          onChange={(e) => handleInputChange('lastMaintenance', e.target.value)}
                          className="border-refined"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nextMaintenance" className="font-elegant">
                          Next Maintenance
                        </Label>
                        <Input
                          id="nextMaintenance"
                          type="date"
                          value={formData.nextMaintenance}
                          onChange={(e) => handleInputChange('nextMaintenance', e.target.value)}
                          className="border-refined"
                        />
                      </div>
                    </div>

                    {/* Maintenance Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="maintenanceNotes" className="font-elegant">
                        Maintenance Notes
                      </Label>
                      <Textarea
                        id="maintenanceNotes"
                        value={formData.maintenanceNotes}
                        onChange={(e) => handleInputChange('maintenanceNotes', e.target.value)}
                        placeholder="Enter maintenance notes and instructions"
                        rows={3}
                        className="border-refined"
                      />
                    </div>
                  </div>

                  {/* Retreat Integration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-elegant">Retreat Integration</h3>
                    <p className="text-sm text-refined text-muted-foreground">
                      Link this facility to existing retreats for seamless integration
                    </p>
                    
                    {retreatsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2 text-refined">Loading retreats...</span>
                      </div>
                    ) : retreats.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {retreats.map((retreat) => (
                          <motion.div
                            key={retreat.id}
                            className="p-4 border border-border/20 rounded-lg hover:border-border/40 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-elegant text-sm font-medium">{retreat.title}</h4>
                                <p className="text-xs text-refined text-muted-foreground mt-1">
                                  {retreat.type} • {retreat.location}
                                </p>
                                <p className="text-xs text-refined text-muted-foreground">
                                  Capacity: {retreat.capacity}
                                </p>
                                <span 
                                  className={cn(
                                    "mt-2 text-xs px-2 py-1 rounded-full font-medium",
                                    retreat.status === 'ACTIVE' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-600'
                                  )}
                                >
                                  {retreat.status}
                                </span>
                              </div>
                              <div className="ml-3">
                                <input
                                  type="checkbox"
                                  id={`retreat-${retreat.id}`}
                                  checked={formData.linkedRetreats.includes(retreat.id)}
                                  onChange={(e) => {
                                    const updatedRetreats = e.target.checked
                                      ? [...formData.linkedRetreats, retreat.id]
                                      : formData.linkedRetreats.filter(id => id !== retreat.id);
                                    handleInputChange('linkedRetreats', updatedRetreats);
                                  }}
                                  className="rounded border-border/30 text-primary focus:ring-primary"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-refined text-muted-foreground">
                          No retreats available for linking
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => router.push('/bridge-retreats/retreats/create')}
                          className="mt-3"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Retreat
                        </Button>
                      </div>
                    )}

                    {formData.linkedRetreats.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-elegant text-blue-800">
                          Selected Retreats: {formData.linkedRetreats.length}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          This facility will be automatically included in the selected retreats' facilities list.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border/20">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/bridge-retreats/facilities')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="btn-premium"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Facility
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default CreateFacilityPage;