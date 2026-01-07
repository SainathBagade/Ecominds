/**
 * Cloudinary Configuration
 * Setup for image upload service
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Verify Cloudinary configuration
 */
const verifyConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();

  if (!cloud_name || !api_key || !api_secret) {
    console.warn('⚠️ Cloudinary is not properly configured. Please check your environment variables.');
    return false;
  }

  console.log('✅ Cloudinary configured successfully');
  return true;
};

// Verify on import
verifyConfig();

module.exports = cloudinary;