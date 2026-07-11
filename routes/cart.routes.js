const express = require('express');
const cartController = require('../controllers/cart.controller');
const router = express.Router();

router.route('/')
  .get(cartController.getCart)
  .delete(cartController.clearCart);

router.route('/items')
  .post(cartController.addItemToCart);

router.route('/items/:productId')
  .patch(cartController.updateItemQuantity)
  .delete(cartController.removeItemFromCart);

module.exports = router;