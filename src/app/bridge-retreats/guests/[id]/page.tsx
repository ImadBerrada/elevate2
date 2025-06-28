'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Edit,
  MessageSquare,
  Heart,
  AlertTriangle,
  Award,
  Clock,
  CheckCircle,
  ArrowLeft,
  Send,
  Download,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import { fetchGuest, Guest } from '@/lib/api/guests';

interface Booking {
  id: string;
  retreat: {
    title: string;
    startDate: string;
    endDate: string;
    location: string;
  };
  status: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  rating: number;
  review: string;
}

interface Communication {
  id: string;
  type: 'email' | 'sms' | 'call' | 'note';
  subject: string;
  message: string;
  createdAt: string;
  createdBy: string;
  status: 'sent' | 'delivered' | 'read' | 'pending';
}

const GuestProfilePage = () => {
  const router = useRouter();
  const params = useParams();
  const guestId = params.id as string;
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  
  const [guest, setGuest] = useState<Guest | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchGuestData();
  }, [guestId]);

  const fetchGuestData = async () => {
    try {
      setLoading(true);
      
      const response = await fetchGuest(guestId);
      const guestData = response.guest;

      const mockBookings: Booking[] = [
        {
          id: '1',
          retreat: {
            title: 'Mountain Wellness Retreat',
            startDate: '2024-06-15',
            endDate: '2024-06-20',
            location: 'Swiss Alps',
          },
          status: 'confirmed',
          roomNumber: 'A-201',
          checkInDate: '2024-06-15T15:00:00Z',
          checkOutDate: '2024-06-20T11:00:00Z',
          totalAmount: 2500,
          rating: 5,
          review: 'Amazing experience! The location was breathtaking.',
        },
        {
          id: '2',
          retreat: {
            title: 'Beach Yoga Retreat',
            startDate: '2024-03-10',
            endDate: '2024-03-15',
            location: 'Bali, Indonesia',
          },
          status: 'completed',
          roomNumber: 'B-105',
          checkInDate: '2024-03-10T15:00:00Z',
          checkOutDate: '2024-03-15T11:00:00Z',
          totalAmount: 1800,
          rating: 4,
          review: 'Great yoga sessions, but the food could be improved.',
        },
      ];

      const mockCommunications: Communication[] = [
        {
          id: '1',
          type: 'email',
          subject: 'Welcome to Mountain Wellness Retreat',
          message: 'Thank you for booking with us. We look forward to hosting you.',
          createdAt: '2024-06-10T10:00:00Z',
          createdBy: 'System',
          status: 'delivered',
        },
        {
          id: '2',
          type: 'sms',
          subject: 'Booking Confirmation',
          message: 'Your booking for Beach Yoga Retreat has been confirmed.',
          createdAt: '2024-03-05T14:30:00Z',
          createdBy: 'Reception',
          status: 'delivered',
        },
      ];

      setGuest(guestData);
      setBookings(mockBookings);
      setCommunications(mockCommunications);
    } catch (error) {
      console.error('Error fetching guest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newNote.trim()) return;

    const newCommunication: Communication = {
      id: Date.now().toString(),
      type: 'note',
      subject: 'Staff Note',
      message: newNote,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
      status: 'sent',
    };

    setCommunications(prev => [newCommunication, ...prev]);
    setNewNote('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'VIP':
        return 'bg-purple-100 text-purple-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'BLACKLISTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'note':
        return <Edit className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          "min-w-0"
        )}>
          <Header />
          
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          "min-w-0"
        )}>
          <Header />
          
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Guest Not Found</h2>
                <p className="text-gray-600 mb-4">The guest you're looking for doesn't exist.</p>
                <Button onClick={() => router.back()} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        "min-w-0"
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Guest Profile</h1>
                  <p className="text-gray-600 mt-1">Complete guest information and history</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/bridge-retreats/guests/${guest.id}/edit`)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/bridge-retreats/guests/${guest.id}/history`)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View History</span>
                </Button>
              </div>
            </div>

            {/* Guest Summary Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={guest.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${guest.firstName} ${guest.lastName}`} />
                    <AvatarFallback className="text-xl">
                      {guest.firstName[0]}{guest.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {guest.firstName} {guest.lastName}
                      </h2>
                      <Badge className={getStatusColor(guest.status)}>
                        {guest.status}
                      </Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {guest.loyaltyTier} Member
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">Email</span>
                        </div>
                        <p className="font-medium">{guest.email}</p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">Phone</span>
                        </div>
                        <p className="font-medium">{guest.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">Location</span>
                        </div>
                        <p className="font-medium">{guest.nationality || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{guest.totalStays || 0}</p>
                        <p className="text-sm text-gray-600">Total Stays</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{guest.loyaltyPoints}</p>
                        <p className="text-sm text-gray-600">Loyalty Points</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <p className="text-2xl font-bold text-gray-900">{guest.averageRating?.toFixed(1) || '0.0'}</p>
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        </div>
                        <p className="text-sm text-gray-600">Average Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {guest.lastStay ? new Date(guest.lastStay).toLocaleDateString() : 'Never'}
                        </p>
                        <p className="text-sm text-gray-600">Last Stay</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="communications">Communications</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>Basic Information</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600">Full Name</p>
                            <p className="font-medium">{guest.firstName} {guest.lastName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Date of Birth</p>
                            <p className="font-medium">
                              {guest.dateOfBirth ? new Date(guest.dateOfBirth).toLocaleDateString() : 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="font-medium capitalize">{guest.gender || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Nationality</p>
                            <p className="font-medium">{guest.nationality || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Member Since</p>
                            <p className="font-medium">{new Date(guest.memberSince).toLocaleDateString()}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <MapPin className="h-5 w-5" />
                            <span>Address</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600">Street Address</p>
                            <p className="font-medium">{guest.addressStreet || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">City</p>
                            <p className="font-medium">{guest.addressCity || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">State/Province</p>
                            <p className="font-medium">{guest.addressState || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Country</p>
                            <p className="font-medium">{guest.addressCountry || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Postal Code</p>
                            <p className="font-medium">{guest.addressPostalCode || 'Not provided'}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5" />
                          <span>Emergency Contact</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium">{guest.emergencyContactName || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{guest.emergencyContactPhone || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Relationship</p>
                          <p className="font-medium">{guest.emergencyContactRelation || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{guest.emergencyContactEmail || 'Not provided'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Personal Info Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Heart className="h-5 w-5" />
                            <span>Preferences</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600">Dietary Restrictions</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {guest.dietaryRestrictions && guest.dietaryRestrictions.length > 0 ? (
                                guest.dietaryRestrictions.map((restriction: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {restriction}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">None specified</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Room Type Preference</p>
                            <p className="font-medium">{guest.roomTypePreference || 'No preference'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Bed Type Preference</p>
                            <p className="font-medium">{guest.bedTypePreference || 'No preference'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Smoking Preference</p>
                            <p className="font-medium">{guest.smokingPreference || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Special Requests</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {guest.specialRequests && guest.specialRequests.length > 0 ? (
                                guest.specialRequests.map((request: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {request}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">None specified</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span>Medical Information</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600">Medical Conditions</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {guest.medicalConditions && guest.medicalConditions.length > 0 ? (
                                guest.medicalConditions.map((condition, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    {condition}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">None reported</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Allergies</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {guest.allergies && guest.allergies.length > 0 ? (
                                guest.allergies.map((allergy, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    {allergy}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">None reported</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Current Medications</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {guest.medications && guest.medications.length > 0 ? (
                                guest.medications.map((medication, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {medication}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">None reported</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {guest.notes && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Edit className="h-5 w-5" />
                            <span>Notes</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{guest.notes}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Bookings Tab */}
                  <TabsContent value="bookings" className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {booking.retreat.title}
                                </h3>
                                <Badge className={getBookingStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{booking.retreat.location}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {new Date(booking.retreat.startDate).toLocaleDateString()} - {new Date(booking.retreat.endDate).toLocaleDateString()}
                                  </span>
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">Room: {booking.roomNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                ${booking.totalAmount.toLocaleString()}
                              </p>
                              {booking.rating > 0 && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm text-gray-600">{booking.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {booking.review && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Guest Review:</h4>
                              <p className="text-sm text-gray-600 italic">"{booking.review}"</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {bookings.length === 0 && (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings</h3>
                        <p className="text-gray-600">This guest hasn't made any bookings yet.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Communications Tab */}
                  <TabsContent value="communications" className="space-y-6">
                    {/* Send New Message */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Send className="h-5 w-5" />
                          <span>Send Message</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Type your message or note here..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={3}
                          />
                          <Button onClick={handleSendMessage} disabled={!newNote.trim()}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Communication History */}
                    <div className="space-y-4">
                      {communications.map((comm) => (
                        <Card key={comm.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-gray-100 rounded-full">
                                {getCommunicationIcon(comm.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{comm.subject}</h4>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {comm.type}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {new Date(comm.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{comm.message}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>By: {comm.createdBy}</span>
                                  <span>Status: {comm.status}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {communications.length === 0 && (
                        <div className="text-center py-12">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Communications</h3>
                          <p className="text-gray-600">No communication history found for this guest.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GuestProfilePage; 