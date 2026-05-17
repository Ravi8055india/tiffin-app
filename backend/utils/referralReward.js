const pool = require('../config/database');

async function rewardReferrerIfEligible(userId, orderId) {
  try {
    // 1. Check if this user was referred and has a pending referral bonus (bonus_amount is null)
    const referralRes = await pool.query(
      `SELECT id, referrer_id FROM public.referrals 
       WHERE referred_user_id = $1 AND is_claimed = true AND bonus_amount IS NULL
       LIMIT 1`,
      [userId]
    );

    if (referralRes.rows.length === 0) {
      console.log(`No pending referral reward found for user: ${userId}`);
      return;
    }

    const referral = referralRes.rows[0];
    const referrerId = referral.referrer_id;
    const rewardAmount = parseFloat(process.env.REFERRAL_REWARD_AMOUNT || 100);

    // 2. Fetch referrer's wallet
    const walletRes = await pool.query(
      `SELECT id FROM public.wallet WHERE user_id = $1`,
      [referrerId]
    );

    let walletId;
    if (walletRes.rows.length === 0) {
      // Create wallet if it doesn't exist (safety fallback)
      const newWalletRes = await pool.query(
        `INSERT INTO public.wallet (user_id, balance, total_earned) 
         VALUES ($1, $2, $2) RETURNING id`,
        [referrerId, rewardAmount]
      );
      walletId = newWalletRes.rows[0].id;
    } else {
      walletId = walletRes.rows[0].id;
      // Update referrer's wallet balance
      await pool.query(
        `UPDATE public.wallet 
         SET balance = balance + $1, total_earned = total_earned + $1
         WHERE id = $2`,
        [rewardAmount, walletId]
      );
    }

    // 3. Mark the referral record as rewarded (set bonus_amount)
    await pool.query(
      `UPDATE public.referrals 
       SET bonus_amount = $1, claimed_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [rewardAmount, referral.id]
    );

    // 4. Create transaction record
    await pool.query(
      `INSERT INTO public.wallet_transactions (wallet_id, transaction_type, amount, description, order_id)
       VALUES ($1, 'referral_reward', $2, $3, $4)`,
      [walletId, rewardAmount, `Referral reward for user order completion`, orderId]
    );

    console.log(`Successfully rewarded referrer: ${referrerId} with ₹${rewardAmount} for order: ${orderId}`);
  } catch (error) {
    console.error('Error in rewardReferrerIfEligible:', error);
  }
}

module.exports = { rewardReferrerIfEligible };
