"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Receipt, 
  DollarSign, 
  Tag, 
  Calendar, 
  FileText, 
  Upload, 
  Car,
  User,
  AlertCircle,
  CheckCircle,
  Fuel,
  Wrench,
  Shield,
  Building,
  Lightbulb,
  Package,
  Megaphone,
  Banknote
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileUpload } from "@/components/ui/file-upload";

interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleInfo?: string;
  status: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: () => void;
  companyId: string;
}

export function AddExpenseModal({ isOpen, onClose, onExpenseCreated, companyId }: AddExpenseModalProps) {
  const [creating, setCreating] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form states
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    receipt: "",
    notes: "",
    driverId: "",
    vehicleInfo: "",
    location: "",
    vendor: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const expenseCategories = [
    { 
      value: "FUEL", 
      label: "Fuel", 
      icon: Fuel, 
      color: "bg-red-100 text-red-800",
      description: "Vehicle fuel costs",
      driverRelated: true
    },
    { 
      value: "MAINTENANCE", 
      label: "Vehicle Maintenance", 
      icon: Wrench, 
      color: "bg-blue-100 text-blue-800",
      description: "Vehicle repairs and maintenance",
      driverRelated: true
    },
    { 
      value: "INSURANCE", 
      label: "Insurance", 
      icon: Shield, 
      color: "bg-purple-100 text-purple-800",
      description: "Vehicle and business insurance",
      driverRelated: true
    },
    { 
      value: "SALARIES", 
      label: "Staff Salaries", 
      icon: Banknote, 
      color: "bg-indigo-100 text-indigo-800",
      description: "Employee salaries and wages",
      driverRelated: false
    },
    { 
      value: "RENT", 
      label: "Office Rent", 
      icon: Building, 
      color: "bg-pink-100 text-pink-800",
      description: "Office and warehouse rent",
      driverRelated: false
    },
    { 
      value: "UTILITIES", 
      label: "Utilities", 
      icon: Lightbulb, 
      color: "bg-yellow-100 text-yellow-800",
      description: "Electricity, water, internet",
      driverRelated: false
    },
    { 
      value: "MARKETING", 
      label: "Marketing", 
      icon: Megaphone, 
      color: "bg-green-100 text-green-800",
      description: "Advertising and promotion",
      driverRelated: false
    },
    { 
      value: "SUPPLIES", 
      label: "Supplies", 
      icon: Package, 
      color: "bg-orange-100 text-orange-800",
      description: "Office and operational supplies",
      driverRelated: false
    },
    { 
      value: "OTHER", 
      label: "Other", 
      icon: Receipt, 
      color: "bg-gray-100 text-gray-800",
      description: "Miscellaneous expenses",
      driverRelated: false
    }
  ];

  // Fetch drivers when modal opens
  useEffect(() => {
    if (isOpen && companyId) {
      fetchDrivers();
    }
  }, [isOpen, companyId]);

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const response = await fetch(`/api/marah/drivers?companyId=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Please enter a description";
    }

    // Validate driver selection for driver-related expenses
    const selectedCategory = expenseCategories.find(cat => cat.value === formData.category);
    if (selectedCategory?.driverRelated && !formData.driverId) {
      newErrors.driverId = "Please select a driver for this expense type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setCreating(true);

    try {
      // Build description with additional context
      let enhancedDescription = formData.description;
      
      if (formData.driverId) {
        const selectedDriver = drivers.find(d => d.id === formData.driverId);
        if (selectedDriver) {
          enhancedDescription += ` - Driver: ${selectedDriver.name}`;
          if (selectedDriver.vehicleInfo) {
            enhancedDescription += ` (${selectedDriver.vehicleInfo})`;
          }
        }
      }

      if (formData.location) {
        enhancedDescription += ` - Location: ${formData.location}`;
      }

      if (formData.vendor) {
        enhancedDescription += ` - Vendor: ${formData.vendor}`;
      }

      // Build notes with additional info
      let enhancedNotes = formData.notes;
      if (formData.driverId) {
        const selectedDriver = drivers.find(d => d.id === formData.driverId);
        if (selectedDriver) {
          enhancedNotes = `Driver: ${selectedDriver.name} (${selectedDriver.phone})${enhancedNotes ? '\n' + enhancedNotes : ''}`;
        }
      }

      // Handle file upload if there's a receipt file
      let receiptUrl = formData.receipt;
      if (receiptFile) {
        // In a real application, you would upload the file to a cloud storage service
        // For now, we'll create a temporary URL
        receiptUrl = URL.createObjectURL(receiptFile);
      }

      const expenseData = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: enhancedDescription,
        date: new Date(formData.date).toISOString(),
        receipt: receiptUrl || undefined,
        notes: enhancedNotes || undefined,
        companyId,
      };

      const response = await fetch('/api/marah/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        onExpenseCreated();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Failed to create expense' });
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      setErrors({ submit: 'Failed to create expense' });
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      receipt: "",
      notes: "",
      driverId: "",
      vehicleInfo: "",
      location: "",
      vendor: "",
    });
    setReceiptFile(null);
    setErrors({});
  };

  const selectedCategory = expenseCategories.find(cat => cat.value === formData.category);
  const isDriverRelated = selectedCategory?.driverRelated || false;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-3">
            <motion.div
              className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Receipt className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-xl">Record New Expense</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
          {/* Error Alert */}
          {errors.submit && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Basic Expense Information */}
          <Card className="card-premium border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Expense Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (AED) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    className={errors.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="date">Expense Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the expense"
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <Card className="card-premium border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Category *</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {expenseCategories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = formData.category === category.value;
                  
                  return (
                    <motion.div
                      key={category.value}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('category', category.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{category.label}</h4>
                          {category.driverRelated && (
                            <Badge variant="outline" className="text-xs mt-1">
                              🚗 Driver Related
                            </Badge>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </motion.div>
                  );
                })}
              </div>
              {errors.category && (
                <p className="text-sm text-red-500 mt-2">{errors.category}</p>
              )}
            </CardContent>
          </Card>

          {/* Driver Selection (shown only for driver-related expenses) */}
          {isDriverRelated && (
            <Card className="card-premium border-0 ring-2 ring-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="w-4 h-4" />
                  <span>Driver Information *</span>
                  <Badge className="bg-blue-100 text-blue-800">Required for this category</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingDrivers ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading drivers...</p>
                  </div>
                ) : drivers.length === 0 ? (
                  <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-700">
                      No drivers found. Please add drivers first from the Drivers page.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {drivers.filter(driver => driver.status === 'ACTIVE').map((driver) => {
                      const isSelected = formData.driverId === driver.id;
                      
                      return (
                        <motion.div
                          key={driver.id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleInputChange('driverId', driver.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="gradient-primary text-white">
                                {driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{driver.name}</h4>
                              <p className="text-sm text-muted-foreground">{driver.phone}</p>
                              {driver.vehicleInfo && (
                                <p className="text-xs text-muted-foreground">{driver.vehicleInfo}</p>
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                {errors.driverId && (
                  <p className="text-sm text-red-500">{errors.driverId}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card className="card-premium border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor">Vendor/Supplier</Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => handleInputChange('vendor', e.target.value)}
                    placeholder="e.g., ADNOC, Emirates NBD"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Dubai Marina, Business Bay"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="receipt">Receipt Upload</Label>
                  <FileUpload
                    onFileSelect={(file, url) => {
                      setReceiptFile(file);
                      if (url) {
                        handleInputChange('receipt', url);
                      }
                    }}
                    currentFile={formData.receipt}
                    placeholder="Upload receipt (PDF, DOC, or Image)"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                    maxSize={10}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional details about this expense..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Upload Tips */}
          <Card className="card-premium border-0 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Upload className="w-4 h-4" />
                <span>Receipt Upload Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-700 space-y-2">
                <p className="font-medium">📋 Upload Best Practices:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Drag & drop files directly or click to browse</li>
                  <li>• Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP</li>
                  <li>• Maximum file size: 10MB per file</li>
                  <li>• Ensure receipts are clear and readable</li>
                  <li>• Include all relevant expense details in the image</li>
                  <li>• Keep original receipts for audit purposes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t bg-background sticky bottom-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={creating}
              className="btn-premium min-w-[120px]"
            >
              {creating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Recording...</span>
                </div>
              ) : (
                'Record Expense'
              )}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 