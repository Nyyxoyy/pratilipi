# Testing Documentation

## Test Types

### 1. End-to-End Tests
Located in `tests/e2e.test.js`, these tests verify the complete system functionality:
- User registration and authentication
- Notification creation and management
- Activity tracking and recommendations
- Error handling

### 2. Postman Collection
Located in `docs/postman-collection.json`, includes:
- User Service endpoints
- Notification Service endpoints
- Recommendation Service endpoints
- Environment variables setup

### 3. GraphQL Playground
Access the playground at `http://localhost:4000/graphql` for interactive testing.

## Running Tests

### Local Development
```bash
# Install dependencies
npm install

# Run end-to-end tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Docker Environment
```bash
# Start all services
docker-compose up -d

# Run tests
docker-compose exec gateway npm test
```

## Test Scenarios

### User Service
1. Registration
   - Valid credentials
   - Invalid email format
   - Weak password
   - Duplicate email

2. Authentication
   - Valid login
   - Invalid credentials
   - Token expiration
   - Token refresh

### Notification Service
1. Notification Creation
   - Valid notification
   - Invalid user ID
   - Missing fields
   - Unauthorized access

2. Notification Management
   - Mark as read
   - Get unread notifications
   - Filter by type
   - Pagination

### Recommendation Service
1. Activity Tracking
   - View activity
   - Purchase activity
   - Cart activity
   - Invalid activity type

2. Recommendations
   - Get recommendations
   - Empty recommendations
   - Invalid user ID
   - Performance testing

## Test Data

### Sample Users
```json
{
  "email": "test@example.com",
  "password": "Test@123",
  "name": "Test User",
  "preferences": ["promotions", "order_updates", "recommendations"]
}
```

### Sample Notifications
```json
{
  "type": "WELCOME",
  "content": "Welcome to our platform!",
  "userId": "user-id"
}
```

### Sample Activities
```json
{
  "userId": "user-id",
  "productId": "product1",
  "activityType": "view"
}
```

## Troubleshooting

1. Test Failures
   - Check service logs
   - Verify database connections
   - Check RabbitMQ status
   - Verify environment variables

2. Performance Issues
   - Check Redis cache
   - Monitor database queries
   - Check message queue backlog
   - Verify service health

3. Environment Setup
   - Verify Docker containers
   - Check network connectivity
   - Verify port availability
   - Check volume mounts 