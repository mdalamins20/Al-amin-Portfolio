import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle2, Loader2, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { ConfirmationModal } from './ConfirmationModal';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  initialValue?: string;
  label: string;
  folder?: string;
  cropShape?: 'rect' | 'round';
  aspectRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onUploadComplete, 
  initialValue, 
  label,
  folder = 'uploads',
  cropShape = 'rect',
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.7
}) => {
  const [preview, setPreview] = useState(initialValue || '');
  const [processing, setProcessing] = useState(false);

  // Update preview when initialValue changes from outside
  useEffect(() => {
    setPreview(initialValue || '');
  }, [initialValue]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'success' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const processImage = async (file: File): Promise<string> => {
    try {
      // Step 1: Compress the image aggressively to meet the target ~200KB limit
      const options = {
        maxSizeMB: 0.2, // Compress down to 200KB
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        fileType: 'image/webp'
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // Step 2: Read the compressed file and handle round crop if needed
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = (event) => {
          if (cropShape === 'round') {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const size = Math.min(img.width, img.height);
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
                resolve(canvas.toDataURL('image/webp', quality));
              } else {
                resolve(event.target?.result as string);
              }
            };
            img.onerror = (error) => reject(error);
          } else {
            // Rectangular is already compressed and sized properly by the library
            resolve(event.target?.result as string);
          }
        };
        reader.onerror = (error) => reject(error);
      });
    } catch (error) {
      console.error('Compression error:', error);
      throw error;
    }
  };



  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setModalConfig({
        isOpen: true,
        title: 'File Too Large',
        message: 'The selected file is too large. Maximum size allowed is 5MB.',
        type: 'danger'
      });
      return;
    }

    setProcessing(true);
    try {
      // 1. Process and compress the image to base64
      const base64Url = await processImage(file);
      
      // 2. We will store base64 directly and serve it via Edge Functions to bypass CORS and API limits
      setPreview(base64Url);
      onUploadComplete(base64Url);
    } catch (err: any) {
      console.error('Error processing or uploading image:', err);
      setModalConfig({
        isOpen: true,
        title: 'Upload Error',
        message: err.message || 'Failed to upload image. Please try another file.',
        type: 'danger'
      });
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
                  className="w-10 h-10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full flex items-center justify-center hover:bg-brand hover:text-white dark:hover:bg-brand dark:hover:text-white hover:scale-110 shadow-lg transition-all"
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

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};
