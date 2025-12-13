const prisma = require('../config/prisma');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send verification email
 */
const verificationEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let code = Math.floor(10000 + Math.random() * 90000).toString();

    await prisma.user.update({
      where: { email },
      data: { code: code }
    });

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?code=${code}&email=${email}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - THE KOREAN STORE',
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Email Verification - THE KOREAN STOP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            max-width: 500px;
            background-color: #ffffff;
            margin: 20px auto;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .logo {
            width: 150px;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            background-color: #ff4d4d;
            color: #ffffff;
            padding: 12px 20px;
            font-size: 16px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
        }
        .button:hover {
            background-color: #e63939;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://i.imgur.com/wPuh030.png" alt="THE KOREAN STOP" class="logo">
        <h2>Welcome to THE KOREAN STOP!</h2>
        <p>Thank you for signing up! We're excited to have you with us. To complete your registration, please verify your email address by clicking the button below.</p>
        <a href="${verificationLink}" class="button">Verify Email</a>
        <p>If you didn't sign up for THE KOREAN STOP, you can safely ignore this email.</p>
        <div class="footer">
            <p>&copy; 2025 THE KOREAN STOP. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    });

    return { message: 'Verification email sent' };
  } catch (error) {
    console.error(error);
    throw new Error('Internal server error');
  }
};

module.exports = {
  verificationEmail,
};

