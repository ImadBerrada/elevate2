"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  Calendar,
  Users,
  DollarSign,
  Clock,
  MapPin,
  Star,
  Image as ImageIcon,
  FileText,
  Settings,
  Activity,
  Utensils,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  TreePine,
  Waves,
  Mountain,
  Sunrise
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
import { cn } from "@/lib/utils";
import Link from "next/link";

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

interface RetreatFormData {
  title: string;
  description: string;
  type: string;
  duration: number;
  capacity: number;
  price: number;
  location: string;
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

export default function CreateRetreat() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<RetreatFormData>({
    title: "",
    description: "",
    type: "",
    duration: 1,
    capacity: 10,
    price: 1000,
    location: "",
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
    specialInstructions: ""
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

  const updateFormData = (field: keyof RetreatFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSave = (status: 'draft' | 'active') => {
    console.log('Saving retreat as:', status, formData);
    // In production, this would save to the database
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

          {/* Form Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
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
                        <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                          <SelectTrigger className="border-refined">
                            <SelectValue placeholder="Select retreat type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wellness">Wellness & Health</SelectItem>
                            <SelectItem value="corporate">Corporate Training</SelectItem>
                            <SelectItem value="spiritual">Spiritual & Mindfulness</SelectItem>
                            <SelectItem value="adventure">Adventure & Outdoor</SelectItem>
                            <SelectItem value="educational">Educational & Learning</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          placeholder="e.g., Mountain Villa"
                          value={formData.location}
                          onChange={(e) => updateFormData("location", e.target.value)}
                          className="border-refined"
                        />
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details */}
              <TabsContent value="details">
                <div className="space-y-6">
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-green-600" />
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

              {/* Activities */}
              <TabsContent value="activities">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-purple-600" />
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
                          <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
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

              {/* Amenities */}
              <TabsContent value="amenities">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-600" />
                      Amenities & Features
                    </CardTitle>
                    <CardDescription>
                      Select the amenities and features available at your retreat
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {AMENITY_OPTIONS.map((amenity) => {
                        const Icon = amenity.icon;
                        const isSelected = formData.amenities.includes(amenity.id);
                        
                        return (
                          <div
                            key={amenity.id}
                            className={cn(
                              "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200",
                              isSelected 
                                ? "border-primary bg-primary/5 text-primary" 
                                : "border-gray-200 hover:border-gray-300"
                            )}
                            onClick={() => toggleAmenity(amenity.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={() => toggleAmenity(amenity.id)}
                            />
                            <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-gray-400")} />
                            <span className="font-medium">{amenity.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Selected Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.amenities.length === 0 ? (
                          <span className="text-blue-700 text-sm">No amenities selected</span>
                        ) : (
                          formData.amenities.map((amenityId) => {
                            const amenity = AMENITY_OPTIONS.find(a => a.id === amenityId);
                            return amenity ? (
                              <Badge key={amenityId} variant="secondary" className="bg-blue-100 text-blue-800">
                                {amenity.label}
                              </Badge>
                            ) : null;
                          })
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Policies */}
              <TabsContent value="policies">
                <div className="space-y-6">
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle>Cancellation Policy</CardTitle>
                      <CardDescription>
                        Define your cancellation and refund policy
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Enter your cancellation policy details..."
                        value={formData.cancellationPolicy}
                        onChange={(e) => updateFormData("cancellationPolicy", e.target.value)}
                        className="border-refined min-h-[120px]"
                      />
                    </CardContent>
                  </Card>

                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle>Special Instructions</CardTitle>
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
              <Button variant="outline" onClick={() => handleSave('draft')}>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button className="btn-premium" onClick={() => handleSave('active')}>
                <Save className="w-4 h-4 mr-2" />
                Publish Retreat
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 