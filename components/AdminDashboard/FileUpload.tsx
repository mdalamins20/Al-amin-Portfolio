import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';

interface FileUploadProps {
  label: string;
  initialValue?: string;
  onUploadComplete: (url: string) => void;
  folder: string;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  initialValue, 
  onUploadComplete, 
  folder,
  accept = ".pdf"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(initialValue || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        setIsUploading(true);
        try {
          const timestamp = Date.now();
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
          const storageRef = ref(storage, `${folder}/${timestamp}_${cleanFileName}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          setCurrentUrl(downloadURL);
          onUploadComplete(downloadURL);
        } catch (error) {
          console.error("Error uploading file:", error);
          alert("Failed to upload file. Please try again.");
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      }
    }
  };

  const handleRemove = () => {
    setCurrentUrl('');
    onUploadComplete('');
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-bold text-on-surface-variant">{label}</label>}
      
      <div className="relative">
        {currentUrl ? (
          <div className="flex items-center justify-between p-4 bg-surface border border-brand/30 rounded-2xl">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand shrink-0">
                <FileText size={20} />
              </div>
              <div className="truncate text-sm font-medium text-slate-700">
                <a href={currentUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                  View Current File
                </a>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              title="Remove File"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-24 border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50 group"
          >
            {isUploading ? (
              <Loader2 className="animate-spin text-brand" size={24} />
            ) : (
              <>
                <Upload size={24} className="text-slate-400 group-hover:text-brand transition-colors" />
                <span className="text-sm font-medium text-slate-500 group-hover:text-brand transition-colors">
                  Click to upload PDF
                </span>
              </>
            )}
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={accept}
          className="hidden"
        />
      </div>
    </div>
  );
};
