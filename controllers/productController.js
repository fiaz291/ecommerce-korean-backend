const prisma = require('../config/prisma');
const { bucket } = require('../config/firebase');
const { createResponse } = require('../utils/response');

/**
 * Get Products
 * GET /api/product?categoryId=&subCategoryId=&limit=20&page=1
 */
const getProducts = async (req, res, next) => {
  try {
    const { categoryId, subCategoryId, limit = 20, page = 1 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (categoryId) query = { categoryId: Number(categoryId) };
    if (subCategoryId) query = { ...query, subCategoryId: Number(subCategoryId) };

    const products = await prisma.product.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip,
    });

    const totalCount = await prisma.product.count({ where: query });
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json(
      createResponse({
        data: {
          products,
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
    console.error(error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Get Product by Slug
 * GET /api/product/:productSlug
 */
const getProductBySlug = async (req, res, next) => {
  try {
    const { productSlug } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        slug: productSlug,
        inventory: { gt: 0 },
      },
      include: {
        category: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json(
        createResponse({ message: 'Product not found', status: false })
      );
    }

    return res.status(200).json(
      createResponse({ data: product, status: true })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ message: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Create Product
 * POST /api/product
 */
const createProduct = async (req, res, next) => {
  const {
    name, description, price, currency, SKU, inventory, categoryId, tags, images,
    isFeatured, rating, brand, weight, dimensions, slug, score, discountPrice,
    freebieProductIDs = [], relatedProductIDs = [], totalSold = 0, isActive = true,
    subCategoryId, storeId
  } = req.body;

  const requiredFields = {
    name, slug, description, price, SKU, inventory, categoryId, tags, storeId
  };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json(
        createResponse({ error: `${field} is required`, errorCode: 1, status: false })
      );
    }
  }

  try {
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return res.status(400).json(
        createResponse({ error: 'Slug already in use', errorCode: 2, status: false })
      );
    }

    const existingSku = await prisma.product.findUnique({ where: { SKU } });
    if (existingSku) {
      return res.status(400).json(
        createResponse({ error: 'SKU already in use', errorCode: 3, status: false })
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name, description, price, currency, SKU, inventory, categoryId, tags, images,
        isFeatured, rating: rating ? parseInt(rating) : 0, brand,
        weight: weight ? parseInt(weight) : 0, dimensions, slug,
        isDiscount: !!discountPrice, score, discountPrice,
        freebieProductIDs, relatedProductIDs, totalSold, isActive, storeId, subCategoryId
      },
    });

    return res.status(201).json(
      createResponse({ product: newProduct, status: 201 })
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Update Product
 * PATCH /api/product
 */
const updateProduct = async (req, res, next) => {
  const {
    id, name, description, price, currency, SKU, inventory, categoryId, tags, images,
    isFeatured, rating, brand, weight, dimensions, isDiscount, slug, score,
    discountPrice, freebieProductIDs, relatedProductIDs, totalSold, isActive, subCategoryIds
  } = req.body;

  if (!id) {
    return res.status(400).json(
      createResponse({ error: 'Product ID is required', errorCode: 1, status: false })
    );
  }

  try {
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json(
        createResponse({ error: 'Product not found', errorCode: 3, status: false })
      );
    }

    if (slug && slug !== existingProduct.slug) {
      const existingSlug = await prisma.product.findUnique({ where: { slug } });
      if (existingSlug) {
        return res.status(400).json(
          createResponse({ error: 'Slug already in use', errorCode: 2, status: false })
        );
      }
    }

    if (SKU && SKU !== existingProduct.SKU) {
      const existingSku = await prisma.product.findUnique({ where: { SKU } });
      if (existingSku) {
        return res.status(400).json(
          createResponse({ error: 'SKU already in use', errorCode: 4, status: false })
        );
      }
    }

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (price !== undefined) dataToUpdate.price = price;
    if (currency !== undefined) dataToUpdate.currency = currency;
    if (SKU !== undefined) dataToUpdate.SKU = SKU;
    if (inventory !== undefined) dataToUpdate.inventory = inventory;
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;
    if (tags !== undefined) dataToUpdate.tags = tags;
    if (images !== undefined) dataToUpdate.images = images;
    if (isFeatured !== undefined) dataToUpdate.isFeatured = isFeatured;
    if (rating !== undefined) dataToUpdate.rating = rating;
    if (brand !== undefined) dataToUpdate.brand = brand;
    if (weight !== undefined) dataToUpdate.weight = weight;
    if (dimensions !== undefined) dataToUpdate.dimensions = dimensions;
    if (isDiscount !== undefined) dataToUpdate.isDiscount = isDiscount;
    if (slug !== undefined) dataToUpdate.slug = slug;
    if (score !== undefined) dataToUpdate.score = score;
    if (discountPrice !== undefined) dataToUpdate.discountPrice = discountPrice;
    if (freebieProductIDs !== undefined) dataToUpdate.freebieProductIDs = freebieProductIDs;
    if (relatedProductIDs !== undefined) dataToUpdate.relatedProductIDs = relatedProductIDs;
    if (totalSold !== undefined) dataToUpdate.totalSold = totalSold;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;

    if (subCategoryIds !== undefined) {
      dataToUpdate.subCategories = {
        set: subCategoryIds.map((id) => ({ id })),
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.status(200).json(
      createResponse({ product: updatedProduct, status: 200 })
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Search Products
 * GET /api/product/search?text=&page=1&limit=10
 */
const searchProducts = async (req, res, next) => {
  try {
    let { text, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { startsWith: text, mode: 'insensitive' } },
          { name: { contains: text, mode: 'insensitive' } },
          { name: { endsWith: text, mode: 'insensitive' } },
        ],
      },
      take: limitNum,
      skip,
    });

    const totalCount = await prisma.product.count({
      where: {
        OR: [
          { name: { startsWith: text, mode: 'insensitive' } },
          { name: { contains: text, mode: 'insensitive' } },
          { name: { endsWith: text, mode: 'insensitive' } },
        ],
      },
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json(
      createResponse({
        data: {
          products,
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
    console.error('Error searching for product:', error);
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Check Product Slug
 * POST /api/product/slug-checker
 */
const checkProductSlug = async (req, res, next) => {
  const { slug: catSlug } = req.body;

  if (!catSlug) {
    return res.status(400).json(
      createResponse({ error: 'slug is required', status: false })
    );
  }

  try {
    const slug = await prisma.product.findUnique({
      where: { slug: catSlug.toLowerCase() },
    });

    if (slug) {
      return res.status(200).json({
        error: catSlug.toLowerCase() + ' already in use',
        status: 200
      });
    }

    return res.status(200).json({
      message: catSlug.toLowerCase() + ' Slug is available',
      status: 200
    });
  } catch (error) {
    console.error('Error checking Slug:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Get Products by Category
 * GET /api/product/category?categoryId=&subCategoryId=&page=1&limit=10
 */
const getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId, subCategoryId, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (categoryId) query = { ...query, categoryId: Number(categoryId) };
    if (subCategoryId) query = { ...query, subCategoryId: Number(subCategoryId) };

    let products = await prisma.product.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip,
    });

    const totalCount = await prisma.product.count({ where: query });
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json(
      createResponse({
        data: {
          products,
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
    console.error(error);
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Get Best Selling Products
 * GET /api/product/best-selling?days=&limit=20&page=1&categoryId=
 */
const getBestSellingProducts = async (req, res, next) => {
  try {
    let { days, limit = 20, page = 1, categoryId } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let daysAgo = new Date();
    if (days) daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    let query = {
      isActive: true,
      inventory: { gt: 1 },
      orderItems: {
        some: {
          order: {
            createdAt: { gte: daysAgo },
          },
        },
      },
    };

    if (categoryId) {
      query = { ...query, categoryId: Number(categoryId) };
    }

    let products = await prisma.product.findMany({
      where: query,
      include: {
        orderItems: {
          select: { quantity: true },
        },
      },
      take: limitNum,
      skip,
    });

    const totalCount = await prisma.product.count({ where: query });
    const totalPages = Math.ceil(totalCount / limitNum);

    const productsWithSales = products.map((product) => {
      const totalQuantitySold = product.orderItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      return { ...product, totalQuantitySold };
    });

    productsWithSales.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);
    products = productsWithSales.slice(0, 20);

    if (!products.length) {
      products = await prisma.product.findMany({
        where: {
          isActive: true,
          inventory: { gt: 1 }
        },
        take: limit,
      });
    }

    return res.status(200).json(
      createResponse({
        data: {
          products,
          pagination: {
            totalItems: totalCount,
            totalPages,
            currentPage: pageNum,
            pageSize: limitNum,
          },
          status: true
        }
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Get Free Delivery Products
 * GET /api/product/free-delivery?limit=20&page=1&categoryId=
 */
const getFreeDeliveryProducts = async (req, res, next) => {
  try {
    let { limit = 20, page = 1, categoryId } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {
      isActive: true,
      inventory: { gt: 1 },
      freeDelivery: true
    };

    if (categoryId) {
      query = { ...query, categoryId: Number(categoryId) };
    }

    let products = await prisma.product.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip,
    });

    const totalCount = await prisma.product.count({ where: query });
    const totalPages = Math.ceil(totalCount / limitNum);

    if (!products.length) {
      products = await prisma.product.findMany({
        where: {
          isActive: true,
          inventory: { gt: 1 }
        },
        take: limit,
      });
    }

    return res.status(200).json(
      createResponse({
        data: {
          products,
          pagination: {
            totalItems: totalCount,
            totalPages,
            currentPage: pageNum,
            pageSize: limitNum,
          }
        },
        status: true
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Get Super Deals Products
 * GET /api/product/super-deals?page=1&limit=10&categoryId=
 */
const getSuperDealsProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, categoryId } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {
      isActive: true,
      inventory: { gt: 1 },
      isDiscount: true,
      discountPrice: { not: null },
    };

    if (categoryId) {
      query = { ...query, categoryId: Number(categoryId) };
    }

    let products = await prisma.product.findMany({
      where: query,
      orderBy: { discountPrice: 'desc' },
      take: limitNum,
      skip,
    });

    const totalCount = await prisma.product.count({
      where: {
        isActive: true,
        inventory: { gt: 1 },
        isDiscount: true,
        discountPrice: { not: null },
      },
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    if (!products.length) {
      products = await prisma.product.findMany({
        where: {
          isActive: true,
          inventory: { gt: 1 }
        },
        take: limit,
      });
    }

    return res.status(200).json(
      createResponse({
        data: {
          products,
          pagination: {
            totalItems: totalCount,
            totalPages,
            currentPage: pageNum,
            pageSize: limitNum,
          }
        },
        status: true
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Get Top of Week Products
 * GET /api/product/top-of-week?days=&limit=20&page=1&categoryId=
 */
const getTopOfWeekProducts = async (req, res, next) => {
  try {
    let { days, limit = 20, page = 1, categoryId } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let daysAgo = new Date();
    if (days) daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    let query = {
      isActive: true,
      inventory: { gt: 1 },
      orderItems: {
        some: {
          order: {
            createdAt: { gte: daysAgo },
          },
        },
      },
    };

    if (categoryId) {
      query = { ...query, categoryId: Number(categoryId) };
    }

    let products = await prisma.product.findMany({
      where: query,
      include: {
        orderItems: {
          select: { quantity: true },
        },
      },
      take: limitNum,
      skip,
    });

    const totalCount = await prisma.product.count({ where: query });
    const totalPages = Math.ceil(totalCount / limitNum);

    const productsWithSales = products.map((product) => {
      const totalQuantitySold = product.orderItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      return { ...product, totalQuantitySold };
    });

    productsWithSales.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);
    products = productsWithSales.slice(0, 20);

    if (!products.length) {
      products = await prisma.product.findMany({
        where: {
          isActive: true,
          inventory: { gt: 1 }
        },
        take: limit,
      });
    }

    return res.status(200).json(
      createResponse({
        data: {
          products,
          pagination: {
            totalItems: totalCount,
            totalPages,
            currentPage: pageNum,
            pageSize: limitNum,
          }
        },
        status: true
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Delete Product
 * DELETE /api/product/:id
 */
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id);

  if (!productId) {
    return res.status(400).json(
      createResponse({ error: 'Product ID is required', status: false })
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json(
        createResponse({ error: 'Product not found', status: false })
      );
    }

    // Delete all related records and the product in a transaction
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId } }),
      prisma.favorite.deleteMany({ where: { productId } }),
      prisma.views.deleteMany({ where: { productId } }),
      prisma.banner.deleteMany({ where: { productId } }),
      prisma.orderItem.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);

    // Delete images from Firebase Storage
    if (product.images && product.images.length > 0) {
      const bucketName = bucket.name;
      const deletePromises = product.images.map((url) => {
        const filePath = url.replace(
          `https://storage.googleapis.com/${bucketName}/`,
          ''
        );
        return bucket.file(filePath).delete().catch((err) => {
          console.error(`Failed to delete image: ${url}`, err.message);
        });
      });
      await Promise.all(deletePromises);
    }

    return res.status(200).json(
      createResponse({ message: 'Product deleted successfully', status: true })
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  checkProductSlug,
  getProductsByCategory,
  getBestSellingProducts,
  getFreeDeliveryProducts,
  getSuperDealsProducts,
  getTopOfWeekProducts,
};

