"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Third-Party Packages
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
//Environment
dotenv_1.default.config();
//Internal Modules
const authorizationMiddleware_1 = require("./middleware/authorizationMiddleware");
const tenantRoutes_1 = __importDefault(require("./routes/tenantRoutes"));
const managerRoutes_1 = __importDefault(require("./routes/managerRoutes"));
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
const leaseRoutes_1 = __importDefault(require("./routes/leaseRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
//App Setup 
const app = (0, express_1.default)();
//dotenv.config();
//const app = express();
//Middleware Setup 
//These global middleware functions run before all routes and apply to every request.
//Security Middleware 
//Helmet adds security-related HTTP headers to protect against common attacks.
app.use((0, helmet_1.default)());
//This policy controls how other sites can load resources, preventing certain cross-origin risks.
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
//CORS 
//Allows requests from frontend (different domain/port). Without this, browsers block requests.
app.use((0, cors_1.default)());
//Body Parsing
app.use(express_1.default.json()); // Built-in JSON parser for parsing JSON request bodies.
//Legacy JSON parsing Kept for compatibility with older middleware if needed.
app.use(body_parser_1.default.json());
//Parses URL-encoded form data from HTML forms or simple key=value requests.
app.use(body_parser_1.default.urlencoded({ extended: false }));
//Logging  
//Morgan logs each request (method, URL, status), useful for debugging and monitoring.
app.use((0, morgan_1.default)("common"));
//ROUTES 
//Routes run after global middleware so they receive parsed, secured, logged requests.
//Public Route 
//Simple public test route to verify the server is running. Remoove later?????? Mayhaps???
app.get("/", (req, res) => {
    res.send("This is home route");
});
//Protected and modular routes
app.use("/applications", applicationRoutes_1.default);
app.use("/properties", propertyRoutes_1.default);
app.use("/leases", leaseRoutes_1.default);
app.use("/tenants", (0, authorizationMiddleware_1.authMiddleware)(["tenant"]), tenantRoutes_1.default);
app.use("/managers", (0, authorizationMiddleware_1.authMiddleware)(["manager"]), managerRoutes_1.default);
//Add Error Middleware here later???
//Server Listener
const port = Number(process.env.PORT) || 3002;
app.listen(port, "0.0.0.0", () => {
    console.log(`Service started successfully ${port}`);
    console.log(`http://localhost:${port}`);
    console.log(`Hang in there, server is running...`);
});
