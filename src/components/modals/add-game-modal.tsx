"use client";

import { useState } from "react";
import { X, Package, Image, DollarSign, Info, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { ImageUpload } from "@/components/ui/image-upload";

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameCreated: () => void;
  companyId: string;
}

export function AddGameModal({ isOpen, onClose, onGameCreated, companyId }: AddGameModalProps) {
  const [creating, setCreating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    description: "",
    category: "",
    pricePerDay: "",
    pricePerWeek: "",
    pricePerMonth: "",
    isDiscountable: true,
    isAvailable: true,
    discountPercentage: "0",
    dimensions: "",
    capacity: "",
    ageGroup: "",
    setupTime: "",
    imageUrl: "",
  });

  const gameCategories = [
    "Bounce Houses",
    "Water Slides",
    "Obstacle Courses",
    "Interactive Games",
    "Sports Games",
    "Combo Units",
    "Dry Slides",
    "Themed Inflatables",
    "Carnival Games",
    "Other"
  ];

  const ageGroups = [
    "0-3 years",
    "3-6 years",
    "6-12 years",
    "12+ years",
    "All Ages"
  ];

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nameEn || !formData.nameAr || !formData.category || !formData.pricePerDay) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);

    try {
      // Handle image upload if there's an image file
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        // In a real application, you would upload the file to a cloud storage service
        // For now, we'll create a temporary URL
        imageUrl = URL.createObjectURL(imageFile);
      }

      const gameData = {
        nameEn: formData.nameEn,
        nameAr: formData.nameAr,
        description: formData.description || undefined,
        category: formData.category,
        pricePerDay: parseFloat(formData.pricePerDay),
        pricePerWeek: formData.pricePerWeek ? parseFloat(formData.pricePerWeek) : undefined,
        pricePerMonth: formData.pricePerMonth ? parseFloat(formData.pricePerMonth) : undefined,
        isDiscountable: formData.isDiscountable,
        isAvailable: formData.isAvailable,
        discountPercentage: parseInt(formData.discountPercentage) || 0,
        dimensions: formData.dimensions || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        ageGroup: formData.ageGroup || undefined,
        setupTime: formData.setupTime ? parseInt(formData.setupTime) : undefined,
        imageUrl: imageUrl || undefined,
        images: imageUrl ? [imageUrl] : [],
        companyId,
      };

      const response = await fetch('/api/marah/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(gameData),
      });

      if (response.ok) {
        onGameCreated();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create game');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nameEn: "",
      nameAr: "",
      description: "",
      category: "",
      pricePerDay: "",
      pricePerWeek: "",
      pricePerMonth: "",
      isDiscountable: true,
      isAvailable: true,
      discountPercentage: "0",
      dimensions: "",
      capacity: "",
      ageGroup: "",
      setupTime: "",
      imageUrl: "",
    });
    setImageFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-primary" />
            <span>Add New Game</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-4 h-4" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nameEn">English Name *</Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) => handleInputChange('nameEn', e.target.value)}
                    placeholder="Game name in English"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nameAr">Arabic Name *</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => handleInputChange('nameAr', e.target.value)}
                    placeholder="اسم اللعبة بالعربية"
                    required
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {gameCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <Select value={formData.ageGroup} onValueChange={(value) => handleInputChange('ageGroup', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageGroups.map((age) => (
                        <SelectItem key={age} value={age}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Game description and features..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Pricing Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pricePerDay">Price Per Day (AED) *</Label>
                  <Input
                    id="pricePerDay"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerDay}
                    onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerWeek">Price Per Week (AED)</Label>
                  <Input
                    id="pricePerWeek"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerWeek}
                    onChange={(e) => handleInputChange('pricePerWeek', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerMonth">Price Per Month (AED)</Label>
                  <Input
                    id="pricePerMonth"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerMonth}
                    onChange={(e) => handleInputChange('pricePerMonth', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDiscountable"
                    checked={formData.isDiscountable}
                    onCheckedChange={(checked: boolean) => handleInputChange('isDiscountable', checked)}
                  />
                  <Label htmlFor="isDiscountable">Allow Discounts</Label>
                </div>
                <div>
                  <Label htmlFor="discountPercentage">Default Discount (%)</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Specifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder="L x W x H (meters)"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity (people)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="Maximum capacity"
                  />
                </div>
                <div>
                  <Label htmlFor="setupTime">Setup Time (minutes)</Label>
                  <Input
                    id="setupTime"
                    type="number"
                    min="1"
                    value={formData.setupTime}
                    onChange={(e) => handleInputChange('setupTime', e.target.value)}
                    placeholder="Setup duration"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked: boolean) => handleInputChange('isAvailable', checked)}
                />
                <Label htmlFor="isAvailable">Available for Rental</Label>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="w-4 h-4" />
                <span>Game Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <ImageUpload
                  id="game-image"
                  label="Game Image"
                  value={formData.imageUrl}
                  onChange={(value) => handleInputChange('imageUrl', value || "")}
                  placeholder="Upload game image"
                  size="lg"
                  shape="square"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t bg-background sticky bottom-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Game'}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 