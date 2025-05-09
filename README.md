# Sirenda Hire - Car Rental Platform

A modern car rental platform built with React, Node.js, and PostgreSQL. This platform allows users to rent vehicles, manage bookings, and handle rental company operations.

## Features

- User authentication and authorization
- Vehicle listing and management
- Booking system
- Rental company dashboard
- Admin dashboard
- Responsive design
- Real-time updates
- Image upload support

## Tech Stack

See [TECH_STACK.md](TECH_STACK.md) for detailed information about the technologies used.

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (or use the provided Docker setup)
- npm or yarn

## Getting Started

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sirenda-hire.git
   cd sirenda-hire
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

4. Start the development environment using Docker:
   ```bash
   docker-compose up -d
   ```

5. Run database migrations:
   ```bash
   npm run db:migrate
   ```

6. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   npm run dev:server

   # Terminal 2 - Frontend
   npm run dev:client
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Production Setup

1. Build the Docker images:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. Start the production environment:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Project Structure

```
sirenda-hire/
├── client/           # Frontend React application
├── server/           # Backend Node.js application
├── shared/           # Shared types and utilities
├── drizzle/          # Database migrations and schema
├── docker/           # Docker configuration files
├── scripts/          # Utility scripts
└── public/           # Static assets
```

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Create feature branches for new development

### Testing

- Write unit tests for critical functionality
- Use React Testing Library for frontend tests
- Run tests before committing changes

### Database

- Use Drizzle ORM for database operations
- Create migrations for schema changes
- Follow naming conventions for tables and columns

### API Documentation

API documentation is available at `/api/docs` when running the development server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/) 