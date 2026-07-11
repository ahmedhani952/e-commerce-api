const Product = require('../models/product.model');
const Category = require('../models/category.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'minPrice', 'maxPrice'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  let filterQuery = JSON.parse(queryStr);

  // Advanced Combinable Dynamic Filtering Logic
  if (req.query.minPrice || req.query.maxPrice) {
    filterQuery.price = {};
    if (req.query.minPrice) filterQuery.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filterQuery.price.$lte = Number(req.query.maxPrice);
  }

  if (req.query.category) {
    filterQuery.category = req.query.category;
  }

  if (req.query.inStock) {
    filterQuery.inStock = req.query.inStock === 'true';
  }

  if (req.query.search) {
    filterQuery.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const products = await Product.find(filterQuery);

  res.status(200).json({
    status: 'success',
    message: 'Products filtered and processed successfully',
    data: { products }
  });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
  // Task 5 requirement: full populate on single item detail retrieval
  const product = await Product.findById(req.params.id).populate('category', 'name description');
  if (!product) return next(new AppError('No product discovered matching that lookup ID', 404));

  res.status(200).json({
    status: 'success',
    message: 'Product identity parsed successfully',
    data: { product }
  });
});

exports.createProduct = asyncHandler(async (req, res, next) => {
  // Task 5 validation: ensure linked category integrity is secure
  const categoryExists = await Category.findById(req.body.category);
  if (!categoryExists) {
    return next(new AppError('Aborting execution: The supplied category mapping association ID does not exist in the database.', 404));
  }

  const newProduct = await Product.create(req.body);
  res.status(201).json({
    status: 'success',
    message: 'Product structured record instantiated',
    data: { product: newProduct }
  });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) return next(new AppError('Provided operational category reference ID is invalid.', 404));
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!product) return next(new AppError('No product discovered matching that lookup ID', 404));

  res.status(200).json({
    status: 'success',
    message: 'Product profile updated successfully',
    data: { product }
  });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return next(new AppError('No product discovered matching that lookup ID', 404));

  res.status(200).json({
    status: 'success',
    message: 'Product permanently wiped from storage system',
    data: null
  });
});