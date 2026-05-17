const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      subscriptionId,
      thaliId,
      quantity,
      deliveryDate,
      deliveryTime,
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      totalPrice,
      paymentMethod,
      notes,
    } = req.body;

    if (!thaliId || !quantity || !deliveryDate || !totalPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO public.orders 
       (user_id, subscription_id, thali_id, quantity, delivery_date, delivery_time, 
        delivery_address, delivery_latitude, delivery_longitude, total_price, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        req.user.userId,
        subscriptionId || null,
        thaliId,
        quantity,
        deliveryDate,
        deliveryTime || 'morning',
        deliveryAddress,
        deliveryLatitude,
        deliveryLongitude,
        totalPrice,
        paymentMethod || 'razorpay',
        notes,
      ]
    );

    const order = result.rows[0];

    // Referral Commission Logic
    try {
      const referral = await pool.query(
        'SELECT referrer_id FROM public.referrals WHERE referred_user_id = $1 LIMIT 1',
        [req.user.userId]
      );

      if (referral.rows.length > 0) {
        const referrerId = referral.rows[0].referrer_id;
        const commissionAmount = parseFloat(totalPrice) * 0.05; // 5% commission

        // Update referrer's wallet
        const wallet = await pool.query(
          'SELECT id FROM public.wallet WHERE user_id = $1',
          [referrerId]
        );

        if (wallet.rows.length > 0) {
          await pool.query(
            `UPDATE public.wallet 
             SET balance = balance + $1, total_earned = total_earned + $1
             WHERE id = $2`,
            [commissionAmount, wallet.rows[0].id]
          );

          // Create transaction
          await pool.query(
            `INSERT INTO public.wallet_transactions (wallet_id, transaction_type, amount, description)
             VALUES ($1, 'referral_commission', $2, $3)`,
            [wallet.rows[0].id, commissionAmount, `Referral commission from order #${order.id.slice(0,8)}`]
          );
        }
      }
    } catch (referralErr) {
      console.error('Referral commission processing error:', referralErr);
      // Don't fail the order if referral processing fails
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user's orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, t.name as thali_name, t.price as thali_price
       FROM public.orders o
       JOIN public.thalis t ON o.thali_id = t.id
       WHERE o.user_id = $1
       ORDER BY o.delivery_date DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, t.name as thali_name, t.price as thali_price
       FROM public.orders o
       JOIN public.thalis t ON o.thali_id = t.id
       WHERE o.id = $1 AND (o.user_id = $2 OR 
         (SELECT user_type FROM public.users WHERE id = $2) = 'admin' OR
         o.delivery_boy_id = $2)`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// Update order status (admin & delivery boy)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    // Check authorization
    const order = await pool.query(
      'SELECT user_id, delivery_boy_id FROM public.orders WHERE id = $1',
      [req.params.id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const userType = (await pool.query(
      'SELECT user_type FROM public.users WHERE id = $1',
      [req.user.userId]
    )).rows[0].user_type;

    if (
      userType !== 'admin' &&
      order.rows[0].delivery_boy_id !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `UPDATE public.orders 
       SET order_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [orderStatus, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Get all orders (admin only)
router.get('/admin/all', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, t.name as thali_name, u.full_name as customer_name
       FROM public.orders o
       JOIN public.thalis t ON o.thali_id = t.id
       JOIN public.users u ON o.user_id = u.id
       ORDER BY o.delivery_date DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

module.exports = router;
