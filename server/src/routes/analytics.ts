import express from 'express';
import { db } from '../../db';
import { authenticateAdmin } from '../../middleware/auth';
import { bookings, vehicles, users } from '@shared/schema';
import { sql } from 'drizzle-orm';

const router = express.Router();

// Get analytics data
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = from && to ? 
      sql`created_at >= ${from} AND created_at <= ${to}` : 
      sql`created_at >= NOW() - INTERVAL '30 days'`;

    // Get total revenue (sum of all successful bookings)
    const totalRevenue = await db
      .select({ total: sql<number>`COALESCE(SUM(total_price), 0)` })
      .from(bookings)
      .where(sql`status = 'completed' AND ${dateFilter}`);

    // Get total bookings
    const totalBookings = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(dateFilter);

    // Get active users (users who have made at least one booking)
    const activeUsers = await db
      .select({ count: sql<number>`COUNT(DISTINCT user_id)` })
      .from(bookings)
      .where(dateFilter);

    // Get available vehicles
    const availableVehicles = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(vehicles)
      .where(sql`availability = true`);

    // Get revenue by day
    const revenueByDay = await db
      .select({
        date: sql<string>`DATE(created_at)`,
        revenue: sql<number>`COALESCE(SUM(total_price), 0)`,
      })
      .from(bookings)
      .where(sql`status = 'completed' AND ${dateFilter}`)
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    // Get bookings by day
    const bookingsByDay = await db
      .select({
        date: sql<string>`DATE(created_at)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(bookings)
      .where(dateFilter)
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    // Get vehicle type distribution
    const vehicleTypeDistribution = await db
      .select({
        type: vehicles.type,
        count: sql<number>`COUNT(*)`,
      })
      .from(vehicles)
      .groupBy(vehicles.type);

    // Calculate KPIs
    const averageBookingValue = totalRevenue[0].total / (totalBookings[0].count || 1);
    const bookingCompletionRate = (totalBookings[0].count / (totalBookings[0].count || 1)) * 100;
    const vehicleUtilization = (totalBookings[0].count / (availableVehicles[0].count || 1)) * 100;

    // Get previous period data for comparison
    const previousPeriodFilter = from && to ? 
      sql`created_at >= ${from} - INTERVAL '30 days' AND created_at < ${from}` : 
      sql`created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'`;

    const previousRevenue = await db
      .select({ total: sql<number>`COALESCE(SUM(total_price), 0)` })
      .from(bookings)
      .where(sql`status = 'completed' AND ${previousPeriodFilter}`);

    const previousBookings = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(previousPeriodFilter);

    // Calculate trends
    const revenueTrend = previousRevenue[0].total ? 
      ((totalRevenue[0].total - previousRevenue[0].total) / previousRevenue[0].total) * 100 : 0;
    
    const bookingsTrend = previousBookings[0].count ? 
      ((totalBookings[0].count - previousBookings[0].count) / previousBookings[0].count) * 100 : 0;

    res.json({
      totalRevenue: totalRevenue[0].total,
      totalBookings: totalBookings[0].count,
      activeUsers: activeUsers[0].count,
      availableVehicles: availableVehicles[0].count,
      revenueByDay,
      bookingsByDay,
      vehicleTypeDistribution,
      kpis: {
        averageBookingValue,
        bookingCompletionRate,
        vehicleUtilization,
      },
      trends: {
        revenueTrend,
        bookingsTrend,
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router; 