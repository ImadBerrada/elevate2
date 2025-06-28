'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  CreditCard,
  FileText,
  Star,
  DollarSign,
  Receipt,
  MessageSquare,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchCheckOutGuests, processCheckOut, CheckOutGuest } from '@/lib/api/guests';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const GuestCheckOutPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<CheckOutGuest | null>(null);
  const [checkOutGuests, setCheckOutGuests] = useState<CheckOutGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkOutProgress, setCheckOutProgress] = useState(false);
  
  const [checkOutForm, setCheckOutForm] = useState({
    roomKeysReturned: false,
    finalBillReviewed: false,
    damageInspection: false,
    feedbackCollected: false,
    loyaltyPointsUpdated: false,
    receiptProvided: false,
    transportationArranged: false,
    additionalCharges: 0,
    damageCharges: 0,
    paymentProcessed: false,
    additionalNotes: '',
    actualCheckOutTime: new Date().toISOString().slice(0, 16),
  });

  const [feedback, setFeedback] = useState({
    overallRating: 0,
    serviceRating: 0,
    facilitiesRating: 0,
    foodRating: 0,
    wouldRecommend: false,
    comments: '',
  });

  useEffect(() => {
    loadCheckOutGuests();
  }, []);

  const loadCheckOutGuests = async () => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      const response = await fetchCheckOutGuests(today, searchTerm);
      setCheckOutGuests(response.guests);
    } catch (error) {
      console.error('Error fetching check-out guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = checkOutGuests.filter(guest =>
    `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.booking.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckOut = async () => {
    if (!selectedGuest) return;

    try {
      setCheckOutProgress(true);
      
      await processCheckOut(
        selectedGuest.bookingId,
        checkOutForm,
        feedback,
        'Reception Staff'
      );
      
      // Update guest status
      setCheckOutGuests(prev =>
        prev.map(guest =>
          guest.id === selectedGuest.id
            ? { ...guest, status: 'completed', actualCheckOutTime: checkOutForm.actualCheckOutTime }
            : guest
        )
      );

      // Reset form
      setSelectedGuest(null);
      setCheckOutForm({
        roomKeysReturned: false,
        finalBillReviewed: false,
        damageInspection: false,
        feedbackCollected: false,
        loyaltyPointsUpdated: false,
        receiptProvided: false,
        transportationArranged: false,
        additionalCharges: 0,
        damageCharges: 0,
        paymentProcessed: false,
        additionalNotes: '',
        actualCheckOutTime: new Date().toISOString().slice(0, 16),
      });

      setFeedback({
        overallRating: 0,
        serviceRating: 0,
        facilitiesRating: 0,
        foodRating: 0,
        wouldRecommend: false,
        comments: '',
      });

      console.log('Check-out completed successfully');
    } catch (error) {
      console.error('Error during check-out:', error);
    } finally {
      setCheckOutProgress(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in-progress':
        return <AlertTriangle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const renderStarRating = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
            onClick={() => onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Guest Check-Out</h1>
            <p className="text-gray-600 mt-1">Process guest departures and final billing</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by guest name, email, or room number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={loadCheckOutGuests} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogOut className="h-5 w-5" />
              <span>Today's Check-Outs ({filteredGuests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {filteredGuests.map((guest) => (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedGuest?.id === guest.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedGuest(guest)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={guest.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${guest.firstName} ${guest.lastName}`} />
                        <AvatarFallback>
                          {guest.firstName[0]}{guest.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {guest.firstName} {guest.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{guest.email}</p>
                        <p className="text-sm text-gray-500">Room {guest.booking.roomNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(guest.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(guest.status)}
                          <span className="capitalize">{guest.status}</span>
                        </div>
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        ${guest.booking.totalAmount}
                      </p>
                      {guest.booking.outstandingBalance > 0 && (
                        <p className="text-sm text-red-600">
                          Outstanding: ${guest.booking.outstandingBalance}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredGuests.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <LogOut className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No guests checking out today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Check-Out Process */}
        {selectedGuest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Check-Out: {selectedGuest.firstName} {selectedGuest.lastName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Guest Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Retreat</p>
                    <p className="text-gray-600">{selectedGuest.booking.retreat.title}</p>
                  </div>
                  <div>
                    <p className="font-medium">Room</p>
                    <p className="text-gray-600">{selectedGuest.booking.roomNumber}</p>
                  </div>
                  <div>
                    <p className="font-medium">Check-Out Time</p>
                    <p className="text-gray-600">
                      {new Date(selectedGuest.booking.checkOutTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Total Amount</p>
                    <p className="text-gray-600">${selectedGuest.booking.totalAmount}</p>
                  </div>
                </div>
              </div>

              {/* Check-Out Checklist */}
              <div>
                <h4 className="font-medium mb-3">Check-Out Checklist</h4>
                <div className="space-y-2">
                  {[
                    { key: 'roomKeysReturned', label: 'Room keys returned' },
                    { key: 'finalBillReviewed', label: 'Final bill reviewed' },
                    { key: 'damageInspection', label: 'Room damage inspection completed' },
                    { key: 'feedbackCollected', label: 'Guest feedback collected' },
                    { key: 'loyaltyPointsUpdated', label: 'Loyalty points updated' },
                    { key: 'receiptProvided', label: 'Receipt provided' },
                    { key: 'transportationArranged', label: 'Transportation arranged' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Checkbox
                        checked={checkOutForm[item.key as keyof typeof checkOutForm] as boolean}
                        onCheckedChange={(checked) =>
                          setCheckOutForm(prev => ({ ...prev, [item.key]: checked }))
                        }
                      />
                      <Label className="text-sm">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Charges */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="additionalCharges">Additional Charges ($)</Label>
                  <Input
                    id="additionalCharges"
                    type="number"
                    value={checkOutForm.additionalCharges}
                    onChange={(e) =>
                      setCheckOutForm(prev => ({ ...prev, additionalCharges: Number(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="damageCharges">Damage Charges ($)</Label>
                  <Input
                    id="damageCharges"
                    type="number"
                    value={checkOutForm.damageCharges}
                    onChange={(e) =>
                      setCheckOutForm(prev => ({ ...prev, damageCharges: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              {/* Payment */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={checkOutForm.paymentProcessed}
                  onCheckedChange={(checked) =>
                    setCheckOutForm(prev => ({ ...prev, paymentProcessed: checked as boolean }))
                  }
                />
                <Label>Final payment processed</Label>
              </div>

              {/* Guest Feedback */}
              <div>
                <h4 className="font-medium mb-3">Guest Feedback (Optional)</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Overall Rating</Label>
                    {renderStarRating(feedback.overallRating, (rating) =>
                      setFeedback(prev => ({ ...prev, overallRating: rating }))
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm">Service</Label>
                      {renderStarRating(feedback.serviceRating, (rating) =>
                        setFeedback(prev => ({ ...prev, serviceRating: rating }))
                      )}
                    </div>
                    <div>
                      <Label className="text-sm">Facilities</Label>
                      {renderStarRating(feedback.facilitiesRating, (rating) =>
                        setFeedback(prev => ({ ...prev, facilitiesRating: rating }))
                      )}
                    </div>
                    <div>
                      <Label className="text-sm">Food</Label>
                      {renderStarRating(feedback.foodRating, (rating) =>
                        setFeedback(prev => ({ ...prev, foodRating: rating }))
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={feedback.wouldRecommend}
                      onCheckedChange={(checked) =>
                        setFeedback(prev => ({ ...prev, wouldRecommend: checked as boolean }))
                      }
                    />
                    <Label>Would recommend to others</Label>
                  </div>
                  <div>
                    <Label htmlFor="comments">Comments</Label>
                    <Textarea
                      id="comments"
                      value={feedback.comments}
                      onChange={(e) =>
                        setFeedback(prev => ({ ...prev, comments: e.target.value }))
                      }
                      placeholder="Additional feedback..."
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={checkOutForm.additionalNotes}
                  onChange={(e) =>
                    setCheckOutForm(prev => ({ ...prev, additionalNotes: e.target.value }))
                  }
                  placeholder="Any additional notes about the check-out..."
                />
              </div>

              {/* Check-Out Time */}
              <div>
                <Label htmlFor="actualCheckOutTime">Actual Check-Out Time</Label>
                <Input
                  id="actualCheckOutTime"
                  type="datetime-local"
                  value={checkOutForm.actualCheckOutTime}
                  onChange={(e) =>
                    setCheckOutForm(prev => ({ ...prev, actualCheckOutTime: e.target.value }))
                  }
                />
              </div>

              {/* Final Amount */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Final Amount:</span>
                  <span className="text-lg font-bold">
                    ${selectedGuest.booking.totalAmount + checkOutForm.additionalCharges + checkOutForm.damageCharges}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleCheckOut}
                  disabled={checkOutProgress}
                  className="flex-1"
                >
                  {checkOutProgress ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {checkOutProgress ? 'Processing...' : 'Complete Check-Out'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedGuest(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuestCheckOutPage; 
 
 
 