import { Schema, model } from 'mongoose';
import { IUser } from '../types/User';

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
  },
}, {
  timestamps: true,
});

export const User = model<IUser>('User', userSchema);