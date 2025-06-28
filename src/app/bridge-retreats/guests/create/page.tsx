'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
import { createGuest, CreateGuestData } from '@/lib/api/guests';

interface GuestFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  gender: string;
  
  // Address Information
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  
  // Preferences
  preferences: {
    dietaryRestrictions: string[];
    roomType: string;
    bedType: string;
    smokingPreference: string;
    specialRequests: string[];
  };
  
  // Medical Information
  medicalConditions: string[];
  allergies: string[];
  medications: string[];
  
  // Additional Information
  loyaltyProgram: boolean;
  marketingConsent: boolean;
  notes: string;
}

const CreateGuestPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
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
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';

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
      // Find the tab with errors and switch to it
      const errorFields = Object.keys(errors);
      if (errorFields.some(field => ['firstName', 'lastName', 'email', 'phone'].includes(field))) {
        setActiveTab('personal');
      } else if (errorFields.some(field => field.includes('emergencyContact'))) {
        setActiveTab('emergency');
      }
      return;
    }

    try {
      setLoading(true);
      
      const guestData: CreateGuestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        passportNumber: formData.passportNumber,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        preferences: formData.preferences,
        medicalConditions: formData.medicalConditions,
        allergies: formData.allergies,
        medications: formData.medications,
        loyaltyProgram: formData.loyaltyProgram,
        marketingConsent: formData.marketingConsent,
        profileImage: profileImage || undefined,
        notes: formData.notes,
      };
      
      await createGuest(guestData);
      
      router.push('/bridge-retreats/guests');
    } catch (error: any) {
      console.error('Error creating guest:', error);
      // Handle specific errors
      if (error.message.includes('email already exists')) {
        setErrors({ email: 'A guest with this email already exists' });
        setActiveTab('personal');
      }
    } finally {
      setLoading(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Add New Guest</h1>
            <p className="text-gray-600 mt-1">Create a comprehensive guest profile</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/bridge-retreats/guests')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{loading ? 'Creating...' : 'Create Guest'}</span>
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
                  {formData.firstName[0]}{formData.lastName[0]}
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
              <p className="text-sm text-gray-600">Upload a profile photo for the guest</p>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={errors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                  )}
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
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className={errors.nationality ? 'border-red-500' : ''}
                  />
                  {errors.nationality && (
                    <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>
                  )}
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
                    Enroll in loyalty program
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
          {activeTab === 'medical' ? 'Create Guest' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default CreateGuestPage; 
 
 
 