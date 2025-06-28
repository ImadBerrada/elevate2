'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Star,
  DollarSign,
  Clock,
  User,
  MessageSquare,
  Award,
  TrendingUp,
  Eye,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchGuest, Guest } from '@/lib/api/guests';

interface Booking {
  id: string;
  retreat: {
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    instructor: string;
  };
  status: 'completed' | 'confirmed' | 'cancelled';
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  paidAmount: number;
  rating?: number;
  review?: string;
  highlights?: string[];
  issues?: string[];
}

interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjustment';
  points: number;
  description: string;
  date: string;
  bookingId?: string;
}

const GuestHistoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const guestId = params.id as string;
  
  const [guest, setGuest] = useState<Guest | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    fetchGuestData();
  }, [guestId]);

  const fetchGuestData = async () => {
    try {
      setLoading(true);
      
      const response = await fetchGuest(guestId);
      const guestData = response.guest;
      
      setGuest(guestData);
      
      // Mock booking and loyalty data until we have proper API endpoints
      const mockBookings: Booking[] = [
        {
          id: '1',
          retreat: {
            title: 'Mountain Wellness Retreat',
            startDate: '2024-06-15',
            endDate: '2024-06-20',
            location: 'Swiss Alps',
            instructor: 'Dr. Sarah Mitchell',
          },
          status: 'completed',
          roomNumber: 'A-201',
          checkInDate: '2024-06-15T15:00:00Z',
          checkOutDate: '2024-06-20T11:00:00Z',
          totalAmount: 2500,
          paidAmount: 2500,
          rating: 5,
          review: 'Amazing experience! The location was breathtaking and the meditation sessions were transformative.',
          highlights: ['Beautiful scenery', 'Excellent instructor', 'Great food'],
          issues: [],
        },
        {
          id: '2',
          retreat: {
            title: 'Beach Yoga Retreat',
            startDate: '2024-03-10',
            endDate: '2024-03-15',
            location: 'Bali, Indonesia',
            instructor: 'Master Chen',
          },
          status: 'completed',
          roomNumber: 'B-105',
          checkInDate: '2024-03-10T15:00:00Z',
          checkOutDate: '2024-03-15T11:00:00Z',
          totalAmount: 1800,
          paidAmount: 1800,
          rating: 4,
          review: 'Great yoga sessions and beautiful beach location. Would love to come back!',
          highlights: ['Beach location', 'Yoga sessions'],
          issues: ['Food could be improved'],
        },
        {
          id: '3',
          retreat: {
            title: 'Digital Detox Retreat',
            startDate: '2024-01-20',
            endDate: '2024-01-25',
            location: 'Forest Lodge, Canada',
            instructor: 'Emma Thompson',
          },
          status: 'completed',
          roomNumber: 'C-302',
          checkInDate: '2024-01-20T15:00:00Z',
          checkOutDate: '2024-01-25T11:00:00Z',
          totalAmount: 2200,
          paidAmount: 2200,
          rating: 5,
          review: 'Perfect escape from technology. Felt completely refreshed and reconnected with nature.',
          highlights: ['No technology', 'Nature walks', 'Peaceful environment'],
          issues: [],
        },
      ];

      const mockLoyaltyTransactions: LoyaltyTransaction[] = [
        {
          id: '1',
          type: 'earned',
          points: 250,
          description: 'Mountain Wellness Retreat booking',
          date: '2024-06-20T11:00:00Z',
          bookingId: '1',
        },
        {
          id: '2',
          type: 'earned',
          points: 180,
          description: 'Beach Yoga Retreat booking',
          date: '2024-03-15T11:00:00Z',
          bookingId: '2',
        },
        {
          id: '3',
          type: 'earned',
          points: 220,
          description: 'Digital Detox Retreat booking',
          date: '2024-01-25T11:00:00Z',
          bookingId: '3',
        },
        {
          id: '4',
          type: 'redeemed',
          points: -100,
          description: 'Spa treatment discount',
          date: '2024-06-18T14:00:00Z',
        },
        {
          id: '5',
          type: 'earned',
          points: 50,
          description: 'Referral bonus',
          date: '2024-05-01T10:00:00Z',
        },
      ];

      setBookings(mockBookings);
      setLoyaltyTransactions(mockLoyaltyTransactions);
    } catch (error) {
      console.error('Error fetching guest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return 'bg-gray-900 text-white';
      case 'GOLD':
        return 'bg-yellow-500 text-white';
      case 'SILVER':
        return 'bg-gray-400 text-white';
      case 'BRONZE':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'text-green-600';
      case 'redeemed':
        return 'text-blue-600';
      case 'expired':
        return 'text-red-600';
      case 'adjustment':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const calculateTotalSpent = () => {
    return bookings.reduce((total, booking) => total + booking.paidAmount, 0);
  };

  const calculateAverageRating = () => {
    const ratingsOnly = bookings.filter(booking => booking.rating).map(booking => booking.rating!);
    if (ratingsOnly.length === 0) return 0;
    return ratingsOnly.reduce((sum, rating) => sum + rating, 0) / ratingsOnly.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!guest) {
    return (
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
    );
  }

  return (
    <div className="p-6 space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900">Guest History</h1>
            <p className="text-gray-600 mt-1">
              Complete stay history for {guest.firstName} {guest.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export History</span>
          </Button>
        </div>
      </div>

      {/* Guest Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={guest.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${guest.firstName} ${guest.lastName}`} />
              <AvatarFallback className="text-xl">
                {guest.firstName[0]}{guest.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {guest.firstName} {guest.lastName}
                </h2>
                <Badge className={getLoyaltyTierColor(guest.loyaltyTier)}>
                  {guest.loyaltyTier} Member
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{guest.email}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Total Stays</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${calculateTotalSpent().toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loyalty Points</p>
                  <p className="text-2xl font-bold text-gray-900">{guest.loyaltyPoints.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-gray-900">{calculateAverageRating().toFixed(1)}</p>
                    <div className="flex">
                      {renderStarRating(Math.round(calculateAverageRating()))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Booking History</span>
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Loyalty Points</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            {/* Booking History */}
            <TabsContent value="bookings" className="space-y-4">
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.retreat.title}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.retreat.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(booking.retreat.startDate).toLocaleDateString()} - {new Date(booking.retreat.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>Room {booking.roomNumber}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Instructor: {booking.retreat.instructor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${booking.totalAmount.toLocaleString()}
                      </p>
                      {booking.rating && (
                        <div className="flex items-center space-x-1 mt-1">
                          {renderStarRating(booking.rating)}
                          <span className="text-sm text-gray-600 ml-1">
                            ({booking.rating}/5)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {booking.review && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{booking.review}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(booking.highlights && booking.highlights.length > 0) || (booking.issues && booking.issues.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {booking.highlights && booking.highlights.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-green-700 mb-2">Highlights</h4>
                          <ul className="space-y-1">
                            {booking.highlights.map((highlight, index) => (
                              <li key={index} className="text-sm text-green-600 flex items-center space-x-1">
                                <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {booking.issues && booking.issues.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-700 mb-2">Issues</h4>
                          <ul className="space-y-1">
                            {booking.issues.map((issue, index) => (
                              <li key={index} className="text-sm text-red-600 flex items-center space-x-1">
                                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {bookings.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Booking History</h3>
                  <p className="text-gray-600">This guest hasn't made any bookings yet.</p>
                </div>
              )}
            </TabsContent>

            {/* Loyalty Points */}
            <TabsContent value="loyalty" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">Current Points</p>
                        <p className="text-xl font-bold text-gray-900">{guest.loyaltyPoints}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Points Earned</p>
                        <p className="text-xl font-bold text-gray-900">
                          {loyaltyTransactions
                            .filter(t => t.type === 'earned')
                            .reduce((sum, t) => sum + t.points, 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Points Redeemed</p>
                        <p className="text-xl font-bold text-gray-900">
                          {Math.abs(loyaltyTransactions
                            .filter(t => t.type === 'redeemed')
                            .reduce((sum, t) => sum + t.points, 0))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {loyaltyTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'earned' ? 'bg-green-500' :
                        transaction.type === 'redeemed' ? 'bg-blue-500' :
                        transaction.type === 'expired' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                    </div>
                  </div>
                ))}
              </div>

              {loyaltyTransactions.length === 0 && (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Loyalty Activity</h3>
                  <p className="text-gray-600">No loyalty point transactions found.</p>
                </div>
              )}
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(guest.memberSince).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Last Stay</p>
                        <p className="font-semibold text-gray-900">
                          {bookings.length > 0 
                            ? new Date(bookings[0].checkOutDate).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">Avg. Spend</p>
                        <p className="font-semibold text-gray-900">
                          ${bookings.length > 0 ? (calculateTotalSpent() / bookings.length).toFixed(0) : '0'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">Satisfaction</p>
                        <p className="font-semibold text-gray-900">
                          {calculateAverageRating().toFixed(1)}/5.0
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Preferred Retreat Types</h4>
                      <div className="space-y-2">
                        {Array.from(new Set(bookings.map(b => b.retreat.title))).map((title) => {
                          const count = bookings.filter(b => b.retreat.title === title).length;
                          const percentage = (count / bookings.length) * 100;
                          return (
                            <div key={title} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{title}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-2 bg-blue-500 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900 w-8">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestHistoryPage; 