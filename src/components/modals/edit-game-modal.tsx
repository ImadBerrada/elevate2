"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Gamepad2, DollarSign, Save, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface Game {
  id: string;
  nameEn: string;
  nameAr: string;
  category: string;
  description?: string;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  isAvailable: boolean;
  isDiscountable: boolean;
  discountPercentage?: number;
  imageUrl?: string;
  dimensions?: string;
  capacity?: number;
  ageGroup?: string;
  setupTime?: number;
}

interface EditGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameUpdated: () => void;
  game: Game;
}

export function EditGameModal({ isOpen, onClose, onGameUpdated, game }: EditGameModalProps) {
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    category: "",
    description: "",
    pricePerDay: 0,
    pricePerWeek: 0,
    pricePerMonth: 0,
    isAvailable: true,
    isDiscountable: false,
    discountPercentage: 0,
    imageUrl: "",
    dimensions: "",
    capacity: 0,
    ageGroup: "",
    setupTime: 0,
  });

  useEffect(() => {
    if (game && isOpen) {
      setFormData({
        nameEn: game.nameEn || "",
        nameAr: game.nameAr || "",
        category: game.category || "",
        description: game.description || "",
        pricePerDay: game.pricePerDay || 0,
        pricePerWeek: game.pricePerWeek || 0,
        pricePerMonth: game.pricePerMonth || 0,
        isAvailable: game.isAvailable ?? true,
        isDiscountable: game.isDiscountable ?? false,
        discountPercentage: game.discountPercentage || 0,
        imageUrl: game.imageUrl || "",
        dimensions: game.dimensions || "",
        capacity: game.capacity || 0,
        ageGroup: game.ageGroup || "",
        setupTime: game.setupTime || 0,
      });
    }
  }, [game, isOpen]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
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

    setUpdating(true);

    try {
      const updateData = {
        nameEn: formData.nameEn,
        nameAr: formData.nameAr,
        category: formData.category,
        description: formData.description || undefined,
        pricePerDay: parseFloat(formData.pricePerDay.toString()),
        pricePerWeek: parseFloat(formData.pricePerWeek.toString()),
        pricePerMonth: parseFloat(formData.pricePerMonth.toString()),
        isAvailable: formData.isAvailable,
        isDiscountable: formData.isDiscountable,
        discountPercentage: formData.isDiscountable ? parseFloat(formData.discountPercentage.toString()) : 0,
        imageUrl: formData.imageUrl || undefined,
        dimensions: formData.dimensions || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity.toString()) : undefined,
        ageGroup: formData.ageGroup || undefined,
        setupTime: formData.setupTime ? parseInt(formData.setupTime.toString()) : undefined,
      };

      const response = await fetch(`/api/marah/games/${game.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        onGameUpdated();
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update game');
      }
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Failed to update game');
    } finally {
      setUpdating(false);
    }
  };

  const categories = [
    "Inflatable Slides",
    "Bounce Houses",
    "Water Games",
    "Obstacle Courses",
    "Sports Games",
    "Interactive Games",
    "Combo Units",
    "Themed Games",
  ];

  const ageGroups = [
    "0-3 years",
    "3-6 years",
    "6-12 years",
    "12+ years",
    "All Ages",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 text-primary" />
            <span>Edit Game</span>
          </DialogTitle>
          <DialogDescription>
            Update game information. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gamepad2 className="w-4 h-4" />
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
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
                    placeholder="Game description..."
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
                  <span>Pricing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pricePerDay">Price per Day (AED) *</Label>
                    <Input
                      id="pricePerDay"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.pricePerDay}
                      onChange={(e) => handleInputChange('pricePerDay', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricePerWeek">Price per Week (AED)</Label>
                    <Input
                      id="pricePerWeek"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.pricePerWeek}
                      onChange={(e) => handleInputChange('pricePerWeek', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricePerMonth">Price per Month (AED)</Label>
                    <Input
                      id="pricePerMonth"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.pricePerMonth}
                      onChange={(e) => handleInputChange('pricePerMonth', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDiscountable"
                      checked={formData.isDiscountable}
                      onCheckedChange={(checked) => handleInputChange('isDiscountable', checked)}
                    />
                    <Label htmlFor="isDiscountable">Discountable</Label>
                  </div>
                  
                  {formData.isDiscountable && (
                    <div className="flex-1 max-w-xs">
                      <Label htmlFor="discountPercentage">Discount Percentage</Label>
                      <Input
                        id="discountPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discountPercentage}
                        onChange={(e) => handleInputChange('discountPercentage', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Technical Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => handleInputChange('dimensions', e.target.value)}
                      placeholder="e.g., 10m x 5m x 3m"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity (people)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="0"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setupTime">Setup Time (minutes)</Label>
                    <Input
                      id="setupTime"
                      type="number"
                      min="0"
                      value={formData.setupTime}
                      onChange={(e) => handleInputChange('setupTime', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isAvailable"
                      checked={formData.isAvailable}
                      onCheckedChange={(checked) => handleInputChange('isAvailable', checked)}
                    />
                    <Label htmlFor="isAvailable">Available for Booking</Label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Game
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