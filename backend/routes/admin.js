const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Get dashboard metrics
router.get('/metrics', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get today's metrics
    const todayMetrics = await pool.query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_price), 0) as total_revenue,
        COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders
       FROM public.orders 
       WHERE DATE(delivery_date) = $1`,
      [today]
    );

    // Get active subscriptions
    const subscriptions = await pool.query(
      `SELECT COUNT(*) as active_subscriptions
       FROM public.subscriptions 
       WHERE status = 'active'`
    );

    // Get total users
    const users = await pool.query(
      `SELECT COUNT(*) as total_customers
       FROM public.users 
       WHERE user_type = 'customer'`
    );

    // Get active delivery boys
    const deliveryBoys = await pool.query(
      `SELECT COUNT(*) as active_delivery_boys
       FROM public.users 
       WHERE user_type = 'delivery_boy' AND status = 'active'`
    );

    // Get pending payments
    const pendingPayments = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as pending_amount
       FROM public.payments 
       WHERE payment_status = 'pending'`
    );

    res.json({
      today: todayMetrics.rows[0],
      activeSubscriptions: subscriptions.rows[0].active_subscriptions,
      totalCustomers: users.rows[0].total_customers,
      activeDeliveryBoys: deliveryBoys.rows[0].active_delivery_boys,
      pendingPayments: pendingPayments.rows[0].pending_amount,
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Get revenue report
router.get('/revenue', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const days = req.query.days || 30;

    const result = await pool.query(
      `SELECT 
        DATE(delivery_date) as date,
        COUNT(*) as total_orders,
        COALESCE(SUM(total_price), 0) as total_revenue,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments
       FROM public.orders 
       WHERE DATE(delivery_date) >= CURRENT_DATE - INTERVAL '1 day' * $1
       GROUP BY DATE(delivery_date)
       ORDER BY date DESC`,
      [days]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: 'Failed to get revenue report' });
  }
});

// Get orders report
router.get('/orders', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const status = req.query.status;
    let query = `SELECT 
      o.id, o.delivery_date, o.order_status, o.payment_status, o.total_price,
      u.full_name as customer_name, u.phone_number, t.name as thali_name
     FROM public.orders o
     JOIN public.users u ON o.user_id = u.id
     JOIN public.thalis t ON o.thali_id = t.id`;
    
    const params = [];
    
    if (status) {
      query += ` WHERE o.order_status = $1`;
      params.push(status);
    }
    
    query += ` ORDER BY o.delivery_date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Manage users
router.get('/users', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const userType = req.query.userType;
    let query = 'SELECT id, email, full_name, phone_number, user_type, status, created_at FROM public.users';
    const params = [];

    if (userType) {
      query += ' WHERE user_type = $1';
      params.push(userType);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user status
router.put('/users/:userId/status', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const result = await pool.query(
      `UPDATE public.users 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get payment details
router.get('/payments', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, o.id as order_id, u.full_name, t.name as thali_name
       FROM public.payments p
       LEFT JOIN public.orders o ON p.order_id = o.id
       LEFT JOIN public.users u ON p.user_id = u.id
       LEFT JOIN public.thalis t ON o.thali_id = t.id
       ORDER BY p.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

// Get thalis analytics
router.get('/thalis-analytics', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        t.id, t.name, t.price,
        COUNT(o.id) as total_orders,
        COUNT(DISTINCT s.id) as active_subscriptions,
        COALESCE(SUM(o.total_price), 0) as revenue
       FROM public.thalis t
       LEFT JOIN public.orders o ON t.id = o.thali_id
       LEFT JOIN public.subscriptions s ON t.id = s.thali_id AND s.status = 'active'
       GROUP BY t.id, t.name, t.price
       ORDER BY revenue DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get thalis analytics error:', error);
    res.status(500).json({ error: 'Failed to get thalis analytics' });
  }
});

module.exports = router;
