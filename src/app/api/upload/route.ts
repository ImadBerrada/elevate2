import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadType = formData.get('type') as string || 'retreats';
    
    // Handle both single file and multiple files
    let files: File[] = [];
    const singleFile = formData.get('file') as File;
    const multipleFiles = formData.getAll('files') as File[];
    
    if (singleFile) {
      files = [singleFile];
    } else if (multipleFiles && multipleFiles.length > 0) {
      files = multipleFiles;
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    // Create uploads directory based on type
    const uploadsDir = join(process.cwd(), 'public', 'uploads', uploadType);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `${file.name} is not an image file` },
          { status: 400 }
        );
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `${file.name} is too large. Maximum size is 10MB` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}-${randomString}.${extension}`;

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      // Return the public URL
      const publicUrl = `/uploads/${uploadType}/${filename}`;
      uploadedFiles.push(publicUrl);
    }

    // Return appropriate response based on upload type
    if (uploadedFiles.length === 1) {
      return NextResponse.json({
        message: 'File uploaded successfully',
        filePath: uploadedFiles[0],
        files: uploadedFiles
      });
    } else {
      return NextResponse.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles
      });
    }

  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 