const prisma = require('../config/prisma');
const { createResponse, excludeFields } = require('../utils/response');
const { getToken } = require('../utils/auth');
const bcrypt = require('bcrypt');
const { verificationEmail, forgotPasswordEmail } = require('../utils/email');

/**
 * User Login
 * POST /api/user/login
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(
      createResponse({ error: 'Email and password are required', status: false })
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json(
        createResponse({ error: 'Invalid email or password', status: false })
      );
    }

    if (!user.isVerified) {
      return res.status(401).json(
        createResponse({ error: 'Email is not verified', status: false })
      );
    }

    const inputToHash = `${password}${email.length.toString()}`;
    const isMatch = await bcrypt.compare(inputToHash, user.password);
    
    if (!isMatch) {
      return res.status(401).json(
        createResponse({ error: 'Invalid email or password', status: false })
      );
    }

    const token = await getToken(user);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { token },
    });
    
    delete user.password;
    return res.status(200).json(
      createResponse({ data: { ...user, token }, status: true })
    );
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        createResponse({ error: 'Token has expired', status: false })
      );
    }
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * User Signup
 * POST /api/user/signup
 */
const signup = async (req, res, next) => {
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    socialToken,
    phoneNumber,
    address,
    city,
    state,
    zipCode,
    country = 'PK',
    dateOfBirth,
  } = req.body;

  const requiredFields = { email, password, firstName, lastName };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json(
        createResponse({ error: `${field} is required`, code: 1, status: false })
      );
    }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json(
        createResponse({ error: 'Email already in use', code: 2, status: false })
      );
    }

    const hashedPassword = await bcrypt.hash(
      `${password}${email.length.toString()}`,
      10
    );
    
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isVerified: false,
        socialToken
      },
    });
    
    await verificationEmail(email);
    delete newUser.password;
    
    return res.status(201).json(
      createResponse({ data: newUser, code: 201, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Get User
 * GET /api/user?id=123
 */
const getUser = async (req, res, next) => {
  const { id } = req.query;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    return res.status(200).json(
      createResponse({ data: user, code: 200, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Update User
 * PATCH /api/user
 */
const updateUser = async (req, res, next) => {
  const {
    id,
    username,
    firstName,
    lastName,
    phoneNumber,
    address,
    city,
    state,
    zipCode,
    role,
    country = 'PK',
    vendorId,
    isVerified,
  } = req.body;

  if (!id) {
    return res.status(400).json(
      createResponse({ error: 'id is required', code: 1, status: false })
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(400).json(
        createResponse({ error: 'User Not found', code: 2, status: false })
      );
    }

    const dataToUpdate = {};
    if (firstName) dataToUpdate.firstName = firstName;
    if (lastName) dataToUpdate.lastName = lastName;
    if (role) dataToUpdate.role = role;
    if (address) dataToUpdate.address = address;
    if (city) dataToUpdate.city = city;
    if (state) dataToUpdate.state = state;
    if (zipCode) dataToUpdate.zipCode = zipCode;
    if (country) dataToUpdate.country = country;
    if (isVerified !== undefined) dataToUpdate.isVerified = isVerified;
    if (phoneNumber) {
      dataToUpdate.phoneNumber = phoneNumber;
      dataToUpdate.isVerified = false;
    }

    let updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
    
    updatedUser = excludeFields(updatedUser, ['password']);
    return res.status(201).json(
      createResponse({ data: updatedUser, code: 201, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Update Password
 * POST /api/user/update-password
 */
const updatePassword = async (req, res, next) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json(
      createResponse({ error: 'All fields are required.', status: false })
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        password: true
      }
    });

    if (!user) {
      return res.status(404).json(
        createResponse({ error: 'User not found.', status: false })
      );
    }

    const inputToHash = `${oldPassword}${user.email.length.toString()}`;
    const isMatch = await bcrypt.compare(inputToHash, user.password);

    if (!isMatch) {
      return res.status(401).json(
        createResponse({ error: 'Old password is incorrect.', status: false })
      );
    }

    const hashedPassword = await bcrypt.hash(
      `${newPassword}${user.email.length.toString()}`,
      10
    );

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json(
      createResponse({ message: 'Password updated successfully.', status: true })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ error: 'Internal server error.', status: false })
    );
  }
};

/**
 * Verify Email
 * POST /api/user/verify-email
 */
const verifyEmail = async (req, res, next) => {
  const { code, email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return res.status(400).json(
        createResponse({ error: 'User Not found', code: 2, status: false })
      );
    }
    
    if (user.code != code) {
      return res.status(400).json(
        createResponse({ error: 'Invalid verification code', code: 2, status: false })
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });
    
    return res.status(200).json({ success: true, message: 'code verified' });
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json(
      createResponse({ success: false, error: error.message, status: false })
    );
  }
};

/**
 * Get User Orders
 * GET /api/user/order?userId=123&limit=20&page=1
 */
const getUserOrders = async (req, res, next) => {
  const { userId, limit = 20, page = 1 } = req.query;
  const orderLimit = Number(limit);
  const orderPage = Number(page);
  const skip = (orderPage - 1) * orderLimit;

  if (!userId) {
    return res.status(400).json(
      createResponse({ error: 'Invalid input', status: false })
    );
  }

  try {
    const totalOrders = await prisma.order.count({
      where: { userId: parseInt(userId) },
    });

    const totalPages = Math.ceil(totalOrders / orderLimit);

    const orders = await prisma.order.findMany({
      where: { userId: parseInt(userId) },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      skip: skip,
      take: orderLimit,
    });

    return res.status(200).json(
      createResponse({ data: { orders, totalPages }, status: true })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ message: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Check Username
 * GET /api/user/username-checker?username=test
 */
const checkUsername = async (req, res, next) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json(
      createResponse({ error: 'Username is required', status: false })
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    return res.status(200).json(
      createResponse({ 
        data: { available: !existingUser }, 
        status: true 
      })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Search Users
 * GET /api/user/search?query=test
 */
const searchUsers = async (req, res, next) => {
  const { query, page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limitNum,
      skip,
    });

    const totalCount = await prisma.user.count({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json(
      createResponse({
        data: {
          users,
          pagination: {
            totalItems: totalCount,
            totalPages,
            currentPage: pageNum,
            pageSize: limitNum,
          },
        },
        status: true
      })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Forgot Password - Send reset code to email
 * POST /api/user/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(
      createResponse({ error: 'Email is required', status: false })
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json(
        createResponse({ error: 'User with this email does not exist', status: false })
      );
    }

    await forgotPasswordEmail(email);

    return res.status(200).json(
      createResponse({ 
        message: 'Password reset code has been sent to your email', 
        status: true 
      })
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Reset Password - Verify code and update password
 * POST /api/user/reset-password
 */
const resetPassword = async (req, res, next) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json(
      createResponse({ error: 'Email, code, and new password are required', status: false })
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json(
        createResponse({ error: 'User not found', status: false })
      );
    }

    if (user.code !== code) {
      return res.status(400).json(
        createResponse({ error: 'Invalid or expired reset code', status: false })
      );
    }

    // Hash the new password
    const inputToHash = `${newPassword}${email.length.toString()}`;
    const hashedPassword = await bcrypt.hash(inputToHash, 10);

    // Update password and clear the code
    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        code: null 
      },
    });

    return res.status(200).json(
      createResponse({ 
        message: 'Password has been reset successfully', 
        status: true 
      })
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

module.exports = {
  login,
  signup,
  getUser,
  updateUser,
  updatePassword,
  verifyEmail,
  getUserOrders,
  checkUsername,
  searchUsers,
  forgotPassword,
  resetPassword,
};

