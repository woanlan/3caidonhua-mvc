var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var modelProduct = require('../models/product');
var { getFallbackProducts } = require('../utils/fallbackStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// ====================================================================================
// [NGHIỆP VỤ GIỎ HÀNG] - Quản lý Giỏ hàng tạm theo phiên người dùng (Session / Cookie / JWT)
// ====================================================================================

// Bộ nhớ giỏ hàng tạm theo User ID (Lưu trong RAM server theo từng phiên người dùng)
const cartsByUser = {};

/**
 * [NGHIỆP VỤ GIỎ HÀNG] - Hàm lấy định danh người dùng từ Cookie hoặc JWT Bearer Token
 * @param {Request} req 
 * @returns {string} userId hoặc 'guest_default' nếu là khách vãng lai
 */
function getUserId(req) {
  if (req.cookies?.userId) return req.cookies.userId;
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const data = jwt.verify(token, process.env.JWT_SECRET || 'shhhhh');
      if (data && data.user) return String(data.user._id || data.user.id);
    } catch (_) {}
  }
  return 'guest_default';
}

/**
 * [NGHIỆP VỤ GIỎ HÀNG] - 1. Lấy danh sách sản phẩm trong giỏ hàng hiện tại
 * Endpoint: GET /cart hoặc GET /api/cart
 */
router.get('/', function(req, res, next) {
  const uid = getUserId(req);
  const cart = cartsByUser[uid] || [];
  res.json(cart);
});

/**
 * [NGHIỆP VỤ GIỎ HÀNG] - 2. Thêm hoặc cập nhật số lượng sản phẩm trong giỏ
 * Endpoint: PUT /cart/items/:id hoặc PUT /api/cart/items/:id
 */
router.put('/items/:id', async function(req, res, next) {
  try {
    const uid = getUserId(req);
    if (!cartsByUser[uid]) {
      cartsByUser[uid] = [];
    }
    const cart = cartsByUser[uid];
    const { id } = req.params;
    const quantity = parseInt(req.body.quantity, 10) || 0;

    // Tra cứu thông tin sản phẩm từ CSDL (nếu đã kết nối) hoặc Fallback Store 1510 sản phẩm
    let product = null;
    if (isDbConnected() && /^[0-9a-fA-F]{24}$/.test(String(id))) {
      try {
        product = await modelProduct.findById(id);
      } catch (e) {}
    }
    if (!product) {
      const fbProducts = getFallbackProducts();
      product = fbProducts.find(p => String(p.id) === String(id) || String(p._id) === String(id) || String(p.variantId) === String(id)) || null;
    }

    // [NGHIỆP VỤ KIỂM TRA TỒN KHO]: Không cho phép đặt vượt quá số lượng hàng có trong kho
    if (quantity > 0 && product) {
      const maxStock = product.quantity !== undefined ? product.quantity : (product.stock !== undefined ? product.stock : 15);
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

/**
 * [NGHIỆP VỤ GIỎ HÀNG] - 3. Xóa một sản phẩm cụ thể ra khỏi giỏ hàng
 * Endpoint: DELETE /cart/items/:id hoặc DELETE /api/cart/items/:id
 */
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
