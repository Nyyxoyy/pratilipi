# Notification Service

The notification service manages the storage and delivery of notifications to users based on their preferences and activities.

## Features

- Notification storage and management
- Real-time notification delivery
- Notification status tracking (read/unread)
- Scheduled notifications
- User preference-based filtering

## Architecture

The service follows a microservices architecture with the following components:

1. **API Layer**
   - Express.js server
   - GraphQL endpoint
   - Health check endpoint

2. **Business Logic**
   - Notification processing
   - Status management
   - Scheduling system

3. **Data Layer**
   - PostgreSQL for notification storage
   - RabbitMQ for event handling

4. **Monitoring**
   - Health checks
   - Performance metrics
   - Error logging

## Setup Instructions

1. **Prerequisites**
   - Node.js 18+
   - Docker and Docker Compose
   - PostgreSQL
   - RabbitMQ

2. **Environment Variables**
   Create a `.env` file with the following variables:
   ```
   PORT=3002
   POSTGRES_URL=postgresql://postgres:postgres@postgres:5432/notification-service
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
   docker build -t notification-service .

   # Run the container
   docker run -p 3002:3002 notification-service
   ```

## API Documentation

### GraphQL Endpoint

The service exposes a GraphQL API at `/graphql` with the following operations:

1. **Get Notifications**
   ```graphql
   query {
     notifications(userId: String!) {
       id
       type
       content
       read
       sentAt
     }
   }
   ```

2. **Get Unread Notifications**
   ```graphql
   query {
     unreadNotifications(userId: String!) {
       id
       type
       content
       sentAt
     }
   }
   ```

3. **Mark as Read**
   ```graphql
   mutation {
     markNotificationAsRead(id: String!) {
       id
       read
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
   - Message queue status

2. **Logging**
   - Winston logger
   - Different log levels
   - Structured logging

3. **Metrics**
   - Notification counts
   - Delivery times
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
   - Dead-letter queues
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