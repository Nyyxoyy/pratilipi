import mongoose, { Schema, Document } from 'mongoose';

export interface Product extends Document {
  id: string;
  name: string;
  category: string;
  price: number;
}

const ProductSchema = new Schema<Product>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true }
});

// Create index for efficient querying
ProductSchema.index({ category: 1 });

export const ProductModel = mongoose.model<Product>('Product', ProductSchema); 