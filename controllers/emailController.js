const { createResponse } = require('../utils/response');
const {verificationEmail} = require('../utils/email');

/**
 * Send Email
 * POST /api/email
 */
const sendEmail = async (req, res, next) => {
  const { email } = req.body;
verificationEmail(email);
  // if (!email) {
  //   return res.status(400).json(
  //     createResponse({ error: 'Email is required', status: false })
  //   );
  // }

  // try {
  //   const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email`;
  //   await transporter.sendMail({
  //     from: process.env.EMAIL_USER,
  //     to: email,
  //     subject: 'Verify your email',
  //     html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
  //   });

  //   return res.status(200).json(
  //     createResponse({ message: 'Verification email sent', status: true })
  //   );
  // } catch (error) {
  //   console.error(error);
  //   return res.status(500).json(
  //     createResponse({ error: 'Internal server error', status: false })
  //   );
  // }
};

module.exports = {
  sendEmail,
};

