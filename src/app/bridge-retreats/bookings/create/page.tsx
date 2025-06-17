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
  Mail,
  Phone,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  Minus,
  Search
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

interface Retreat {
  id: string;
  title: string;
  type: string;
  location: string;
  instructor: string;
  price: number;
  capacity: number;
  startDate: string;
  endDate: string;
  description: string;
  imageUrl?: string;
  availableSpots?: number;
}

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
  retreatId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  guests: Guest[];
  specialRequests?: string;
  paymentMethod: string;
  totalAmount: number;
}

export default function CreateBookingPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [selectedRetreat, setSelectedRetreat] = useState<Retreat | null>(null);
  const [loading, setLoading] = useState(false);
  const [retreatsLoading, setRetreatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState<BookingFormData>({
    retreatId: "",
    checkInDate: "",
    checkOutDate: "",
    guestCount: 1,
    guests: [{
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      emergencyContact: "",
      emergencyPhone: "",
      dietaryRestrictions: "",
      medicalConditions: ""
    }],
    specialRequests: "",
    paymentMethod: "CREDIT_CARD",
    totalAmount: 0
  });

  useEffect(() => {
    fetchRetreats();
  }, []);

  useEffect(() => {
    if (selectedRetreat) {
      setFormData(prev => ({
        ...prev,
        retreatId: selectedRetreat.id,
        checkInDate: selectedRetreat.startDate.split('T')[0],
        checkOutDate: selectedRetreat.endDate.split('T')[0],
        totalAmount: selectedRetreat.price * prev.guestCount
      }));
    }
  }, [selectedRetreat]);

  useEffect(() => {
    if (selectedRetreat) {
      setFormData(prev => ({
        ...prev,
        totalAmount: selectedRetreat.price * prev.guestCount
      }));
    }
  }, [formData.guestCount, selectedRetreat]);

  const fetchRetreats = async () => {
    try {
      setRetreatsLoading(true);
      const data = await apiClient.getRetreats({ 
        limit: 1000,
        status: 'ACTIVE',
        ...(searchTerm && { search: searchTerm })
      });
      setRetreats(data.retreats || []);
    } catch (err) {
      console.error('Failed to fetch retreats:', err);
      setError('Failed to load retreats');
    } finally {
      setRetreatsLoading(false);
    }
  };

  const handleGuestCountChange = (count: number) => {
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

    setFormData(prev => ({
      ...prev,
      guestCount: count,
      guests: newGuests
    }));
  };

  const handleGuestChange = (index: number, field: keyof Guest, value: string) => {
    const newGuests = [...formData.guests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setFormData(prev => ({ ...prev, guests: newGuests }));
  };

  const validateForm = () => {
    if (!formData.retreatId) {
      setError('Please select a retreat');
      return false;
    }

    if (!formData.checkInDate || !formData.checkOutDate) {
      setError('Please select check-in and check-out dates');
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
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const bookingData = {
        retreatId: formData.retreatId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestCount: formData.guestCount,
        guests: formData.guests.slice(0, formData.guestCount),
        specialRequests: formData.specialRequests,
        totalAmount: formData.totalAmount
      };

      const result = await apiClient.createRetreatBooking(bookingData);
      
      setSuccess('Booking created successfully!');
      setTimeout(() => {
        router.push(`/bridge-retreats/bookings/${result.id}`);
      }, 2000);

    } catch (err) {
      console.error('Failed to create booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const filteredRetreats = retreats.filter(retreat =>
    retreat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retreat.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retreat.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Link href="/bridge-retreats/bookings">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Bookings
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Create New Booking</h1>
                  <p className="text-gray-600 mt-1">Book a retreat for your guests</p>
                </div>
              </div>
            </motion.div>

            {/* Progress Steps */}
            <motion.div 
              className="mb-8"
              {...fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-center space-x-8">
                {[
                  { step: 1, title: "Select Retreat", icon: Search },
                  { step: 2, title: "Guest Details", icon: Users },
                  { step: 3, title: "Review & Book", icon: CheckCircle }
                ].map(({ step: stepNum, title, icon: Icon }) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                      step >= stepNum 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "border-gray-300 text-gray-400"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "ml-2 text-sm font-medium",
                      step >= stepNum ? "text-blue-600" : "text-gray-400"
                    )}>
                      {title}
                    </span>
                    {stepNum < 3 && (
                      <div className={cn(
                        "w-16 h-0.5 ml-4",
                        step > stepNum ? "bg-blue-600" : "bg-gray-300"
                      )} />
                    )}
                  </div>
                ))}
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

            {/* Step 1: Select Retreat */}
            {step === 1 && (
              <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Search className="h-5 w-5 mr-2" />
                      Select a Retreat
                    </CardTitle>
                    <CardDescription>
                      Choose from our available retreats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Search */}
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search retreats by name, location, or instructor..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Retreats Grid */}
                    {retreatsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRetreats.map((retreat) => (
                          <motion.div
                            key={retreat.id}
                            className={cn(
                              "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                              selectedRetreat?.id === retreat.id 
                                ? "border-blue-500 bg-blue-50" 
                                : "border-gray-200 hover:border-gray-300"
                            )}
                            onClick={() => setSelectedRetreat(retreat)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg mb-4 flex items-center justify-center">
                              <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                            
                            <h3 className="font-semibold text-lg mb-2">{retreat.title}</h3>
                            
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {retreat.location}
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                {retreat.instructor}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                {formatDate(retreat.startDate)} - {formatDate(retreat.endDate)}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                {retreat.availableSpots || retreat.capacity} spots available
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <Badge variant="secondary">{retreat.type}</Badge>
                              <span className="font-bold text-lg text-blue-600">
                                {formatCurrency(retreat.price)}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Continue Button */}
                    <div className="flex justify-end mt-8">
                      <Button 
                        onClick={() => setStep(2)}
                        disabled={!selectedRetreat}
                        className="px-8"
                      >
                        Continue to Guest Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Guest Details */}
            {step === 2 && (
              <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Guest Forms */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Guest Information
                        </CardTitle>
                        <CardDescription>
                          Enter details for all guests
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Guest Count */}
                        <div className="mb-6">
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
                              disabled={!!selectedRetreat && formData.guestCount >= (selectedRetreat.availableSpots || selectedRetreat.capacity)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Guest Forms */}
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

                        {/* Special Requests */}
                        <div className="mt-6">
                          <Label htmlFor="specialRequests">Special Requests</Label>
                          <Textarea
                            id="specialRequests"
                            value={formData.specialRequests || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                            placeholder="Any special requests or notes for this booking"
                            rows={3}
                          />
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between mt-8">
                          <Button variant="outline" onClick={() => setStep(1)}>
                            Back to Retreat Selection
                          </Button>
                          <Button onClick={() => setStep(3)}>
                            Review Booking
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Booking Summary */}
                  <div>
                    <Card className="sticky top-6">
                      <CardHeader>
                        <CardTitle>Booking Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedRetreat && (
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">{selectedRetreat.title}</h3>
                              <p className="text-sm text-gray-600">{selectedRetreat.location}</p>
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
                                <span>Guests:</span>
                                <span>{formData.guestCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Price per person:</span>
                                <span>{formatCurrency(selectedRetreat.price)}</span>
                              </div>
                            </div>
                            
                            <div className="border-t pt-4">
                              <div className="flex justify-between font-semibold text-lg">
                                <span>Total:</span>
                                <span>{formatCurrency(formData.totalAmount)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review & Book */}
            {step === 3 && (
              <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Review & Confirm Booking
                        </CardTitle>
                        <CardDescription>
                          Please review all details before confirming
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Retreat Details */}
                        {selectedRetreat && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Retreat Details</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-semibold">{selectedRetreat.title}</h4>
                              <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                                <div>Location: {selectedRetreat.location}</div>
                                <div>Instructor: {selectedRetreat.instructor}</div>
                                <div>Check-in: {formatDate(formData.checkInDate)}</div>
                                <div>Check-out: {formatDate(formData.checkOutDate)}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Guest Details */}
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-3">Guest Details</h3>
                          <div className="space-y-3">
                            {formData.guests.slice(0, formData.guestCount).map((guest, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold">
                                  {guest.firstName} {guest.lastName} {index === 0 && "(Primary)"}
                                </h4>
                                <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                                  <div>Email: {guest.email}</div>
                                  {guest.phone && <div>Phone: {guest.phone}</div>}
                                  {guest.emergencyContact && <div>Emergency: {guest.emergencyContact}</div>}
                                  {guest.dietaryRestrictions && (
                                    <div className="col-span-2">Dietary: {guest.dietaryRestrictions}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Special Requests */}
                        {formData.specialRequests && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Special Requests</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-600">{formData.specialRequests}</p>
                            </div>
                          </div>
                        )}

                        {/* Payment Method */}
                        <div className="mb-6">
                          <Label htmlFor="paymentMethod">Payment Method</Label>
                          <Select 
                            value={formData.paymentMethod} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                              <SelectItem value="CASH">Cash</SelectItem>
                              <SelectItem value="CHEQUE">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                          <Button variant="outline" onClick={() => setStep(2)}>
                            Back to Guest Details
                          </Button>
                          <Button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating Booking...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Confirm Booking
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Final Summary */}
                  <div>
                    <Card className="sticky top-6">
                      <CardHeader>
                        <CardTitle>Final Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedRetreat && (
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">{selectedRetreat.title}</h3>
                              <p className="text-sm text-gray-600">{selectedRetreat.location}</p>
                            </div>
                            
                            <div className="space-y-2 text-sm">
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
                                <span>{formatCurrency(selectedRetreat.price)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Payment method:</span>
                                <span>{formData.paymentMethod.replace('_', ' ')}</span>
                              </div>
                            </div>
                            
                            <div className="border-t pt-4">
                              <div className="flex justify-between font-semibold text-xl">
                                <span>Total Amount:</span>
                                <span className="text-blue-600">{formatCurrency(formData.totalAmount)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}