import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileImage } from 'lucide-react';

const ImageUploader = ({ 
  onUpload,
  maxSize = 5 * 1024 * 1024,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  multiple = false
}) => {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid format. Accepted: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }

    if (file.size > maxSize) {
      return `File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(2)}MB`;
    }

    return null;
  };

  const handleFileSelect = (files) => {
    setError('');
    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result,
          name: file.name,
          size: file.size,
          status: 'success'
        };

        setImages(prev => multiple ? [...prev, newImage] : [newImage]);
        
        if (onUpload) {
          onUpload(newImage);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Image Uploader</h2>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <Upload 
          className={`mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} 
          size={48} 
        />
        <p className="text-lg font-semibold text-gray-700 mb-2">
          Drop your images here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Supports: JPG, PNG, GIF, WebP (Max {(maxSize / 1024 / 1024).toFixed(0)}MB)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Uploaded Images ({images.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((imageData) => (
              <div
                key={imageData.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={imageData.preview}
                    alt={imageData.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(imageData.id);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white rounded-full px-3 py-1 flex items-center gap-1 text-xs font-semibold">
                    <CheckCircle size={14} />
                    Uploaded
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-gray-800 truncate mb-1">
                    {imageData.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(imageData.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && !error && (
        <div className="mt-6 text-center py-8">
          <FileImage className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">No images uploaded yet</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              alert(`Uploading ${images.length} image(s)...`);
              console.log('Images to upload:', images);
            }}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Upload {images.length} Image{images.length > 1 ? 's' : ''}
          </button>
          <button
            onClick={() => {
              setImages([]);
              setError('');
            }}
            className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> You can drag and drop multiple images at once. 
          Images are validated for format and size before upload.
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;