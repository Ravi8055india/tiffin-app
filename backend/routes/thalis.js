const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Get all thalis (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.thalis WHERE is_active = true ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get thalis error:', error);
    res.status(500).json({ error: 'Failed to get thalis' });
  }
});

// Get single thali
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.thalis WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thali not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get thali error:', error);
    res.status(500).json({ error: 'Failed to get thali' });
  }
});

// Create thali (admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { name, description, price, cuisineType, servings, deliveryDays, imageUrl } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const result = await pool.query(
      `INSERT INTO public.thalis (name, description, price, cuisine_type, servings, delivery_days, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, price, cuisineType, servings, deliveryDays, imageUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create thali error:', error);
    res.status(500).json({ error: 'Failed to create thali' });
  }
});

// Update thali (admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { name, description, price, cuisineType, servings, deliveryDays, imageUrl, isActive } = req.body;

    const result = await pool.query(
      `UPDATE public.thalis 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           cuisine_type = COALESCE($4, cuisine_type),
           servings = COALESCE($5, servings),
           delivery_days = COALESCE($6, delivery_days),
           image_url = COALESCE($7, image_url),
           is_active = COALESCE($8, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, description, price, cuisineType, servings, deliveryDays, imageUrl, isActive, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thali not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update thali error:', error);
    res.status(500).json({ error: 'Failed to update thali' });
  }
});

// Delete thali (admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM public.thalis WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thali not found' });
    }

    res.json({ message: 'Thali deleted successfully' });
  } catch (error) {
    console.error('Delete thali error:', error);
    res.status(500).json({ error: 'Failed to delete thali' });
  }
});

module.exports = router;
