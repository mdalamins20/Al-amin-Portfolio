import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, Loader2 } from 'lucide-react';

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
  label
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

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-theme-text">{label}</label>
      
      <div className="relative group">
        {preview ? (
          <div className="relative w-full h-40 bg-theme-bg rounded-xl overflow-hidden border border-theme-border group">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white text-black rounded-full hover:bg-brand hover:text-white transition-all shadow-lg"
                title="Change Image"
              >
                <Upload size={18} />
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="p-2 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-lg"
                title="Remove Image"
              >
                <X size={18} />
              </button>
            </div>
            {processing && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4">
                <Loader2 className="animate-spin" size={24} />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="w-full h-40 border-2 border-dashed border-theme-border rounded-xl flex flex-col items-center justify-center gap-3 text-theme-dim hover:border-brand hover:text-brand transition-all bg-theme-bg/50"
          >
            {processing ? (
              <Loader2 className="animate-spin text-brand" size={32} />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-theme-bg flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">Click to select image</p>
                  <p className="text-[10px] opacity-60">PNG, JPG (Max 5MB)</p>
                </div>
              </>
            )}
          </button>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      {preview && !processing && (
        <div className="flex items-center gap-1.5 text-[10px] text-brand font-bold uppercase tracking-wider">
          <CheckCircle2 size={12} />
          Image Ready
        </div>
      )}
    </div>
  );
};
