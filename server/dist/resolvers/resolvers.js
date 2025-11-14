"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const User_1 = require("../models/User");
exports.resolvers = {
    Query: {
        users: async () => {
            try {
                const users = await User_1.User.find();
                return users;
            }
            catch (err) {
                throw new Error('Error fetching users');
            }
        },
        user: async (_, { id }) => {
            try {
                const user = await User_1.User.findById(id);
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            }
            catch (err) {
                throw new Error('Error fetching user');
            }
        },
    },
    Mutation: {
        createUser: async (_, { input }) => {
            try {
                const user = new User_1.User(input);
                await user.save();
                return user;
            }
            catch (err) {
                if (err.code === 11000) {
                    throw new Error('Email already exists');
                }
                throw new Error('Error creating user');
            }
        },
        updateUser: async (_, { id, input }) => {
            try {
                const user = await User_1.User.findByIdAndUpdate(id, input, { new: true, runValidators: true });
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            }
            catch (err) {
                if (err.code === 11000) {
                    throw new Error('Email already exists');
                }
                throw new Error('Error updating user');
            }
        },
        deleteUser: async (_, { id }) => {
            try {
                const result = await User_1.User.findByIdAndDelete(id);
                return !!result;
            }
            catch (err) {
                throw new Error('Error deleting user');
            }
        },
    },
};
//# sourceMappingURL=resolvers.js.map