import { Router } from 'express';
import db from '../_helpers/db';

const router = Router();

router.get('/test', async (req, res) => {
  try {
    // Test Sequelize connection by calling authenticate()
    await db.sequelize.authenticate();
    
    // Also run a simple query to ensure full connectivity
    const [result] = await db.sequelize.query('SELECT 1 + 1 AS result');
    
    res.json({
      success: true,
      message: 'Database connection successful',
      result: result[0]
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;