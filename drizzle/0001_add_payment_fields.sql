-- Add payment fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS has_driver BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS has_car_wash BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS has_home_delivery BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- Add constraint for payment_status enum values
ALTER TABLE bookings 
ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('pending', 'authorized', 'captured', 'refunded', 'failed')); 