/**
 * Image upload utilities for handling file uploads and conversions
 */

export interface ImageUploadResult {
  success: boolean;
  data?: string; // base64 encoded image
  error?: string;
}

/**
 * Convert a File to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
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

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 5MB' };
  }

  // Check image dimensions (optional - can be implemented later)
  return { valid: true };
};

/**
 * Handle image upload with validation and conversion
 */
export const handleImageUpload = async (file: File): Promise<ImageUploadResult> => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Convert to base64
    const base64 = await fileToBase64(file);
    
    return { success: true, data: base64 };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload image' 
    };
  }
};

/**
 * Create a preview URL for uploaded image
 */
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Clean up preview URL
 */
export const cleanupImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Get image dimensions
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = createImagePreview(file);
    
    img.onload = () => {
      cleanupImagePreview(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      cleanupImagePreview(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}; 