
/**
 * Utility for resizing images to specified dimensions while maintaining aspect ratio
 */

const MAX_HEIGHT = 900;

/**
 * Resizes an image to a maximum height while maintaining aspect ratio
 * @param file The image file to resize
 * @returns A Promise resolving to a resized Blob with the same MIME type
 */
export const resizeImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // If not an image, return the original file
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      // Release object URL
      URL.revokeObjectURL(url);
      
      // Only resize if the image is taller than MAX_HEIGHT
      if (img.height <= MAX_HEIGHT) {
        resolve(file);
        return;
      }

      // Calculate new width to maintain aspect ratio
      const ratio = MAX_HEIGHT / img.height;
      const newWidth = img.width * ratio;
      
      // Create canvas to resize image
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = MAX_HEIGHT;
      
      // Draw resized image to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fallback if canvas context isn't available
        return;
      }
      
      ctx.drawImage(img, 0, 0, newWidth, MAX_HEIGHT);
      
      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file); // Fallback if blob conversion fails
          }
        },
        file.type, // Keep the original file type
        0.9 // Quality parameter for JPEG compression
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fallback if image loading fails
    };
    
    img.src = url;
  });
};
