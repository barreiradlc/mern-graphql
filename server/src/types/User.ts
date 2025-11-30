export interface User {
  id: number;
  name: string;
  email: string;
  age?: number | null;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  name: string;
  email: string;
  age?: number;
  bio?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  age?: number;
  bio?: string;
}