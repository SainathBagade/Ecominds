import React from 'react';
import { X } from 'lucide-react';

const ImagePreview = ({ src, alt, onClose }) => {
    if (!src) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={32} />
            </button>
            <img
                src={src}
                alt={alt || 'Preview'}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

export default ImagePreview;
