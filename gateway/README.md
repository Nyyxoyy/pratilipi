# GraphQL Gateway

The GraphQL gateway serves as the unified entry point for all client applications, providing a single API for accessing multiple microservices.

## Features

- Unified GraphQL API
- JWT authentication
- Request caching with Redis
- Service aggregation
- Error handling and logging

## Architecture

The gateway consists of the following components:

1. **API Layer**
   - Apollo Server
   - GraphQL schema stitching
   - REST endpoints

2. **Authentication**
   - JWT validation
   - Token refresh
   - Role-based access

3. **Caching**
   - Redis integration
   - Response caching
   - Cache invalidation

4. **Monitoring**
   - Health checks
   - Performance metrics
   - Error tracking

## Setup Instructions

1. **Prerequisites**
   - Node.js 18+
   - Docker and Docker Compose
   - Redis

2. **Environment Variables**
   Create a `.env` file with the following variables:
   ```
   PORT=4000
   REDIS_URL=redis://redis:6379
   JWT_SECRET=your-secret-key
   USER_SERVICE_URL=http://user-service:3001
   NOTIFICATION_SERVICE_URL=http://notification-service:3002
   RECOMMENDATION_SERVICE_URL=http://recommendation-service:3003
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
   docker build -t gateway .

   # Run the container
   docker run -p 4000:4000 gateway
   ```

## API Documentation

### GraphQL Endpoint

The gateway exposes a GraphQL API at `/graphql` with the following operations:

1. **User Operations**
   ```graphql
   # Register
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

   # Login
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

2. **Notification Operations**
   ```graphql
   # Get Notifications
   query {
     notifications(userId: String!) {
       id
       type
       content
       read
       sentAt
     }
   }

   # Mark as Read
   mutation {
     markNotificationAsRead(id: String!) {
       id
       read
     }
   }
   ```

3. **Recommendation Operations**
   ```graphql
   # Track Activity
   mutation {
     trackUserActivity(input: {
       userId: String!
       productId: String!
       activityType: String!
     })
   }

   # Get Recommendations
   query {
     recommendations(userId: String!) {
       productId
       score
     }
   }
   ```

### REST Endpoints

1. **Health Check**
   ```
   GET /health
   Response: { status: "ok" }
   ```

2. **GraphQL Playground**
   ```
   GET /graphql
   ```

## Testing

The gateway includes unit tests and integration tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Monitoring

The gateway provides the following monitoring capabilities:

1. **Health Checks**
   - Endpoint: `/health`
   - Service status
   - Dependency checks

2. **Logging**
   - Request logging
   - Error logging
   - Performance metrics

3. **Metrics**
   - Request counts
   - Response times
   - Error rates
   - Cache hit rates

## Error Handling

The gateway implements comprehensive error handling:

1. **Input Validation**
   - GraphQL schema validation
   - Type checking
   - Required field validation

2. **Error Responses**
   - Standardized error format
   - Appropriate HTTP status codes
   - Detailed error messages

3. **Recovery**
   - Circuit breakers
   - Fallback responses
   - Retry mechanisms

## Security

The gateway implements several security measures:

1. **Authentication**
   - JWT validation
   - Token refresh
   - Role-based access

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