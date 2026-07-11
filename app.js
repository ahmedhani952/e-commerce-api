require('dotenv').config();
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorHandler');

// Route Subsystem Files Setup Import
const categoryRouter = require('./routes/category.routes');
const productRouter = require('./routes/product.routes');
const cartRouter = require('./routes/cart.routes');
const orderRouter = require('./routes/order.routes');

const app = express();

// 1. Standard body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. FIX: Express 5 req.query compatibility layer patch
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    ...Object.getOwnPropertyDescriptor(req, 'query'),
    value: req.query,
    writable: true,
  });
  next();
});

// 3. Now it is completely safe to call your sanitizer
app.use(mongoSanitize());

// Root Active Sub-Router Mount Mapping points
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

// Fallback Unhandled Route Layer Handling 404 Conditions
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server platform!`, 404));
});

// Centralized System Error Pipeline interception link
app.use(globalErrorHandler);

// Network Server Instantiation Lifecycle Execution
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server runtime successfully initialized on port: ${PORT} under [${process.env.NODE_ENV}] profile.`);
  });
};

startServer();