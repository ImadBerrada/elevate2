"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TestFileUploadPage() {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string>("");

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">File Upload Component Test</h1>
        <p className="text-muted-foreground">
          Testing the new FileUpload component with different file types and configurations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receipt Upload */}
        <Card className="card-premium border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Receipt Upload</span>
              <Badge variant="outline">Expense Receipts</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={(file, url) => {
                setReceiptFile(file);
                setReceiptUrl(url || "");
              }}
              currentFile={receiptUrl}
              placeholder="Upload receipt (PDF, DOC, or Image)"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
              maxSize={10}
            />
            {receiptFile && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">File Selected:</p>
                <p className="text-sm text-green-700">{receiptFile.name}</p>
                <p className="text-xs text-green-600">
                  Size: {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card className="card-premium border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Image Upload</span>
              <Badge variant="outline">Game Images</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={(file, url) => {
                setImageFile(file);
                setImageUrl(url || "");
              }}
              currentFile={imageUrl}
              placeholder="Upload game image (JPG, PNG, GIF, WEBP)"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              maxSize={5}
            />
            {imageFile && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Image Selected:</p>
                <p className="text-sm text-blue-700">{imageFile.name}</p>
                <p className="text-xs text-blue-600">
                  Size: {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card className="card-premium border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Document Upload</span>
              <Badge variant="outline">Driver Documents</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={(file, url) => {
                setDocumentFile(file);
                setDocumentUrl(url || "");
              }}
              currentFile={documentUrl}
              placeholder="Upload license or registration"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSize={15}
            />
            {documentFile && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-800">Document Selected:</p>
                <p className="text-sm text-purple-700">{documentFile.name}</p>
                <p className="text-xs text-purple-600">
                  Size: {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card className="card-premium border-0">
        <CardHeader>
          <CardTitle>FileUpload Component Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">✅ Drag & Drop Support</h4>
              <p className="text-sm text-muted-foreground">
                Users can drag files directly onto the upload area
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">📁 Multiple File Types</h4>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOC, DOCX, JPG, PNG, GIF, WEBP
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-700">🔍 File Preview</h4>
              <p className="text-sm text-muted-foreground">
                Image preview and file information display
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-700">⚡ Size Validation</h4>
              <p className="text-sm text-muted-foreground">
                Configurable maximum file size limits
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-red-700">🛡️ Type Validation</h4>
              <p className="text-sm text-muted-foreground">
                Validates file types against allowed extensions
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-indigo-700">🎨 Modern UI</h4>
              <p className="text-sm text-muted-foreground">
                Consistent with MARAH platform design
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <Card className="card-premium border-0">
        <CardHeader>
          <CardTitle>Implementation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">✅ AddExpenseModal</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Receipt Upload
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">✅ AddGameModal</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Game Image Upload
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">✅ AddDriverModal</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                License & Registration
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">✅ AddPaymentModal</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Payment Receipt
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 