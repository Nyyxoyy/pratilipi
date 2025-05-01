# User Service

The user service handles user registration, authentication, and preference management for the notification system.

## Features

- User registration and authentication
- JWT-based authentication
- User preference management
- Profile management
- Role-based access control

## Architecture

The service follows a microservices architecture with the following components:

1. **API Layer**
   - Express.js server
   - GraphQL endpoint
   - Health check endpoint

2. **Business Logic**
   - User management
   - Authentication
   - Preference handling

3. **Data Layer**
   - PostgreSQL for user data
   - Redis for session management

4. **Monitoring**
   - Health checks
   - Performance metrics
   - Error logging

## Setup Instructions

1. **Prerequisites**
   - Node.js 18+
   - Docker and Docker Compose
   - PostgreSQL
   - Redis

2. **Environment Variables**
   Create a `.env` file with the following variables:
   ```
   PORT=3001
   POSTGRES_URL=postgresql://postgres:postgres@postgres:5432/user-service
   REDIS_URL=redis://redis:6379
   JWT_SECRET=your-secret-key
   LOG_LEVEL=info
   ```

3. **Development Setup**
   ```bash
   # Install dependencies
   npm install

   # Start development server
   npm run dev

   # Run tests
   npm test
   ```

4. **Docker Setup**
   ```bash
   # Build the image
   docker build -t user-service .

   # Run the container
   docker run -p 3001:3001 user-service
   ```

## API Documentation

### GraphQL Endpoint

The service exposes a GraphQL API at `/graphql` with the following operations:

1. **User Registration**
   ```graphql
   mutation {
     register(input: {
       email: String!
       password: String!
       name: String!
       preferences: [String!]!
     }) {
       user {
         id
         email
         name
       }
       token
     }
   }
   ```

2. **User Login**
   ```graphql
   mutation {
     login(input: {
       email: String!
       password: String!
     }) {
       user {
         id
         email
         name
       }
       token
     }
   }
   ```

3. **Update Preferences**
   ```graphql
   mutation {
     updatePreferences(input: {
       userId: String!
       preferences: [String!]!
     }) {
       id
       preferences
     }
   }
   ```

### REST Endpoints

1. **Health Check**
   ```
   GET /health
   Response: { status: "ok" }
   ```

## Testing

The service includes unit tests and integration tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Monitoring

The service provides the following monitoring capabilities:

1. **Health Checks**
   - Endpoint: `/health`
   - Database connection status
   - Redis connection status

2. **Logging**
   - Winston logger
   - Different log levels
   - Structured logging

3. **Metrics**
   - User counts
   - Authentication attempts
   - Error rates

## Error Handling

The service implements comprehensive error handling:

1. **Input Validation**
   - GraphQL schema validation
   - Type checking
   - Required field validation

2. **Error Responses**
   - Standardized error format
   - Appropriate HTTP status codes
   - Detailed error messages

3. **Recovery**
   - Retry mechanisms
   - Circuit breakers
   - Fallback responses

## Security

The service implements several security measures:

1. **Authentication**
   - JWT validation
   - Password hashing
   - Token refresh

2. **Data Protection**
   - Input sanitization
   - Query parameterization
   - Rate limiting

3. **Communication**
   - HTTPS
   - Secure WebSocket
   - Encrypted messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

[License information will be added here] 