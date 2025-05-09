# Contributing to Sirenda Hire

Thank you for your interest in contributing to Sirenda Hire! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (or use the provided Docker setup)
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/sirenda_hire

# Server Configuration
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-session-secret

# Frontend Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Sirenda Hire

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880 # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# Logging
LOG_LEVEL=debug

# Security
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sirenda-hire.git
   cd sirenda-hire
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development environment:
   ```bash
   docker-compose up -d
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   npm run dev:server

   # Terminal 2 - Frontend
   npm run dev:client
   ```

## Code Style Guide

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Use interfaces for object types
- Prefer type inference where possible
- Document complex types

### React Components

- Use functional components with hooks
- Follow the single responsibility principle
- Use proper prop types
- Implement error boundaries
- Use React.memo for performance optimization

### Styling

- Use Tailwind CSS for styling
- Follow the mobile-first approach
- Use CSS variables for theming
- Keep styles modular and reusable

### Database

- Use Drizzle ORM for database operations
- Create migrations for schema changes
- Follow naming conventions:
  - Tables: snake_case
  - Columns: snake_case
  - Foreign keys: table_name_id

## Testing

### Unit Tests

- Write tests for critical functionality
- Use Jest for backend tests
- Use React Testing Library for frontend tests
- Maintain test coverage above 80%

### Integration Tests

- Test API endpoints
- Test database operations
- Test authentication flows
- Test file uploads

## Git Workflow

1. Create a new branch for each feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push your changes:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request:
   - Use the PR template
   - Describe your changes
   - Link related issues
   - Request reviews

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Test changes
- chore: Maintenance tasks

## Pull Request Process

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
6. Address review comments
7. Merge after approval

## Code Review Guidelines

- Review code for functionality and style
- Check for security vulnerabilities
- Ensure proper error handling
- Verify test coverage
- Check for performance issues

## Documentation

- Update README.md for major changes
- Document new features
- Update API documentation
- Add inline comments for complex logic

## Support

For questions or issues:
1. Check the documentation
2. Search existing issues
3. Create a new issue
4. Contact the development team

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 