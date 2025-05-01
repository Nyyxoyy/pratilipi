import mongoose, { Document, Schema } from 'mongoose';

export interface IUserActivity extends Document {
  userId: string;
  productId: string;
  activityType: 'view' | 'purchase';
  timestamp: Date;
}

const UserActivitySchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  productId: {
    type: String,
    required: true,
    index: true,
  },
  activityType: {
    type: String,
    enum: ['view', 'purchase'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for efficient querying
UserActivitySchema.index({ userId: 1, timestamp: -1 });

export const UserActivity = mongoose.model<IUserActivity>('UserActivity', UserActivitySchema); 