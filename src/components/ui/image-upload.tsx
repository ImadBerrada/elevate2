"use client";

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { handleImageUpload, createImagePreview, cleanupImagePreview } from '@/lib/image-upload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  id?: string;
  label?: string;
  value?: string; // base64 or URL
  onChange: (value: string | null) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'square' | 'circle';
  showPreview?: boolean;
}

export function ImageUpload({
  id,
  label,
  value,
  onChange,
  className,
  placeholder = "Upload image",
  required = false,
  disabled = false,
  size = 'md',
  shape = 'square',
  showPreview = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Create preview
      if (showPreview) {
        const preview = createImagePreview(file);
        setPreviewUrl(preview);
      }

      // Upload and convert to base64
      const result = await handleImageUpload(file);
      
      if (result.success && result.data) {
        onChange(result.data);
      } else {
        setError(result.error || 'Failed to upload image');
        if (previewUrl) {
          cleanupImagePreview(previewUrl);
          setPreviewUrl(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      if (previewUrl) {
        cleanupImagePreview(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (previewUrl) {
      cleanupImagePreview(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayImage = value || previewUrl;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="flex items-start space-x-4">
        {/* Preview Area */}
        {showPreview && (
          <div 
            className={cn(
              "border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden",
              sizeClasses[size],
              shape === 'circle' && 'rounded-full',
              displayImage && 'border-solid border-primary/20'
            )}
          >
            {displayImage ? (
              <div className="relative w-full h-full group">
                <img
                  src={displayImage}
                  alt="Preview"
                  className={cn(
                    "w-full h-full object-cover",
                    shape === 'circle' && 'rounded-full'
                  )}
                />
                {!disabled && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      className="text-white hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        )}

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <Input
            ref={fileInputRef}
            id={id}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={disabled || isUploading}
              className="border-refined"
            >
              {isUploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  {displayImage ? 'Change' : 'Upload'}
                </>
              )}
            </Button>
            
            {displayImage && !disabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="border-refined text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          {!displayImage && (
            <p className="text-xs text-muted-foreground">
              {placeholder}. Max 5MB. JPG, PNG, GIF supported.
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
} 