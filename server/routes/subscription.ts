import { Router } from 'express';
import { db } from '../db';
import { users } from '../schema';
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
      subscriptionTier: true,
      subscriptionStatus: true,
      trialEndsAt: true
    }
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

// Update user's subscription tier
router.post('/update-tier', authenticateToken, async (req, res) => {
  const userId = req.user?.id;
  const { tier } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!tier || !['basic', 'pro', 'enterprise'].includes(tier)) {
    return res.status(400).json({ message: 'Invalid subscription tier' });
  }

  await db.update(users)
    .set({ 
      subscriptionTier: tier,
      subscriptionStatus: 'active'
    })
    .where(eq(users.id, userId));

  res.json({ message: 'Subscription updated successfully' });
});

export default router; 