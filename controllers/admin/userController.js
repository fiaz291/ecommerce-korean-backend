const prisma = require('../../config/prisma');
const { createResponse } = require('../../utils/response');
const { getToken } = require('../../utils/auth');
const bcrypt = require('bcrypt');

/**
 * Admin Login
 * POST /api/admin/user/login
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(
      createResponse({ error: 'Email and password are required', status: false })
    );
  }

  try {
    const user = await prisma.admin.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json(
        createResponse({ error: 'Invalid email or password', status: false })
      );
    }

    const inputToHash = `${password}${email.length.toString()}`;
    const isMatch = await bcrypt.compare(inputToHash, user.password);
    
    if (!isMatch) {
      return res.status(401).json(
        createResponse({ error: 'Invalid email or password', status: false })
      );
    }

    delete user.password;
    const token = await getToken(user);
    
    await prisma.admin.update({
      where: { id: user.id },
      data: { token },
    });

    return res.status(200).json({ data: { ...user, token } });
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
 * Create Admin User
 * POST /api/admin/user
 */
const createAdmin = async (req, res, next) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    address,
    city,
    state,
    zipCode,
    country = 'PK',
    dateOfBirth,
    storeId
  } = req.body;

  const requiredFields = { email, password, firstName };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json(
        createResponse({ error: `${field} is required`, code: 1, status: false })
      );
    }
  }

  try {
    const existingUser = await prisma.admin.findUnique({
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
    
    const newUser = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        country,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        storeId,
        isActive: true
      },
    });
    
    delete newUser.password;
    return res.status(201).json(
      createResponse({ data: { ...newUser }, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Update Admin User
 * PATCH /api/admin/user
 */
const updateAdmin = async (req, res, next) => {
  const {
    id,
    firstName,
    lastName,
    phoneNumber,
    address,
    city,
    state,
    zipCode,
    role,
    country = 'PK',
    vendorId
  } = req.body;

  if (!id) {
    return res.status(400).json(
      createResponse({ error: 'id is required', code: 1, status: false })
    );
  }

  try {
    const existingUser = await prisma.admin.findUnique({
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
    if (phoneNumber) {
      dataToUpdate.phoneNumber = phoneNumber;
      dataToUpdate.isVerified = false;
    }
    if (vendorId) dataToUpdate.vendorId = vendorId;

    const updatedUser = await prisma.admin.update({
      where: { id },
      data: dataToUpdate,
    });
    
    return res.status(201).json(
      createResponse({ data: updatedUser, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Check Username
 * GET /api/admin/user/username-checker
 */
const checkUsername = async (req, res, next) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json(
      createResponse({ error: 'Username is required', status: false })
    );
  }

  try {
    const existingUser = await prisma.admin.findUnique({
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

module.exports = {
  login,
  createAdmin,
  updateAdmin,
  checkUsername,
};

