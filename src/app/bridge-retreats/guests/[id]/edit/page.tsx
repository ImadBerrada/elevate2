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
  Heart,
  AlertTriangle,
  Save,
  ArrowLeft,
  Plus,
  X,
  Camera,
  UserCheck,
  Shield,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchGuest, updateGuest, Guest } from '@/lib/api/guests';

interface GuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  preferences: {
    dietaryRestrictions: string[];
    roomType: string;
    bedType: string;
    smokingPreference: string;
    specialRequests: string[];
  };
  medicalConditions: string[];
  allergies: string[];
  medications: string[];
  loyaltyProgram: boolean;
  marketingConsent: boolean;
  notes: string;
  status: string;
}

const EditGuestPage = () => {
  const router = useRouter();
  const params = useParams();
  const guestId = params.id as string;
  
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<GuestFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    },
    preferences: {
      dietaryRestrictions: [],
      roomType: '',
      bedType: '',
      smokingPreference: '',
      specialRequests: [],
    },
    medicalConditions: [],
    allergies: [],
    medications: [],
    loyaltyProgram: false,
    marketingConsent: false,
    notes: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-free', 
    'Dairy-free', 'Nut-free', 'Low-sodium', 'Diabetic', 'Other'
  ];

  const roomTypes = [
    'Standard', 'Deluxe', 'Suite', 'Villa', 'Shared', 'Single'
  ];

  const bedTypes = [
    'Single', 'Double', 'Queen', 'King', 'Twin Beds'
  ];

  const relationships = [
    'Spouse', 'Partner', 'Parent', 'Child', 'Sibling', 
    'Friend', 'Colleague', 'Other'
  ];

  const statusOptions = [
    'ACTIVE', 'INACTIVE', 'VIP', 'BLACKLISTED'
  ];

  useEffect(() => {
    fetchGuestData();
  }, [guestId]);

  const fetchGuestData = async () => {
    try {
      setLoading(true);
      
      const response = await fetchGuest(guestId);
      const guestData = response.guest;
      
      setGuest(guestData);
      
              // Populate form with guest data
        setFormData({
          firstName: guestData.firstName || '',
          lastName: guestData.lastName || '',
          email: guestData.email || '',
          phone: guestData.phone || '',
          dateOfBirth: guestData.dateOfBirth ? guestData.dateOfBirth.split('T')[0] : '',
          nationality: guestData.nationality || '',
          passportNumber: guestData.passportNumber || '',
          gender: guestData.gender || '',
          address: {
            street: guestData.addressStreet || '',
            city: guestData.addressCity || '',
            state: guestData.addressState || '',
            country: guestData.addressCountry || '',
            postalCode: guestData.addressPostalCode || '',
          },
          emergencyContact: {
            name: guestData.emergencyContactName || '',
            relationship: guestData.emergencyContactRelation || '',
            phone: guestData.emergencyContactPhone || '',
            email: guestData.emergencyContactEmail || '',
          },
          preferences: {
            dietaryRestrictions: guestData.dietaryRestrictions || [],
            roomType: guestData.roomTypePreference || '',
            bedType: guestData.bedTypePreference || '',
            smokingPreference: guestData.smokingPreference || '',
            specialRequests: guestData.specialRequests || [],
          },
          medicalConditions: guestData.medicalConditions || [],
          allergies: guestData.allergies || [],
          medications: guestData.medications || [],
          loyaltyProgram: guestData.loyaltyProgramActive || false,
          marketingConsent: guestData.marketingConsent || false,
          notes: guestData.notes || '',
          status: guestData.status || 'ACTIVE',
        });
      setProfileImage(`https://api.dicebear.com/7.x/initials/svg?seed=${guestData.firstName} ${guestData.lastName}`);
    } catch (error) {
      console.error('Error fetching guest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any, nested?: string) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...(prev[nested as keyof GuestFormData] as any),
          [field]: value,
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayChange = (field: string, value: string, action: 'add' | 'remove') => {
    if (field === 'preferences') {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          dietaryRestrictions: action === 'add' 
            ? [...prev.preferences.dietaryRestrictions, value]
            : prev.preferences.dietaryRestrictions.filter(item => item !== value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: action === 'add' 
          ? [...(prev[field as keyof GuestFormData] as string[]), value]
          : (prev[field as keyof GuestFormData] as string[]).filter(item => item !== value)
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Emergency contact validation
    if (!formData.emergencyContact.name.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    }
    if (!formData.emergencyContact.phone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const errorFields = Object.keys(errors);
      if (errorFields.some(field => ['firstName', 'lastName', 'email', 'phone'].includes(field))) {
        setActiveTab('personal');
      } else if (errorFields.some(field => field.includes('emergencyContact'))) {
        setActiveTab('emergency');
      }
      return;
    }

    try {
      setSaving(true);
      await updateGuest(guestId, formData);
      
      // Show success message and redirect
      console.log('Guest updated successfully');
      router.push(`/bridge-retreats/guests/${guestId}`);
    } catch (error) {
      console.error('Error updating guest:', error);
      // Handle error (show toast, etc.)
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Guest: {guest.firstName} {guest.lastName}
            </h1>
            <p className="text-gray-600 mt-1">Update guest information and preferences</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(guest.status)}>
            {guest.status}
          </Badge>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Profile Image Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage || undefined} />
                <AvatarFallback className="text-lg">
                  {guest.firstName[0]}{guest.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
              <p className="text-sm text-gray-600">Update guest profile photo</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="medical">Medical Info</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Address Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('street', e.target.value, 'address')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('city', e.target.value, 'address')}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('state', e.target.value, 'address')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('country', e.target.value, 'address')}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value, 'address')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Contact Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Emergency Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Contact Name *</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleInputChange('name', e.target.value, 'emergencyContact')}
                    className={errors.emergencyContactName ? 'border-red-500' : ''}
                  />
                  {errors.emergencyContactName && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select 
                    value={formData.emergencyContact.relationship} 
                    onValueChange={(value) => handleInputChange('relationship', value, 'emergencyContact')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationships.map(rel => (
                        <SelectItem key={rel} value={rel.toLowerCase()}>{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyPhone">Phone Number *</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value, 'emergencyContact')}
                    className={errors.emergencyContactPhone ? 'border-red-500' : ''}
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="emergencyEmail">Email Address</Label>
                  <Input
                    id="emergencyEmail"
                    type="email"
                    value={formData.emergencyContact.email}
                    onChange={(e) => handleInputChange('email', e.target.value, 'emergencyContact')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Guest Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dietary Restrictions */}
              <div>
                <Label>Dietary Restrictions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {dietaryOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dietary-${option}`}
                        checked={formData.preferences.dietaryRestrictions.includes(option)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleArrayChange('preferences', option, 'add');
                          } else {
                            handleArrayChange('preferences', option, 'remove');
                          }
                        }}
                      />
                      <Label htmlFor={`dietary-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room and Bed Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Room Type</Label>
                  <Select 
                    value={formData.preferences.roomType} 
                    onValueChange={(value) => handleInputChange('roomType', value, 'preferences')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map(type => (
                        <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bed Type</Label>
                  <Select 
                    value={formData.preferences.bedType} 
                    onValueChange={(value) => handleInputChange('bedType', value, 'preferences')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bedTypes.map(type => (
                        <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Smoking Preference</Label>
                  <Select 
                    value={formData.preferences.smokingPreference} 
                    onValueChange={(value) => handleInputChange('smokingPreference', value, 'preferences')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non-smoking">Non-Smoking</SelectItem>
                      <SelectItem value="smoking">Smoking</SelectItem>
                      <SelectItem value="no-preference">No Preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <Label>Special Requests</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.preferences.specialRequests.map((request, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{request}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleArrayChange('preferences', request, 'remove')}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    placeholder="Add special request..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value && !formData.preferences.specialRequests.includes(value)) {
                          handleArrayChange('preferences', value, 'add');
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !formData.preferences.specialRequests.includes(value)) {
                        handleArrayChange('preferences', value, 'add');
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Information Tab */}
        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Medical Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Medical Conditions */}
              <div>
                <Label>Medical Conditions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.medicalConditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{condition}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleArrayChange('medicalConditions', condition, 'remove')}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    placeholder="Add medical condition..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value && !formData.medicalConditions.includes(value)) {
                          handleArrayChange('medicalConditions', value, 'add');
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !formData.medicalConditions.includes(value)) {
                        handleArrayChange('medicalConditions', value, 'add');
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Allergies */}
              <div>
                <Label>Allergies</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center space-x-1">
                      <span>{allergy}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleArrayChange('allergies', allergy, 'remove')}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    placeholder="Add allergy..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value && !formData.allergies.includes(value)) {
                          handleArrayChange('allergies', value, 'add');
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !formData.allergies.includes(value)) {
                        handleArrayChange('allergies', value, 'add');
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Medications */}
              <div>
                <Label>Current Medications</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.medications.map((medication, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <span>{medication}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleArrayChange('medications', medication, 'remove')}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    placeholder="Add medication..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value && !formData.medications.includes(value)) {
                          handleArrayChange('medications', value, 'add');
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !formData.medications.includes(value)) {
                        handleArrayChange('medications', value, 'add');
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="loyaltyProgram"
                    checked={formData.loyaltyProgram}
                    onCheckedChange={(checked) => handleInputChange('loyaltyProgram', checked)}
                  />
                  <Label htmlFor="loyaltyProgram">
                    Enrolled in loyalty program
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketingConsent"
                    checked={formData.marketingConsent}
                    onCheckedChange={(checked) => handleInputChange('marketingConsent', checked)}
                  />
                  <Label htmlFor="marketingConsent">
                    Consent to marketing communications
                  </Label>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information about the guest..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const tabs = ['personal', 'address', 'emergency', 'preferences', 'medical'];
            const currentIndex = tabs.indexOf(activeTab);
            if (currentIndex > 0) {
              setActiveTab(tabs[currentIndex - 1]);
            }
          }}
          disabled={activeTab === 'personal'}
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            const tabs = ['personal', 'address', 'emergency', 'preferences', 'medical'];
            const currentIndex = tabs.indexOf(activeTab);
            if (currentIndex < tabs.length - 1) {
              setActiveTab(tabs[currentIndex + 1]);
            } else {
              handleSubmit();
            }
          }}
        >
          {activeTab === 'medical' ? 'Save Changes' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default EditGuestPage; 