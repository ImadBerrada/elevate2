"use client";

import React, { useState, useRef } from 'react';
import { Upload, Scan, FileText, Camera, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import Tesseract from 'tesseract.js';

// Dynamically import PDF.js only on client side
let pdfjsLib: any = null;
let pdfWorkerLoaded = false;

if (typeof window !== 'undefined') {
  import('pdfjs-dist').then((module) => {
    pdfjsLib = module;
    // Configure worker with multiple fallback options
    const workerOptions = [
      '/js/pdf.worker.min.js', // Local worker
      `https://unpkg.com/pdfjs-dist@${module.version}/build/pdf.worker.min.mjs`, // CDN with correct extension
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${module.version}/pdf.worker.min.js`, // Alternative CDN
    ];

    // Try each worker option
    let workerSet = false;
    for (const workerSrc of workerOptions) {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        workerSet = true;
        pdfWorkerLoaded = true;
        console.log('PDF.js worker configured with:', workerSrc);
        break;
      } catch (error) {
        console.warn('Failed to set worker:', workerSrc, error);
      }
    }

    if (!workerSet) {
      console.error('Failed to configure PDF.js worker');
    }
  }).catch((error) => {
    console.error('Failed to load PDF.js:', error);
  });
}

interface VisaData {
  visaNumber?: string;
  visaType?: string;
  issueDate?: string;
  expiryDate?: string;
  sponsor?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  emiratesId?: string;
  emiratesIdExpiry?: string;
  laborCardNumber?: string;
  laborCardExpiry?: string;
  firstName?: string;
  lastName?: string;
  profession?: string;
  salary?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
}

interface VisaScannerProps {
  onDataExtracted: (data: VisaData) => void;
  onDocumentUploaded: (document: string) => void;
  className?: string;
  focusedFields?: ('firstName' | 'lastName' | 'dateOfBirth' | 'nationality')[];
}

export function VisaScanner({ onDataExtracted, onDocumentUploaded, className, focusedFields }: VisaScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<VisaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    const isPdf = file.type === 'application/pdf';
    const isImage = supportedImageTypes.includes(file.type);
    
    if (!isImage && !isPdf) {
      setError('Please upload an image file (JPG, PNG, GIF, BMP, WebP) or PDF document');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Check if PDF.js is available for PDF files
    if (isPdf && (!pdfjsLib || !pdfWorkerLoaded)) {
      setError('PDF processing is not available. Please convert your PDF to an image (JPG/PNG) and try again, or wait a moment and retry.');
      return;
    }

    setError(null);
    setIsScanning(true);
    setScanProgress(0);

    try {
      // Convert file to base64 for preview
      const base64 = await fileToBase64(file);
      setUploadedDocument(base64);
      onDocumentUploaded(base64);

      // Perform OCR processing
      await performOCRProcessing(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process document';
      setError(errorMessage);
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const preprocessImage = async (imageFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Set canvas size with higher resolution for better OCR
          const scale = 2; // Increase resolution
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw the image at higher resolution
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Get image data for processing
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Apply image enhancements
          for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale for better OCR
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            
            // Apply contrast enhancement
            const contrast = 1.2;
            const enhanced = Math.min(255, Math.max(0, contrast * (gray - 128) + 128));
            
            // Apply threshold for better text clarity
            const threshold = enhanced > 128 ? 255 : 0;
            
            data[i] = threshold;     // Red
            data[i + 1] = threshold; // Green
            data[i + 2] = threshold; // Blue
            // Alpha channel (data[i + 3]) remains unchanged
          }

          // Put the processed image data back
          ctx.putImageData(imageData, 0, 0);

          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              console.log('Image preprocessing completed');
              resolve(blob);
            } else {
              reject(new Error('Failed to convert processed image to blob'));
            }
          }, 'image/png', 0.95);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for preprocessing'));
      };

      // Load the image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(imageFile);
    });
  };

  const performOCRProcessing = async (file: File): Promise<void> => {
    try {
      let imageToProcess: File | Blob = file;

      // If it's a PDF, convert to image first
      if (file.type === 'application/pdf') {
        setScanProgress(10);
        try {
          imageToProcess = await convertPdfToImage(file);
          setScanProgress(40);
        } catch (error) {
          console.error('PDF conversion error:', error);
          throw new Error('PDF processing failed. Please convert your PDF to an image (JPG/PNG) and try again.');
        }
      } else {
        setScanProgress(20);
        // For images, apply preprocessing to improve OCR accuracy
        try {
          imageToProcess = await preprocessImage(file);
          setScanProgress(30);
        } catch (error) {
          console.warn('Image preprocessing failed, using original:', error);
          // Continue with original image if preprocessing fails
        }
      }

      // Perform OCR with enhanced settings
      const { data: { text } } = await Tesseract.recognize(
        imageToProcess,
        'eng+ara',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const baseProgress = file.type === 'application/pdf' ? 40 : 30;
              const ocrProgress = Math.round(m.progress * 50);
              setScanProgress(baseProgress + ocrProgress);
            }
          }
        }
      );

      if (!text || text.trim().length < 10) {
        throw new Error('No readable text found in the document.');
      }

      // Parse the extracted text
      const parsedData = parseVisaText(text);
      setExtractedData(parsedData);
      onDataExtracted(parsedData);
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw error;
    }
  };

  const convertPdfToImage = async (pdfFile: File): Promise<Blob> => {
    try {
      if (!pdfjsLib || !pdfWorkerLoaded) {
        throw new Error('PDF.js not properly loaded');
      }

      const arrayBuffer = await pdfFile.arrayBuffer();
      
      // Configure PDF.js with better error handling
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        // Remove cMapUrl for now to avoid additional loading issues
        verbosity: 0, // Reduce console noise
      });

      let pdf;
      try {
        pdf = await loadingTask.promise;
      } catch (loadError) {
        console.error('PDF loading failed:', loadError);
        throw new Error('Failed to load PDF document. The file may be corrupted or password-protected.');
      }

      let page;
      try {
        page = await pdf.getPage(1);
      } catch (pageError) {
        console.error('Failed to get PDF page:', pageError);
        throw new Error('Failed to access the first page of the PDF.');
      }
      
      const scale = 2.0;
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      try {
        await page.render(renderContext).promise;
      } catch (renderError) {
        console.error('PDF rendering failed:', renderError);
        throw new Error('Failed to render PDF page to image.');
      }
      
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to image blob'));
          }
        }, 'image/png', 0.9);
      });
    } catch (error) {
      console.error('PDF conversion failed:', error);
      if (error instanceof Error) {
        throw error; // Re-throw with original message
      } else {
        throw new Error('Unknown error occurred during PDF conversion');
      }
    }
  };

  const parseVisaText = (text: string): VisaData => {
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 2);
    const data: VisaData = {};

    console.log('🔍 === VISA TEXT PARSING DEBUG ===');
    console.log('📄 Raw extracted text (first 1000 chars):', text.substring(0, 1000));
    console.log('🧹 Cleaned text (first 500 chars):', cleanText.substring(0, 500));
    console.log('📋 Total lines found:', lines.length);
    console.log('📝 All lines:');
    lines.forEach((line, index) => {
      console.log(`  Line ${index + 1}: "${line}"`);
    });
    console.log('='.repeat(50));

    // Helper function to clean extracted values
    const cleanValue = (value: string): string => {
      return value
        .replace(/[^\w\s\-\/&.,()]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
    };

    // Helper function to validate dates
    const isValidDate = (dateStr: string): boolean => {
      const dateRegexes = [
        /^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/, // DD/MM/YYYY or DD-MM-YYYY
        /^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$/, // YYYY/MM/DD or YYYY-MM-DD
        /^\d{1,2}\s+\w+\s+\d{4}$/, // DD Month YYYY
      ];
      return dateRegexes.some(regex => regex.test(dateStr.trim()));
    };

    // Helper function to validate numbers
    const isValidNumber = (num: string, minLength: number = 6): boolean => {
      return num.length >= minLength && /^[A-Z0-9]+$/i.test(num);
    };

    // 1. EXTRACT NAMES - Enhanced with multiple strategies
    const extractNames = () => {
      console.log('🔍 Extracting names...');
      console.log('Available lines for name extraction:', lines);
      
      // Strategy 1: Direct name field patterns with better regex
      const namePatterns = [
        // Pattern for "First Name: John Last Name: Smith" or similar
        /(?:first\s*name|given\s*name)[\s:]*([A-Z][a-zA-Z]+)[\s\S]*?(?:last\s*name|surname|family\s*name)[\s:]*([A-Z][a-zA-Z]+)/i,
        // Pattern for "Last Name: Smith First Name: John" or similar  
        /(?:last\s*name|surname|family\s*name)[\s:]*([A-Z][a-zA-Z]+)[\s\S]*?(?:first\s*name|given\s*name)[\s:]*([A-Z][a-zA-Z]+)/i,
        // Pattern for "Name: John Smith" or "Full Name: John Smith"
        /(?:^name|full\s*name|holder\s*name|applicant\s*name)[\s:]+([A-Z][a-zA-Z]+)\s+([A-Z][a-zA-Z]+)/im,
        // Pattern for lines starting with "Name" followed by two words
        /^name[\s:]+([A-Z][a-zA-Z]+)\s+([A-Z][a-zA-Z]+)/im,
      ];

      for (let i = 0; i < namePatterns.length; i++) {
        const pattern = namePatterns[i];
        const match = cleanText.match(pattern);
        if (match && match[1] && match[2]) {
          console.log(`✅ Pattern ${i + 1} matched:`, match);
          
          // Determine which is first name and which is last name based on pattern
          if (i === 0 || i === 2 || i === 3) {
            // first name comes first in these patterns
            data.firstName = cleanValue(match[1]).charAt(0).toUpperCase() + cleanValue(match[1]).slice(1).toLowerCase();
            data.lastName = cleanValue(match[2]).charAt(0).toUpperCase() + cleanValue(match[2]).slice(1).toLowerCase();
          } else {
            // last name comes first in pattern 1
            data.lastName = cleanValue(match[1]).charAt(0).toUpperCase() + cleanValue(match[1]).slice(1).toLowerCase();
            data.firstName = cleanValue(match[2]).charAt(0).toUpperCase() + cleanValue(match[2]).slice(1).toLowerCase();
          }
          console.log('✅ Found names from labeled pattern:', data.firstName, data.lastName);
          return;
        }
      }

      // Strategy 2: Look for clean name lines (enhanced filtering)
      console.log('🔍 Strategy 2: Looking for clean name lines...');
      const cleanNameLines = lines.filter(line => {
        const trimmed = line.trim();
        const words = trimmed.split(/\s+/);
        
        // Must be exactly 2 words, each starting with capital letter, no numbers
        if (words.length !== 2) return false;
        if (!words.every(word => word.length > 1 && /^[A-Z][a-zA-Z]+$/.test(word))) return false;
        
        // Exclude lines with visa/document keywords
        const excludeKeywords = [
          'visa', 'passport', 'emirates', 'residence', 'permit', 'card', 'number', 
          'date', 'issue', 'expiry', 'nationality', 'profession', 'birth', 'gender', 
          'status', 'marital', 'single', 'married', 'morocco', 'moroccan', 'indian',
          'pakistani', 'bangladeshi', 'filipino', 'egyptian', 'jordanian', 'lebanese',
          'syrian', 'sudanese', 'yemeni', 'iraqi', 'iranian', 'afghan', 'nepalese',
          'british', 'american', 'canadian', 'australian', 'german', 'french',
          'italian', 'spanish', 'russian', 'chinese', 'japanese', 'korean', 'thai',
          'malaysian', 'indonesian', 'vietnamese', 'turkish', 'tunisian', 'algerian',
          'ethiopian', 'kenyan', 'nigerian', 'ghanaian'
        ];
        
        const lowerLine = trimmed.toLowerCase();
        if (excludeKeywords.some(keyword => lowerLine.includes(keyword))) return false;
        
        // Exclude common document words
        if (/\b(type|class|category|valid|until|from|to|no|ref|id|code)\b/i.test(trimmed)) return false;
        
        return true;
      });

      console.log('Clean name lines found:', cleanNameLines);

      // Look for the most likely name line (prefer lines that appear early in document)
      for (let i = 0; i < Math.min(cleanNameLines.length, 3); i++) {
        const line = cleanNameLines[i];
        const words = line.trim().split(/\s+/);
        
        if (words.length === 2) {
          data.firstName = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
          data.lastName = words[1].charAt(0).toUpperCase() + words[1].slice(1).toLowerCase();
          console.log('✅ Found names from clean line:', data.firstName, data.lastName);
          return;
        }
      }

      // Strategy 3: Look for names in specific document positions
      console.log('🔍 Strategy 3: Looking in document positions...');
      const earlyLines = lines.slice(0, 15); // Check first 15 lines
      
      for (const line of earlyLines) {
        const trimmed = line.trim();
        const words = trimmed.split(/\s+/);
        
        // Look for exactly 2 capitalized words that could be names
        if (words.length === 2 && 
            words.every(word => /^[A-Z][a-z]{1,}$/.test(word)) &&
            !/(visa|passport|emirates|date|number|nationality|profession)/i.test(trimmed)) {
          
          // Additional validation - names shouldn't be too short or too long
          if (words.every(word => word.length >= 2 && word.length <= 15)) {
            data.firstName = words[0];
            data.lastName = words[1];
            console.log('✅ Found names from document position:', data.firstName, data.lastName);
            return;
          }
        }
      }

      console.log('❌ No names found with any strategy');
    };

    extractNames();

    // 2. EXTRACT VISA NUMBER - Enhanced patterns
    const visaPatterns = [
      /(?:visa|permit|residence)[\s\w]*(?:no|number|#)[\s:]*([0-9]{10,15})/i,
      /visa[\s:]*([0-9]{11,15})/i, // Long numeric sequences like 22520193419750
      /\b([0-9]{11,15})\b/, // Pure long numbers
      /(?:residence|permit)[\s:]*([A-Z0-9]{8,20})/i,
    ];

    for (const pattern of visaPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        const visaNum = cleanValue(match[1]);
        if (/^\d{11,15}$/.test(visaNum)) { // Ensure it's a long numeric sequence
          data.visaNumber = visaNum;
          console.log('✅ Found visa number:', data.visaNumber);
          break;
        }
      }
    }

    // 3. EXTRACT PASSPORT NUMBER - Enhanced patterns
    const passportPatterns = [
      /passport[\s\w]*(?:no|number|#)[\s:]*([A-Z]{1,3}[0-9]{6,9})/i,
      /passport[\s:]*([A-Z]{2}[0-9]{7,9})/i, // Format like BG7230912
      /\b([A-Z]{2}[0-9]{7,9})\b/, // Two letters + 7-9 digits
      /\b([A-Z][0-9]{8})\b/, // One letter + 8 digits
    ];

    for (const pattern of passportPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        const passportNum = cleanValue(match[1]);
        if (/^[A-Z]{1,3}[0-9]{6,9}$/.test(passportNum)) {
          data.passportNumber = passportNum;
          console.log('✅ Found passport number:', data.passportNumber);
          break;
        }
      }
    }

    // 4. EXTRACT DATES - Enhanced with context analysis
    const datePatterns = [
      /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})\b/g,
      /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/g,
    ];

    let allDates: string[] = [];
    for (const pattern of datePatterns) {
      const matches = cleanText.match(pattern);
      if (matches) {
        allDates = allDates.concat(matches);
      }
    }

    const validDates = [...new Set(allDates)].filter(isValidDate);
    console.log('Found dates:', validDates);

    // Assign dates based on context
    for (const date of validDates) {
      const dateIndex = cleanText.indexOf(date);
      const contextBefore = cleanText.substring(Math.max(0, dateIndex - 100), dateIndex).toLowerCase();
      const contextAfter = cleanText.substring(dateIndex + date.length, dateIndex + date.length + 50).toLowerCase();
      const fullContext = (contextBefore + ' ' + contextAfter).toLowerCase();

      console.log(`Analyzing date ${date} with context:`, fullContext.substring(fullContext.length - 50));

      // Date of Birth - highest priority for birth context
      if (/(?:date\s*of\s*birth|birth\s*date|dob|born)/.test(fullContext) && !data.dateOfBirth) {
        data.dateOfBirth = date;
        console.log('✅ Assigned date of birth:', date);
      }
      // Issue Date
      else if (/(?:issue\s*date|issued\s*on|date\s*of\s*issue|from|start)/.test(fullContext) && !data.issueDate) {
        data.issueDate = date;
        console.log('✅ Assigned issue date:', date);
      }
      // Expiry Date
      else if (/(?:expiry\s*date|expires\s*on|expir|valid\s*until|until|to|end)/.test(fullContext) && !data.expiryDate) {
        data.expiryDate = date;
        console.log('✅ Assigned expiry date:', date);
      }
    }

    // If no context-based assignment, use chronological order
    if (validDates.length > 0) {
      const sortedDates = validDates.sort((a, b) => {
        const dateA = new Date(a.replace(/[-\/]/g, '/'));
        const dateB = new Date(b.replace(/[-\/]/g, '/'));
        return dateA.getTime() - dateB.getTime();
      });

      if (!data.dateOfBirth && sortedDates.length > 0) {
        // Usually the earliest date is birth date
        const potentialBirthDate = sortedDates.find(date => {
          const year = parseInt(date.split(/[-\/]/)[2]);
          return year >= 1950 && year <= 2010; // Reasonable birth year range
        });
        if (potentialBirthDate) {
          data.dateOfBirth = potentialBirthDate;
          console.log('✅ Assigned birth date (chronological):', potentialBirthDate);
        }
      }

      if (!data.issueDate && sortedDates.length > 1) {
        data.issueDate = sortedDates[sortedDates.length - 2] || sortedDates[0];
        console.log('✅ Assigned issue date (chronological):', data.issueDate);
      }

      if (!data.expiryDate && sortedDates.length > 0) {
        data.expiryDate = sortedDates[sortedDates.length - 1];
        console.log('✅ Assigned expiry date (chronological):', data.expiryDate);
      }
    }

    // 5. EXTRACT NATIONALITY - Enhanced patterns
    const nationalityPatterns = [
      // Direct nationality field patterns
      /(?:nationality|country\s*of\s*origin|citizen\s*of|citizenship)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /^nationality[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/im,
      /country[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      
      // Specific nationality/country patterns (most comprehensive list)
      /\b(MOROCCO|MOROCCAN|INDIA|INDIAN|PAKISTAN|PAKISTANI|BANGLADESH|BANGLADESHI|PHILIPPINES|FILIPINO|EGYPT|EGYPTIAN|JORDAN|JORDANIAN|LEBANON|LEBANESE|SYRIA|SYRIAN|SUDAN|SUDANESE|YEMEN|YEMENI|IRAQ|IRAQI|IRAN|IRANIAN|AFGHANISTAN|AFGHAN|NEPAL|NEPALESE|SRI\s*LANKA|SRI\s*LANKAN|BRITAIN|BRITISH|UK|UNITED\s*KINGDOM|AMERICA|AMERICAN|USA|UNITED\s*STATES|CANADA|CANADIAN|AUSTRALIA|AUSTRALIAN|GERMANY|GERMAN|FRANCE|FRENCH|ITALY|ITALIAN|SPAIN|SPANISH|RUSSIA|RUSSIAN|CHINA|CHINESE|JAPAN|JAPANESE|KOREA|KOREAN|SOUTH\s*KOREA|THAILAND|THAI|MALAYSIA|MALAYSIAN|INDONESIA|INDONESIAN|VIETNAM|VIETNAMESE|TURKEY|TURKISH|TUNISIA|TUNISIAN|ALGERIA|ALGERIAN|ETHIOPIA|ETHIOPIAN|KENYA|KENYAN|NIGERIA|NIGERIAN|GHANA|GHANAIAN|SOUTH\s*AFRICA|SOUTH\s*AFRICAN|SAUDI\s*ARABIA|SAUDI|UAE|EMIRATES|KUWAIT|KUWAITI|QATAR|QATARI|BAHRAIN|BAHRAINI|OMAN|OMANI|SOMALIA|SOMALI|ERITREA|ERITREAN|DJIBOUTI|DJIBOUTIAN|MAURITANIA|MAURITANIAN|SENEGAL|SENEGALESE|MALI|MALIAN|BURKINA\s*FASO|BURKINABE|NIGER|NIGERIEN|CHAD|CHADIAN|CAMEROON|CAMEROONIAN|CENTRAL\s*AFRICAN|GABON|GABONESE|CONGO|CONGOLESE|ANGOLA|ANGOLAN|ZAMBIA|ZAMBIAN|ZIMBABWE|ZIMBABWEAN|BOTSWANA|MOTSWANA|NAMIBIA|NAMIBIAN|LESOTHO|BASOTHO|SWAZILAND|SWAZI|MADAGASCAR|MALAGASY|MAURITIUS|MAURITIAN|SEYCHELLES|SEYCHELLOIS|COMOROS|COMORIAN|CAPE\s*VERDE|CAPE\s*VERDEAN|SAO\s*TOME|SANTOMEAN|EQUATORIAL\s*GUINEA|EQUATOGUINEAN|LIBERIA|LIBERIAN|SIERRA\s*LEONE|SIERRA\s*LEONEAN|GUINEA|GUINEAN|GUINEA\s*BISSAU|BISSAU\s*GUINEAN|GAMBIA|GAMBIAN|IVORY\s*COAST|IVORIAN|TOGO|TOGOLESE|BENIN|BENINESE|RWANDA|RWANDAN|BURUNDI|BURUNDIAN|UGANDA|UGANDAN|TANZANIA|TANZANIAN|MALAWI|MALAWIAN|MOZAMBIQUE|MOZAMBICAN|MADAGASCAR|MALAGASY)\b/i,
      
      // Pattern for lines that start with nationality-related words
      /^(?:nationality|country|citizen)[\s:]+([A-Z][a-z]+)/im
    ];

    console.log('🔍 Extracting nationality...');
    console.log('Text to search for nationality:', cleanText.substring(0, 500));

    for (let i = 0; i < nationalityPatterns.length; i++) {
      const pattern = nationalityPatterns[i];
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        console.log(`✅ Nationality pattern ${i + 1} matched:`, match);
        
        let nationality = cleanValue(match[1]).toLowerCase().trim();
        
        // Comprehensive country to nationality mapping
        const countryToNationality: { [key: string]: string } = {
          // African countries
          'morocco': 'Moroccan', 'egypt': 'Egyptian', 'algeria': 'Algerian', 'tunisia': 'Tunisian',
          'libya': 'Libyan', 'sudan': 'Sudanese', 'ethiopia': 'Ethiopian', 'kenya': 'Kenyan',
          'nigeria': 'Nigerian', 'ghana': 'Ghanaian', 'south africa': 'South African',
          'somalia': 'Somali', 'eritrea': 'Eritrean', 'djibouti': 'Djiboutian',
          'mauritania': 'Mauritanian', 'senegal': 'Senegalese', 'mali': 'Malian',
          'burkina faso': 'Burkinabe', 'niger': 'Nigerien', 'chad': 'Chadian',
          'cameroon': 'Cameroonian', 'gabon': 'Gabonese', 'congo': 'Congolese',
          'angola': 'Angolan', 'zambia': 'Zambian', 'zimbabwe': 'Zimbabwean',
          'botswana': 'Motswana', 'namibia': 'Namibian', 'lesotho': 'Basotho',
          'swaziland': 'Swazi', 'madagascar': 'Malagasy', 'mauritius': 'Mauritian',
          
          // Asian countries
          'india': 'Indian', 'pakistan': 'Pakistani', 'bangladesh': 'Bangladeshi',
          'philippines': 'Filipino', 'china': 'Chinese', 'japan': 'Japanese',
          'korea': 'Korean', 'south korea': 'Korean', 'thailand': 'Thai',
          'malaysia': 'Malaysian', 'indonesia': 'Indonesian', 'vietnam': 'Vietnamese',
          'singapore': 'Singaporean', 'myanmar': 'Burmese', 'cambodia': 'Cambodian',
          'laos': 'Laotian', 'brunei': 'Bruneian', 'nepal': 'Nepalese',
          'sri lanka': 'Sri Lankan', 'afghanistan': 'Afghan', 'iran': 'Iranian',
          'iraq': 'Iraqi', 'syria': 'Syrian', 'lebanon': 'Lebanese',
          'jordan': 'Jordanian', 'yemen': 'Yemeni',
          
          // Middle Eastern countries
          'saudi arabia': 'Saudi', 'saudi': 'Saudi', 'uae': 'Emirati', 'emirates': 'Emirati',
          'kuwait': 'Kuwaiti', 'qatar': 'Qatari', 'bahrain': 'Bahraini', 'oman': 'Omani',
          'turkey': 'Turkish', 'israel': 'Israeli', 'palestine': 'Palestinian',
          
          // European countries
          'britain': 'British', 'uk': 'British', 'united kingdom': 'British',
          'germany': 'German', 'france': 'French', 'italy': 'Italian',
          'spain': 'Spanish', 'portugal': 'Portuguese', 'netherlands': 'Dutch',
          'belgium': 'Belgian', 'switzerland': 'Swiss', 'austria': 'Austrian',
          'sweden': 'Swedish', 'norway': 'Norwegian', 'denmark': 'Danish',
          'finland': 'Finnish', 'poland': 'Polish', 'russia': 'Russian',
          'ukraine': 'Ukrainian', 'romania': 'Romanian', 'greece': 'Greek',
          
          // American countries
          'america': 'American', 'usa': 'American', 'united states': 'American',
          'canada': 'Canadian', 'mexico': 'Mexican', 'brazil': 'Brazilian',
          'argentina': 'Argentine', 'chile': 'Chilean', 'colombia': 'Colombian',
          'venezuela': 'Venezuelan', 'peru': 'Peruvian', 'ecuador': 'Ecuadorian',
          
          // Oceanian countries
          'australia': 'Australian', 'new zealand': 'New Zealander'
        };
        
        // Check if it's already a nationality or needs conversion
        const convertedNationality = countryToNationality[nationality] || 
                                   nationality.charAt(0).toUpperCase() + nationality.slice(1);
        
        // Validate the nationality (should be reasonable length and format)
        if (convertedNationality.length >= 3 && convertedNationality.length <= 20 && 
            !/\d/.test(convertedNationality)) {
          data.nationality = convertedNationality;
          console.log('✅ Found nationality:', data.nationality);
          break;
        }
      }
    }

    // Additional search in individual lines for nationality
    if (!data.nationality) {
      console.log('🔍 Searching individual lines for nationality...');
      for (const line of lines) {
        const trimmedLine = line.trim().toLowerCase();
        
        // Look for lines that might contain nationality
        if (trimmedLine.includes('nationality') || trimmedLine.includes('country')) {
          console.log('Found nationality line:', line);
          
          // Extract potential nationality from this line
          const words = line.split(/\s+/);
          for (const word of words) {
            const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
            const countryToNationality: { [key: string]: string } = {
              'morocco': 'Moroccan', 'moroccan': 'Moroccan',
              'india': 'Indian', 'indian': 'Indian',
              'pakistan': 'Pakistani', 'pakistani': 'Pakistani',
              'bangladesh': 'Bangladeshi', 'bangladeshi': 'Bangladeshi',
              'philippines': 'Filipino', 'filipino': 'Filipino',
              'egypt': 'Egyptian', 'egyptian': 'Egyptian',
              'jordan': 'Jordanian', 'jordanian': 'Jordanian',
              'lebanon': 'Lebanese', 'lebanese': 'Lebanese',
              'syria': 'Syrian', 'syrian': 'Syrian',
              'sudan': 'Sudanese', 'sudanese': 'Sudanese',
              'yemen': 'Yemeni', 'yemeni': 'Yemeni',
              'iraq': 'Iraqi', 'iraqi': 'Iraqi',
              'iran': 'Iranian', 'iranian': 'Iranian',
              'afghanistan': 'Afghan', 'afghan': 'Afghan',
              'nepal': 'Nepalese', 'nepalese': 'Nepalese',
              'britain': 'British', 'british': 'British',
              'america': 'American', 'american': 'American',
              'canada': 'Canadian', 'canadian': 'Canadian',
              'australia': 'Australian', 'australian': 'Australian'
            };
            
            if (countryToNationality[cleanWord] && cleanWord.length > 3) {
              data.nationality = countryToNationality[cleanWord];
              console.log('✅ Found nationality from line search:', data.nationality);
              break;
            }
          }
          if (data.nationality) break;
        }
      }
    }

    // 6. EXTRACT MARITAL STATUS
    const maritalPatterns = [
      /(?:marital\s*status|status)[\s:]*([A-Z][a-z]+)/i,
      /\b(SINGLE|MARRIED|DIVORCED|WIDOWED)\b/i
    ];

    for (const pattern of maritalPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        const status = cleanValue(match[1]).toLowerCase();
        data.maritalStatus = status.charAt(0).toUpperCase() + status.slice(1);
        console.log('✅ Found marital status:', data.maritalStatus);
        break;
      }
    }

    // 7. EXTRACT PROFESSION - Enhanced patterns
    const professionPatterns = [
      /(?:profession|occupation|job\s*title|designation|position)[\s:]*([A-Z][a-zA-Z\s\-\/&]+)/i,
      /(?:work\s*as|employed\s*as|working\s*as)[\s:]*([A-Z][a-zA-Z\s\-\/&]+)/i,
      // Specific job titles
      /\b(Sales\s+Representative|Sales\s+Manager|Marketing\s+Manager|Project\s+Manager|Software\s+Engineer|Data\s+Analyst|Business\s+Analyst|Account\s+Manager|Customer\s+Service|Administrative\s+Assistant|Executive\s+Assistant|Human\s+Resources|Finance\s+Manager|Operations\s+Manager|General\s+Manager|Store\s+Manager|Team\s+Leader|Supervisor|Coordinator|Specialist|Consultant|Developer|Designer|Architect|Engineer|Technician|Analyst|Administrator|Officer|Executive|Director|Manager|Assistant|Representative|Clerk|Operator)\b/i,
    ];

    for (const pattern of professionPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        const profession = cleanValue(match[1]);
        if (profession.length > 2 && profession.length < 50 && !/\d/.test(profession)) {
          data.profession = profession.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          console.log('✅ Found profession:', data.profession);
          break;
        }
      }
    }

    // Final cleanup and validation
    Object.keys(data).forEach(key => {
      const value = data[key as keyof VisaData];
      if (value && typeof value === 'string') {
        const cleaned = value.replace(/[^\w\s\-\/&.,()]/g, '').trim();
        if (cleaned.length > 0) {
          (data as any)[key] = cleaned;
        } else {
          delete (data as any)[key];
        }
      }
    });

    console.log('🎯 Final extracted data:', data);
    return data;
  };

  const handleRetry = () => {
    setUploadedDocument(null);
    setExtractedData(null);
    setError(null);
    setScanProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scan className="w-5 h-5" />
            <span>Visa Document Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedDocument ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Upload Visa Document</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload your visa document as an image or PDF for text extraction.
                      {!pdfWorkerLoaded && (
                        <span className="block text-amber-600 mt-1">
                          PDF processing is loading... For best results, use image files (JPG/PNG).
                        </span>
                      )}
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Camera className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-600 text-sm font-medium">Error</p>
                      <p className="text-red-600 text-sm">{error}</p>
                      {error.includes('PDF processing') && (
                        <p className="text-red-600 text-xs mt-1">
                          Tip: Convert your PDF to JPG/PNG using an online converter for better results.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Document Preview */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Uploaded Document</h4>
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-32">
                  {uploadedDocument ? (
                    <img 
                      src={uploadedDocument} 
                      alt="Uploaded document" 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Scanning Status */}
              {isScanning && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                    <span className="text-blue-600">Processing document...</span>
                  </div>
                  {scanProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${scanProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Data */}
              {extractedData && !isScanning && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">Data extracted successfully!</span>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Personal Information Section */}
                    {(extractedData.firstName || extractedData.lastName || extractedData.nationality || extractedData.dateOfBirth || extractedData.maritalStatus) && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {extractedData.firstName && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">First Name</Label>
                              <Input
                                value={extractedData.firstName}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                          {extractedData.lastName && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Last Name</Label>
                              <Input
                                value={extractedData.lastName}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                          {extractedData.nationality && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Nationality</Label>
                              <Input
                                value={extractedData.nationality}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, nationality: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                          {extractedData.dateOfBirth && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                              <Input
                                value={extractedData.dateOfBirth}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, dateOfBirth: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                          {extractedData.maritalStatus && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Marital Status</Label>
                              <Input
                                value={extractedData.maritalStatus}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, maritalStatus: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Visa Information Section */}
                    {(extractedData.visaNumber || extractedData.issueDate || extractedData.expiryDate) && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-green-600 border-b border-green-200 pb-2">
                          Visa Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {extractedData.visaNumber && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Visa Number</Label>
                              <Input
                                value={extractedData.visaNumber}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, visaNumber: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                          {extractedData.issueDate && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Issue Date</Label>
                              <Input
                                value={extractedData.issueDate}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, issueDate: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                          {extractedData.expiryDate && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Expiry Date</Label>
                              <Input
                                value={extractedData.expiryDate}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, expiryDate: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Document Information Section */}
                    {(extractedData.passportNumber || extractedData.passportExpiry || extractedData.emiratesId) && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-purple-600 border-b border-purple-200 pb-2">
                          Document Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {extractedData.passportNumber && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Passport</Label>
                              <Input
                                value={extractedData.passportNumber}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, passportNumber: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                          {extractedData.passportExpiry && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Passport Expiry</Label>
                              <Input
                                value={extractedData.passportExpiry}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, passportExpiry: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                          {extractedData.emiratesId && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Emirates ID</Label>
                              <Input
                                value={extractedData.emiratesId}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, emiratesId: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Employment Information Section */}
                    {(extractedData.profession || extractedData.sponsor || extractedData.salary) && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-orange-600 border-b border-orange-200 pb-2">
                          Employment Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {extractedData.profession && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Profession</Label>
                              <Input
                                value={extractedData.profession}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, profession: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                          {extractedData.sponsor && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Sponsor/Employer</Label>
                              <Input
                                value={extractedData.sponsor}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, sponsor: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                          {extractedData.salary && (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Salary</Label>
                              <Input
                                value={extractedData.salary}
                                onChange={(e) => setExtractedData(prev => prev ? { ...prev, salary: e.target.value } : null)}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Summary Display - Formatted exactly as requested */}
                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">📋 Extracted Information Summary</h4>
                      
                      {/* Personal Information */}
                      {(extractedData.firstName || extractedData.lastName || extractedData.nationality || extractedData.dateOfBirth || extractedData.maritalStatus) && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-blue-600 mb-2">Personal Information</h5>
                          <div className="text-sm text-gray-700 space-y-1 ml-2">
                            {extractedData.firstName && <p><strong>First Name:</strong> {extractedData.firstName}</p>}
                            {extractedData.lastName && <p><strong>Last Name:</strong> {extractedData.lastName}</p>}
                            {extractedData.nationality && <p><strong>Nationality:</strong> {extractedData.nationality}</p>}
                            {extractedData.dateOfBirth && <p><strong>Date of Birth:</strong> {extractedData.dateOfBirth}</p>}
                            {extractedData.maritalStatus && <p><strong>Marital Status:</strong> {extractedData.maritalStatus}</p>}
                          </div>
                        </div>
                      )}

                      {/* Visa Information */}
                      {(extractedData.visaNumber || extractedData.issueDate || extractedData.expiryDate) && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-green-600 mb-2">Visa Information</h5>
                          <div className="text-sm text-gray-700 space-y-1 ml-2">
                            {extractedData.visaNumber && <p><strong>Visa Number:</strong> {extractedData.visaNumber}</p>}
                            {extractedData.issueDate && <p><strong>Issue Date:</strong> {extractedData.issueDate}</p>}
                            {extractedData.expiryDate && <p><strong>Expiry Date:</strong> {extractedData.expiryDate}</p>}
                          </div>
                        </div>
                      )}

                      {/* Document Information */}
                      {(extractedData.passportNumber || extractedData.passportExpiry || extractedData.emiratesId) && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-purple-600 mb-2">Document Information</h5>
                          <div className="text-sm text-gray-700 space-y-1 ml-2">
                            {extractedData.passportNumber && <p><strong>Passport:</strong> {extractedData.passportNumber}</p>}
                            {extractedData.passportExpiry && <p><strong>Passport Expiry:</strong> {extractedData.passportExpiry}</p>}
                            {extractedData.emiratesId && <p><strong>Emirates ID:</strong> {extractedData.emiratesId}</p>}
                          </div>
                        </div>
                      )}

                      {/* Employment Information */}
                      {(extractedData.profession || extractedData.sponsor || extractedData.salary) && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-orange-600 mb-2">Employment Information</h5>
                          <div className="text-sm text-gray-700 space-y-1 ml-2">
                            {extractedData.profession && <p><strong>Profession:</strong> {extractedData.profession}</p>}
                            {extractedData.sponsor && <p><strong>Sponsor/Employer:</strong> {extractedData.sponsor}</p>}
                            {extractedData.salary && <p><strong>Salary:</strong> {extractedData.salary}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleRetry}>
                      Scan Another
                    </Button>
                    <Button onClick={handleConfirm}>
                      <Check className="w-4 h-4 mr-2" />
                      Use This Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 