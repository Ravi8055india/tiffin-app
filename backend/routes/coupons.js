const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Apply a coupon to cart
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || cartTotal === undefined) {
      return res.status(400).json({ error: 'Coupon code and cart total required' });
    }

    const couponRes = await pool.query(
      `SELECT * FROM public.coupons 
       WHERE code = $1 AND is_active = true 
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
       LIMIT 1`,
      [code.toUpperCase()]
    );

    if (couponRes.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid, expired, or inactive coupon code' });
    }

    const coupon = couponRes.rows[0];
    const total = parseFloat(cartTotal);

    if (total < parseFloat(coupon.min_cart_amount)) {
      return res.status(400).json({ 
        error: `Minimum order amount of ₹${parseFloat(coupon.min_cart_amount).toFixed(0)} required for this coupon` 
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = total * (parseFloat(coupon.discount_value) / 100);
    } else {
      discountAmount = parseFloat(coupon.discount_value);
    }

    // Cap the discount so it doesn't exceed cart total
    if (discountAmount > total) {
      discountAmount = total;
    }

    res.json({
      success: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalTotal: parseFloat((total - discountAmount).toFixed(2))
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
});

module.exports = router;
