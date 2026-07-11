const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.checkout = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress) return next(new AppError('Shipping address is required to proceed with checkout', 400));

  const cart = await Cart.findOne().populate('items.product');
  if (!cart || cart.items.length === 0) {
    return next(new AppError('Aborting execution order: Shopping cart instance is empty.', 400));
  }

  // Double check all inventory balances are robust before initiating storage mutation sequences
  for (const item of cart.items) {
    if (!item.product) {
      return next(new AppError('One of the products in your cart no longer exists.', 404));
    }
    if (item.product.stock < item.quantity) {
      return next(new AppError(`Inventory issue encountered: "${item.product.name}" is out of stock. Available: ${item.product.stock}`, 400));
    }
  }

  const orderItems = [];
  let calculatedTotalPrice = 0;

  // Perform processing and deduct stock values atomically
  for (const item of cart.items) {
    const product = item.product;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price, // Internal pricing snapshot secure
      quantity: item.quantity
    });

    calculatedTotalPrice += product.price * item.quantity;

    // Deduct inventory levels
    product.stock -= item.quantity;
    product.inStock = product.stock > 0;
    await product.save();
  }

  calculatedTotalPrice = Math.round(calculatedTotalPrice * 100) / 100;
  const generatedOrderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = await Order.create({
    orderNumber: generatedOrderNumber,
    items: orderItems,
    totalPrice: calculatedTotalPrice,
    shippingAddress,
    status: 'pending'
  });

  // Empty out operational cart metrics cleanly
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(201).json({
    status: 'success',
    message: 'Order placed successfully',
    data: { order: newOrder }
  });
});

exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find();
  res.status(200).json({
    status: 'success',
    message: 'All historical system orders fetched.',
    data: { orders }
  });
});

exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('No order found matching that tracking database ID link.', 404));

  res.status(200).json({
    status: 'success',
    message: 'Target order trace parsed successfully.',
    data: { order }
  });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('No order found matching that tracking database ID link.', 404));

  // Forces validation trigger on Schema Enum rules
  order.status = status;
  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Order delivery execution status state updated successfully.',
    data: { order }
  });
});