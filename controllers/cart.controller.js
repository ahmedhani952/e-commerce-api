const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Helper calculation routine ensuring math integrity originates safely server-side
const recalculateCartTotals = (cart) => {
  cart.totalPrice = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  // Guarantee absolute numeric rounding to avoid native float overflow artifacts
  cart.totalPrice = Math.round(cart.totalPrice * 100) / 100;
};

exports.getCart = asyncHandler(async (req, res, next) => {
  // Enforces a single production instance tracking schema pattern
  let cart = await Cart.findOne().populate('items.product', 'name price images stock inStock');

  if (!cart) {
    cart = await Cart.create({ items: [], totalPrice: 0 });
  }

  res.status(200).json({
    status: 'success',
    message: 'Cart retrieved successfully',
    data: { cart }
  });
});

exports.addItemToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const targetQuantity = Number(quantity) || 1;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Target catalog item not found', 404));

  if (product.stock < targetQuantity) {
    return next(new AppError(`Insufficient warehouse reserves available. Max available units: ${product.stock}`, 400));
  }

  let cart = await Cart.findOne();
  if (!cart) cart = await Cart.create({ items: [], totalPrice: 0 });

  const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

  if (existingItemIndex > -1) {
    const projectedQty = cart.items[existingItemIndex].quantity + targetQuantity;
    if (product.stock < projectedQty) {
      return next(new AppError(`Cumulative operation exceeds available inventory. Max stock: ${product.stock}`, 400));
    }
    cart.items[existingItemIndex].quantity = projectedQty;
    // Always trust database state pricing data, never the client request body payload
    cart.items[existingItemIndex].price = product.price;
  } else {
    cart.items.push({
      product: productId,
      quantity: targetQuantity,
      price: product.price
    });
  }

  recalculateCartTotals(cart);
  await cart.save();

  const updatedCart = await cart.populate('items.product', 'name price');

  res.status(200).json({
    status: 'success',
    message: 'Product successfully added/incremented inside structural cart object.',
    data: { cart: updatedCart }
  });
});

exports.updateItemQuantity = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    return next(new AppError('Quantity values provided must be zero or a standard positive integer', 400));
  }

  let cart = await Cart.findOne();
  if (!cart) return next(new AppError('No cart repository established', 404));

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex === -1) return next(new AppError('Target item not present within cart instance array.', 404));

  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const product = await Product.findById(productId);
    if (!product) return next(new AppError('Product mapped does not exist', 404));

    if (product.stock < quantity) {
      return next(new AppError(`Requested allocation bounds limit exceeded. Max available stock is ${product.stock}`, 400));
    }
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;
  }

  recalculateCartTotals(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Cart contents count dynamically mutated successfully',
    data: { cart }
  });
});

exports.removeItemFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  let cart = await Cart.findOne();
  if (!cart) return next(new AppError('Cart resource context missing', 404));

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex === -1) return next(new AppError('Item was not located in array', 404));

  cart.items.splice(itemIndex, 1);
  recalculateCartTotals(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Item removed from cart successfully',
    data: { cart }
  });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne();
  if (cart) {
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
  } else {
    cart = await Cart.create({ items: [], totalPrice: 0 });
  }

  res.status(200).json({
    status: 'success',
    message: 'Cart completely emptied and variables restored to zero defaults',
    data: { cart }
  });
});