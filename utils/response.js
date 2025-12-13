/**
 * Create standardized API response
 */
const createResponse = ({ 
  code = 200, 
  status = true, 
  message = '', 
  data = null, 
  error = null 
}) => {
  status = error ? false : status;
  return {
    code,
    status,
    message,
    data,
    error
  };
};

/**
 * Exclude fields from object
 */
const excludeFields = (data, fieldsToExclude) => {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !fieldsToExclude.includes(key))
  );
};

module.exports = {
  createResponse,
  excludeFields,
};

