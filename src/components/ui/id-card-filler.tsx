'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Settings, Globe } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Switch } from './switch';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  firstNameArabic?: string;
  lastNameArabic?: string;
  position: string;
  avatar?: string;
  companyId: string;
  companyName: string;
}

interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface TextPosition {
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
}

interface CardPositions {
  name: TextPosition;
  position: TextPosition;
  id: TextPosition;
  company: TextPosition;
  photo: { x: number; y: number; size: number };
}

interface IdCardFillerProps {
  employee: Employee;
  company: Company;
  onClose: () => void;
}

export function IdCardFiller({ employee, company, onClose }: IdCardFillerProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([]);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null);

  // Using the exact positions from the user's settings
  const [positions, setPositions] = useState<CardPositions>({
    name: { x: 50, y: 46, fontSize: 15, color: '#000000', fontWeight: 'bold' },
    position: { x: 50, y: 58, fontSize: 15, color: '#000000', fontWeight: 'normal' },
    id: { x: 50, y: 71, fontSize: 17, color: '#0066cc', fontWeight: 'bold' },
    company: { x: 50, y: 85, fontSize: 18, color: '#006600', fontWeight: 'normal' },
    photo: { x: 50, y: 26, size: 30 }
  });

  // Template-specific position presets using the user's preferred settings
  const templatePresets: { [key: string]: Partial<CardPositions> } = {
    'albarq': {
      name: { x: 50, y: 46, fontSize: 15, color: '#000000', fontWeight: 'bold' },
      position: { x: 50, y: 58, fontSize: 15, color: '#000000', fontWeight: 'normal' },
      id: { x: 50, y: 71, fontSize: 17, color: '#0066cc', fontWeight: 'bold' },
      company: { x: 50, y: 85, fontSize: 18, color: '#006600', fontWeight: 'normal' },
      photo: { x: 50, y: 26, size: 30 }
    },
    'marah': {
      name: { x: 50, y: 46, fontSize: 15, color: '#000000', fontWeight: 'bold' },
      position: { x: 50, y: 58, fontSize: 15, color: '#000000', fontWeight: 'normal' },
      id: { x: 50, y: 71, fontSize: 17, color: '#0066cc', fontWeight: 'bold' },
      company: { x: 50, y: 85, fontSize: 18, color: '#006600', fontWeight: 'normal' },
      photo: { x: 50, y: 26, size: 30 }
    },
    '7elements': {
      name: { x: 50, y: 46, fontSize: 15, color: '#000000', fontWeight: 'bold' },
      position: { x: 50, y: 58, fontSize: 15, color: '#000000', fontWeight: 'normal' },
      id: { x: 50, y: 71, fontSize: 17, color: '#0066cc', fontWeight: 'bold' },
      company: { x: 50, y: 85, fontSize: 18, color: '#006600', fontWeight: 'normal' },
      photo: { x: 50, y: 26, size: 30 }
    },
    'lepadel': {
      name: { x: 50, y: 46, fontSize: 15, color: '#000000', fontWeight: 'bold' },
      position: { x: 50, y: 58, fontSize: 15, color: '#000000', fontWeight: 'normal' },
      id: { x: 50, y: 71, fontSize: 17, color: '#0066cc', fontWeight: 'bold' },
      company: { x: 50, y: 85, fontSize: 18, color: '#006600', fontWeight: 'normal' },
      photo: { x: 50, y: 26, size: 30 }
    },
    'outbox': {
      name: { x: 50, y: 46, fontSize: 15, color: '#000000', fontWeight: 'bold' },
      position: { x: 50, y: 58, fontSize: 15, color: '#000000', fontWeight: 'normal' },
      id: { x: 50, y: 71, fontSize: 17, color: '#0066cc', fontWeight: 'bold' },
      company: { x: 50, y: 85, fontSize: 18, color: '#006600', fontWeight: 'normal' },
      photo: { x: 50, y: 26, size: 30 }
    },
    'bridge retreat': {
      name: { x: 50, y: 46, fontSize: 15, color: '#000000', fontWeight: 'bold' },
      position: { x: 50, y: 58, fontSize: 15, color: '#000000', fontWeight: 'normal' },
      id: { x: 50, y: 71, fontSize: 17, color: '#0066cc', fontWeight: 'bold' },
      company: { x: 50, y: 85, fontSize: 18, color: '#006600', fontWeight: 'normal' },
      photo: { x: 50, y: 26, size: 30 }
    },
    'viking': {
      name: { x: 50, y: 46, fontSize: 15, color: '#000000', fontWeight: 'bold' },
      position: { x: 50, y: 58, fontSize: 15, color: '#000000', fontWeight: 'normal' },
      id: { x: 50, y: 71, fontSize: 17, color: '#0066cc', fontWeight: 'bold' },
      company: { x: 50, y: 85, fontSize: 18, color: '#006600', fontWeight: 'normal' },
      photo: { x: 50, y: 26, size: 30 }
    },
    'akwan': {
      name: { x: 50, y: 46, fontSize: 15, color: '#000000', fontWeight: 'bold' },
      position: { x: 50, y: 58, fontSize: 15, color: '#000000', fontWeight: 'normal' },
      id: { x: 50, y: 71, fontSize: 17, color: '#0066cc', fontWeight: 'bold' },
      company: { x: 50, y: 85, fontSize: 18, color: '#006600', fontWeight: 'normal' },
      photo: { x: 50, y: 26, size: 30 }
    },
    'goldstone': {
      name: { x: 50, y: 46, fontSize: 15, color: '#000000', fontWeight: 'bold' },
      position: { x: 50, y: 58, fontSize: 15, color: '#000000', fontWeight: 'normal' },
      id: { x: 50, y: 71, fontSize: 17, color: '#0066cc', fontWeight: 'bold' },
      company: { x: 50, y: 85, fontSize: 18, color: '#006600', fontWeight: 'normal' },
      photo: { x: 50, y: 26, size: 30 }
    }
  };

  const getCompanyTemplate = (companyName: string, lang: 'en' | 'ar') => {
    const normalizedName = companyName.toLowerCase().replace(/\s+/g, ' ').trim();
    
    const templateMap: { [key: string]: string } = {
      'albarq': 'albarq',
      'marah': 'marah',
      'marah games': 'marah',
      'marah inflatable games rental': 'marah',
      '7elements': '7elements',
      'lepadel': 'lepadel',
      'outbox': 'outbox',
      'bridge retreat': 'bridge retreat',
      'viking': 'viking',
      'akwan': 'akwan',
      'goldstone': 'goldstone'
    };

    for (const [key, templateName] of Object.entries(templateMap)) {
      if (normalizedName.includes(key)) {
        const langSuffix = lang === 'ar' ? 'arabic' : 'english';
        if (templateName === 'akwan' && lang === 'ar') {
          return `/ids/akwan ar.png`;
        }
        return `/ids/${templateName} ${langSuffix}.png`;
      }
    }
    
    return availableTemplates.length > 0 ? availableTemplates[0] : null;
  };

  useEffect(() => {
    const templates = [
      'albarq english.png', 'albarq arabic.png',
      'marah english.png', 'marah arabic.png',
      '7elements english.png', '7elements arabic.png',
      'lepadel english.png', 'lepadel arabic.png',
      'outbox english.png', 'outbox arabic.png',
      'bridge retreat english.png', 'bridge retreat arabic.png',
      'viking english.png', 'viking arabic.png',
      'akwan english.png', 'akwan ar.png',
      'goldstone english.png', 'goldstone arabic.png'
    ].map(template => `/ids/${template}`);
    
    setAvailableTemplates(templates);
    
    const defaultTemplate = getCompanyTemplate(company.name, language);
    setSelectedTemplate(defaultTemplate || templates[0]);
  }, [company.name, language]);

  useEffect(() => {
    const newTemplate = getCompanyTemplate(company.name, language);
    if (newTemplate) {
      setSelectedTemplate(newTemplate);
    }
  }, [language, company.name]);

  // Auto-detect Arabic template and switch language accordingly
  useEffect(() => {
    if (selectedTemplate) {
      const isArabicTemplate = selectedTemplate.includes('arabic') || selectedTemplate.includes('ar.png');
      if (isArabicTemplate && language !== 'ar') {
        setLanguage('ar');
      } else if (!isArabicTemplate && language !== 'en') {
        setLanguage('en');
      }
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (selectedTemplate) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setTemplateImage(img);
        
        // Apply template-specific presets
        const templateName = selectedTemplate.split('/').pop()?.split(' ')[0];
        if (templateName && templatePresets[templateName]) {
          setPositions(prev => ({
            ...prev,
            ...templatePresets[templateName]
          }));
        }
        
        if (showPreview) {
          updatePreview(img);
        }
      };
      img.onerror = () => {
        console.error('Failed to load template:', selectedTemplate);
      };
      img.src = selectedTemplate;
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (templateImage && showPreview) {
      updatePreview(templateImage);
    }
  }, [positions, templateImage, showPreview, language, employee.firstNameArabic, employee.lastNameArabic]);

  const updatePreview = (img: HTMLImageElement) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the original template
    ctx.drawImage(img, 0, 0);

    // Add preview overlays
    drawTextOverlays(ctx, img.width, img.height, true);
  };

  const drawTextOverlays = (ctx: CanvasRenderingContext2D, width: number, height: number, isPreview = false, overrideLanguage?: 'en' | 'ar') => {
    const currentLanguage = overrideLanguage || language;
    // Draw preview placeholder for photo position
    if (isPreview) {
      const photoX = (positions.photo.x / 100) * width;
      const photoY = (positions.photo.y / 100) * height;
      const photoSize = (positions.photo.size / 100) * Math.min(width, height);
      
      // Try to show actual photo in preview if available
      if (employee.avatar) {
        try {
          const employeeImg = new Image();
          employeeImg.crossOrigin = 'anonymous';
          employeeImg.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
            ctx.clip();
            
            const photoDrawX = photoX - photoSize / 2;
            const photoDrawY = photoY - photoSize / 2;
            ctx.drawImage(employeeImg, photoDrawX, photoDrawY, photoSize, photoSize);
            ctx.restore();
            
            // Add preview border
            ctx.strokeStyle = '#ff6b35';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          };
          employeeImg.src = employee.avatar;
        } catch (error) {
          // Fall back to placeholder if photo fails to load
          drawPhotoPlaceholder();
        }
      } else {
        drawPhotoPlaceholder();
      }
      
      function drawPhotoPlaceholder() {
        ctx.save();
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add "PHOTO" text
        ctx.fillStyle = '#ff6b35';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PHOTO', photoX, photoY + 3);
        ctx.restore();
      }
    }

    // Determine which name to use based on language and availability
    const getEmployeeName = () => {
      console.log('Getting employee name - Language:', currentLanguage, 'Arabic names available:', !!employee.firstNameArabic, !!employee.lastNameArabic);
      if (currentLanguage === 'ar' && employee.firstNameArabic && employee.lastNameArabic) {
        const arabicName = `${employee.firstNameArabic} ${employee.lastNameArabic}`;
        console.log('Using Arabic name:', arabicName);
        return arabicName;
      }
      const englishName = `${employee.firstName} ${employee.lastName}`;
      console.log('Using English name:', englishName);
      return englishName;
    };

    // Draw text overlays - only the actual content, no labels
    const fields = [
      { key: 'name', text: getEmployeeName() },
      { key: 'position', text: employee.position },
      { key: 'id', text: employee.id.substring(0, 8).toUpperCase() },
      { key: 'company', text: company.name }
    ];

    fields.forEach(({ key, text }) => {
      const pos = positions[key as keyof Omit<CardPositions, 'photo'>] as TextPosition;
      const x = (pos.x / 100) * width;
      const y = (pos.y / 100) * height;

      ctx.font = `${pos.fontWeight} ${pos.fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = pos.color;
      
      if (isPreview) {
        // Add subtle background for preview visibility
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(x - textWidth/2 - 3, y - pos.fontSize + 2, textWidth + 6, pos.fontSize + 4);
        ctx.restore();
        ctx.fillStyle = pos.color;
      }
      
      // Draw only the actual content
      ctx.fillText(text, x, y);
    });
  };

  const fillIdCard = async () => {
    if (!selectedTemplate || !canvasRef.current || !templateImage) return;

    setIsLoading(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = templateImage.width;
      canvas.height = templateImage.height;

      // Draw the original template image
      ctx.drawImage(templateImage, 0, 0);

      // Add employee photo if available
      if (employee.avatar) {
        try {
          console.log('Loading employee photo:', employee.avatar);
          const employeeImg = new Image();
          employeeImg.crossOrigin = 'anonymous';
          
          await new Promise<void>((resolve, reject) => {
            employeeImg.onload = () => {
              console.log('Employee image loaded successfully, dimensions:', employeeImg.width, 'x', employeeImg.height);
              resolve();
            };
            employeeImg.onerror = (error) => {
              console.error('Failed to load employee image:', error);
              reject(error);
            };
            employeeImg.src = employee.avatar!;
          });

          // Draw the photo if it loaded successfully
          const photoX = (positions.photo.x / 100) * canvas.width;
          const photoY = (positions.photo.y / 100) * canvas.height;
          const photoSize = (positions.photo.size / 100) * Math.min(canvas.width, canvas.height);
          
          console.log('Drawing photo at position:', photoX, photoY, 'with size:', photoSize);
          
          // Create circular clipping path for photo
          ctx.save();
          ctx.beginPath();
          ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          
          // Calculate photo position to center it
          const photoDrawX = photoX - photoSize / 2;
          const photoDrawY = photoY - photoSize / 2;
          
          // Draw the photo
          ctx.drawImage(employeeImg, photoDrawX, photoDrawY, photoSize, photoSize);
          ctx.restore();
          
          // Add photo border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          
          console.log('Photo drawn successfully');
        } catch (error) {
          console.warn('Failed to load employee photo:', error);
          // Draw placeholder circle if photo fails to load
          const photoX = (positions.photo.x / 100) * canvas.width;
          const photoY = (positions.photo.y / 100) * canvas.height;
          const photoSize = (positions.photo.size / 100) * Math.min(canvas.width, canvas.height);
          
          ctx.save();
          ctx.fillStyle = '#f3f4f6';
          ctx.beginPath();
          ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Add initials
          ctx.fillStyle = '#6b7280';
          ctx.font = `bold ${Math.floor(photoSize * 0.3)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`,
            photoX,
            photoY
          );
          ctx.restore();
        }
      } else {
        console.log('No employee avatar provided, drawing placeholder');
        // Draw placeholder circle if no photo is available
        const photoX = (positions.photo.x / 100) * canvas.width;
        const photoY = (positions.photo.y / 100) * canvas.height;
        const photoSize = (positions.photo.size / 100) * Math.min(canvas.width, canvas.height);
        
        ctx.save();
        ctx.fillStyle = '#f3f4f6';
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add initials
        ctx.fillStyle = '#6b7280';
        ctx.font = `bold ${Math.floor(photoSize * 0.3)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`,
          photoX,
          photoY
        );
        ctx.restore();
      }

      // Add text overlays
      drawTextOverlays(ctx, canvas.width, canvas.height, false);

      // Download the result
      const link = document.createElement('a');
      link.download = `${employee.firstName}_${employee.lastName}_ID_Card_${language.toUpperCase()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error filling ID card:', error);
      alert('Failed to fill ID card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePosition = (field: string, property: string, value: number | string) => {
    setPositions(prev => ({
      ...prev,
      [field]: {
        ...prev[field as keyof CardPositions],
        [property]: value
      }
    }));
  };

  const handleTemplateChange = (templatePath: string) => {
    console.log('Template changed to:', templatePath);
    setSelectedTemplate(templatePath);
    // Auto-switch language based on template
    const isArabicTemplate = templatePath.includes('arabic') || templatePath.includes('ar.png');
    const newLanguage = isArabicTemplate ? 'ar' : 'en';
    console.log('Auto-switching language to:', newLanguage);
    setLanguage(newLanguage);
    
    // Force immediate preview update with the new language
    if (templateImage && showPreview) {
      console.log('Force updating preview with new language:', newLanguage);
      updatePreviewWithLanguage(templateImage, newLanguage);
    }
  };

  const updatePreviewWithLanguage = (img: HTMLImageElement, lang?: 'en' | 'ar') => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the original template
    ctx.drawImage(img, 0, 0);

    // Add preview overlays with specific language
    drawTextOverlays(ctx, img.width, img.height, true, lang);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fill ID Card Template</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Adjust Position
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>ID Card Template</Label>
          <Select value={selectedTemplate || ''} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {availableTemplates.map((template) => (
                <SelectItem key={template} value={template}>
                  {template.split('/').pop()?.replace('.png', '')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={language} onValueChange={(value: 'en' | 'ar') => setLanguage(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>English</span>
                  {language === 'en' && selectedTemplate && !selectedTemplate.includes('arabic') && !selectedTemplate.includes('ar.png') && (
                    <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded ml-2">Auto</span>
                  )}
                </div>
              </SelectItem>
              <SelectItem value="ar">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>العربية (Arabic)</span>
                  {language === 'ar' && selectedTemplate && (selectedTemplate.includes('arabic') || selectedTemplate.includes('ar.png')) && (
                    <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded ml-2">Auto</span>
                  )}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Language automatically switches based on selected template
          </p>
        </div>

        <div className="space-y-2">
          <Label>Preview Mode</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={showPreview}
              onCheckedChange={setShowPreview}
            />
            <span className="text-sm text-muted-foreground">
              {showPreview ? 'Show' : 'Hide'} text overlay
            </span>
          </div>
        </div>
      </div>

      {/* Position Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Adjust Text Positions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(positions).map(([field, pos]) => {
              if (field === 'photo') {
                const photoPos = pos as { x: number; y: number; size: number };
                return (
                  <div key={field} className="space-y-2">
                    <Label className="font-medium capitalize">Photo Position</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">X Position (%)</Label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={photoPos.x}
                          onChange={(e) => updatePosition(field, 'x', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">{photoPos.x}%</span>
                      </div>
                      <div>
                        <Label className="text-xs">Y Position (%)</Label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={photoPos.y}
                          onChange={(e) => updatePosition(field, 'y', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">{photoPos.y}%</span>
                      </div>
                      <div>
                        <Label className="text-xs">Size (%)</Label>
                        <input
                          type="range"
                          min="10"
                          max="40"
                          step="1"
                          value={photoPos.size}
                          onChange={(e) => updatePosition(field, 'size', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">{photoPos.size}%</span>
                      </div>
                    </div>
                  </div>
                );
              }

              const textPos = pos as TextPosition;
              return (
                <div key={field} className="space-y-2">
                  <Label className="font-medium capitalize">{field} Text</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">X (%)</Label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={textPos.x}
                        onChange={(e) => updatePosition(field, 'x', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{textPos.x}%</span>
                    </div>
                    <div>
                      <Label className="text-xs">Y (%)</Label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={textPos.y}
                        onChange={(e) => updatePosition(field, 'y', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{textPos.y}%</span>
                    </div>
                    <div>
                      <Label className="text-xs">Size</Label>
                      <input
                        type="range"
                        min="8"
                        max="24"
                        step="1"
                        value={textPos.fontSize}
                        onChange={(e) => updatePosition(field, 'fontSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{textPos.fontSize}px</span>
                    </div>
                    <div>
                      <Label className="text-xs">Color</Label>
                      <input
                        type="color"
                        value={textPos.color}
                        onChange={(e) => updatePosition(field, 'color', e.target.value)}
                        className="w-full h-8 rounded border"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Template Preview */}
      {selectedTemplate && (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative max-w-full">
            {showPreview ? (
              <canvas 
                ref={previewCanvasRef}
                className="max-w-full max-h-96 object-contain border rounded-lg shadow-lg"
                style={{ maxHeight: '400px', width: 'auto' }}
              />
            ) : (
              <img 
                src={selectedTemplate} 
                alt="ID Card Template"
                className="max-w-full max-h-96 object-contain border rounded-lg shadow-lg"
                crossOrigin="anonymous"
              />
            )}
          </div>

          <Button 
            onClick={fillIdCard}
            disabled={isLoading}
            className="flex items-center space-x-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Filled ID Card</span>
              </>
            )}
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Employee Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Employee Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Name:</span>
            <div className="text-sm font-medium text-right">
              <div className={language === 'en' ? 'font-semibold text-primary' : ''}>
                {employee.firstName} {employee.lastName}
                {language === 'en' && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Used on ID</span>}
              </div>
              {employee.firstNameArabic && employee.lastNameArabic && (
                <div className={`text-xs mt-1 ${language === 'ar' ? 'font-semibold text-primary' : 'text-muted-foreground'}`} dir="rtl">
                  {employee.firstNameArabic} {employee.lastNameArabic}
                  {language === 'ar' && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Used on ID</span>}
                </div>
              )}
              {language === 'ar' && (!employee.firstNameArabic || !employee.lastNameArabic) && (
                <div className="text-xs text-amber-600 mt-1">
                  ⚠️ Arabic names not available, using English names
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Position:</span>
            <span className="text-sm font-medium">{employee.position}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Company:</span>
            <span className="text-sm font-medium">{company.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Employee ID:</span>
            <span className="text-sm font-medium">{employee.id.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Template:</span>
            <span className="text-sm font-medium">{selectedTemplate?.split('/').pop()?.replace('.png', '') || 'None'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 