'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  Calendar,
  MapPin,
  Key,
  Gift,
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  QrCode,
  Camera,
  Printer,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchCheckInGuests, processCheckIn, CheckInGuest } from '@/lib/api/guests';
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



const GuestCheckInPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<CheckInGuest | null>(null);
  const [checkInGuests, setCheckInGuests] = useState<CheckInGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInProgress, setCheckInProgress] = useState(false);
  
  const [checkInForm, setCheckInForm] = useState({
    roomKeysIssued: false,
    welcomePackageGiven: false,
    orientationCompleted: false,
    specialRequestsNoted: false,
    emergencyContactVerified: false,
    paymentConfirmed: false,
    documentsChecked: false,
    additionalNotes: '',
    actualCheckInTime: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    loadCheckInGuests();
  }, []);

  const loadCheckInGuests = async () => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      const response = await fetchCheckInGuests(today, searchTerm);
      setCheckInGuests(response.guests);
    } catch (error) {
      console.error('Error fetching check-in guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = checkInGuests.filter(guest =>
    `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.booking.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckIn = async () => {
    if (!selectedGuest) return;

    try {
      setCheckInProgress(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update guest status
      setCheckInGuests(prev =>
        prev.map(guest =>
          guest.id === selectedGuest.id
            ? { ...guest, status: 'completed', arrivalTime: checkInForm.actualCheckInTime }
            : guest
        )
      );

      // Reset form
      setSelectedGuest(null);
      setCheckInForm({
        roomKeysIssued: false,
        welcomePackageGiven: false,
        orientationCompleted: false,
        specialRequestsNoted: false,
        emergencyContactVerified: false,
        paymentConfirmed: false,
        documentsChecked: false,
        additionalNotes: '',
        actualCheckInTime: new Date().toISOString().slice(0, 16),
      });

      // Show success message (you might want to use a toast here)
      console.log('Check-in completed successfully');
    } catch (error) {
      console.error('Error during check-in:', error);
    } finally {
      setCheckInProgress(false);
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guest Check-In</h1>
          <p className="text-gray-600 mt-1">Process guest arrivals and welcome procedures</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <QrCode className="h-4 w-4" />
            <span>Scan QR</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Printer className="h-4 w-4" />
            <span>Print Keys</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by guest name, email, or room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guest List */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Check-Ins</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2 p-4">
              {filteredGuests.map((guest) => (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedGuest?.id === guest.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedGuest(guest)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${guest.firstName} ${guest.lastName}`} />
                        <AvatarFallback>
                          {guest.firstName[0]}{guest.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {guest.firstName} {guest.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{guest.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">Room {guest.booking.roomNumber}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            Check-in: {guest.booking.checkInTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(guest.status)}
                      <Badge className={getStatusColor(guest.status)}>
                        {guest.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {guest.arrivalTime && (
                    <div className="mt-2 text-xs text-green-600">
                      Arrived: {new Date(guest.arrivalTime).toLocaleTimeString()}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Check-In Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedGuest ? 'Check-In Process' : 'Select a Guest'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGuest ? (
              <div className="space-y-6">
                {/* Guest Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedGuest.firstName} ${selectedGuest.lastName}`} />
                      <AvatarFallback>
                        {selectedGuest.firstName[0]}{selectedGuest.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedGuest.firstName} {selectedGuest.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{selectedGuest.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-600">Room</p>
                      <p className="text-gray-900">{selectedGuest.booking.roomNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Retreat</p>
                      <p className="text-gray-900">{selectedGuest.booking.retreat.title}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Check-in Time</p>
                      <p className="text-gray-900">{selectedGuest.booking.checkInTime}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Duration</p>
                      <p className="text-gray-900">
                        {new Date(selectedGuest.booking.retreat.startDate).toLocaleDateString()} - {new Date(selectedGuest.booking.retreat.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedGuest.booking.specialRequests.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-gray-600 mb-1">Special Requests</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedGuest.booking.specialRequests.map((request, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {request}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedGuest.preferences.dietaryRestrictions.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-gray-600 mb-1">Dietary Restrictions</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedGuest.preferences.dietaryRestrictions.map((restriction, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Check-In Checklist */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Check-In Checklist</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="documents"
                        checked={checkInForm.documentsChecked}
                        onCheckedChange={(checked) =>
                          setCheckInForm(prev => ({ ...prev, documentsChecked: checked as boolean }))
                        }
                      />
                      <Label htmlFor="documents" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Verify ID & Documents</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="payment"
                        checked={checkInForm.paymentConfirmed}
                        onCheckedChange={(checked) =>
                          setCheckInForm(prev => ({ ...prev, paymentConfirmed: checked as boolean }))
                        }
                      />
                      <Label htmlFor="payment" className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Confirm Payment</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="emergency"
                        checked={checkInForm.emergencyContactVerified}
                        onCheckedChange={(checked) =>
                          setCheckInForm(prev => ({ ...prev, emergencyContactVerified: checked as boolean }))
                        }
                      />
                      <Label htmlFor="emergency" className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Verify Emergency Contact</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="keys"
                        checked={checkInForm.roomKeysIssued}
                        onCheckedChange={(checked) =>
                          setCheckInForm(prev => ({ ...prev, roomKeysIssued: checked as boolean }))
                        }
                      />
                      <Label htmlFor="keys" className="flex items-center space-x-2">
                        <Key className="h-4 w-4" />
                        <span>Issue Room Keys</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="welcome"
                        checked={checkInForm.welcomePackageGiven}
                        onCheckedChange={(checked) =>
                          setCheckInForm(prev => ({ ...prev, welcomePackageGiven: checked as boolean }))
                        }
                      />
                      <Label htmlFor="welcome" className="flex items-center space-x-2">
                        <Gift className="h-4 w-4" />
                        <span>Provide Welcome Package</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="orientation"
                        checked={checkInForm.orientationCompleted}
                        onCheckedChange={(checked) =>
                          setCheckInForm(prev => ({ ...prev, orientationCompleted: checked as boolean }))
                        }
                      />
                      <Label htmlFor="orientation" className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Complete Orientation</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="special"
                        checked={checkInForm.specialRequestsNoted}
                        onCheckedChange={(checked) =>
                          setCheckInForm(prev => ({ ...prev, specialRequestsNoted: checked as boolean }))
                        }
                      />
                      <Label htmlFor="special" className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>Note Special Requests</span>
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Actual Check-in Time */}
                <div>
                  <Label htmlFor="checkInTime">Actual Check-in Time</Label>
                  <Input
                    id="checkInTime"
                    type="datetime-local"
                    value={checkInForm.actualCheckInTime}
                    onChange={(e) =>
                      setCheckInForm(prev => ({ ...prev, actualCheckInTime: e.target.value }))
                    }
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about the check-in process..."
                    value={checkInForm.additionalNotes}
                    onChange={(e) =>
                      setCheckInForm(prev => ({ ...prev, additionalNotes: e.target.value }))
                    }
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4">
                  <Button
                    onClick={handleCheckIn}
                    disabled={checkInProgress || selectedGuest.status === 'completed'}
                    className="flex items-center space-x-2"
                  >
                    {checkInProgress ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>
                      {checkInProgress ? 'Processing...' : 'Complete Check-In'}
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setSelectedGuest(null)}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Welcome SMS</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a guest from the list to begin check-in</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestCheckInPage; 
 
 
 