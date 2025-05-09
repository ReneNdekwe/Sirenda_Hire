# Database Schema Documentation

This document provides detailed information about the Sirenda Hire database schema.

## Overview

The database uses PostgreSQL with Drizzle ORM for schema management. The schema consists of several tables that handle users, vehicles, bookings, and related data.

## Tables

### users

Stores user account information.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) NOT NULL, -- 'user' or 'company'
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'banned'
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### companies

Stores rental company information.

```sql
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  logo_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### vehicles

Stores vehicle information.

```sql
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### vehicle_features

Stores vehicle features.

```sql
CREATE TABLE vehicle_features (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  feature VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### vehicle_images

Stores vehicle images.

```sql
CREATE TABLE vehicle_images (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### bookings

Stores booking information.

```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
  return_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### reviews

Stores user reviews for vehicles.

```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);

-- Companies
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_location ON companies(location);

-- Vehicles
CREATE INDEX idx_vehicles_company_id ON vehicles(company_id);
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_location ON vehicles(location);
CREATE INDEX idx_vehicles_available ON vehicles(available);

-- Bookings
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(pickup_date, return_date);

-- Reviews
CREATE INDEX idx_reviews_vehicle_id ON reviews(vehicle_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
```

## Relationships

1. One-to-One:
   - `users` to `companies` (via `user_id`)

2. One-to-Many:
   - `companies` to `vehicles`
   - `vehicles` to `vehicle_features`
   - `vehicles` to `vehicle_images`
   - `users` to `bookings`
   - `vehicles` to `bookings`
   - `users` to `reviews`
   - `vehicles` to `reviews`

## Constraints

1. Foreign Key Constraints:
   - `companies.user_id` references `users.id`
   - `vehicles.company_id` references `companies.id`
   - `vehicle_features.vehicle_id` references `vehicles.id`
   - `vehicle_images.vehicle_id` references `vehicles.id`
   - `bookings.user_id` references `users.id`
   - `bookings.vehicle_id` references `vehicles.id`
   - `reviews.user_id` references `users.id`
   - `reviews.vehicle_id` references `vehicles.id`

2. Check Constraints:
   - `users.status` must be one of: 'active', 'suspended', 'banned'
   - `bookings.status` must be one of: 'pending', 'confirmed', 'cancelled', 'completed'
   - `reviews.rating` must be between 1 and 5

## Data Types

1. Primary Keys:
   - All tables use `SERIAL` (auto-incrementing integer)

2. Text Fields:
   - `VARCHAR(255)` for short text
   - `TEXT` for longer content

3. Numeric Fields:
   - `INTEGER` for whole numbers
   - `DECIMAL(10,2)` for currency values

4. Date/Time Fields:
   - `TIMESTAMP WITH TIME ZONE` for all date/time fields

5. Boolean Fields:
   - `BOOLEAN` for true/false values

## Migration Management

Database migrations are managed using Drizzle ORM. To create a new migration:

```bash
npm run db:generate
```

To apply migrations:

```bash
npm run db:migrate
```

## Backup and Recovery

1. Regular Backups:
   ```bash
   pg_dump -U username -d sirendahire > backup.sql
   ```

2. Restore from Backup:
   ```bash
   psql -U username -d sirendahire < backup.sql
   ```

## Performance Considerations

1. Index Usage:
   - Use appropriate indexes for frequently queried columns
   - Monitor index usage and adjust as needed

2. Query Optimization:
   - Use EXPLAIN ANALYZE to identify slow queries
   - Optimize joins and where clauses
   - Consider materialized views for complex queries

3. Connection Pooling:
   - Configure appropriate connection pool size
   - Monitor connection usage

## Security

1. Access Control:
   - Use role-based access control
   - Implement row-level security where needed

2. Data Protection:
   - Encrypt sensitive data
   - Use prepared statements to prevent SQL injection
   - Implement proper backup and recovery procedures 