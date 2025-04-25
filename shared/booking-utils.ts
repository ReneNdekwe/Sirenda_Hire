import { differenceInDays, isWithinInterval } from 'date-fns';
import { db } from '../server/db';
import { bookings, vehicles } from './schema';
import { and, eq, or, between, lte, gte } from 'drizzle-orm';


export async function isVehicleAvailable(
  vehicleId: number,
  pickupDate: Date,
  returnDate: Date
): Promise<boolean> {
  // Convert dates to ISO strings for database comparison
  const pickupStr = pickupDate.toISOString().split('T')[0];
  const returnStr = returnDate.toISOString().split('T')[0];

  // Get all non-cancelled bookings for the vehicle
  const existingBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.vehicleId, vehicleId),
        eq(bookings.status, 'confirmed')
      )
    );

  // Check for date conflicts
  const hasConflict = existingBookings.some(booking => {
    const existingPickup = new Date(booking.pickupDate);
    const existingReturn = new Date(booking.returnDate);

    // Normalize all dates to start of day for comparison
    existingPickup.setHours(0, 0, 0, 0);
    existingReturn.setHours(0, 0, 0, 0);
    const newPickup = new Date(pickupStr);
    const newReturn = new Date(returnStr);
    newPickup.setHours(0, 0, 0, 0);
    newReturn.setHours(0, 0, 0, 0);

    // Check for any overlap
    return (
      (newPickup <= existingReturn && newReturn >= existingPickup) ||
      (existingPickup <= newReturn && existingReturn >= newPickup)
    );
  });

  return !hasConflict;
}

export function calculateTotalPrice(
  pricePerDay: number,
  pickupDate: Date,
  returnDate: Date,
  includeInsurance: boolean = false
): {
  basePrice: number;
  serviceFee: number;
  insurance: number;
  totalPrice: number;
} {
  // Calculate number of days
  const days = differenceInDays(returnDate, pickupDate) + 1; // Include both start and end days
  const basePriceTotal = pricePerDay * days;
  const serviceFee = Math.round(basePriceTotal * 0.1); // 10% service fee
  const insurance = includeInsurance ? Math.round(basePriceTotal * 0.05) : 0; // 5% insurance fee if included

  return {
    basePrice: basePriceTotal,
    serviceFee,
    insurance,
    totalPrice: basePriceTotal + serviceFee + insurance
  };
}

export async function createBookingRequest(
  vehicleId: number,
  userId: number,
  pickupDate: Date,
  returnDate: Date
): Promise<number | null> {
  // Check vehicle availability
  const isAvailable = await isVehicleAvailable(vehicleId, pickupDate, returnDate);
  if (!isAvailable) {
    return null;
  }

  // Get vehicle price
  const vehicle = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle.length) {
    return null;
  }

  // Calculate price
  const totalPrice = vehicle[0].pricePerDay * differenceInDays(returnDate, pickupDate);

  // Convert dates to ISO strings for database
  const pickupStr = pickupDate.toISOString().split('T')[0];
  const returnStr = returnDate.toISOString().split('T')[0];

  // Create booking
  const [booking] = await db
    .insert(bookings)
    .values({
      vehicleId,
      userId,
      pickupDate: pickupStr,
      returnDate: returnStr,
      totalPrice,
      status: 'pending',
    })
    .returning({ id: bookings.id });

  return booking.id;
}

/**
 * Updates the status of a booking.
 * 
 * @param bookingId The ID of the booking to update.
 * @param newStatus The new status of the booking.
 * @returns A promise that resolves to true if the update was successful, false otherwise.
 */
export async function updateBookingStatus(
  bookingId: number,
  newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<boolean> {
  try {
    await db
      .update(bookings)
      .set({
        status: newStatus
      })
      .where(eq(bookings.id, bookingId));
    return true;
  } catch (error) {
    console.error('Error updating booking status:', error);
    return false;
  }
}

export async function updatePaymentStatus(
  bookingId: number,
  newStatus: 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed',
  paymentIntentId?: string
): Promise<boolean> {
  try {
    await db
      .update(bookings)
      .set({
        paymentStatus: newStatus,
        paymentIntentId,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId));
    return true;
  } catch (error) {
    console.error('Error updating payment status:', error);
    return false;
  }
}

/**
 * Updates the status of confirmed bookings to completed if their return date has passed.
 * This function should be called periodically (e.g., daily) to maintain booking statuses.
 * 
 * @returns A promise that resolves to the number of bookings updated
 */
export async function updateCompletedBookings(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all confirmed bookings where return date has passed
  const completedBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, 'confirmed'),
        lte(bookings.returnDate, today.toISOString().split('T')[0])
      )
    );

  // Update each booking's status to completed
  let updatedCount = 0;
  for (const booking of completedBookings) {
    const success = await updateBookingStatus(booking.id, 'completed');
    if (success) {
      updatedCount++;
    }
  }

  return updatedCount;
}
