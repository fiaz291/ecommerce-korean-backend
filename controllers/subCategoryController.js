const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');

/**
 * Get Sub-Categories
 * GET /api/sub-categories?subCatId=123
 */
const getSubCategories = async (req, res, next) => {
  const { subCatId } = req.query;
  
  try {
    let subCategories;
    if (subCatId) {
      subCategories = await prisma.subCategory.findUnique({
        where: { id: parseInt(subCatId) },
      });
    } else {
      subCategories = await prisma.subCategory.findMany();
      if (subCategories.length) {
        subCategories = subCategories.map((sub) => ({
          label: sub.name,
          value: sub.id,
        }));
      }
    }
    
    return res.status(200).json(
      createResponse({ data: subCategories, status: true })
    );
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return res.status(500).json(
      createResponse({ message: 'Internal server error', error: error.message, status: false })
    );
  }
};

/**
 * Get All Sub-Categories (Paginated)
 * GET /api/sub-categories/get-all?page=1&limit=10
 */
const getAllSubCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const subCategories = await prisma.subCategory.findMany({
      take: limitNum,
      skip,
    });

    const totalCount = await prisma.subCategory.count();
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json(
      createResponse({
        data: {
          subCategories,
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
    console.error('Error fetching subcategories:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Get Sub-Categories by Category ID
 * GET /api/sub-categories/:id?id=123
 */
const getSubCategoriesByCategory = async (req, res, next) => {
  let { id } = req.query;
  
  try {
    let subCategories = await prisma.subCategory.findMany({
      where: { categoryId: parseInt(id) }
    });
    
    if (subCategories) {
      subCategories = subCategories.map((sub) => ({
        label: sub.name,
        value: sub.id
      }));
    }
    
    return res.status(200).json(
      createResponse({ data: subCategories, status: true })
    );
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return res.status(500).json(
      createResponse({ message: 'Internal server error', error: error.message, status: false })
    );
  }
};

/**
 * Create Sub-Category
 * POST /api/sub-categories
 */
const createSubCategory = async (req, res, next) => {
  const { name, slug, url, categoryId } = req.body;

  if (!name || !slug || !url || !categoryId) {
    return res.status(400).json(
      createResponse({
        error: 'All fields are required: name, slug, url, categoryId',
        status: false
      })
    );
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json(
        createResponse({ error: 'Category not found', status: false })
      );
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        slug,
        url,
        category: {
          connect: { id: categoryId },
        },
      },
    });

    return res.status(201).json(
      createResponse({ data: subCategory, status: true })
    );
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Update Sub-Category
 * PUT /api/sub-categories
 */
const updateSubCategory = async (req, res, next) => {
  const { name, slug, url, categoryId } = req.body;

  if (!name || !slug || !url || !categoryId) {
    return res.status(400).json(
      createResponse({
        error: 'All fields are required: name, slug, url, categoryId',
        status: false
      })
    );
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json(
        createResponse({ error: 'Category not found', status: false })
      );
    }

    const subCategory = await prisma.subCategory.update({
      where: { id: parseInt(categoryId) },
      data: {
        name,
        slug,
        url,
        category: {
          connect: { id: categoryId },
        },
      },
    });

    return res.status(201).json(
      createResponse({ data: subCategory, status: true })
    );
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return res.status(500).json(
      createResponse({ message: 'Internal server error', error: error.message, status: false })
    );
  }
};

/**
 * Patch Sub-Category
 * PATCH /api/sub-categories
 */
const patchSubCategory = async (req, res, next) => {
  const { name, slug, url, categoryId } = req.body;

  if (!name || !slug || !url || !categoryId) {
    return res.status(400).json(
      createResponse({
        error: 'All fields are required: name, slug, url, categoryId',
        status: false
      })
    );
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json(
        createResponse({ error: 'Category not found', status: false })
      );
    }

    const subCategory = await prisma.subCategory.update({
      where: { id: parseInt(categoryId) },
      data: {
        name,
        slug,
        url,
        category: {
          connect: { id: categoryId },
        },
      },
    });

    return res.status(201).json(
      createResponse({ data: subCategory, status: true })
    );
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return res.status(500).json(
      createResponse({ message: 'Internal server error', error: error.message, status: false })
    );
  }
};

/**
 * Delete Sub-Category
 * DELETE /api/sub-categories?id=123
 */
const deleteSubCategory = async (req, res, next) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json(
        createResponse({ error: 'Sub Category ID is required', status: false })
      );
    }

    const category = await prisma.subCategory.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category) {
      return res.status(404).json(
        createResponse({ error: 'Sub Category not found', status: false })
      );
    }

    await prisma.subCategory.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json(
      createResponse({ message: 'Sub Category deleted successfully', status: true })
    );
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

module.exports = {
  getSubCategories,
  getAllSubCategories,
  getSubCategoriesByCategory,
  createSubCategory,
  updateSubCategory,
  patchSubCategory,
  deleteSubCategory,
};

