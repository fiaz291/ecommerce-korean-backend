const prisma = require('../config/prisma');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

// Configure AWS SES Client
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials:  {
    accessKeyId: process.env.AWS_PUBLIC_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
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
    const emailParams = {
      Source: process.env.AWS_SES_FROM_EMAIL, // Must be a verified email in AWS SES
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Verify Your Email - THE KOREAN STORE',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `<!DOCTYPE html>
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
            Charset: 'UTF-8',
          },
        },
      },
    };
    console.log('Email params prepared:',emailParams);

    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);

    return { message: 'Verification email sent' };
  } catch (error) {
    console.error(error);
    throw new Error('Internal server error');
  }
};

/**
 * Send forgot password email
 */
const forgotPasswordEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate reset code
    let resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store reset code in database
    await prisma.user.update({
      where: { email },
      data: { code: resetCode }
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?code=${resetCode}&email=${email}`;
    
    const emailParams = {
      Source: process.env.AWS_SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Reset Your Password - THE KOREAN STORE',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Reset - THE KOREAN STOP</title>
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
        .code-box {
            background-color: #f9f9f9;
            border: 2px dashed #ff4d4d;
            padding: 15px;
            margin: 20px 0;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 3px;
            color: #333;
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
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password for THE KOREAN STOP account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" class="button">Reset Password</a>
        <p style="margin-top: 20px;">Or use this verification code:</p>
        <div class="code-box">${resetCode}</div>
        <p style="font-size: 14px; color: #666;">This code will expire in 1 hour.</p>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <div class="footer">
            <p>&copy; 2025 THE KOREAN STOP. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);

    return { message: 'Password reset email sent' };
  } catch (error) {
    console.error(error);
    throw new Error('Internal server error');
  }
};

module.exports = {
  verificationEmail,
  forgotPasswordEmail,
};


