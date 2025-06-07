"use client";

import { useState } from "react";
import { X, Truck, MapPin, DollarSign, Clock, Calculator } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface AddDeliveryChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeliveryChargeCreated: () => void;
  companyId: string;
}

export function AddDeliveryChargeModal({ isOpen, onClose, onDeliveryChargeCreated, companyId }: AddDeliveryChargeModalProps) {
  const [creating, setCreating] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    zone: "",
    area: "",
    baseCharge: "",
    perKmCharge: "",
    minimumCharge: "",
    maximumCharge: "",
    estimatedTime: "",
    isActive: true,
    notes: "",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.zone || !formData.area || !formData.baseCharge || !formData.perKmCharge || !formData.minimumCharge || !formData.estimatedTime) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);

    try {
      const deliveryChargeData = {
        zone: formData.zone,
        area: formData.area,
        baseCharge: parseFloat(formData.baseCharge),
        perKmCharge: parseFloat(formData.perKmCharge),
        minimumCharge: parseFloat(formData.minimumCharge),
        maximumCharge: formData.maximumCharge ? parseFloat(formData.maximumCharge) : undefined,
        estimatedTime: parseInt(formData.estimatedTime),
        isActive: formData.isActive,
        notes: formData.notes || undefined,
        companyId,
      };

      const response = await fetch('/api/marah/delivery-charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(deliveryChargeData),
      });

      if (response.ok) {
        onDeliveryChargeCreated();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create delivery charge');
      }
    } catch (error) {
      console.error('Error creating delivery charge:', error);
      alert('Failed to create delivery charge');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      zone: "",
      area: "",
      baseCharge: "",
      perKmCharge: "",
      minimumCharge: "",
      maximumCharge: "",
      estimatedTime: "",
      isActive: true,
      notes: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-primary" />
            <span>Add New Delivery Zone</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
          {/* Zone Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Zone Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zone">Zone Name *</Label>
                  <Input
                    id="zone"
                    value={formData.zone}
                    onChange={(e) => handleInputChange('zone', e.target.value)}
                    placeholder="e.g., Dubai Marina"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area/District *</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    placeholder="e.g., JBR, Marina Walk"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Zone Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this delivery zone..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Pricing Structure</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseCharge">Base Charge (AED) *</Label>
                  <Input
                    id="baseCharge"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.baseCharge}
                    onChange={(e) => handleInputChange('baseCharge', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Fixed charge for this zone
                  </p>
                </div>
                <div>
                  <Label htmlFor="perKmCharge">Per KM Charge (AED) *</Label>
                  <Input
                    id="perKmCharge"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.perKmCharge}
                    onChange={(e) => handleInputChange('perKmCharge', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Additional charge per kilometer
                  </p>
                </div>
                <div>
                  <Label htmlFor="minimumCharge">Minimum Charge (AED) *</Label>
                  <Input
                    id="minimumCharge"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumCharge}
                    onChange={(e) => handleInputChange('minimumCharge', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum delivery charge
                  </p>
                </div>
                <div>
                  <Label htmlFor="maximumCharge">Maximum Charge (AED)</Label>
                  <Input
                    id="maximumCharge"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maximumCharge}
                    onChange={(e) => handleInputChange('maximumCharge', e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional maximum charge cap
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Delivery Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedTime">Estimated Delivery Time (minutes) *</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min="1"
                    value={formData.estimatedTime}
                    onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                    placeholder="30"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Average delivery time to this zone
                  </p>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked: boolean) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Zone is Active</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Calculator Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Pricing Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">How pricing works:</h4>
                <div className="space-y-1">
                  <div>• <strong>Base Charge:</strong> Fixed fee for deliveries to this zone</div>
                  <div>• <strong>Per KM Charge:</strong> Additional fee multiplied by distance</div>
                  <div>• <strong>Minimum Charge:</strong> Lowest possible delivery fee</div>
                  <div>• <strong>Maximum Charge:</strong> Optional cap on delivery fees</div>
                </div>
                <div className="mt-3 p-2 bg-white rounded border">
                  <strong>Formula:</strong> max(Base + (Distance × Per KM), Minimum) {formData.maximumCharge && '≤ Maximum'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t bg-background sticky bottom-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Zone'}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 