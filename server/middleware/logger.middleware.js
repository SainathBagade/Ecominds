/**
 * Logger Middleware
 * Logs all HTTP requests and responses
 */

const { formatDate } = require('../utils/helpers/dateHelper');

/**
 * Request logger middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  console.log(`📥 [${formatDate(new Date(), 'time')}] ${req.method} ${req.originalUrl}`);

  // Log request body for POST/PUT/PATCH (exclude passwords)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    console.log('   Body:', JSON.stringify(sanitizedBody));
  }

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? '🔴' : 
                       res.statusCode >= 400 ? '🟡' : 
                       res.statusCode >= 300 ? '🔵' : '🟢';
    
    console.log(`📤 [${formatDate(new Date(), 'time')}] ${statusColor} ${res.statusCode} ${req.method} ${req.originalUrl} - ${duration}ms`);
  });

  next();
};

/**
 * Detailed API logger (for development)
 */
const detailedLogger = (req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    return next();
  }

  console.log('\n==================== API Request ====================');
  console.log('Timestamp:', formatDate(new Date(), 'full'));
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('IP:', req.ip);
  console.log('User Agent:', req.get('user-agent'));
  
  if (req.user) {
    console.log('User:', req.user.name, `(${req.user.email})`);
  }
  
  if (req.params && Object.keys(req.params).length > 0) {
    console.log('Params:', req.params);
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('Query:', req.query);
  }
  
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    console.log('Body:', sanitizedBody);
  }
  
  console.log('=====================================================\n');

  next();
};

/**
 * Performance monitor
 */
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to ms

    if (duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
    }
  });

  next();
};

/**
 * Error logger
 */
const errorLogger = (err, req, res, next) => {
  console.error('\n==================== Error ====================');
  console.error('Timestamp:', formatDate(new Date(), 'full'));
  console.error('Method:', req.method);
  console.error('URL:', req.originalUrl);
  console.error('Error:', err.message);
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  
  console.error('==============================================\n');

  next(err);
};

module.exports = {
  requestLogger,
  detailedLogger,
  performanceMonitor,
  errorLogger,
};