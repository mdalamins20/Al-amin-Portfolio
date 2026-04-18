import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import getCroppedImg from '../utils/cropImage';
import { Upload, X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Maximum file size of 5MB
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

interface Base64ImageCropperProps {
  userId: string;
  fieldToUpdate: string;             // Which field in Firestore to update (e.g., 'profilePicture')
  collectionName?: string;           // Custom collection name, defaults to 'users'
  cropShape?: 'rect' | 'round';      // Supports 'round' for avatars, 'rect' for covers
  aspectRatio?: number;              // E.g., 1 for square, 16/9 for covers
  buttonText?: string;
  onSuccess?: (base64Url: string) => void;
}

export const Base64ImageCropper: React.FC<Base64ImageCropperProps> = ({
  userId,
  fieldToUpdate,
  collectionName = 'users',
  cropShape = 'round',
  aspectRatio = 1,
  buttonText = 'Upload Image',
  onSuccess
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Trigger file input click
  const triggerFileSelect = () => {
    setError('');
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  // Convert selected file to base64 string
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError('File is too large. Maximum size is 5MB.');
        return;
      }

      setError('');
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsModalOpen(true);
      });
      reader.readAsDataURL(file);
      
      // Reset input so the same file could be selected again if cancelled
      e.target.value = '';
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels || !userId) return;
    
    setLoading(true);
    setError('');

    try {
      // 1. Get the compressed Base64 string from canvas utility
      // Max dimensions 800x800 to keep it safe for Firestore limits
      const croppedImageBase64 = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        800, 
        800
      );

      // 2. Save directly to Firestore Document
      const docRef = doc(db, collectionName, userId);
      await updateDoc(docRef, {
        [fieldToUpdate]: croppedImageBase64
      });

      // 3. Callback success & cleanup state
      if (onSuccess) onSuccess(croppedImageBase64);
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving image:', err);
      setError(`Failed to save image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setError('');
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <button
          onClick={triggerFileSelect}
          type="button"
          className="bg-brand hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors w-fit"
        >
          <Upload size={18} />
          {buttonText}
        </button>
        {error && !isModalOpen && <p className="text-red-500 text-sm mt-1">{error}</p>}
        
        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {/* Cropper Modal */}
      <AnimatePresence>
        {isModalOpen && imageSrc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-theme-card border border-theme-border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-theme-border flex items-center justify-between">
                <h3 className="text-lg font-bold text-theme-text">Crop Image</h3>
                <button 
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="p-1 rounded-full hover:bg-theme-bg text-theme-dim hover:text-theme-text transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cropper Area */}
              <div className="relative w-full h-[400px] bg-black/10">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  cropShape={cropShape}
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              {/* Controls & Validation Errors */}
              <div className="p-6 space-y-6">
                
                {/* Zoom Slider */}
                <div className="flex items-center gap-4">
                  <ZoomOut size={18} className="text-theme-dim" />
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-brand outline-none"
                    disabled={loading}
                  />
                  <ZoomIn size={18} className="text-theme-dim" />
                </div>

                {error && (
                  <p className="text-red-500 text-sm font-medium text-center">{error}</p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={handleCloseModal}
                    disabled={loading}
                    className="px-5 py-2 rounded-xl text-theme-dim hover:text-theme-text font-medium hover:bg-theme-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCroppedImage}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-700 text-white font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                    {loading ? 'Saving...' : 'Save & Upload'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Base64ImageCropper;
