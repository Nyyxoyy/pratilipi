const axios = require('axios');
const { expect } = require('chai');

const GATEWAY_URL = 'http://localhost:4000/graphql';
const NOTIFICATION_SERVICE_URL = 'http://localhost:3002';
const USER_SERVICE_URL = 'http://localhost:3001';

describe('Notification System End-to-End Tests', () => {
  let testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User',
    preferences: ['tech', 'sports']
  };
  let authToken;
  let userId;
  let notificationId;

  // Test user registration and login
  it('should register a new user', async () => {
    const response = await axios.post(GATEWAY_URL, {
      query: `
        mutation {
          register(input: {
            email: "${testUser.email}",
            password: "${testUser.password}",
            name: "${testUser.name}",
            preferences: ${JSON.stringify(testUser.preferences)}
          }) {
            user {
              id
              email
              name
            }
            token
          }
        }
      `
    });

    console.log('Register response:', JSON.stringify(response.data, null, 2));

    expect(response.status).to.equal(200);
    expect(response.data.errors).to.be.undefined;
    expect(response.data.data.register.user.email).to.equal(testUser.email);
    expect(response.data.data.register.token).to.exist;

    authToken = response.data.data.register.token;
    userId = response.data.data.register.user.id;
  });

  // Test notification creation
  it('should create a notification for the user', async () => {
    const response = await axios.post(GATEWAY_URL, {
      query: `
        mutation {
          createNotification(input: {
            userId: "${userId}",
            type: "WELCOME",
            content: "Welcome to our platform!"
          }) {
            id
            userId
            type
            content
            read
            sentAt
          }
        }
      `
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('Create notification response:', JSON.stringify(response.data, null, 2));

    expect(response.status).to.equal(200);
    expect(response.data.errors).to.be.undefined;
    expect(response.data.data.createNotification).to.exist;
    expect(response.data.data.createNotification.userId).to.equal(userId);
    expect(response.data.data.createNotification.type).to.equal('WELCOME');
    expect(response.data.data.createNotification.read).to.be.false;
    expect(response.data.data.createNotification.sentAt).to.exist;
    
    notificationId = response.data.data.createNotification.id;
  });

  // Test getting unread notifications
  it('should get unread notifications for the user', async () => {
    const response = await axios.post(GATEWAY_URL, {
      query: `
        query {
          unreadNotifications(userId: "${userId}") {
            id
            type
            content
            read
            sentAt
          }
        }
      `
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('Get unread notifications response:', JSON.stringify(response.data, null, 2));

    expect(response.status).to.equal(200);
    expect(response.data.errors).to.be.undefined;
    expect(response.data.data.unreadNotifications).to.exist;
    expect(response.data.data.unreadNotifications).to.be.an('array');
    expect(response.data.data.unreadNotifications.length).to.be.greaterThan(0);
    expect(response.data.data.unreadNotifications[0].read).to.be.false;
    expect(response.data.data.unreadNotifications[0].sentAt).to.exist;
  });

  // Test marking notification as read
  it('should mark a notification as read', async () => {
    const response = await axios.post(GATEWAY_URL, {
      query: `
        mutation {
          markNotificationAsRead(id: "${notificationId}") {
            id
            read
            sentAt
          }
        }
      `
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('Mark as read response:', JSON.stringify(response.data, null, 2));

    expect(response.status).to.equal(200);
    expect(response.data.errors).to.be.undefined;
    expect(response.data.data.markNotificationAsRead).to.exist;
    expect(response.data.data.markNotificationAsRead.read).to.be.true;
    expect(response.data.data.markNotificationAsRead.sentAt).to.exist;
  });

  // Test getting notifications with type filter
  it('should get notifications filtered by type', async () => {
    const response = await axios.post(GATEWAY_URL, {
      query: `
        query {
          notifications(userId: "${userId}", type: "WELCOME") {
            id
            type
            content
            read
            sentAt
          }
        }
      `
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('Get filtered notifications response:', JSON.stringify(response.data, null, 2));

    expect(response.status).to.equal(200);
    expect(response.data.errors).to.be.undefined;
    expect(response.data.data.notifications).to.exist;
    expect(response.data.data.notifications).to.be.an('array');
    expect(response.data.data.notifications[0].type).to.equal('WELCOME');
    expect(response.data.data.notifications[0].read).to.be.true;
    expect(response.data.data.notifications[0].sentAt).to.exist;
  });

  // Test error handling - unauthorized access
  it('should fail to create notification without authentication', async () => {
    const response = await axios.post(GATEWAY_URL, {
      query: `
        mutation {
          createNotification(input: {
            userId: "${userId}",
            type: "TEST",
            content: "Test message"
          }) {
            id
            type
            content
          }
        }
      `
    });

    console.log('Unauthorized response:', JSON.stringify(response.data, null, 2));

    expect(response.status).to.equal(200);
    expect(response.data.errors).to.exist;
    expect(response.data.errors[0].message).to.equal('Not authenticated');
  });
}); 