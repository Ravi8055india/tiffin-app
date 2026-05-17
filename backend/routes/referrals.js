const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Generate referral code
router.post('/generate-code', authMiddleware, async (req, res) => {
  try {
    const referralCode = `REF${uuidv4().slice(0, 8).toUpperCase()}`;

    // Save referral code
    const result = await pool.query(
      `INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code)
       VALUES ($1, $1, $2)
       RETURNING referral_code`,
      [req.user.userId, referralCode]
    );

    res.json({
      referralCode: result.rows[0].referral_code,
      message: 'Referral code generated'
    });
  } catch (error) {
    console.error('Generate referral code error:', error);
    res.status(500).json({ error: 'Failed to generate referral code' });
  }
});

// Get user's referral code
router.get('/code', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT referral_code FROM public.referrals 
       WHERE referrer_id = $1 LIMIT 1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No referral code found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get referral code error:', error);
    res.status(500).json({ error: 'Failed to get referral code' });
  }
});

// Apply referral code (for new user)
router.post('/apply-code', authMiddleware, async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code required' });
    }

    // Find referrer
    const referrer = await pool.query(
      `SELECT referrer_id FROM public.referrals 
       WHERE referral_code = $1 AND is_claimed = false
       LIMIT 1`,
      [referralCode]
    );

    if (referrer.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or already used referral code' });
    }

    const referrerId = referrer.rows[0].referrer_id;

    // Update referral record (linking referred_user_id, but do not award wallet bonus yet)
    const updateResult = await pool.query(
      `UPDATE public.referrals 
       SET referred_user_id = $1, is_claimed = true, claimed_at = CURRENT_TIMESTAMP
       WHERE referral_code = $2
       RETURNING *`,
      [req.user.userId, referralCode]
    );

    res.json({
      message: 'Referral code applied successfully. Reward will be added to referrer after your first order is completed.',
    });
  } catch (error) {
    console.error('Apply referral code error:', error);
    res.status(500).json({ error: 'Failed to apply referral code' });
  }
});

// Get referral statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_referrals,
        SUM(CASE WHEN is_claimed = true THEN 1 ELSE 0 END) as successful_referrals,
        COUNT(DISTINCT referred_user_id) as unique_referrals
       FROM public.referrals 
       WHERE referrer_id = $1`,
      [req.user.userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({ error: 'Failed to get referral statistics' });
  }
});

module.exports = router;
