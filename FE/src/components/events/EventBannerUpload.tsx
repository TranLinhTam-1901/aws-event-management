import React, { useRef } from 'react';
import { AppButton } from '../common/AppButton';

interface Props {
  previewUrl: string;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

export const EventBannerUpload: React.FC<Props> = ({
  previewUrl,
  onFileSelect,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Only JPG, PNG, or WEBP images are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Image size must not exceed ${MAX_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }

    onFileSelect(file);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Banner preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          {!disabled && (
            <div className="flex gap-2 mt-2">
              <AppButton
                type="button"
                variant="secondary"
                onClick={handleChooseFile}
              >
                Choose Another Image
              </AppButton>
              <AppButton
                type="button"
                variant="secondary"
                onClick={handleRemove}
              >
                Remove Image
              </AppButton>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Select a banner image from your computer</p>
          <p className="text-gray-400 text-sm mb-4">
            JPG, PNG, WEBP — max {MAX_SIZE_MB}MB
          </p>
          <AppButton
            type="button"
            variant="secondary"
            onClick={handleChooseFile}
            disabled={disabled}
          >
            Choose File
          </AppButton>
        </div>
      )}
    </div>
  );
};
