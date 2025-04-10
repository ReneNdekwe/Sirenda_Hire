
# Car Rental Platform Technical Documentation

## Core Technologies

### Frontend
- **React**: Modern UI library for building the user interface
- **TypeScript**: Adds static typing to JavaScript for better development experience
- **Vite**: Next-generation frontend build tool for faster development
- **TanStack Query**: Data fetching and state management library
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn/ui**: React component library built on Radix UI
- **Lucide React**: Icon library
- **React Hook Form**: Form handling library
- **Zod**: Schema validation library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server implementation
- **PostgreSQL**: Primary database (via Neon Database)
- **Drizzle ORM**: Modern TypeScript ORM
- **Passport.js**: Authentication middleware
- **Express Session**: Session management
- **Multer**: File upload handling

## Architecture

### Database Schema
- Users (authentication and profiles)
- Vehicles (car listings)
- Bookings (reservation system)
- Categories (vehicle classifications)

### API Structure
- RESTful API design
- JWT-based authentication
- File upload support for vehicle images
- Session-based user management

### Features
- User authentication (login/register)
- Role-based access (admin, company, user)
- Vehicle management (CRUD operations)
- Booking system
- Image upload
- Responsive design
- Form validation
- Toast notifications
- Protected routes

## Development Tools
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Drizzle Kit**: Database migration tool
- **npm**: Package management

## Security Features
- Password hashing
- Session management
- Protected routes
- Input validation
- File upload restrictions
- Environment variables for sensitive data
