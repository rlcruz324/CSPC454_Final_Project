import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();

import { requireRole } from './middleware/requireRolesMiddleware';
import tenantRoutes from './routes/tenantServiceRoutes';
import managerRoutes from './routes/managerServiceRoutes';
import propertyRoutes from './routes/propertyManagementRoutes';
import leaseRoutes from "./routes/leasePaymentRoutes";
import applicationRoutes from "./routes/rentalApplicationRoutes";


//app setup 
const app = express();



//dotenv.config();
//const app = express();

//middleware Setup 
//these global middleware functions run before all routes and apply to every request
//security Middleware 
//helmet adds security-related HTTP headers to protect against common attacks
app.use(helmet());
//this policy controls how other sites can load resources, preventing certain cross-origin risks
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
//CORS 
//allows requests from frontend (different domain/port). Without this, browsers block requests
app.use(cors());
//body Parsing
app.use(express.json()); // Built-in JSON parser for parsing JSON request bodies
//legacy JSON parsing Kept for compatibility with older middleware if needed
app.use(bodyParser.json());                     
//parses URL-encoded form data from HTML forms or simple key=value requests
app.use(bodyParser.urlencoded({ extended: false }));
//logging  
//morgan logs each request (method, URL, status), useful for debugging and monitoring
app.use(morgan("common"));
//routes 
//routes run after global middleware so they receive parsed, secured, logged requests
//public route 
//simple public test route to verify the server is running. Remoove later?????? Mayhaps???
app.get("/", (req, res) => {
  res.send("Welcome to the home route. Glad you are here.");
});

//protected and modular routes
app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/tenants", requireRole(["tenant"]), tenantRoutes);
app.use("/managers", requireRole(["manager"]), managerRoutes);

//add error middleware here later???

//Server Listener
const port = Number(process.env.PORT) || 3002;
app.listen(port, "0.0.0.0", () => {
  console.log(`Service started successfully ${port}`);
  console.log(`http://localhost:${port}`);
  console.log(`Hang in there, server is running...`);
});