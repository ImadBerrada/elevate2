"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Upload, 
  Camera, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Scan,
  FileText,
  Eye,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import Tesseract from 'tesseract.js';

interface IdScannerProps {
  onIdExtracted: (data: { employeeId?: string; emiratesId?: string; [key: string]: any }) => void;
  onDocumentUploaded?: (document: string) => void;
  className?: string;
}

export function IdScanner({ onIdExtracted, onDocumentUploaded, className }: IdScannerProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [showRawText, setShowRawText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setError(null);
      setExtractedData(null);
      setRawText('');
      setOcrProgress(0);
      setOcrStatus('');

      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setUploadedImage(imageData);
        onDocumentUploaded?.(imageData);
        
        // Start OCR processing
        performRealOCR(file);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload error:', err);
      setError('Failed to upload file. Please try again.');
    }
  };

  const performRealOCR = async (imageFile: File) => {
    setIsScanning(true);
    setError(null);
    setOcrProgress(0);
    setOcrStatus('Initializing OCR...');

    try {
      // Use Tesseract.js for real OCR
      const { data: { text } } = await Tesseract.recognize(
        imageFile,
        'eng+ara', // Support both English and Arabic
        {
          logger: (m) => {
            // Update progress and status
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
              setOcrStatus(`Processing... ${Math.round(m.progress * 100)}%`);
            } else {
              setOcrStatus(m.status);
            }
          }
        }
      );

      console.log('OCR extracted text:', text);
      setRawText(text);

      // Parse the extracted text to find ID information
      const parsedData = parseIdDocument(text);
      
      if (!parsedData || Object.keys(parsedData).length === 0) {
        throw new Error('No recognizable ID information found in the document');
      }

      setExtractedData({
        ...parsedData,
        confidence: calculateConfidence(text, parsedData),
        extractedAt: new Date().toISOString(),
        rawText: text,
      });

      onIdExtracted(parsedData);
      setOcrStatus('Extraction completed successfully!');

    } catch (error) {
      console.error('OCR extraction failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to extract text from the document. Please ensure the image is clear and try again.');
      setOcrStatus('Extraction failed');
    } finally {
      setIsScanning(false);
      setOcrProgress(100);
    }
  };

  const parseIdDocument = (text: string): any => {
    if (!text || text.trim().length === 0) {
      return null;
    }

    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    let parsedData: any = {};

    // Clean and normalize text for better matching
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const upperText = normalizedText.toUpperCase();

    console.log('Parsing text:', normalizedText);

    // Detect document type
    if (upperText.includes('EMIRATES') && upperText.includes('ID')) {
      parsedData.documentType = 'Emirates ID';
    } else if (upperText.includes('DRIVER') && (upperText.includes('LICENSE') || upperText.includes('LICENCE'))) {
      parsedData.documentType = 'Driver License';
    } else if (upperText.includes('PASSPORT')) {
      parsedData.documentType = 'Passport';
    } else if (upperText.includes('NATIONAL') && upperText.includes('ID')) {
      parsedData.documentType = 'National ID';
    } else {
      parsedData.documentType = 'Unknown Document';
    }

    // Extract Emirates ID (various formats)
    const emiratesIdPatterns = [
      /784[-\s]?(\d{4})[-\s]?(\d{7})[-\s]?(\d)/g,
      /(\d{3})[-\s]?(\d{4})[-\s]?(\d{7})[-\s]?(\d)/g,
      /ID\s*:?\s*784[-\s]?(\d{4})[-\s]?(\d{7})[-\s]?(\d)/gi,
      /Emirates\s*ID\s*:?\s*784[-\s]?(\d{4})[-\s]?(\d{7})[-\s]?(\d)/gi
    ];

    for (const pattern of emiratesIdPatterns) {
      const matches = [...normalizedText.matchAll(pattern)];
      if (matches.length > 0) {
        const match = matches[0];
        if (match[1] && match[2] && match[3]) {
          parsedData.emiratesId = `784-${match[1]}-${match[2]}-${match[3]}`;
          break;
        } else if (match.length >= 4) {
          parsedData.emiratesId = `${match[1]}-${match[2]}-${match[3]}-${match[4]}`;
          break;
        }
      }
    }

    // Extract Driver License Number
    const licensePatterns = [
      /(?:License|Licence)\s*(?:No|Number|#)?\s*:?\s*([A-Z]{0,2}\d{6,12})/gi,
      /DL\s*:?\s*(\d{6,12})/gi,
      /(?:^|\s)([A-Z]{2}\d{6,9})(?:\s|$)/g,
      /\b(DL\d{6,12})\b/gi
    ];

    for (const pattern of licensePatterns) {
      const matches = [...normalizedText.matchAll(pattern)];
      if (matches.length > 0) {
        parsedData.licenseNumber = matches[0][1];
        break;
      }
    }

    // Extract Passport Number
    const passportPatterns = [
      /(?:Passport\s*(?:No|Number)?\s*:?\s*)([A-Z]{1,2}\d{6,9})/gi,
      /(?:^|\s)([A-Z]{2}\d{7})(?:\s|$)/g,
      /P\s*:?\s*([A-Z]{1,2}\d{6,9})/gi
    ];

    for (const pattern of passportPatterns) {
      const matches = [...normalizedText.matchAll(pattern)];
      if (matches.length > 0) {
        parsedData.passportNumber = matches[0][1];
        break;
      }
    }

    // Extract Names (look for capitalized words that could be names)
    const namePatterns = [
      /(?:Name\s*:?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      /(?:^|\n)([A-Z][A-Z\s]{10,50})(?:\n|$)/g, // All caps names
      /([A-Z][a-z]+\s+(?:AL-|BIN\s+|IBN\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
    ];

    for (const pattern of namePatterns) {
      const matches = [...normalizedText.matchAll(pattern)];
      for (const match of matches) {
        const name = match[1].trim();
        // Filter out common non-name text
        if (name && 
            !name.includes('EMIRATES') && 
            !name.includes('PASSPORT') && 
            !name.includes('LICENSE') &&
            !name.includes('UNITED') &&
            !name.includes('ARAB') &&
            name.length > 5 &&
            name.split(' ').length >= 2) {
          parsedData.fullName = name;
          break;
        }
      }
      if (parsedData.fullName) break;
    }

    // Extract Date of Birth
    const dobPatterns = [
      /(?:Date\s*of\s*Birth|DOB|Birth\s*Date)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
      /(?:Born|Birth)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g
    ];

    for (const pattern of dobPatterns) {
      const matches = [...normalizedText.matchAll(pattern)];
      if (matches.length > 0) {
        const dateStr = matches[0][1];
        const parsedDate = parseDate(dateStr);
        if (parsedDate && isValidBirthDate(parsedDate)) {
          parsedData.dateOfBirth = parsedDate;
          break;
        }
      }
    }

    // Extract Issue Date
    const issueDatePatterns = [
      /(?:Issue\s*Date|Issued|Date\s*of\s*Issue)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
      /(?:Valid\s*From)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi
    ];

    for (const pattern of issueDatePatterns) {
      const matches = [...normalizedText.matchAll(pattern)];
      if (matches.length > 0) {
        const dateStr = matches[0][1];
        const parsedDate = parseDate(dateStr);
        if (parsedDate) {
          parsedData.issueDate = parsedDate;
          break;
        }
      }
    }

    // Extract Expiry Date
    const expiryDatePatterns = [
      /(?:Expiry\s*Date|Expires|Valid\s*Until|Exp)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi,
      /(?:Valid\s*To)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/gi
    ];

    for (const pattern of expiryDatePatterns) {
      const matches = [...normalizedText.matchAll(pattern)];
      if (matches.length > 0) {
        const dateStr = matches[0][1];
        const parsedDate = parseDate(dateStr);
        if (parsedDate) {
          parsedData.expiryDate = parsedDate;
          break;
        }
      }
    }

    // Extract Nationality
    const nationalityPatterns = [
      /(?:Nationality|Nation)\s*:?\s*([A-Z][a-z\s]{3,25})/gi,
      /(?:Country)\s*:?\s*([A-Z][a-z\s]{3,25})/gi
    ];

    for (const pattern of nationalityPatterns) {
      const matches = [...normalizedText.matchAll(pattern)];
      if (matches.length > 0) {
        const nationality = matches[0][1].trim();
        if (nationality && !nationality.includes('EMIRATES') && nationality.length > 3) {
          parsedData.nationality = nationality;
          break;
        }
      }
    }

    // Extract Gender
    const genderPatterns = [
      /(?:Sex|Gender)\s*:?\s*(M|F|Male|Female)/gi
    ];

    for (const pattern of genderPatterns) {
      const matches = [...normalizedText.matchAll(pattern)];
      if (matches.length > 0) {
        const gender = matches[0][1].toUpperCase();
        parsedData.gender = gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : gender;
        break;
      }
    }

    // Extract License Class
    const classPatterns = [
      /(?:Class|Category)\s*:?\s*(\d+|[A-Z]+)/gi,
      /(?:Type)\s*:?\s*(\d+|[A-Z]+)/gi
    ];

    for (const pattern of classPatterns) {
      const matches = [...normalizedText.matchAll(pattern)];
      if (matches.length > 0) {
        parsedData.licenseClass = `Class ${matches[0][1]}`;
        break;
      }
    }

    // Generate employee ID if not found
    if (!parsedData.employeeId && (parsedData.emiratesId || parsedData.licenseNumber || parsedData.passportNumber)) {
      parsedData.employeeId = generateEmployeeId();
    }

    console.log('Parsed data:', parsedData);
    return parsedData;
  };

  const parseDate = (dateStr: string): string | null => {
    try {
      // Handle different date formats
      const cleanDate = dateStr.replace(/[^\d\/\-\.]/g, '');
      const parts = cleanDate.split(/[\/\-\.]/);
      
      if (parts.length !== 3) return null;
      
      let day, month, year;
      
      // Determine format based on which part is likely the year
      if (parts[2].length === 4) {
        // DD/MM/YYYY or MM/DD/YYYY
        day = parseInt(parts[0]);
        month = parseInt(parts[1]);
        year = parseInt(parts[2]);
      } else if (parts[0].length === 4) {
        // YYYY/MM/DD
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
      } else {
        return null;
      }

      // Validate ranges
      if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
      }

      // Return in YYYY-MM-DD format
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } catch {
      return null;
    }
  };

  const isValidBirthDate = (dateStr: string): boolean => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      return age >= 16 && age <= 100; // Reasonable age range
    } catch {
      return false;
    }
  };

  const calculateConfidence = (text: string, parsedData: any): number => {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on what we found
    if (parsedData.emiratesId) confidence += 0.2;
    if (parsedData.licenseNumber) confidence += 0.2;
    if (parsedData.passportNumber) confidence += 0.2;
    if (parsedData.fullName) confidence += 0.15;
    if (parsedData.dateOfBirth) confidence += 0.1;
    if (parsedData.documentType !== 'Unknown Document') confidence += 0.1;
    
    // Reduce confidence if text is very short or unclear
    if (text.length < 50) confidence -= 0.2;
    if (text.includes('???') || text.includes('###')) confidence -= 0.1;
    
    return Math.max(0.3, Math.min(0.99, confidence));
  };

  const generateEmployeeId = (): string => {
    const year = new Date().getFullYear();
    const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `EMP-${year}-${number}`;
  };

  const handleCameraCapture = () => {
    setError('Camera capture feature is not yet implemented. Please use file upload.');
  };

  const handleRetryExtraction = async () => {
    if (!uploadedImage) return;
    
    setError(null);
    setExtractedData(null);
    setRawText('');
    
    // Convert base64 back to file for re-processing
    try {
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      const file = new File([blob], 'retry-image.jpg', { type: blob.type });
      await performRealOCR(file);
    } catch (err) {
      console.error('Retry extraction failed:', err);
      setError('Retry failed. Please upload a new image.');
    }
  };

  const handleClearData = () => {
    setExtractedData(null);
    setUploadedImage(null);
    setError(null);
    setRawText('');
    setOcrProgress(0);
    setOcrStatus('');
    setShowRawText(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <span>ID Document Scanner</span>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Production Ready
          </Badge>
        </CardTitle>
        <CardDescription>
          Upload an Emirates ID, Driver License, Passport, or other ID document to automatically extract information using OCR technology
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload ID Document
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCameraCapture}
              disabled={isScanning}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground text-center">
            Supported formats: JPG, PNG, WEBP • Max size: 10MB • Supports English and Arabic text
          </p>
        </div>

        {/* Processing State */}
        {isScanning && (
          <div className="space-y-3">
            <div className="flex items-center justify-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-blue-700 font-medium">Processing Document...</p>
                <p className="text-blue-600 text-sm">{ocrStatus}</p>
              </div>
            </div>
            
            {ocrProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">OCR Progress</span>
                  <span className="text-blue-600 font-medium">{ocrProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${ocrProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">OCR Processing Error</p>
                <p className="text-red-600 text-sm mb-3">{error}</p>
                {uploadedImage && (
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRetryExtraction}
                      disabled={isScanning}
                      className="text-red-700 border-red-300 hover:bg-red-100"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Retry OCR
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearData}
                      className="text-gray-700 border-gray-300 hover:bg-gray-100"
                    >
                      Upload New Image
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Image Preview */}
        {uploadedImage && !isScanning && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Uploaded Document</Label>
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded ID document"
                className="w-full max-w-md mx-auto rounded-lg border border-gray-200 shadow-sm"
              />
              <Badge className="absolute top-2 right-2 bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Uploaded
              </Badge>
            </div>
          </div>
        )}

        {/* Extracted Data */}
        {extractedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-green-700">Extracted Information</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Scan className="w-3 h-3 mr-1" />
                  Confidence: {Math.round(extractedData.confidence * 100)}%
                </Badge>
                {rawText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRawText(!showRawText)}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {showRawText ? 'Hide' : 'Show'} Raw Text
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              {/* Primary ID Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extractedData.employeeId && (
                  <div>
                    <Label className="text-xs font-medium text-green-800">Employee ID</Label>
                    <p className="text-sm font-mono text-green-900">{extractedData.employeeId}</p>
                  </div>
                )}
                {extractedData.emiratesId && (
                  <div>
                    <Label className="text-xs font-medium text-green-800">Emirates ID</Label>
                    <p className="text-sm font-mono text-green-900">{extractedData.emiratesId}</p>
                  </div>
                )}
                {extractedData.passportNumber && (
                  <div>
                    <Label className="text-xs font-medium text-green-800">Passport Number</Label>
                    <p className="text-sm font-mono text-green-900">{extractedData.passportNumber}</p>
                  </div>
                )}
                {extractedData.licenseNumber && (
                  <div>
                    <Label className="text-xs font-medium text-green-800">License Number</Label>
                    <p className="text-sm font-mono text-green-900">{extractedData.licenseNumber}</p>
                  </div>
                )}
                {extractedData.documentType && (
                  <div>
                    <Label className="text-xs font-medium text-green-800">Document Type</Label>
                    <p className="text-sm text-green-900">{extractedData.documentType}</p>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              {(extractedData.fullName || extractedData.dateOfBirth || extractedData.gender || extractedData.nationality) && (
                <div>
                  <h6 className="text-xs font-semibold text-green-800 mb-2 border-b border-green-300 pb-1">Personal Information</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extractedData.fullName && (
                      <div>
                        <Label className="text-xs font-medium text-green-800">Full Name</Label>
                        <p className="text-sm text-green-900">{extractedData.fullName}</p>
                      </div>
                    )}
                    {extractedData.dateOfBirth && (
                      <div>
                        <Label className="text-xs font-medium text-green-800">Date of Birth</Label>
                        <p className="text-sm text-green-900">{extractedData.dateOfBirth}</p>
                      </div>
                    )}
                    {extractedData.gender && (
                      <div>
                        <Label className="text-xs font-medium text-green-800">Gender</Label>
                        <p className="text-sm text-green-900">{extractedData.gender}</p>
                      </div>
                    )}
                    {extractedData.nationality && (
                      <div>
                        <Label className="text-xs font-medium text-green-800">Nationality</Label>
                        <p className="text-sm text-green-900">{extractedData.nationality}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Validity */}
              {(extractedData.issueDate || extractedData.expiryDate || extractedData.licenseClass) && (
                <div>
                  <h6 className="text-xs font-semibold text-green-800 mb-2 border-b border-green-300 pb-1">Document Details</h6>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {extractedData.issueDate && (
                      <div>
                        <Label className="text-xs font-medium text-green-800">Issue Date</Label>
                        <p className="text-sm text-green-900">{extractedData.issueDate}</p>
                      </div>
                    )}
                    {extractedData.expiryDate && (
                      <div>
                        <Label className="text-xs font-medium text-green-800">Expiry Date</Label>
                        <p className="text-sm text-green-900">{extractedData.expiryDate}</p>
                      </div>
                    )}
                    {extractedData.licenseClass && (
                      <div>
                        <Label className="text-xs font-medium text-green-800">License Class</Label>
                        <p className="text-sm text-green-900">{extractedData.licenseClass}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Raw OCR Text */}
              {showRawText && rawText && (
                <div>
                  <h6 className="text-xs font-semibold text-green-800 mb-2 border-b border-green-300 pb-1">Raw OCR Text</h6>
                  <div className="p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 max-h-32 overflow-y-auto">
                    {rawText}
                  </div>
                </div>
              )}

              {/* Extraction Metadata */}
              <div className="border-t border-green-300 pt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-green-800">OCR Confidence</Label>
                    <p className="text-sm text-green-900">{Math.round(extractedData.confidence * 100)}%</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-green-800">Processed At</Label>
                    <p className="text-sm text-green-900">
                      {new Date(extractedData.extractedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetryExtraction}
                disabled={isScanning}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Re-scan
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearData}
              >
                Clear & Upload New
              </Button>
            </div>
          </div>
        )}

        {/* OCR Tips */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h6 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            Tips for Better OCR Results
          </h6>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Ensure the document is well-lit and clearly visible</li>
            <li>• Place the document on a flat, contrasting surface</li>
            <li>• Avoid shadows, glare, or reflections on the document</li>
            <li>• Make sure all text is in focus and readable</li>
            <li>• Higher resolution images produce better results</li>
            <li>• Supports both English and Arabic text recognition</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 
 
 
 