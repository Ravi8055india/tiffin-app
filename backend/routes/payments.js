const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ error: 'Amount and Order ID required' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: orderId,
      notes: {
        userId: req.user.userId,
        orderId: orderId,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save payment record
    await pool.query(
      `INSERT INTO public.payments (order_id, user_id, amount, payment_method, razorpay_order_id, payment_status)
       VALUES ($1, $2, $3, 'razorpay', $4, 'pending')`,
      [orderId, req.user.userId, amount, razorpayOrder.id]
    );

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = req.body;

    // Verify signature
    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpaySignature !== expectedSign) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update payment record
    const result = await pool.query(
      `UPDATE public.payments 
       SET payment_status = 'completed', razorpay_payment_id = $1
       WHERE razorpay_order_id = $2 AND order_id = $3
       RETURNING *`,
      [razorpayPaymentId, razorpayOrderId, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Update order status
    await pool.query(
      `UPDATE public.orders 
       SET payment_status = 'completed', order_status = 'confirmed'
       WHERE id = $1`,
      [orderId]
    );

    res.json({
      message: 'Payment verified successfully',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get user's payment history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, o.id as order_id, t.name as thali_name
       FROM public.payments p
       LEFT JOIN public.orders o ON p.order_id = o.id
       LEFT JOIN public.thalis t ON o.thali_id = t.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

// Webhook for Razorpay payment status (optional)
router.post('/webhook', async (req, res) => {
  try {
    const { type, payload } = req.body;

    if (type === 'payment.authorized' || type === 'payment.captured') {
      const { order: { id: razorpayOrderId }, id: razorpayPaymentId } = payload;

      // Update payment status
      await pool.query(
        `UPDATE public.payments 
         SET payment_status = 'completed', razorpay_payment_id = $1
         WHERE razorpay_order_id = $2`,
        [razorpayPaymentId, razorpayOrderId]
      );
    }

    res.json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
