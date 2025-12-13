const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');

/**
 * Get Admin Users
 * GET /api/admin/users?page=1
 */
const getAdminUsers = async (req, res, next) => {
  const { page = 1 } = req.query;
  const limit = 50;
  const skip = (page - 1) * limit;

  try {
    const users = await prisma.admin.findMany({
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
 * Get Org Employees (Admin)
 * GET /api/admin/users/get-org-emp?page=1
 */
const getOrgEmployees = async (req, res, next) => {
  const { page = 1 } = req.query;
  const limit = 50;
  const skip = (page - 1) * limit;

  try {
    const users = await prisma.admin.findMany({
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
  getAdminUsers,
  getOrgEmployees,
};

