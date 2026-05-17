const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get wallet balance
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, user_id, balance, total_earned FROM public.wallet WHERE user_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Failed to get wallet' });
  }
});

// Get wallet transactions
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT wt.* FROM public.wallet_transactions wt
       JOIN public.wallet w ON wt.wallet_id = w.id
       WHERE w.user_id = $1
       ORDER BY wt.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Add money to wallet
router.post('/add-money', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get wallet
    const wallet = await pool.query(
      'SELECT id FROM public.wallet WHERE user_id = $1',
      [req.user.userId]
    );

    if (wallet.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const walletId = wallet.rows[0].id;

    // Update wallet balance
    const updateResult = await pool.query(
      `UPDATE public.wallet 
       SET balance = balance + $1, total_earned = total_earned + $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [amount, amount, walletId]
    );

    // Create transaction record
    await pool.query(
      `INSERT INTO public.wallet_transactions (wallet_id, transaction_type, amount, description)
       VALUES ($1, 'credit', $2, 'Money added to wallet')`,
      [walletId, amount]
    );

    res.json({
      message: 'Money added successfully',
      wallet: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({ error: 'Failed to add money' });
  }
});

// Deduct from wallet (for payments)
router.post('/deduct', authMiddleware, async (req, res) => {
  try {
    const { amount, orderId, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get wallet
    const wallet = await pool.query(
      'SELECT id, balance FROM public.wallet WHERE user_id = $1',
      [req.user.userId]
    );

    if (wallet.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const walletData = wallet.rows[0];

    if (walletData.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update wallet balance
    const updateResult = await pool.query(
      `UPDATE public.wallet 
       SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [amount, walletData.id]
    );

    // Create transaction record
    await pool.query(
      `INSERT INTO public.wallet_transactions (wallet_id, transaction_type, amount, description, order_id)
       VALUES ($1, 'debit', $2, $3, $4)`,
      [walletData.id, amount, description || 'Payment from wallet', orderId || null]
    );

    res.json({
      message: 'Deduction successful',
      wallet: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Deduct error:', error);
    res.status(500).json({ error: 'Failed to deduct amount' });
  }
});

module.exports = router;
