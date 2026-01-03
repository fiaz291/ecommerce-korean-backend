const { createResponse } = require('../utils/response');
const {verificationEmail} = require('../utils/email');

/**
 * Send Email
 * POST /api/email
 */
const sendEmail = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(
      createResponse({ error: 'Email is required', status: false })
    );
  }

  try {
    verificationEmail(email);

    return res.status(200).json(
      createResponse({ message: 'Verification email sent', status: true })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ error: 'Internal server error', status: false })
    );
  }
};

module.exports = {
  sendEmail,
};

