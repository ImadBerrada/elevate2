"use client";

import { useState, useEffect } from "react";
import { X, User, Phone, Mail, Car, CreditCard, MapPin, DollarSign, Loader2, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { ImageUpload } from "@/components/ui/image-upload";

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDriverCreated: () => void;
  companyId?: string; // Make optional since we'll now allow selection
}

export function AddDriverModal({ isOpen, onClose, onDriverCreated, companyId }: AddDriverModalProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [vehicleRegistrationFile, setVehicleRegistrationFile] = useState<File | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    department: "",
    startDate: "",
    companyId: companyId || "", // Initialize with passed companyId or empty
    
    // Additional employee fields
    role: "",
    employerId: "",
    actualSalary: "",
    location: "",
    manager: "",
    skills: "",
    employeeStatus: "ACTIVE",
    
    // Driver-specific fields
    licenseNumber: "",
    vehicleInfo: "",
    status: "ACTIVE",
    licenseDocument: "",
    vehicleRegistration: "",
    profilePicture: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    experience: "",
    salary: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const response = await fetch('/api/companies/list', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies || []);
        } else {
          console.error('Failed to fetch companies');
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    // Client-side validation (matching employee form validation)
    if (!formData.name.trim()) {
      setError('Driver name is required');
      setCreating(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setCreating(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      setCreating(false);
      return;
    }
    if (!formData.department.trim()) {
      setError('Department is required');
      setCreating(false);
      return;
    }
    if (!formData.startDate.trim()) {
      setError('Start date is required');
      setCreating(false);
      return;
    }
    if (!formData.role.trim()) {
      setError('Role is required');
      setCreating(false);
      return;
    }
    if (!formData.companyId.trim()) {
      setError('Company selection is required');
      setCreating(false);
      return;
    }

    try {
      // Handle file uploads if there are document files
      let licenseDocumentUrl = formData.licenseDocument;
      let vehicleRegistrationUrl = formData.vehicleRegistration;
      let profilePictureUrl = formData.profilePicture;
      
      if (licenseFile) {
        // In a real application, you would upload the file to a cloud storage service
        licenseDocumentUrl = URL.createObjectURL(licenseFile);
      }
      
      if (vehicleRegistrationFile) {
        // In a real application, you would upload the file to a cloud storage service
        vehicleRegistrationUrl = URL.createObjectURL(vehicleRegistrationFile);
      }
      
      if (profilePictureFile) {
        // In a real application, you would upload the file to a cloud storage service
        profilePictureUrl = URL.createObjectURL(profilePictureFile);
      }

      const response = await fetch('/api/marah/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email || undefined,
          skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
          licenseDocument: licenseDocumentUrl || undefined,
          vehicleRegistration: vehicleRegistrationUrl || undefined,
          profilePicture: profilePictureUrl || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          address: formData.address || undefined,
          emergencyContact: formData.emergencyContact || undefined,
          emergencyPhone: formData.emergencyPhone || undefined,
          experience: formData.experience || undefined,
          salary: formData.salary ? parseFloat(formData.salary) : undefined,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Driver created successfully:', responseData);
        
        // Show success message mentioning both driver and employee creation
        if (responseData.message) {
          // You could show a toast notification here if you have a toast system
          console.log('Success:', responseData.message);
        }
        
        onDriverCreated();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || 'Failed to create driver';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating driver:', error);
      setError('Failed to create driver');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      department: "",
      startDate: "",
      companyId: companyId || "", 
      
      // Additional employee fields
      role: "",
      employerId: "",
      actualSalary: "",
      location: "",
      manager: "",
      skills: "",
      employeeStatus: "ACTIVE",
      
      // Driver-specific fields
      licenseNumber: "",
      vehicleInfo: "",
      status: "ACTIVE",
      licenseDocument: "",
      vehicleRegistration: "",
      profilePicture: "",
      dateOfBirth: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      experience: "",
      salary: "",
    });
    setLicenseFile(null);
    setVehicleRegistrationFile(null);
    setProfilePictureFile(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>Add New Driver</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
            {/* Profile Picture */}
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Driver Profile Picture</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <ImageUpload
                    id="driver-profile-picture"
                    label="Profile Picture"
                    value={formData.profilePicture}
                    onChange={(value) => handleInputChange('profilePicture', value || "")}
                    placeholder="Upload driver profile picture"
                    size="lg"
                    shape="circle"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Company Selection */}
            {!companyId && (
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Company Assignment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyId" className="text-sm font-medium">Select Company *</Label>
                    <Select 
                      value={formData.companyId} 
                      onValueChange={(value) => handleInputChange('companyId', value)} 
                      required
                      disabled={loadingCompanies}
                    >
                      <SelectTrigger className="border-refined">
                        <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Select company to assign driver to"} />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{company.name}</span>
                              <span className="text-sm text-muted-foreground">({company.industry})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Information */}
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Driver's full name"
                      className="border-refined"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="border-refined"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="pl-10 border-refined"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="driver@example.com"
                        className="pl-10 border-refined"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="border-refined">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="BUSY">Busy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-sm font-medium">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="Years of driving experience"
                      className="border-refined"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)} required>
                      <SelectTrigger className="border-refined">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="HR">Human Resources</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Delivery">Delivery</SelectItem>
                        <SelectItem value="Logistics">Logistics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="border-refined"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
                    <textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Driver's full address"
                      className="w-full pl-10 pt-2 pb-2 pr-3 border border-input bg-background rounded-md text-sm resize-none border-refined"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Emergency Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      placeholder="Emergency contact person"
                      className="border-refined"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="text-sm font-medium">Emergency Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="pl-10 border-refined"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Employment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">Role/Function *</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)} required>
                      <SelectTrigger className="border-refined">
                        <SelectValue placeholder="Select employee role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRIVER">Driver</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                        <SelectItem value="TECHNICIAN">Technician</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="SALES">Sales</SelectItem>
                        <SelectItem value="SUPPORT">Support</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employerId" className="text-sm font-medium">Employer</Label>
                    <Select value={formData.employerId} onValueChange={(value) => handleInputChange('employerId', value)}>
                      <SelectTrigger className="border-refined">
                        <SelectValue placeholder="No specific employer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No specific employer</SelectItem>
                        <SelectItem value="employer1">Employer 1</SelectItem>
                        <SelectItem value="employer2">Employer 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary" className="text-sm font-medium">Official Salary (AED)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="salary"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.salary}
                        onChange={(e) => handleInputChange('salary', e.target.value)}
                        placeholder="AED 440,000"
                        className="pl-10 border-refined"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actualSalary" className="text-sm font-medium">Actual Salary (AED)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="actualSalary"
                        value={formData.actualSalary}
                        onChange={(e) => handleInputChange('actualSalary', e.target.value)}
                        placeholder="AED 477,000"
                        className="pl-10 border-refined"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="San Francisco, CA"
                        className="pl-10 border-refined"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager" className="text-sm font-medium">Manager Name</Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => handleInputChange('manager', e.target.value)}
                      placeholder="Manager name"
                      className="border-refined"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeStatus" className="text-sm font-medium">Employee Status</Label>
                    <Select value={formData.employeeStatus} onValueChange={(value) => handleInputChange('employeeStatus', value)}>
                      <SelectTrigger className="border-refined">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills" className="text-sm font-medium">Skills</Label>
                    <Input
                      id="skills"
                      value={formData.skills}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      placeholder="React, Node.js, TypeScript (comma separated)"
                      className="border-refined"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* License & Vehicle Information */}
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="w-4 h-4" />
                  <span>License & Vehicle Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-sm font-medium">License Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        placeholder="DL123456789"
                        className="pl-10 border-refined"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleInfo" className="text-sm font-medium">Vehicle Information</Label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="vehicleInfo"
                        value={formData.vehicleInfo}
                        onChange={(e) => handleInputChange('vehicleInfo', e.target.value)}
                        placeholder="Toyota Hiace - ABC123"
                        className="pl-10 border-refined"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="licenseDocument" className="text-sm font-medium">Driver's License</Label>
                  <FileUpload
                    onFileSelect={(file, url) => {
                      setLicenseFile(file);
                      if (url) {
                        handleInputChange('licenseDocument', url);
                      }
                    }}
                    currentFile={formData.licenseDocument}
                    placeholder="Upload driver's license (PDF, DOC, or Image)"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                    maxSize={10}
                  />
                </div>
                
                <div>
                  <Label htmlFor="vehicleRegistration" className="text-sm font-medium">Vehicle Registration</Label>
                  <FileUpload
                    onFileSelect={(file, url) => {
                      setVehicleRegistrationFile(file);
                      if (url) {
                        handleInputChange('vehicleRegistration', url);
                      }
                    }}
                    currentFile={formData.vehicleRegistration}
                    placeholder="Upload vehicle registration (PDF, DOC, or Image)"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                    maxSize={10}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t bg-background sticky bottom-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-premium"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Driver
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 