import { eq, like } from 'drizzle-orm';
import { db, users } from '../db';
import { posts } from '../db/schema';
import { PostInput } from '../types/Post';
import { UpdateUserInput, UserInput } from '../types/User';

// GraphQL response types
interface GraphQLUser {
  id: string;
  name: string;
  email: string;
  age?: number | null;
  bio?: string | null;
  // posts: GraphQLPost[];
  createdAt: string;
  updatedAt: string;
}

// GraphQL response types
interface GraphQLPost {
  id: string;
  description: string;
  author: GraphQLUser;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export const resolvers = {
  Query: {
    posts: async (): Promise<GraphQLPost[]> => {
      try {
        const allPosts = (await db.query.posts.findMany({ with: { author: true } }));
        // const allPosts = (await db.select().from(posts).orderBy(posts.createdAt));
        return allPosts.map(post => ({
          ...post,
          id: post.id.toString(), // Convert ID to string for GraphQL
          authorId: post.authorId.toString(), // Convert ID to string for GraphQL
          author: {
            ...post.author,
            id: post.author.id.toString(),
            createdAt: post.author.createdAt.toISOString(),
            updatedAt: post.author.updatedAt.toISOString(),
          }, // Convert ID to string for GraphQL
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.error('Error fetching users:', err);
        throw new Error('Error fetching users');
      }
    },
    users: async (): Promise<GraphQLUser[]> => {
      try {
        const allUsers = await db.select().from(users).orderBy(users.createdAt);
        return allUsers.map(user => ({
          ...user,
          id: user.id.toString(), // Convert ID to string for GraphQL
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.error('Error fetching users:', err);
        throw new Error('Error fetching users');
      }
    },

    user: async (_: any, { id }: { id: string }): Promise<GraphQLUser | null> => {
      try {
        const userId = parseInt(id);
        if (isNaN(userId)) {
          throw new Error('Invalid user ID');
        }

        const [user] = await db.select().from(users).where(eq(users.id, userId));
        
        if (!user) {
          return null;
        }

        return {
          ...user,
          id: user.id.toString(),
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      } catch (err: any) {
        console.error('Error fetching user:', err);
        throw new Error(err.message || 'Error fetching user');
      }
    },

    usersByEmail: async (_: any, { email }: { email: string }): Promise<GraphQLUser[]> => {
      try {
        const foundUsers = await db.select().from(users).where(like(users.email, `%${email}%`));
        
        return foundUsers.map(user => ({
          ...user,
          id: user.id.toString(),
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }));
      } catch (err: any) {
        console.error('Error fetching users by email:', err);
        throw new Error(err.message || 'Error fetching users by email');
      }
    },
  },

  Mutation: {
    createPost: async (_: any, { input }: { input: PostInput }): Promise<GraphQLPost> => {
      try {
      // Check if user with email already exists
      const [existingUser] = await db.select().from(users).where(eq(users.id, input.authorId));
      
      if (!existingUser) {
        throw new Error('Author not found');
      }

       const [newPost] = await db.insert(posts).values({
          description: input.description,
          authorId: input.authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        return {
          ...newPost,
          id: newPost.id.toString(),
          authorId: existingUser.id.toString(),
          author: {
            id: existingUser.id.toString(),
            name: existingUser.name,
            email: existingUser.email,
            createdAt: existingUser.createdAt.toISOString(),
            updatedAt: existingUser.updatedAt.toISOString(),
          },
          createdAt: newPost.createdAt.toISOString(),
          updatedAt: newPost.updatedAt.toISOString(),
        };
      } catch (err: any) {
        console.error('Error creating post:', err);
        throw new Error(err.message || 'Error creating post');
      }
    },

    createUser: async (_: any, { input }: { input: UserInput }): Promise<GraphQLUser> => {
      try {
        // Check if user with email already exists
        const [existingUser] = await db.select().from(users).where(eq(users.email, input.email));
        
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        const [newUser] = await db.insert(users).values({
          name: input.name,
          email: input.email,
          age: input.age,
          bio: input.bio,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        return {
          ...newUser,
          id: newUser.id.toString(),
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
        };
      } catch (err: any) {
        console.error('Error creating user:', err);
        throw new Error(err.message || 'Error creating user');
      }
    },

    updateUser: async (_: any, { id, input }: { id: string; input: UpdateUserInput }): Promise<GraphQLUser | null> => {
      try {
        const userId = parseInt(id);
        if (isNaN(userId)) {
          throw new Error('Invalid user" ID');
        }

        // Check if user exists
        const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
        if (!existingUser) {
          return null;
        }

        // Check if email is being changed and if it already exists
        if (input.email && input.email !== existingUser.email) {
          const [userWithEmail] = await db.select().from(users).where(eq(users.email, input.email));
          if (userWithEmail) {
            throw new Error('User with this email already exists');
          }
        }

        const [updatedUser] = await db.update(users)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning();

        return {
          ...updatedUser,
          id: updatedUser.id.toString(),
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
        };
      } catch (err: any) {
        console.error('Error updating user:', err);
        throw new Error(err.message || 'Error updating user');
      }
    },

    deleteUser: async (_: any, { id }: { id: string }): Promise<boolean> => {
      try {
        const userId = parseInt(id);
        if (isNaN(userId)) {
          throw new Error('Invalid user ID');
        }

        const [deletedUser] = await db.delete(users).where(eq(users.id, userId)).returning();
        
        return !!deletedUser;
      } catch (err: any) {
        console.error('Error deleting user:', err);
        throw new Error(err.message || 'Error deleting user');
      }
    },
  },
};