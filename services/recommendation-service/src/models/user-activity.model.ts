import mongoose, { Schema, Document } from 'mongoose';

export interface UserActivity extends Document {
  userId: string;
  productId: string;
  activityType: 'view' | 'purchase' | 'cart';
  timestamp: Date;
}

const UserActivitySchema = new Schema<UserActivity>({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  activityType: { type: String, enum: ['view', 'purchase', 'cart'], required: true },
  timestamp: { type: Date, default: Date.now }
});

// Create compound index for efficient querying
UserActivitySchema.index({ userId: 1, timestamp: -1 });

export const UserActivityModel = mongoose.model<UserActivity>('UserActivity', UserActivitySchema); 