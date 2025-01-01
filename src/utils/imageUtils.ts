export const resizeImage = async (file: File, maxDimension: number = 900): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Impossible de créer le contexte 2D"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Échec de la conversion en Blob"));
          }
        },
        file.type,
        0.9
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Erreur lors du chargement de l'image"));
    };
  });
};

export const processImage = async (file: File): Promise<File> => {
  try {
    const resizedBlob = await resizeImage(file);
    return new File([resizedBlob], file.name, {
      type: file.type,
      lastModified: file.lastModified,
    });
  } catch (error) {
    console.error("Erreur lors du redimensionnement:", error);
    return file;
  }
};