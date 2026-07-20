const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Max dimensions for optimization
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to WebP at 70% quality (reduces size dramatically)
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          }, 'image/webp', 0.7);
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file); // Fallback
    };
    reader.onerror = () => resolve(file); // Fallback
  });
};

export const uploadImageToCloud = async (imageFile: File): Promise<string> => {
  if (!imageFile) return '';
  
  // Compress image before uploading
  const compressedFile = await compressImage(imageFile);

  const formData = new FormData();
  formData.append('image', compressedFile);

  try {
    const IMGUR_CLIENT_ID = import.meta.env.VITE_IMGUR_CLIENT_ID || '30bb1c0ba09bb99'; 

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.link; // এটি হলো লাইভ ছবির লিংক
    } else {
      throw new Error(data.data?.error || 'Imgur Upload failed');
    }
  } catch (error) {
    console.warn("Imgur upload failed. Falling back to local Base64.");
    
    // Fallback: Convert the already compressed file to Base64 to save in Firebase
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = () => reject(new Error('File reading failed'));
    });
  }
};
