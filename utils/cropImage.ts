export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  maxWidth: number = 800,
  maxHeight: number = 800
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // To save space in Firestore (which has a 1MB document limit), 
  // we will scale the image down if it exceeds the maximum dimensions.
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;

  const scale = Math.min(maxWidth / targetWidth, maxHeight / targetHeight, 1);
  targetWidth *= scale;
  targetHeight *= scale;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // Return as Base64 WebP string with 0.8 quality
  // WebP supports transparency and provides better compression than JPEG.
  return canvas.toDataURL('image/webp', 0.8);
}
