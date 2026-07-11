require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/category.model');
const Product = require('./models/product.model');
const Cart = require('./models/cart.model');
const Order = require('./models/order.model');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Seed connection established...');
};

const seedData = async () => {
  try {
    await connectDB();

    // Mandatory Wipe Sequence order
    console.log('Cleaning up existing database records...');
    await Order.deleteMany({});
    await Cart.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Database clean up completed successfully.');

    // 3 Distinct Categories
    const categories = await Category.create([
      { name: 'Electronics', description: 'Gadgets, appliances, and smart hardware devices.' },
      { name: 'Apparel', description: 'Premium garments, shoes, and wearable fashion statement pieces.' },
      { name: 'Home and Kitchen', description: 'Functional utility tools and interior decoration items.' }
    ]);

    // 6 Products properly mapped
    const productsData = [
      {
        name: 'Pro Wireless Headphones',
        description: 'Active noise cancelling headphones with deep bass response.',
        price: 199.99,
        stock: 45,
        category: categories[0]._id,
        images: ['headphone1.jpg', 'headphone1_side.jpg']
      },
      {
        name: 'OLED Smart Watch',
        description: 'Fitness tracking wearable with always-on crystal display.',
        price: 299.50,
        stock: 20,
        category: categories[0]._id,
        images: ['watch.jpg']
      },
      {
        name: 'Waterproof Running Jacket',
        description: 'Windproof breathable athletic layer ideal for outdoor running.',
        price: 85.00,
        stock: 60,
        category: categories[1]._id,
        images: ['jacket.jpg', 'jacket_back.jpg']
      },
      {
        name: 'Classic Leather Boots',
        description: 'Handcrafted durable premium leather boots engineered for comfort.',
        price: 150.00,
        stock: 15,
        category: categories[1]._id,
        images: ['boots.jpg']
      },
      {
        name: 'Ergonomic Espresso Press',
        description: 'High pressure extract manual espresso maker for professional home brewing.',
        price: 120.00,
        stock: 8,
        category: categories[2]._id,
        images: ['espresso.jpg']
      },
      {
        name: 'Non-Stick Ceramic Pan Set',
        description: 'Eco-friendly chemical free non-stick heat uniform kitchen set.',
        price: 210.00,
        stock: 0, // InStock should compute to false dynamically
        category: categories[2]._id,
        images: ['pans.jpg']
      }
    ];

    const seededProducts = await Product.create(productsData);

    console.log('----------------------------------------------------');
    console.log(`SUCCESS: Database Populated Successfully!`);
    console.log(`Added: ${categories.length} Categories.`);
    console.log(`Added: ${seededProducts.length} Products distributed across categories.`);
    console.log('----------------------------------------------------');

  } catch (error) {
    console.error(`Seeding process encountered structural failure: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('Database reference connection detached safely.');
    process.exit(0);
  }
};

seedData();