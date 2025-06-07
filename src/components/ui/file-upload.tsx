"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  X, 
  Check, 
  AlertCircle,
  Download,
  Eye,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploadProps {
  onFileSelect: (file: File | null, url?: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  currentFile?: string; // URL of current file
  placeholder?: string;
  className?: string;
  multiple?: boolean;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  url: string;
  type: 'image' | 'pdf' | 'document';
  size: string;
}

export function FileUpload({
  onFileSelect,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp",
  maxSize = 10, // 10MB default
  currentFile,
  placeholder = "Upload receipt or document",
  className = "",
  multiple = false,
  disabled = false
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'image' | 'pdf' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    return 'document';
  };

  const getFileIcon = (type: 'image' | 'pdf' | 'document') => {
    switch (type) {
      case 'image': return Image;
      case 'pdf': return FileText;
      case 'document': return File;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    const isValidExtension = allowedTypes.some(type => 
      type.startsWith('.') ? type === fileExtension : type === mimeType
    );

    if (!isValidExtension) {
      return `File type not supported. Allowed types: ${accept}`;
    }

    return null;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      
      const uploadedFileData: UploadedFile = {
        file,
        url,
        type: getFileType(file),
        size: formatFileSize(file.size)
      };

      setUploadedFile(uploadedFileData);
      onFileSelect(file, url);
    } catch (error) {
      setError("Failed to process file");
      console.error("File upload error:", error);
    } finally {
      setIsUploading(false);
    }
  }, [onFileSelect, maxSize, accept]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleRemoveFile = useCallback(() => {
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.url);
    }
    setUploadedFile(null);
    setError("");
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [uploadedFile, onFileSelect]);

  const openFilePicker = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePreview = () => {
    if (uploadedFile) {
      window.open(uploadedFile.url, '_blank');
    } else if (currentFile) {
      window.open(currentFile, '_blank');
    }
  };

  const hasFile = uploadedFile || currentFile;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* File Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-105' 
            : hasFile 
              ? 'border-green-300 bg-green-50/50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFilePicker}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          multiple={multiple}
          disabled={disabled}
        />

        <div className="flex flex-col items-center space-y-3">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : hasFile ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-700">File uploaded successfully</p>
              <p className="text-xs text-muted-foreground">Click to change file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{placeholder}</p>
                <p className="text-xs text-muted-foreground">
                  Drag & drop or click to browse
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center"
            >
              <div className="text-center">
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-primary">Drop file here</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* File Preview */}
      {uploadedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <Card className="card-premium border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {(() => {
                    const IconComponent = getFileIcon(uploadedFile.type);
                    return <IconComponent className="w-5 h-5 text-primary" />;
                  })()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {uploadedFile.file.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {uploadedFile.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {uploadedFile.size}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview();
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Image Preview */}
              {uploadedFile.type === 'image' && (
                <div className="mt-3">
                  <img
                    src={uploadedFile.url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Current File Display (when no new file uploaded) */}
      {currentFile && !uploadedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <Card className="card-premium border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Current File
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentFile}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview();
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* File Type Info */}
      <div className="text-xs text-muted-foreground">
        <p>Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP</p>
        <p>Maximum file size: {maxSize}MB</p>
      </div>
    </div>
  );
} 