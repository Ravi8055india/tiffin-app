const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { authMiddleware } = require('../middleware/auth');

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, phone, fullName, userType = 'customer', referralCode } = req.body;

    if (!email || !phone || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const userId = require('uuid').v4();
    const result = await pool.query(
      `INSERT INTO public.users (id, email, phone_number, full_name, user_type, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [userId, email, phone, fullName, userType]
    );

    const user = result.rows[0];

    // Initialize wallet with ₹1000 for testing
    await pool.query(
      'INSERT INTO public.wallet (user_id, balance) VALUES ($1, 1000)',
      [user.id]
    );

    // Handle referral code if provided
    if (referralCode) {
      try {
        const referrer = await pool.query(
          'SELECT referrer_id FROM public.referrals WHERE referral_code = $1 LIMIT 1',
          [referralCode]
        );

        if (referrer.rows.length > 0) {
          await pool.query(
            `INSERT INTO public.referrals (referrer_id, referred_user_id, referral_code, is_claimed, claimed_at)
             VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)`,
            [referrer.rows[0].referrer_id, user.id, referralCode]
          );
        }
      } catch (refErr) {
        console.error('Referral processing error during signup:', refErr);
      }
    }

    // Create a unique referral code for the NEW user
    const newUserReferralCode = `REF${require('uuid').v4().slice(0, 8).toUpperCase()}`;
    await pool.query(
      'INSERT INTO public.referrals (referrer_id, referral_code) VALUES ($1, $2)',
      [user.id, newUserReferralCode]
    );

    const token = generateToken(userId, userType);

    res.json({
      user: result.rows[0],
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user (via OTP - simplified for backend)
router.post('/login-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // In production, you'd send an OTP here
    // For now, we'll just verify the user exists
    const result = await pool.query(
      'SELECT id, phone_number, full_name, user_type FROM public.users WHERE phone_number = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const token = generateToken(user.id, user.user_type);

    res.json({
      user,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    // In production, verify the OTP from your OTP service
    // This is a simplified version
    const result = await pool.query(
      'SELECT id, full_name, user_type FROM public.users WHERE phone_number = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const token = generateToken(user.id, user.user_type);

    res.json({
      user,
      token,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, phone_number, full_name, user_type, address, city, pincode, profile_image_url FROM public.users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone, address, city, pincode, profileImageUrl } = req.body;

    const result = await pool.query(
      `UPDATE public.users 
       SET full_name = COALESCE($1, full_name),
           phone_number = COALESCE($2, phone_number),
           address = COALESCE($3, address),
           city = COALESCE($4, city),
           pincode = COALESCE($5, pincode),
           profile_image_url = COALESCE($6, profile_image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, email, phone_number, full_name, address, city, pincode`,
      [fullName, phone, address, city, pincode, profileImageUrl, req.user.userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
