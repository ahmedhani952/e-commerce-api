const express = require('express');
const orderController = require('../controllers/order.controller');
const router = express.Router();

router.route('/')
  .get(orderController.getAllOrders);

router.route('/checkout')
  .post(orderController.checkout);

router.route('/:id')
  .get(orderController.getOrder);

router.route('/:id/status')
  .patch(orderController.updateOrderStatus);

module.exports = router;