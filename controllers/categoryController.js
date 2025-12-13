const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');

/**
 * Get Categories
 * GET /api/category?menu=true&id=123
 */
const getCategories = async (req, res, next) => {
  try {
    const { menu, id } = req.query;

    let categories;

    if (id) {
      categories = await prisma.category.findUnique({
        where: { id: parseInt(id) },
        include: { subCategories: true },
      });

      if (!categories) {
        return res.status(404).json(
          createResponse({ error: 'Category not found', status: false })
        );
      }
    } else {
      categories = await prisma.category.findMany({
        include: { subCategories: true },
      });

      if (!menu && categories.length) {
        categories = categories.map((cat) => ({
          label: cat.name,
          value: cat.id,
        }));
      }
    }

    return res.status(200).json(
      createResponse({ data: categories, status: true })
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Get All Categories (Paginated)
 * GET /api/category/get-all?page=1&limit=10
 */
const getAllCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const categories = await prisma.category.findMany({
      take: limitNum,
      skip,
    });

    const totalCount = await prisma.category.count();
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json(
      createResponse({
        data: {
          categories,
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
    console.error('Error fetching categories:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Create Category
 * POST /api/category
 */
const createCategory = async (req, res, next) => {
  const { name, slug, url } = req.body;

  const requiredFields = { name, slug };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json(
        createResponse({ error: `${field} is required`, code: 1, status: false })
      );
    }
  }

  try {
    const existingSlug = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return res.status(200).json(
        createResponse({ error: 'Slug already in use', code: 2, status: false })
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        url,
      },
    });

    return res.status(201).json(
      createResponse({ data: newCategory, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Update Category
 * PUT /api/category
 */
const updateCategory = async (req, res, next) => {
  const { name, slug, url } = req.body;

  try {
    const existingSlug = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return res.status(200).json(
        createResponse({ error: 'Slug already in use', code: 2, status: false })
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { slug },
      data: {
        name,
        slug: slug.toLowerCase(),
        url,
      },
    });

    return res.status(201).json(
      createResponse({ data: updatedCategory, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Patch Category
 * PATCH /api/category
 */
const patchCategory = async (req, res, next) => {
  const { name, slug, url } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { slug },
      data: {
        name,
        slug: slug.toLowerCase(),
        url,
      },
    });

    return res.status(201).json(
      createResponse({ data: updatedCategory, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Delete Category
 * DELETE /api/category?id=123
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json(
        createResponse({ error: 'Category ID is required', status: false })
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { subCategories: true },
    });

    if (!category) {
      return res.status(404).json(
        createResponse({ error: 'Category not found', status: false })
      );
    }

    await prisma.$transaction([
      prisma.subCategory.deleteMany({
        where: { categoryId: parseInt(id) },
      }),
      prisma.category.delete({
        where: { id: parseInt(id) },
      }),
    ]);

    return res.status(200).json(
      createResponse({ 
        message: 'Category and related subcategories deleted successfully',
        status: true
      })
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Check Slug Availability
 * POST /api/category/slug-checker
 */
const checkSlug = async (req, res, next) => {
  const { slug: catSlug } = req.body;

  if (!catSlug) {
    return res.status(400).json(
      createResponse({ error: 'slug is required', status: false })
    );
  }

  try {
    const slug = await prisma.category.findUnique({
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

module.exports = {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  patchCategory,
  deleteCategory,
  checkSlug,
};

