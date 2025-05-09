# Testing Guide

This document provides comprehensive guidelines for testing the Sirenda Hire application.

## Testing Strategy

The project follows a multi-layered testing approach:

1. Unit Tests: Test individual components and functions
2. Integration Tests: Test component interactions and API endpoints
3. End-to-End Tests: Test complete user workflows
4. Performance Tests: Test application performance and load handling

## Test Setup

### Prerequisites

- Node.js (v18 or later)
- Jest
- React Testing Library
- Cypress
- k6 (for performance testing)

### Installation

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event cypress k6
```

### Configuration

1. Jest configuration (`jest.config.js`):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
};
```

2. Cypress configuration (`cypress.config.ts`):
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
```

## Unit Testing

### Component Testing

Example test for a React component:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { VehicleCard } from './VehicleCard';

describe('VehicleCard', () => {
  const mockVehicle = {
    id: 1,
    brand: 'Toyota',
    model: 'Camry',
    pricePerDay: 50,
  };

  it('renders vehicle information correctly', () => {
    render(<VehicleCard vehicle={mockVehicle} />);
    
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('$50/day')).toBeInTheDocument();
  });

  it('calls onBook when book button is clicked', () => {
    const onBook = jest.fn();
    render(<VehicleCard vehicle={mockVehicle} onBook={onBook} />);
    
    fireEvent.click(screen.getByText('Book Now'));
    expect(onBook).toHaveBeenCalledWith(mockVehicle.id);
  });
});
```

### Utility Function Testing

Example test for a utility function:

```typescript
import { calculateTotalPrice } from './pricing';

describe('calculateTotalPrice', () => {
  it('calculates total price correctly', () => {
    const pricePerDay = 50;
    const days = 5;
    const expectedTotal = 250;

    expect(calculateTotalPrice(pricePerDay, days)).toBe(expectedTotal);
  });

  it('handles decimal prices correctly', () => {
    const pricePerDay = 49.99;
    const days = 3;
    const expectedTotal = 149.97;

    expect(calculateTotalPrice(pricePerDay, days)).toBe(expectedTotal);
  });
});
```

## Integration Testing

### API Endpoint Testing

Example test for an API endpoint:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('Vehicle API', () => {
  it('returns list of vehicles', async () => {
    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('creates a new vehicle', async () => {
    const newVehicle = {
      brand: 'Honda',
      model: 'Civic',
      pricePerDay: 45,
    };

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', 'Bearer test-token')
      .send(newVehicle);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newVehicle);
  });
});
```

### Component Integration Testing

Example test for component integration:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { VehicleList } from './VehicleList';
import { VehicleProvider } from './VehicleContext';

describe('VehicleList Integration', () => {
  it('loads and displays vehicles', async () => {
    render(
      <VehicleProvider>
        <VehicleList />
      </VehicleProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getAllByTestId('vehicle-card')).toHaveLength(3);
  });
});
```

## End-to-End Testing

### Cypress Tests

Example Cypress test:

```typescript
describe('Vehicle Booking Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password');
  });

  it('completes booking process', () => {
    cy.visit('/vehicles');
    
    cy.get('[data-testid="vehicle-card"]').first().click();
    cy.get('[data-testid="book-now"]').click();
    
    cy.get('[data-testid="pickup-date"]').type('2024-03-01');
    cy.get('[data-testid="return-date"]').type('2024-03-05');
    
    cy.get('[data-testid="confirm-booking"]').click();
    
    cy.url().should('include', '/bookings');
    cy.get('[data-testid="booking-success"]').should('be.visible');
  });
});
```

## Performance Testing

### k6 Tests

Example k6 test:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  const response = http.get('http://localhost:3000/api/vehicles');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

## Test Coverage

Generate test coverage report:

```bash
npm test -- --coverage
```

Configure coverage thresholds in `jest.config.js`:

```javascript
module.exports = {
  // ... other config
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Continuous Integration

GitHub Actions workflow for testing:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Run performance tests
      run: npm run test:performance
```

## Best Practices

1. Test Organization:
   - Group related tests using `describe` blocks
   - Use meaningful test names
   - Keep tests focused and independent

2. Test Data:
   - Use factories for test data
   - Clean up test data after tests
   - Use realistic test data

3. Performance:
   - Mock external services
   - Use `beforeAll` and `afterAll` for setup/teardown
   - Keep tests fast and efficient

4. Maintenance:
   - Update tests when features change
   - Remove obsolete tests
   - Document test requirements

## Common Issues and Solutions

1. Async Tests:
   - Use `async/await` with `waitFor`
   - Handle loading states
   - Mock timers when needed

2. State Management:
   - Reset state between tests
   - Use test-specific state
   - Mock global state

3. API Testing:
   - Mock API responses
   - Handle error cases
   - Test rate limiting

4. UI Testing:
   - Use data-testid attributes
   - Test responsive behavior
   - Handle animations

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
- [k6 Documentation](https://k6.io/docs/) 