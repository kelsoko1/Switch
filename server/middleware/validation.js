/**
 * Middleware to validate required fields in the request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Function} Express middleware function
 */
const validateRequest = (requiredFields = []) => {
  return (req, res, next) => {
    const missingFields = [];
    
    // Check for missing required fields
    requiredFields.forEach(field => {
      if (!(field in req.body)) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Middleware to validate phone number format
 * @param {string} field - Field name containing the phone number
 * @returns {Function} Express middleware function
 */
const validatePhoneNumber = (field = 'phoneNumber') => {
  return (req, res, next) => {
    const phoneNumber = req.body[field];
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: `Missing required field: ${field}`
      });
    }
    
    // Simple phone number validation (adjust regex as needed)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Please use E.164 format (e.g., +255123456789)'
      });
    }
    
    next();
  };
};

/**
 * Middleware to validate amount is a positive number
 * @param {string} field - Field name containing the amount
 * @returns {Function} Express middleware function
 */
const validateAmount = (field = 'amount') => {
  return (req, res, next) => {
    const amount = parseFloat(req.body[field]);
    
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${field}. Must be a positive number`
      });
    }
    
    // Replace the original string value with parsed number
    req.body[field] = amount;
    next();
  };
};

module.exports = {
  validateRequest,
  validatePhoneNumber,
  validateAmount
};
