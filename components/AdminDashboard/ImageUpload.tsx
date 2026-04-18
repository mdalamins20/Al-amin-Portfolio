
import React, { useState, useRef } from 'react';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  initialValue?: string;
  label: string;
  folder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onUploadComplete, 
  initialValue, 
  label,
  folder = 'uploads'
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(initialValue || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    setUploading(true);
    setProgress(0);

    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        }, 
        (error) => {
          console.error("Upload error:", error);
          alert(`Upload failed: ${error.message}\nCode: ${error.code}`);
          setUploading(false);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setPreview(downloadURL);
          onUploadComplete(downloadURL);
          setUploading(false);
        }
      );
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
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
                className="p-2 bg-white text-black rounded-full hover:bg-brand hover:text-white transition-all"
                title="Change Image"
              >
                <Upload size={18} />
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="p-2 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all"
                title="Remove Image"
              >
                <X size={18} />
              </button>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4">
                <Loader2 className="animate-spin mb-2" size={24} />
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand h-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] mt-1 font-bold">{Math.round(progress)}%</span>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-theme-border rounded-xl flex flex-col items-center justify-center gap-3 text-theme-dim hover:border-brand hover:text-brand transition-all bg-theme-bg/50"
          >
            <div className="w-12 h-12 rounded-full bg-theme-bg flex items-center justify-center">
              <Upload size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">Click to upload image</p>
              <p className="text-[10px] opacity-60">PNG, JPG or SVG (Max 5MB)</p>
            </div>
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
      
      {preview && !uploading && (
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
          <CheckCircle2 size={12} />
          Image Ready
        </div>
      )}
    </div>
  );
};
