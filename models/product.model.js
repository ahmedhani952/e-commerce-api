const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category']
    },
    images: {
      type: [String],
      default: []
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// FIX: Removed 'next()' parameter to match modern Mongoose standards
productSchema.pre('save', function () {
  this.inStock = this.stock > 0;
});

module.exports = mongoose.model('Product', productSchema);