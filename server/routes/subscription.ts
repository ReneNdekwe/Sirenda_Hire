import { Router } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get user's subscription details
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      subscriptionStatus: true,
      trialEndsAt: true,
      subscriptionEndsAt: true
    }
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

export default router; 