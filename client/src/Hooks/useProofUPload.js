import { useState } from 'react';
import toast from 'react-hot-toast';
import { FILE_SIZE_LIMIT, ALLOWED_IMAGE_TYPES } from '@utils/constants';

export const useProofUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    // Check if file exists
    if (!file) {
      setError('Please select a file');
      return false;
    }

    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, JPG, WEBP)');
      toast.error('Invalid file type');
      return false;
    }

    // Check file size
    if (file.size > FILE_SIZE_LIMIT) {
      setError('File size must be less than 5MB');
      toast.error('File too large. Maximum size is 5MB');
      return false;
    }

    setError(null);
    return true;
  };

  const selectFile = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const uploadFile = async (uploadFunction) => {
    if (!file) {
      toast.error('No file selected');
      return null;
    }

    setUploading(true);
    try {
      const result = await uploadFunction(file);
      toast.success('Image uploaded successfully!');
      clearFile();
      return result;
    } catch (err) {
      toast.error('Failed to upload image');
      console.error('Upload error:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if needed
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              }));
            },
            file.type,
            quality
          );
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return {
    file,
    preview,
    uploading,
    error,
    selectFile,
    clearFile,
    uploadFile,
    compressImage,
    validateFile,
  };
};