"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  User,
  FileText,
  Save,
  Eye,
  Plus,
  X,
  Star,
  Wifi,
  Car,
  Utensils,
  Coffee,
  Dumbbell,
  TreePine,
  Waves,
  Mountain,
  Sunrise,
  AlertCircle,
  CheckCircle,
  Loader2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Building2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Activity {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  instructor: string;
  capacity: number;
  equipment: string[];
}

interface Schedule {
  day: number;
  activities: {
    time: string;
    activityId: string;
    activityName: string;
    duration: number;
  }[];
}

interface Facility {
  id: string;
  name: string;
  type: string;
  status: string;
  capacity: number;
  location: string;
  manager: string;
  description?: string;
  operatingHours?: string;
  hasWifi: boolean;
  hasParking: boolean;
  parkingSpots?: number;
  rating: number;
}

interface RoomType {
  id: string;
  name: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  quantity: number;
  description: string;
}

interface SeasonalPricing {
  id: string;
  season: string;
  startDate: string;
  endDate: string;
  priceMultiplier: number;
  description: string;
}

interface RetreatFormData {
  title: string;
  description: string;
  type: string;
  customTypeName?: string;
  duration: number;
  capacity: number;
  price: number;
  location: string;
  facilityId: string;
  instructor: string;
  startDate: string;
  endDate: string;
  images: string[];
  amenities: string[];
  requirements: string[];
  activities: Activity[];
  schedule: Schedule[];
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  specialInstructions: string;
  // Property-like fields
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  expectedRevenue: number;
  expectedExpenses: number;
  netIncome: number;
  facilitiesIncluded: string[];
  roomTypes: RoomType[];
  seasonalPricing: SeasonalPricing[];
  depositRequired: number;
  refundPolicy: string;
  minimumStay: number;
  maximumStay: number;
  checkInTime: string;
  checkOutTime: string;
  ageRestrictions: string;
  healthRequirements: string[];
  emergencyContact: string;
  emergencyPhone: string;
  insuranceCoverage: string;
  certifications: string[];
  staffCount: number;
  languages: string[];
}

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'meals', label: 'Meals Included', icon: Utensils },
  { id: 'coffee', label: 'Coffee/Tea', icon: Coffee },
  { id: 'gym', label: 'Fitness Center', icon: Dumbbell },
  { id: 'spa', label: 'Spa Services', icon: Star },
  { id: 'nature', label: 'Nature Access', icon: TreePine },
  { id: 'water', label: 'Water Activities', icon: Waves },
  { id: 'mountain', label: 'Mountain Views', icon: Mountain },
  { id: 'sunrise', label: 'Sunrise Sessions', icon: Sunrise },
];

// Map form types to API enum values
const TYPE_MAPPING = {
  'wellness': 'WELLNESS',
  'corporate': 'CORPORATE',
  'spiritual': 'SPIRITUAL',
  'adventure': 'ADVENTURE',
  'educational': 'EDUCATIONAL'
};

export default function CreateRetreat() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Facility selection state
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  
  const [formData, setFormData] = useState<RetreatFormData>({
    title: "",
    description: "",
    type: "",
    duration: 1,
    capacity: 10,
    price: 1000,
    location: "",
    facilityId: "",
    instructor: "",
    startDate: "",
    endDate: "",
    images: [],
    amenities: [],
    requirements: [],
    activities: [],
    schedule: [],
    inclusions: [],
    exclusions: [],
    cancellationPolicy: "",
    specialInstructions: "",
    totalRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
    expectedRevenue: 0,
    expectedExpenses: 0,
    netIncome: 0,
    facilitiesIncluded: [],
    roomTypes: [],
    seasonalPricing: [],
    depositRequired: 0,
    refundPolicy: "",
    minimumStay: 0,
    maximumStay: 0,
    checkInTime: "",
    checkOutTime: "",
    ageRestrictions: "",
    healthRequirements: [],
    emergencyContact: "",
    emergencyPhone: "",
    insuranceCoverage: "",
    certifications: [],
    staffCount: 0,
    languages: []
  });

  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    name: "",
    description: "",
    duration: 60,
    instructor: "",
    capacity: 0,
    equipment: []
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  
  // Custom type functionality
  const [showCustomType, setShowCustomType] = useState(false);
  const [customType, setCustomType] = useState("");
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  
  // Room type management
  const [newRoomType, setNewRoomType] = useState<Partial<RoomType>>({
    name: "",
    capacity: 1,
    pricePerNight: 0,
    amenities: [],
    quantity: 1,
    description: ""
  });

  // Fetch facilities on component mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setFacilitiesLoading(true);
      const response = await fetch('/api/bridge-retreats/facilities');
      
      if (response.ok) {
        const data = await response.json();
        setFacilities(data.facilities || []);
      } else {
        throw new Error('Failed to fetch facilities');
      }
    } catch (error) {
      console.error('Failed to fetch facilities:', error);
      setError('Failed to load facilities. Please try again.');
    } finally {
      setFacilitiesLoading(false);
    }
  };

  const updateFormData = (field: keyof RetreatFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFacilityChange = (facilityId: string) => {
    const facility = facilities.find(f => f.id === facilityId);
    setSelectedFacility(facility || null);
    updateFormData("facilityId", facilityId);
    
    if (facility) {
      // Auto-populate location with facility details
      updateFormData("location", facility.location);
    } else {
      updateFormData("location", "");
    }
  };

  const addActivity = () => {
    if (newActivity.name && newActivity.description) {
      const activity: Activity = {
        id: Date.now().toString(),
        name: newActivity.name,
        description: newActivity.description,
        duration: newActivity.duration || 60,
        instructor: newActivity.instructor || formData.instructor,
        capacity: newActivity.capacity || formData.capacity,
        equipment: newActivity.equipment || []
      };
      
      updateFormData("activities", [...formData.activities, activity]);
      setNewActivity({
        name: "",
        description: "",
        duration: 60,
        instructor: "",
        capacity: 0,
        equipment: []
      });
    }
  };

  const removeActivity = (activityId: string) => {
    updateFormData("activities", formData.activities.filter(a => a.id !== activityId));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      updateFormData("requirements", [...formData.requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    updateFormData("requirements", formData.requirements.filter((_, i) => i !== index));
  };

  const addInclusion = () => {
    if (newInclusion.trim()) {
      updateFormData("inclusions", [...formData.inclusions, newInclusion.trim()]);
      setNewInclusion("");
    }
  };

  const removeInclusion = (index: number) => {
    updateFormData("inclusions", formData.inclusions.filter((_, i) => i !== index));
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      updateFormData("exclusions", [...formData.exclusions, newExclusion.trim()]);
      setNewExclusion("");
    }
  };

  const removeExclusion = (index: number) => {
    updateFormData("exclusions", formData.exclusions.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenityId: string) => {
    const currentAmenities = formData.amenities;
    if (currentAmenities.includes(amenityId)) {
      updateFormData("amenities", currentAmenities.filter(a => a !== amenityId));
    } else {
      updateFormData("amenities", [...currentAmenities, amenityId]);
    }
  };

  // Custom type functions
  const handleTypeChange = (value: string) => {
    if (value === "custom") {
      setShowCustomType(true);
      setCustomType("");
    } else {
      setShowCustomType(false);
      updateFormData("type", value);
    }
  };

  const addCustomType = () => {
    if (customType.trim() && !customTypes.includes(customType.trim())) {
      const newCustomType = customType.trim();
      setCustomTypes(prev => [...prev, newCustomType]);
      updateFormData("type", newCustomType);
      setCustomType("");
      setShowCustomType(false);
    }
  };

  const removeCustomType = (typeToRemove: string) => {
    setCustomTypes(prev => prev.filter(type => type !== typeToRemove));
    if (formData.type === typeToRemove) {
      updateFormData("type", "");
    }
  };

  // Room type management functions
  const addRoomType = () => {
    if (!newRoomType.name?.trim()) return;
    
    const roomType: RoomType = {
      id: `room-${Date.now()}`,
      name: newRoomType.name,
      capacity: newRoomType.capacity || 1,
      pricePerNight: newRoomType.pricePerNight || 0,
      amenities: newRoomType.amenities || [],
      quantity: newRoomType.quantity || 1,
      description: newRoomType.description || ""
    };
    
    updateFormData("roomTypes", [...formData.roomTypes, roomType]);
    setNewRoomType({
      name: "",
      capacity: 1,
      pricePerNight: 0,
      amenities: [],
      quantity: 1,
      description: ""
    });
  };

  const removeRoomType = (roomTypeId: string) => {
    updateFormData("roomTypes", formData.roomTypes.filter(rt => rt.id !== roomTypeId));
  };

  const updateOccupancyRate = () => {
    if (formData.totalRooms > 0) {
      const rate = (formData.occupiedRooms / formData.totalRooms) * 100;
      updateFormData("occupancyRate", Math.round(rate));
    }
  };

  const formatTypeForDisplay = (type: string) => {
    // If it's a predefined type, use the label
    const predefinedTypes: { [key: string]: string } = {
      'wellness': 'Wellness & Health',
      'corporate': 'Corporate Training',
      'spiritual': 'Spiritual & Mindfulness',
      'adventure': 'Adventure & Outdoor',
      'educational': 'Educational & Learning'
    };
    
    return predefinedTypes[type] || type;
  };

  // Image handling functions
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    await processFiles(Array.from(files));
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files);
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image file`);
        return false;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Check total image limit
    if (formData.images.length + validFiles.length > 10) {
      setError(`Cannot upload more than 10 images total`);
      return;
    }

    setImageUploading(true);
    try {
      // Create FormData for upload
      const uploadFormData = new FormData();
      validFiles.forEach(file => {
        uploadFormData.append('files', file);
      });

      // Upload files to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Add uploaded file URLs to form data
      updateFormData("images", [...formData.images, ...result.files]);
      
      // Clear any previous errors
      setError(null);
    } catch (error) {
      console.error('Error uploading images:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    updateFormData("images", newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    updateFormData("images", newImages);
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.title.trim()) errors.push("Title is required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (!formData.type) errors.push("Retreat type is required");
    if (!formData.location.trim()) errors.push("Location is required");
    if (!formData.instructor.trim()) errors.push("Instructor is required");
    if (!formData.startDate) errors.push("Start date is required");
    if (!formData.endDate) errors.push("End date is required");
    if (formData.duration < 1) errors.push("Duration must be at least 1 day");
    if (formData.capacity < 1) errors.push("Capacity must be at least 1");
    if (formData.price < 0) errors.push("Price cannot be negative");

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        errors.push("End date must be after start date");
      }
    }

    return errors;
  };

  const handleSave = async (status: 'draft' | 'active') => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(", "));
        return;
      }

      console.log('=== RETREAT CREATION DEBUG ===');
      console.log('Form data:', formData);
      console.log('Status:', status);
      console.log('==============================');

      // Prepare data for API
      // Handle type mapping - use predefined mapping or custom type
      let apiType = formData.type;
      let customTypeName = undefined;
      
      if (TYPE_MAPPING[formData.type as keyof typeof TYPE_MAPPING]) {
        // Use predefined type mapping
        apiType = TYPE_MAPPING[formData.type as keyof typeof TYPE_MAPPING];
      } else {
        // For custom types, use CUSTOM enum value and store original name
        apiType = 'CUSTOM';
        customTypeName = formData.type;
      }

      const retreatData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: apiType,
        customTypeName,
        status: status === 'active' ? 'ACTIVE' : 'DRAFT',
        duration: formData.duration,
        capacity: formData.capacity,
        price: formData.price,
        location: formData.location.trim(),
        facilityId: formData.facilityId,
        instructor: formData.instructor.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        amenities: formData.amenities,
        inclusions: formData.inclusions,
        requirements: formData.requirements,
        cancellationPolicy: formData.cancellationPolicy.trim() || null,
        images: formData.images,
        // Activities will be handled separately if the API supports it
        activities: formData.activities
      };

      console.log('API payload:', retreatData);

      // Create retreat
      const result = await apiClient.createRetreat(retreatData);
      
      console.log('Retreat created successfully:', result);

      setSuccess(`Retreat ${status === 'active' ? 'published' : 'saved as draft'} successfully!`);
      
      // Redirect to retreat details page after a short delay
      setTimeout(() => {
        router.push(`/bridge-retreats/retreats/${result.retreat.id}`);
      }, 2000);

    } catch (err) {
      console.error('Failed to create retreat:', err);
      setError(err instanceof Error ? err.message : 'Failed to create retreat');
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = () => {
    if (formData.activities.length === 0) return;
    
    const schedule: Schedule[] = [];
    for (let day = 1; day <= formData.duration; day++) {
      const daySchedule: Schedule = {
        day,
        activities: [
          {
            time: "07:00",
            activityId: "morning",
            activityName: "Morning Meditation",
            duration: 60
          },
          {
            time: "09:00",
            activityId: "breakfast",
            activityName: "Breakfast",
            duration: 60
          },
          {
            time: "10:30",
            activityId: formData.activities[0]?.id || "main",
            activityName: formData.activities[0]?.name || "Main Activity",
            duration: formData.activities[0]?.duration || 120
          },
          {
            time: "13:00",
            activityId: "lunch",
            activityName: "Lunch Break",
            duration: 90
          },
          {
            time: "15:00",
            activityId: formData.activities[1]?.id || "afternoon",
            activityName: formData.activities[1]?.name || "Afternoon Session",
            duration: formData.activities[1]?.duration || 120
          },
          {
            time: "18:00",
            activityId: "evening",
            activityName: "Evening Reflection",
            duration: 60
          }
        ]
      };
      schedule.push(daySchedule);
    }
    
    updateFormData("schedule", schedule);
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
          {/* Page Header */}
          <motion.div 
            className="mb-6 sm:mb-8"
            {...fadeInUp}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Link href="/bridge-retreats/retreats">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Retreats
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-prestigious text-gradient">
                    Create New Retreat
                  </h1>
                  <p className="text-sm sm:text-base text-refined text-muted-foreground">
                    Design a comprehensive retreat program with activities and schedules.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => handleSave('draft')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button className="btn-premium" onClick={() => handleSave('active')}>
                  <Save className="w-4 h-4 mr-2" />
                  Publish Retreat
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Error/Success Messages */}
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 fixed top-20 right-4 z-50 max-w-md"
            >
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
            </motion.div>
          )}

          {/* Form Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="facilities">Facilities</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Essential details about your retreat program
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Retreat Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Mindfulness & Meditation Retreat"
                          value={formData.title}
                          onChange={(e) => updateFormData("title", e.target.value)}
                          className="border-refined"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Retreat Type *</Label>
                        <Select value={formData.type} onValueChange={handleTypeChange}>
                          <SelectTrigger className="border-refined">
                            <SelectValue placeholder="Select retreat type">
                              {formData.type ? formatTypeForDisplay(formData.type) : "Select retreat type"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wellness">Wellness & Health</SelectItem>
                            <SelectItem value="corporate">Corporate Training</SelectItem>
                            <SelectItem value="spiritual">Spiritual & Mindfulness</SelectItem>
                            <SelectItem value="adventure">Adventure & Outdoor</SelectItem>
                            <SelectItem value="educational">Educational & Learning</SelectItem>
                            
                            {/* Custom Types */}
                            {customTypes.map((customTypeItem) => (
                              <SelectItem key={customTypeItem} value={customTypeItem}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{customTypeItem}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 ml-2 hover:bg-red-100"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      removeCustomType(customTypeItem);
                                    }}
                                  >
                                    <X className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              </SelectItem>
                            ))}
                            
                            {/* Add Custom Type Option */}
                            <SelectItem value="custom">
                              <div className="flex items-center">
                                <Plus className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="text-blue-600 font-medium">Add Custom Type</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Custom Type Input */}
                        {showCustomType && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-4 border border-blue-200 rounded-lg bg-blue-50"
                          >
                            <Label htmlFor="customType" className="text-sm font-medium text-blue-900">
                              Custom Retreat Type
                            </Label>
                            <div className="flex space-x-2 mt-2">
                              <Input
                                id="customType"
                                placeholder="e.g., Culinary Experience, Art Therapy..."
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                className="flex-1 border-blue-300 focus:border-blue-500"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCustomType();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                onClick={addCustomType}
                                disabled={!customType.trim()}
                                className="btn-premium px-4"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setShowCustomType(false);
                                  setCustomType("");
                                }}
                                className="px-4"
                              >
                                Cancel
                              </Button>
                            </div>
                            <p className="text-xs text-blue-600 mt-2">
                              Create a custom retreat type that best describes your unique program.
                            </p>
                          </motion.div>
                        )}
                        
                        {/* Display Custom Types */}
                        {customTypes.length > 0 && !showCustomType && (
                          <div className="mt-3">
                            <Label className="text-sm text-muted-foreground">Your Custom Types:</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {customTypes.map((customTypeItem) => (
                                <Badge
                                  key={customTypeItem}
                                  variant="secondary"
                                  className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1"
                                >
                                  {customTypeItem}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-red-100"
                                    onClick={() => removeCustomType(customTypeItem)}
                                  >
                                    <X className="h-3 w-3 text-red-500" />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your retreat program, its goals, and what participants can expect..."
                        value={formData.description}
                        onChange={(e) => updateFormData("description", e.target.value)}
                        className="border-refined min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (Days) *</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          max="30"
                          value={formData.duration}
                          onChange={(e) => updateFormData("duration", parseInt(e.target.value) || 1)}
                          className="border-refined"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="capacity">Max Capacity *</Label>
                        <Input
                          id="capacity"
                          type="number"
                          min="1"
                          max="100"
                          value={formData.capacity}
                          onChange={(e) => updateFormData("capacity", parseInt(e.target.value) || 10)}
                          className="border-refined"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Price (AED) *</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="100"
                          value={formData.price}
                          onChange={(e) => updateFormData("price", parseInt(e.target.value) || 1000)}
                          className="border-refined"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facility">Facility Location *</Label>
                        {facilitiesLoading ? (
                          <div className="flex items-center space-x-2 p-2 border rounded-md border-refined">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading facilities...</span>
                          </div>
                        ) : (
                          <Select value={formData.facilityId} onValueChange={handleFacilityChange}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select a facility location" />
                            </SelectTrigger>
                            <SelectContent>
                              {facilities.map((facility) => (
                                <SelectItem key={facility.id} value={facility.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{facility.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {facility.location}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {facility.type} • Capacity: {facility.capacity} • Manager: {facility.manager}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                              {facilities.length === 0 && (
                                <SelectItem value="none" disabled>
                                  No facilities available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                        {selectedFacility && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-start space-x-2">
                              <Building2 className="w-4 h-4 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">{selectedFacility.name}</p>
                                <p className="text-sm text-blue-700">
                                  {selectedFacility.location}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  {selectedFacility.type} • Capacity: {selectedFacility.capacity} • Managed by {selectedFacility.manager}
                                </p>
                                <div className="flex items-center space-x-3 mt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    selectedFacility.status === 'OPERATIONAL' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {selectedFacility.status}
                                  </span>
                                  {selectedFacility.hasWifi && (
                                    <span className="text-xs text-blue-600 flex items-center">
                                      <Wifi className="w-3 h-3 mr-1" />
                                      WiFi
                                    </span>
                                  )}
                                  {selectedFacility.hasParking && (
                                    <span className="text-xs text-blue-600 flex items-center">
                                      <Car className="w-3 h-3 mr-1" />
                                      Parking
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instructor">Lead Instructor *</Label>
                        <Input
                          id="instructor"
                          placeholder="e.g., Sarah Chen"
                          value={formData.instructor}
                          onChange={(e) => updateFormData("instructor", e.target.value)}
                          className="border-refined"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => updateFormData("startDate", e.target.value)}
                          className="border-refined"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => updateFormData("endDate", e.target.value)}
                          className="border-refined"
                        />
                      </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Retreat Images</Label>
                        <p className="text-sm text-muted-foreground">
                          Upload images to showcase your retreat location and activities
                        </p>
                      </div>

                      {/* Upload Area */}
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="image-upload"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={imageUploading}
                        />
                        <label
                          htmlFor="image-upload"
                          className={cn(
                            "cursor-pointer flex flex-col items-center space-y-2",
                            imageUploading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {imageUploading ? (
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                          ) : (
                            <Upload className="w-8 h-8 text-gray-400" />
                          )}
                          <div className="text-sm text-gray-600">
                            {imageUploading ? (
                              <span>Uploading images...</span>
                            ) : (
                              <>
                                <span className="font-medium text-primary">Click to upload</span>
                                <span> or drag and drop</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB each (max 10 images)
                          </div>
                        </label>
                      </div>

                      {/* Image Preview Grid */}
                      {formData.images.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">
                            Uploaded Images ({formData.images.length})
                          </Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {formData.images.map((image, index) => (
                              <div
                                key={index}
                                className="relative group border rounded-lg overflow-hidden bg-gray-50"
                              >
                                <div className="aspect-square">
                                  <img
                                    src={image}
                                    alt={`Retreat image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                
                                {/* Image Controls */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                    {index > 0 && (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0"
                                        onClick={() => moveImage(index, index - 1)}
                                      >
                                        <ArrowLeft className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-8 w-8 p-0"
                                      onClick={() => removeImage(index)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                    {index < formData.images.length - 1 && (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0"
                                        onClick={() => moveImage(index, index + 1)}
                                      >
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Main Image Badge */}
                                {index === 0 && (
                                  <div className="absolute top-2 left-2">
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                      Main Image
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            <ImageIcon className="w-4 h-4 inline mr-1" />
                            The first image will be used as the main retreat image. 
                            Drag to reorder or use the arrow buttons.
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details */}
              <TabsContent value="details">
                <div className="space-y-6">
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2 text-green-600" />
                        Requirements & Prerequisites
                      </CardTitle>
                      <CardDescription>
                        Specify any requirements or prerequisites for participants
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a requirement (e.g., Basic fitness level required)"
                          value={newRequirement}
                          onChange={(e) => setNewRequirement(e.target.value)}
                          className="border-refined"
                          onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                        />
                        <Button onClick={addRequirement} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {formData.requirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                            <span>{req}</span>
                            <button onClick={() => removeRequirement(index)}>
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="card-premium border-refined">
                      <CardHeader>
                        <CardTitle className="text-lg">What's Included</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add inclusion (e.g., All meals)"
                            value={newInclusion}
                            onChange={(e) => setNewInclusion(e.target.value)}
                            className="border-refined"
                            onKeyPress={(e) => e.key === 'Enter' && addInclusion()}
                          />
                          <Button onClick={addInclusion} variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {formData.inclusions.map((inclusion, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                              <span className="text-sm text-green-800">{inclusion}</span>
                              <button onClick={() => removeInclusion(index)}>
                                <X className="w-4 h-4 text-green-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-premium border-refined">
                      <CardHeader>
                        <CardTitle className="text-lg">What's Not Included</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add exclusion (e.g., Personal expenses)"
                            value={newExclusion}
                            onChange={(e) => setNewExclusion(e.target.value)}
                            className="border-refined"
                            onKeyPress={(e) => e.key === 'Enter' && addExclusion()}
                          />
                          <Button onClick={addExclusion} variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {formData.exclusions.map((exclusion, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                              <span className="text-sm text-red-800">{exclusion}</span>
                              <button onClick={() => removeExclusion(index)}>
                                <X className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Facilities */}
              <TabsContent value="facilities">
                <div className="space-y-6">
                  {/* Room Management */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Room & Accommodation Management
                      </CardTitle>
                      <CardDescription>
                        Manage room types, capacity, and occupancy for your retreat
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="totalRooms">Total Rooms Available</Label>
                          <Input
                            id="totalRooms"
                            type="number"
                            min="0"
                            value={formData.totalRooms}
                            onChange={(e) => updateFormData("totalRooms", parseInt(e.target.value) || 0)}
                            className="border-refined"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="occupiedRooms">Currently Occupied</Label>
                          <Input
                            id="occupiedRooms"
                            type="number"
                            min="0"
                            max={formData.totalRooms}
                            value={formData.occupiedRooms}
                            onChange={(e) => updateFormData("occupiedRooms", parseInt(e.target.value) || 0)}
                            className="border-refined"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="occupancyRate">Occupancy Rate (%)</Label>
                          <Input
                            id="occupancyRate"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.totalRooms > 0 ? Math.round((formData.occupiedRooms / formData.totalRooms) * 100) : 0}
                            readOnly
                            className="border-refined bg-gray-50"
                          />
                        </div>
                      </div>

                      {/* Occupancy Visualization */}
                      {formData.totalRooms > 0 && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                          <Label className="text-sm font-medium text-muted-foreground">Occupancy Overview</Label>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                  style={{ width: `${(formData.occupiedRooms / formData.totalRooms) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-blue-600">
                                {formData.occupiedRooms}/{formData.totalRooms}
                              </p>
                              <p className="text-xs text-muted-foreground">Rooms Occupied</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Facilities & Amenities */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-600" />
                        Facilities & Amenities
                      </CardTitle>
                      <CardDescription>
                        Select the facilities and amenities available at your retreat
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {AMENITY_OPTIONS.map((amenity) => {
                          const Icon = amenity.icon;
                          const isSelected = formData.amenities.includes(amenity.id);
                          
                          return (
                            <div
                              key={amenity.id}
                              className={cn(
                                "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all",
                                isSelected 
                                  ? "bg-blue-50 border-blue-200 text-blue-900" 
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              )}
                              onClick={() => toggleAmenity(amenity.id)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onChange={() => toggleAmenity(amenity.id)}
                                className="pointer-events-none"
                              />
                              <Icon className={cn("w-4 h-4", isSelected ? "text-blue-600" : "text-gray-500")} />
                              <span className="text-sm font-medium">{amenity.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Staff & Services */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2 text-green-600" />
                        Staff & Services
                      </CardTitle>
                      <CardDescription>
                        Information about staff and services provided
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="staffCount">Total Staff Count</Label>
                          <Input
                            id="staffCount"
                            type="number"
                            min="0"
                            value={formData.staffCount}
                            onChange={(e) => updateFormData("staffCount", parseInt(e.target.value) || 0)}
                            className="border-refined"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">Emergency Contact</Label>
                          <Input
                            id="emergencyContact"
                            placeholder="Emergency contact name"
                            value={formData.emergencyContact}
                            onChange={(e) => updateFormData("emergencyContact", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                          <Input
                            id="emergencyPhone"
                            placeholder="+971 XX XXX XXXX"
                            value={formData.emergencyPhone}
                            onChange={(e) => updateFormData("emergencyPhone", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checkInTime">Check-in Time</Label>
                          <Input
                            id="checkInTime"
                            type="time"
                            value={formData.checkInTime}
                            onChange={(e) => updateFormData("checkInTime", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checkOutTime">Check-out Time</Label>
                          <Input
                            id="checkOutTime"
                            type="time"
                            value={formData.checkOutTime}
                            onChange={(e) => updateFormData("checkOutTime", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insuranceCoverage">Insurance Coverage</Label>
                          <Input
                            id="insuranceCoverage"
                            placeholder="Type of insurance coverage"
                            value={formData.insuranceCoverage}
                            onChange={(e) => updateFormData("insuranceCoverage", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Financial */}
              <TabsContent value="financial">
                <div className="space-y-6">
                  {/* Revenue & Expenses */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                        Financial Information
                      </CardTitle>
                      <CardDescription>
                        Manage pricing, revenue expectations, and expenses
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expectedRevenue">Expected Revenue (AED)</Label>
                          <Input
                            id="expectedRevenue"
                            type="number"
                            min="0"
                            step="100"
                            value={formData.expectedRevenue}
                            onChange={(e) => updateFormData("expectedRevenue", parseInt(e.target.value) || 0)}
                            className="border-refined"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expectedExpenses">Expected Expenses (AED)</Label>
                          <Input
                            id="expectedExpenses"
                            type="number"
                            min="0"
                            step="100"
                            value={formData.expectedExpenses}
                            onChange={(e) => updateFormData("expectedExpenses", parseInt(e.target.value) || 0)}
                            className="border-refined"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="depositRequired">Deposit Required (AED)</Label>
                          <Input
                            id="depositRequired"
                            type="number"
                            min="0"
                            step="50"
                            value={formData.depositRequired}
                            onChange={(e) => updateFormData("depositRequired", parseInt(e.target.value) || 0)}
                            className="border-refined"
                          />
                        </div>
                      </div>

                      {/* Financial Summary */}
                      {(formData.expectedRevenue > 0 || formData.expectedExpenses > 0) && (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                          <Label className="text-sm font-medium text-muted-foreground">Financial Summary</Label>
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">
                                AED {formData.expectedRevenue.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">Expected Revenue</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-600">
                                AED {formData.expectedExpenses.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">Expected Expenses</p>
                            </div>
                            <div className="text-center">
                              <p className={cn(
                                "text-2xl font-bold",
                                (formData.expectedRevenue - formData.expectedExpenses) >= 0 
                                  ? "text-green-600" 
                                  : "text-red-600"
                              )}>
                                AED {(formData.expectedRevenue - formData.expectedExpenses).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">Net Income</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Booking Policies */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        Booking Policies
                      </CardTitle>
                      <CardDescription>
                        Set booking requirements and restrictions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="minimumStay">Minimum Stay (Days)</Label>
                          <Input
                            id="minimumStay"
                            type="number"
                            min="1"
                            value={formData.minimumStay}
                            onChange={(e) => updateFormData("minimumStay", parseInt(e.target.value) || 0)}
                            className="border-refined"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maximumStay">Maximum Stay (Days)</Label>
                          <Input
                            id="maximumStay"
                            type="number"
                            min="1"
                            value={formData.maximumStay}
                            onChange={(e) => updateFormData("maximumStay", parseInt(e.target.value) || 0)}
                            className="border-refined"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ageRestrictions">Age Restrictions</Label>
                        <Input
                          id="ageRestrictions"
                          placeholder="e.g., 18+ only, Family-friendly, etc."
                          value={formData.ageRestrictions}
                          onChange={(e) => updateFormData("ageRestrictions", e.target.value)}
                          className="border-refined"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="refundPolicy">Refund Policy</Label>
                        <Textarea
                          id="refundPolicy"
                          placeholder="Describe your refund policy..."
                          value={formData.refundPolicy}
                          onChange={(e) => updateFormData("refundPolicy", e.target.value)}
                          className="border-refined min-h-[100px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activities */}
              <TabsContent value="activities">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-purple-600" />
                      Retreat Activities
                    </CardTitle>
                    <CardDescription>
                      Define the activities and sessions that will be part of your retreat
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add New Activity */}
                    <div className="p-4 border border-dashed border-gray-300 rounded-lg space-y-4">
                      <h4 className="font-medium text-gray-900">Add New Activity</h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Activity Name</Label>
                          <Input
                            placeholder="e.g., Morning Yoga Session"
                            value={newActivity.name || ""}
                            onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                            className="border-refined"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Duration (minutes)</Label>
                          <Input
                            type="number"
                            min="15"
                            max="480"
                            value={newActivity.duration || 60}
                            onChange={(e) => setNewActivity(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                            className="border-refined"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe the activity, its benefits, and what participants will do..."
                          value={newActivity.description || ""}
                          onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                          className="border-refined"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Instructor</Label>
                          <Input
                            placeholder="Activity instructor (optional)"
                            value={newActivity.instructor || ""}
                            onChange={(e) => setNewActivity(prev => ({ ...prev, instructor: e.target.value }))}
                            className="border-refined"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Max Participants</Label>
                          <Input
                            type="number"
                            min="1"
                            max={formData.capacity}
                            value={newActivity.capacity || formData.capacity}
                            onChange={(e) => setNewActivity(prev => ({ ...prev, capacity: parseInt(e.target.value) || formData.capacity }))}
                            className="border-refined"
                          />
                        </div>
                      </div>

                      <Button onClick={addActivity} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Activity
                      </Button>
                    </div>

                    {/* Activities List */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Planned Activities ({formData.activities.length})</h4>
                      
                      {formData.activities.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No activities added yet. Start by adding your first activity above.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {formData.activities.map((activity) => (
                            <div key={activity.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium text-gray-900">{activity.name}</h5>
                                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeActivity(activity.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{activity.duration} min</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>Max {activity.capacity}</span>
                                </div>
                                {activity.instructor && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4" />
                                    <span>{activity.instructor}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule */}
              <TabsContent value="schedule">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      Retreat Schedule
                    </CardTitle>
                    <CardDescription>
                      Plan the daily schedule for your {formData.duration}-day retreat
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Daily Schedule</h4>
                        <p className="text-sm text-muted-foreground">
                          {formData.schedule.length > 0 ? `${formData.schedule.length} days planned` : 'No schedule created yet'}
                        </p>
                      </div>
                      
                      <Button onClick={generateSchedule} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Schedule
                      </Button>
                    </div>

                    {formData.schedule.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h4 className="font-medium text-gray-900 mb-2">No Schedule Yet</h4>
                        <p className="mb-4">Create activities first, then generate a schedule template.</p>
                        <Button onClick={generateSchedule} disabled={formData.activities.length === 0}>
                          <Plus className="w-4 h-4 mr-2" />
                          Generate Schedule Template
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {formData.schedule.map((day) => (
                          <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-4">Day {day.day}</h5>
                            
                            <div className="space-y-3">
                              {day.activities.map((activity, index) => (
                                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                  <div className="text-sm font-medium text-gray-900 w-16">
                                    {activity.time}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{activity.activityName}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {activity.duration} minutes
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Policies */}
              <TabsContent value="policies">
                <div className="space-y-6">
                  {/* Health & Safety */}
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                        Health & Safety Requirements
                    </CardTitle>
                    <CardDescription>
                        Specify health requirements and safety measures
                    </CardDescription>
                  </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Health Requirements</Label>
                        <div className="space-y-2">
                          {['Medical clearance required', 'No heart conditions', 'Basic fitness level', 'Swimming ability', 'No pregnancy restrictions', 'Dietary restrictions accommodated'].map((req) => (
                            <div key={req} className="flex items-center space-x-2">
                              <Checkbox
                                checked={formData.healthRequirements.includes(req)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFormData("healthRequirements", [...formData.healthRequirements, req]);
                                  } else {
                                    updateFormData("healthRequirements", formData.healthRequirements.filter(r => r !== req));
                                  }
                                }}
                              />
                              <Label className="text-sm">{req}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Certifications & Qualifications</Label>
                        <div className="space-y-2">
                          {['Yoga Alliance Certified', 'First Aid Certified', 'CPR Certified', 'Licensed Therapist', 'Nutrition Specialist', 'Adventure Sports Certified'].map((cert) => (
                            <div key={cert} className="flex items-center space-x-2">
                              <Checkbox
                                checked={formData.certifications.includes(cert)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFormData("certifications", [...formData.certifications, cert]);
                                  } else {
                                    updateFormData("certifications", formData.certifications.filter(c => c !== cert));
                                  }
                                }}
                              />
                              <Label className="text-sm">{cert}</Label>
                            </div>
                          ))}
                          </div>
                    </div>

                      <div className="space-y-2">
                        <Label>Languages Supported</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {['English', 'Arabic', 'French', 'Spanish', 'German', 'Italian', 'Russian', 'Hindi', 'Mandarin'].map((lang) => (
                            <div key={lang} className="flex items-center space-x-2">
                              <Checkbox
                                checked={formData.languages.includes(lang)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFormData("languages", [...formData.languages, lang]);
                                  } else {
                                    updateFormData("languages", formData.languages.filter(l => l !== lang));
                                  }
                                }}
                              />
                              <Label className="text-sm">{lang}</Label>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

              {/* Policies */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Policies & Terms
                      </CardTitle>
                      <CardDescription>
                        Define your cancellation and refund policies
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                      <Textarea
                          id="cancellationPolicy"
                        placeholder="Enter your cancellation policy details..."
                        value={formData.cancellationPolicy}
                        onChange={(e) => updateFormData("cancellationPolicy", e.target.value)}
                        className="border-refined min-h-[120px]"
                      />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="refundPolicy">Refund Policy</Label>
                        <Textarea
                          id="refundPolicy"
                          placeholder="Describe your refund policy..."
                          value={formData.refundPolicy}
                          onChange={(e) => updateFormData("refundPolicy", e.target.value)}
                          className="border-refined min-h-[100px]"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Special Instructions */}
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2 text-green-600" />
                        Special Instructions
                      </CardTitle>
                      <CardDescription>
                        Any special instructions or notes for participants
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Enter any special instructions, what to bring, preparation notes, etc..."
                        value={formData.specialInstructions}
                        onChange={(e) => updateFormData("specialInstructions", e.target.value)}
                        className="border-refined min-h-[120px]"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div 
            className="flex justify-between items-center pt-6 border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex space-x-3">
              <Link href="/bridge-retreats/retreats">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </Link>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => handleSave('draft')}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save as Draft
              </Button>
              <Button 
                className="btn-premium" 
                onClick={() => handleSave('active')}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Publish Retreat
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 
 
 
 