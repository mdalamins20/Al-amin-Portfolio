import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, Loader2, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  initialValue?: string;
  label: string;
  folder?: string;
  cropShape?: 'rect' | 'round';
  aspectRatio?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onUploadComplete, 
  initialValue, 
  label,
  cropShape = 'rect'
}) => {
  const [preview, setPreview] = useState(initialValue || '');
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Auto scale down to prevent Firestore 1MB document limit error, 
          // while preserving the original aspect ratio exactly as you uploaded.
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          if (cropShape === 'round') {
             // For round crop, make canvas square
             const size = Math.min(width, height);
             canvas.width = size;
             canvas.height = size;
             const ctx = canvas.getContext('2d');
             if(ctx){
                ctx.drawImage(img, (width - size) / 2, (height - size) / 2, size, size, 0, 0, size, size);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
             } else {
                resolve(event.target?.result as string);
             }
          } else {
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              // Compress to base64 JPEG
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              resolve(dataUrl);
            } else {
              resolve(event.target?.result as string);
            }
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    setProcessing(true);
    try {
      const base64Url = await processImage(file);
      setPreview(base64Url);
      onUploadComplete(base64Url);
    } catch (err) {
      console.error('Error processing image:', err);
      alert('Failed to process image');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setPreview('');
    onUploadComplete('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isRound = cropShape === 'round';

  return (
    <div className="space-y-3 w-full">
      {label && <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">{label}</label>}
      
      <div className={`relative group mx-auto ${isRound ? 'w-48 h-48' : 'w-full h-48 md:h-56'}`}>
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full h-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 overflow-hidden group shadow-sm ${isRound ? 'rounded-full aspect-square' : 'rounded-3xl'}`}
            >
              <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center hover:bg-brand hover:text-white hover:scale-110 shadow-lg transition-all"
                  title="Change Image"
                >
                  <Upload size={18} />
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-110 shadow-lg transition-all"
                  title="Remove Image"
                >
                  <X size={18} />
                </button>
              </div>
              
              {processing && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <Loader2 className="animate-spin text-brand" size={32} />
                  <span className="text-xs font-bold mt-2 tracking-widest uppercase">Processing</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.button
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className={`w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 hover:border-brand dark:hover:border-brand dark:hover:bg-slate-800/80 flex flex-col items-center justify-center gap-3 text-slate-500 transition-all shadow-sm ${isRound ? 'rounded-full aspect-square' : 'rounded-3xl'}`}
            >
              {processing ? (
                 <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-brand mb-2" size={32} />
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Processing</span>
                 </div>
              ) : (
                <>
                  <div className={`w-14 h-14 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-brand ${isRound ? 'rounded-full' : 'rounded-2xl'}`}>
                    <ImagePlus size={24} />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Choose Image</p>
                    {isRound && <p className="text-xs mt-1 opacity-70">Will be cropped square</p>}
                  </div>
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      {preview && !processing && (
        <div className={`flex items-center gap-1.5 text-xs text-emerald-500 font-bold uppercase tracking-wider ${isRound ? 'justify-center' : ''} mt-2`}>
          <CheckCircle2 size={14} />
          <span>Uploaded</span>
        </div>
      )}
    </div>
  );
};
