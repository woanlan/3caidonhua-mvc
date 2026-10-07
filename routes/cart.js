var express = require('express');
var router = express.Router();
var modelProduct = require('../models/product');

// Bộ nhớ giỏ hàng tạm theo user
const cartsByUser = {};

function getUserId(req) {
  return req.cookies?.userId || 'guest_default';
}

// Lấy danh sách sản phẩm trong giỏ hàng
router.get('/', function(req, res, next) {
  const uid = getUserId(req);
  const cart = cartsByUser[uid] || [];
  res.json(cart);
});

// Thêm hoặc cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/items/:id', async function(req, res, next) {
  try {
    const uid = getUserId(req);
    if (!cartsByUser[uid]) {
      cartsByUser[uid] = [];
    }
    const cart = cartsByUser[uid];
    const { id } = req.params;
    const quantity = parseInt(req.body.quantity, 10) || 0;

    let product = null;
    try {
      product = await modelProduct.findById(id);
    } catch (e) {
      // nếu id không phải ObjectId 24 hex
    }

    if (quantity > 0 && product) {
      const maxStock = product.quantity !== undefined ? product.quantity : 15;
      if (quantity > maxStock) {
        return res.status(400).json({
          message: `Rất xin lỗi quý khách! Hiện tại shop chỉ còn ${maxStock} sản phẩm này trong kho.`,
          maxStock
        });
      }
    }

    const itemIndex = cart.findIndex(x => x.variantId == id || x.id == id);

    if (quantity <= 0) {
      if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
      }
    } else {
      if (itemIndex > -1) {
        cart[itemIndex].quantity = quantity;
      } else {
        cart.push({
          id: id,
          variantId: id,
          name: product?.name || 'Mô hình Gunpla Bandai',
          price: product?.price || 500000,
          quantity: quantity,
          status: 'active',
          variantStatus: 'active',
          image: product?.image || '/assets/hero-poster.jpg',
          grade: product?.grade || 'HG',
          scale: product?.scale || '1/144'
        });
      }
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/items/:id', function(req, res, next) {
  const uid = getUserId(req);
  if (!cartsByUser[uid]) {
    cartsByUser[uid] = [];
  }
  const cart = cartsByUser[uid];
  const { id } = req.params;
  const itemIndex = cart.findIndex(x => x.variantId == id || x.id == id);
  if (itemIndex > -1) {
    cart.splice(itemIndex, 1);
  }
  res.json(cart);
});

module.exports = { router, cartsByUser, getUserId };
