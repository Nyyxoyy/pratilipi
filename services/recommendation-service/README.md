# Recommendation Service

The recommendation service is responsible for generating personalized product recommendations based on user activity and preferences.

## Features

- User activity tracking (views, purchases, cart additions)
- Collaborative filtering for recommendations
- Real-time recommendation updates
- Integration with MongoDB for data storage
- RabbitMQ for event-driven communication

## Architecture

The service follows a microservices architecture with the following components:

1. **API Layer**
   - Express.js server
   - GraphQL endpoint
   - Health check endpoint

2. **Business Logic**
   - Recommendation generation
   - User activity processing
   - Similar user identification

3. **Data Layer**
   - MongoDB for user activities and products
   - RabbitMQ for event handling

4. **Monitoring**
   - Health checks
   - Performance metrics
   - Error logging

## Setup Instructions

1. **Prerequisites**
   - Node.js 18+
   - Docker and Docker Compose
   - MongoDB
   - RabbitMQ

2. **Environment Variables**
   Create a `.env` file with the following variables:
   ```
   PORT=3003
   MONGODB_URI=mongodb://mongodb:27017/recommendation-service
   RABBITMQ_URL=amqp://rabbitmq:5672
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
   docker build -t recommendation-service .

   # Run the container
   docker run -p 3003:3003 recommendation-service
   ```

## API Documentation

### GraphQL Endpoint

The service exposes a GraphQL API at `/graphql` with the following operations:

1. **Track User Activity**
   ```graphql
   mutation {
     trackUserActivity(input: {
       userId: "user-id"
       productId: "product-id"
       activityType: "view" | "purchase" | "cart"
     })
   }
   ```

2. **Get Recommendations**
   ```graphql
   query {
     recommendations(userId: "user-id") {
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
   - Response time monitoring
   - Service status

2. **Logging**
   - Winston logger
   - Different log levels
   - Structured logging

3. **Metrics**
   - Request counts
   - Response times
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
   - Role-based access control
   - Token expiration

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