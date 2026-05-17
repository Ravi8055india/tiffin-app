const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { rewardReferrerIfEligible } = require('../utils/referralReward');

// Get assigned orders for delivery boy
router.get('/orders', authMiddleware, roleMiddleware(['delivery_boy']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, t.name as thali_name, u.full_name as customer_name, u.phone_number, u.address, u.city
       FROM public.orders o
       JOIN public.thalis t ON o.thali_id = t.id
       JOIN public.users u ON o.user_id = u.id
       WHERE o.delivery_boy_id = $1
       ORDER BY o.delivery_date ASC, o.delivery_time ASC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Update delivery tracking
router.post('/tracking/:orderId', authMiddleware, roleMiddleware(['delivery_boy']), async (req, res) => {
  try {
    const { status, latitude, longitude } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    // Check if order is assigned to this delivery boy
    const order = await pool.query(
      'SELECT id FROM public.orders WHERE id = $1 AND delivery_boy_id = $2',
      [req.params.orderId, req.user.userId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get or create tracking record
    const tracking = await pool.query(
      'SELECT id FROM public.delivery_tracking WHERE order_id = $1',
      [req.params.orderId]
    );

    let result;
    if (tracking.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO public.delivery_tracking (order_id, delivery_boy_id, status, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [req.params.orderId, req.user.userId, status, latitude, longitude]
      );
    } else {
      result = await pool.query(
        `UPDATE public.delivery_tracking 
         SET status = $1, latitude = COALESCE($2, latitude), longitude = COALESCE($3, longitude), updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $4
         RETURNING *`,
        [status, latitude, longitude, req.params.orderId]
      );
    }

    // Update order status based on delivery tracking status
    if (status === 'delivered') {
      const orderRes = await pool.query(
        `UPDATE public.orders 
         SET order_status = 'delivered', delivery_time_actual = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING user_id`,
        [req.params.orderId]
      );
      if (orderRes.rows.length > 0) {
        try {
          await rewardReferrerIfEligible(orderRes.rows[0].user_id, req.params.orderId);
        } catch (err) {
          console.error('Failed to reward referrer on delivery tracking status update:', err);
        }
      }
    } else if (status === 'on_the_way') {
      await pool.query(
        `UPDATE public.orders 
         SET order_status = 'out_for_delivery'
         WHERE id = $1`,
        [req.params.orderId]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({ error: 'Failed to update tracking' });
  }
});

// Get delivery tracking (for customer)
router.get('/tracking/:orderId', authMiddleware, async (req, res) => {
  try {
    // Check authorization
    const order = await pool.query(
      'SELECT user_id FROM public.orders WHERE id = $1',
      [req.params.orderId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'SELECT * FROM public.delivery_tracking WHERE order_id = $1',
      [req.params.orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tracking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get tracking error:', error);
    res.status(500).json({ error: 'Failed to get tracking' });
  }
});

// Assign orders to delivery boy (admin)
router.post('/assign/:orderId', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;

    if (!deliveryBoyId) {
      return res.status(400).json({ error: 'Delivery boy ID required' });
    }

    const result = await pool.query(
      `UPDATE public.orders 
       SET delivery_boy_id = $1, order_status = 'confirmed'
       WHERE id = $2
       RETURNING *`,
      [deliveryBoyId, req.params.orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Assign order error:', error);
    res.status(500).json({ error: 'Failed to assign order' });
  }
});

// Get all available delivery boys (admin)
router.get('/boys/available', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone_number, status
       FROM public.users 
       WHERE user_type = 'delivery_boy' AND status = 'active'
       ORDER BY full_name ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get delivery boys error:', error);
    res.status(500).json({ error: 'Failed to get delivery boys' });
  }
});

module.exports = router;
