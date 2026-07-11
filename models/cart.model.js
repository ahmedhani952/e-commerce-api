const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Cart item must reference a valid product']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Historical transaction price is required'],
    min: [0, 'Price cannot be negative']
  }
});

const cartSchema = new mongoose.Schema(
  {
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total price cannot be negative']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);