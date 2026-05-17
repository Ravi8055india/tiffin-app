const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get subscription plans with tiered discounts
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'weekly',
      name: 'Weekly Plan',
      description: 'Perfect for testing our fresh daily kitchen meals',
      durationDays: 7,
      discountPercent: 10,
      badge: '10% OFF'
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      description: 'Most popular plan for balanced, stress-free daily meals',
      durationDays: 30,
      discountPercent: 15,
      badge: '15% OFF'
    },
    {
      id: 'three_months',
      name: '3-Month Plan',
      description: 'Unbeatable value for long-term health and nutrition commitments',
      durationDays: 90,
      discountPercent: 20,
      badge: '20% OFF'
    }
  ];
  res.json(plans);
});

// Create subscription
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { thaliId, startDate, endDate, frequency, quantity, totalPrice } = req.body;

    if (!thaliId || !startDate || !frequency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO public.subscriptions 
       (user_id, thali_id, start_date, end_date, frequency, quantity, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.userId, thaliId, startDate, endDate || null, frequency, quantity || 1, totalPrice]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Get user's subscriptions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, t.name as thali_name, t.price as thali_price
       FROM public.subscriptions s
       JOIN public.thalis t ON s.thali_id = t.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to get subscriptions' });
  }
});

// Get single subscription
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, t.name as thali_name, t.price as thali_price
       FROM public.subscriptions s
       JOIN public.thalis t ON s.thali_id = t.id
       WHERE s.id = $1 AND s.user_id = $2`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Update subscription
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { endDate, frequency, quantity, status, autoRenewal } = req.body;

    const result = await pool.query(
      `UPDATE public.subscriptions 
       SET end_date = COALESCE($1, end_date),
           frequency = COALESCE($2, frequency),
           quantity = COALESCE($3, quantity),
           status = COALESCE($4, status),
           auto_renewal = COALESCE($5, auto_renewal),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [endDate || null, frequency, quantity, status, autoRenewal, req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Cancel subscription
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE public.subscriptions 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Subscription cancelled', subscription: result.rows[0] });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Pause subscription
router.post('/:id/pause', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE public.subscriptions 
       SET status = 'paused', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Subscription paused', subscription: result.rows[0] });
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({ error: 'Failed to pause subscription' });
  }
});

module.exports = router;
