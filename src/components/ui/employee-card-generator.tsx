"use client";

import React, { useState, useRef } from 'react';
import { Download, Palette, FileImage, Globe } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
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

interface EmployeeCardGeneratorProps {
  employee: Employee;
  company: Company;
  onClose: () => void;
}

const cardColors = [
  { name: 'Blue', value: '#2563EB', gradient: 'from-blue-400 to-blue-600' },
  { name: 'Gold', value: '#D4AF37', gradient: 'from-yellow-400 to-yellow-600' },
  { name: 'Green', value: '#059669', gradient: 'from-green-400 to-green-600' },
  { name: 'Purple', value: '#7C3AED', gradient: 'from-purple-400 to-purple-600' },
  { name: 'Red', value: '#DC2626', gradient: 'from-red-400 to-red-600' },
  { name: 'Orange', value: '#EA580C', gradient: 'from-orange-400 to-orange-600' },
  { name: 'Teal', value: '#0D9488', gradient: 'from-teal-400 to-teal-600' },
  { name: 'Pink', value: '#DB2777', gradient: 'from-pink-400 to-pink-600' },
];

export function EmployeeCardGenerator({ employee, company, onClose }: EmployeeCardGeneratorProps) {
  const [selectedColor, setSelectedColor] = useState(cardColors[0]); // Default to blue
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      // Create a completely isolated card element with only inline styles
      const isolatedCard = document.createElement('div');
      isolatedCard.innerHTML = `
        <div style="
          width: 320px;
          height: 480px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          position: relative;
          font-family: system-ui, -apple-system, sans-serif;
          margin: 0;
          padding: 0;
        ">
          <!-- Curved Top Section -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 120px;
            background: linear-gradient(135deg, ${selectedColor.value}, ${selectedColor.value}ee);
            border-radius: 0 0 60px 60px;
          "></div>

          <!-- Company Logo Circle -->
          <div style="
            position: absolute;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            width: 70px;
            height: 70px;
            background-color: #ffffff;
            border-radius: 50%;
            border: 3px solid #4ade80;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            z-index: 10;
          ">
            ${company.logo ? 
              `<img src="${company.logo}" alt="${company.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: contain;" crossorigin="anonymous" />` :
              `<div style="width: 50px; height: 50px; border-radius: 50%; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #2563EB;">AZAAB</div>`
            }
          </div>

          <!-- Card Content -->
          <div style="
            position: absolute;
            top: 150px;
            left: 40px;
            right: 40px;
            text-align: center;
          ">
            ${language === 'en' ? `
              <!-- Name Section -->
              <div style="margin-bottom: 22px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; letter-spacing: 0.5px;">Name</h3>
                <p style="font-size: 15px; font-weight: 500; color: #4b5563; margin: 0 0 6px 0; line-height: 1.3;">${employee.firstName} ${employee.lastName}</p>
                <div style="width: 200px; height: 1px; background: repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px); margin: 0 auto;"></div>
              </div>

              <!-- Position Section -->
              <div style="margin-bottom: 22px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; letter-spacing: 0.5px;">Position</h3>
                <p style="font-size: 15px; font-weight: 500; color: #4b5563; margin: 0 0 6px 0; line-height: 1.3;">${employee.position}</p>
                <div style="width: 200px; height: 1px; background: repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px); margin: 0 auto;"></div>
              </div>

              <!-- ID Number Section -->
              <div style="margin-bottom: 22px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; letter-spacing: 0.5px;">ID NO.</h3>
                <p style="font-size: 15px; font-weight: 600; color: #4b5563; margin: 0 0 6px 0; font-family: monospace; letter-spacing: 1px; line-height: 1.3;">${employee.id.substring(0, 8).toUpperCase()}</p>
                <div style="width: 200px; height: 1px; background: repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px); margin: 0 auto;"></div>
              </div>

              <!-- Company Name Section -->
              <div style="margin-bottom: 15px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; letter-spacing: 0.5px;">Company Name</h3>
                <p style="font-size: 15px; font-weight: 500; color: #4b5563; margin: 0 0 6px 0; line-height: 1.3;">${company.name}</p>
                <div style="width: 200px; height: 1px; background: repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px); margin: 0 auto;"></div>
              </div>
            ` : `
              <!-- Arabic Version -->
              <div style="margin-bottom: 22px; direction: rtl;">
                <h3 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; letter-spacing: 0.5px;">الاسم</h3>
                <p style="font-size: 15px; font-weight: 500; color: #4b5563; margin: 0 0 6px 0; line-height: 1.3;">${employee.firstName} ${employee.lastName}</p>
                <div style="width: 200px; height: 1px; background: repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px); margin: 0 auto;"></div>
              </div>

              <div style="margin-bottom: 22px; direction: rtl;">
                <h3 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; letter-spacing: 0.5px;">المسمى الوظيفي</h3>
                <p style="font-size: 15px; font-weight: 500; color: #4b5563; margin: 0 0 6px 0; line-height: 1.3;">${employee.position}</p>
                <div style="width: 200px; height: 1px; background: repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px); margin: 0 auto;"></div>
              </div>

              <div style="margin-bottom: 22px; direction: rtl;">
                <h3 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; letter-spacing: 0.5px;">الرقــــم الوظيفي</h3>
                <p style="font-size: 15px; font-weight: 600; color: #4b5563; margin: 0 0 6px 0; font-family: monospace; letter-spacing: 1px; line-height: 1.3;">${employee.id.substring(0, 8).toUpperCase()}</p>
                <div style="width: 200px; height: 1px; background: repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px); margin: 0 auto;"></div>
              </div>

              <div style="margin-bottom: 15px; direction: rtl;">
                <h3 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; letter-spacing: 0.5px;">اســــم الشــــركة</h3>
                <p style="font-size: 15px; font-weight: 500; color: #4b5563; margin: 0 0 6px 0; line-height: 1.3;">${company.name}</p>
                <div style="width: 200px; height: 1px; background: repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px); margin: 0 auto;"></div>
              </div>
            `}
          </div>

          <!-- ELEVATE Logo at Bottom Center -->
          <div style="
            position: absolute;
            bottom: 5px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <img src="/logo ele.png" alt="ELEVATE" style="height: 12px; width: auto; object-fit: contain; opacity: 0.7;" crossorigin="anonymous" />
          </div>
        </div>
      `;
      
      // Create a temporary container with explicit styles to avoid oklch issues
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.padding = '0';
      tempContainer.style.margin = '0';
      tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      document.body.appendChild(tempContainer);
      
      // Add the isolated card to the container
      tempContainer.appendChild(isolatedCard);
      
      const canvas = await html2canvas(isolatedCard.firstElementChild as HTMLElement, {
        useCORS: true,
        allowTaint: false,
        logging: false,
        background: '#ffffff',
        width: 320,
        height: 480
      });

      // Clean up temporary container
      document.body.removeChild(tempContainer);

      // Create download link
      const link = document.createElement('a');
      link.download = `${employee.firstName}_${employee.lastName}_ID_Card_${language.toUpperCase()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating card:', error);
      alert('Failed to generate card. Please try again.');
    }
  };

  const CardPreview = () => (
    <div 
      ref={cardRef}
      style={{ 
        width: '320px',
        height: '480px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Clean Curved Top Section */}
      <div 
        style={{ 
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '120px',
          background: `linear-gradient(135deg, ${selectedColor.value}, ${selectedColor.value}ee)`,
          borderRadius: '0 0 60px 60px'
        }}
      />

      {/* Company Logo Circle */}
      <div 
        style={{
          position: 'absolute',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70px',
          height: '70px',
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          border: '3px solid #4ade80',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          zIndex: 10
        }}
      >
        {company.logo ? (
          <img 
            src={company.logo} 
            alt={company.name}
            style={{ 
              width: '50px', 
              height: '50px',
              borderRadius: '50%',
              objectFit: 'contain'
            }}
            crossOrigin="anonymous"
          />
        ) : (
          <div 
            style={{ 
              width: '50px', 
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#2563EB'
            }}
          >
            AZAAB
          </div>
        )}
      </div>

      {/* Card Content */}
      <div 
        style={{ 
          position: 'absolute',
          top: '150px',
          left: '40px',
          right: '40px',
          textAlign: 'center'
        }}
      >
        {language === 'en' ? (
          <>
            {/* Name Section */}
            <div style={{ marginBottom: '22px' }}>
              <h3 
                style={{ 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 6px 0',
                  letterSpacing: '0.5px'
                }}
              >
                Name
              </h3>
              <p 
                style={{ 
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#4b5563',
                  margin: '0 0 6px 0',
                  lineHeight: '1.3'
                }}
              >
                {employee.firstName} {employee.lastName}
              </p>
              <div 
                style={{ 
                  width: '200px', 
                  height: '1px',
                  background: 'repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px)',
                  margin: '0 auto'
                }} 
              />
            </div>

            {/* Position Section */}
            <div style={{ marginBottom: '22px' }}>
              <h3 
                style={{ 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 6px 0',
                  letterSpacing: '0.5px'
                }}
              >
                Position
              </h3>
              <p 
                style={{ 
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#4b5563',
                  margin: '0 0 6px 0',
                  lineHeight: '1.3'
                }}
              >
                {employee.position}
              </p>
              <div 
                style={{ 
                  width: '200px', 
                  height: '1px',
                  background: 'repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px)',
                  margin: '0 auto'
                }} 
              />
            </div>

            {/* ID Number Section */}
            <div style={{ marginBottom: '22px' }}>
              <h3 
                style={{ 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 6px 0',
                  letterSpacing: '0.5px'
                }}
              >
                ID NO.
              </h3>
              <p 
                style={{ 
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#4b5563',
                  margin: '0 0 6px 0',
                  fontFamily: 'monospace',
                  letterSpacing: '1px',
                  lineHeight: '1.3'
                }}
              >
                {employee.id.substring(0, 8).toUpperCase()}
              </p>
              <div 
                style={{ 
                  width: '200px', 
                  height: '1px',
                  background: 'repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px)',
                  margin: '0 auto'
                }} 
              />
            </div>

            {/* Company Name Section */}
            <div style={{ marginBottom: '15px' }}>
              <h3 
                style={{ 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 6px 0',
                  letterSpacing: '0.5px'
                }}
              >
                Company Name
              </h3>
              <p 
                style={{ 
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#4b5563',
                  margin: '0 0 6px 0',
                  lineHeight: '1.3'
                }}
              >
                {company.name}
              </p>
              <div 
                style={{ 
                  width: '200px', 
                  height: '1px',
                  background: 'repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px)',
                  margin: '0 auto'
                }} 
              />
            </div>
          </>
        ) : (
          <>
            {/* Arabic Version */}
            <div style={{ marginBottom: '22px', direction: 'rtl' }}>
              <h3 
                style={{ 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 6px 0',
                  letterSpacing: '0.5px'
                }}
              >
                الاسم
              </h3>
              <p 
                style={{ 
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#4b5563',
                  margin: '0 0 6px 0',
                  lineHeight: '1.3'
                }}
              >
                {employee.firstName} {employee.lastName}
              </p>
              <div 
                style={{ 
                  width: '200px', 
                  height: '1px',
                  background: 'repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px)',
                  margin: '0 auto'
                }} 
              />
            </div>

            <div style={{ marginBottom: '22px', direction: 'rtl' }}>
              <h3 
                style={{ 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 6px 0',
                  letterSpacing: '0.5px'
                }}
              >
                المسمى الوظيفي
              </h3>
              <p 
                style={{ 
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#4b5563',
                  margin: '0 0 6px 0',
                  lineHeight: '1.3'
                }}
              >
                {employee.position}
              </p>
              <div 
                style={{ 
                  width: '200px', 
                  height: '1px',
                  background: 'repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px)',
                  margin: '0 auto'
                }} 
              />
            </div>

            <div style={{ marginBottom: '22px', direction: 'rtl' }}>
              <h3 
                style={{ 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 6px 0',
                  letterSpacing: '0.5px'
                }}
              >
                الرقــــم الوظيفي
              </h3>
              <p 
                style={{ 
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#4b5563',
                  margin: '0 0 6px 0',
                  fontFamily: 'monospace',
                  letterSpacing: '1px',
                  lineHeight: '1.3'
                }}
              >
                {employee.id.substring(0, 8).toUpperCase()}
              </p>
              <div 
                style={{ 
                  width: '200px', 
                  height: '1px',
                  background: 'repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px)',
                  margin: '0 auto'
                }} 
              />
            </div>

            <div style={{ marginBottom: '15px', direction: 'rtl' }}>
              <h3 
                style={{ 
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 6px 0',
                  letterSpacing: '0.5px'
                }}
              >
                اســــم الشــــركة
              </h3>
              <p 
                style={{ 
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#4b5563',
                  margin: '0 0 6px 0',
                  lineHeight: '1.3'
                }}
              >
                {company.name}
              </p>
              <div 
                style={{ 
                  width: '200px', 
                  height: '1px',
                  background: 'repeating-linear-gradient(to right, #9ca3af 0px, #9ca3af 2px, transparent 2px, transparent 6px)',
                  margin: '0 auto'
                }} 
              />
            </div>
          </>
        )}
      </div>

      {/* ELEVATE Logo at Bottom Center */}
      <div 
        style={{ 
          position: 'absolute',
          bottom: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img 
          src="/logo ele.png" 
          alt="ELEVATE"
          style={{ 
            height: '12px',
            width: 'auto',
            objectFit: 'contain',
            opacity: '0.7'
          }}
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Generate Employee ID Card</h3>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color Selection */}
        <div className="space-y-2">
          <Label>Card Color</Label>
          <div className="grid grid-cols-4 gap-2">
            {cardColors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "w-12 h-12 rounded-lg border-2 transition-all",
                  selectedColor.value === color.value 
                    ? "border-gray-800 scale-110" 
                    : "border-gray-300 hover:border-gray-500"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Selected: {selectedColor.name}
          </p>
        </div>

        {/* Language Selection */}
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
                </div>
              </SelectItem>
              <SelectItem value="ar">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>العربية (Arabic)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Card Preview */}
      <div className="flex flex-col items-center space-y-4">
        <div 
          style={{ 
            backgroundColor: '#f3f4f6',
            minHeight: '500px',
            padding: '24px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CardPreview />
        </div>

        {/* Download Button */}
        <Button 
          onClick={downloadCard}
          className="flex items-center space-x-2 text-white"
          style={{ backgroundColor: selectedColor.value }}
        >
          <Download className="w-4 h-4" />
          <span>Download ID Card</span>
        </Button>
      </div>

      {/* Employee Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Employee Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Name:</span>
            <span className="text-sm font-medium">{employee.firstName} {employee.lastName}</span>
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
        </CardContent>
      </Card>
    </div>
  );
} 