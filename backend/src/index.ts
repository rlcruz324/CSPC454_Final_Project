//Third-Party Packages
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

//Environment
dotenv.config();

//Internal Modules
import { authMiddleware } from './middleware/authorizationMiddleware';
import tenantRoutes from './routes/tenantRoutes';
import managerRoutes from './routes/managerRoutes';
import propertyRoutes from './routes/propertyRoutes';
import leaseRoutes from "./routes/leaseRoutes";
import applicationRoutes from "./routes/applicationRoutes";


//App Setup 
const app = express();



//dotenv.config();
//const app = express();

//Middleware Setup 
//These global middleware functions run before all routes and apply to every request.
//Security Middleware 
//Helmet adds security-related HTTP headers to protect against common attacks.
app.use(helmet());
//This policy controls how other sites can load resources, preventing certain cross-origin risks.
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
//CORS 
//Allows requests from frontend (different domain/port). Without this, browsers block requests.
app.use(cors());
//Body Parsing
app.use(express.json()); // Built-in JSON parser for parsing JSON request bodies.
//Legacy JSON parsing Kept for compatibility with older middleware if needed.
app.use(bodyParser.json());                     
//Parses URL-encoded form data from HTML forms or simple key=value requests.
app.use(bodyParser.urlencoded({ extended: false }));
//Logging  
//Morgan logs each request (method, URL, status), useful for debugging and monitoring.
app.use(morgan("common"));
//ROUTES 
//Routes run after global middleware so they receive parsed, secured, logged requests.
//Public Route 
//Simple public test route to verify the server is running. Remoove later?????? Mayhaps???
app.get("/", (req, res) => {
  res.send("Welcome to the home route. Glad you are here.");
});

//Protected and modular routes
app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

//Add Error Middleware here later???

//Server Listener
const port = Number(process.env.PORT) || 3002;
app.listen(port, "0.0.0.0", () => {
  console.log(`Service started successfully ${port}`);
  console.log(`http://localhost:${port}`);
  console.log(`Hang in there, server is running...`);
});