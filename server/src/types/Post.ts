import { User } from "./User";

export interface Post {
  id: number;
  description: string;
  author: User,
  authorId: number,
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostInput {
  description: string;
  authorId: number;
}
