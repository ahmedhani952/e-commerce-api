const Category = require('../models/category.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    status: 'success',
    message: 'Categories retrieved successfully',
    data: { categories }
  });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError('No category discovered matching that lookup ID', 404));

  res.status(200).json({
    status: 'success',
    message: 'Category retrieved successfully',
    data: { category }
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  const newCategory = await Category.create(req.body);
  res.status(201).json({
    status: 'success',
    message: 'Category registered successfully',
    data: { category: newCategory }
  });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!category) return next(new AppError('No category discovered matching that lookup ID', 404));

  res.status(200).json({
    status: 'success',
    message: 'Category modified successfully',
    data: { category }
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return next(new AppError('No category discovered matching that lookup ID', 404));

  res.status(200).json({
    status: 'success',
    message: 'Category purged successfully',
    data: null
  });
});