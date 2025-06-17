"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  Minus,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Guest {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  dietaryRestrictions?: string;
  medicalConditions?: string;
}

interface BookingFormData {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  guests: Guest[];
  specialRequests?: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  retreat: {
    id: string;
    title: string;
    price: number;
    capacity: number;
  };
}

export default function EditBookingPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getRetreatBookingById(bookingId);
      
      // Transform the data to match our form structure
      const allGuests = [data.guest, ...(data.additionalGuests || [])];
      
      setFormData({
        id: data.id,
        checkInDate: data.checkInDate.split('T')[0],
        checkOutDate: data.checkOutDate.split('T')[0],
        guestCount: data.guestCount,
        guests: allGuests,
        specialRequests: data.specialRequests || '',
        totalAmount: data.totalAmount,
        status: data.status,
        paymentStatus: data.paymentStatus,
        retreat: data.retreat
      });
    } catch (err) {
      console.error('Failed to fetch booking details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestCountChange = (count: number) => {
    if (!formData) return;
    
    const newGuests = [...formData.guests];
    
    if (count > formData.guestCount) {
      // Add new guests
      for (let i = formData.guestCount; i < count; i++) {
        newGuests.push({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          emergencyContact: "",
          emergencyPhone: "",
          dietaryRestrictions: "",
          medicalConditions: ""
        });
      }
    } else {
      // Remove guests
      newGuests.splice(count);
    }

    setFormData(prev => prev ? {
      ...prev,
      guestCount: count,
      guests: newGuests,
      totalAmount: prev.retreat.price * count
    } : null);
  };

  const handleGuestChange = (index: number, field: keyof Guest, value: string) => {
    if (!formData) return;
    
    const newGuests = [...formData.guests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setFormData(prev => prev ? { ...prev, guests: newGuests } : null);
  };

  const handleDateChange = (field: 'checkInDate' | 'checkOutDate', value: string) => {
    if (!formData) return;
    
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const validateForm = () => {
    if (!formData) return false;

    if (!formData.checkInDate || !formData.checkOutDate) {
      setError('Please select check-in and check-out dates');
      return false;
    }

    if (new Date(formData.checkInDate) >= new Date(formData.checkOutDate)) {
      setError('Check-out date must be after check-in date');
      return false;
    }

    if (formData.guestCount < 1) {
      setError('At least one guest is required');
      return false;
    }

    // Validate all guests have required fields
    for (let i = 0; i < formData.guestCount; i++) {
      const guest = formData.guests[i];
      if (!guest.firstName || !guest.lastName || !guest.email) {
        setError(`Please fill in all required fields for Guest ${i + 1}`);
        return false;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guest.email)) {
        setError(`Please enter a valid email for Guest ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!formData || !validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestCount: formData.guestCount,
        guests: formData.guests.slice(0, formData.guestCount),
        specialRequests: formData.specialRequests,
        totalAmount: formData.totalAmount
      };

      await apiClient.updateRetreatBooking(formData.id, updateData);
      
      setSuccess('Booking updated successfully!');
      setTimeout(() => {
        router.push(`/bridge-retreats/bookings/${formData.id}`);
      }, 2000);

    } catch (err) {
      console.error('Failed to update booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Sidebar />
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isOpen && !isMobile ? "ml-64" : "ml-0"
        )}>
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Sidebar />
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isOpen && !isMobile ? "ml-64" : "ml-0"
        )}>
          <Header />
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Link href="/bridge-retreats/bookings">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Bookings
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isOpen && !isMobile ? "ml-64" : "ml-0"
      )}>
        <Header />
        
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between mb-8"
              {...fadeInUp}
            >
              <div className="flex items-center space-x-4">
                <Link href={`/bridge-retreats/bookings/${bookingId}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Booking Details
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>
                  <p className="text-gray-600 mt-1">Modify booking details and guest information</p>
                </div>
              </div>
            </motion.div>

            {/* Error/Success Messages */}
            {error && (
              <motion.div 
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-700">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-700">{success}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Booking Details */}
                <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Booking Details
                      </CardTitle>
                      <CardDescription>
                        Update check-in/out dates and guest count
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <Label htmlFor="checkInDate">Check-in Date</Label>
                          <Input
                            id="checkInDate"
                            type="date"
                            value={formData.checkInDate}
                            onChange={(e) => handleDateChange('checkInDate', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="checkOutDate">Check-out Date</Label>
                          <Input
                            id="checkOutDate"
                            type="date"
                            value={formData.checkOutDate}
                            onChange={(e) => handleDateChange('checkOutDate', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>Number of Guests</Label>
                          <div className="flex items-center space-x-4 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGuestCountChange(Math.max(1, formData.guestCount - 1))}
                              disabled={formData.guestCount <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-semibold w-8 text-center">
                              {formData.guestCount}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGuestCountChange(formData.guestCount + 1)}
                              disabled={formData.guestCount >= formData.retreat.capacity}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Guest Information */}
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Guest Information
                      </CardTitle>
                      <CardDescription>
                        Update guest details and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {formData.guests.slice(0, formData.guestCount).map((guest, index) => (
                          <div key={index} className="border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">
                              Guest {index + 1} {index === 0 && "(Primary)"}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`firstName-${index}`}>First Name *</Label>
                                <Input
                                  id={`firstName-${index}`}
                                  value={guest.firstName}
                                  onChange={(e) => handleGuestChange(index, 'firstName', e.target.value)}
                                  placeholder="Enter first name"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
                                <Input
                                  id={`lastName-${index}`}
                                  value={guest.lastName}
                                  onChange={(e) => handleGuestChange(index, 'lastName', e.target.value)}
                                  placeholder="Enter last name"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`email-${index}`}>Email *</Label>
                                <Input
                                  id={`email-${index}`}
                                  type="email"
                                  value={guest.email}
                                  onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                                  placeholder="Enter email address"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`phone-${index}`}>Phone</Label>
                                <Input
                                  id={`phone-${index}`}
                                  value={guest.phone || ''}
                                  onChange={(e) => handleGuestChange(index, 'phone', e.target.value)}
                                  placeholder="Enter phone number"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`dateOfBirth-${index}`}>Date of Birth</Label>
                                <Input
                                  id={`dateOfBirth-${index}`}
                                  type="date"
                                  value={guest.dateOfBirth || ''}
                                  onChange={(e) => handleGuestChange(index, 'dateOfBirth', e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`emergencyContact-${index}`}>Emergency Contact</Label>
                                <Input
                                  id={`emergencyContact-${index}`}
                                  value={guest.emergencyContact || ''}
                                  onChange={(e) => handleGuestChange(index, 'emergencyContact', e.target.value)}
                                  placeholder="Emergency contact name"
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <Label htmlFor={`emergencyPhone-${index}`}>Emergency Phone</Label>
                                <Input
                                  id={`emergencyPhone-${index}`}
                                  value={guest.emergencyPhone || ''}
                                  onChange={(e) => handleGuestChange(index, 'emergencyPhone', e.target.value)}
                                  placeholder="Emergency contact phone"
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <Label htmlFor={`dietaryRestrictions-${index}`}>Dietary Restrictions</Label>
                                <Textarea
                                  id={`dietaryRestrictions-${index}`}
                                  value={guest.dietaryRestrictions || ''}
                                  onChange={(e) => handleGuestChange(index, 'dietaryRestrictions', e.target.value)}
                                  placeholder="Any dietary restrictions or preferences"
                                  rows={2}
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <Label htmlFor={`medicalConditions-${index}`}>Medical Conditions</Label>
                                <Textarea
                                  id={`medicalConditions-${index}`}
                                  value={guest.medicalConditions || ''}
                                  onChange={(e) => handleGuestChange(index, 'medicalConditions', e.target.value)}
                                  placeholder="Any medical conditions we should be aware of"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Special Requests */}
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Special Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={formData.specialRequests || ''}
                        onChange={(e) => setFormData(prev => prev ? { ...prev, specialRequests: e.target.value } : null)}
                        placeholder="Any special requests or notes for this booking"
                        rows={4}
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Action Buttons */}
                <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                  <div className="flex justify-between">
                    <Link href={`/bridge-retreats/bookings/${bookingId}`}>
                      <Button variant="outline">
                        Cancel Changes
                      </Button>
                    </Link>
                    <Button 
                      onClick={handleSubmit}
                      disabled={saving}
                      className="px-8"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Retreat Summary */}
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Retreat Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">{formData.retreat.title}</h3>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Check-in:</span>
                            <span>{formatDate(formData.checkInDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Check-out:</span>
                            <span>{formatDate(formData.checkOutDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>
                              {Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Guests:</span>
                            <span>{formData.guestCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price per person:</span>
                            <span>{formatCurrency(formData.retreat.price)}</span>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total Amount:</span>
                            <span className="text-blue-600">{formatCurrency(formData.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Current Status */}
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Booking Status</p>
                          <Badge className="mt-1">
                            {formData.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Status</p>
                          <Badge className="mt-1">
                            {formData.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}