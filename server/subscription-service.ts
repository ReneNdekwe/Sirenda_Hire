import { storage } from './storage';
import { User } from '@shared/schema';
import { add } from 'date-fns';

// Constants
const TRIAL_PERIOD_DAYS = 30;
const MONTHLY_SUBSCRIPTION_AMOUNT = 10; // in USD

/**
 * Service to handle company subscription logic
 */
export class SubscriptionService {
  /**
   * Initialize a new rental company with a trial period
   */
  async setupNewCompanyTrial(userId: number): Promise<User | undefined> {
    const user = await storage.getUser(userId);
    
    if (!user || user.userType !== 'company') {
      return undefined;
    }
    
    // Set trial end date to 30 days from now
    const trialEndsAt = add(new Date(), { days: TRIAL_PERIOD_DAYS });
    
    return await storage.updateUser(userId, {
      subscriptionStatus: 'trial',
      trialEndsAt,
    });
  }
  
  /**
   * Process subscription payment and update status
   */
  async processSubscriptionPayment(userId: number): Promise<User | undefined> {
    const user = await storage.getUser(userId);
    
    if (!user || user.userType !== 'company') {
      return undefined;
    }
    
    // Calculate new subscription end date (30 days from now, or 30 days from previous end if still valid)
    const now = new Date();
    let newSubscriptionEndsAt = add(now, { days: 30 });
    
    if (user.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > now) {
      // If subscription is still active, add 30 days to current end date
      newSubscriptionEndsAt = add(new Date(user.subscriptionEndsAt), { days: 30 });
    }
    
    // Update subscription status
    return await storage.updateUser(userId, {
      subscriptionStatus: 'active',
      subscriptionEndsAt: newSubscriptionEndsAt,
    });
  }
  
  /**
   * Check if a company's subscription has expired and update status if needed
   */
  async checkSubscriptionStatus(userId: number): Promise<string> {
    const user = await storage.getUser(userId);
    
    if (!user || user.userType !== 'company') {
      return 'not-applicable';
    }
    
    const now = new Date();
    
    // If in trial period
    if (user.subscriptionStatus === 'trial') {
      if (!user.trialEndsAt || new Date(user.trialEndsAt) <= now) {
        // Trial has ended
        await storage.updateUser(userId, { subscriptionStatus: 'expired' });
        return 'trial-expired';
      }
      return 'trial';
    }
    
    // If paid subscription
    if (user.subscriptionStatus === 'active') {
      if (!user.subscriptionEndsAt || new Date(user.subscriptionEndsAt) <= now) {
        // Subscription has expired
        await storage.updateUser(userId, { subscriptionStatus: 'expired' });
        return 'subscription-expired';
      }
      return 'active';
    }
    
    return user.subscriptionStatus || 'expired';
  }
  
  /**
   * Get subscription details for a company
   */
  async getSubscriptionDetails(userId: number): Promise<{
    status: string;
    trialEndsAt?: Date;
    subscriptionEndsAt?: Date;
    daysRemaining: number;
    monthlyFee: number;
  }> {
    const user = await storage.getUser(userId);
    
    if (!user || user.userType !== 'company') {
      return {
        status: 'not-applicable',
        daysRemaining: 0,
        monthlyFee: MONTHLY_SUBSCRIPTION_AMOUNT
      };
    }
    
    // Make sure status is up to date
    const status = await this.checkSubscriptionStatus(userId);
    
    const now = new Date();
    let daysRemaining = 0;
    
    if (status === 'trial' && user.trialEndsAt) {
      const endDate = new Date(user.trialEndsAt);
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    } else if (status === 'active' && user.subscriptionEndsAt) {
      const endDate = new Date(user.subscriptionEndsAt);
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }
    
    return {
      status,
      trialEndsAt: user.trialEndsAt ? new Date(user.trialEndsAt) : undefined,
      subscriptionEndsAt: user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : undefined,
      daysRemaining,
      monthlyFee: MONTHLY_SUBSCRIPTION_AMOUNT
    };
  }
  
  /**
   * Check all company subscriptions and update expired ones
   * This should be run periodically (e.g., daily)
   */
  async checkAllSubscriptions(): Promise<{
    checked: number;
    expired: number;
  }> {
    // Get all companies
    const users = await storage.getAllUsers({ userType: 'company' });
    let expiredCount = 0;
    
    // Check each company's subscription
    for (const user of users) {
      const status = await this.checkSubscriptionStatus(user.id);
      if (status === 'trial-expired' || status === 'subscription-expired') {
        expiredCount++;
      }
    }
    
    return {
      checked: users.length,
      expired: expiredCount
    };
  }
}

export const subscriptionService = new SubscriptionService();