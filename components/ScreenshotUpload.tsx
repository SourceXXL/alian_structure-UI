'use client';

import React, { useState, useRef } from 'react';

interface ScreenshotUploadProps {
  onScreenshotsChange: (screenshots: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export const ScreenshotUpload: React.FC<ScreenshotUploadProps> = ({
  onScreenshotsChange,
  maxFiles = 5,
  maxSize = 10
}) => {
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList): string[] => {
    const errors: string[] = [];
    
    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image file`);
      }
      
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name} exceeds ${maxSize}MB limit`);
      }
    });

    return errors;
  };

  const handleFiles = (files: FileList) => {
    const errors = validateFiles(files);
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setError('');
    const newScreenshots = [...screenshots, ...Array.from(files)];
    setScreenshots(newScreenshots);
    onScreenshotsChange(newScreenshots);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newScreenshots = screenshots.filter((_, i) => i !== index);
    setScreenshots(newScreenshots);
    onScreenshotsChange(newScreenshots);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-cosmic-blue bg-cosmic-blue/10'
            : 'border-cosmic-purple/50 hover:border-cosmic-purple hover:bg-cosmic-purple/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-cosmic-purple/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-cosmic-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-white mb-2">
              Drop screenshots here or click to browse
            </p>
            <p className="text-sm text-gray-400">
              PNG, JPG, GIF up to {maxSize}MB each (max {maxFiles} files)
            </p>
          </div>
          
          <button
            type="button"
            onClick={openFileDialog}
            className="px-4 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 text-white rounded-lg transition-colors"
          >
            Select Files
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {screenshots.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">
            Screenshots ({screenshots.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenshots.map((file, index) => (
              <div
                key={index}
                className="relative group bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg overflow-hidden"
              >
                <div className="aspect-video relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-400 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotUpload;
