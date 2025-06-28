"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  ArrowLeft,
  Edit,
  Calendar,
  Users,
  DollarSign,
  Clock,
  MapPin,
  Star,
  Activity,
  Settings,
  FileText,
  Download,
  Share2,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Archive,
  Pause,
  Eye,
  Phone,
  Mail,
  Globe,
  Image as ImageIcon,
  Utensils,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  TreePine,
  Waves,
  Mountain,
  Sunrise,
  Plus,
  X,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Booking {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  bookingDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  amount: number;
  specialRequests?: string;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  duration: number;
  instructor: string;
  capacity: number;
  equipment: string[];
}

interface Schedule {
  day: number;
  activities: {
    time: string;
    activityName: string;
    duration: number;
    instructor?: string;
  }[];
}

interface Retreat {
  id: string;
  title: string;
  description: string;
  type: 'wellness' | 'corporate' | 'spiritual' | 'adventure' | 'educational';
  status: 'active' | 'draft' | 'archived' | 'full';
  duration: number;
  capacity: number;
  currentBookings: number;
  price: number;
  startDate: string;
  endDate: string;
  location: string;
  instructor: string;
  rating: number;
  totalReviews: number;
  amenities: string[];
  requirements: string[];
  inclusions: string[];
  exclusions: string[];
  activities: Activity[];
  schedule: Schedule[];
  bookings: Booking[];
  images: string[];
  cancellationPolicy: string;
  specialInstructions: string;
  createdAt: string;
  updatedAt: string;
}

const AMENITY_ICONS: { [key: string]: any } = {
  wifi: Wifi,
  parking: Car,
  meals: Utensils,
  coffee: Coffee,
  gym: Dumbbell,
  spa: Star,
  nature: TreePine,
  water: Waves,
  mountain: Mountain,
  sunrise: Sunrise,
};

const AMENITY_LABELS: { [key: string]: string } = {
  wifi: 'WiFi',
  parking: 'Parking',
  meals: 'Meals Included',
  coffee: 'Coffee/Tea',
  gym: 'Fitness Center',
  spa: 'Spa Services',
  nature: 'Nature Access',
  water: 'Water Activities',
  mountain: 'Mountain Views',
  sunrise: 'Sunrise Sessions',
};

export default function RetreatDetails() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const retreatId = params.id as string;
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRetreatDetails();
  }, [retreatId]);

  const fetchRetreatDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first
      try {
        const data = await apiClient.getRetreatById(retreatId);
        setRetreat(data);
        setLoading(false);
        return;
      } catch (apiError) {
        console.log('API not available, using mock data');
      }
      
      // Fallback to mock data - in production, this would come from an API
      const mockRetreat: Retreat = {
      id: retreatId,
      title: "Mindfulness & Meditation Retreat",
      description: "A transformative 7-day journey into mindfulness and inner peace. This comprehensive retreat combines ancient meditation practices with modern wellness techniques to help you find balance, reduce stress, and cultivate lasting inner peace. Set in a serene mountain environment, you'll disconnect from daily distractions and reconnect with your true self.",
      type: "wellness",
      status: "active",
      duration: 7,
      capacity: 20,
      currentBookings: 18,
      price: 2500,
      startDate: "2025-02-15",
      endDate: "2025-02-22",
      location: "Mountain Villa, Hatta",
      instructor: "Sarah Chen",
      rating: 4.9,
      totalReviews: 127,
      amenities: ["wifi", "parking", "meals", "spa", "nature", "mountain"],
      requirements: [
        "Basic fitness level required",
        "Open mind and willingness to participate",
        "No prior meditation experience necessary"
      ],
      inclusions: [
        "All meals (vegetarian/vegan options)",
        "Accommodation in shared rooms",
        "Daily meditation sessions",
        "Yoga classes",
        "Spa treatments",
        "Nature walks",
        "Workshop materials"
      ],
      exclusions: [
        "Personal expenses",
        "Transportation to/from venue",
        "Private room upgrade",
        "Alcoholic beverages",
        "Personal insurance"
      ],
      activities: [
        {
          id: "1",
          name: "Morning Meditation",
          description: "Start each day with guided meditation to center your mind and set intentions",
          duration: 60,
          instructor: "Sarah Chen",
          capacity: 20,
          equipment: ["Meditation cushions", "Blankets"]
        },
        {
          id: "2",
          name: "Hatha Yoga",
          description: "Gentle yoga practice to prepare the body for meditation",
          duration: 90,
          instructor: "Maya Patel",
          capacity: 20,
          equipment: ["Yoga mats", "Blocks", "Straps"]
        },
        {
          id: "3",
          name: "Walking Meditation",
          description: "Mindful walking in nature to practice present-moment awareness",
          duration: 45,
          instructor: "Sarah Chen",
          capacity: 20,
          equipment: ["Comfortable walking shoes"]
        },
        {
          id: "4",
          name: "Mindful Eating Workshop",
          description: "Learn to eat with awareness and gratitude",
          duration: 120,
          instructor: "Dr. James Wilson",
          capacity: 20,
          equipment: ["Workshop materials"]
        }
      ],
      schedule: [
        {
          day: 1,
          activities: [
            { time: "07:00", activityName: "Morning Meditation", duration: 60, instructor: "Sarah Chen" },
            { time: "08:30", activityName: "Breakfast", duration: 60 },
            { time: "10:00", activityName: "Welcome Circle", duration: 90, instructor: "Sarah Chen" },
            { time: "12:00", activityName: "Lunch", duration: 90 },
            { time: "14:00", activityName: "Hatha Yoga", duration: 90, instructor: "Maya Patel" },
            { time: "16:00", activityName: "Tea Break", duration: 30 },
            { time: "16:30", activityName: "Walking Meditation", duration: 45, instructor: "Sarah Chen" },
            { time: "18:00", activityName: "Dinner", duration: 90 },
            { time: "20:00", activityName: "Evening Reflection", duration: 60, instructor: "Sarah Chen" }
          ]
        },
        {
          day: 2,
          activities: [
            { time: "07:00", activityName: "Morning Meditation", duration: 60, instructor: "Sarah Chen" },
            { time: "08:30", activityName: "Breakfast", duration: 60 },
            { time: "10:00", activityName: "Mindfulness Workshop", duration: 120, instructor: "Sarah Chen" },
            { time: "12:30", activityName: "Lunch", duration: 90 },
            { time: "14:30", activityName: "Spa Treatment", duration: 90 },
            { time: "16:30", activityName: "Nature Walk", duration: 60 },
            { time: "18:00", activityName: "Dinner", duration: 90 },
            { time: "20:00", activityName: "Group Sharing", duration: 60, instructor: "Sarah Chen" }
          ]
        }
      ],
      bookings: [
        {
          id: "1",
          guestName: "Emma Thompson",
          email: "emma.thompson@email.com",
          phone: "+971 50 123 4567",
          bookingDate: "2025-01-10",
          status: "confirmed",
          paymentStatus: "paid",
          amount: 2500,
          specialRequests: "Vegetarian meals, ground floor room"
        },
        {
          id: "2",
          guestName: "Michael Rodriguez",
          email: "m.rodriguez@email.com",
          phone: "+971 55 987 6543",
          bookingDate: "2025-01-12",
          status: "confirmed",
          paymentStatus: "paid",
          amount: 2500
        },
        {
          id: "3",
          guestName: "Aisha Al-Mansouri",
          email: "aisha.almansouri@email.com",
          phone: "+971 50 555 1234",
          bookingDate: "2025-01-15",
          status: "pending",
          paymentStatus: "pending",
          amount: 2500,
          specialRequests: "Halal meals required"
        }
      ],
      images: [
        "/retreats/mindfulness-1.jpg",
        "/retreats/mindfulness-2.jpg",
        "/retreats/mindfulness-3.jpg"
      ],
      cancellationPolicy: "Full refund if cancelled 30 days before start date. 50% refund if cancelled 14-29 days before. No refund if cancelled less than 14 days before start date.",
      specialInstructions: "Please bring comfortable clothing for yoga and meditation, a journal for reflection, and an open heart. All meditation equipment will be provided. The retreat follows a vegetarian diet to support mindful eating practices.",
      createdAt: "2024-12-01",
      updatedAt: "2025-01-15"
    };

      setTimeout(() => {
        setRetreat(mockRetreat);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to fetch retreat details:', err);
      setError('Failed to load retreat details. Please try again.');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': 
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT':
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ARCHIVED':
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'FULL':
      case 'full': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'active': return CheckCircle;
      case 'DRAFT':
      case 'draft': return AlertCircle;
      case 'ARCHIVED':
      case 'archived': return Archive;
      case 'FULL':
      case 'full': return Pause;
      default: return AlertCircle;
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!retreat) return;

    try {
      setDeleting(true);
      setError(null);

      console.log('=== RETREAT DELETION DEBUG ===');
      console.log('Deleting retreat:', retreat.title);
      console.log('Retreat ID:', retreat.id);

      await apiClient.deleteRetreat(retreat.id);

      console.log('Retreat deleted successfully');
      console.log('==============================');

      // Redirect to retreats list
      router.push('/bridge-retreats/retreats');

    } catch (err) {
      console.error('Failed to delete retreat:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete retreat');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-medium">Loading Retreat Details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!retreat) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Retreat Not Found</h2>
            <p className="text-muted-foreground mb-4">The retreat you're looking for doesn't exist.</p>
            <Link href="/bridge-retreats/retreats">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Retreats
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(retreat.status);
  const occupancyRate = (retreat.currentBookings / retreat.capacity) * 100;

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
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start space-x-4">
                <Link href="/bridge-retreats/retreats">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-prestigious text-gradient">
                      {retreat.title}
                    </h1>
                    <Badge className={cn("text-xs", getStatusColor(retreat.status))}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {retreat.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{retreat.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(retreat.startDate).toLocaleDateString()} - {new Date(retreat.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{retreat.duration} days</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{retreat.instructor}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Link href={`/bridge-retreats/retreats/${retreat.id}/edit`}>
                  <Button className="btn-premium">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Retreat
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Public Page
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/bridge-retreats/retreats/${retreat.id}/schedule`} className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Manage Schedule
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleDeleteClick}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Retreat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  Occupancy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gradient">
                      {retreat.currentBookings}/{retreat.capacity}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {occupancyRate.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={occupancyRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium border-refined">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  AED {(retreat.currentBookings * retreat.price).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {retreat.currentBookings} bookings × AED {retreat.price.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="card-premium border-refined">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-600" />
                  Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-yellow-600">{retreat.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < Math.floor(retreat.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {retreat.totalReviews} reviews
                </p>
              </CardContent>
            </Card>

            <Card className="card-premium border-refined">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-purple-600" />
                  Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {retreat.activities.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Planned activities
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="card-premium border-refined">
                      <CardHeader>
                        <CardTitle>Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {retreat.description}
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="card-premium border-refined">
                        <CardHeader>
                          <CardTitle className="text-lg">What's Included</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {retreat.inclusions.map((inclusion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{inclusion}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="card-premium border-refined">
                        <CardHeader>
                          <CardTitle className="text-lg">Not Included</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {retreat.exclusions.map((exclusion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{exclusion}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="card-premium border-refined">
                      <CardHeader>
                        <CardTitle>Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {retreat.requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="card-premium border-refined">
                      <CardHeader>
                        <CardTitle>Retreat Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Type</span>
                          <Badge variant="secondary" className="capitalize">
                            {retreat.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <span className="text-sm font-medium">{retreat.duration} days</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Price</span>
                          <span className="text-sm font-medium">AED {retreat.price.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Capacity</span>
                          <span className="text-sm font-medium">{retreat.capacity} guests</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Lead Instructor</span>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {retreat.instructor.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{retreat.instructor}</div>
                              <div className="text-xs text-muted-foreground">Certified Instructor</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-premium border-refined">
                      <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">+971 4 123 4567</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">retreats@bridgeretreats.com</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">www.bridgeretreats.com</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Retreat Images ({retreat.images.length})
                    </CardTitle>
                    <CardDescription>
                      View all images for this retreat
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {retreat.images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {retreat.images.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                            className="group relative"
                          >
                            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={image}
                                alt={`${retreat.title} - Image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            {index === 0 && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-blue-600 text-white text-xs">
                                  Main Image
                                </Badge>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                onClick={() => window.open(image, '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Full Size
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Available</h3>
                        <p className="text-muted-foreground mb-4">
                          No images have been uploaded for this retreat yet.
                        </p>
                        <Link href={`/bridge-retreats/retreats/${retreat.id}/edit`}>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Images
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Current Bookings ({retreat.bookings.length})</span>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Booking
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Manage all bookings for this retreat
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {retreat.bookings && retreat.bookings.length > 0 ? retreat.bookings.map((booking) => (
                        <div key={booking.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback>
                                    {booking.guestName ? 
                                      booking.guestName.split(' ').map(n => n[0]).join('') : 
                                      'G'
                                    }
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{booking.guestName || 'Guest'}</div>
                                  <div className="text-sm text-muted-foreground">{booking.email || 'No email'}</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                {booking.phone && (
                                  <div className="flex items-center space-x-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{booking.phone}</span>
                                  </div>
                                )}
                                {booking.bookingDate && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Booked {new Date(booking.bookingDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                              
                              {booking.specialRequests && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Special Requests: </span>
                                  <span>{booking.specialRequests}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right space-y-2">
                              <div className="text-lg font-semibold">
                                AED {booking.amount ? booking.amount.toLocaleString() : '0'}
                              </div>
                              <div className="flex space-x-2">
                                {booking.status && (
                                  <Badge className={getBookingStatusColor(booking.status)}>
                                    {booking.status}
                                  </Badge>
                                )}
                                {booking.paymentStatus && (
                                  <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                                    {booking.paymentStatus}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
                          <p className="text-muted-foreground">
                            This retreat doesn't have any bookings yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle>Retreat Activities ({retreat.activities.length})</CardTitle>
                    <CardDescription>
                      All activities planned for this retreat
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {retreat.activities && retreat.activities.length > 0 ? retreat.activities.map((activity) => (
                        <div key={activity.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{activity.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
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
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4" />
                              <span>{activity.instructor}</span>
                            </div>
                          </div>
                          
                          {activity.equipment.length > 0 && (
                            <div>
                              <span className="text-sm text-muted-foreground">Equipment: </span>
                              <span className="text-sm">{activity.equipment.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Planned</h3>
                          <p className="text-muted-foreground">
                            Activities for this retreat haven't been added yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Daily Schedule</span>
                      <Link href={`/bridge-retreats/retreats/${retreat.id}/schedule`}>
                        <Button size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Schedule
                        </Button>
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Complete {retreat.duration}-day schedule for this retreat
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {retreat.schedule && retreat.schedule.length > 0 ? (
                        retreat.schedule.map((day) => (
                          <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-4">Day {day.day}</h4>
                            
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
                                      {activity.instructor && ` • ${activity.instructor}`}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Available</h3>
                          <p className="text-muted-foreground">
                            The detailed schedule for this retreat hasn't been created yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Amenities Tab */}
              <TabsContent value="amenities">
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle>Available Amenities</CardTitle>
                    <CardDescription>
                      Features and amenities available at this retreat
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {retreat.amenities.map((amenityId) => {
                        const Icon = AMENITY_ICONS[amenityId];
                        const label = AMENITY_LABELS[amenityId];
                        
                        return Icon ? (
                          <div key={amenityId} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                            <Icon className="w-5 h-5 text-primary" />
                            <span className="font-medium">{label}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle>Policies</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Cancellation Policy</h4>
                        <p className="text-sm text-muted-foreground">{retreat.cancellationPolicy}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                        <p className="text-sm text-muted-foreground">{retreat.specialInstructions}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-premium border-refined">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Documents & Files</span>
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">Retreat Brochure.pdf</div>
                            <div className="text-xs text-muted-foreground">2.4 MB • Updated 2 days ago</div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <ImageIcon className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">Location Photos.zip</div>
                            <div className="text-xs text-muted-foreground">15.7 MB • Updated 1 week ago</div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">Waiver Form.pdf</div>
                            <div className="text-xs text-muted-foreground">156 KB • Updated 3 days ago</div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Retreat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{retreat?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {retreat && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{retreat.title}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Type: {retreat.type}</div>
                  <div>Instructor: {retreat.instructor}</div>
                  <div>Current Bookings: {retreat.currentBookings}</div>
                </div>
              </div>
              
              {retreat.currentBookings > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ Warning: This retreat has {retreat.currentBookings} active booking(s). 
                    Deleting it may affect existing customers.
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Archive className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Retreat
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
