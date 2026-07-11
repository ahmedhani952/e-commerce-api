const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Order item must point to an active product ID']
  },
  name: {
    type: String,
    required: [true, 'Snapshotted product name is required']
  },
  price: {
    type: Number,
    required: [true, 'Snapshotted purchase price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Order quantity is required'],
    min: [1, 'Quantity must be at least 1']
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Unique order tracking number is required'],
      unique: true
    },
    items: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: [true, 'Aggregated checkout total is required'],
      min: [0, 'Total price cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        message: 'Status must be: pending, confirmed, shipped, delivered, or cancelled'
      },
      default: 'pending'
    },
    shippingAddress: {
      type: String,
      required: [true, 'Destination shipping address is required']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);