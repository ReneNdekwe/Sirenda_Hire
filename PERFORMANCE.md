# Performance Optimization Guide

This document provides comprehensive guidelines for optimizing the performance of the Sirenda Hire application.

## Frontend Optimization

### Code Splitting

1. Route-based code splitting:
```typescript
// Using React.lazy for dynamic imports
const HomePage = React.lazy(() => import('./pages/HomePage'));
const VehicleList = React.lazy(() => import('./pages/VehicleList'));
const BookingPage = React.lazy(() => import('./pages/BookingPage'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/vehicles" element={<VehicleList />} />
    <Route path="/bookings" element={<BookingPage />} />
  </Routes>
</Suspense>
```

2. Component-based code splitting:
```typescript
const VehicleCard = React.lazy(() => import('./components/VehicleCard'));
const BookingForm = React.lazy(() => import('./components/BookingForm'));
```

### Image Optimization

1. Lazy loading images:
```typescript
import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage
  src={vehicle.imageUrl}
  alt={vehicle.model}
  effect="blur"
  placeholderSrc={placeholderImage}
/>
```

2. Responsive images:
```typescript
<picture>
  <source
    media="(min-width: 1200px)"
    srcSet={`${imageUrl}-large.jpg 1200w`}
  />
  <source
    media="(min-width: 768px)"
    srcSet={`${imageUrl}-medium.jpg 768w`}
  />
  <img
    src={`${imageUrl}-small.jpg`}
    alt={vehicle.model}
    loading="lazy"
  />
</picture>
```

### State Management

1. Optimize re-renders:
```typescript
// Use React.memo for pure components
const VehicleCard = React.memo(({ vehicle, onBook }) => {
  return (
    <div className="vehicle-card">
      {/* Component content */}
    </div>
  );
});

// Use useCallback for event handlers
const handleBook = useCallback((vehicleId) => {
  // Booking logic
}, []);
```

2. Efficient state updates:
```typescript
// Use functional updates for state
const [vehicles, setVehicles] = useState([]);

const updateVehicle = useCallback((vehicleId, updates) => {
  setVehicles(prevVehicles => 
    prevVehicles.map(vehicle => 
      vehicle.id === vehicleId ? { ...vehicle, ...updates } : vehicle
    )
  );
}, []);
```

### Caching

1. Browser caching:
```typescript
// Cache API responses
const cacheVehicleData = async (vehicleId, data) => {
  const cache = await caches.open('vehicle-cache');
  await cache.put(`/api/vehicles/${vehicleId}`, new Response(JSON.stringify(data)));
};

// Retrieve from cache
const getCachedVehicle = async (vehicleId) => {
  const cache = await caches.open('vehicle-cache');
  const response = await cache.match(`/api/vehicles/${vehicleId}`);
  return response ? response.json() : null;
};
```

2. Local storage for user preferences:
```typescript
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};
```

## Backend Optimization

### Database Optimization

1. Query optimization:
```typescript
// Use indexes effectively
const getVehicles = async (filters) => {
  return await db.query.vehicles.findMany({
    where: {
      AND: [
        { category: filters.category },
        { pricePerDay: { gte: filters.minPrice, lte: filters.maxPrice } },
        { location: filters.location }
      ]
    },
    orderBy: { pricePerDay: 'asc' },
    take: 20,
    skip: (filters.page - 1) * 20
  });
};
```

2. Connection pooling:
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Use pool for queries
const getVehicle = async (id) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM vehicles WHERE id = $1',
      [id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};
```

### Caching

1. Redis caching:
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const getCachedVehicles = async (filters) => {
  const cacheKey = `vehicles:${JSON.stringify(filters)}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }

  const vehicles = await getVehicles(filters);
  await redis.setex(cacheKey, 3600, JSON.stringify(vehicles));
  return vehicles;
};
```

2. Response caching:
```typescript
import apicache from 'apicache';

const cache = apicache.middleware;

// Cache API responses
app.get('/api/vehicles', cache('5 minutes'), async (req, res) => {
  const vehicles = await getVehicles(req.query);
  res.json(vehicles);
});
```

### API Optimization

1. Pagination:
```typescript
const getPaginatedVehicles = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  
  const [vehicles, total] = await Promise.all([
    db.query.vehicles.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    db.query.vehicles.count()
  ]);

  return {
    data: vehicles,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
```

2. Batch processing:
```typescript
const updateMultipleVehicles = async (updates) => {
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < updates.length; i += batchSize) {
    batches.push(updates.slice(i, i + batchSize));
  }

  const results = await Promise.all(
    batches.map(batch => 
      db.query.vehicles.updateMany({
        where: { id: { in: batch.map(u => u.id) } },
        data: batch.reduce((acc, curr) => ({
          ...acc,
          [curr.id]: curr.updates
        }), {})
      })
    )
  );

  return results.flat();
};
```

## Monitoring and Metrics

### Performance Monitoring

1. Frontend monitoring:
```typescript
// Track page load times
const trackPageLoad = () => {
  const timing = window.performance.timing;
  const loadTime = timing.loadEventEnd - timing.navigationStart;
  
  // Send to analytics
  analytics.track('page_load', { loadTime });
};

// Track component render times
const useRenderTime = (componentName) => {
  useEffect(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      analytics.track('component_render', {
        component: componentName,
        duration: end - start
      });
    };
  }, [componentName]);
};
```

2. Backend monitoring:
```typescript
import prometheus from 'prom-client';

// Define metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

// Track request duration
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route?.path || 'unknown', res.statusCode)
      .observe(duration / 1000);
  });
  next();
});
```

### Error Tracking

1. Frontend error tracking:
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Send to error tracking service
    errorTracking.captureException(error, {
      componentStack: errorInfo.componentStack
    });
  }
  
  render() {
    return this.props.children;
  }
}
```

2. Backend error tracking:
```typescript
// Error handling middleware
app.use((err, req, res, next) => {
  // Log error
  logger.error('Unhandled error', {
    error: err,
    request: {
      method: req.method,
      url: req.url,
      body: req.body
    }
  });

  // Send to error tracking service
  errorTracking.captureException(err);

  res.status(500).json({
    error: 'Internal server error'
  });
});
```

## Best Practices

1. Code Organization:
   - Keep components small and focused
   - Use proper file structure
   - Implement tree shaking
   - Minimize bundle size

2. Asset Optimization:
   - Compress images
   - Use modern image formats
   - Implement proper caching
   - Use CDN for static assets

3. Database:
   - Use appropriate indexes
   - Optimize queries
   - Implement connection pooling
   - Use database caching

4. API Design:
   - Implement proper pagination
   - Use batch operations
   - Implement caching
   - Optimize response size

5. Monitoring:
   - Track performance metrics
   - Monitor error rates
   - Set up alerts
   - Regular performance audits

## Tools and Resources

1. Performance Tools:
   - Chrome DevTools
   - Lighthouse
   - WebPageTest
   - GTmetrix

2. Monitoring Tools:
   - Prometheus
   - Grafana
   - New Relic
   - Datadog

3. Optimization Libraries:
   - React.lazy
   - React.memo
   - useCallback
   - useMemo

4. Resources:
   - [React Performance Optimization](https://reactjs.org/docs/optimizing-performance.html)
   - [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/performance-best-practices/)
   - [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
   - [Web Performance Optimization](https://web.dev/fast/) 