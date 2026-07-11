const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String
    },
    slug: {
      type: String
    }
  },
  { timestamps: true }
);

// FIX: Modern Mongoose pre-save hook handling slug generation without passing 'next'
categorySchema.pre('save', function () {
  if (this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);