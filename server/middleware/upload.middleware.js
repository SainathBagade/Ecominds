/**
 * File Upload Middleware
 * Handles file uploads with validation
 * Note: Requires 'multer' package - run: npm install multer
 */

const multer = require('multer');
const path = require('path');
const { BadRequestError } = require('../utils/helpers/errorHandler');

// File storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload folder based on file type
    let uploadPath = 'uploads/';

    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'thumbnail') {
      uploadPath += 'thumbnails/';
    } else if (file.fieldname === 'video') {
      uploadPath += 'videos/';
    } else if (file.fieldname === 'document') {
      uploadPath += 'documents/';
    } else if (file.fieldname === 'proof') {
      uploadPath += 'proofs/';
    } else {
      uploadPath += 'other/';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new BadRequestError(`Only ${allowedTypes.join(', ')} files are allowed`), false);
    }
  };
};

// Base upload configuration
const baseUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB default
  },
});

/**
 * Image upload (avatars, thumbnails)
 */
const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter(['.jpg', '.jpeg', '.png', '.gif', '.webp']),
});

/**
 * Video upload
 */
const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: fileFilter(['.mp4', '.avi', '.mov', '.wmv', '.webm']),
});

/**
 * Document upload (PDF, Word, etc.)
 */
const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter(['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.xls', '.xlsx']),
});

/**
 * Multiple files upload
 */
const uploadMultiple = (fieldName, maxCount = 5) => {
  return baseUpload.array(fieldName, maxCount);
};

/**
 * Mixed files upload (different field names)
 */
const uploadMixed = (fields) => {
  return baseUpload.fields(fields);
};

/**
 * Validate uploaded file middleware
 */
const validateUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    throw new BadRequestError('Please upload a file');
  }
  next();
};

/**
 * Process uploaded image (resize, optimize, etc.)
 * Placeholder - requires image processing library like 'sharp'
 */
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // TODO: Add image processing logic
  // Example: resize, compress, generate thumbnails
  // const sharp = require('sharp');
  // await sharp(req.file.path).resize(300, 300).toFile(outputPath);

  next();
};

/**
 * Clean up uploaded files on error
 */
const cleanupUpload = (err, req, res, next) => {
  if (req.file) {
    // TODO: Delete uploaded file
    // fs.unlinkSync(req.file.path);
  }

  if (req.files) {
    // TODO: Delete all uploaded files
    // req.files.forEach(file => fs.unlinkSync(file.path));
  }

  next(err);
};

/**
 * Get file info middleware
 */
const getFileInfo = (req, res, next) => {
  if (req.file) {
    req.fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
    };
  }
  next();
};

/**
 * Avatar upload (single image)
 */
const uploadAvatar = uploadImage.single('avatar');

/**
 * Thumbnail upload (single image)
 */
const uploadThumbnail = uploadImage.single('thumbnail');

/**
 * Video upload (single video)
 */
const uploadSingleVideo = uploadVideo.single('video');

/**
 * Document upload (single document)
 */
const uploadSingleDocument = uploadDocument.single('document');

/**
 * Multiple images upload
 */
const uploadMultipleImages = (maxCount = 5) => {
  return uploadImage.array('images', maxCount);
};

/**
 * Lesson content upload (mixed: video, documents, images)
 */
const uploadLessonContent = uploadMixed([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
  { name: 'images', maxCount: 10 },
]);

module.exports = {
  uploadImage,
  uploadVideo,
  uploadDocument,
  uploadMultiple,
  uploadMixed,
  uploadAvatar,
  uploadThumbnail,
  uploadSingleVideo,
  uploadSingleDocument,
  uploadMultipleImages,
  uploadLessonContent,
  validateUpload,
  processImage,
  cleanupUpload,
  getFileInfo,
};