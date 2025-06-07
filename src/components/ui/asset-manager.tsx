"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Car, Building, Laptop, Settings, Calculator, FileText, Calendar } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Textarea } from './textarea';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface AssetType {
  id: string;
  name: string;
  depreciationRate: number;
  description?: string;
  fields: Record<string, any>;
}

interface CompanyAsset {
  id: string;
  name: string;
  assetTypeId: string;
  assetTypeName: string;
  purchaseValue: number;
  currentValue: number;
  purchaseDate: string;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  location?: string;
  serialNumber?: string;
  description?: string;
  customFields: Record<string, any>;
  documents: string[];
}

interface AssetManagerProps {
  companyId: string;
  className?: string;
}

const defaultAssetTypes: AssetType[] = [
  {
    id: 'car',
    name: 'Car',
    depreciationRate: 15.0,
    description: 'Motor vehicles',
    fields: {
      make: { type: 'text', label: 'Make', required: true },
      model: { type: 'text', label: 'Model', required: true },
      year: { type: 'number', label: 'Year', required: true },
      licensePlate: { type: 'text', label: 'License Plate', required: true },
      licenseExpiry: { type: 'date', label: 'License Expiry', required: true },
      insuranceExpiry: { type: 'date', label: 'Insurance Expiry', required: true },
      color: { type: 'text', label: 'Color', required: false },
      mileage: { type: 'number', label: 'Mileage (km)', required: false }
    }
  },
  {
    id: 'computer',
    name: 'Computer Equipment',
    depreciationRate: 25.0,
    description: 'Computers, laptops, and IT equipment',
    fields: {
      brand: { type: 'text', label: 'Brand', required: true },
      model: { type: 'text', label: 'Model', required: true },
      processor: { type: 'text', label: 'Processor', required: false },
      ram: { type: 'text', label: 'RAM', required: false },
      storage: { type: 'text', label: 'Storage', required: false },
      warrantyExpiry: { type: 'date', label: 'Warranty Expiry', required: false }
    }
  },
  {
    id: 'furniture',
    name: 'Furniture',
    depreciationRate: 10.0,
    description: 'Office furniture and fixtures',
    fields: {
      type: { type: 'text', label: 'Furniture Type', required: true },
      material: { type: 'text', label: 'Material', required: false },
      dimensions: { type: 'text', label: 'Dimensions', required: false },
      color: { type: 'text', label: 'Color', required: false }
    }
  }
];

export function AssetManager({ companyId, className }: AssetManagerProps) {
  const [assets, setAssets] = useState<CompanyAsset[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>(defaultAssetTypes);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isAddingAssetType, setIsAddingAssetType] = useState(false);
  const [editingAsset, setEditingAsset] = useState<CompanyAsset | null>(null);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load assets and asset types when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load existing asset types first
        let typesData = [];
        try {
          typesData = await apiClient.getAssetTypes();
        } catch (error) {
          console.warn('Failed to load asset types:', error);
          typesData = [];
        }
        
        // Check if default asset types exist, if not create them
        const existingTypeNames = typesData.map((t: any) => t.name?.toLowerCase()).filter(Boolean);
        const defaultTypesToCreate = defaultAssetTypes.filter(
          defaultType => !existingTypeNames.includes(defaultType.name.toLowerCase())
        );
        
        // Create missing default asset types one by one
        let createdCount = 0;
        for (const defaultType of defaultTypesToCreate) {
          try {
            const { id, ...typeData } = defaultType; // Remove the hardcoded ID
            console.log('Creating asset type:', typeData);
            await apiClient.createAssetType(typeData);
            createdCount++;
            console.log('Successfully created asset type:', typeData.name);
          } catch (error: any) {
            console.warn('Failed to create default asset type:', defaultType.name, error);
            // Continue with other types even if one fails
          }
        }
        
        // Reload asset types after creating defaults (only if we created some)
        if (createdCount > 0) {
          try {
            typesData = await apiClient.getAssetTypes();
          } catch (error) {
            console.warn('Failed to reload asset types after creation:', error);
          }
        }
        
        setAssetTypes(typesData);

        // Load assets
        const assetsData = await apiClient.getCompanyAssets(companyId);
        
        // Ensure assets have assetTypeName by mapping from asset types
        const assetsWithTypeNames = assetsData.map((asset: any) => {
          const assetType = typesData.find((type: any) => type.id === asset.assetTypeId);
          return {
            ...asset,
            assetTypeName: assetType?.name || 'Unknown Type'
          };
        });
        
        setAssets(assetsWithTypeNames);
      } catch (error: any) {
        console.error('Error loading asset data:', error);
        if (error.message?.includes('404') || error.message?.includes('not found')) {
          setError('Company not found. Please make sure the company exists and you have access to it.');
        } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
          setError('You are not authorized to access this company\'s assets. Please log in again.');
        } else {
          setError('Failed to load asset data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (companyId && companyId !== 'temp') {
      loadData();
    } else {
      setLoading(false);
    }
  }, [companyId]);

  // Save asset to backend
  const saveAsset = async (assetData: Partial<CompanyAsset>) => {
    if (companyId === 'temp') {
      alert('Please create the company first before adding assets.');
      throw new Error('Company not created yet');
    }
    
    try {
      const savedAsset = await apiClient.createCompanyAsset(companyId, assetData);
      setAssets([...assets, savedAsset]);
      return savedAsset;
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Failed to save asset. Please try again.');
      throw error;
    }
  };

  // Update asset in backend
  const updateAsset = async (assetId: string, assetData: Partial<CompanyAsset>) => {
    if (companyId === 'temp') {
      alert('Please create the company first before updating assets.');
      throw new Error('Company not created yet');
    }
    
    try {
      const updatedAsset = await apiClient.updateCompanyAsset(companyId, assetId, assetData);
      setAssets(assets.map(a => a.id === assetId ? updatedAsset : a));
      return updatedAsset;
    } catch (error) {
      console.error('Error updating asset:', error);
      alert('Failed to update asset. Please try again.');
      throw error;
    }
  };

  // Delete asset from backend
  const deleteAsset = async (assetId: string) => {
    if (companyId === 'temp') {
      alert('Please create the company first before deleting assets.');
      return;
    }
    
    try {
      await apiClient.deleteCompanyAsset(companyId, assetId);
      setAssets(assets.filter(a => a.id !== assetId));
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset. Please try again.');
    }
  };

  // Save asset type to backend
  const saveAssetType = async (assetType: Omit<AssetType, 'id'>) => {
    try {
      const savedAssetType = await apiClient.createAssetType(assetType);
      setAssetTypes([...assetTypes, savedAssetType]);
      return savedAssetType;
    } catch (error) {
      console.error('Error saving asset type:', error);
      alert('Failed to save asset type. Please try again.');
      throw error;
    }
  };

  const calculateCurrentValue = (purchaseValue: number, purchaseDate: string, depreciationRate: number) => {
    const purchase = new Date(purchaseDate);
    const now = new Date();
    const yearsElapsed = (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const depreciation = purchaseValue * (depreciationRate / 100) * yearsElapsed;
    return Math.max(0, purchaseValue - depreciation);
  };

  const getAssetIcon = (assetTypeName: string) => {
    if (!assetTypeName) {
      return <FileText className="w-5 h-5" />;
    }
    
    switch (assetTypeName.toLowerCase()) {
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'computer equipment':
        return <Laptop className="w-5 h-5" />;
      case 'furniture':
        return <Building className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT':
        return 'bg-green-100 text-green-800';
      case 'GOOD':
        return 'bg-blue-100 text-blue-800';
      case 'FAIR':
        return 'bg-yellow-100 text-yellow-800';
      case 'POOR':
        return 'bg-orange-100 text-orange-800';
      case 'DAMAGED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const AssetTypeForm = ({ onSave, onCancel }: { onSave: (assetType: Omit<AssetType, 'id'>) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      depreciationRate: 10,
      description: '',
      fields: {} as Record<string, any>
    });
    const [customFields, setCustomFields] = useState<Array<{ name: string; type: string; label: string; required: boolean }>>([]);

    const addCustomField = () => {
      setCustomFields([...customFields, { name: '', type: 'text', label: '', required: false }]);
    };

    const updateCustomField = (index: number, field: Partial<{ name: string; type: string; label: string; required: boolean }>) => {
      const updated = [...customFields];
      updated[index] = { ...updated[index], ...field };
      setCustomFields(updated);
    };

    const removeCustomField = (index: number) => {
      setCustomFields(customFields.filter((_, i) => i !== index));
    };

    const handleSave = () => {
      const fields = customFields.reduce((acc, field) => {
        if (field.name && field.label) {
          acc[field.name] = {
            type: field.type,
            label: field.label,
            required: field.required
          };
        }
        return acc;
      }, {} as Record<string, any>);

      const assetType = {
        name: formData.name,
        depreciationRate: formData.depreciationRate,
        description: formData.description,
        fields
      };

      saveAssetType(assetType).then(() => {
        onSave(assetType);
      }).catch(() => {
        // Error already handled in saveAssetType
      });
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Asset Type Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Office Equipment"
            />
          </div>
          <div>
            <Label>Depreciation Rate (%)</Label>
            <Input
              type="number"
              value={formData.depreciationRate || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 10 : parseFloat(e.target.value);
                setFormData({ ...formData, depreciationRate: isNaN(value) ? 10 : value });
              }}
              placeholder="10"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this asset type"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Custom Fields</Label>
            <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>

          {customFields.map((field, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-3">
                <Input
                  placeholder="Field name"
                  value={field.name}
                  onChange={(e) => updateCustomField(index, { name: e.target.value })}
                />
              </div>
              <div className="col-span-3">
                <Input
                  placeholder="Display label"
                  value={field.label}
                  onChange={(e) => updateCustomField(index, { label: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Select value={field.type} onValueChange={(value) => updateCustomField(index, { type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateCustomField(index, { required: e.target.checked })}
                  />
                  <span className="text-sm">Required</span>
                </label>
              </div>
              <div className="col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeCustomField(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name}>
            Save Asset Type
          </Button>
        </div>
      </div>
    );
  };

  const AssetForm = ({ asset, onSave, onCancel }: { 
    asset?: CompanyAsset; 
    onSave: (asset: Partial<CompanyAsset>) => void; 
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState({
      name: asset?.name || '',
      assetTypeId: asset?.assetTypeId || '',
      purchaseValue: asset?.purchaseValue || 0,
      purchaseDate: asset?.purchaseDate || new Date().toISOString().split('T')[0],
      condition: asset?.condition || 'GOOD' as const,
      location: asset?.location || '',
      serialNumber: asset?.serialNumber || '',
      description: asset?.description || '',
      customFields: asset?.customFields || {}
    });

    const selectedType = assetTypes.find(t => t.id === formData.assetTypeId);
    const currentValue = selectedType ? calculateCurrentValue(
      formData.purchaseValue, 
      formData.purchaseDate, 
      selectedType.depreciationRate
    ) : 0;

    const handleSave = () => {
      const assetData = {
        ...formData,
        currentValue,
        assetTypeName: selectedType?.name || ''
      };

      if (asset) {
        // Update existing asset
        updateAsset(asset.id, assetData).then(() => {
          onSave(assetData);
        }).catch(() => {
          // Error already handled in updateAsset
        });
      } else {
        // Create new asset
        saveAsset(assetData).then(() => {
          onSave(assetData);
        }).catch(() => {
          // Error already handled in saveAsset
        });
      }
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Asset Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Asset name"
            />
          </div>
          <div>
            <Label>Asset Type</Label>
            <Select value={formData.assetTypeId} onValueChange={(value) => setFormData({ ...formData, assetTypeId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No asset types available. Create one first.
                  </SelectItem>
                ) : (
                  assetTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.depreciationRate}% depreciation)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Purchase Value</Label>
            <Input
              type="number"
              value={formData.purchaseValue || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setFormData({ ...formData, purchaseValue: isNaN(value) ? 0 : value });
              }}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <Label>Purchase Date</Label>
            <Input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Current Value</Label>
            <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
              <Calculator className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">AED {currentValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Condition</Label>
            <Select value={formData.condition} onValueChange={(value: any) => setFormData({ ...formData, condition: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXCELLENT">Excellent</SelectItem>
                <SelectItem value="GOOD">Good</SelectItem>
                <SelectItem value="FAIR">Fair</SelectItem>
                <SelectItem value="POOR">Poor</SelectItem>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Serial Number</Label>
            <Input
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="Serial number"
            />
          </div>
        </div>

        <div>
          <Label>Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Asset location"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Additional details"
          />
        </div>

        {/* Custom Fields */}
        {selectedType && Object.keys(selectedType.fields).length > 0 && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Asset-Specific Information</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(selectedType.fields).map(([fieldName, fieldConfig]: [string, any]) => (
                <div key={fieldName}>
                  <Label>
                    {fieldConfig.label}
                    {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    type={fieldConfig.type}
                    value={formData.customFields[fieldName] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      customFields: { ...formData.customFields, [fieldName]: e.target.value }
                    })}
                    required={fieldConfig.required}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!formData.name || !formData.assetTypeId || assetTypes.length === 0}
          >
            {asset ? 'Update' : 'Add'} Asset
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {companyId === 'temp' ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Asset Management</h3>
            <p className="text-muted-foreground mb-4">
              Asset management is only available for saved companies. Please save the company first, then you can manage its assets.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>How to manage assets:</strong><br />
                1. Save the company first<br />
                2. Go to the Companies page<br />
                3. Click the briefcase icon next to the company name
              </p>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assets...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Assets</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Asset Management</h2>
              <p className="text-muted-foreground">Manage company assets with automatic depreciation tracking</p>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isAddingAssetType} onOpenChange={setIsAddingAssetType}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Asset Types
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Manage Asset Types</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                    <AssetTypeForm
                      onSave={(assetType) => {
                        setIsAddingAssetType(false);
                      }}
                      onCancel={() => setIsAddingAssetType(false)}
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddingAsset} onOpenChange={setIsAddingAsset}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Add New Asset</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                    <AssetForm
                      onSave={(assetData) => {
                        setIsAddingAsset(false);
                      }}
                      onCancel={() => setIsAddingAsset(false)}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Asset Types Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assetTypes.map((type) => {
              const typeAssets = assets.filter(a => a.assetTypeId === type.id);
              const totalValue = typeAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
              
              return (
                <Card key={type.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getAssetIcon(type.name)}
                        <div>
                          <h3 className="font-medium">{type.name}</h3>
                          <p className="text-sm text-muted-foreground">{type.depreciationRate}% depreciation</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{typeAssets.length} assets</p>
                        <p className="font-medium">AED {totalValue.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Assets List */}
          <Card>
            <CardHeader>
              <CardTitle>Company Assets</CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No assets found</h3>
                  <p className="text-muted-foreground mb-4">Start by adding your first company asset</p>
                  <Button onClick={() => setIsAddingAsset(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Asset
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getAssetIcon(asset.assetTypeName)}
                          <div>
                            <h3 className="font-medium">{asset.name}</h3>
                            <p className="text-sm text-muted-foreground">{asset.assetTypeName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">AED {asset.currentValue.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              Purchase: AED {asset.purchaseValue.toFixed(2)}
                            </p>
                          </div>
                          <Badge className={getConditionColor(asset.condition)}>
                            {asset.condition}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAsset(asset)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAsset(asset.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Asset Details */}
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Serial:</span>
                          <p>{asset.serialNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p>{asset.location || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Purchase Date:</span>
                          <p>{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Age:</span>
                          <p>{Math.floor((Date.now() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years</p>
                        </div>
                      </div>

                      {/* Custom Fields */}
                      {Object.keys(asset.customFields).length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {Object.entries(asset.customFields).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, ' $1')}:
                                </span>
                                <p>{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Asset Dialog */}
          {editingAsset && (
            <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Edit Asset</DialogTitle>
                </DialogHeader>
                <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                  <AssetForm
                    asset={editingAsset}
                    onSave={(assetData) => {
                      setEditingAsset(null);
                    }}
                    onCancel={() => setEditingAsset(null)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
} 