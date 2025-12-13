const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');

/**
 * Get Users
 * GET /api/users?page=1
 */
const getUsers = async (req, res, next) => {
  const { page = 1 } = req.query;
  const limit = 50;
  const skip = (page - 1) * limit;

  try {
    const users = await prisma.user.findMany({
      skip: skip,
      take: limit,
    });

    const data = { users: users, count: users.length, status: 200 };
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Get Org Employees
 * GET /api/users/get-org-emp?page=1
 */
const getOrgEmployees = async (req, res, next) => {
  const { page = 1 } = req.query;
  const limit = 50;
  const skip = (page - 1) * limit;

  try {
    const users = await prisma.user.findMany({
      skip: skip,
      take: limit,
    });

    const data = { users: users, count: users.length, status: 200 };
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

module.exports = {
  getUsers,
  getOrgEmployees,
};

