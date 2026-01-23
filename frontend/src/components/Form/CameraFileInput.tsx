import React, { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface CameraFileInputProps {
  label: string;
  name: string;
  required?: boolean;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  labelColor: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
}

const CameraFileInput: React.FC<CameraFileInputProps> = ({
  label,
  name,
  required = false,
  accept = '.jpg,.jpeg,.png',
  value,
  onChange,
  labelColor,
  borderColor,
  backgroundColor,
  textColor,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="mb-4">
      <label className="block font-medium mb-2" style={{ color: labelColor }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {!value ? (
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            name={`${name}_camera`}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 border rounded px-4 py-3 hover:opacity-80 transition-all"
            style={{ borderColor, backgroundColor, color: textColor }}
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm">Upload File</span>
          </button>
          
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 border rounded px-4 py-3 hover:opacity-80 transition-all"
            style={{ borderColor, backgroundColor, color: textColor }}
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm">Take Photo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {preview && (
            <div className="relative w-full h-48 border rounded overflow-hidden" style={{ borderColor }}>
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center justify-between p-3 border rounded" style={{ borderColor, backgroundColor }}>
            <span className="text-sm truncate flex-1" style={{ color: textColor }}>
              {value.name}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraFileInput;
