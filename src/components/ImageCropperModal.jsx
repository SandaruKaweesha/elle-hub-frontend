import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { X, Upload, Check, Loader2 } from 'lucide-react';
import getCroppedImg from '../utils/cropImage';

export default function ImageCropperModal({ isOpen, onClose, onSave }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg") {
        alert("Please select a valid image file (PNG or JPEG).");
        return;
      }
      
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const showSaveCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      
      // Get the cropped image blob URL
      const croppedImageBlobUrl = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        0
      );
      
      // Convert Blob URL to base64 for easy localStorage saving
      const response = await fetch(croppedImageBlobUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64data = reader.result;
        onSave(base64data);
        setIsProcessing(false);
        handleClose();
      };
      
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#111111]">Update Profile Photo</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {!imageSrc ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#e5e5e5] rounded-xl bg-[#f8f7f4]">
            <div className="w-16 h-16 bg-[#eaf1ec] rounded-full flex items-center justify-center text-[#08733e] mb-4">
              <Upload size={24} />
            </div>
            <h3 className="font-semibold text-[#111111] mb-2">Upload a Photo</h3>
            <p className="text-sm text-gray-500 mb-6 px-8 text-center">PNG or JPG files only. Maximum file size 2MB.</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#08733e] hover:bg-[#065b31] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              Browse Files
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/png, image/jpeg" 
              className="hidden" 
            />
          </div>
        ) : (
          <div className="flex flex-col h-[400px]">
            <div className="relative flex-1 bg-[#111111] rounded-xl overflow-hidden mb-4">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="mb-4 px-2">
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Zoom Adjust</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => {
                  setZoom(e.target.value)
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#08733e]"
              />
            </div>

            <div className="flex gap-3 mt-auto">
              <button 
                onClick={() => setImageSrc(null)}
                className="flex-1 py-3 px-4 bg-white border border-[#e5e5e5] rounded-xl text-sm font-bold text-[#333333] hover:bg-gray-50 transition-colors"
              >
                Choose Another
              </button>
              <button 
                onClick={showSaveCroppedImage}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-[#08733e] hover:bg-[#065b31] text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {isProcessing ? 'Processing...' : 'Save Photo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
