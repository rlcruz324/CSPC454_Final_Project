"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
dotenv_1.default.config();
const requireRolesMiddleware_1 = require("./middleware/requireRolesMiddleware");
const tenantServiceRoutes_1 = __importDefault(require("./routes/tenantServiceRoutes"));
const managerServiceRoutes_1 = __importDefault(require("./routes/managerServiceRoutes"));
const propertyManagementRoutes_1 = __importDefault(require("./routes/propertyManagementRoutes"));
const leasePaymentRoutes_1 = __importDefault(require("./routes/leasePaymentRoutes"));
const rentalApplicationRoutes_1 = __importDefault(require("./routes/rentalApplicationRoutes"));
//app setup 
const app = (0, express_1.default)();
//dotenv.config();
//const app = express();
//middleware Setup 
//these global middleware functions run before all routes and apply to every request
//security Middleware 
//helmet adds security-related HTTP headers to protect against common attacks
app.use((0, helmet_1.default)());
//this policy controls how other sites can load resources, preventing certain cross-origin risks
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
//CORS 
//allows requests from frontend (different domain/port). Without this, browsers block requests
app.use((0, cors_1.default)());
//body Parsing
app.use(express_1.default.json()); // Built-in JSON parser for parsing JSON request bodies
//legacy JSON parsing Kept for compatibility with older middleware if needed
app.use(body_parser_1.default.json());
//parses URL-encoded form data from HTML forms or simple key=value requests
app.use(body_parser_1.default.urlencoded({ extended: false }));
//logging  
//morgan logs each request (method, URL, status), useful for debugging and monitoring
app.use((0, morgan_1.default)("common"));
//routes 
//routes run after global middleware so they receive parsed, secured, logged requests
//public route 
//simple public test route to verify the server is running. Remoove later?????? Mayhaps???
app.get("/", (req, res) => {
    res.send("Welcome to the home route. Glad you are here.");
});
//protected and modular routes
app.use("/applications", rentalApplicationRoutes_1.default);
app.use("/properties", propertyManagementRoutes_1.default);
app.use("/leases", leasePaymentRoutes_1.default);
app.use("/tenants", (0, requireRolesMiddleware_1.requireRole)(["tenant"]), tenantServiceRoutes_1.default);
app.use("/managers", (0, requireRolesMiddleware_1.requireRole)(["manager"]), managerServiceRoutes_1.default);
//add error middleware here later???
//Server Listener
const port = Number(process.env.PORT) || 3002;
app.listen(port, "0.0.0.0", () => {
    console.log(`Service started successfully ${port}`);
    console.log(`http://localhost:${port}`);
    console.log(`Hang in there, server is running...`);
});
