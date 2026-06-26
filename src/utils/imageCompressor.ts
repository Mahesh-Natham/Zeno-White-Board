export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Only compress images that we can draw to a canvas (JPEG, PNG, WebP)
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      return resolve(file);
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1080;
      
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        if (width / height > MAX_WIDTH / MAX_HEIGHT) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        } else {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Preserve PNG, compress others as JPEG
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      
      canvas.toBlob((blob) => {
        if (!blob) return resolve(file);
        const compressedFile = new File([blob], file.name, {
          type: outputType,
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      }, outputType, 0.8);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(file);
    };
  });
};
