const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');

/**
 * Create Store
 * POST /api/store
 */
const createStore = async (req, res, next) => {
  const {
    name,
    email,
    phoneNumber,
    address,
    city,
    state,
    zipCode,
    country = 'PK',
    companyName,
    taxId,
  } = req.body;

  const requiredFields = { name, email, phoneNumber };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json(
        createResponse({ error: `${field} is required`, errorCode: 1, status: false })
      );
    }
  }

  try {
    const existingstore = await prisma.store.findUnique({
      where: { email },
    });

    if (existingstore) {
      return res.status(400).json(
        createResponse({ error: 'Email already in use', errorCode: 2, status: false })
      );
    }

    const newstore = await prisma.store.create({
      data: {
        name,
        email,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        country,
        companyName,
        taxId,
      },
    });

    return res.status(201).json(
      createResponse({ data: newstore, status: 201 })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', details: error.message, status: false })
    );
  }
};

/**
 * Get Stores
 * GET /api/store?id=123
 */
const getStores = async (req, res, next) => {
  const { id } = req.query;

  try {
    if (id) {
      const store = await prisma.store.findUnique({
        where: { id: parseInt(id) },
      });

      if (!store) {
        return res.status(404).json(
          createResponse({ error: 'store not found', status: false })
        );
      }

      return res.status(200).json(
        createResponse({ data: store, status: true })
      );
    }

    const stores = await prisma.store.findMany();
    return res.status(200).json(
      createResponse({ data: stores, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', details: error.message, status: false })
    );
  }
};

/**
 * Update Store
 * PATCH /api/store?id=123
 */
const updateStore = async (req, res, next) => {
  const { id } = req.query;
  const {
    name,
    email,
    phoneNumber,
    address,
    city,
    state,
    zipCode,
    country,
    companyName,
    taxId,
  } = req.body;

  if (!id) {
    return res.status(400).json(
      createResponse({ error: 'store ID is required', status: false })
    );
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: parseInt(id) },
    });

    if (!store) {
      return res.status(404).json(
        createResponse({ error: 'store not found', status: false })
      );
    }

    const updatedstore = await prisma.store.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        country,
        companyName,
        taxId,
      },
    });

    return res.status(200).json(
      createResponse({ data: updatedstore, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', details: error.message, status: false })
    );
  }
};

/**
 * Delete Store
 * DELETE /api/store?id=123
 */
const deleteStore = async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json(
      createResponse({ error: 'store ID is required', status: false })
    );
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: parseInt(id) },
    });

    if (!store) {
      return res.status(404).json(
        createResponse({ error: 'store not found', status: false })
      );
    }

    await prisma.store.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json(
      createResponse({ message: 'store deleted successfully', status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', details: error.message, status: false })
    );
  }
};

module.exports = {
  createStore,
  getStores,
  updateStore,
  deleteStore,
};

