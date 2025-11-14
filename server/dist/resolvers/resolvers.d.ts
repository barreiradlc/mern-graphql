import { UserInput } from '../types/User';
export declare const resolvers: {
    Query: {
        users: () => Promise<any[]>;
        user: (_: any, { id }: {
            id: string;
        }) => Promise<any>;
    };
    Mutation: {
        createUser: (_: any, { input }: {
            input: UserInput;
        }) => Promise<any>;
        updateUser: (_: any, { id, input }: {
            id: string;
            input: UserInput;
        }) => Promise<any>;
        deleteUser: (_: any, { id }: {
            id: string;
        }) => Promise<boolean>;
    };
};
//# sourceMappingURL=resolvers.d.ts.map