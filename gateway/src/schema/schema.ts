import { makeExecutableSchema } from '@graphql-tools/schema';

const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    preferences: [String!]!
    notifications: [Notification!]!
    recommendations: [String!]!
  }

  type Notification {
    id: ID!
    userId: ID!
    type: NotificationType!
    content: JSON!
    sentAt: String!
    read: Boolean!
  }

  enum NotificationType {
    PROMOTION
    ORDER_UPDATE
    RECOMMENDATION
  }

  scalar JSON

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    user(id: ID!): User
    notifications(userId: ID!, type: NotificationType): [Notification!]!
    unreadNotifications(userId: ID!): [Notification!]!
    recommendations(userId: ID!): [String!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updatePreferences(preferences: [String!]!): User!
    markNotificationAsRead(id: ID!): Notification!
    trackUserActivity(input: ActivityInput!): Boolean!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    preferences: [String!]!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ActivityInput {
    userId: ID!
    productId: ID!
    activityType: ActivityType!
  }

  enum ActivityType {
    VIEW
    PURCHASE
  }
`;

export const schema = makeExecutableSchema({
  typeDefs,
}); 