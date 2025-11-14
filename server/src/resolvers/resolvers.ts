import { User } from '../models/User';
import { UserInput } from '../types/User';

export const resolvers = {
  Query: {
    users: async (): Promise<any[]> => {
      try {
        const users = await User.find();
        return users;
      } catch (err) {
        throw new Error('Error fetching users');
      }
    },

    user: async (_: any, { id }: { id: string }): Promise<any> => {
      try {
        const user = await User.findById(id);
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      } catch (err) {
        throw new Error('Error fetching user');
      }
    },
  },

  Mutation: {
    createUser: async (_: any, { input }: { input: UserInput }): Promise<any> => {
      try {
        const user = new User(input);
        await user.save();
        return user;
      } catch (err: any) {
        if (err.code === 11000) {
          throw new Error('Email already exists');
        }
        throw new Error('Error creating user');
      }
    },

    updateUser: async (_: any, { id, input }: { id: string; input: UserInput }): Promise<any> => {
      try {
        const user = await User.findByIdAndUpdate(
          id,
          input,
          { new: true, runValidators: true }
        );
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      } catch (err: any) {
        if (err.code === 11000) {
          throw new Error('Email already exists');
        }
        throw new Error('Error updating user');
      }
    },

    deleteUser: async (_: any, { id }: { id: string }): Promise<boolean> => {
      try {
        const result = await User.findByIdAndDelete(id);
        return !!result;
      } catch (err) {
        throw new Error('Error deleting user');
      }
    },
  },
};