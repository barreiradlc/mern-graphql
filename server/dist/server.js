"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const express4_1 = require("@as-integrations/express4");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = require("@apollo/server");
const resolvers_1 = require("./resolvers/resolvers");
const typeDefs_1 = require("./schemas/typeDefs");
dotenv_1.default.config();
async function startServer() {
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    // CORS configuration
    app.use((0, cors_1.default)());
    // Apollo Server setup
    const server = new server_1.ApolloServer({
        typeDefs: typeDefs_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
        // context: ({ req }) => ({ req }),
        introspection: process.env.NODE_ENV !== 'production',
    });
    await server.start();
    // Apply middleware
    app.use('/graphql', (0, cors_1.default)({
        origin: ['http://localhost:3000', 'http://client:3000'],
        credentials: true,
    }), body_parser_1.default.json(), (0, express4_1.expressMiddleware)(server, {
        context: async ({ req }) => ({ req }),
    }));
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    // MongoDB connection
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/merngraphql';
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected');
    }
    catch (err) {
        console.log('❌ MongoDB Connection Error:', err);
        process.exit(1);
    }
    const PORT = process.env.PORT || 5000;
    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
}
startServer().catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map