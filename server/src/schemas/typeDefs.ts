export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    bio: String
    createdAt: String!
    updatedAt: String!
  }

  input UserInput {
    name: String!
    email: String!
    age: Int
    bio: String
  }

  input UpdateUserInput {
    name: String
    email: String
    age: Int
    bio: String
  }

  

  type Query {
    "Get all users"
    users: [User!]!
    "Get a user by ID"
    user(id: ID!): User
    "Get users by email"
    usersByEmail(email: String!): [User!]!
  }

  type Mutation {
    "Create a new user"
    createUser(input: UserInput!): User!
    "Update an existing user"
    updateUser(id: ID!, input: UpdateUserInput!): User
    "Delete a user"
    deleteUser(id: ID!): Boolean!
  }
`;